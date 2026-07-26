//! Color types and utilities for the picker
//!
//! This module provides a unified color representation and utilities
//! for color manipulation, conversion, and analysis.

/// RGB color with 8-bit precision per channel
#[derive(Clone, Copy, Debug, PartialEq, Eq, serde::Serialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Color {
    /// Create a new color from RGB components
    #[inline]
    pub const fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b }
    }

    /// Convert to BGRA format (Windows native format)
    #[inline]
    pub const fn to_bgra(self) -> u32 {
        (255u32 << 24) | ((self.r as u32) << 16) | ((self.g as u32) << 8) | (self.b as u32)
    }

    /// Convert to hex string (e.g., "#FF0000")
    #[inline]
    pub fn to_hex(self) -> String {
        format!("#{:02X}{:02X}{:02X}", self.r, self.g, self.b)
    }

    /// Calculate relative luminance using ITU-R BT.709 coefficients
    ///
    /// Returns a value between 0.0 (black) and 1.0 (white).
    /// Used for determining text contrast and adaptive UI colors.
    #[inline]
    pub fn luminance(self) -> f32 {
        const R_COEFF: f32 = 0.2126;
        const G_COEFF: f32 = 0.7152;
        const B_COEFF: f32 = 0.0722;

        let r = self.r as f32 / 255.0;
        let g = self.g as f32 / 255.0;
        let b = self.b as f32 / 255.0;

        R_COEFF * r + G_COEFF * g + B_COEFF * b
    }

    /// Check if color is perceptually light
    ///
    /// Returns true for light colors that need dark text/borders.
    /// Uses a threshold of 0.8 (80% luminance) for high contrast.
    #[inline]
    pub fn is_light(self) -> bool {
        const LIGHT_THRESHOLD: f32 = 0.8;
        self.luminance() > LIGHT_THRESHOLD
    }

    /// Get adaptive foreground color (for text/borders)
    ///
    /// Returns a dark color for light backgrounds, light color for dark backgrounds.
    /// Uses the same luminance threshold as is_light() for consistency.
    #[inline]
    pub fn adaptive_foreground(self) -> Self {
        const DARK: Color = Color::new(0x1d, 0x1f, 0x23);
        const LIGHT: Color = Color::new(0xff, 0xff, 0xff);

        // Use proper luminance calculation for consistency with is_light()
        const LIGHT_THRESHOLD: f32 = 0.8;
        if self.luminance() > LIGHT_THRESHOLD {
            DARK
        } else {
            LIGHT
        }
    }

    /// Get adaptive foreground color as BGRA (optimized for direct writing)
    /// Uses the same luminance threshold as is_light() for consistency.
    #[inline]
    pub fn adaptive_foreground_bgra(self) -> u32 {
        const LIGHT_THRESHOLD: f32 = 0.8;
        if self.luminance() > LIGHT_THRESHOLD {
            0xff1d1f23_u32  // Dark (BGRA format)
        } else {
            0xFFFFFFFF_u32  // Light
        }
    }
}

impl From<Color> for (u8, u8, u8) {
    #[inline]
    fn from(color: Color) -> (u8, u8, u8) {
        (color.r, color.g, color.b)
    }
}

impl From<(u8, u8, u8)> for Color {
    #[inline]
    fn from((r, g, b): (u8, u8, u8)) -> Self {
        Self::new(r, g, b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_luminance() {
        // Black should have 0 luminance
        assert_eq!(Color::new(0, 0, 0).luminance(), 0.0);
        
        // White should have 1.0 luminance
        assert_eq!(Color::new(255, 255, 255).luminance(), 1.0);
        
        // Green should have higher luminance than red (per BT.709)
        assert!(Color::new(0, 255, 0).luminance() > Color::new(255, 0, 0).luminance());
    }

    #[test]
    fn test_is_light() {
        assert!(!Color::new(0, 0, 0).is_light());     // Black is dark
        assert!(Color::new(255, 255, 255).is_light()); // White is light
    }

    #[test]
    fn test_hex_conversion() {
        assert_eq!(Color::new(255, 0, 0).to_hex(), "#FF0000");
        assert_eq!(Color::new(0, 255, 0).to_hex(), "#00FF00");
        assert_eq!(Color::new(0, 0, 255).to_hex(), "#0000FF");
    }
}
