//! Native color picker implementation
//!
//! This module provides a platform-specific color picker that achieves
//! 144fps+ performance through direct hardware access and optimized rendering.
//!
//! Currently supported platforms:
//! - Windows (via Win32 API)
//!
//! # Architecture
//!
//! The picker is organized into platform-specific modules:
//! - `platform::windows` - Windows implementation (window, capture, render)
//!
//! # Performance Characteristics
//!
//! - **Latency**: <7ms from mouse movement to screen update (144fps+)
//! - **CPU Usage**: 0% when stationary, ~2-5% when moving
//! - **Memory**: Pre-allocated buffers, zero per-frame allocations
//! - **Rendering**: Direct bitmap manipulation, bypasses GDI overhead

pub mod platform;

/// RGB color returned by the picker
#[derive(Clone, Copy, Debug, serde::Serialize)]
pub struct PickedColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

/// Configuration for the color picker
#[derive(Clone, Debug)]
pub struct PickerConfig {
    /// Size of the magnifier grid (width/height in pixels)
    pub grid_size: usize,

    /// Whether to show the hex color value
    pub show_hex: bool,

    /// Diameter of the circular magnifier window in pixels
    pub magnifier_size: usize,

    /// Enable 30fps background polling for video/animation color changes
    pub detect_background_changes: bool,

    /// Allow hover events to pass through to underlying windows
    pub allow_hover_through: bool,
}

/// Launch the native color picker
///
/// This function blocks until the user picks a color or cancels.
/// On Windows, it creates a circular magnifier window that follows
/// the cursor with 144fps+ tracking.
///
/// # Returns
/// - `Some(PickedColor)` if a color was picked
/// - `None` if the user cancelled (Escape key)
pub fn launch_picker(config: PickerConfig) -> Option<PickedColor> {
    #[cfg(target_os = "windows")]
    {
        platform::windows::run_picker(config)
    }

    #[cfg(not(target_os = "windows"))]
    {
        eprintln!("Picker not implemented for this platform");
        None
    }
}
