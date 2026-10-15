CREATE TABLE roles (id TEXT PRIMARY KEY);
CREATE TABLE permissions (id TEXT PRIMARY KEY);
CREATE TABLE role_permissions (role_id TEXT REFERENCES roles(id), permission_id TEXT REFERENCES permissions(id), PRIMARY KEY(role_id,permission_id));
CREATE TABLE users (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL COLLATE NOCASE UNIQUE,
 password_hash TEXT NOT NULL, auth_provider TEXT NOT NULL DEFAULT 'local',
 role TEXT NOT NULL REFERENCES roles(id), status TEXT NOT NULL CHECK(status IN ('active','inactive')),
 must_change_password INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE sessions (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), csrf_token TEXT NOT NULL,
 created_at INTEGER NOT NULL, last_seen INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE TABLE programs (id TEXT PRIMARY KEY, data TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE audit_log (
 id TEXT PRIMARY KEY, timestamp TEXT NOT NULL, actor_user_id TEXT REFERENCES users(id), actor_name TEXT,
 actor_email TEXT, action TEXT NOT NULL, module TEXT NOT NULL, entity_type TEXT NOT NULL,
 entity_id TEXT, entity_name TEXT, field_name TEXT, old_value TEXT, new_value TEXT,
 result TEXT NOT NULL, request_id TEXT NOT NULL, metadata TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX audit_date ON audit_log(timestamp);
CREATE INDEX audit_actor ON audit_log(actor_user_id);
CREATE TABLE login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
