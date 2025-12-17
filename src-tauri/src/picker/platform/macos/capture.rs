// Screen Capture for macOS Picker
// Captures pixel grids from the screen at cursor position
//
// Note: Currently using Core Graphics (CGDisplayCreateImage) for simplicity.
// Can be upgraded to ScreenCaptureKit for even better performance in future.

use crate::picker::color::Color;
use core_graphics::display::{
    CGDisplay, CGMainDisplayID, CGPoint, CGRect, CGSize, kCGWindowListOptionOnScreenOnly,
    CGWindowID, CGWindowListCreateImage, kCGNullWindowID,
};
use core_graphics::image::CGImage;
use cocoa::appkit::NSScreen;
use cocoa::base::{id, nil};
use std::slice;

/// Capture state for the screen capture system
pub struct CaptureState {
    current_grid: Option<Vec<Color>>,
    last_position: (i32, i32),
}

impl CaptureState {
    /// Create a new capture state
    pub fn new() -> Result<Self, String> {
        // Check screen recording permission by attempting a test capture
        // Core Graphics will return null if permission not granted
        unsafe {
            let test_rect = CGRect::new(&CGPoint::new(0.0, 0.0), &CGSize::new(1.0, 1.0));
            let test_image = CGDisplay::screenshot(
                test_rect,
                kCGWindowListOptionOnScreenOnly,
                kCGNullWindowID,
                0,
            );

            if test_image.is_none() {
                return Err("Screen recording permission not granted. Please enable in System Settings > Privacy & Security > Screen Recording.".to_string());
            }
        }

        Ok(Self {
            current_grid: None,
            last_position: (0, 0),
        })
    }

    /// Update the pixel grid at the given cursor position
    pub fn update_grid(&mut self, cursor_pos: (i32, i32), grid_size: usize) -> Result<(), String> {
        self.last_position = cursor_pos;

        // Get display scale factor for Retina support
        let scale = unsafe {
            let main_screen = NSScreen::mainScreen(nil);
            let scale: f64 = msg_send![main_screen, backingScaleFactor];
            scale
        };

        // Calculate capture region around cursor
        let half_grid = (grid_size / 2) as f64;
        let capture_x = (cursor_pos.0 as f64 - half_grid) * scale;
        let capture_y = (cursor_pos.1 as f64 - half_grid) * scale;
        let capture_size = (grid_size as f64) * scale;

        // Get screen height for coordinate system conversion
        // macOS uses bottom-left origin, need to flip Y
        let screen_height = unsafe {
            let main_screen = NSScreen::mainScreen(nil);
            let frame: cocoa::foundation::NSRect = msg_send![main_screen, frame];
            frame.size.height
        };

        let flipped_y = (screen_height * scale) - capture_y - capture_size;

        // Capture screenshot of the region
        let capture_rect = CGRect::new(
            &CGPoint::new(capture_x, flipped_y),
            &CGSize::new(capture_size, capture_size),
        );

        let image = unsafe {
            CGDisplay::screenshot(
                capture_rect,
                kCGWindowListOptionOnScreenOnly,
                kCGNullWindowID,
                0,
            )
        };

        if image.is_none() {
            return Err("Failed to capture screen".to_string());
        }

        let image = image.unwrap();

        // Extract pixels from CGImage
        let pixels = extract_pixels_from_image(&image, grid_size)?;
        self.current_grid = Some(pixels);

        Ok(())
    }

    /// Get the current pixel grid
    pub fn get_current_grid(&self) -> Option<&Vec<Color>> {
        self.current_grid.as_ref()
    }
}

/// Extract pixel colors from a CGImage
fn extract_pixels_from_image(image: &CGImage, grid_size: usize) -> Result<Vec<Color>, String> {
    let width = image.width();
    let height = image.height();
    let bytes_per_row = image.bytes_per_row();
    let data_provider = image.data_provider();
    let data = data_provider.copy_data();

    if data.is_none() {
        return Err("Failed to get image data".to_string());
    }

    let data = data.unwrap();
    let pixels_ptr = unsafe { core_foundation::base::CFDataGetBytePtr(data.as_concrete_TypeRef()) };
    let pixels_len = unsafe { core_foundation::base::CFDataGetLength(data.as_concrete_TypeRef()) } as usize;

    if pixels_ptr.is_null() || pixels_len == 0 {
        return Err("Invalid image data".to_string());
    }

    let pixel_data = unsafe { slice::from_raw_parts(pixels_ptr, pixels_len) };

    // Extract grid of colors
    let mut colors = Vec::with_capacity(grid_size * grid_size);

    for row in 0..grid_size {
        for col in 0..grid_size {
            // Scale position if image is larger than grid (Retina)
            let scale_x = width as f64 / grid_size as f64;
            let scale_y = height as f64 / grid_size as f64;

            let pixel_x = (col as f64 * scale_x) as usize;
            let pixel_y = (row as f64 * scale_y) as usize;

            if pixel_x < width && pixel_y < height {
                // Calculate offset in pixel data
                // CGImage uses BGRA format on macOS
                let offset = (pixel_y * bytes_per_row) + (pixel_x * 4);

                if offset + 3 < pixel_data.len() {
                    let b = pixel_data[offset];
                    let g = pixel_data[offset + 1];
                    let r = pixel_data[offset + 2];
                    let a = pixel_data[offset + 3];

                    colors.push(Color::from_rgba(r, g, b, a));
                } else {
                    // Fallback for out-of-bounds
                    colors.push(Color::from_rgb(0, 0, 0));
                }
            } else {
                // Fallback for out-of-bounds
                colors.push(Color::from_rgb(0, 0, 0));
            }
        }
    }

    Ok(colors)
}
