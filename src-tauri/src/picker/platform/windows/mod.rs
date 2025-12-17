//! Windows native color picker implementation
//!
//! This module implements a high-performance (144fps+) color picker for Windows using:
//! - Direct bitmap manipulation for rendering (bypasses GDI bottlenecks)
//! - Low-level mouse/keyboard hooks for instant input
//! - Small moving window architecture (300x300) instead of fullscreen
//! - Pre-computed masks and pre-allocated buffers
//! - Frame skipping with hash-based change detection

mod capture;
mod geometry;
mod primitives;
mod render;
mod window;

use super::super::{PickerConfig, PickedColor};
use std::sync::{Arc, Mutex};

/// Launch the native Windows color picker
///
/// Creates a circular magnifier window that follows the cursor and allows
/// the user to pick a color. Returns `Some(PickedColor)` if a color was picked,
/// or `None` if the user cancelled (Escape key).
pub fn run_picker(config: PickerConfig) -> Option<PickedColor> {
    let result = Arc::new(Mutex::new(None));
    let result_clone = Arc::clone(&result);

    match window::create_and_run(config, result_clone) {
        Ok(_) => *result.lock().unwrap(),
        Err(e) => {
            eprintln!("Picker error: {}", e);
            None
        }
    }
}
