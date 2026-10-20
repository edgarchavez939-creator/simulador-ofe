-- Preserve the previous per-level configuration before adopting the three credit modules.
CREATE TABLE radication_resources_legacy (
 id INTEGER PRIMARY KEY CHECK(id=1),
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL,
 updated_at TEXT NOT NULL,
 updated_by TEXT REFERENCES users(id)
);
INSERT INTO radication_resources_legacy(id,data,version,updated_at,updated_by)
 SELECT 1,data,version,updated_at,updated_by FROM institutional_settings
 WHERE name='radication_resources' AND (json_type(data,'$."shortTerm:pregrado"') IS NOT NULL OR json_type(data,'$."shortTerm:posgrado"') IS NOT NULL OR json_type(data,'$.languages') IS NOT NULL);

-- Only identical pregrado/posgrado resources can become one unambiguous shared link.
-- New module links start disabled, and differing legacy resources remain available for review.
UPDATE institutional_settings SET data=json_object(
 'initialPayment',json('{"enabled":false,"url":"","text":"CONSULTAR INSTRUCCIONES DE RADICACIÓN","description":"","type":"other"}'),
 'shortTerm',json(CASE WHEN json_extract(data,'$."shortTerm:pregrado"')=json_extract(data,'$."shortTerm:posgrado"')
  THEN json_extract(data,'$."shortTerm:pregrado"')
  ELSE '{"enabled":false,"url":"","text":"CONSULTAR INSTRUCCIONES DE RADICACIÓN","description":"","type":"other"}' END),
 'mixed',json('{"enabled":false,"url":"","text":"CONSULTAR INSTRUCCIONES DE RADICACIÓN","description":"","type":"other"}')
 ),version=version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),updated_by=NULL
 WHERE name='radication_resources' AND EXISTS(SELECT 1 FROM radication_resources_legacy);

INSERT INTO audit_log(id,timestamp,actor_name,action,module,entity_type,entity_id,entity_name,field_name,old_value,new_value,result,request_id)
 SELECT lower(hex(randomblob(16))),strftime('%Y-%m-%dT%H:%M:%fZ','now'),'Migración del sistema','CONFIG_MIGRATION','settings','radication_resources','radication_resources','Recursos de radicación por módulo de crédito',NULL,legacy.data,current.data,'SUCCESS',lower(hex(randomblob(16)))
 FROM radication_resources_legacy legacy JOIN institutional_settings current ON current.name='radication_resources';
