//! High-performance color picker window implementation for Windows
//!
//! # Architecture Overview
//!
//! This implementation achieves 144fps+ performance through several key optimizations:
//!
//! ## 1. Small Moving Window (23x faster than fullscreen)
//! - Creates a 300x300px window that moves with the cursor
//! - UpdateLayeredWindow only composites 90K pixels instead of 2M pixels
//! - Window movement uses hardware-accelerated SetWindowPos
//!
//! ## 2. Direct Bitmap Manipulation (bypasses GDI)
//! - Writes pixels directly to bitmap buffer via pointer arithmetic
//! - Eliminates GDI function call overhead
//! - Uses pre-computed masks to avoid distance calculations
//!
//! ## 3. Event-Driven Rendering (no polling)
//! - WH_MOUSE_LL hook delivers instant mouse position updates
//! - Frame skipping prevents message queue congestion
//! - Hash-based change detection eliminates redundant renders
//!
//! ## 4. Zero Per-Frame Allocations
//! - All buffers pre-allocated at startup
//! - Masks pre-computed once
//! - Vec capacity set to avoid reallocations
//!
//! ## 5. Optional Hover-Through Mode
//! - WS_EX_TRANSPARENT allows underlying UI to receive hover events
//! - Global hooks capture input when window is transparent
//! - Enables picking hover-state colors (e.g., close button red)

use crate::picker::color::Color;
use super::super::common::geometry::{BorderMask, CircleMask, ShadowMask};
use super::super::common::primitives::*;
use super::super::super::{PickerConfig, PickedColor};
use std::cell::Cell;
use std::sync::{Arc, Mutex};
use windows::core::w;
use windows::Win32::{
    Foundation::*,
    Graphics::Gdi::*,
    System::LibraryLoader::*,
    UI::HiDpi::*,
    UI::Input::KeyboardAndMouse::*,
    UI::WindowsAndMessaging::*,
};

// Thread-locals for hooks to access window state
thread_local! {
    static PICKER_HWND: Cell<HWND> = const { Cell::new(HWND(std::ptr::null_mut())) };
    static ALLOW_HOVER_THROUGH: Cell<bool> = const { Cell::new(false) };
}

// Atomic flag to prevent message queue congestion during fast mouse movement
static RENDER_PENDING: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

pub fn create_and_run(
    config: PickerConfig,
    result: Arc<Mutex<Option<PickedColor>>>,
) -> Result<(), String> {
    unsafe {
        // DPI awareness is set once at app startup (main.rs) since it's process-wide
        // and only the first call ever succeeds (see W5). Just verify it here in debug.
        debug_assert!(
            AreDpiAwarenessContextsEqual(
                GetThreadDpiAwarenessContext(),
                DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2,
            )
            .as_bool(),
            "process should already be per-monitor DPI aware (set at app startup in main.rs)"
        );

        // Register window class
        let instance = GetModuleHandleW(None).map_err(|e| format!("GetModuleHandleW failed: {:?}", e))?;
        let class_name = w!("ColorPickerClass");

        let wc = WNDCLASSEXW {
            cbSize: std::mem::size_of::<WNDCLASSEXW>() as u32,
            lpfnWndProc: Some(wnd_proc),
            hInstance: instance.into(),
            lpszClassName: class_name,
            hCursor: HCURSOR::default(),  // No cursor
            ..Default::default()
        };
        RegisterClassExW(&wc);

        // Create small layered window with space for hex label below magnifier
        // This is MUCH faster than fullscreen window for UpdateLayeredWindow
        let mag_size = config.magnifier_size as i32;

        // Calculate window dimensions to include hex label below magnifier and
        // padding on all sides for the drop shadow around the circle. Only the
        // top/sides get shadow_margin added to height/width; the bottom edge
        // already has room via the (negative, overlapping) HEX_MARGIN, and the
        // hex label draws over whatever shadow ends up underneath it.
        let hex_box_height = HEX_BOX_HEIGHT + HEX_PADDING * 2;
        let window_width = mag_size + SHADOW_MARGIN * 2;
        let window_height = SHADOW_MARGIN + mag_size + HEX_MARGIN + hex_box_height;

        // Conditionally add WS_EX_TRANSPARENT to allow hover events to pass through
        let ex_style = if config.allow_hover_through {
            WS_EX_LAYERED | WS_EX_TOPMOST | WS_EX_TRANSPARENT  // Hover events pass through
        } else {
            WS_EX_LAYERED | WS_EX_TOPMOST  // Block hover events (standard behavior)
        };

        let hwnd = CreateWindowExW(
            ex_style,
            class_name,
            w!("Color Picker"),
            WS_POPUP,
            0, 0,
            window_width,
            window_height,
            None, None, Some(instance.into()), None,
        ).map_err(|e| format!("Failed to create window: {:?}", e))?;

        // Exclude the lens from screen capture. This is a correctness requirement,
        // not a privacy feature: the lens sits directly over the pixels it samples,
        // so without exclusion capture would read the lens's own rendering back
        // (self-capture feedback loop) and the picker would pick nothing real.
        // Requires Win10 2004+; on older builds this call fails and picking breaks.
        if let Err(e) = SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE) {
            log::error!(
                "SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE) failed: {:?} — picker will self-capture and pick incorrect colors. Requires Windows 10 2004+.",
                e
            );
        }

        // Create offscreen DC and RGBA bitmap for UpdateLayeredWindow
        // Sized to include magnifier + hex label below
        let hdc_screen = GetDC(Some(HWND::default()));
        let hdc_offscreen = CreateCompatibleDC(Some(hdc_screen));

        // Create BITMAPV5HEADER for 32-bit RGBA
        let bmi = BITMAPV5HEADER {
            bV5Size: std::mem::size_of::<BITMAPV5HEADER>() as u32,
            bV5Width: window_width,
            bV5Height: -window_height,  // Negative for top-down DIB
            bV5Planes: 1,
            bV5BitCount: 32,
            bV5Compression: BI_RGB,
            bV5RedMask: 0x00FF0000,
            bV5GreenMask: 0x0000FF00,
            bV5BlueMask: 0x000000FF,
            bV5AlphaMask: 0xFF000000,
            ..Default::default()
        };

        // Create DIB section and get pointer to pixel data
        let mut bitmap_bits: *mut std::ffi::c_void = std::ptr::null_mut();
        let bitmap_offscreen = CreateDIBSection(
            Some(hdc_screen),
            &bmi as *const BITMAPV5HEADER as *const BITMAPINFO,
            DIB_RGB_COLORS,
            &mut bitmap_bits,
            None,
            0,
        ).expect("Failed to create DIB section");

        SelectObject(hdc_offscreen, bitmap_offscreen.into());
        ReleaseDC(Some(HWND::default()), hdc_screen);

        // Create invisible cursor (more reliable than ShowCursor)
        let invisible_cursor = create_invisible_cursor();

        // Set invisible cursor
        SetCursor(Some(invisible_cursor));

        // Also hide system cursor for good measure
        while ShowCursor(false) >= 0 {}  // Keep calling until hidden

        // Load custom font from embedded bytes
        let font_data = include_bytes!("../../../../../src/assets/fonts/UbuntuSansMono-VariableFont.ttf");
        let font_count = font_data.len() as u32;
        let num_fonts: u32 = 0;
        let _font_handle = AddFontMemResourceEx(
            font_data.as_ptr() as *const std::ffi::c_void,
            font_count,
            None,
            &num_fonts,
        );

        // Create larger font for hex label (18pt = ~24px at 96 DPI)
        let hex_font = CreateFontW(
            -24,  // Height in pixels (negative = character height, not cell height)
            0,    // Width (0 = default based on height)
            0,    // Escapement
            0,    // Orientation
            FW_BOLD.0 as i32,  // Weight (bold for better visibility with variable font)
            0,    // Italic
            0,    // Underline
            0,    // StrikeOut
            DEFAULT_CHARSET,
            OUT_TT_PRECIS,
            CLIP_DEFAULT_PRECIS,
            CLEARTYPE_QUALITY,
            (FIXED_PITCH.0 | FF_MODERN.0) as u32,
            w!("Ubuntu Sans Mono"),
        );

        // Calculate magnifier dimensions
        let mag_radius = mag_size / 2;
        let border_width = (mag_size / MAGNIFIER_BORDER_WIDTH_DIVISOR).max(2);

        // Pre-compute masks for ultra-fast rendering
        // This eliminates expensive distance calculations during rendering
        let circle_mask = CircleMask::new_circle(mag_radius);
        let border_mask = BorderMask::new_circle(mag_radius, border_width);
        let shadow_mask = ShadowMask::new(mag_radius, SHADOW_MARGIN, SHADOW_MAX_ALPHA);

        // Pre-allocate pixel grid to eliminate per-frame allocations
        let max_grid_size = config.grid_size * config.grid_size;
        let pixel_grid = vec![Color::new(0, 0, 0); max_grid_size];

        // Persistent GDI capture resources, reused every frame (see W1)
        let capture_ctx = super::capture::CaptureContext::new(config.grid_size);

        // Read config values before moving it into state
        let detect_background_changes = config.detect_background_changes;
        let allow_hover_through = config.allow_hover_through;

        // Store state in window data
        let state = Box::new(WindowState {
            config,
            result,
            cursor_pos: (0, 0),
            prev_window_pos: (-1000, -1000),
            pixel_grid,
            prev_grid_hash: 0,
            capture_ctx,
            hdc_offscreen,
            bitmap_offscreen,
            bitmap_bits: bitmap_bits as *mut u8,
            window_width,
            window_height,
            mag_size,
            hex_font,
            circle_mask,
            border_mask,
            shadow_mask,
            mag_radius,
            invisible_cursor,
        });
        SetWindowLongPtrW(hwnd, GWLP_USERDATA, Box::into_raw(state) as isize);

        // Store window handle and hover-through flag in thread-local for hooks
        PICKER_HWND.with(|h| h.set(hwnd));
        ALLOW_HOVER_THROUGH.with(|f| f.set(allow_hover_through));

        // Install low-level mouse hook for instant tracking (and click detection if hover-through enabled)
        let mouse_hook = SetWindowsHookExW(
            WH_MOUSE_LL,
            Some(mouse_hook_proc),
            Some(instance.into()),
            0,
        ).map_err(|e| format!("Failed to install mouse hook: {:?}", e))?;

        // Always install the keyboard hook (see W3): relying on WM_KEYDOWN via window
        // focus is fragile — SetForegroundWindow can silently fail (foreground-lock
        // rules), and any focus steal would kill Escape/Enter/arrows mid-session.
        // The hook consumes and forwards picker keys regardless of focus, one input
        // path for both normal and hover-through modes.
        let keyboard_hook = SetWindowsHookExW(
            WH_KEYBOARD_LL,
            Some(keyboard_hook_proc),
            Some(instance.into()),
            0,
        ).map_err(|e| format!("Failed to install keyboard hook: {:?}", e))?;

        // Show window (no focus needed - mouse and keyboard are both hook-driven)
        let _ = ShowWindow(hwnd, SW_SHOW);

        // Background change detection timer: 30fps polling (doesn't affect 144fps mouse tracking!)
        // This allows picking color changes in videos/animations when mouse is stationary
        if detect_background_changes {
            SetTimer(Some(hwnd), 2, 33, None);  // Timer ID 2, 33ms = ~30fps
        }

        // Trigger initial render
        let _ = PostMessageW(Some(hwnd), WM_USER, WPARAM(0), LPARAM(0));

        // Message loop
        let mut msg = MSG::default();
        while GetMessageW(&mut msg, Some(HWND::default()), 0, 0).into() {
            let _ = TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }

        // Cleanup
        let _ = UnhookWindowsHookEx(mouse_hook);
        let _ = UnhookWindowsHookEx(keyboard_hook);
        while ShowCursor(true) < 0 {}  // Restore cursor
        Ok(())
    }
}

/// Window state for the color picker
///
/// Stores all rendering resources, configuration, and cached data needed
/// for high-performance rendering without per-frame allocations.
pub(super) struct WindowState {
    pub config: PickerConfig,
    pub result: Arc<Mutex<Option<PickedColor>>>,

    // Cursor and window tracking
    pub cursor_pos: (i32, i32),
    pub prev_window_pos: (i32, i32),

    // Pixel data and change detection
    pub pixel_grid: Vec<Color>,
    pub prev_grid_hash: u64,

    // Persistent capture resources, reused every frame (see W1)
    pub capture_ctx: super::capture::CaptureContext,

    // Offscreen rendering resources for UpdateLayeredWindow
    pub hdc_offscreen: HDC,
    pub bitmap_offscreen: HBITMAP,
    pub bitmap_bits: *mut u8,

    // Window dimensions
    pub window_width: i32,
    pub window_height: i32,
    pub mag_size: i32,

    // Font for hex label
    pub hex_font: HFONT,

    // Pre-computed masks for ultra-fast rendering (no per-pixel math)
    pub circle_mask: CircleMask,
    pub border_mask: BorderMask,
    pub shadow_mask: ShadowMask,
    pub mag_radius: i32,

    // Invisible cursor for bulletproof cursor hiding
    pub invisible_cursor: HCURSOR,
}

unsafe extern "system" fn wnd_proc(hwnd: HWND, msg: u32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    let state_ptr = GetWindowLongPtrW(hwnd, GWLP_USERDATA) as *mut WindowState;
    let state = if state_ptr.is_null() { None } else { Some(&mut *state_ptr) };

    match msg {
        WM_USER => {
            // Mouse move notification from hook - ULTRA LOW LATENCY
            if let Some(state) = state {
                // Get cursor position
                let mut point = POINT { x: 0, y: 0 };
                let _ = GetCursorPos(&mut point);
                state.cursor_pos = (point.x, point.y);

                // Capture pixels at cursor (writes into the pre-allocated grid)
                state.capture_ctx.capture_grid_at_cursor(point.x, point.y, &mut state.pixel_grid);

                // Render with optimized direct bitmap manipulation
                super::render::paint(hwnd, state);

                // Clear pending flag to allow next render
                RENDER_PENDING.store(false, std::sync::atomic::Ordering::Release);
            }
            LRESULT(0)
        }

        WM_PAINT => {
            // No longer used - rendering happens on mouse move
            DefWindowProcW(hwnd, msg, wparam, lparam)
        }

        WM_LBUTTONDOWN => {
            // Pick center color
            if let Some(state) = state {
                if !state.pixel_grid.is_empty() {
                    let center_idx = state.pixel_grid.len() / 2;
                    let color = state.pixel_grid[center_idx];
                    *state.result.lock().unwrap() = Some(color);
                }
            }
            // Close window immediately after picking
            let _ = DestroyWindow(hwnd);
            LRESULT(0)
        }

        WM_SETCURSOR => {
            // Prevent Windows from showing cursor - use invisible cursor
            if let Some(state) = state {
                SetCursor(Some(state.invisible_cursor));
            } else {
                SetCursor(Some(HCURSOR::default()));
            }
            LRESULT(1)  // TRUE - we handled it
        }

        WM_KEYDOWN => {
            // Check if Shift is pressed for faster movement
            let shift_pressed = (GetKeyState(VK_SHIFT.0 as i32) as u16 & 0x8000) != 0;
            let move_speed = if shift_pressed { CURSOR_MOVE_FAST } else { CURSOR_MOVE_NORMAL };

            match VIRTUAL_KEY(wparam.0 as u16) {
                VK_ESCAPE => {
                    // Close window immediately
                    let _ = DestroyWindow(hwnd);
                }
                VK_RETURN => {
                    // Pick center color (same as left click)
                    if let Some(state) = state {
                        if !state.pixel_grid.is_empty() {
                            let center_idx = state.pixel_grid.len() / 2;
                            let color = state.pixel_grid[center_idx];
                            *state.result.lock().unwrap() = Some(color);
                        }
                    }
                    // Close window immediately after picking
                    let _ = DestroyWindow(hwnd);
                }
                VK_LEFT => { move_cursor(-1, 0, move_speed); }
                VK_RIGHT => { move_cursor(1, 0, move_speed); }
                VK_UP => { move_cursor(0, -1, move_speed); }
                VK_DOWN => { move_cursor(0, 1, move_speed); }
                _ => {}
            }
            LRESULT(0)
        }

        WM_TIMER => {
            // Background change detection timer (ID 2, 30fps)
            // This allows picking color changes in videos/animations when mouse is stationary
            if wparam.0 == 2 {
                // Only post if no render pending (prevents queue congestion)
                if !RENDER_PENDING.swap(true, std::sync::atomic::Ordering::AcqRel) {
                    // Post WM_USER to trigger pixel capture + render
                    // The existing hash-based frame skip will prevent actual rendering if nothing changed
                    let _ = PostMessageW(Some(hwnd), WM_USER, WPARAM(0), LPARAM(0));
                }
            }
            LRESULT(0)
        }

        WM_DESTROY => {
            // Kill background timer (safe to call even if not created)
            let _ = KillTimer(Some(hwnd), 2);

            // Cleanup resources and state
            if !state_ptr.is_null() {
                let state = &*state_ptr;
                // Delete font
                let _ = DeleteObject(state.hex_font.into());
                // Delete cursor
                let _ = DestroyCursor(state.invisible_cursor);
                // Delete offscreen bitmap and DC
                let _ = DeleteObject(state.bitmap_offscreen.into());
                let _ = DeleteDC(state.hdc_offscreen);
                // Drop the state box
                drop(Box::from_raw(state_ptr));
            }
            PostQuitMessage(0);
            LRESULT(0)
        }

        _ => DefWindowProcW(hwnd, msg, wparam, lparam),
    }
}

unsafe fn move_cursor(dx: i32, dy: i32, multiplier: i32) {
    let mut point = POINT { x: 0, y: 0 };
    let _ = GetCursorPos(&mut point);
    let _ = SetCursorPos(point.x + dx * multiplier, point.y + dy * multiplier);

    // Manually trigger render update (SetCursorPos doesn't fire mouse hook)
    // Only post if no render pending
    if !RENDER_PENDING.swap(true, std::sync::atomic::Ordering::AcqRel) {
        PICKER_HWND.with(|h| {
            let hwnd = h.get();
            if !hwnd.is_invalid() {
                let _ = PostMessageW(Some(hwnd), WM_USER, WPARAM(0), LPARAM(0));
            }
        });
    }
}

/// Low-level mouse hook for instant, zero-latency mouse tracking
unsafe extern "system" fn mouse_hook_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    if code >= 0 {
        match wparam.0 as u32 {
            WM_MOUSEMOVE => {
                // Only post message if no render is pending (prevents queue congestion)
                if !RENDER_PENDING.swap(true, std::sync::atomic::Ordering::AcqRel) {
                    // Post message to window to trigger render
                    // Using PostMessage (non-blocking) instead of SendMessage for minimal latency
                    PICKER_HWND.with(|h| {
                        let hwnd = h.get();
                        if !hwnd.is_invalid() {
                            let _ = PostMessageW(Some(hwnd), WM_USER, WPARAM(0), LPARAM(0));
                        }
                    });
                }
                // If render is pending, we skip this mouse move to prevent backup
                // The next render will capture the latest position anyway
            }
            WM_LBUTTONDOWN => {
                // Only handle clicks here if hover-through is enabled (WS_EX_TRANSPARENT)
                // Otherwise, the window will receive the click normally
                let handle_in_hook = ALLOW_HOVER_THROUGH.with(|f| f.get());
                if handle_in_hook {
                    // Pick color on left click (consume the event)
                    PICKER_HWND.with(|h| {
                        let hwnd = h.get();
                        if !hwnd.is_invalid() {
                            let _ = PostMessageW(Some(hwnd), WM_LBUTTONDOWN, WPARAM(0), LPARAM(0));
                        }
                    });
                    // Return 1 to prevent the click from reaching underlying windows
                    return LRESULT(1);
                }
            }
            _ => {}
        }
    }
    CallNextHookEx(Some(HHOOK::default()), code, wparam, lparam)
}

/// Low-level keyboard hook for Escape, Enter, and arrow keys
unsafe extern "system" fn keyboard_hook_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    if code >= 0 && wparam.0 == WM_KEYDOWN as usize {
        // lparam points to KBDLLHOOKSTRUCT - read vkCode directly
        let kb_struct_ptr = lparam.0 as *const KBDLLHOOKSTRUCT;
        let vk_code = VIRTUAL_KEY((*kb_struct_ptr).vkCode as u16);

        // Handle picker-specific keys
        match vk_code {
            VK_ESCAPE | VK_RETURN | VK_LEFT | VK_RIGHT | VK_UP | VK_DOWN => {
                // Forward key to our window
                PICKER_HWND.with(|h| {
                    let hwnd = h.get();
                    if !hwnd.is_invalid() {
                        let _ = PostMessageW(Some(hwnd), WM_KEYDOWN, WPARAM(vk_code.0 as usize), LPARAM(0));
                    }
                });
                // Consume the event (don't pass to other apps)
                return LRESULT(1);
            }
            _ => {}
        }
    }
    CallNextHookEx(Some(HHOOK::default()), code, wparam, lparam)
}

#[repr(C)]
#[allow(dead_code, non_snake_case, clippy::upper_case_acronyms)]
struct KBDLLHOOKSTRUCT {
    vkCode: u32,
    scanCode: u32,
    flags: u32,
    time: u32,
    dwExtraInfo: usize,
}

/// Create a 1x1 fully transparent cursor for bulletproof cursor hiding
unsafe fn create_invisible_cursor() -> HCURSOR {
    // Create a 1x1 transparent cursor
    let and_mask = [0xFF_u8];  // AND mask - all 1s
    let xor_mask = [0x00_u8];  // XOR mask - all 0s

    CreateCursor(
        Some(GetModuleHandleW(None).unwrap_or_default().into()),
        0,  // hotspot x
        0,  // hotspot y
        1,  // width
        1,  // height
        and_mask.as_ptr() as *const std::ffi::c_void,
        xor_mask.as_ptr() as *const std::ffi::c_void,
    ).unwrap_or_default()
}
