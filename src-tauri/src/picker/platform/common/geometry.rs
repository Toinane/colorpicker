//! Geometric calculations and pre-computed masks for ultra-fast rendering
//!
//! This module handles all geometric computations that can be pre-calculated
//! at initialization time, eliminating expensive per-frame calculations.

/// Pre-computed circle mask for instant pixel-in-circle testing
///
/// Each boolean indicates whether a pixel at that position (x, y) falls
/// within the circular boundary. This eliminates expensive distance
/// calculations during rendering.
pub struct CircleMask {
    mask: Vec<bool>,
    radius: i32,
}

impl CircleMask {
    /// Create a new circle mask with the given radius and corner radius factor
    ///
    /// # Arguments
    /// * `radius` - Radius of the magnifier
    /// * `corner_factor` - Controls roundness: 1.0 = perfect circle, lower = rounded square
    ///
    /// # Performance
    /// - O(n²) where n = diameter (only called once at startup)
    /// - Creates a lookup table for O(1) shape testing during rendering
    pub fn new(radius: i32, corner_factor: f32) -> Self {
        let diameter = radius * 2;
        let mut mask = vec![false; (diameter * diameter) as usize];
        let radius_sq = (radius as f32 * corner_factor).powi(2);

        for y in 0..diameter {
            for x in 0..diameter {
                let dx = x - radius;
                let dy = y - radius;
                let dist_sq = (dx * dx + dy * dy) as f32;
                
                if dist_sq <= radius_sq {
                    mask[(y * diameter + x) as usize] = true;
                }
            }
        }

        Self { mask, radius }
    }
    
    /// Create a new circle mask with default perfect circle shape
    pub fn new_circle(radius: i32) -> Self {
        Self::new(radius, 1.0)
    }

    /// Test if a point relative to circle center is inside the circle
    ///
    /// # Arguments
    /// * `x` - X coordinate relative to circle center
    /// * `y` - Y coordinate relative to circle center
    ///
    /// # Returns
    /// `true` if the point is inside the circle, `false` otherwise
    #[inline]
    pub fn contains(&self, x: i32, y: i32) -> bool {
        let diameter = self.radius * 2;
        if x < 0 || y < 0 || x >= diameter || y >= diameter {
            return false;
        }
        
        let idx = (y * diameter + x) as usize;
        idx < self.mask.len() && self.mask[idx]
    }
}

/// Pre-computed border mask for instant border pixel testing
///
/// Each boolean indicates whether a pixel at that position is part of
/// the circular border (between inner and outer radius).
pub struct BorderMask {
    mask: Vec<bool>,
    radius: i32,
}

impl BorderMask {
    /// Create a new border mask with the given radius, border width, and corner factor
    ///
    /// # Arguments
    /// * `radius` - Radius of the magnifier
    /// * `border_width` - Width of the border in pixels
    /// * `corner_factor` - Controls roundness: 1.0 = perfect circle, lower = rounded square
    ///
    /// # Performance
    /// - O(n²) where n = diameter (only called once at startup)
    /// - Creates a lookup table for O(1) border testing during rendering
    pub fn new(radius: i32, border_width: i32, corner_factor: f32) -> Self {
        let diameter = radius * 2;
        let mut mask = vec![false; (diameter * diameter) as usize];
        
        let outer_radius_sq = (radius as f32 * corner_factor).powi(2);
        let inner_radius = radius - border_width;
        let inner_radius_sq = (inner_radius as f32 * corner_factor).powi(2);

        for y in 0..diameter {
            for x in 0..diameter {
                let dx = x - radius;
                let dy = y - radius;
                let dist_sq = (dx * dx + dy * dy) as f32;
                
                // Pixel is in border if between inner and outer radius
                if dist_sq <= outer_radius_sq && dist_sq >= inner_radius_sq {
                    mask[(y * diameter + x) as usize] = true;
                }
            }
        }

        Self { mask, radius }
    }
    
    /// Create a new border mask with default perfect circle shape
    pub fn new_circle(radius: i32, border_width: i32) -> Self {
        Self::new(radius, border_width, 1.0)
    }

    /// Test if a point relative to circle center is on the border
    ///
    /// # Arguments
    /// * `x` - X coordinate relative to circle center
    /// * `y` - Y coordinate relative to circle center
    ///
    /// # Returns
    /// `true` if the point is on the border, `false` otherwise
    #[inline]
    pub fn contains(&self, x: i32, y: i32) -> bool {
        let diameter = self.radius * 2;
        if x < 0 || y < 0 || x >= diameter || y >= diameter {
            return false;
        }
        
        let idx = (y * diameter + x) as usize;
        idx < self.mask.len() && self.mask[idx]
    }
}

/// Test if a point is within a rounded rectangle
///
/// Used for drawing rounded corners on UI elements like the hex label box.
/// This is a pure function that can be inlined into hot paths.
///
/// # Arguments
/// * `x`, `y` - Point coordinates relative to rectangle origin
/// * `width`, `height` - Rectangle dimensions
/// * `radius` - Corner radius for rounding
#[inline]
pub fn is_in_rounded_rect(x: i32, y: i32, width: i32, height: i32, radius: i32) -> bool {
    if x < 0 || y < 0 || x >= width || y >= height {
        return false;
    }

    // Check if in corner regions
    if x < radius && y < radius {
        // Top-left corner
        let corner_x = radius - x;
        let corner_y = radius - y;
        (corner_x * corner_x + corner_y * corner_y) <= (radius * radius)
    } else if x >= width - radius && y < radius {
        // Top-right corner
        let corner_x = x - (width - radius - 1);
        let corner_y = radius - y;
        (corner_x * corner_x + corner_y * corner_y) <= (radius * radius)
    } else if x < radius && y >= height - radius {
        // Bottom-left corner
        let corner_x = radius - x;
        let corner_y = y - (height - radius - 1);
        (corner_x * corner_x + corner_y * corner_y) <= (radius * radius)
    } else if x >= width - radius && y >= height - radius {
        // Bottom-right corner
        let corner_x = x - (width - radius - 1);
        let corner_y = y - (height - radius - 1);
        (corner_x * corner_x + corner_y * corner_y) <= (radius * radius)
    } else {
        // Inside the main rectangle (not in any corner)
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_circle_mask() {
        let mask = CircleMask::new_circle(5);
        
        // Center should be inside
        assert!(mask.contains(5, 5));
        
        // Points on the circle should be inside
        assert!(mask.contains(9, 5)); // Right edge (diameter - 1, the last valid index)
        assert!(mask.contains(0, 5));  // Left edge
        
        // Points far outside should not be inside
        assert!(!mask.contains(-1, 5));
        assert!(!mask.contains(11, 5));
    }

    #[test]
    fn test_border_mask() {
        let mask = BorderMask::new_circle(10, 2);
        
        // Center should NOT be on border
        assert!(!mask.contains(10, 10));
        
        // Points on outer edge should be on border
        assert!(mask.contains(19, 10)); // diameter - 1, the last valid index
    }

    #[test]
    fn test_rounded_rect() {
        // Point in center should always be inside
        assert!(is_in_rounded_rect(50, 50, 100, 100, 10));
        
        // Point outside should not be inside
        assert!(!is_in_rounded_rect(-1, 50, 100, 100, 10));
    }
}
