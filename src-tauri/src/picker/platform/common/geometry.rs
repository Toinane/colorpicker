//! Geometric calculations and pre-computed masks for ultra-fast rendering
//!
//! This module handles all geometric computations that can be pre-calculated
//! at initialization time, eliminating expensive per-frame calculations.

/// Which corner of the magnifier's bounding square should be squared off
/// (filled solid, sharp 90° angle) instead of rounded — used by Cursor-aside
/// mode to visually point the lens back at the cursor it's offset from. The
/// other three corners stay circular.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SquaredCorner {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
}

impl SquaredCorner {
    /// Whether (dx, dy), relative to the shape's center, falls in this
    /// corner's quadrant of the bounding square.
    #[inline]
    fn in_quadrant(self, dx: i32, dy: i32) -> bool {
        match self {
            SquaredCorner::TopLeft => dx <= 0 && dy <= 0,
            SquaredCorner::TopRight => dx >= 0 && dy <= 0,
            SquaredCorner::BottomLeft => dx <= 0 && dy >= 0,
            SquaredCorner::BottomRight => dx >= 0 && dy >= 0,
        }
    }

    /// Signed unit vector (x, y) pointing from center toward this corner's tip.
    #[inline]
    fn direction(self) -> (i32, i32) {
        match self {
            SquaredCorner::TopLeft => (-1, -1),
            SquaredCorner::TopRight => (1, -1),
            SquaredCorner::BottomLeft => (-1, 1),
            SquaredCorner::BottomRight => (1, 1),
        }
    }
}

/// How much of the squared corner's tip gets rounded off instead of staying
/// a sharp 90° point — a small fillet so it doesn't look like a knife edge.
pub const SQUARED_CORNER_FILLET: i32 = 12;

/// Single source of truth for the "circle with one squared, tip-filleted
/// corner" shape, at a given `radius`, shared by `CircleMask::new_squared`
/// and `BorderMask::new_squared` (as outer-shape-minus-inner-shape) so the
/// two can never disagree with each other by a pixel at the seam between the
/// straight edges and the circular arcs.
///
/// Outside `corner`'s quadrant: an ordinary circle. Inside it: filled solid
/// to the bounding square's edges, except right at the tip, where a quarter
/// circle of radius `fillet` rounds it off.
#[inline]
fn in_squared_shape(dx: i32, dy: i32, radius: i32, corner: SquaredCorner, fillet: i32) -> bool {
    if !corner.in_quadrant(dx, dy) {
        return dx * dx + dy * dy <= radius * radius;
    }

    let (sx, sy) = corner.direction();
    // Distance from the tip along each axis: 0 right at the tip, growing to
    // `radius` back at the center.
    let from_tip_x = radius - sx * dx;
    let from_tip_y = radius - sy * dy;

    if from_tip_x < 0 || from_tip_y < 0 {
        // Beyond this radius's bounding square on at least one axis. Matters
        // when this is called with a shrunk `radius` (inner shape, for
        // border masks) against (dx, dy) that were only ever bounded by the
        // larger outer radius.
        return false;
    }

    if from_tip_x < fillet && from_tip_y < fillet {
        // Near the tip: round it off with a small quarter-circle centered
        // `fillet` away from the tip on both axes.
        let rx = from_tip_x - fillet;
        let ry = from_tip_y - fillet;
        rx * rx + ry * ry <= fillet * fillet
    } else {
        // Anywhere else in the quadrant: filled straight out to the edge.
        true
    }
}

/// Continuous counterpart to `in_squared_shape`: how far (dx, dy) sits past
/// the shape's boundary (0 if inside or on it). Used by `ShadowMask` so the
/// shadow's falloff follows the exact same silhouette the fill/border masks
/// use — including the tip's fillet arc — instead of a plain flat-edge
/// distance that leaves a shadowless notch where the corner gets rounded off.
#[inline]
fn squared_dist_beyond(dx: i32, dy: i32, radius: i32, corner: SquaredCorner, fillet: i32) -> f32 {
    if !corner.in_quadrant(dx, dy) {
        let dist = ((dx * dx + dy * dy) as f32).sqrt();
        return (dist - radius as f32).max(0.0);
    }

    let (sx, sy) = corner.direction();
    let from_tip_x = radius - sx * dx;
    let from_tip_y = radius - sy * dy;

    if from_tip_x < fillet && from_tip_y < fillet {
        let rx = (from_tip_x - fillet) as f32;
        let ry = (from_tip_y - fillet) as f32;
        ((rx * rx + ry * ry).sqrt() - fillet as f32).max(0.0)
    } else {
        let max_abs = dx.abs().max(dy.abs());
        (max_abs - radius).max(0) as f32
    }
}

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

    /// Create a circle with one corner of its bounding square squared off
    /// (tip rounded by `SQUARED_CORNER_FILLET`): that quadrant is filled
    /// solid out to the bounding square's edges instead of clipped to the
    /// circular radius. See `SquaredCorner`.
    pub fn new_squared(radius: i32, corner: SquaredCorner) -> Self {
        let diameter = radius * 2;
        let mut mask = vec![false; (diameter * diameter) as usize];

        for y in 0..diameter {
            for x in 0..diameter {
                let dx = x - radius;
                let dy = y - radius;

                if in_squared_shape(dx, dy, radius, corner, SQUARED_CORNER_FILLET) {
                    mask[(y * diameter + x) as usize] = true;
                }
            }
        }

        Self { mask, radius }
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

    /// Border for a circle with one squared corner (see `CircleMask::new_squared`).
    /// Computed as outer-shape-minus-inner-shape using the exact same shape
    /// function `CircleMask::new_squared` fills with, so the border can never
    /// end up a pixel off from the fill it's supposed to trace.
    pub fn new_squared(radius: i32, border_width: i32, corner: SquaredCorner) -> Self {
        let diameter = radius * 2;
        let mut mask = vec![false; (diameter * diameter) as usize];
        let inner_radius = radius - border_width;

        for y in 0..diameter {
            for x in 0..diameter {
                let dx = x - radius;
                let dy = y - radius;

                let is_border = in_squared_shape(dx, dy, radius, corner, SQUARED_CORNER_FILLET)
                    && !in_squared_shape(dx, dy, inner_radius, corner, SQUARED_CORNER_FILLET);

                if is_border {
                    mask[(y * diameter + x) as usize] = true;
                }
            }
        }

        Self { mask, radius }
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

/// Pre-computed radial falloff mask for the magnifier's outer drop shadow.
///
/// Stores an alpha value (0-255) per pixel position in a square region
/// centered on the magnifier, covering everything from the circle's edge
/// out to `margin` pixels beyond it. Pixels inside the circle itself get a
/// nonzero alpha too (whatever the falloff curve gives at that distance
/// would be > the max, so it's clamped to 0 — see `new`), but that's moot
/// either way: the shadow is drawn first and the circle/grid content is
/// drawn over it afterward, so only the ring outside the circle ever stays
/// visible.
pub struct ShadowMask {
    mask: Vec<u8>,
    half_size: i32,
}

impl ShadowMask {
    /// `radius` is the magnifier circle's radius; `margin` is how far the
    /// shadow extends beyond it; `max_alpha` is the alpha right at the
    /// circle's edge, fading (eased) to 0 by `radius + margin`.
    pub fn new(radius: i32, margin: i32, max_alpha: u8) -> Self {
        let half_size = radius + margin;
        let size = half_size * 2;
        let mut mask = vec![0u8; (size * size) as usize];

        let radius_f = radius as f32;
        let margin_f = margin.max(1) as f32;

        for y in 0..size {
            for x in 0..size {
                let dx = (x - half_size) as f32;
                let dy = (y - half_size) as f32;
                let dist = (dx * dx + dy * dy).sqrt();

                if dist > radius_f {
                    let t = ((dist - radius_f) / margin_f).clamp(0.0, 1.0);
                     // Ease-out: fades faster near the edge, softer at the tail.
                    let falloff = (1.0 - t) * (1.0 - t);
                    mask[(y * size + x) as usize] = (falloff * max_alpha as f32).round() as u8;
                }
            }
        }

        Self { mask, half_size }
    }

    /// Same falloff as `new`, but shaped to match a squared-corner shape
    /// (see `CircleMask::new_squared`): in `corner`'s quadrant the shadow
    /// fades based on distance past the nearest straight edge of the
    /// bounding square instead of radial distance from the center, so the
    /// soft glow hugs the flat edges instead of bulging out in a circular
    /// arc that no longer matches the lens's silhouette there.
    pub fn new_squared(radius: i32, margin: i32, max_alpha: u8, corner: SquaredCorner) -> Self {
        let half_size = radius + margin;
        let size = half_size * 2;
        let mut mask = vec![0u8; (size * size) as usize];

        let margin_f = margin.max(1) as f32;

        for y in 0..size {
            for x in 0..size {
                let dx = x - half_size;
                let dy = y - half_size;

                let dist_beyond =
                    squared_dist_beyond(dx, dy, radius, corner, SQUARED_CORNER_FILLET);

                if dist_beyond > 0.0 {
                    let t = (dist_beyond / margin_f).clamp(0.0, 1.0);
                    // Ease-out: fades faster near the edge, softer at the tail.
                    let falloff = (1.0 - t) * (1.0 - t);
                    mask[(y * size + x) as usize] = (falloff * max_alpha as f32).round() as u8;
                }
            }
        }

        Self { mask, half_size }
    }

    /// Side length of the shadow's square bounding box.
    #[inline]
    pub fn size(&self) -> i32 {
        self.half_size * 2
    }

    /// Alpha at a position relative to the top-left of the shadow's bounding
    /// square (not relative to its center — matches how it's blitted).
    #[inline]
    pub fn alpha_at(&self, x: i32, y: i32) -> u8 {
        let size = self.half_size * 2;
        if x < 0 || y < 0 || x >= size || y >= size {
            return 0;
        }

        let idx = (y * size + x) as usize;
        if idx < self.mask.len() {
            self.mask[idx]
        } else {
            0
        }
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
    fn test_circle_mask_squared_corner() {
        // Comfortably bigger than SQUARED_CORNER_FILLET so "away from the
        // tip" test points aren't themselves inside the fillet zone.
        let radius = SQUARED_CORNER_FILLET * 4;
        let mask = CircleMask::new_squared(radius, SquaredCorner::TopLeft);

        // Along the squared quadrant's straight (left) edge, well outside
        // the circle's radius but away from the tip, is filled.
        assert!(mask.contains(0, radius));

        // The very tip (literal corner of the bounding square) is rounded
        // off by the fillet, not a sharp point.
        assert!(!mask.contains(0, 0));

        // The other three corners stay clipped to the circle, same as an
        // unmodified circle mask would be.
        let plain = CircleMask::new_circle(radius);
        let diameter = radius * 2;
        assert_eq!(
            mask.contains(diameter - 1, 0),
            plain.contains(diameter - 1, 0)
        ); // top-right corner
        assert!(!mask.contains(diameter - 1, 0));

        // Center is unaffected either way.
        assert!(mask.contains(radius, radius));
    }

    #[test]
    fn test_border_mask_squared_corner() {
        let radius = SQUARED_CORNER_FILLET * 4;
        let border_width = 2;
        let mask = BorderMask::new_squared(radius, border_width, SquaredCorner::TopLeft);

        // Right at the squared corner's straight edge (away from the
        // rounded tip), within border_width of the bounding square's edge.
        assert!(mask.contains(0, radius));

        // Deep inside the squared quadrant (not near either edge) is not
        // border — it's part of the filled interior instead.
        assert!(!mask.contains(radius - border_width - 3, radius - border_width - 3));

        // The non-squared quadrants keep an ordinary circular ring.
        let plain = BorderMask::new_circle(radius, border_width);
        let diameter = radius * 2;
        assert_eq!(
            mask.contains(diameter - 1, diameter - 1),
            plain.contains(diameter - 1, diameter - 1)
        ); // bottom-right corner
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

    #[test]
    fn test_shadow_mask() {
        let mask = ShadowMask::new(10, 5, 100);

        // Center (well inside the circle) has no shadow
        assert_eq!(mask.alpha_at(15, 15), 0);

        // Just outside the circle's edge: still a visible amount of shadow
        assert!(mask.alpha_at(15, 26) > 50);

        // At the outer edge of the margin: alpha has fully faded out
        assert_eq!(mask.alpha_at(15, 0), 0);

        // Out of bounds is always 0, never panics
        assert_eq!(mask.alpha_at(-1, 0), 0);
        assert_eq!(mask.alpha_at(100, 100), 0);
    }
}
