use windows::Win32::{
    Foundation::*,
    Graphics::Gdi::*,
    UI::WindowsAndMessaging::*,
};
use super::window::WindowState;

pub unsafe fn paint(hwnd: HWND, state: &mut WindowState) {
    // Get cursor position for picker center
    let (cursor_x, cursor_y) = state.cursor_pos;

    // Calculate virtual screen origin
    let virtual_x = GetSystemMetrics(SM_XVIRTUALSCREEN);
    let virtual_y = GetSystemMetrics(SM_YVIRTUALSCREEN);

    // Adjust cursor position relative to virtual screen
    let picker_x = cursor_x - virtual_x - 100;
    let picker_y = cursor_y - virtual_y - 100;

    // PERFORMANCE: Only clear previous picker region instead of entire screen
    // Clear slightly larger area (210x210) to catch any overflow/artifacts
    let (prev_x, prev_y) = state.prev_picker_pos;
    if prev_x >= -100 && prev_y >= -100 {  // More lenient check for partially off-screen
        clear_region(state.bitmap_bits, state.screen_width, state.screen_height, prev_x - 5, prev_y - 5, 210, 210);
    }

    // Update previous position for next frame
    state.prev_picker_pos = (picker_x, picker_y);

    // Draw picker circle at cursor position on offscreen DC
    let hdc_offscreen = state.hdc_offscreen;

    // Create circular clip region to prevent overflow
    let clip_region = CreateEllipticRgn(picker_x, picker_y, picker_x + 200, picker_y + 200);
    SelectClipRgn(hdc_offscreen, clip_region);

    // Fill circle background with semi-transparent black for better contrast
    let brush_bg = CreateSolidBrush(COLORREF(0x00000000));
    let _ = Ellipse(hdc_offscreen, picker_x, picker_y, picker_x + 200, picker_y + 200);
    let _ = DeleteObject(brush_bg);

    // Draw pixel grid - maximized to nearly fill the circle (corners will be clipped)
    if !state.pixel_grid.is_empty() {
        let grid_size_px = 195;  // Nearly fill the 200px circle, clip region handles overflow
        let cell_size = grid_size_px / state.config.grid_size;
        let grid_offset = ((200 - grid_size_px) / 2) as i32;  // Center the grid

        for (idx, pixel) in state.pixel_grid.iter().enumerate() {
            let row = idx / state.config.grid_size;
            let col = idx % state.config.grid_size;
            let is_center = idx == state.pixel_grid.len() / 2;

            let x = picker_x + grid_offset + (col * cell_size) as i32;
            let y = picker_y + grid_offset + (row * cell_size) as i32;

            let color = COLORREF((pixel.b as u32) << 16 | (pixel.g as u32) << 8 | pixel.r as u32);
            let brush = CreateSolidBrush(color);
            let cell_rect = RECT {
                left: x,
                top: y,
                right: x + cell_size as i32,
                bottom: y + cell_size as i32,
            };
            FillRect(hdc_offscreen, &cell_rect, brush);
            let _ = DeleteObject(brush);

            // Center pixel white border - draw outline only, don't fill
            if is_center {
                let pen_center = CreatePen(PS_SOLID, 3, COLORREF(0x00FFFFFF));
                let old_pen_center = SelectObject(hdc_offscreen, pen_center);
                let brush_null = GetStockObject(NULL_BRUSH);
                let old_brush_center = SelectObject(hdc_offscreen, brush_null);

                // Draw border rectangle
                let _ = Rectangle(hdc_offscreen, cell_rect.left, cell_rect.top, cell_rect.right, cell_rect.bottom);

                // Restore objects
                SelectObject(hdc_offscreen, old_pen_center);
                SelectObject(hdc_offscreen, old_brush_center);
                let _ = DeleteObject(pen_center);
            }
        }

        // Draw hex label if enabled
        if state.config.show_hex {
            let center_color = state.pixel_grid[state.pixel_grid.len() / 2];
            let hex_text = format!("#{:02X}{:02X}{:02X}\0", center_color.r, center_color.g, center_color.b);

            SetBkMode(hdc_offscreen, TRANSPARENT);
            SetTextColor(hdc_offscreen, COLORREF(0x00FFFFFF));

            // Position hex text at bottom of circle
            let mut text_rect = RECT {
                left: picker_x + 40,
                top: picker_y + 165,
                right: picker_x + 160,
                bottom: picker_y + 185,
            };
            let mut wide_text: Vec<u16> = hex_text.encode_utf16().collect();
            DrawTextW(
                hdc_offscreen,
                &mut wide_text,
                &mut text_rect as *mut _,
                DT_CENTER | DT_VCENTER | DT_SINGLELINE,
            );
        }
    }

    // Draw white circle border on top
    let pen_border = CreatePen(PS_SOLID, 4, COLORREF(0x00FFFFFF));
    let old_pen = SelectObject(hdc_offscreen, pen_border);
    let old_brush = SelectObject(hdc_offscreen, GetStockObject(NULL_BRUSH));
    let _ = Ellipse(hdc_offscreen, picker_x + 2, picker_y + 2, picker_x + 198, picker_y + 198);

    // Remove clip region
    SelectClipRgn(hdc_offscreen, HRGN::default());
    let _ = DeleteObject(clip_region);

    // FIX TRANSPARENCY: Set alpha channel to 255 for all pixels in picker circle
    // GDI doesn't set alpha channel, so we need to do it manually
    let bytes_per_pixel = 4;
    let stride = state.screen_width * bytes_per_pixel;
    for dy in 0..200 {
        let y = picker_y + dy;
        if y < 0 || y >= state.screen_height {
            continue;
        }
        for dx in 0..200 {
            let x = picker_x + dx;
            if x < 0 || x >= state.screen_width {
                continue;
            }
            // Check if pixel is inside circle
            let cx = dx - 100;
            let cy = dy - 100;
            let dist_sq = cx * cx + cy * cy;
            if dist_sq <= 100 * 100 {
                // Inside circle - set alpha to 255
                let offset = (y * stride + x * bytes_per_pixel + 3) as isize;
                *state.bitmap_bits.offset(offset) = 255;
            }
        }
    }

    // Prepare blend function for UpdateLayeredWindow
    let blend = BLENDFUNCTION {
        BlendOp: AC_SRC_OVER as u8,
        BlendFlags: 0,
        SourceConstantAlpha: 255,
        AlphaFormat: AC_SRC_ALPHA as u8,
    };

    // Update the layered window with per-pixel alpha
    let size = SIZE {
        cx: state.screen_width,
        cy: state.screen_height,
    };
    let point_src = POINT { x: 0, y: 0 };

    let _ = UpdateLayeredWindow(
        hwnd,
        HDC(std::ptr::null_mut()),  // NULL = use screen DC
        None,    // Window position unchanged
        Some(&size),
        hdc_offscreen,
        Some(&point_src),
        COLORREF(0),
        Some(&blend),
        ULW_ALPHA,
    );

    // Cleanup GDI objects
    SelectObject(hdc_offscreen, old_pen);
    SelectObject(hdc_offscreen, old_brush);
    let _ = DeleteObject(pen_border);
}

/// Clear a rectangular region in the bitmap buffer to transparent
#[inline]
unsafe fn clear_region(
    bitmap_bits: *mut u8,
    screen_width: i32,
    screen_height: i32,
    x: i32,
    y: i32,
    width: usize,
    height: usize,
) {
    let bytes_per_pixel = 4;
    let stride = screen_width * bytes_per_pixel;

    for dy in 0..height as i32 {
        let row_y = y + dy;
        if row_y < 0 || row_y >= screen_height {
            continue;
        }

        let row_x_start = x.max(0);
        let row_x_end = (x + width as i32).min(screen_width);
        if row_x_start >= row_x_end {
            continue;
        }

        let offset = (row_y * stride + row_x_start * bytes_per_pixel) as isize;
        let clear_width = (row_x_end - row_x_start) as usize * bytes_per_pixel as usize;
        std::ptr::write_bytes(bitmap_bits.offset(offset), 0, clear_width);
    }
}

#[allow(dead_code)]
unsafe fn draw_custom_cursor(hdc: HDC, x: i32, y: i32) {
    // Draw crosshair cursor
    let pen = CreatePen(PS_SOLID, 2, COLORREF(0x00FFFFFF));
    let old_pen = SelectObject(hdc, pen);

    // Vertical line
    let _ = MoveToEx(hdc, x, y - 10, None);
    let _ = LineTo(hdc, x, y + 10);

    // Horizontal line
    let _ = MoveToEx(hdc, x - 10, y, None);
    let _ = LineTo(hdc, x + 10, y);

    SelectObject(hdc, old_pen);
    let _ = DeleteObject(pen);
}
