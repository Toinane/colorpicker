// Linux color picker implementation — not yet implemented (see roadmap L1/L2).
//
// This stub exists so the crate compiles on Linux; the ubuntu CI job runs
// `cargo check` against it. See `docs/research/native-picker-macos-linux.md`
// for the planned X11/Wayland implementation.

use crate::picker::{PickedColor, PickerConfig};

pub fn run_picker(
    _config: PickerConfig,
    _on_pick: impl Fn(PickedColor) + Send + 'static,
) -> Option<PickedColor> {
    log::warn!("picker not implemented on Linux yet");
    None
}
