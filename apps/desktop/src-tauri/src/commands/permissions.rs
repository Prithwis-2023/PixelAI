use crate::capture::screenshot::check_screen_recording_permission;
use crate::hooks::app_window::has_accessibility_permission;
use crate::models::telemetry::PermissionState;

pub fn current_permissions() -> PermissionState {
    PermissionState {
        accessibility: has_accessibility_permission(),
        screen_recording: check_screen_recording_permission(),
    }
}

#[tauri::command]
pub fn check_permissions() -> PermissionState {
    current_permissions()
}
