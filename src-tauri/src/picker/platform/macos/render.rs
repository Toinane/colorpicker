// Metal Rendering for macOS Picker
// GPU-accelerated rendering of magnifier grid, borders, and hex label

use crate::picker::color::Color;
use crate::picker::PickerConfig;
use crate::picker::platform::common::geometry::{BorderMask, CircleMask};
use crate::picker::platform::common::primitives::{
    CENTER_CELL_BORDER, fast_hash, HEX_BORDER_WIDTH, HEX_BOX_HEIGHT, HEX_CORNER_RADIUS,
    HEX_EXTRA_WIDTH, HEX_MARGIN, HEX_PADDING, HEX_TEXT_OFFSET_X, MAGNIFIER_BORDER_WIDTH_DIVISOR,
};

use metal::*;
use cocoa::base::{id, nil, YES};
use cocoa::foundation::{NSRect, NSPoint, NSSize, NSString};
use core_graphics::color_space::CGColorSpace;
use core_graphics::context::{CGContext, CGInterpolationQuality, CGTextDrawingMode};
use core_graphics::geometry::{CGPoint as CGPointGraphics, CGRect as CGRectGraphics, CGSize as CGSizeGraphics};
use core_text::font::CTFont;
use core_text::string_attributes::kCTFontAttributeName;
use core_foundation::attributed_string::CFMutableAttributedString;
use core_foundation::base::TCFType;
use core_foundation::string::CFString;
use objc::{msg_send, sel, sel_impl};

use std::mem;

/// Render state containing Metal resources and rendering context
pub struct RenderState {
    device: Device,
    command_queue: CommandQueue,
    circle_mask: CircleMask,
    border_mask: BorderMask,
    last_grid_hash: u64,
    last_cursor_pos: (i32, i32),
}

impl RenderState {
    /// Create new render state with Metal resources
    pub fn new(device: &Device, config: &PickerConfig) -> Result<Self, String> {
        let command_queue = device.new_command_queue();

        // Pre-compute circle and border masks for fast rendering
        let radius = (config.magnifier_size / 2) as f32;
        let border_width = (config.magnifier_size / MAGNIFIER_BORDER_WIDTH_DIVISOR) as f32;

        let circle_mask = CircleMask::new_circle(radius);
        let border_mask = BorderMask::new_circle(radius, border_width);

        Ok(Self {
            device: device.clone(),
            command_queue,
            circle_mask,
            border_mask,
            last_grid_hash: 0,
            last_cursor_pos: (0, 0),
        })
    }

    /// Render a frame to the Metal layer
    pub fn render_frame(
        &mut self,
        layer: &MetalLayerRef,
        pixel_grid: &[Color],
        config: &PickerConfig,
    ) -> Result<(), String> {
        // Frame skipping - only render if something changed
        let current_hash = fast_hash(pixel_grid);
        if current_hash == self.last_grid_hash {
            return Ok(()); // Nothing changed, skip frame
        }
        self.last_grid_hash = current_hash;

        // Get next drawable
        let drawable = match layer.next_drawable() {
            Some(d) => d,
            None => return Err("Failed to get drawable".to_string()),
        };

        let texture = drawable.texture();

        // Create command buffer
        let command_buffer = self.command_queue.new_command_buffer();

        // Clear the texture
        let render_pass_descriptor = RenderPassDescriptor::new();
        let color_attachment = render_pass_descriptor
            .color_attachments()
            .object_at(0)
            .unwrap();

        color_attachment.set_texture(Some(texture));
        color_attachment.set_load_action(MTLLoadAction::Clear);
        color_attachment.set_clear_color(MTLClearColor::new(0.0, 0.0, 0.0, 0.0));
        color_attachment.set_store_action(MTLStoreAction::Store);

        // For simplicity, we'll render to a CPU buffer then upload to GPU
        // This is not optimal but works for initial implementation
        // TODO: Implement proper Metal shaders for magnification
        let width = config.magnifier_size;
        let height = if config.show_hex {
            config.magnifier_size + HEX_BOX_HEIGHT + HEX_MARGIN.abs() as usize
        } else {
            config.magnifier_size
        };

        // Create bitmap buffer (BGRA format)
        let mut bitmap = vec![0u8; width * height * 4];

        // Render magnifier grid
        self.render_magnifier_grid(&mut bitmap, width, height, pixel_grid, config);

        // Render borders
        self.render_borders(&mut bitmap, width, height, pixel_grid, config);

        // Render hex label
        if config.show_hex {
            let center_idx = pixel_grid.len() / 2;
            if center_idx < pixel_grid.len() {
                self.render_hex_label(&mut bitmap, width, height, &pixel_grid[center_idx], config)?;
            }
        }

        // Upload bitmap to texture
        let region = MTLRegion::new_2d(0, 0, width as u64, height as u64);
        texture.replace_region(region, 0, bitmap.as_ptr() as *const _, (width * 4) as u64);

        // Commit and present
        command_buffer.present_drawable(drawable);
        command_buffer.commit();

        Ok(())
    }

    /// Render the magnified pixel grid
    fn render_magnifier_grid(
        &self,
        bitmap: &mut [u8],
        width: usize,
        height: usize,
        pixel_grid: &[Color],
        config: &PickerConfig,
    ) {
        let grid_size = config.grid_size;
        let magnifier_size = config.magnifier_size;
        let cell_size = magnifier_size / grid_size;
        let radius = (magnifier_size / 2) as i32;
        let center_x = (magnifier_size / 2) as i32;
        let center_y = (magnifier_size / 2) as i32;

        // Render each grid cell
        for grid_y in 0..grid_size {
            for grid_x in 0..grid_size {
                let color_idx = grid_y * grid_size + grid_x;
                if color_idx >= pixel_grid.len() {
                    continue;
                }

                let color = &pixel_grid[color_idx];

                // Calculate cell position in magnifier
                let cell_x = grid_x * cell_size;
                let cell_y = grid_y * cell_size;

                // Draw cell
                for py in 0..cell_size {
                    for px in 0..cell_size {
                        let x = cell_x + px;
                        let y = cell_y + py;

                        // Check if pixel is inside circle
                        let dx = x as i32 - center_x;
                        let dy = y as i32 - center_y;

                        if !self.circle_mask.contains(dx, dy) {
                            continue;
                        }

                        // Write pixel
                        if x < width && y < height {
                            let offset = (y * width + x) * 4;
                            if offset + 3 < bitmap.len() {
                                bitmap[offset] = color.b;
                                bitmap[offset + 1] = color.g;
                                bitmap[offset + 2] = color.r;
                                bitmap[offset + 3] = 255;
                            }
                        }
                    }
                }
            }
        }
    }

    /// Render circle border and center cell highlight
    fn render_borders(
        &self,
        bitmap: &mut [u8],
        width: usize,
        _height: usize,
        pixel_grid: &[Color],
        config: &PickerConfig,
    ) {
        let magnifier_size = config.magnifier_size;
        let grid_size = config.grid_size;
        let cell_size = magnifier_size / grid_size;
        let center_x = (magnifier_size / 2) as i32;
        let center_y = (magnifier_size / 2) as i32;

        // Get center cell color for adaptive border
        let center_idx = pixel_grid.len() / 2;
        let center_color = if center_idx < pixel_grid.len() {
            &pixel_grid[center_idx]
        } else {
            &Color::from_rgb(128, 128, 128)
        };

        let border_color = center_color.adaptive_foreground();

        // Draw circle border
        for y in 0..magnifier_size {
            for x in 0..magnifier_size {
                let dx = x as i32 - center_x;
                let dy = y as i32 - center_y;

                if self.border_mask.contains(dx, dy) {
                    // Determine border color based on nearby pixel
                    let offset = (y * width + x) * 4;
                    if offset + 3 < bitmap.len() {
                        // Use adaptive color for visibility
                        bitmap[offset] = border_color.b;
                        bitmap[offset + 1] = border_color.g;
                        bitmap[offset + 2] = border_color.r;
                        bitmap[offset + 3] = 255;
                    }
                }
            }
        }

        // Draw center cell border
        let center_grid_x = grid_size / 2;
        let center_grid_y = grid_size / 2;
        let center_cell_x = center_grid_x * cell_size;
        let center_cell_y = center_grid_y * cell_size;

        for py in 0..cell_size {
            for px in 0..cell_size {
                // Check if on border of center cell
                let is_border = px < CENTER_CELL_BORDER
                    || px >= cell_size - CENTER_CELL_BORDER
                    || py < CENTER_CELL_BORDER
                    || py >= cell_size - CENTER_CELL_BORDER;

                if is_border {
                    let x = center_cell_x + px;
                    let y = center_cell_y + py;

                    let dx = x as i32 - center_x;
                    let dy = y as i32 - center_y;

                    if self.circle_mask.contains(dx, dy) && x < width && y < magnifier_size {
                        let offset = (y * width + x) * 4;
                        if offset + 3 < bitmap.len() {
                            bitmap[offset] = border_color.b;
                            bitmap[offset + 1] = border_color.g;
                            bitmap[offset + 2] = border_color.r;
                            bitmap[offset + 3] = 255;
                        }
                    }
                }
            }
        }
    }

    /// Render hex label with Core Text
    fn render_hex_label(
        &self,
        bitmap: &mut [u8],
        width: usize,
        height: usize,
        color: &Color,
        config: &PickerConfig,
    ) -> Result<(), String> {
        let hex_str = color.hex();
        let magnifier_size = config.magnifier_size;

        // Calculate hex label position and size
        let hex_y = magnifier_size + HEX_MARGIN.abs() as usize;
        let label_height = HEX_BOX_HEIGHT;

        // Create hex label background
        let text_color = color.adaptive_foreground();
        let center_x = width / 2;

        // Measure text size for box width
        let text_width = hex_str.len() * 8 + HEX_PADDING * 2; // Approximate
        let box_width = text_width + HEX_EXTRA_WIDTH;
        let box_x = center_x.saturating_sub(box_width / 2);

        // Draw rounded rectangle background
        self.draw_rounded_rect(
            bitmap,
            width,
            height,
            box_x,
            hex_y,
            box_width,
            label_height,
            HEX_CORNER_RADIUS,
            color,
            &text_color,
        );

        // Render text using Core Graphics
        self.draw_text(
            bitmap,
            width,
            height,
            &hex_str,
            box_x + HEX_PADDING + HEX_TEXT_OFFSET_X,
            hex_y + 6,
            &text_color,
        )?;

        Ok(())
    }

    /// Draw a rounded rectangle
    fn draw_rounded_rect(
        &self,
        bitmap: &mut [u8],
        width: usize,
        height: usize,
        x: usize,
        y: usize,
        rect_width: usize,
        rect_height: usize,
        corner_radius: usize,
        fill_color: &Color,
        border_color: &Color,
    ) {
        for py in 0..rect_height {
            for px in 0..rect_width {
                let screen_x = x + px;
                let screen_y = y + py;

                if screen_x >= width || screen_y >= height {
                    continue;
                }

                // Check if in rounded corner
                let in_top_left = px < corner_radius && py < corner_radius;
                let in_top_right = px >= rect_width - corner_radius && py < corner_radius;
                let in_bottom_left = px < corner_radius && py >= rect_height - corner_radius;
                let in_bottom_right =
                    px >= rect_width - corner_radius && py >= rect_height - corner_radius;

                let is_corner = in_top_left || in_top_right || in_bottom_left || in_bottom_right;

                if is_corner {
                    // Calculate distance from corner center
                    let corner_center_x = if px < corner_radius {
                        corner_radius
                    } else {
                        rect_width - corner_radius
                    } as f32;
                    let corner_center_y = if py < corner_radius {
                        corner_radius
                    } else {
                        rect_height - corner_radius
                    } as f32;

                    let dx = px as f32 - corner_center_x;
                    let dy = py as f32 - corner_center_y;
                    let dist = (dx * dx + dy * dy).sqrt();

                    if dist > corner_radius as f32 {
                        continue; // Outside rounded corner
                    }

                    // Draw border at corner edge
                    if dist > (corner_radius - HEX_BORDER_WIDTH) as f32 {
                        let offset = (screen_y * width + screen_x) * 4;
                        if offset + 3 < bitmap.len() {
                            bitmap[offset] = border_color.b;
                            bitmap[offset + 1] = border_color.g;
                            bitmap[offset + 2] = border_color.r;
                            bitmap[offset + 3] = 255;
                        }
                        continue;
                    }
                }

                // Draw border on edges (non-corner)
                let is_border = px < HEX_BORDER_WIDTH
                    || px >= rect_width - HEX_BORDER_WIDTH
                    || py < HEX_BORDER_WIDTH
                    || py >= rect_height - HEX_BORDER_WIDTH;

                let offset = (screen_y * width + screen_x) * 4;
                if offset + 3 < bitmap.len() {
                    if is_border && !is_corner {
                        bitmap[offset] = border_color.b;
                        bitmap[offset + 1] = border_color.g;
                        bitmap[offset + 2] = border_color.r;
                    } else if !is_corner {
                        bitmap[offset] = fill_color.b;
                        bitmap[offset + 1] = fill_color.g;
                        bitmap[offset + 2] = fill_color.r;
                    }
                    bitmap[offset + 3] = 255;
                }
            }
        }
    }

    /// Draw text using Core Graphics
    fn draw_text(
        &self,
        bitmap: &mut [u8],
        width: usize,
        height: usize,
        text: &str,
        x: usize,
        y: usize,
        color: &Color,
    ) -> Result<(), String> {
        unsafe {
            // Create temporary bitmap context for text
            let text_width = text.len() * 10;
            let text_height = 20;

            let color_space = CGColorSpace::create_device_rgb();
            let mut text_buffer = vec![0u8; text_width * text_height * 4];

            let context = CGContext::create_bitmap_context(
                Some(text_buffer.as_mut_ptr() as *mut _),
                text_width,
                text_height,
                8,
                text_width * 4,
                &color_space,
                core_graphics::base::kCGImageAlphaPremultipliedLast,
            );

            // Set text properties
            context.set_rgb_fill_color(
                color.r as f64 / 255.0,
                color.g as f64 / 255.0,
                color.b as f64 / 255.0,
                1.0,
            );

            context.set_text_drawing_mode(CGTextDrawingMode::CGTextFill);

            // Use Core Text to draw
            let font = CTFont::new_from_name(&CFString::from_static_string("SF Pro Text"), 14.0)
                .map_err(|_| "Failed to create font")?;

            let cf_text = CFString::from_static_string(text);
            let mut attr_string = CFMutableAttributedString::new();
            attr_string.replace_str(&cf_text, core_foundation::base::CFRange::init(0, text.len() as isize));

            let font_key = unsafe { kCTFontAttributeName };
            attr_string.set_attribute(
                core_foundation::base::CFRange::init(0, text.len() as isize),
                font_key,
                &font,
            );

            // Simplified text rendering - just draw a basic representation
            // TODO: Implement proper Core Text rendering
            for (i, ch) in text.chars().enumerate() {
                self.draw_char_simple(&mut text_buffer, text_width, text_height, ch, i * 9, 3, color);
            }

            // Copy text buffer to main bitmap
            for ty in 0..text_height {
                for tx in 0..text_width {
                    let src_offset = (ty * text_width + tx) * 4;
                    let dst_x = x + tx;
                    let dst_y = y + ty;

                    if dst_x < width && dst_y < height && src_offset + 3 < text_buffer.len() {
                        let dst_offset = (dst_y * width + dst_x) * 4;
                        if dst_offset + 3 < bitmap.len() {
                            let alpha = text_buffer[src_offset + 3];
                            if alpha > 0 {
                                bitmap[dst_offset] = text_buffer[src_offset];
                                bitmap[dst_offset + 1] = text_buffer[src_offset + 1];
                                bitmap[dst_offset + 2] = text_buffer[src_offset + 2];
                                bitmap[dst_offset + 3] = 255;
                            }
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// Simple character drawing (fallback)
    fn draw_char_simple(
        &self,
        buffer: &mut [u8],
        width: usize,
        _height: usize,
        ch: char,
        x: usize,
        y: usize,
        color: &Color,
    ) {
        // Very basic 5x7 bitmap font for hex characters
        let patterns = get_char_pattern(ch);

        for (row, pattern) in patterns.iter().enumerate() {
            for col in 0..5 {
                if (pattern & (1 << (4 - col))) != 0 {
                    let px = x + col;
                    let py = y + row;
                    if px < width && py < 20 {
                        let offset = (py * width + px) * 4;
                        if offset + 3 < buffer.len() {
                            buffer[offset] = color.b;
                            buffer[offset + 1] = color.g;
                            buffer[offset + 2] = color.r;
                            buffer[offset + 3] = 255;
                        }
                    }
                }
            }
        }
    }
}

/// Get simple 5x7 bitmap pattern for a character
fn get_char_pattern(ch: char) -> [u8; 7] {
    match ch {
        '#' => [0x0A, 0x1F, 0x0A, 0x1F, 0x0A, 0x00, 0x00],
        '0' => [0x0E, 0x11, 0x11, 0x11, 0x0E, 0x00, 0x00],
        '1' => [0x04, 0x0C, 0x04, 0x04, 0x0E, 0x00, 0x00],
        '2' => [0x0E, 0x11, 0x02, 0x04, 0x1F, 0x00, 0x00],
        '3' => [0x0E, 0x11, 0x06, 0x11, 0x0E, 0x00, 0x00],
        '4' => [0x02, 0x06, 0x0A, 0x1F, 0x02, 0x00, 0x00],
        '5' => [0x1F, 0x10, 0x1E, 0x01, 0x1E, 0x00, 0x00],
        '6' => [0x0E, 0x10, 0x1E, 0x11, 0x0E, 0x00, 0x00],
        '7' => [0x1F, 0x01, 0x02, 0x04, 0x04, 0x00, 0x00],
        '8' => [0x0E, 0x11, 0x0E, 0x11, 0x0E, 0x00, 0x00],
        '9' => [0x0E, 0x11, 0x0F, 0x01, 0x0E, 0x00, 0x00],
        'A' | 'a' => [0x0E, 0x11, 0x1F, 0x11, 0x11, 0x00, 0x00],
        'B' | 'b' => [0x1E, 0x11, 0x1E, 0x11, 0x1E, 0x00, 0x00],
        'C' | 'c' => [0x0E, 0x11, 0x10, 0x11, 0x0E, 0x00, 0x00],
        'D' | 'd' => [0x1E, 0x11, 0x11, 0x11, 0x1E, 0x00, 0x00],
        'E' | 'e' => [0x1F, 0x10, 0x1E, 0x10, 0x1F, 0x00, 0x00],
        'F' | 'f' => [0x1F, 0x10, 0x1E, 0x10, 0x10, 0x00, 0x00],
        _ => [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    }
}
