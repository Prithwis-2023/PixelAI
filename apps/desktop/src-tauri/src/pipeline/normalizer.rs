pub fn concise_text(raw: &str, max_len: usize) -> String {
    let collapsed = raw
        .split_whitespace()
        .filter(|chunk| !chunk.trim().is_empty())
        .collect::<Vec<_>>()
        .join(" ");
    if collapsed.len() <= max_len {
        return collapsed;
    }
    collapsed[..max_len].trim().to_string()
}

pub fn truncate_text(raw: &str, max_len: usize) -> String {
    if raw.len() <= max_len {
        return raw.to_string();
    }
    raw[..max_len].to_string()
}

pub fn classify_activity_level(click_count: u64, scroll_count: u64, paste_count: u64) -> String {
    let weighted = click_count + scroll_count + (paste_count * 3);
    if weighted == 0 {
        "idle".to_string()
    } else if weighted < 20 {
        "low".to_string()
    } else if weighted < 80 {
        "medium".to_string()
    } else {
        "high".to_string()
    }
}

pub fn infer_task_hint(
    app_name: &str,
    domain: Option<&str>,
    window_title: &str,
    ocr_summary: Option<&str>,
) -> (String, f32) {
    let app = app_name.to_ascii_lowercase();
    let domain_lc = domain.unwrap_or("").to_ascii_lowercase();
    let window = window_title.to_ascii_lowercase();
    let ocr = ocr_summary.unwrap_or("").to_ascii_lowercase();

    if domain_lc.contains("sheets.google.com") || window.contains("sheet") {
        return ("spreadsheet_update".to_string(), 0.84);
    }
    if domain_lc.contains("slack.com") || app.contains("slack") {
        return ("slack_triage".to_string(), 0.79);
    }
    if domain_lc.contains("github.com") || app.contains("xcode") || app.contains("cursor") {
        return ("engineering_dev_work".to_string(), 0.72);
    }
    if domain_lc.contains("notion.so") || ocr.contains("meeting notes") {
        return ("documentation".to_string(), 0.68);
    }
    if ocr.contains("invoice") || ocr.contains("order") || ocr.contains("shipment") {
        return ("ops_data_entry".to_string(), 0.65);
    }

    ("generic_computer_work".to_string(), 0.35)
}
