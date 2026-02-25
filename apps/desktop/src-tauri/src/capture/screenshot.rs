use std::fs;
use std::process::{Command, Stdio};

use tauri::AppHandle;

use crate::storage::snapshots::next_snapshot_path;

pub fn capture_to_file(app: &AppHandle) -> Result<(String, String), String> {
    let (capture_ref, path) = next_snapshot_path(app)?;
    let output = Command::new("screencapture")
        .arg("-x")
        .arg(path.as_os_str())
        .output()
        .map_err(|error| format!("failed to launch screencapture: {error}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        let reason = if !stderr.trim().is_empty() {
            stderr.trim().to_string()
        } else if !stdout.trim().is_empty() {
            stdout.trim().to_string()
        } else {
            "unknown_error".to_string()
        };
        return Err(format!("screencapture failed: {reason}"));
    }

    let created = fs::metadata(&path)
        .map(|meta| meta.len() > 0)
        .unwrap_or(false);
    if !created {
        return Err("screencapture produced no image file".to_string());
    }

    Ok((capture_ref, path.display().to_string()))
}

pub fn check_screen_recording_permission() -> bool {
    let test_path = std::env::temp_dir().join("deskops_screen_perm_test.png");
    let success = Command::new("screencapture")
        .arg("-x")
        .arg(test_path.as_os_str())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .map(|output| {
            output.status.success()
                && fs::metadata(&test_path)
                    .map(|meta| meta.len() > 0)
                    .unwrap_or(false)
        })
        .unwrap_or(false);
    let _ = fs::remove_file(test_path);
    success
}
