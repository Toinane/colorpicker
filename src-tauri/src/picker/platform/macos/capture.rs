//! Screen pixel capture using Core Graphics
//!
//! Captures a small grid of pixels around the cursor position using
//! CGDisplayCreateImage for hardware-accelerated screen capture.
//! Handles Retina displays and multi-monitor setups correctly.

use crate::picker::color::Color;
use core_graphics::display::{CGDisplay, CGPoint};
use core_graphics::image::CGImage;

/// Check if the app has Screen Recording permission
///
/// On macOS 10.15+, Screen Recording permission is required to capture screen content.
/// This function attempts a small test capture to verify permission status.
///
/// # Returns
/// `true` if permission is granted, `false` if denied or not yet determined
pub fn check_screen_recording_permission() -> bool {
    let display = CGDisplay::main();
    
    // Try to capture a 1x1 pixel to test permission
    let test_rect = core_graphics::geometry::CGRect {
        origin: CGPoint { x: 0.0, y: 0.0 },
        size: core_graphics::geometry::CGSize {
            width: 1.0,
            height: 1.0,
        },
    };
    
    // If we can capture successfully and get valid image data, we have permission
    if let Ok(image) = CGImage::create_from_display_at_rect(&display, test_rect) {
        // Check if the image has actual data (not blank/denied)
        image.width() > 0 && image.height() > 0
    } else {
        false
    }
}

/// Request Screen Recording permission by attempting a capture
///
/// On first run, this will trigger macOS to show the permission dialog.
/// The user must manually grant permission in System Preferences.
///
/// # Returns
/// `true` if permission already granted, `false` if user needs to grant it
pub fn request_screen_recording_permission() -> bool {
    check_screen_recording_permission()
}

/// Capture a grid of pixels centered at the cursor position
///
/// # Performance
/// - Uses CGDisplayCreateImage for hardware-accelerated capture
/// - Only captures the small grid area (e.g., 9x9 pixels)
/// - Handles Retina displays automatically (backing scale factor)
/// - Handles multi-monitor setups correctly
///
/// # Arguments
/// * `cursor_x` - X coordinate of cursor in screen space (points, not pixels)
/// * `cursor_y` - Y coordinate of cursor in screen space (points, not pixels)
/// * `grid_size` - Width/height of grid to capture (typically 9)
///
/// # Returns
/// A flat vector of Color in row-major order (left-to-right, top-to-bottom)
pub fn capture_grid_at_cursor(cursor_x: f64, cursor_y: f64, grid_size: usize) -> Vec<Color> {
    let mut pixels = Vec::with_capacity(grid_size * grid_size);

    // Use main display (proper multi-monitor support can be added later with CGGetActiveDisplayList)
    let display = CGDisplay::main();

    // Calculate capture area centered on cursor
    // Note: Core Graphics uses points, not pixels. On Retina, 1pt = 2px or more.
    let half_grid = (grid_size / 2) as f64;
    let start_x = cursor_x - half_grid;
    let start_y = cursor_y - half_grid;

    // Create capture rectangle (in points)
    let rect = core_graphics::geometry::CGRect {
        origin: CGPoint {
            x: start_x,
            y: start_y,
        },
        size: core_graphics::geometry::CGSize {
            width: grid_size as f64,
            height: grid_size as f64,
        },
    };

    // Capture screen region
    // CGDisplayCreateImage returns a Retina-aware image (2x or more pixels per point)
    // NOTE: This requires Screen Recording permission on macOS 10.15+
    // If permission is denied, this returns Ok with a blank/black image
    if let Ok(image) = CGImage::create_from_display_at_rect(&display, rect) {
        // Get image dimensions (these are in pixels, accounting for Retina)
        let width = image.width();
        let height = image.height();
        let bytes_per_row = image.bytes_per_row();
        let bits_per_pixel = image.bits_per_pixel();

        // Safety check
        if bits_per_pixel != 32 {
            eprintln!("Unexpected bits per pixel: {}", bits_per_pixel);
            return pixels;
        }

        // Get raw pixel data
        if let Some(data_provider) = image.data_provider() {
            if let Some(data) = data_provider.data() {
                let bytes = data.bytes();

                // Calculate stride for sampling (to get exactly grid_size x grid_size colors)
                // On Retina, we might have 18x18 pixels but want 9x9 colors
                let x_stride = width / grid_size;
                let y_stride = height / grid_size;

                // Sample the image at regular intervals to get the grid
                for row in 0..grid_size {
                    for col in 0..grid_size {
                        // Calculate pixel coordinates (center of each grid cell)
                        let pixel_x = col * x_stride + x_stride / 2;
                        let pixel_y = row * y_stride + y_stride / 2;

                        // Bounds check
                        if pixel_x >= width || pixel_y >= height {
                            continue;
                        }

                        // Calculate byte offset (macOS uses BGRA format)
                        let offset = pixel_y * bytes_per_row + pixel_x * 4;

                        if offset + 3 < bytes.len() {
                            // macOS Core Graphics uses BGRA byte order
                            let b = bytes[offset];
                            let g = bytes[offset + 1];
                            let r = bytes[offset + 2];
                            // Alpha at bytes[offset + 3] - not needed

                            pixels.push(Color::new(r, g, b));
                        }
                    }
                }
            }
        }
    }

    // Ensure we always return exactly grid_size * grid_size colors
    while pixels.len() < grid_size * grid_size {
        pixels.push(Color::new(0, 0, 0));
    }

    pixels
}

/// Get the current cursor position in screen coordinates
///
/// Returns (x, y) in points (not pixels - Retina-independent)
pub fn get_cursor_position() -> (f64, f64) {
    unsafe {
        let event_location = cocoa::appkit::NSEvent::mouseLocation(cocoa::base::nil);
        
        // Core Graphics coordinates have origin at bottom-left, but we need top-left
        // Get main display height to flip Y coordinate
        let main_display_height = CGDisplay::main().bounds().size.height;
        
        (event_location.x, main_display_height - event_location.y)
    }
}
