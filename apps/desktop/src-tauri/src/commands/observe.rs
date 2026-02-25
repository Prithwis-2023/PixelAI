use std::time::Duration;

use tauri::AppHandle;

use crate::commands::permissions::current_permissions;
use crate::commands::telemetry::flush_queue_internal;
use crate::hooks::app_window::current_context;
use crate::hooks::input_events::ensure_listener_started;
use crate::models::telemetry::{
    ActiveWindowContext, CaptureSnapshotResult, StartObserveResponse, StopObserveResponse,
};
use crate::pipeline::collector::{
    capture_snapshot_pipeline, enqueue_pipeline_error, enqueue_simple_event, handle_url_change,
    handle_window_switch,
};
use crate::pipeline::runtime::{
    backend_base_url, is_session_running, mark_context, start_or_get_session, stop_session,
};
use crate::pipeline::uploader::check_health;

#[tauri::command]
pub async fn start_observe(app: AppHandle) -> Result<StartObserveResponse, String> {
    let permissions = current_permissions();
    let mut missing_permissions: Vec<&str> = Vec::new();
    if !permissions.accessibility {
        missing_permissions.push("accessibility");
    }
    if !permissions.screen_recording {
        missing_permissions.push("screenRecording");
    }
    if !missing_permissions.is_empty() {
        let _ = enqueue_simple_event(&app, "capture_pipeline_error", "review");
        return Err(format!(
            "missing permissions: {}",
            missing_permissions.join(", ")
        ));
    }

    let base_url = backend_base_url();
    let _ = check_health(&base_url).await;

    let (session_id, is_new) = start_or_get_session()?;
    ensure_listener_started();

    if is_new {
        enqueue_simple_event(&app, "observe_session_start", "success")?;
        spawn_observe_loop(app.clone(), session_id.clone());
    }

    Ok(StartObserveResponse { session_id })
}

#[tauri::command]
pub async fn stop_observe(app: AppHandle) -> Result<StopObserveResponse, String> {
    let stopped = match stop_session()? {
        Some(_) => {
            enqueue_simple_event(&app, "observe_session_stop", "success")?;
            true
        }
        None => false,
    };

    Ok(StopObserveResponse { stopped })
}

#[tauri::command]
pub async fn capture_snapshot(app: AppHandle) -> Result<CaptureSnapshotResult, String> {
    let context = current_context().unwrap_or_else(|_| ActiveWindowContext::default());
    capture_snapshot_pipeline(&app, &context).await
}

fn spawn_observe_loop(app: AppHandle, session_id: String) {
    tauri::async_runtime::spawn(async move {
        let mut loop_count = 0u64;
        while is_session_running(&session_id) {
            loop_count += 1;
            match current_context() {
                Ok(context) => {
                    let signature = format!("{}::{}", context.app_name, context.window_title);
                    let (window_changed, url_changed) =
                        mark_context(&signature, context.domain.as_deref());

                    if window_changed {
                        handle_window_switch(&app, &context).await;
                    }
                    if url_changed {
                        handle_url_change(&app).await;
                    }
                }
                Err(_) => enqueue_pipeline_error(&app, "active window polling failed"),
            }

            if loop_count % 15 == 0 {
                if flush_queue_internal(&app, false).await.is_err() {
                    enqueue_pipeline_error(&app, "periodic flush failed");
                }
            }

            std::thread::sleep(Duration::from_secs(1));
        }
    });
}
