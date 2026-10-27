-- Independent text configuration; existing maintenance and radication rows remain untouched.
CREATE TABLE text_settings (
 name TEXT PRIMARY KEY CHECK(name='texts'),
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL,
 updated_by TEXT REFERENCES users(id)
);
