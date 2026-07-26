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
//! The picker is organized into focused modules:
//! - `color` - Unified color type and utilities
//! - `platform::windows` - Windows implementation (window, capture, render, geometry, primitives)
//!
//! # Performance Characteristics
//!
//! - **Latency**: <7ms from mouse movement to screen update (144fps+)
//! - **CPU Usage**: 0% when stationary, ~2-5% when moving
//! - **Memory**: Pre-allocated buffers, zero per-frame allocations
//! - **Rendering**: Direct bitmap manipulation, bypasses GDI overhead

pub mod color;
pub mod platform;

pub use color::Color as PickedColor;

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

/// Guards against two picker sessions running concurrently: hotkey, tray, and
/// button triggers can race and would otherwise spawn two overlapping
/// sessions (two hooks, two topmost windows).
static PICKER_ACTIVE: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// Launch the native color picker
///
/// Creates a circular magnifier window that follows the cursor with
/// high-performance tracking (144fps+ on Windows), then invokes `on_done`
/// with the result once the session ends. On Windows this call blocks the
/// calling thread for the duration of the session (own Win32 message loop)
/// and `on_done` runs synchronously just before returning; callers that
/// need this off the calling thread should run it via `spawn_blocking`.
///
/// If a picker session is already running, this call is a no-op and
/// `on_done(None)` is invoked immediately.
///
/// - `on_done(Some(PickedColor))` if a color was picked
/// - `on_done(None)` if the user cancelled (Escape key) or a session was already active
pub fn launch_picker(config: PickerConfig, on_done: impl FnOnce(Option<PickedColor>) + Send + 'static) {
    if PICKER_ACTIVE.swap(true, std::sync::atomic::Ordering::AcqRel) {
        log::warn!("Picker already active, ignoring launch request");
        on_done(None);
        return;
    }

    let finish = move |result| {
        PICKER_ACTIVE.store(false, std::sync::atomic::Ordering::Release);
        on_done(result);
    };

    #[cfg(target_os = "windows")]
    {
        finish(platform::windows::run_picker(config));
    }

    #[cfg(target_os = "macos")]
    {
        finish(platform::macos::run_picker(config));
    }

    #[cfg(target_os = "linux")]
    {
        finish(platform::linux::run_picker(config));
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        eprintln!("Picker not implemented for this platform");
        finish(None);
    }
}
