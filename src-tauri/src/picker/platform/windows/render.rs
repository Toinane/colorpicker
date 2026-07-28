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
use super::super::common::geometry::{BorderMask, CircleMask, ShadowMask, SquaredCorner};
use super::super::common::primitives::{self, *};
use super::window::WindowState;
use windows::Win32::{
    Foundation::*,
    Graphics::Gdi::*,
    UI::WindowsAndMessaging::*,
};

/// Cursor-aside mode: gap between the cursor and the lens window on the axis
/// (or axes) it's offset on.
const CURSOR_ASIDE_GAP: i32 = 4;

/// Cursor-aside mode: where to place the lens relative to the cursor, and which
/// corner of its bounding square ends up nearest the cursor as a result.
/// Defaults to below-right of the cursor (squared corner: top-left), flipping
/// either axis independently when the monitor's work area doesn't have room.
unsafe fn cursor_aside_placement(
    cursor_x: i32,
    cursor_y: i32,
    window_width: i32,
    window_height: i32,
) -> (i32, i32, SquaredCorner) {
    let Some(work) = monitor_work_area(cursor_x, cursor_y) else {
        // No monitor info available — fall back to the default diagonal
        // with no edge awareness rather than failing to place the lens.
        return (
            cursor_x + CURSOR_ASIDE_GAP,
            cursor_y + CURSOR_ASIDE_GAP,
            SquaredCorner::TopLeft,
        );
    };

    let fits_right = cursor_x + CURSOR_ASIDE_GAP + window_width <= work.right;
    let fits_left = cursor_x - CURSOR_ASIDE_GAP - window_width >= work.left;
    let place_right = fits_right || !fits_left;

    let fits_below = cursor_y + CURSOR_ASIDE_GAP + window_height <= work.bottom;
    let fits_above = cursor_y - CURSOR_ASIDE_GAP - window_height >= work.top;
    let place_below = fits_below || !fits_above;

    let window_x = if place_right {
        cursor_x + CURSOR_ASIDE_GAP
    } else {
        cursor_x - CURSOR_ASIDE_GAP - window_width
    };
    let window_y = if place_below {
        cursor_y + CURSOR_ASIDE_GAP
    } else {
        cursor_y - CURSOR_ASIDE_GAP - window_height
    };

    // Final safety clamp in case the lens doesn't fully fit on its chosen
    // side either (e.g. a monitor narrower than the lens itself).
    let window_x = window_x.clamp(work.left, (work.right - window_width).max(work.left));
    let window_y = window_y.clamp(work.top, (work.bottom - window_height).max(work.top));

    let corner = match (place_right, place_below) {
        (true, true) => SquaredCorner::TopLeft,
        (true, false) => SquaredCorner::BottomLeft,
        (false, true) => SquaredCorner::TopRight,
        (false, false) => SquaredCorner::BottomRight,
    };

    (window_x, window_y, corner)
}

/// Work area (excludes taskbar) of the monitor nearest the given point, or
/// `None` if the OS couldn't resolve it.
unsafe fn monitor_work_area(x: i32, y: i32) -> Option<RECT> {
    let mut monitor_info = MONITORINFO {
        cbSize: std::mem::size_of::<MONITORINFO>() as u32,
        ..Default::default()
    };
    let monitor = MonitorFromPoint(POINT { x, y }, MONITOR_DEFAULTTONEAREST);
    GetMonitorInfoW(monitor, &mut monitor_info)
        .as_bool()
        .then_some(monitor_info.rcWork)
}

/// Render text to bitmap with proper alpha compositing
///
/// This function handles text rendering by creating a temporary GDI surface,
/// rendering the text with ClearType, and then manually compositing it onto
/// the main bitmap. This bypasses GDI's broken alpha channel handling for
/// layered windows.
#[allow(clippy::too_many_arguments)]
unsafe fn draw_text(
    bitmap_bits: *mut u8,
    stride: i32,
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    text: &str,
    text_color: Color,
    background_color: Color,
    hdc: HDC,
    font: HFONT,
    offset_x: i32,
) {
    // Create temporary rendering surface
    let temp_hdc = CreateCompatibleDC(Some(hdc));

    let mut bmi = std::mem::zeroed::<BITMAPINFO>();
    bmi.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
    bmi.bmiHeader.biWidth = width;
    bmi.bmiHeader.biHeight = -height;  // Top-down DIB
    bmi.bmiHeader.biPlanes = 1;
    bmi.bmiHeader.biBitCount = 32;
    bmi.bmiHeader.biCompression = BI_RGB.0;

    let mut temp_bits: *mut std::ffi::c_void = std::ptr::null_mut();
    let temp_bitmap = match CreateDIBSection(
        Some(temp_hdc),
        &bmi,
        DIB_RGB_COLORS,
        &mut temp_bits,
        None,
        0,
    ) {
        Ok(bmp) => bmp,
        Err(_) => {
            let _ = DeleteDC(temp_hdc);
            return; // Silently fail to avoid panic with resources held
        }
    };

    let old_bitmap = SelectObject(temp_hdc, temp_bitmap.into());
    let old_font = SelectObject(temp_hdc, font.into());

    // Fill with background color
    let bg_colorref = COLORREF(
        ((background_color.b as u32) << 16) |
        ((background_color.g as u32) << 8) |
        (background_color.r as u32)
    );
    let brush = CreateSolidBrush(bg_colorref);
    let rect = RECT {
        left: 0,
        top: 0,
        right: width,
        bottom: height,
    };
    let _ = FillRect(temp_hdc, &rect, brush);
    let _ = DeleteObject(brush.into());

    // Configure text rendering
    let text_colorref = COLORREF(
        ((text_color.b as u32) << 16) |
        ((text_color.g as u32) << 8) |
        (text_color.r as u32)
    );
    SetTextColor(temp_hdc, text_colorref);
    SetBkMode(temp_hdc, TRANSPARENT);

    // Render text centered with horizontal offset
    let mut wide_text: Vec<u16> = text.encode_utf16().collect();
    let mut text_rect = RECT {
        left: offset_x,
        top: 0,
        right: width + offset_x,
        bottom: height,
    };
    let _ = DrawTextW(
        temp_hdc,
        &mut wide_text,
        &mut text_rect,
        DT_CENTER | DT_VCENTER | DT_SINGLELINE,
    );

    // Composite text onto main bitmap
    let temp_bits_u8 = temp_bits as *const u8;
    const BYTES_PER_PIXEL: i32 = 4;

    for dy in 0..height {
        for dx in 0..width {
            let temp_offset = (dy * width * BYTES_PER_PIXEL + dx * BYTES_PER_PIXEL) as isize;
            let temp_pixel = (temp_bits_u8.offset(temp_offset) as *const u32).read_unaligned();

            let temp_b = (temp_pixel & 0xFF) as u8;
            let temp_g = ((temp_pixel >> 8) & 0xFF) as u8;
            let temp_r = ((temp_pixel >> 16) & 0xFF) as u8;

            // If pixel differs from background, it's text - write with full alpha
            if temp_r != background_color.r 
                || temp_g != background_color.g 
                || temp_b != background_color.b 
            {
                let final_pixel = (255u32 << 24) 
                    | ((temp_r as u32) << 16) 
                    | ((temp_g as u32) << 8) 
                    | (temp_b as u32);
                
                primitives::write_pixel(bitmap_bits, stride, x + dx, y + dy, final_pixel);
            }
        }
    }

    // Cleanup
    SelectObject(temp_hdc, old_font);
    SelectObject(temp_hdc, old_bitmap);
    let _ = DeleteObject(temp_bitmap.into());
    let _ = DeleteDC(temp_hdc);
}

/// Main rendering entry point - orchestrates the complete render pipeline
///
/// Target: <1ms frame time for true 144fps+
pub unsafe fn paint(hwnd: HWND, state: &mut WindowState) {
    let (cursor_x, cursor_y) = state.cursor_pos;
    let mag_radius = state.mag_radius;

    // Aggressively hide cursor every frame (bulletproof)
    SetCursor(Some(state.invisible_cursor));

    // Fast hash of pixel grid to detect changes (stationary cursor optimization)
    let current_hash = fast_hash_pixel_grid(&state.pixel_grid);
    let grid_changed = current_hash != state.prev_grid_hash;

    // Calculate window position (circle centered on cursor, hex label below).
    // Offset by SHADOW_MARGIN since the window is padded on all sides to fit
    // the drop shadow around the circle — without this the *window* (not the
    // circle) would stay centered on the cursor, visibly offsetting the lens.
    //
    // Cursor-aside mode places the lens diagonally beside the cursor instead of
    // centered on it (flipping either axis to stay on the current monitor),
    // so the tiny sampled pixel region at the cursor is never covered by the
    // lens itself — that's what lets window.rs skip WDA_EXCLUDEFROMCAPTURE
    // (which would otherwise also hide the lens from screen-recording/
    // streaming software) without the lens self-capturing. The corner of the
    // lens nearest the cursor is squared off (see CursorAsideMasks) as a visual
    // cue pointing back at it.
    let (window_x, window_y, cursor_aside_corner) = if state.config.cursor_aside_mode {
        let (x, y, corner) =
            cursor_aside_placement(cursor_x, cursor_y, state.window_width, state.window_height);
        (x, y, Some(corner))
    } else {
        (
            cursor_x - mag_radius - SHADOW_MARGIN,
            cursor_y - mag_radius - SHADOW_MARGIN,
            None,
        )
    };
    let window_moved = (window_x, window_y) != state.prev_window_pos;

    // FRAME SKIP: Skip rendering if nothing changed (stationary cursor on same pixels)
    if !window_moved && !grid_changed {
        return;  // Zero work = infinite fps for stationary cursor!
    }

    // Move window to follow cursor (ASYNC + INSTANT - no blocking)
    if window_moved {
        let _ = SetWindowPos(
            hwnd,
            Some(HWND_TOPMOST),
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

    // Magnifier is inset by SHADOW_MARGIN on all sides (top/left) to leave
    // room for the drop shadow around the circle.
    let magnifier_x = SHADOW_MARGIN;
    let magnifier_y = SHADOW_MARGIN;

    // Squared-corner variants for Cursor-aside mode, falling back to the plain
    // circle if masks weren't precomputed (cursor_aside_mode off) — see
    // `CursorAsideMasks`.
    let (circle_mask, border_mask, shadow_mask): (&CircleMask, &BorderMask, &ShadowMask) =
        match cursor_aside_corner.zip(state.cursor_aside_masks.as_ref()) {
            Some((corner, masks)) => masks.get(corner),
            None => (&state.circle_mask, &state.border_mask, &state.shadow_mask),
        };

    // Drop shadow, drawn first: everything inside the circle gets fully
    // overwritten by the opaque grid/border below, leaving only the soft
    // ring outside the circle visible.
    draw_shadow(
        state.bitmap_bits,
        state.window_width,
        state.window_height,
        magnifier_x - SHADOW_MARGIN,
        magnifier_y - SHADOW_MARGIN,
        shadow_mask,
    );

    // Render picker
    render_picker_direct(
        state.bitmap_bits,
        state.window_width,
        state.window_height,
        magnifier_x,  // picker_x in window coords
        magnifier_y,  // picker_y varies based on label position
        state.mag_size,
        &state.pixel_grid,
        state.config.grid_size,
        circle_mask,
        state.config.show_pixel_grid,
    );

    // Draw border directly to bitmap (no GDI = no artifacts). White by
    // default; adaptive color is an experimental opt-in (see draw_border_direct).
    draw_border_direct(
        state.bitmap_bits,
        state.window_width,
        magnifier_x,  // picker_x in window coords
        magnifier_y,  // border_y same as picker_y
        state.mag_size,
        border_mask,
        &state.pixel_grid,
        state.config.grid_size,
        state.config.adaptive_border,
    );

    // Draw hex label at bottom of magnifier
    if state.config.show_hex && !state.pixel_grid.is_empty() {
        draw_hex_label_with_background(state);
    }

    // Update the layered window (SMALL window = FAST update)
    update_window(hwnd, state);
}

/// Draw the soft drop shadow around the magnifier circle. Writes plain black
/// pixels at the mask's alpha (no blending needed): this runs first, right
/// after the bitmap is cleared to transparent, so there's nothing underneath
/// yet to blend with. Everything inside the circle gets overwritten by the
/// opaque grid/border afterward — only the ring outside stays visible.
#[inline]
unsafe fn draw_shadow(
    bitmap_bits: *mut u8,
    stride_pixels: i32,
    bitmap_height: i32,
    origin_x: i32,
    origin_y: i32,
    shadow_mask: &ShadowMask,
) {
    let bytes_per_pixel = 4;
    let stride = stride_pixels * bytes_per_pixel;
    let size = shadow_mask.size();

    for dy in 0..size {
        let y = origin_y + dy;
        if y < 0 || y >= bitmap_height {
            continue;
        }

        for dx in 0..size {
            let x = origin_x + dx;
            if x < 0 || x >= stride_pixels {
                continue;
            }

            let alpha = shadow_mask.alpha_at(dx, dy);
            if alpha == 0 {
                continue;
            }

            let bgra = (alpha as u32) << 24; // black (r=g=b=0) at this alpha
            let offset = (y * stride + x * bytes_per_pixel) as isize;
            std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, bgra);
        }
    }
}

/// Render picker by writing pixels directly to bitmap buffer
/// This is the HOT PATH - every optimization matters
#[inline]
#[allow(clippy::too_many_arguments)]
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
    show_pixel_grid: bool,
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

                    // Grid line at each cell's right/bottom seam only (not
                    // left/top too — that would double-blend the same seam
                    // shared with the neighboring cell, compounding darker).
                    let is_grid_line = show_pixel_grid
                        && !is_border
                        && (dx == cell_size - 1 || dy == cell_size - 1);

                    let color = if is_border {
                        center_border_color
                    } else if is_grid_line {
                        blend_gray_overlay(bgra, 128, PIXEL_GRID_LINE_ALPHA)
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

/// Draw circle border directly to bitmap buffer.
///
/// By default the border is a constant white — `adaptive_border` (an
/// experimental setting) switches it to adapt per-pixel to whichever grid
/// cell it's next to (black on light, white on dark), which is the
/// original/legacy behavior but can itself become hard to see against
/// certain colors, hence demoting it from the default.
#[inline]
#[allow(clippy::too_many_arguments)]
unsafe fn draw_border_direct(
    bitmap_bits: *mut u8,
    stride_pixels: i32,
    picker_x: i32,
    picker_y: i32,
    mag_size: i32,
    border_mask: &super::super::common::geometry::BorderMask,
    pixel_grid: &[Color],
    grid_size: usize,
    adaptive_border: bool,
) {
    const WHITE_BGRA: u32 = 0xFFFFFFFF;

    let bytes_per_pixel = 4;
    let stride = stride_pixels * bytes_per_pixel;
    let diameter = mag_size;

    // Calculate grid layout parameters (same as in render_picker_direct)
    let cell_size = mag_size / grid_size as i32;
    let actual_grid_size = cell_size * grid_size as i32;
    let grid_offset = (mag_size - actual_grid_size) / 2;

    // Draw border using pre-computed mask
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
                if !adaptive_border {
                    let offset = (y * stride + x * bytes_per_pixel) as isize;
                    std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, WHITE_BGRA);
                    continue;
                }

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
    SelectObject(state.hdc_offscreen, state.hex_font.into());
    let wide_text: Vec<u16> = hex_text.encode_utf16().collect();
    let mut text_size = SIZE { cx: 0, cy: 0 };
    let _ = GetTextExtentPoint32W(state.hdc_offscreen, &wide_text, &mut text_size);

    // Calculate box dimensions with padding and extra width
    let label_width = text_size.cx + HEX_PADDING * 2 + HEX_EXTRA_WIDTH;
    let label_height = HEX_BOX_HEIGHT + HEX_PADDING * 2;

    // Center the box horizontally
    let label_x = (state.window_width - label_width) / 2;

    // Position vertically at bottom (below magnifier). Offset by SHADOW_MARGIN
    // since the circle itself starts that far down in the (now padded) window.
    let label_y = SHADOW_MARGIN + state.mag_size + HEX_MARGIN;

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
    draw_text(
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
        Some(HDC(std::ptr::null_mut())),
        None,
        Some(&size),
        Some(state.hdc_offscreen),
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


