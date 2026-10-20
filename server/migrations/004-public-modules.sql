CREATE TABLE public_module_settings (
 id INTEGER PRIMARY KEY CHECK(id=1),
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL,
 updated_by TEXT REFERENCES users(id)
);
INSERT INTO public_module_settings(id,data,updated_at) VALUES (1,'{"shortTerm":true,"mixed":true,"bank":true,"initialPayment":true,"rateConverter":true,"comparison":true,"history":true}',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
