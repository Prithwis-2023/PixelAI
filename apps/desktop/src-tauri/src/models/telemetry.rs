use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryEventPayload {
    #[serde(rename = "eventId")]
    pub event_id: String,
    #[serde(rename = "occurredAt")]
    pub occurred_at: String,
    pub category: String,
    pub result: String,
    pub source: String,
}

impl TelemetryEventPayload {
    pub fn new(category: &str, result: &str) -> Self {
        let now = Utc::now();
        Self {
            event_id: format!(
                "evt_{}_{}",
                now.format("%Y%m%d%H%M%S"),
                &Uuid::new_v4().to_string()[..8]
            ),
            occurred_at: now.to_rfc3339(),
            category: category.to_string(),
            result: result.to_string(),
            source: "desktop-agent".to_string(),
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct ActiveWindowContext {
    pub app_name: String,
    pub window_title: String,
    pub url: Option<String>,
    pub domain: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartObserveResponse {
    pub session_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StopObserveResponse {
    pub stopped: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermissionState {
    pub accessibility: bool,
    pub screen_recording: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CaptureSnapshotResult {
    pub capture_ref: String,
    pub path: String,
    pub ocr_summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FlushResult {
    pub sent: usize,
    pub failed: usize,
    pub validation_failed: usize,
    pub duplicate_failed: usize,
    pub server_failed: usize,
    pub network_failed: usize,
    pub unknown_failed: usize,
}

#[derive(Debug, Clone, Default)]
pub struct InputSummary {
    pub click_count: u64,
    pub scroll_count: u64,
    pub paste_count: u64,
}
