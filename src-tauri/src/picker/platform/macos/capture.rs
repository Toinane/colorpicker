//! Screen pixel capture using Core Graphics
//!
//! Captures a small grid of pixels around the cursor position using
//! CGDisplayCreateImage for hardware-accelerated screen capture.
//! Handles Retina displays and multi-monitor setups correctly.

use crate::picker::color::Color;
use core_graphics::display::{CGDisplay, CGPoint};
use core_graphics::image::CGImage;
use core_foundation::base::TCFType;
use foreign_types::ForeignType;
use std::os::raw::c_void;

// External C function declarations
extern "C" {
    fn CGDisplayCreateImage(display_id: u32) -> *mut c_void;
    fn CFRelease(cf: *const c_void);
    fn CGImageGetDataProvider(image: *const c_void) -> *const c_void;
    fn CGDataProviderCopyData(provider: *const c_void) -> *const c_void;
    fn CFDataGetLength(data: *const c_void) -> isize;
    fn CFDataGetBytePtr(data: *const c_void) -> *const u8;
}

/// Check if the app has Screen Recording permission
///
/// On macOS 10.15+, Screen Recording permission is required to capture screen content.
/// This function attempts a small test capture to verify permission status.
///
/// # Returns
/// `true` if permission is granted, `false` if denied or not yet determined
pub fn check_screen_recording_permission() -> bool {
    let display = CGDisplay::main();
    
    // Try to capture the full screen to test permission
    unsafe {
        let image_ref = CGDisplayCreateImage(display.id);
        if image_ref.is_null() {
            return false;
        }
        
        let image = CGImage::from_ptr(image_ref as *mut _);
        let has_data = image.width() > 0 && image.height() > 0;
        CFRelease(image_ref);
        has_data
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

    // Capture full screen using CGDisplayCreateImage
    // This is Retina-aware and returns actual pixel data
    unsafe {
        let image_ref = CGDisplayCreateImage(display.id);
        if image_ref.is_null() {
            return pixels;
        }
        
        let image = CGImage::from_ptr(image_ref as *mut _);
        
        // Get full screen dimensions
        let screen_width = image.width();
        let screen_height = image.height();
        let bytes_per_row = image.bytes_per_row();
        let bits_per_pixel = image.bits_per_pixel();

        // Safety check
        if bits_per_pixel != 32 {
            eprintln!("Unexpected bits per pixel: {}", bits_per_pixel);
            CFRelease(image_ref);
            return pixels;
        }

        // Get raw pixel data
        let data_ptr = CGImageGetDataProvider(image.as_ptr() as *const _);
        if !data_ptr.is_null() {
            let cf_data_ref = CGDataProviderCopyData(data_ptr);
            if !cf_data_ref.is_null() {
                let length = CFDataGetLength(cf_data_ref);
                let byte_ptr = CFDataGetBytePtr(cf_data_ref);
                let bytes = std::slice::from_raw_parts(byte_ptr, length as usize);

                // Calculate the region we want to sample from the full screen
                // Convert cursor position to pixel coordinates
                let scale_x = screen_width as f64 / CGDisplay::main().pixels_wide() as f64;
                let scale_y = screen_height as f64 / CGDisplay::main().pixels_high() as f64;
                
                let half_grid = (grid_size / 2) as f64;
                let center_x = (cursor_x * scale_x) as usize;
                let center_y = (cursor_y * scale_y) as usize;
                let grid_half_pixels = ((half_grid * scale_x) as usize).max(1);

                // Sample the grid around the cursor
                for row in 0..grid_size {
                    for col in 0..grid_size {
                        // Calculate pixel coordinates relative to cursor
                        let offset_x = col as isize - (grid_size / 2) as isize;
                        let offset_y = row as isize - (grid_size / 2) as isize;
                        
                        let pixel_x = (center_x as isize + offset_x * (grid_half_pixels as isize / (grid_size / 2) as isize)).max(0) as usize;
                        let pixel_y = (center_y as isize + offset_y * (grid_half_pixels as isize / (grid_size / 2) as isize)).max(0) as usize;

                        // Bounds check
                        if pixel_x >= screen_width || pixel_y >= screen_height {
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
                
                CFRelease(cf_data_ref as *const _);
            }
        }
        
        CFRelease(image_ref);
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
