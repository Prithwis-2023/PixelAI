use std::fs;
use std::path::PathBuf;

use chrono::Utc;
use tauri::AppHandle;

use crate::models::telemetry::TelemetryEventPayload;

#[derive(Debug, Clone)]
pub struct QueueStore {
    path: PathBuf,
}

impl QueueStore {
    pub fn from_app(app: &AppHandle) -> Result<Self, String> {
        let base_dir = app
            .path_resolver()
            .app_local_data_dir()
            .unwrap_or_else(|| std::env::temp_dir().join("deskops-desktop"));
        fs::create_dir_all(&base_dir)
            .map_err(|error| format!("failed to create app local directory: {error}"))?;
        Ok(Self {
            path: base_dir.join("telemetry-queue.json"),
        })
    }

    pub fn enqueue(&self, event: TelemetryEventPayload) -> Result<(), String> {
        let mut events = self.load()?;
        events.push(event);
        self.save(&events)
    }

    pub fn drain(&self) -> Result<Vec<TelemetryEventPayload>, String> {
        let events = self.load()?;
        self.save(&[])?;
        Ok(events)
    }

    pub fn requeue_front(&self, events: &[TelemetryEventPayload]) -> Result<(), String> {
        let mut existing = self.load()?;
        let mut merged = events.to_vec();
        merged.append(&mut existing);
        self.save(&merged)
    }

    pub fn load(&self) -> Result<Vec<TelemetryEventPayload>, String> {
        if !self.path.exists() {
            return Ok(Vec::new());
        }
        let content = fs::read_to_string(&self.path).map_err(|error| {
            format!("failed to read queue file {}: {error}", self.path.display())
        })?;
        if content.trim().is_empty() {
            return Ok(Vec::new());
        }
        match serde_json::from_str::<Vec<TelemetryEventPayload>>(&content) {
            Ok(events) => Ok(events),
            Err(_) => {
                self.recover_corrupt_queue_file(&content)?;
                Ok(Vec::new())
            }
        }
    }

    pub fn save(&self, events: &[TelemetryEventPayload]) -> Result<(), String> {
        let serialized = serde_json::to_string_pretty(events)
            .map_err(|error| format!("failed to serialize queue: {error}"))?;
        fs::write(&self.path, serialized).map_err(|error| {
            format!(
                "failed to write queue file {}: {error}",
                self.path.display()
            )
        })
    }

    fn recover_corrupt_queue_file(&self, raw_content: &str) -> Result<(), String> {
        let backup_path = self.path.with_file_name(format!(
            "telemetry-queue.corrupt-{}.json",
            Utc::now().timestamp()
        ));

        if fs::rename(&self.path, &backup_path).is_err() {
            fs::write(&backup_path, raw_content).map_err(|error| {
                format!(
                    "failed to backup corrupt queue file {}: {error}",
                    backup_path.display()
                )
            })?;
        }

        fs::write(&self.path, "[]").map_err(|error| {
            format!(
                "failed to reset corrupt queue file {}: {error}",
                self.path.display()
            )
        })
    }
}
