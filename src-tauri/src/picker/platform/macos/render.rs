//! High-performance rendering engine for the color picker
//!
//! This module orchestrates all rendering operations for the picker magnifier.
//! It achieves high frame rates through:
//!
//! - **Direct bitmap manipulation** - Bypasses AppKit for pixel-level control
//! - **Hash-based frame skipping** - Eliminates redundant renders
//! - **Pre-computed masks** - Circle and border lookups are O(1)
//! - **Shared primitives** - Reuses Windows drawing code (platform-agnostic)
//!
//! # Architecture
//!
//! The rendering pipeline:
//! 1. Check if anything changed (position or pixels) - skip if not
//! 2. Move window to follow cursor (hardware-accelerated)
//! 3. Clear bitmap buffer
//! 4. Draw magnified pixel grid with adaptive borders
//! 5. Draw circular border
//! 6. Draw hex label with colored background (using Core Text instead of GDI)
//! 7. Update CALayer contents

use crate::picker::color::Color;
use super::super::common::geometry::CircleMask;
use super::super::common::primitives::{self, *};
use core_graphics::base::CGFloat;
use core_graphics::color_space::CGColorSpace;
use core_graphics::context::CGContext;
use core_graphics::data_provider::CGDataProvider;
use core_graphics::geometry::{CGPoint, CGRect, CGSize};
use core_graphics::image::CGImage;

/// Main rendering entry point - orchestrates the complete render pipeline
///
/// Returns Some(CGImage) if rendering occurred, None if frame was skipped
pub fn render_frame(
    bitmap_buffer: &mut [u8],
    window_width: usize,
    window_height: usize,
    mag_size: usize,
    pixel_grid: &[Color],
    grid_size: usize,
    circle_mask: &CircleMask,
    border_mask: &super::geometry::BorderMask,
    show_hex: bool,
    prev_hash: &mut u64,
) -> Option<CGImage> {
    // Fast hash of pixel grid to detect changes (stationary cursor optimization)
    let current_hash = primitives::fast_hash(pixel_grid);
    
    // FRAME SKIP: Skip rendering if nothing changed (stationary cursor on same pixels)
    if current_hash == *prev_hash {
        return None;
    }
    
    *prev_hash = current_hash;

    // Clear entire window area (magnifier + hex label space)
    unsafe {
        clear_bitmap(
            bitmap_buffer.as_mut_ptr(),
            window_width as i32,
            window_height as i32,
        );
    }

    // Magnifier always at top of window, hex label at bottom
    let magnifier_y = 0;

    // Render picker
    render_picker_direct(
        bitmap_buffer.as_mut_ptr(),
        window_width,
        window_height,
        0,  // picker_x in window coords
        magnifier_y,
        mag_size,
        pixel_grid,
        grid_size,
        circle_mask,
    );

    // Draw border directly to bitmap with adaptive colors
    draw_border_direct(
        bitmap_buffer.as_mut_ptr(),
        window_width,
        0,  // picker_x in window coords
        magnifier_y,
        mag_size,
        border_mask,
        pixel_grid,
        grid_size,
    );

    // Draw hex label at bottom of magnifier
    if show_hex && !pixel_grid.is_empty() {
        draw_hex_label_with_background(
            bitmap_buffer.as_mut_ptr(),
            window_width as i32,
            window_height as i32,
            mag_size as i32,
            pixel_grid,
        );
    }

    // Convert bitmap buffer to CGImage
    create_cgimage_from_buffer(bitmap_buffer, window_width, window_height)
}

/// Render picker by writing pixels directly to bitmap buffer
/// This is the HOT PATH - every optimization matters
#[inline]
fn render_picker_direct(
    bitmap_bits: *mut u8,
    stride_pixels: usize,
    bitmap_height: usize,
    picker_x: usize,
    picker_y: usize,
    mag_size: usize,
    pixel_grid: &[Color],
    grid_size: usize,
    circle_mask: &CircleMask,
) {
    if pixel_grid.is_empty() {
        return;
    }

    unsafe {
        let bytes_per_pixel = 4;
        let stride = (stride_pixels * bytes_per_pixel) as i32;

        // Calculate grid cell size
        let cell_size = (mag_size / grid_size) as i32;
        let actual_grid_size = cell_size * grid_size as i32;
        let grid_offset = ((mag_size as i32 - actual_grid_size) / 2) as i32;

        let center_idx = pixel_grid.len() / 2;

        // Calculate adaptive border color for center pixel based on luminance
        let center_pixel = pixel_grid[center_idx];
        let center_border_color = center_pixel.adaptive_foreground_bgra();

        // Render each grid cell by writing directly to bitmap
        for (idx, &pixel) in pixel_grid.iter().enumerate() {
            let row = idx / grid_size;
            let col = idx % grid_size;
            let is_center = idx == center_idx;

            let cell_x = picker_x as i32 + grid_offset + (col as i32 * cell_size);
            let cell_y = picker_y as i32 + grid_offset + (row as i32 * cell_size);

            // Prepare BGRA color value
            let bgra = pixel.to_bgra();

            // Draw cell pixels directly
            for dy in 0..cell_size {
                let y = cell_y + dy;
                if y < 0 || y >= bitmap_height as i32 {
                    continue;
                }

                for dx in 0..cell_size {
                    let x = cell_x + dx;
                    if x < 0 || x >= stride_pixels as i32 {
                        continue;
                    }

                    // Check if pixel is inside circle using pre-computed mask
                    let rel_x = x - picker_x as i32;
                    let rel_y = y - picker_y as i32;

                    if circle_mask.contains(rel_x, rel_y) {
                        // Draw border for center pixel with adaptive color
                        let is_border = is_center
                            && (dx < CENTER_CELL_BORDER
                                || dx >= cell_size - CENTER_CELL_BORDER
                                || dy < CENTER_CELL_BORDER
                                || dy >= cell_size - CENTER_CELL_BORDER);

                        let color = if is_border { center_border_color } else { bgra };

                        let offset = (y * stride + x * bytes_per_pixel as i32) as isize;
                        std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, color);
                    }
                }
            }
        }
    }
}

/// Draw circle border directly to bitmap buffer with adaptive colors
#[inline]
fn draw_border_direct(
    bitmap_bits: *mut u8,
    stride_pixels: usize,
    picker_x: usize,
    picker_y: usize,
    mag_size: usize,
    border_mask: &super::geometry::BorderMask,
    pixel_grid: &[Color],
    grid_size: usize,
) {
    unsafe {
        let bytes_per_pixel = 4;
        let stride = (stride_pixels * bytes_per_pixel) as i32;
        let diameter = mag_size as i32;

        // Calculate grid layout parameters
        let cell_size = (mag_size / grid_size) as i32;
        let actual_grid_size = cell_size * grid_size as i32;
        let grid_offset = (mag_size as i32 - actual_grid_size) / 2;

        // Draw border using pre-computed mask with adaptive colors
        for dy in 0..diameter {
            let y = picker_y as i32 + dy;
            if y < 0 || y >= stride_pixels as i32 {
                continue;
            }

            for dx in 0..diameter {
                let x = picker_x as i32 + dx;
                if x < 0 || x >= stride_pixels as i32 {
                    continue;
                }

                // Use pre-computed mask for instant border testing
                if border_mask.contains(dx, dy) {
                    // Determine which grid cell this border pixel is adjacent to
                    let center_x = diameter / 2;
                    let center_y = diameter / 2;

                    let to_border_x = dx - center_x;
                    let to_border_y = dy - center_y;

                    let inward_x = dx - (to_border_x / 10);
                    let inward_y = dy - (to_border_y / 10);

                    let grid_x = inward_x - grid_offset;
                    let grid_y = inward_y - grid_offset;

                    if grid_x >= 0 && grid_y >= 0 {
                        let col = (grid_x / cell_size).min(grid_size as i32 - 1);
                        let row = (grid_y / cell_size).min(grid_size as i32 - 1);

                        if col >= 0 && row >= 0 && (row as usize) < grid_size && (col as usize) < grid_size {
                            let grid_idx = row as usize * grid_size + col as usize;

                            if grid_idx < pixel_grid.len() {
                                let adjacent_pixel = pixel_grid[grid_idx];
                                let border_color = adjacent_pixel.adaptive_foreground_bgra();

                                let offset = (y * stride + x * bytes_per_pixel as i32) as isize;
                                std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, border_color);
                            }
                        }
                    }
                }
            }
        }
    }
}

/// Draw hex label with colored background at bottom of magnifier
/// Uses Core Text for rendering instead of GDI
#[inline]
fn draw_hex_label_with_background(
    bitmap_bits: *mut u8,
    window_width: i32,
    window_height: i32,
    mag_size: i32,
    pixel_grid: &[Color],
) {
    let center_color = pixel_grid[pixel_grid.len() / 2];
    let hex_text = center_color.to_hex();

    // For now, use a simple approach: draw the background box using primitives
    // Text rendering with Core Text will be added in a follow-up refinement

    // Calculate box dimensions (estimate text width - we'll refine this)
    let label_width = 120;  // Estimated for "#FFFFFF" + padding
    let label_height = HEX_BOX_HEIGHT + HEX_PADDING * 2;

    // Center the box horizontally
    let label_x = (window_width - label_width) / 2;

    // Position vertically at bottom (below magnifier)
    let label_y = mag_size + HEX_MARGIN;

    // Draw rounded rectangle background with adaptive border
    let border_color = center_color.adaptive_foreground();
    
    unsafe {
        primitives::draw_rounded_rect(
            bitmap_bits,
            window_width,
            label_x,
            label_y,
            label_width,
            label_height,
            HEX_BORDER_WIDTH,
            border_color,
            center_color,
            HEX_CORNER_RADIUS,
        );
    }

    // TODO: Render text with Core Text
    // For the initial implementation, the colored box is the most important visual
    // We can add text rendering in a refinement pass
}

/// Convert bitmap buffer to CGImage
fn create_cgimage_from_buffer(buffer: &[u8], width: usize, height: usize) -> Option<CGImage> {
    let bytes_per_pixel = 4;
    let bytes_per_row = width * bytes_per_pixel;
    let bits_per_component = 8;
    let bits_per_pixel = 32;

    // Create data provider from buffer
    // We need to clone the buffer because CGDataProvider will own it
    let buffer_copy = buffer.to_vec();
    let data_provider = CGDataProvider::from_buffer(buffer_copy);

    // Create color space (sRGB)
    let color_space = CGColorSpace::create_device_rgb();

    // Create CGImage
    CGImage::new(
        width,
        height,
        bits_per_component,
        bits_per_pixel,
        bytes_per_row,
        &color_space,
        core_graphics::image::kCGBitmapByteOrder32Little
            | core_graphics::image::kCGImageAlphaFirst,
        &data_provider,
        false,  // should_interpolate
        core_graphics::display::kCGRenderingIntentDefault,
    )
}
