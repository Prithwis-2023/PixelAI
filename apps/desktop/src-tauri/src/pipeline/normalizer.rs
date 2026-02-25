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
