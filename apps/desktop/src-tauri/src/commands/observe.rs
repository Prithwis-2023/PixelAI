use std::time::Duration;

use chrono::Utc;
use tauri::AppHandle;

use crate::commands::permissions::current_permissions;
use crate::commands::telemetry::flush_queue_internal;
use crate::hooks::app_window::current_context;
use crate::hooks::input_events::ensure_listener_started;
use crate::models::telemetry::{
    ActiveWindowContext, CaptureSnapshotResult, ObservationStats, StartObserveResponse,
    StopObserveResponse,
};
use crate::pipeline::collector::{
    capture_snapshot_pipeline, enqueue_pipeline_error, enqueue_simple_event,
    finalize_current_segment, handle_url_change, handle_window_switch,
};
use crate::pipeline::runtime::{
    backend_base_url, flush_interval_seconds, is_session_running, start_or_get_session,
    stop_session, trailing_segment, update_context,
};
use crate::pipeline::uploader::check_health;
use crate::storage::observations::ObservationStore;

#[tauri::command]
pub async fn start_observe(app: AppHandle) -> Result<StartObserveResponse, String> {
    ensure_capture_permissions(&app)?;

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
    if let Some((context, duration_ms)) = trailing_segment(Utc::now().timestamp_millis()) {
        let _ = finalize_current_segment(&app, &context, duration_ms);
    }

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
    ensure_capture_permissions(&app)?;
    let context = current_context().unwrap_or_else(|_| ActiveWindowContext::default());
    capture_snapshot_pipeline(&app, &context).await
}

#[tauri::command]
pub fn get_observation_stats(app: AppHandle) -> Result<ObservationStats, String> {
    ObservationStore::from_app(&app)?.stats()
}

fn spawn_observe_loop(app: AppHandle, session_id: String) {
    tauri::async_runtime::spawn(async move {
        let mut loop_count = 0u64;
        let flush_every = flush_interval_seconds();
        while is_session_running(&session_id) {
            loop_count += 1;
            match current_context() {
                Ok(context) => {
                    let update = update_context(&context, Utc::now().timestamp_millis());

                    if update.window_changed {
                        handle_window_switch(
                            &app,
                            &context,
                            update.previous_context.as_ref(),
                            update.previous_duration_ms,
                        )
                        .await;
                    }
                    if update.url_changed {
                        handle_url_change(&app).await;
                    }
                }
                Err(_) => enqueue_pipeline_error(&app, "active window polling failed"),
            }

            if loop_count % flush_every == 0 {
                if flush_queue_internal(&app, false).await.is_err() {
                    enqueue_pipeline_error(&app, "periodic flush failed");
                }
            }

            std::thread::sleep(Duration::from_secs(1));
        }
    });
}

fn ensure_capture_permissions(app: &AppHandle) -> Result<(), String> {
    let permissions = current_permissions();
    let mut missing_permissions: Vec<&str> = Vec::new();
    if !permissions.accessibility {
        missing_permissions.push("accessibility");
    }
    if !permissions.screen_recording {
        missing_permissions.push("screenRecording");
    }
    if !missing_permissions.is_empty() {
        let _ = enqueue_simple_event(app, "capture_pipeline_error", "review");
        return Err(format!(
            "missing permissions: {}",
            missing_permissions.join(", ")
        ));
    }
    Ok(())
}
