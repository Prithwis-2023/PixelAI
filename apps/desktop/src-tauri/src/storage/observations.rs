use std::fs::{self, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;

use tauri::AppHandle;

use crate::models::telemetry::{LocalCaptureRecord, LocalWorkSegment, ObservationStats};

#[derive(Debug, Clone)]
pub struct ObservationStore {
    base_dir: PathBuf,
}

impl ObservationStore {
    pub fn from_app(app: &AppHandle) -> Result<Self, String> {
        let base_dir = app
            .path_resolver()
            .app_local_data_dir()
            .unwrap_or_else(|| std::env::temp_dir().join("deskops-desktop"))
            .join("observations");
        fs::create_dir_all(&base_dir)
            .map_err(|error| format!("failed to create observations directory: {error}"))?;
        Ok(Self { base_dir })
    }

    pub fn append_segment(&self, segment: &LocalWorkSegment) -> Result<(), String> {
        self.append_json_line("segments.jsonl", segment)
    }

    pub fn append_capture(&self, capture: &LocalCaptureRecord) -> Result<(), String> {
        self.append_json_line("captures.jsonl", capture)
    }

    pub fn stats(&self) -> Result<ObservationStats, String> {
        let segments_path = self.base_dir.join("segments.jsonl");
        let captures_path = self.base_dir.join("captures.jsonl");

        let segment_count = count_lines(&segments_path)?;
        let capture_count = count_lines(&captures_path)?;

        let last_segment = read_last_json_line::<LocalWorkSegment>(&segments_path)?;
        let last_capture = read_last_json_line::<LocalCaptureRecord>(&captures_path)?;

        Ok(ObservationStats {
            segment_count,
            capture_count,
            last_task_hint: last_segment
                .as_ref()
                .map(|segment| segment.task_hint.clone()),
            last_segment_duration_ms: last_segment.as_ref().map(|segment| segment.duration_ms),
            last_capture_at: last_capture
                .as_ref()
                .map(|capture| capture.occurred_at.clone()),
        })
    }

    fn append_json_line<T: serde::Serialize>(
        &self,
        file_name: &str,
        payload: &T,
    ) -> Result<(), String> {
        let target = self.base_dir.join(file_name);
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&target)
            .map_err(|error| {
                format!(
                    "failed to open observation file {}: {error}",
                    target.display()
                )
            })?;
        let line = serde_json::to_string(payload)
            .map_err(|error| format!("failed to serialize observation: {error}"))?;
        file.write_all(line.as_bytes())
            .and_then(|_| file.write_all(b"\n"))
            .map_err(|error| {
                format!(
                    "failed to write observation file {}: {error}",
                    target.display()
                )
            })
    }
}

fn count_lines(path: &PathBuf) -> Result<usize, String> {
    if !path.exists() {
        return Ok(0);
    }
    let file = fs::File::open(path).map_err(|error| {
        format!(
            "failed to open observation file {}: {error}",
            path.display()
        )
    })?;
    Ok(BufReader::new(file).lines().count())
}

fn read_last_json_line<T: serde::de::DeserializeOwned>(
    path: &PathBuf,
) -> Result<Option<T>, String> {
    if !path.exists() {
        return Ok(None);
    }
    let file = fs::File::open(path).map_err(|error| {
        format!(
            "failed to open observation file {}: {error}",
            path.display()
        )
    })?;
    let mut last_non_empty: Option<String> = None;
    for line in BufReader::new(file).lines() {
        let line = line.map_err(|error| {
            format!(
                "failed to read observation file {}: {error}",
                path.display()
            )
        })?;
        if !line.trim().is_empty() {
            last_non_empty = Some(line);
        }
    }
    match last_non_empty {
        None => Ok(None),
        Some(line) => serde_json::from_str::<T>(&line).map(Some).map_err(|error| {
            format!(
                "failed to parse observation line {}: {error}",
                path.display()
            )
        }),
    }
}
