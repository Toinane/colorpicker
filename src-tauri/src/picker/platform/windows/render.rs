use windows::Win32::{
    Foundation::*,
    Graphics::Gdi::*,
    UI::WindowsAndMessaging::*,
};
use super::window::WindowState;

/// Ultra-optimized rendering with small moving window
/// Target: <1ms frame time for true 144fps+
pub unsafe fn paint(hwnd: HWND, state: &mut WindowState) {
    let (cursor_x, cursor_y) = state.cursor_pos;
    let mag_radius = state.mag_radius;

    // Aggressively hide cursor every frame (bulletproof)
    SetCursor(state.invisible_cursor);

    // Fast hash of pixel grid to detect changes (stationary cursor optimization)
    let current_hash = fast_hash_pixel_grid(&state.pixel_grid);
    let grid_changed = current_hash != state.prev_grid_hash;

    // Calculate window position (magnifier centered on cursor)
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

    // Smart clear: Only clear border pixels that aren't inside the content circle
    // Interior will be overwritten anyway
    clear_bitmap_smart(state.bitmap_bits, state.mag_size, &state.circle_mask);

    // Render picker at (0, 0) in window coordinates
    render_picker_direct(
        state.bitmap_bits,
        state.mag_size,
        0,  // picker_x in window coords
        0,  // picker_y in window coords
        state.mag_size,
        &state.pixel_grid,
        state.config.grid_size,
        &state.circle_mask,
    );

    // Draw border directly to bitmap (no GDI = no artifacts)
    draw_border_direct(
        state.bitmap_bits,
        state.mag_size,
        0,  // picker_x in window coords
        0,  // picker_y in window coords
        mag_radius,
        &state.border_mask,
    );

    // Draw hex label using GDI (text rendering is complex, keep GDI for now)
    if state.config.show_hex && !state.pixel_grid.is_empty() {
        draw_hex_label(state, 0, 0, state.mag_size);
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
    picker_x: i32,
    picker_y: i32,
    mag_size: i32,
    pixel_grid: &[super::PixelColor],
    grid_size: usize,
    circle_mask: &[bool],
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

    // Render each grid cell by writing directly to bitmap
    for (idx, pixel) in pixel_grid.iter().enumerate() {
        let row = idx / grid_size;
        let col = idx % grid_size;
        let is_center = idx == center_idx;

        let cell_x = picker_x + grid_offset + (col as i32 * cell_size);
        let cell_y = picker_y + grid_offset + (row as i32 * cell_size);

        // Prepare BGRA color value
        let bgra = (255u32 << 24) | ((pixel.r as u32) << 16) | ((pixel.g as u32) << 8) | (pixel.b as u32);

        // Draw cell pixels directly
        for dy in 0..cell_size {
            let y = cell_y + dy;
            if y < 0 || y >= stride_pixels {
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
                if rel_x >= 0 && rel_x < mag_size && rel_y >= 0 && rel_y < mag_size {
                    let mask_idx = (rel_y * mag_size + rel_x) as usize;
                    if mask_idx < circle_mask.len() && circle_mask[mask_idx] {
                        // Draw border for center pixel
                        let is_border = is_center && (dx < 3 || dx >= cell_size - 3 || dy < 3 || dy >= cell_size - 3);

                        let color = if is_border {
                            0xFFFFFFFF // White border for center pixel
                        } else {
                            bgra
                        };

                        let offset = (y * stride + x * bytes_per_pixel) as isize;
                        std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, color);
                    }
                }
            }
        }
    }
}

/// Draw circle border directly to bitmap buffer using pre-computed mask
/// This eliminates GDI artifacts, distance calculations, and is blazing fast
#[inline]
unsafe fn draw_border_direct(
    bitmap_bits: *mut u8,
    stride_pixels: i32,
    picker_x: i32,
    picker_y: i32,
    radius: i32,
    border_mask: &[bool],
) {
    let bytes_per_pixel = 4;
    let stride = stride_pixels * bytes_per_pixel;
    let diameter = radius * 2;

    // White color for border
    let white = 0xFFFFFFFF_u32;

    // Draw border using pre-computed mask - zero distance calculations
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
            let mask_idx = (dy * diameter + dx) as usize;
            if mask_idx < border_mask.len() && border_mask[mask_idx] {
                let offset = (y * stride + x * bytes_per_pixel) as isize;
                std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, white);
            }
        }
    }
}

/// Draw hex label
#[inline]
unsafe fn draw_hex_label(
    state: &WindowState,
    picker_x: i32,
    picker_y: i32,
    mag_size: i32,
) {
    let center_color = state.pixel_grid[state.pixel_grid.len() / 2];
    let hex_text = format!("#{:02X}{:02X}{:02X}\0", center_color.r, center_color.g, center_color.b);

    let hdc = state.hdc_offscreen;
    SetBkMode(hdc, TRANSPARENT);
    SetTextColor(hdc, COLORREF(0x00FFFFFF));

    // Position hex text at bottom of circle
    let text_margin = mag_size / 5;
    let text_height = mag_size / 10;
    let mut text_rect = RECT {
        left: picker_x + text_margin,
        top: picker_y + mag_size - text_margin - text_height / 2,
        right: picker_x + mag_size - text_margin,
        bottom: picker_y + mag_size - text_margin + text_height / 2,
    };

    let mut wide_text: Vec<u16> = hex_text.encode_utf16().collect();
    DrawTextW(
        hdc,
        &mut wide_text,
        &mut text_rect,
        DT_CENTER | DT_VCENTER | DT_SINGLELINE,
    );
}

/// Update layered window with the rendered bitmap
/// CRITICAL: Small window = 10-40x faster than fullscreen!
#[inline]
unsafe fn update_window(hwnd: HWND, state: &WindowState) {
    let blend = BLENDFUNCTION {
        BlendOp: AC_SRC_OVER as u8,
        BlendFlags: 0,
        SourceConstantAlpha: 255,
        AlphaFormat: AC_SRC_ALPHA as u8,
    };

    // SMALL window size (magnifier only, not entire screen!)
    let size = SIZE {
        cx: state.mag_size,
        cy: state.mag_size,
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
fn fast_hash_pixel_grid(grid: &[super::PixelColor]) -> u64 {
    const FNV_OFFSET: u64 = 14695981039346656037;
    const FNV_PRIME: u64 = 1099511628211;

    let mut hash = FNV_OFFSET;
    for pixel in grid {
        hash ^= pixel.r as u64;
        hash = hash.wrapping_mul(FNV_PRIME);
        hash ^= pixel.g as u64;
        hash = hash.wrapping_mul(FNV_PRIME);
        hash ^= pixel.b as u64;
        hash = hash.wrapping_mul(FNV_PRIME);
    }
    hash
}

/// Smart bitmap clear: Only clear pixels outside the circle
/// Interior pixels will be overwritten anyway, no need to clear them
#[inline]
unsafe fn clear_bitmap_smart(bitmap_bits: *mut u8, size: i32, circle_mask: &[bool]) {
    let bytes_per_pixel = 4;
    let stride = size * bytes_per_pixel;

    for y in 0..size {
        for x in 0..size {
            let mask_idx = (y * size + x) as usize;
            // Only clear pixels OUTSIDE the circle
            if mask_idx < circle_mask.len() && !circle_mask[mask_idx] {
                let offset = (y * stride + x * bytes_per_pixel) as isize;
                std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, 0);
            }
        }
    }
}
