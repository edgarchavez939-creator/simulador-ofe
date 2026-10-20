CREATE TABLE institutional_settings (
 name TEXT PRIMARY KEY CHECK(name IN ('maintenance','radication_resources')),
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL,
 updated_by TEXT REFERENCES users(id)
);
