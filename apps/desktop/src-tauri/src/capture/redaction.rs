use once_cell::sync::Lazy;
use regex::Regex;

static EMAIL_REGEX: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}").expect("valid email regex"));
static TOKEN_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"\b(?:sk|pk|ghp|gho|xoxb)_[A-Za-z0-9_-]{8,}\b").expect("valid token regex")
});
static DIGIT_RUN_REGEX: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"\b\d{12,16}\b").expect("valid long digits regex"));

pub fn redact_sensitive(text: &str) -> String {
    let email_redacted = EMAIL_REGEX.replace_all(text, "[REDACTED_EMAIL]");
    let token_redacted = TOKEN_REGEX.replace_all(&email_redacted, "[REDACTED_TOKEN]");
    let digits_redacted = DIGIT_RUN_REGEX.replace_all(&token_redacted, "[REDACTED_NUMBER]");
    digits_redacted.into_owned()
}
