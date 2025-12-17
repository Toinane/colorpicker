//! Low-level drawing primitives for direct bitmap manipulation
//!
//! This module provides the building blocks for ultra-fast rendering by writing
//! pixels directly to bitmap memory. All functions are optimized for the hot path.

use super::geometry::is_in_rounded_rect;
use crate::picker::color::Color;
use windows::Win32::{
    Foundation::*,
    Graphics::Gdi::*,
};

// ============================================================================
// UI Constants - Tweak these to customize the picker appearance
// ============================================================================
//
// HOW TO USE:
//
// MAGNIFIER_BORDER_WIDTH_DIVISOR (default: 50)
//   - Controls the thickness of the circular border around the magnifier
//   - Formula: border_width = magnifier_size / MAGNIFIER_BORDER_WIDTH_DIVISOR
//   - Larger values = thinner border, smaller values = thicker border
//   - Examples: 25 = thick border, 50 = medium, 100 = thin border
//
// HEX_MARGIN (default: -35)
//   - Vertical spacing between magnifier and hex label
//   - Negative values = overlap/pull closer, positive = push apart
//   - Examples: -50 = more overlap, -20 = less overlap, 0 = no overlap
//
// HEX_PADDING (default: 10)
//   - Internal padding inside the hex label box around the text
//   - Larger values = more spacious, smaller = more compact
//
// HEX_BOX_HEIGHT (default: 26)
//   - Height of the hex label box (affects overall window height)
//   - Adjust if you change font size or want more vertical space
//
// HEX_EXTRA_WIDTH (default: 0)
//   - Additional width to add to the hex label beyond text width + padding
//   - Useful for making the box wider without changing padding
//   - Examples: 0 = fit to text, 20 = add 20px extra width, 40 = wider box
//
// HEX_TEXT_OFFSET_X (default: 2)
//   - Fine-tune horizontal text position within the box
//   - Positive values = shift right, negative = shift left
//   - Use this to perfectly center the text if it appears slightly off
//
// HEX_BORDER_WIDTH (default: 3)
//   - Border width around the hex label box
//   - Must be less than HEX_PADDING for proper appearance
//
// HEX_CORNER_RADIUS (default: 8)
//   - Corner radius for the rounded hex label box
//   - 0 = sharp corners, higher values = more rounded
//
// CENTER_CELL_BORDER (default: 3)
//   - Border width for highlighting the center pixel in the grid
//   - Shows which color will be picked
//
// ============================================================================

// Magnifier circle constants
pub const MAGNIFIER_BORDER_WIDTH_DIVISOR: i32 = 50;  // Border width = magnifier_size / this value (min 2px)

// Hex label layout
pub const HEX_MARGIN: i32 = -35;              // Space between magnifier and hex label (negative = overlap)
pub const HEX_PADDING: i32 = 10;              // Padding around hex text inside the box
pub const HEX_BOX_HEIGHT: i32 = 26;           // Height of the hex label box
pub const HEX_EXTRA_WIDTH: i32 = 20;           // Extra width beyond text + padding (for wider box)
pub const HEX_TEXT_OFFSET_X: i32 = 2;         // Horizontal text offset for fine-tuning centering
pub const HEX_BORDER_WIDTH: i32 = 3;          // Border width around hex label box
pub const HEX_CORNER_RADIUS: i32 = 8;         // Corner radius for rounded hex box

// Center cell highlight
pub const CENTER_CELL_BORDER: i32 = 3;        // Border width for the center pixel highlight

// Cursor movement speeds
pub const CURSOR_MOVE_NORMAL: i32 = 1;        // Normal arrow key movement (1 pixel)
pub const CURSOR_MOVE_FAST: i32 = 10;        // Shift + arrow key movement (10 pixels)

/// Clear entire bitmap to transparent (alpha = 0)
///
/// This is the fastest way to clear a bitmap - simple memset to zero.
#[inline]
pub unsafe fn clear_bitmap(bitmap_bits: *mut u8, width: i32, height: i32) {
    const BYTES_PER_PIXEL: usize = 4;
    let total_bytes = (width as usize)
        .saturating_mul(height as usize)
        .saturating_mul(BYTES_PER_PIXEL);
    std::ptr::write_bytes(bitmap_bits, 0, total_bytes);
}

/// Write a single pixel to bitmap in BGRA format
///
/// # Safety
/// Caller must ensure the offset is within bitmap bounds.
#[inline]
pub unsafe fn write_pixel(bitmap_bits: *mut u8, stride: i32, x: i32, y: i32, bgra: u32) {
    const BYTES_PER_PIXEL: i32 = 4;
    let offset = (y as isize)
        .saturating_mul(stride as isize)
        .saturating_mul(BYTES_PER_PIXEL as isize)
        .saturating_add((x as isize).saturating_mul(BYTES_PER_PIXEL as isize));
    std::ptr::write_unaligned(bitmap_bits.offset(offset) as *mut u32, bgra);
}

/// Draw a filled rectangle with rounded corners
///
/// This is used for the hex label background box. The border and fill are
/// drawn in a single pass for maximum efficiency.
///
/// # Arguments
/// * `border_color` - Color for the border
/// * `fill_color` - Color for the interior
/// * `radius` - Corner radius in pixels
pub unsafe fn draw_rounded_rect(
    bitmap_bits: *mut u8,
    stride: i32,
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    border_width: i32,
    border_color: Color,
    fill_color: Color,
    radius: i32,
) {
    let border_bgra = border_color.to_bgra();
    let fill_bgra = fill_color.to_bgra();

    for dy in 0..height {
        let py = y + dy;
        if py < 0 {
            continue;
        }

        for dx in 0..width {
            let px = x + dx;
            if px < 0 {
                continue;
            }

            // Check if pixel is within outer rounded rectangle (border)
            let in_border = is_in_rounded_rect(dx, dy, width, height, radius);
            
            if !in_border {
                continue;
            }

            // Check if pixel is within inner rounded rectangle (fill area)
            let inner_dx = dx - border_width;
            let inner_dy = dy - border_width;
            let inner_width = width - border_width * 2;
            let inner_height = height - border_width * 2;

            let in_fill = inner_dx >= 0 
                && inner_dy >= 0 
                && inner_dx < inner_width 
                && inner_dy < inner_height
                && is_in_rounded_rect(inner_dx, inner_dy, inner_width, inner_height, radius - border_width);

            // Choose appropriate color
            let pixel_color = if in_fill { fill_bgra } else { border_bgra };
            
            write_pixel(bitmap_bits, stride, px, py, pixel_color);
        }
    }
}

/// Render text to bitmap with proper alpha compositing
///
/// This function handles text rendering by creating a temporary GDI surface,
/// rendering the text with ClearType, and then manually compositing it onto
/// the main bitmap. This bypasses GDI's broken alpha channel handling for
/// layered windows.
pub unsafe fn draw_text(
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
    let temp_hdc = CreateCompatibleDC(hdc);

    let mut bmi = std::mem::zeroed::<BITMAPINFO>();
    bmi.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
    bmi.bmiHeader.biWidth = width;
    bmi.bmiHeader.biHeight = -height;  // Top-down DIB
    bmi.bmiHeader.biPlanes = 1;
    bmi.bmiHeader.biBitCount = 32;
    bmi.bmiHeader.biCompression = BI_RGB.0 as u32;

    let mut temp_bits: *mut std::ffi::c_void = std::ptr::null_mut();
    let temp_bitmap = match CreateDIBSection(
        temp_hdc,
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

    let old_bitmap = SelectObject(temp_hdc, temp_bitmap);
    let old_font = SelectObject(temp_hdc, font);

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
    let _ = DeleteObject(brush);

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
                
                write_pixel(bitmap_bits, stride, x + dx, y + dy, final_pixel);
            }
        }
    }

    // Cleanup
    SelectObject(temp_hdc, old_font);
    SelectObject(temp_hdc, old_bitmap);
    let _ = DeleteObject(temp_bitmap);
    let _ = DeleteDC(temp_hdc);
}

/// Fast hash function for change detection (FNV-1a algorithm)
///
/// This is used to detect if the pixel grid has changed between frames,
/// allowing us to skip rendering when the cursor is stationary over the
/// same pixels.
#[inline]
pub fn fast_hash(data: &[Color]) -> u64 {
    const FNV_OFFSET: u64 = 14695981039346656037;
    const FNV_PRIME: u64 = 1099511628211;

    let mut hash = FNV_OFFSET;
    for color in data {
        hash ^= color.r as u64;
        hash = hash.wrapping_mul(FNV_PRIME);
        hash ^= color.g as u64;
        hash = hash.wrapping_mul(FNV_PRIME);
        hash ^= color.b as u64;
        hash = hash.wrapping_mul(FNV_PRIME);
    }
    hash
}
