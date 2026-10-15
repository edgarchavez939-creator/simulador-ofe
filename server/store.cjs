'use strict';
const {DatabaseSync}=require('node:sqlite');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {randomUUID}=require('node:crypto');
const {hashPassword}=require('./security.cjs');
const ROLES={
 simulator_user:['simulator.use','programs.view'],
 program_admin:['simulator.use','programs.view','programs.update','audit.read'],
 system_admin:['simulator.use','programs.view','programs.update','audit.read','users.read','users.create','users.update','users.disable','settings.read','settings.update']
};
const publicUser=u=>u?Object.fromEntries(['id','name','email','auth_provider','role','status','must_change_password','version','created_at','updated_at'].map(key=>[key,u[key]])):null;
function catalogFromRepository(root) {
 const html=fs.readFileSync(path.join(root,'apps/public/index.html'),'utf8'),elements={};
 for(const id of ['programas-data','posgrados-data']) elements[id]={textContent:html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`))[1]};
 const c=vm.createContext({document:{getElementById:id=>elements[id]}});c.window=c;
 for(const file of ['program-catalog-schema.js','program-catalog-validator.js','program-catalog-normalizer.js','adapters/embedded-adapter.js']) vm.runInContext(fs.readFileSync(path.join(root,'shared/program-catalog',file),'utf8'),c);
 return c.ProgramCatalogEmbeddedAdapter.list();
}
async function openStore(filename,root) {
 if(filename!==':memory:') {fs.mkdirSync(path.dirname(filename),{recursive:true,mode:0o700});}
 const db=new DatabaseSync(filename);if(filename!==':memory:')fs.chmodSync(filename,0o600);
 db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
 for(const name of fs.readdirSync(path.join(__dirname,'migrations')).filter(x=>x.endsWith('.sql')).sort()) {
  if(db.prepare('SELECT name FROM schema_migrations WHERE name=?').get(name)) continue;
  db.exec('BEGIN IMMEDIATE');try {db.exec(fs.readFileSync(path.join(__dirname,'migrations',name),'utf8'));db.prepare('INSERT INTO schema_migrations VALUES (?,?)').run(name,new Date().toISOString());db.exec('COMMIT');} catch(e){db.exec('ROLLBACK');throw e;}
 }
 db.exec('BEGIN IMMEDIATE');try {
  for(const [role,permissions] of Object.entries(ROLES)) {
   db.prepare('INSERT OR IGNORE INTO roles VALUES (?)').run(role);
   for(const permission of permissions){db.prepare('INSERT OR IGNORE INTO permissions VALUES (?)').run(permission);db.prepare('INSERT OR IGNORE INTO role_permissions VALUES (?,?)').run(role,permission);}
  }
  db.exec('COMMIT');
 } catch(e){db.exec('ROLLBACK');throw e;}
 if(!db.prepare('SELECT count(*) AS n FROM programs').get().n){
  const programs=await catalogFromRepository(root);
  db.exec('BEGIN IMMEDIATE');try{for(const program of programs)db.prepare('INSERT INTO programs(id,data) VALUES (?,?)').run(program.id,JSON.stringify(program));db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 }
 const permissions=role=>db.prepare('SELECT permission_id FROM role_permissions WHERE role_id=?').all(role).map(x=>x.permission_id);
 function transaction(fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}
 function audit(actor,action,module,entity,field,oldValue,newValue,requestId,result='SUCCESS') {
  db.prepare('INSERT INTO audit_log(id,timestamp,actor_user_id,actor_name,actor_email,action,module,entity_type,entity_id,entity_name,field_name,old_value,new_value,result,request_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
   .run(randomUUID(),new Date().toISOString(),actor?.id||null,actor?.name||null,actor?.email||null,action,module,entity.type,entity.id||null,entity.name||null,field||null,oldValue===undefined?null:JSON.stringify(oldValue),newValue===undefined?null:JSON.stringify(newValue),result,requestId);
 }
 async function bootstrap(name,email,password) {
  const hash=await hashPassword(password),now=new Date().toISOString(),id=randomUUID();
  return transaction(()=>{
   if(db.prepare('SELECT count(*) AS n FROM users').get().n)throw Error('El primer administrador ya existe. Usa Administración → Usuarios.');
   db.prepare('INSERT INTO users(id,name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').run(id,name,email.toLowerCase(),hash,'system_admin','active',now,now);
   const user=db.prepare('SELECT * FROM users WHERE id=?').get(id);
   audit(user,'ADMIN_BOOTSTRAP','users',{type:'user',id,name},'role',null,'system_admin',randomUUID());return publicUser(user);
  });
 }
 return {db,permissions,transaction,audit,bootstrap,close:()=>db.close()};
}
module.exports={openStore,publicUser,ROLES};
