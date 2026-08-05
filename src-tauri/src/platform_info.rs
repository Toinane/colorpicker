//! Detailed OS info for the frontend (About settings page), exposed via the
//! `get_platform_info` command. Uses `os_info` rather than hand-rolled
//! per-platform version detection - it already handles the fiddly bits (e.g.
//! Windows 10 vs 11 both report major.minor 10.0, distinguished only by
//! build number; `os_info` resolves that to a proper "Windows 11" edition
//! via the registry).

use os_info::Type;
use serde::Serialize;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PlatformInfo {
    /// Broad OS family, e.g. "Windows", "Mac OS", "Ubuntu".
    os_type: String,
    /// Coarse platform bucket for feature/UI branching - "windows", "macos",
    /// "linux", or "other". `os_type` has a distinct variant per Linux
    /// distro (Ubuntu, Fedora, Arch, ...) rather than a generic "Linux" one,
    /// so this classification has to happen here rather than by
    /// string-matching `os_type` on the frontend.
    family: &'static str,
    /// Raw OS version, e.g. "10.0.26100" (Windows), "14.4.1" (macOS).
    version: String,
    /// Marketing edition where available, e.g. "Windows 11 Pro".
    edition: Option<String>,
    /// e.g. "64-bit", "32-bit".
    bitness: String,
    /// e.g. "x86_64", "aarch64".
    architecture: Option<String>,
    /// Human-readable one-liner, e.g.
    /// "Windows 11 Pro 64-bit (10.0.26100, x86_64)". `bitness` alone doesn't
    /// distinguish x86-64 from ARM64 (it's word size only, not CPU family),
    /// so the architecture is included separately here.
    label: String,
}

/// Classifies an `os_info::Type` into a coarse platform family. Explicit for
/// Windows/macOS and the handful of non-Linux *nix variants (BSDs and
/// friends); everything else falls through to "linux" since the enum is
/// mostly individual Linux distros and new ones os_info adds later should
/// still land there.
fn classify_family(os_type: Type) -> &'static str {
    match os_type {
        Type::Windows => "windows",
        Type::Macos | Type::Ios => "macos",
        Type::FreeBSD
        | Type::NetBSD
        | Type::OpenBSD
        | Type::DragonFly
        | Type::HardenedBSD
        | Type::MidnightBSD
        | Type::Illumos
        | Type::Redox
        | Type::Hurd
        | Type::AIX
        | Type::Cygwin
        | Type::Emscripten
        | Type::Unknown => "other",
        _ => "linux",
    }
}

#[tauri::command]
pub fn get_platform_info() -> PlatformInfo {
    let info = os_info::get();

    let os_type_enum = info.os_type();
    let os_type = os_type_enum.to_string();
    let family = classify_family(os_type_enum);
    let version = info.version().to_string();
    let edition = info.edition().map(str::to_string);
    let bitness = info.bitness().to_string();
    let architecture = info.architecture().map(str::to_string);

    let name = edition.as_deref().unwrap_or(&os_type);
    let arch_suffix = architecture
        .as_deref()
        .map(|arch| format!(", {arch}"))
        .unwrap_or_default();
    let label = format!("{name} {bitness} ({version}{arch_suffix})");

    PlatformInfo {
        os_type,
        family,
        version,
        edition,
        bitness,
        architecture,
        label,
    }
}
