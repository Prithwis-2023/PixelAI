use std::fs;
use std::path::PathBuf;

use chrono::Utc;
use tauri::AppHandle;
use uuid::Uuid;

pub fn next_snapshot_path(app: &AppHandle) -> Result<(String, PathBuf), String> {
    let base_dir = app
        .path_resolver()
        .app_local_data_dir()
        .unwrap_or_else(|| std::env::temp_dir().join("deskops-desktop"));
    let snapshots_dir = base_dir.join("snapshots");
    fs::create_dir_all(&snapshots_dir)
        .map_err(|error| format!("failed to create snapshots directory: {error}"))?;

    let capture_ref = format!(
        "cap_{}_{}",
        Utc::now().format("%Y%m%d%H%M%S"),
        &Uuid::new_v4().to_string()[..8]
    );
    let path = snapshots_dir.join(format!("{capture_ref}.png"));
    Ok((capture_ref, path))
}
