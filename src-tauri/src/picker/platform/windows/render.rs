//! High-performance rendering engine for the color picker
//!
//! This module orchestrates all rendering operations for the picker magnifier.
//! It achieves <1ms frame times (144fps+) through:
//!
//! - **Direct bitmap manipulation** - Bypasses GDI for pixel-level control
//! - **Hash-based frame skipping** - Eliminates redundant renders
//! - **Pre-computed masks** - Circle and border lookups are O(1)
//! - **Modular primitives** - Shared drawing code in `primitives` module
//!
//! # Architecture
//!
//! The rendering pipeline:
//! 1. Check if anything changed (position or pixels) - skip if not
//! 2. Move window to follow cursor (async, hardware-accelerated)
//! 3. Clear bitmap buffer
//! 4. Draw magnified pixel grid with adaptive borders
//! 5. Draw circular border
//! 6. Draw hex label with colored background
//! 7. Composite to screen with UpdateLayeredWindow

use crate::picker::color::Color;
use super::geometry::CircleMask;
use super::primitives::{self, *};
use super::window::WindowState;
use windows::Win32::{
    Foundation::*,
    Graphics::Gdi::*,
    UI::WindowsAndMessaging::*,
};

/// Main rendering entry point - orchestrates the complete render pipeline
///
/// Target: <1ms frame time for true 144fps+
pub unsafe fn paint(hwnd: HWND, state: &mut WindowState) {
    let (cursor_x, cursor_y) = state.cursor_pos;
    let mag_radius = state.mag_radius;

    // Aggressively hide cursor every frame (bulletproof)
    SetCursor(state.invisible_cursor);

    // Fast hash of pixel grid to detect changes (stationary cursor optimization)
    let current_hash = fast_hash_pixel_grid(&state.pixel_grid);
    let grid_changed = current_hash != state.prev_grid_hash;

    // Calculate window position (magnifier centered on cursor, hex label below)
    let window_x = cursor_x - mag_radius;
    let window_y = cursor_y - mag_radius;
    let window_moved = (window_x, window_y) != state.prev_window_pos;

    // FRAME SKIP: Skip rendering if nothing changed (stationary cursor on same pixels)
    if !window_moved && !grid_changed {
        return;  // Zero work = infinite fps for stationary cursor!
    }

    // Move window to follow cursor (ASYNC + INSTANT - no blocking)
    if window_moved {
        let _ = SetWindowPos(
            hwnd,
            HWND_TOPMOST,
            window_x,
            window_y,
            0, 0,
            SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW | SWP_ASYNCWINDOWPOS | SWP_NOREDRAW,
        );
        state.prev_window_pos = (window_x, window_y);
    }

    // Update hash for next frame
    state.prev_grid_hash = current_hash;

    // Clear entire window area (magnifier + hex label space)
    primitives::clear_bitmap(state.bitmap_bits, state.window_width, state.window_height);

    // Magnifier always at top of window, hex label at bottom
    let magnifier_y = 0;

    // Render picker
    render_picker_direct(
        state.bitmap_bits,
        state.window_width,
        state.window_height,
        0,  // picker_x in window coords
        magnifier_y,  // picker_y varies based on label position
        state.mag_size,
        &state.pixel_grid,
        state.config.grid_size,
        &state.circle_mask,
    );

    // Draw border directly to bitmap with adaptive colors (no GDI = no artifacts)
    draw_border_direct(
        state.bitmap_bits,
        state.window_width,
        0,  // picker_x in window coords
        magnifier_y,  // border_y same as picker_y
        state.mag_size,
        &state.border_mask,
        &state.pixel_grid,
        state.config.grid_size,
    );

    // Draw hex label at bottom of magnifier
    if state.config.show_hex && !state.pixel_grid.is_empty() {
        draw_hex_label_with_background(state);
    }

    // Update the layered window (SMALL window = FAST update)
    update_window(hwnd, state);
}

/// Render picker by writing pixels directly to bitmap buffer
/// This is the HOT PATH - every optimization matters
#[inline]
unsafe fn render_picker_direct(
    bitmap_bits: *mut u8,
    stride_pixels: i32,  // Width of bitmap in pixels
    bitmap_height: i32,  // Height of bitmap in pixels
    picker_x: i32,
    picker_y: i32,
    mag_size: i32,
    pixel_grid: &[Color],
    grid_size: usize,
    circle_mask: &CircleMask,
) {
    if pixel_grid.is_empty() {
        return;
    }

    let bytes_per_pixel = 4;
    let stride = stride_pixels * bytes_per_pixel;

    // Calculate grid cell size
    let cell_size = mag_size / grid_size as i32;
    let actual_grid_size = cell_size * grid_size as i32;
    let grid_offset = (mag_size - actual_grid_size) / 2;

    let center_idx = pixel_grid.len() / 2;

    // Calculate adaptive border color for center pixel based on luminance
    let center_pixel = pixel_grid[center_idx];
    let center_border_color = center_pixel.adaptive_foreground_bgra();

    // Render each grid cell by writing directly to bitmap
    for (idx, &pixel) in pixel_grid.iter().enumerate() {
        let row = idx / grid_size;
        let col = idx % grid_size;
        let is_center = idx == center_idx;

        let cell_x = picker_x + grid_offset + (col as i32 * cell_size);
        let cell_y = picker_y + grid_offset + (row as i32 * cell_size);

        // Prepare BGRA color value
        let bgra = pixel.to_bgra();

        // Draw cell pixels directly
        for dy in 0..cell_size {
            let y = cell_y + dy;
            if y < 0 || y >= bitmap_height {
                continue;
            }

            for dx in 0..cell_size {
                let x = cell_x + dx;
                if x < 0 || x >= stride_pixels {
                    continue;
                }

                // Check if pixel is inside circle using pre-computed mask
                let rel_x = x - picker_x;
                let rel_y = y - picker_y;
                
                if circle_mask.contains(rel_x, rel_y) {
                    // Draw border for center pixel with adaptive color
                    let is_border = is_center 
                        && (dx < CENTER_CELL_BORDER 
                            || dx >= cell_size - CENTER_CELL_BORDER 
                            || dy < CENTER_CELL_BORDER 
                            || dy >= cell_size - CENTER_CELL_BORDER);

                    let color = if is_border { center_border_color } else { bgra };

                    let offset = (y * stride + x * bytes_per_pixel) as isize;
                    std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, color);
                }
            }
        }
    }
}

/// Draw circle border directly to bitmap buffer with adaptive colors based on adjacent pixels
/// Border color adapts to the pixel grid cell it's next to (black on light, white on dark)
#[inline]
unsafe fn draw_border_direct(
    bitmap_bits: *mut u8,
    stride_pixels: i32,
    picker_x: i32,
    picker_y: i32,
    mag_size: i32,
    border_mask: &super::geometry::BorderMask,
    pixel_grid: &[Color],
    grid_size: usize,
) {
    let bytes_per_pixel = 4;
    let stride = stride_pixels * bytes_per_pixel;
    let diameter = mag_size;

    // Calculate grid layout parameters (same as in render_picker_direct)
    let cell_size = mag_size / grid_size as i32;
    let actual_grid_size = cell_size * grid_size as i32;
    let grid_offset = (mag_size - actual_grid_size) / 2;

    // Draw border using pre-computed mask with adaptive colors
    for dy in 0..diameter {
        let y = picker_y + dy;
        if y < 0 || y >= stride_pixels {
            continue;
        }

        for dx in 0..diameter {
            let x = picker_x + dx;
            if x < 0 || x >= stride_pixels {
                continue;
            }

            // Use pre-computed mask for instant border testing
            if border_mask.contains(dx, dy) {
                // Determine which grid cell this border pixel is adjacent to
                // by looking slightly inward from the border pixel
                let center_x = mag_size / 2;
                let center_y = mag_size / 2;

                // Calculate direction from center to border pixel
                let to_border_x = dx - center_x;
                let to_border_y = dy - center_y;

                // Move slightly inward (90% towards center) to find adjacent grid cell
                let inward_x = dx - (to_border_x / 10);
                let inward_y = dy - (to_border_y / 10);

                // Calculate which grid cell this inward point falls into
                let grid_x = inward_x - grid_offset;
                let grid_y = inward_y - grid_offset;

                if grid_x >= 0 && grid_y >= 0 {
                    let col = (grid_x / cell_size).min(grid_size as i32 - 1);
                    let row = (grid_y / cell_size).min(grid_size as i32 - 1);

                    if col >= 0 && row >= 0 && (row as usize) < grid_size && (col as usize) < grid_size {
                        let grid_idx = row as usize * grid_size + col as usize;

                        if grid_idx < pixel_grid.len() {
                            // Get the adjacent pixel color and determine border color
                            let adjacent_pixel = pixel_grid[grid_idx];
                            let border_color = adjacent_pixel.adaptive_foreground_bgra();

                            let offset = (y * stride + x * bytes_per_pixel) as isize;
                            std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, border_color);
                        }
                    }
                }
            }
        }
    }
}

/// Draw hex label with colored background at bottom of magnifier
/// Background color is the center pixel color, text color adapts based on luminance
#[inline]
unsafe fn draw_hex_label_with_background(state: &WindowState) {
    let center_color = state.pixel_grid[state.pixel_grid.len() / 2];
    let hex_text = center_color.to_hex() + "\0";

    // Measure text width to calculate proper box size
    SelectObject(state.hdc_offscreen, state.hex_font);
    let wide_text: Vec<u16> = hex_text.encode_utf16().collect();
    let mut text_size = SIZE { cx: 0, cy: 0 };
    let _ = GetTextExtentPoint32W(state.hdc_offscreen, &wide_text, &mut text_size);

    // Calculate box dimensions with padding and extra width
    let label_width = text_size.cx + HEX_PADDING * 2 + HEX_EXTRA_WIDTH;
    let label_height = HEX_BOX_HEIGHT + HEX_PADDING * 2;

    // Center the box horizontally
    let label_x = (state.window_width - label_width) / 2;

    // Position vertically at bottom (below magnifier)
    let label_y = state.mag_size + HEX_MARGIN;

    // Draw rounded rectangle background with adaptive border
    let border_color = center_color.adaptive_foreground();
    primitives::draw_rounded_rect(
        state.bitmap_bits,
        state.window_width,
        label_x,
        label_y,
        label_width,
        label_height,
        HEX_BORDER_WIDTH,
        border_color,
        center_color,
        HEX_CORNER_RADIUS,
    );

    // Calculate adaptive text color for readability
    let text_color = center_color.adaptive_foreground();

    // Draw text with proper alpha compositing
    primitives::draw_text(
        state.bitmap_bits,
        state.window_width,
        label_x,
        label_y,
        label_width,
        label_height,
        &hex_text,
        text_color,
        center_color,
        state.hdc_offscreen,
        state.hex_font,
        HEX_TEXT_OFFSET_X,
    );
}



/// Update layered window with the rendered bitmap
/// CRITICAL: Small window = much faster than fullscreen!
#[inline]
unsafe fn update_window(hwnd: HWND, state: &WindowState) {
    let blend = BLENDFUNCTION {
        BlendOp: AC_SRC_OVER as u8,
        BlendFlags: 0,
        SourceConstantAlpha: 255,
        AlphaFormat: AC_SRC_ALPHA as u8,
    };

    // Window size includes magnifier + hex label
    let size = SIZE {
        cx: state.window_width,
        cy: state.window_height,
    };
    let point_src = POINT { x: 0, y: 0 };

    let _ = UpdateLayeredWindow(
        hwnd,
        HDC(std::ptr::null_mut()),
        None,
        Some(&size),
        state.hdc_offscreen,
        Some(&point_src),
        COLORREF(0),
        Some(&blend),
        ULW_ALPHA,
    );
}

/// Fast hash of pixel grid using FNV-1a (optimized for speed, not cryptographic security)
#[inline]
fn fast_hash_pixel_grid(grid: &[Color]) -> u64 {
    primitives::fast_hash(grid)
}


