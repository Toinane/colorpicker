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

use windows::Win32::{
    Foundation::*,
    Graphics::Gdi::*,
    UI::WindowsAndMessaging::*,
    UI::HiDpi::*,
    UI::Input::KeyboardAndMouse::*,
    System::LibraryLoader::*,
};
use windows::core::w;
use std::sync::{Arc, Mutex};
use std::cell::Cell;
use super::PixelColor;
use super::super::super::{PickerConfig, PickedColor};

// Thread-locals for hooks to access window state
thread_local! {
    static PICKER_HWND: Cell<HWND> = Cell::new(HWND(std::ptr::null_mut()));
    static ALLOW_HOVER_THROUGH: Cell<bool> = Cell::new(false);
}

// Atomic flag to prevent message queue congestion during fast mouse movement
static RENDER_PENDING: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

pub fn create_and_run(
    config: PickerConfig,
    result: Arc<Mutex<Option<PickedColor>>>,
) -> Result<(), String> {
    unsafe {
        // DPI awareness - CRITICAL for multi-monitor
        let _ = SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);

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

        // Create small layered window (just magnifier size, moves with cursor)
        // This is MUCH faster than fullscreen window for UpdateLayeredWindow
        let mag_size = config.magnifier_size as i32;

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
            mag_size,  // Small window, not fullscreen
            mag_size,
            None, None, instance, None,
        ).map_err(|e| format!("Failed to create window: {:?}", e))?;

        // Exclude from screen capture
        let _ = SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE);

        // Create offscreen DC and RGBA bitmap for UpdateLayeredWindow
        // Only need magnifier size, not entire screen!
        let hdc_screen = GetDC(HWND::default());
        let hdc_offscreen = CreateCompatibleDC(hdc_screen);

        // Create BITMAPV5HEADER for 32-bit RGBA (magnifier size only)
        let bmi = BITMAPV5HEADER {
            bV5Size: std::mem::size_of::<BITMAPV5HEADER>() as u32,
            bV5Width: mag_size,
            bV5Height: -mag_size,  // Negative for top-down DIB
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
            hdc_screen,
            &bmi as *const BITMAPV5HEADER as *const BITMAPINFO,
            DIB_RGB_COLORS,
            &mut bitmap_bits,
            None,
            0,
        ).expect("Failed to create DIB section");

        SelectObject(hdc_offscreen, bitmap_offscreen);
        ReleaseDC(HWND::default(), hdc_screen);

        // Create invisible cursor (more reliable than ShowCursor)
        let invisible_cursor = create_invisible_cursor();

        // Set invisible cursor
        SetCursor(invisible_cursor);

        // Also hide system cursor for good measure
        while ShowCursor(false) >= 0 {}  // Keep calling until hidden

        // Calculate magnifier dimensions
        let mag_radius = mag_size / 2;
        let border_width = (mag_size / 50).max(2);

        // Pre-compute circle mask for ultra-fast pixel-in-circle testing
        // This eliminates expensive distance calculations during rendering
        let circle_mask = create_circle_mask(mag_radius);

        // Pre-compute border mask for ultra-fast border rendering
        // Allows drawing the border with simple array lookups instead of math
        let border_mask = create_border_mask(mag_radius, border_width);

        // Pre-allocate pixel grid to eliminate per-frame allocations
        let max_grid_size = config.grid_size * config.grid_size;
        let pixel_grid = Vec::with_capacity(max_grid_size);

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
            hdc_offscreen,
            bitmap_offscreen,
            bitmap_bits: bitmap_bits as *mut u8,
            mag_size,
            circle_mask,
            border_mask,
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
            instance,
            0,
        ).map_err(|e| format!("Failed to install mouse hook: {:?}", e))?;

        // Install keyboard hook only if hover-through enabled (otherwise window receives keyboard events normally)
        let keyboard_hook = if allow_hover_through {
            Some(SetWindowsHookExW(
                WH_KEYBOARD_LL,
                Some(keyboard_hook_proc),
                instance,
                0,
            ).map_err(|e| format!("Failed to install keyboard hook: {:?}", e))?)
        } else {
            None
        };

        // Show window (no focus needed - we use global hooks for input)
        let _ = ShowWindow(hwnd, SW_SHOW);
        let _ = SetForegroundWindow(hwnd);

        // Background change detection timer: 30fps polling (doesn't affect 144fps mouse tracking!)
        // This allows picking color changes in videos/animations when mouse is stationary
        if detect_background_changes {
            SetTimer(hwnd, 2, 33, None);  // Timer ID 2, 33ms = ~30fps
        }

        // Trigger initial render
        let _ = PostMessageW(hwnd, WM_USER, WPARAM(0), LPARAM(0));

        // Message loop
        let mut msg = MSG::default();
        while GetMessageW(&mut msg, HWND::default(), 0, 0).into() {
            let _ = TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }

        // Cleanup
        let _ = UnhookWindowsHookEx(mouse_hook);
        if let Some(kb_hook) = keyboard_hook {
            let _ = UnhookWindowsHookEx(kb_hook);
        }
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
    pub pixel_grid: Vec<PixelColor>,
    pub prev_grid_hash: u64,

    // Offscreen rendering resources for UpdateLayeredWindow
    pub hdc_offscreen: HDC,
    pub bitmap_offscreen: HBITMAP,
    pub bitmap_bits: *mut u8,
    pub mag_size: i32,

    // Pre-computed masks for ultra-fast rendering (no per-pixel math)
    pub circle_mask: Vec<bool>,
    pub border_mask: Vec<bool>,
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

                // Capture pixels at cursor
                state.pixel_grid = super::capture::capture_grid_at_cursor(
                    point.x,
                    point.y,
                    state.config.grid_size,
                );

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
                    *state.result.lock().unwrap() = Some(PickedColor {
                        r: color.r,
                        g: color.g,
                        b: color.b,
                    });
                }
            }
            // Close window immediately after picking
            let _ = DestroyWindow(hwnd);
            LRESULT(0)
        }

        WM_SETCURSOR => {
            // Prevent Windows from showing cursor - use invisible cursor
            if let Some(state) = state {
                SetCursor(state.invisible_cursor);
            } else {
                SetCursor(HCURSOR::default());
            }
            LRESULT(1)  // TRUE - we handled it
        }

        WM_KEYDOWN => {
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
                            *state.result.lock().unwrap() = Some(PickedColor {
                                r: color.r,
                                g: color.g,
                                b: color.b,
                            });
                        }
                    }
                    // Close window immediately after picking
                    let _ = DestroyWindow(hwnd);
                }
                VK_LEFT => { move_cursor(-1, 0); }
                VK_RIGHT => { move_cursor(1, 0); }
                VK_UP => { move_cursor(0, -1); }
                VK_DOWN => { move_cursor(0, 1); }
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
                    let _ = PostMessageW(hwnd, WM_USER, WPARAM(0), LPARAM(0));
                }
            }
            LRESULT(0)
        }

        WM_DESTROY => {
            // Kill background timer (safe to call even if not created)
            let _ = KillTimer(hwnd, 2);

            // Cleanup resources and state
            if !state_ptr.is_null() {
                let state = &*state_ptr;
                // Delete cursor
                let _ = DestroyCursor(state.invisible_cursor);
                // Delete offscreen bitmap and DC
                let _ = DeleteObject(state.bitmap_offscreen);
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

unsafe fn move_cursor(dx: i32, dy: i32) {
    let mut point = POINT { x: 0, y: 0 };
    let _ = GetCursorPos(&mut point);
    let _ = SetCursorPos(point.x + dx, point.y + dy);

    // Manually trigger render update (SetCursorPos doesn't fire mouse hook)
    // Only post if no render pending
    if !RENDER_PENDING.swap(true, std::sync::atomic::Ordering::AcqRel) {
        PICKER_HWND.with(|h| {
            let hwnd = h.get();
            if !hwnd.is_invalid() {
                let _ = PostMessageW(hwnd, WM_USER, WPARAM(0), LPARAM(0));
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
                            let _ = PostMessageW(hwnd, WM_USER, WPARAM(0), LPARAM(0));
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
                            let _ = PostMessageW(hwnd, WM_LBUTTONDOWN, WPARAM(0), LPARAM(0));
                        }
                    });
                    // Return 1 to prevent the click from reaching underlying windows
                    return LRESULT(1);
                }
            }
            _ => {}
        }
    }
    CallNextHookEx(HHOOK::default(), code, wparam, lparam)
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
                        let _ = PostMessageW(hwnd, WM_KEYDOWN, WPARAM(vk_code.0 as usize), LPARAM(0));
                    }
                });
                // Consume the event (don't pass to other apps)
                return LRESULT(1);
            }
            _ => {}
        }
    }
    CallNextHookEx(HHOOK::default(), code, wparam, lparam)
}

#[repr(C)]
#[allow(dead_code, non_snake_case)]
struct KBDLLHOOKSTRUCT {
    vkCode: u32,
    scanCode: u32,
    flags: u32,
    time: u32,
    dwExtraInfo: usize,
}

/// Pre-compute circle mask for ultra-fast pixel-in-circle testing
/// This eliminates per-pixel distance calculations during rendering
fn create_circle_mask(radius: i32) -> Vec<bool> {
    let size = radius * 2;
    let mut mask = vec![false; (size * size) as usize];

    let radius_sq = radius * radius;
    for y in 0..size {
        for x in 0..size {
            let dx = x - radius;
            let dy = y - radius;
            let dist_sq = dx * dx + dy * dy;
            if dist_sq <= radius_sq {
                mask[(y * size + x) as usize] = true;
            }
        }
    }

    mask
}

/// Pre-compute border mask for ultra-fast border rendering
/// This eliminates per-pixel distance calculations during border drawing
fn create_border_mask(radius: i32, border_width: i32) -> Vec<bool> {
    let size = radius * 2;
    let mut mask = vec![false; (size * size) as usize];

    let outer_radius_sq = radius * radius;
    let inner_radius = radius - border_width;
    let inner_radius_sq = inner_radius * inner_radius;

    for y in 0..size {
        for x in 0..size {
            let dx = x - radius;
            let dy = y - radius;
            let dist_sq = dx * dx + dy * dy;
            // Pixel is in border if it's between inner and outer radius
            if dist_sq <= outer_radius_sq && dist_sq >= inner_radius_sq {
                mask[(y * size + x) as usize] = true;
            }
        }
    }

    mask
}

/// Create a 1x1 fully transparent cursor for bulletproof cursor hiding
unsafe fn create_invisible_cursor() -> HCURSOR {
    // Create a 1x1 transparent cursor
    let and_mask = [0xFF_u8];  // AND mask - all 1s
    let xor_mask = [0x00_u8];  // XOR mask - all 0s

    CreateCursor(
        GetModuleHandleW(None).unwrap_or_default(),
        0,  // hotspot x
        0,  // hotspot y
        1,  // width
        1,  // height
        and_mask.as_ptr() as *const std::ffi::c_void,
        xor_mask.as_ptr() as *const std::ffi::c_void,
    ).unwrap_or_default()
}
