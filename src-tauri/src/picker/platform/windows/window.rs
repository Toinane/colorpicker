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
use super::PixelColor;
use super::super::super::{PickerConfig, PickedColor};

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

        // Create fullscreen layered window
        // Note: Removed WS_EX_TOOLWINDOW to keep taskbar icon for emergency closing
        let hwnd = CreateWindowExW(
            WS_EX_LAYERED | WS_EX_TOPMOST,
            class_name,
            w!("Color Picker"),
            WS_POPUP,
            0, 0,
            GetSystemMetrics(SM_CXVIRTUALSCREEN),  // Span all monitors
            GetSystemMetrics(SM_CYVIRTUALSCREEN),
            None, None, instance, None,
        ).map_err(|e| format!("Failed to create window: {:?}", e))?;

        // Exclude from screen capture
        let _ = SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE);

        // Get screen dimensions for offscreen buffer
        let screen_width = GetSystemMetrics(SM_CXVIRTUALSCREEN);
        let screen_height = GetSystemMetrics(SM_CYVIRTUALSCREEN);

        // Create offscreen DC and RGBA bitmap for UpdateLayeredWindow
        let hdc_screen = GetDC(HWND::default());
        let hdc_offscreen = CreateCompatibleDC(hdc_screen);

        // Create BITMAPV5HEADER for 32-bit RGBA
        let bmi = BITMAPV5HEADER {
            bV5Size: std::mem::size_of::<BITMAPV5HEADER>() as u32,
            bV5Width: screen_width,
            bV5Height: -screen_height,  // Negative for top-down DIB
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

        // Hide system cursor
        while ShowCursor(false) >= 0 {}  // Keep calling until hidden

        // Store state in window data
        let state = Box::new(WindowState {
            config,
            result,
            cursor_pos: (0, 0),
            prev_picker_pos: (-1000, -1000),  // Initialize off-screen
            pixel_grid: Vec::new(),
            hdc_offscreen,
            bitmap_offscreen,
            bitmap_bits: bitmap_bits as *mut u8,
            screen_width,
            screen_height,
        });
        SetWindowLongPtrW(hwnd, GWLP_USERDATA, Box::into_raw(state) as isize);

        // Show window and set focus
        let _ = ShowWindow(hwnd, SW_SHOW);
        let _ = SetForegroundWindow(hwnd);
        let _ = SetFocus(hwnd);

        // High-precision timer - 5ms = 200Hz for smooth tracking
        SetTimer(hwnd, 1, 5, None);

        // Message loop
        let mut msg = MSG::default();
        while GetMessageW(&mut msg, HWND::default(), 0, 0).into() {
            let _ = TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }

        // Cleanup
        while ShowCursor(true) < 0 {}  // Restore cursor
        Ok(())
    }
}

pub(super) struct WindowState {
    pub config: PickerConfig,
    pub result: Arc<Mutex<Option<PickedColor>>>,
    pub cursor_pos: (i32, i32),
    pub prev_picker_pos: (i32, i32),  // Track previous position for efficient clearing
    pub pixel_grid: Vec<PixelColor>,
    // Offscreen rendering for UpdateLayeredWindow
    pub hdc_offscreen: HDC,
    pub bitmap_offscreen: HBITMAP,
    pub bitmap_bits: *mut u8,
    pub screen_width: i32,
    pub screen_height: i32,
}

unsafe extern "system" fn wnd_proc(hwnd: HWND, msg: u32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    let state_ptr = GetWindowLongPtrW(hwnd, GWLP_USERDATA) as *mut WindowState;
    let state = if state_ptr.is_null() { None } else { Some(&mut *state_ptr) };

    match msg {
        WM_TIMER => {
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

                // Render directly (no longer using WM_PAINT)
                // Note: paint now needs mutable state for prev_picker_pos tracking
                super::render::paint(hwnd, state);
            }
            LRESULT(0)
        }

        WM_PAINT => {
            // No longer used - rendering happens in WM_TIMER
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
            // Prevent Windows from showing cursor
            SetCursor(HCURSOR::default());
            LRESULT(1)  // TRUE - we handled it
        }

        WM_KEYDOWN => {
            match VIRTUAL_KEY(wparam.0 as u16) {
                VK_ESCAPE => {
                    // Close window immediately
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

        WM_DESTROY => {
            // Kill timer
            let _ = KillTimer(hwnd, 1);
            // Cleanup offscreen resources and state
            if !state_ptr.is_null() {
                let state = &*state_ptr;
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
}
