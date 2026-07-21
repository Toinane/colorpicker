//! Screen pixel capture using Windows GDI BitBlt
//!
//! Captures a small grid of pixels around the cursor position.
//! Uses BitBlt for hardware-accelerated screen capture.

use crate::picker::color::Color;
use windows::Win32::{
    Foundation::*,
    Graphics::Gdi::*,
};

/// Capture a grid of pixels centered at the cursor position
///
/// # Performance
/// - Uses BitBlt for hardware-accelerated capture
/// - Only captures the small grid area (e.g., 9x9 pixels)
/// - Handles multi-monitor setups correctly
///
/// # Arguments
/// * `cursor_x` - X coordinate of cursor in screen space
/// * `cursor_y` - Y coordinate of cursor in screen space
/// * `grid_size` - Width/height of grid to capture (typically 9)
///
/// # Returns
/// A flat vector of Color in row-major order (left-to-right, top-to-bottom)
pub fn capture_grid_at_cursor(cursor_x: i32, cursor_y: i32, grid_size: usize) -> Vec<Color> {
    unsafe {
        // Find monitor containing cursor (critical for multi-monitor DPI)
        let point = POINT { x: cursor_x, y: cursor_y };
        let hmonitor = MonitorFromPoint(point, MONITOR_DEFAULTTONEAREST);

        // Get monitor info (for DPI awareness)
        let mut monitor_info = MONITORINFO {
            cbSize: std::mem::size_of::<MONITORINFO>() as u32,
            ..Default::default()
        };
        let _ = GetMonitorInfoW(hmonitor, &mut monitor_info);

        // Get screen DC and create compatible memory DC
        let hdc_screen = GetDC(Some(HWND::default()));
        let hdc_mem = CreateCompatibleDC(Some(hdc_screen));

        // Calculate capture area centered on cursor
        let half_grid = (grid_size / 2) as i32;
        let start_x = cursor_x - half_grid;
        let start_y = cursor_y - half_grid;

        // Create bitmap for captured pixels
        let bitmap = CreateCompatibleBitmap(hdc_screen, grid_size as i32, grid_size as i32);
        SelectObject(hdc_mem, bitmap.into());

        // BitBlt: Hardware-accelerated screen capture
        let _ = BitBlt(
            hdc_mem,
            0, 0,
            grid_size as i32,
            grid_size as i32,
            Some(hdc_screen),
            start_x,
            start_y,
            SRCCOPY,
        );

        // Extract pixels from bitmap
        let mut pixels = Vec::with_capacity(grid_size * grid_size);
        let mut bmi = BITMAPINFO {
            bmiHeader: BITMAPINFOHEADER {
                biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                biWidth: grid_size as i32,
                biHeight: -(grid_size as i32),  // Negative = top-down DIB
                biPlanes: 1,
                biBitCount: 32,  // 32-bit BGRA
                biCompression: BI_RGB.0 as u32,
                ..Default::default()
            },
            ..Default::default()
        };

        let mut buffer = vec![0u8; grid_size * grid_size * 4];
        GetDIBits(
            hdc_mem,
            bitmap,
            0,
            grid_size as u32,
            Some(buffer.as_mut_ptr() as *mut _),
            &mut bmi,
            DIB_RGB_COLORS,
        );

        // Convert Windows BGRA format to RGB
        for chunk in buffer.chunks(4) {
            pixels.push(Color::new(
                chunk[2],  // R - Windows stores as BGRA
                chunk[1],  // G
                chunk[0],  // B
            ));
        }

        // Cleanup GDI resources
        let _ = DeleteObject(bitmap.into());
        let _ = DeleteDC(hdc_mem);
        ReleaseDC(Some(HWND::default()), hdc_screen);

        pixels
    }
}
