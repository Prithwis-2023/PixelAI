use std::path::Path;

use chrono::{Duration as ChronoDuration, Utc};
use tauri::AppHandle;
use uuid::Uuid;

use crate::capture::ocr::{summarize_image, OcrOutput};
use crate::capture::redaction::redact_sensitive;
use crate::capture::screenshot::capture_to_file;
use crate::hooks::input_events::consume_summary;
use crate::models::telemetry::{
    ActiveWindowContext, CaptureSnapshotResult, InputSummary, LocalCaptureRecord, LocalWorkSegment,
    TelemetryEventPayload,
};
use crate::pipeline::normalizer::{
    classify_activity_level, concise_text, infer_task_hint, truncate_text,
};
use crate::pipeline::runtime::{
    capture_cooldown_millis, capture_cooldown_ready, current_session_id,
};
use crate::storage::{observations::ObservationStore, queue::QueueStore};

pub fn enqueue_event(app: &AppHandle, event: TelemetryEventPayload) -> Result<(), String> {
    QueueStore::from_app(app)?.enqueue(event)
}

pub fn enqueue_simple_event(app: &AppHandle, category: &str, result: &str) -> Result<(), String> {
    enqueue_event(app, TelemetryEventPayload::new(category, result))
}

pub fn enqueue_pipeline_error(app: &AppHandle, _message: &str) {
    let _ = enqueue_simple_event(app, "capture_pipeline_error", "failed");
}

pub async fn handle_window_switch(
    app: &AppHandle,
    context: &ActiveWindowContext,
    previous_context: Option<&ActiveWindowContext>,
    previous_duration_ms: u64,
) {
    let summary = consume_summary();
    let result = if summary.paste_count > 0 || (summary.click_count + summary.scroll_count) > 250 {
        "review"
    } else {
        "success"
    };
    let _ = enqueue_simple_event(app, "window_switch", result);

    if let Some(previous) = previous_context {
        let _ = append_local_segment(
            app,
            previous,
            previous_duration_ms,
            &summary,
            "window_switch",
            None,
        );
    }

    let now = Utc::now().timestamp_millis();
    if capture_cooldown_ready(now, capture_cooldown_millis()) {
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
    context: &ActiveWindowContext,
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

    let _ = append_local_capture(app, context, &capture_ref, &path, &ocr_summary, &ocr_output);

    Ok(CaptureSnapshotResult {
        capture_ref,
        path,
        ocr_summary,
    })
}

pub fn finalize_current_segment(
    app: &AppHandle,
    context: &ActiveWindowContext,
    duration_ms: u64,
) -> Result<(), String> {
    let summary = consume_summary();
    append_local_segment(app, context, duration_ms, &summary, "session_stop", None)
}

fn append_local_segment(
    app: &AppHandle,
    context: &ActiveWindowContext,
    duration_ms: u64,
    input_summary: &InputSummary,
    close_reason: &str,
    ocr_summary: Option<&str>,
) -> Result<(), String> {
    let session_id = current_session_id().unwrap_or_else(|| "manual".to_string());
    let ended_at = Utc::now();
    let start_delta = ChronoDuration::milliseconds(duration_ms.min(i64::MAX as u64) as i64);
    let started_at = ended_at - start_delta;
    let (task_hint, confidence) = infer_task_hint(
        &context.app_name,
        context.domain.as_deref(),
        &context.window_title,
        ocr_summary,
    );
    let segment = LocalWorkSegment {
        segment_id: format!(
            "seg_{}_{}",
            ended_at.format("%Y%m%d%H%M%S"),
            &Uuid::new_v4().to_string()[..8]
        ),
        session_id,
        started_at: started_at.to_rfc3339(),
        ended_at: ended_at.to_rfc3339(),
        duration_ms,
        app_name: context.app_name.clone(),
        window_title: context.window_title.clone(),
        url: context.url.clone(),
        domain: context.domain.clone(),
        click_count: input_summary.click_count,
        scroll_count: input_summary.scroll_count,
        paste_count: input_summary.paste_count,
        activity_level: classify_activity_level(
            input_summary.click_count,
            input_summary.scroll_count,
            input_summary.paste_count,
        ),
        task_hint,
        confidence,
        close_reason: close_reason.to_string(),
    };
    ObservationStore::from_app(app)?.append_segment(&segment)
}

fn append_local_capture(
    app: &AppHandle,
    context: &ActiveWindowContext,
    capture_ref: &str,
    path: &str,
    ocr_summary: &str,
    ocr_output: &OcrOutput,
) -> Result<(), String> {
    let record = LocalCaptureRecord {
        capture_ref: capture_ref.to_string(),
        session_id: current_session_id().unwrap_or_else(|| "manual".to_string()),
        occurred_at: Utc::now().to_rfc3339(),
        app_name: context.app_name.clone(),
        window_title: context.window_title.clone(),
        url: context.url.clone(),
        domain: context.domain.clone(),
        path: path.to_string(),
        ocr_engine: ocr_output.engine.clone(),
        ocr_success: ocr_output.success,
        ocr_summary: ocr_summary.to_string(),
        ocr_raw_text: ocr_output
            .raw_text
            .as_ref()
            .map(|raw| truncate_text(raw, 5000)),
    };
    ObservationStore::from_app(app)?.append_capture(&record)
}
