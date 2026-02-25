use std::process::Command;

use url::Url;

use crate::models::telemetry::ActiveWindowContext;

pub fn current_context() -> Result<ActiveWindowContext, String> {
    let app_and_window = run_osascript(
        r#"
        tell application "System Events"
          set frontApp to name of first application process whose frontmost is true
          set frontWindow to ""
          try
            set frontWindow to name of front window of first process whose frontmost is true
          end try
          return frontApp & "|||" & frontWindow
        end tell
        "#,
    )?;

    let mut parts = app_and_window.splitn(2, "|||");
    let app_name = parts.next().unwrap_or_default().trim().to_string();
    let window_title = parts.next().unwrap_or_default().trim().to_string();

    let mut context = ActiveWindowContext {
        app_name,
        window_title,
        url: None,
        domain: None,
    };

    if context.app_name == "Google Chrome" {
        if let Ok(url) = chrome_front_url() {
            let domain = Url::parse(&url)
                .ok()
                .and_then(|parsed| parsed.domain().map(ToString::to_string));
            context.url = Some(url);
            context.domain = domain;
        }
    }

    Ok(context)
}

pub fn has_accessibility_permission() -> bool {
    run_osascript(
        r#"
        tell application "System Events"
          return count of (every process whose frontmost is true)
        end tell
        "#,
    )
    .is_ok()
}

fn chrome_front_url() -> Result<String, String> {
    run_osascript(
        r#"
        tell application "Google Chrome"
          if (count of windows) is 0 then
            return ""
          end if
          return URL of active tab of front window
        end tell
        "#,
    )
}

fn run_osascript(script: &str) -> Result<String, String> {
    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()
        .map_err(|error| format!("failed to launch osascript: {error}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("osascript failed: {stderr}"));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}
