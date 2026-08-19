use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let git_commit = Command::new("git")
        .args(["rev-parse", "--short=8", "HEAD"])
        .output()
        .ok()
        .filter(|output| output.status.success())
        .and_then(|output| String::from_utf8(output.stdout).ok())
        .map(|commit| commit.trim().to_owned())
        .filter(|commit| !commit.is_empty())
        .unwrap_or_else(|| "unknown".to_owned());
    let compiled_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time must be after the Unix epoch")
        .as_millis();

    println!("cargo:rustc-env=GIT_COMMIT={git_commit}");
    println!("cargo:rustc-env=COMPILED_AT={compiled_at}");
    println!("cargo:rerun-if-changed=.git/HEAD");

    tauri_build::build()
}
