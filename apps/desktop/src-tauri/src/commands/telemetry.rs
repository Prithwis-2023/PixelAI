use tauri::AppHandle;

use crate::models::telemetry::FlushResult;
use crate::pipeline::collector::enqueue_simple_event;
use crate::pipeline::runtime::backend_base_url;
use crate::pipeline::uploader::flush_queue;

pub async fn flush_queue_internal(
    app: &AppHandle,
    emit_upload_events: bool,
) -> Result<FlushResult, String> {
    let base_url = backend_base_url();
    let result = flush_queue(app, &base_url).await?;
    if emit_upload_events && result.sent > 0 {
        let _ = enqueue_simple_event(&app, "upload_success", "success");
    }
    if emit_upload_events && result.failed > 0 {
        let _ = enqueue_simple_event(&app, "upload_failed", "failed");
    }

    Ok(FlushResult {
        sent: result.sent,
        failed: result.failed,
        validation_failed: result.validation_failed,
        duplicate_failed: result.duplicate_failed,
        server_failed: result.server_failed,
        network_failed: result.network_failed,
        unknown_failed: result.unknown_failed,
    })
}

#[tauri::command]
pub async fn flush_telemetry_queue(app: AppHandle) -> Result<FlushResult, String> {
    flush_queue_internal(&app, true).await
}
