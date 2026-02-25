use std::sync::{Arc, Mutex};

use once_cell::sync::Lazy;
use uuid::Uuid;

#[derive(Debug, Clone)]
struct ObserveRuntime {
    running: bool,
    session_id: Option<String>,
    last_window_signature: Option<String>,
    last_domain: Option<String>,
    last_capture_epoch_ms: i64,
}

impl Default for ObserveRuntime {
    fn default() -> Self {
        Self {
            running: false,
            session_id: None,
            last_window_signature: None,
            last_domain: None,
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
    runtime.last_window_signature = None;
    runtime.last_domain = None;
    runtime.last_capture_epoch_ms = 0;
    Ok((session_id, true))
}

pub fn stop_session() -> Result<Option<String>, String> {
    let mut runtime = RUNTIME
        .lock()
        .map_err(|_| "failed to lock observe runtime".to_string())?;

    runtime.running = false;
    runtime.last_window_signature = None;
    runtime.last_domain = None;
    runtime.last_capture_epoch_ms = 0;
    Ok(runtime.session_id.take())
}

pub fn is_session_running(session_id: &str) -> bool {
    let Ok(runtime) = RUNTIME.lock() else {
        return false;
    };
    runtime.running && runtime.session_id.as_deref() == Some(session_id)
}

pub fn mark_context(window_signature: &str, domain: Option<&str>) -> (bool, bool) {
    let Ok(mut runtime) = RUNTIME.lock() else {
        return (false, false);
    };

    let window_changed = runtime.last_window_signature.as_deref() != Some(window_signature);
    if window_changed {
        runtime.last_window_signature = Some(window_signature.to_string());
    }

    let normalized_domain = domain
        .filter(|d| !d.trim().is_empty())
        .map(ToString::to_string);
    let url_changed = normalized_domain.is_some() && runtime.last_domain != normalized_domain;
    if normalized_domain.is_some() {
        runtime.last_domain = normalized_domain;
    }

    (window_changed, url_changed)
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
