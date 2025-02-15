CREATE TABLE IF NOT EXISTS example (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint_id TEXT UNIQUE NOT NULL,
    browser_type TEXT,
    os TEXT,
    host TEXT,
    language TEXT,
    timezone_offset INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);