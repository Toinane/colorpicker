//! Minimal i18n for Rust-side strings (tray menu, native dialogs, etc).
//!
//! Reuses the frontend's own locale JSON files as the single source of truth —
//! no separate translation table to keep in sync. Resolution mirrors the
//! frontend's i18next setup: current language, falling back to `en_US`, falling
//! back to the raw key.

use serde_json::Value;
use std::collections::HashMap;
use std::sync::OnceLock;

const FALLBACK_LANGUAGE: &str = "en_US";

/// (language, namespace, raw JSON) for every locale file the frontend ships.
/// `include_str!` embeds the frontend's actual files at compile time, so
/// Rust and JS always read the exact same translations.
const LOCALES: &[(&str, &str, &str)] = &[
    (
        "en_US",
        "common",
        include_str!("../../src/assets/locales/en_US/common.json"),
    ),
    (
        "en_US",
        "settings",
        include_str!("../../src/assets/locales/en_US/settings.json"),
    ),
    (
        "fr_FR",
        "common",
        include_str!("../../src/assets/locales/fr_FR/common.json"),
    ),
    (
        "fr_FR",
        "settings",
        include_str!("../../src/assets/locales/fr_FR/settings.json"),
    ),
];

fn resources() -> &'static HashMap<(&'static str, &'static str), Value> {
    static RESOURCES: OnceLock<HashMap<(&'static str, &'static str), Value>> = OnceLock::new();
    RESOURCES.get_or_init(|| {
        LOCALES
            .iter()
            .map(|(language, namespace, raw)| {
                let value = serde_json::from_str(raw).unwrap_or(Value::Null);
                ((*language, *namespace), value)
            })
            .collect()
    })
}

fn lookup(language: &str, namespace: &str, key: &str) -> Option<String> {
    let value = resources().get(&(language, namespace))?;
    key.split('.')
        .try_fold(value, |acc, part| acc.get(part))
        .and_then(Value::as_str)
        .map(str::to_string)
}

/// Translate a `namespace:dot.separated.key` (namespace defaults to `common`
/// when omitted) for the given language, falling back to `en_US`, then to the
/// key itself if nothing matches.
pub fn t(language: &str, namespace_key: &str) -> String {
    let (namespace, key) = namespace_key
        .split_once(':')
        .unwrap_or(("common", namespace_key));

    lookup(language, namespace, key)
        .or_else(|| lookup(FALLBACK_LANGUAGE, namespace, key))
        .unwrap_or_else(|| namespace_key.to_string())
}
