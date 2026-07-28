//! Portable-build data directory.
//!
//! Whether this is a portable build is decided at compile time by the
//! `portable` Cargo feature (see Cargo.toml) — never at runtime, and never by
//! anything the user can trigger (no marker file, no folder sniffing). A
//! normal build always returns `None` here and every store keeps using the
//! OS's standard per-user app data directories; a portable build always
//! returns `Some(<exe_dir>/data)`, created on first access if missing.

#[cfg(feature = "portable")]
use std::path::{Path, PathBuf};
#[cfg(feature = "portable")]
use std::sync::OnceLock;

/// The portable data directory, or `None` in a normal (non-portable) build.
#[cfg(feature = "portable")]
pub fn data_dir() -> Option<&'static Path> {
    static DIR: OnceLock<PathBuf> = OnceLock::new();
    Some(DIR.get_or_init(|| {
        let exe = std::env::current_exe().expect("failed to resolve current executable path");
        let exe_dir = exe
            .parent()
            .expect("executable path has no parent directory");
        let dir = exe_dir.join("data");
        std::fs::create_dir_all(&dir).expect("failed to create portable data directory");
        dir
    }))
}

#[cfg(not(feature = "portable"))]
pub fn data_dir() -> Option<&'static std::path::Path> {
    None
}

/// Resolve a store/log file name to an absolute path inside the portable data
/// directory, or leave it untouched (resolved by tauri's usual app-data-dir
/// logic) in a normal build.
pub fn resolve_filename(filename: &str) -> String {
    match data_dir() {
        Some(dir) => dir.join(filename).to_string_lossy().into_owned(),
        None => filename.to_string(),
    }
}
