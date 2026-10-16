CREATE TABLE appearance_settings (
 id INTEGER PRIMARY KEY CHECK(id=1),
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL,
 updated_by TEXT REFERENCES users(id)
);
INSERT INTO appearance_settings(id,data,updated_at) VALUES (1,'{"brand_red":"#960A11","brand_gold":"#B78B1E","brand_yellow":"#FFCC00","brand_sand":"#CFC493"}',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
