//! Platform-agnostic code shared between Windows and macOS
//!
//! This module contains pure Rust implementations that work identically
//! on all platforms. No platform-specific APIs, just math and algorithms.

pub mod geometry;
pub mod primitives;
