//! macOS native color picker implementation
//!
//! This module implements a high-performance color picker for macOS using:
//! - Core Graphics (CGDisplayCreateImage) for hardware-accelerated capture
//! - Cocoa (NSWindow + CALayer) for transparent overlay window
//! - Global event monitors for zero-latency input tracking
//! - Direct bitmap manipulation for rendering (shared with Windows)
//! - Small moving window architecture (300x300pt) instead of fullscreen
//! - Pre-computed masks and pre-allocated buffers (shared with Windows)
//! - Frame skipping with hash-based change detection

mod capture;
mod render;
mod text;
mod window;

use super::super::{PickerConfig, PickedColor};

/// Launch the native macOS color picker
///
/// Creates a circular magnifier window that follows the cursor and allows
/// the user to pick a color. Returns `Some(PickedColor)` if a color was picked,
/// or `None` if the user cancelled (Escape key).
pub fn run_picker(config: PickerConfig) -> Option<PickedColor> {
    window::create_and_run(config)
}
