CREATE TABLE global_settings (
 id INTEGER PRIMARY KEY CHECK(id=1),
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL,
 updated_by TEXT REFERENCES users(id)
);
INSERT INTO global_settings(id,data,updated_at) VALUES (1,'{"default_interest_rate":1.53,"default_installments":6,"garantisa_cp_percent":4.17,"garantisa_lp_percent":2.86}',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
ALTER TABLE programs ADD COLUMN updated_at TEXT;
ALTER TABLE programs ADD COLUMN updated_by TEXT REFERENCES users(id);
CREATE INDEX audit_entity ON audit_log(entity_id,timestamp);
