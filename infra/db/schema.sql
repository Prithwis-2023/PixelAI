PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS session_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  app_name TEXT NOT NULL,
  window_title TEXT,
  url TEXT,
  action_type TEXT NOT NULL,
  capture_ref TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_summaries (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  work_categories_json TEXT NOT NULL,
  repetitive_patterns_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  success_probability REAL NOT NULL,
  risk_score REAL NOT NULL,
  normalized_time_saved REAL NOT NULL,
  total_score REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  guard_decision TEXT NOT NULL,
  result_status TEXT NOT NULL,
  failure_type TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  permission_scope TEXT,
  target_id TEXT,
  metadata_json TEXT,
  timestamp TEXT NOT NULL
);
