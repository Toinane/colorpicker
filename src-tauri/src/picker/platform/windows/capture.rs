//! Screen pixel capture using Windows GDI BitBlt
//!
//! Captures a small grid of pixels around the cursor position.
//! Uses BitBlt for hardware-accelerated screen capture, via a persistent
//! [`CaptureContext`] so no GDI objects or buffers are allocated per frame.

use crate::picker::color::Color;
use windows::Win32::{
    Foundation::*,
    Graphics::Gdi::*,
};

/// Persistent GDI resources for screen capture, reused across frames.
///
/// Creating/destroying a DC + compatible bitmap on every frame (the previous
/// design) is ~900 GDI object create/destroy calls per second at 144fps;
/// this holds them for the lifetime of the picker session instead.
pub struct CaptureContext {
    hdc_screen: HDC,
    hdc_mem: HDC,
    bitmap: HBITMAP,
    grid_size: i32,
    bmi: BITMAPINFO,
    raw_buffer: Vec<u8>,
}

impl CaptureContext {
    /// Create the capture context for a fixed grid size. The grid size is
    /// immutable for the lifetime of a picker session.
    pub fn new(grid_size: usize) -> Self {
        unsafe {
            let hdc_screen = GetDC(Some(HWND::default()));
            let hdc_mem = CreateCompatibleDC(Some(hdc_screen));
            let bitmap = CreateCompatibleBitmap(hdc_screen, grid_size as i32, grid_size as i32);
            SelectObject(hdc_mem, bitmap.into());

            let bmi = BITMAPINFO {
                bmiHeader: BITMAPINFOHEADER {
                    biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                    biWidth: grid_size as i32,
                    biHeight: -(grid_size as i32), // Negative = top-down DIB
                    biPlanes: 1,
                    biBitCount: 32, // 32-bit BGRA
                    biCompression: BI_RGB.0,
                    ..Default::default()
                },
                ..Default::default()
            };

            Self {
                hdc_screen,
                hdc_mem,
                bitmap,
                grid_size: grid_size as i32,
                bmi,
                raw_buffer: vec![0u8; grid_size * grid_size * 4],
            }
        }
    }

    /// Capture a grid of pixels centered at the cursor position into `out`.
    ///
    /// `out` must have exactly `grid_size * grid_size` elements, matching
    /// the size passed to [`CaptureContext::new`].
    pub fn capture_grid_at_cursor(&mut self, cursor_x: i32, cursor_y: i32, out: &mut [Color]) {
        unsafe {
            let half_grid = self.grid_size / 2;
            let start_x = cursor_x - half_grid;
            let start_y = cursor_y - half_grid;

            // BitBlt: Hardware-accelerated screen capture
            let _ = BitBlt(
                self.hdc_mem,
                0, 0,
                self.grid_size,
                self.grid_size,
                Some(self.hdc_screen),
                start_x,
                start_y,
                SRCCOPY,
            );

            GetDIBits(
                self.hdc_mem,
                self.bitmap,
                0,
                self.grid_size as u32,
                Some(self.raw_buffer.as_mut_ptr() as *mut _),
                &mut self.bmi,
                DIB_RGB_COLORS,
            );

            // Convert Windows BGRA format to RGB
            for (chunk, pixel) in self.raw_buffer.chunks(4).zip(out.iter_mut()) {
                *pixel = Color::new(
                    chunk[2], // R - Windows stores as BGRA
                    chunk[1], // G
                    chunk[0], // B
                );
            }
        }
    }
}

impl Drop for CaptureContext {
    fn drop(&mut self) {
        unsafe {
            let _ = DeleteObject(self.bitmap.into());
            let _ = DeleteDC(self.hdc_mem);
            ReleaseDC(Some(HWND::default()), self.hdc_screen);
        }
    }
}
