#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod capture {
    pub mod ocr;
    pub mod redaction;
    pub mod screenshot;
}
mod commands {
    pub mod observe;
    pub mod permissions;
    pub mod telemetry;
}
mod hooks {
    pub mod app_window;
    pub mod input_events;
}
mod models {
    pub mod telemetry;
}
mod pipeline {
    pub mod collector;
    pub mod normalizer;
    pub mod runtime;
    pub mod uploader;
}
mod storage {
    pub mod queue;
    pub mod snapshots;
}

use commands::observe::{capture_snapshot, start_observe, stop_observe};
use commands::permissions::check_permissions;
use commands::telemetry::flush_telemetry_queue;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_observe,
            stop_observe,
            check_permissions,
            capture_snapshot,
            flush_telemetry_queue
        ])
        .run(tauri::generate_context!())
        .expect("failed to run DeskOps desktop app");
}
