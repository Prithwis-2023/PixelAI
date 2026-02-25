use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

use once_cell::sync::Lazy;
use rdev::{listen, Event, EventType, Key};

use crate::models::telemetry::InputSummary;

static LISTENER_STARTED: AtomicBool = AtomicBool::new(false);
static CLICK_COUNT: Lazy<AtomicU64> = Lazy::new(|| AtomicU64::new(0));
static SCROLL_COUNT: Lazy<AtomicU64> = Lazy::new(|| AtomicU64::new(0));
static PASTE_COUNT: Lazy<AtomicU64> = Lazy::new(|| AtomicU64::new(0));
static META_DOWN: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));

pub fn ensure_listener_started() {
    if LISTENER_STARTED
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return;
    }

    std::thread::spawn(|| {
        let callback = |event: Event| match event.event_type {
            EventType::ButtonPress(_) => {
                CLICK_COUNT.fetch_add(1, Ordering::Relaxed);
            }
            EventType::Wheel { .. } => {
                SCROLL_COUNT.fetch_add(1, Ordering::Relaxed);
            }
            EventType::KeyPress(Key::MetaLeft) | EventType::KeyPress(Key::MetaRight) => {
                META_DOWN.store(true, Ordering::Relaxed);
            }
            EventType::KeyRelease(Key::MetaLeft) | EventType::KeyRelease(Key::MetaRight) => {
                META_DOWN.store(false, Ordering::Relaxed);
            }
            EventType::KeyPress(Key::KeyV) => {
                if META_DOWN.load(Ordering::Relaxed) {
                    PASTE_COUNT.fetch_add(1, Ordering::Relaxed);
                }
            }
            _ => {}
        };

        let _ = listen(callback);
    });
}

pub fn consume_summary() -> InputSummary {
    InputSummary {
        click_count: CLICK_COUNT.swap(0, Ordering::Relaxed),
        scroll_count: SCROLL_COUNT.swap(0, Ordering::Relaxed),
        paste_count: PASTE_COUNT.swap(0, Ordering::Relaxed),
    }
}
