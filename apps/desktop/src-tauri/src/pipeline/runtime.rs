use std::sync::{Arc, Mutex};

use once_cell::sync::Lazy;
use uuid::Uuid;

use crate::models::telemetry::ActiveWindowContext;

#[derive(Debug, Clone, Default)]
pub struct ContextUpdate {
    pub window_changed: bool,
    pub url_changed: bool,
    pub previous_context: Option<ActiveWindowContext>,
    pub previous_duration_ms: u64,
}

#[derive(Debug, Clone)]
struct ObserveRuntime {
    running: bool,
    session_id: Option<String>,
    last_context: Option<ActiveWindowContext>,
    last_context_started_epoch_ms: i64,
    last_capture_epoch_ms: i64,
}

impl Default for ObserveRuntime {
    fn default() -> Self {
        Self {
            running: false,
            session_id: None,
            last_context: None,
            last_context_started_epoch_ms: 0,
            last_capture_epoch_ms: 0,
        }
    }
}

static RUNTIME: Lazy<Arc<Mutex<ObserveRuntime>>> =
    Lazy::new(|| Arc::new(Mutex::new(ObserveRuntime::default())));

pub fn start_or_get_session() -> Result<(String, bool), String> {
    let mut runtime = RUNTIME
        .lock()
        .map_err(|_| "failed to lock observe runtime".to_string())?;

    if runtime.running {
        let existing = runtime
            .session_id
            .clone()
            .unwrap_or_else(|| format!("sess_{}", Uuid::new_v4()));
        runtime.session_id = Some(existing.clone());
        return Ok((existing, false));
    }

    let session_id = format!("sess_{}", Uuid::new_v4());
    runtime.running = true;
    runtime.session_id = Some(session_id.clone());
    runtime.last_context = None;
    runtime.last_context_started_epoch_ms = 0;
    runtime.last_capture_epoch_ms = 0;
    Ok((session_id, true))
}

pub fn stop_session() -> Result<Option<String>, String> {
    let mut runtime = RUNTIME
        .lock()
        .map_err(|_| "failed to lock observe runtime".to_string())?;

    runtime.running = false;
    runtime.last_context = None;
    runtime.last_context_started_epoch_ms = 0;
    runtime.last_capture_epoch_ms = 0;
    Ok(runtime.session_id.take())
}

pub fn is_session_running(session_id: &str) -> bool {
    let Ok(runtime) = RUNTIME.lock() else {
        return false;
    };
    runtime.running && runtime.session_id.as_deref() == Some(session_id)
}

pub fn update_context(current: &ActiveWindowContext, now_epoch_ms: i64) -> ContextUpdate {
    let Ok(mut runtime) = RUNTIME.lock() else {
        return ContextUpdate::default();
    };

    if runtime.last_context.is_none() {
        runtime.last_context = Some(current.clone());
        runtime.last_context_started_epoch_ms = now_epoch_ms;
        return ContextUpdate {
            window_changed: true,
            url_changed: current.domain.is_some(),
            previous_context: None,
            previous_duration_ms: 0,
        };
    }

    let previous = runtime.last_context.clone().unwrap_or_default();
    let window_changed =
        previous.app_name != current.app_name || previous.window_title != current.window_title;
    let url_changed = current.domain.is_some() && previous.domain != current.domain;

    let mut previous_context = None;
    let mut previous_duration_ms = 0u64;
    if window_changed {
        let elapsed = now_epoch_ms.saturating_sub(runtime.last_context_started_epoch_ms);
        previous_duration_ms = elapsed.max(0) as u64;
        previous_context = Some(previous);
        runtime.last_context_started_epoch_ms = now_epoch_ms;
    }
    runtime.last_context = Some(current.clone());

    ContextUpdate {
        window_changed,
        url_changed,
        previous_context,
        previous_duration_ms,
    }
}

pub fn trailing_segment(now_epoch_ms: i64) -> Option<(ActiveWindowContext, u64)> {
    let Ok(runtime) = RUNTIME.lock() else {
        return None;
    };
    if !runtime.running {
        return None;
    }
    let context = runtime.last_context.clone()?;
    let elapsed = now_epoch_ms.saturating_sub(runtime.last_context_started_epoch_ms);
    Some((context, elapsed.max(0) as u64))
}

pub fn current_session_id() -> Option<String> {
    let Ok(runtime) = RUNTIME.lock() else {
        return None;
    };
    runtime.session_id.clone()
}

pub fn capture_cooldown_ready(now_epoch_ms: i64, cooldown_ms: i64) -> bool {
    let Ok(mut runtime) = RUNTIME.lock() else {
        return false;
    };

    if now_epoch_ms - runtime.last_capture_epoch_ms < cooldown_ms {
        return false;
    }

    runtime.last_capture_epoch_ms = now_epoch_ms;
    true
}

pub fn backend_base_url() -> String {
    std::env::var("DESKOPS_BACKEND_URL").unwrap_or_else(|_| "http://localhost:4310".to_string())
}

pub fn capture_cooldown_millis() -> i64 {
    let seconds = env_u64("DESKOPS_CAPTURE_COOLDOWN_SECONDS", 5);
    (seconds.saturating_mul(1_000)).min(i64::MAX as u64) as i64
}

pub fn flush_interval_seconds() -> u64 {
    env_u64("DESKOPS_FLUSH_INTERVAL_SECONDS", 15)
}

fn env_u64(name: &str, default: u64) -> u64 {
    std::env::var(name)
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .filter(|value| *value > 0)
        .unwrap_or(default)
}
