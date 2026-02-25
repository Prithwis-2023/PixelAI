use std::path::Path;

use chrono::Utc;
use tauri::AppHandle;

use crate::capture::ocr::summarize_image;
use crate::capture::redaction::redact_sensitive;
use crate::capture::screenshot::capture_to_file;
use crate::hooks::input_events::consume_summary;
use crate::models::telemetry::{ActiveWindowContext, CaptureSnapshotResult, TelemetryEventPayload};
use crate::pipeline::normalizer::concise_text;
use crate::pipeline::runtime::capture_cooldown_ready;
use crate::storage::queue::QueueStore;

pub fn enqueue_event(app: &AppHandle, event: TelemetryEventPayload) -> Result<(), String> {
    QueueStore::from_app(app)?.enqueue(event)
}

pub fn enqueue_simple_event(app: &AppHandle, category: &str, result: &str) -> Result<(), String> {
    enqueue_event(app, TelemetryEventPayload::new(category, result))
}

pub fn enqueue_pipeline_error(app: &AppHandle, _message: &str) {
    let _ = enqueue_simple_event(app, "capture_pipeline_error", "failed");
}

pub async fn handle_window_switch(app: &AppHandle, context: &ActiveWindowContext) {
    let summary = consume_summary();
    let result = if summary.paste_count > 0 || (summary.click_count + summary.scroll_count) > 250 {
        "review"
    } else {
        "success"
    };
    let _ = enqueue_simple_event(app, "window_switch", result);
    let now = Utc::now().timestamp_millis();
    if capture_cooldown_ready(now, 5_000) {
        if capture_snapshot_pipeline(app, context).await.is_err() {
            enqueue_pipeline_error(app, "capture pipeline failed on window switch");
        }
    }
}

pub async fn handle_url_change(app: &AppHandle) {
    let _ = enqueue_simple_event(app, "url_change", "success");
}

pub async fn capture_snapshot_pipeline(
    app: &AppHandle,
    _context: &ActiveWindowContext,
) -> Result<CaptureSnapshotResult, String> {
    let (capture_ref, path) = capture_to_file(app)?;
    enqueue_simple_event(app, "screenshot_captured", "success")?;

    let ocr_output = summarize_image(Path::new(&path));
    let redacted = redact_sensitive(&ocr_output.summary);
    let ocr_summary = concise_text(&redacted, 180);

    let ocr_result = if ocr_output.success {
        "success"
    } else {
        "review"
    };
    enqueue_simple_event(app, "ocr_processed", ocr_result)?;

    Ok(CaptureSnapshotResult {
        capture_ref,
        path,
        ocr_summary,
    })
}
