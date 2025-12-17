// macOS Color Picker Implementation
// Entry point for the platform-specific color picker using modern macOS APIs:
// - ScreenCaptureKit for high-performance screen capture
// - Metal for GPU-accelerated rendering (144+ FPS)
// - Cocoa (NSWindow, NSEvent) for window management and input handling

mod capture;
mod render;
mod window;

use crate::picker::{PickedColor, PickerConfig};

/// Launch the macOS color picker
///
/// This is the main entry point for the macOS picker implementation.
/// It creates a floating, transparent magnifier window that follows the cursor,
/// captures screen pixels using ScreenCaptureKit, and renders using Metal.
///
/// Returns Some(PickedColor) if user picks a color, None if cancelled.
pub fn run_picker(config: PickerConfig) -> Option<PickedColor> {
    log::info!("Launching macOS color picker (ScreenCaptureKit + Metal)");
    log::debug!("Config: grid_size={}, magnifier_size={}, show_hex={}, detect_background_changes={}, allow_hover_through={}",
        config.grid_size,
        config.magnifier_size,
        config.show_hex,
        config.detect_background_changes,
        config.allow_hover_through
    );

    // Delegate to window module which orchestrates everything
    match window::create_and_run(config) {
        Ok(result) => {
            log::info!("Picker completed successfully");
            result
        }
        Err(e) => {
            log::error!("Picker failed: {}", e);
            None
        }
    }
}
