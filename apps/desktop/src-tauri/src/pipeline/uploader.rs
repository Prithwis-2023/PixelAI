use reqwest::StatusCode;
use tauri::AppHandle;

use crate::models::telemetry::TelemetryEventPayload;
use crate::storage::queue::QueueStore;

#[derive(Debug, Clone)]
pub struct UploadResult {
    pub sent: usize,
    pub failed: usize,
    pub validation_failed: usize,
    pub duplicate_failed: usize,
    pub server_failed: usize,
    pub network_failed: usize,
    pub unknown_failed: usize,
}

pub async fn check_health(base_url: &str) -> bool {
    let endpoint = format!("{}/health", base_url.trim_end_matches('/'));
    reqwest::Client::new()
        .get(endpoint)
        .send()
        .await
        .map(|response| response.status().is_success())
        .unwrap_or(false)
}

pub async fn flush_queue(app: &AppHandle, base_url: &str) -> Result<UploadResult, String> {
    let queue = QueueStore::from_app(app)?;
    let events = queue.drain()?;

    if events.is_empty() {
        return Ok(UploadResult {
            sent: 0,
            failed: 0,
            validation_failed: 0,
            duplicate_failed: 0,
            server_failed: 0,
            network_failed: 0,
            unknown_failed: 0,
        });
    }

    if !check_health(base_url).await {
        queue.requeue_front(&events)?;
        return Ok(UploadResult {
            sent: 0,
            failed: events.len(),
            validation_failed: 0,
            duplicate_failed: 0,
            server_failed: 0,
            network_failed: events.len(),
            unknown_failed: 0,
        });
    }

    let client = reqwest::Client::new();
    let endpoint = format!("{}/v1/telemetry/events", base_url.trim_end_matches('/'));

    let mut sent = 0usize;
    let mut failed = 0usize;
    let mut validation_failed = 0usize;
    let mut duplicate_failed = 0usize;
    let mut server_failed = 0usize;
    let mut network_failed = 0usize;
    let mut unknown_failed = 0usize;
    let mut retry_events: Vec<TelemetryEventPayload> = Vec::new();

    for event in events {
        let response = client.post(&endpoint).json(&event).send().await;
        match response {
            Ok(resp) if resp.status() == StatusCode::ACCEPTED => {
                sent += 1;
            }
            Ok(resp) if resp.status() == StatusCode::BAD_REQUEST => {
                failed += 1;
                validation_failed += 1;
            }
            Ok(resp) if resp.status() == StatusCode::CONFLICT => {
                failed += 1;
                duplicate_failed += 1;
            }
            Ok(resp) if resp.status().is_server_error() => {
                failed += 1;
                server_failed += 1;
                retry_events.push(event);
            }
            Ok(_) => {
                failed += 1;
                unknown_failed += 1;
            }
            Err(_) => {
                failed += 1;
                network_failed += 1;
                retry_events.push(event);
            }
        }
    }

    if !retry_events.is_empty() {
        queue.requeue_front(&retry_events)?;
    }

    Ok(UploadResult {
        sent,
        failed,
        validation_failed,
        duplicate_failed,
        server_failed,
        network_failed,
        unknown_failed,
    })
}
