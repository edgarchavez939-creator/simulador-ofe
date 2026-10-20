'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {createApplication}=require('../server/app.cjs');
const {verifyPassword}=require('../server/security.cjs');
const root=path.resolve(__dirname,'..'),PASSWORD='Only-a-test-password-2026!',NEXT='Another-test-password-2026!';
async function fixture(t){
 const app=await createApplication({root,database:':memory:',origin:'http://127.0.0.1:8787'});
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
 const address='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',data,session,extra={}){
  const response=await fetch(address+route,{method,redirect:'manual',headers:{Origin:app.origin,...(data!==undefined?{'Content-Type':'application/json'}:{}),...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{}),...extra},...(data!==undefined?{body:JSON.stringify(data)}:{})});
  const text=await response.text();let body;try{body=JSON.parse(text);}catch{body=text;}
  return {status:response.status,body,headers:response.headers};
 }
 await app.store.bootstrap('Administrador de prueba','admin@example.test',PASSWORD);
 async function login(email='admin@example.test',password=PASSWORD){const r=await call('/api/auth/login','POST',{email,password});assert.equal(r.status,200,JSON.stringify(r.body));return {cookie:r.headers.get('set-cookie').split(';')[0],csrf:r.body.csrfToken,user:r.body.user};}
 async function create(admin,email,role='simulator_user'){
  const r=await call('/api/admin/users','POST',{name:'Persona de prueba',email,role,status:'active',password:PASSWORD},admin);assert.equal(r.status,201,JSON.stringify(r.body));
  const session=await login(email);const changed=await call('/api/auth/password','POST',{currentPassword:PASSWORD,password:NEXT},session);assert.equal(changed.status,200);return {user:r.body.user,session:await login(email,NEXT)};
 }
 return {...app,call,login,create};
}
test('bootstrap creates exactly one administrator; hashes and sessions never appear in public user payloads',async t=>{
 const f=await fixture(t);await assert.rejects(f.store.bootstrap('Other','other@example.test',PASSWORD));
 const stored=f.store.db.prepare('SELECT * FROM users').get();assert.notEqual(stored.password_hash,PASSWORD);assert.ok(await verifyPassword(PASSWORD,stored.password_hash));
 const session=await f.login(),result=await f.call('/api/admin/users','GET',undefined,session);
 assert.equal((await f.call('/apps/ofe/config.js','GET',undefined,session)).status,200);
 assert.match((await f.call('/apps/ofe/','GET',undefined,session)).body,/runtime-config/);
 assert.equal(result.status,200);assert.ok(!JSON.stringify(result.body).includes('password_hash'));assert.ok(!JSON.stringify(result.body).includes(PASSWORD));
 const record=f.store.db.prepare('SELECT * FROM sessions').get();assert.ok(!session.cookie.includes(record.token_hash));
 assert.match((await f.call('/api/auth/login','POST',{email:'admin@example.test',password:PASSWORD})).headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
});
test('anonymous and normal profiles cannot access protected routes, APIs, users or audit',async t=>{
 const f=await fixture(t);
 for(const route of ['/admin','/admin/users','/admin/programs','/admin/audit','/apps/ofe/'])assert.equal((await f.call(route)).status,303);
 for(const route of ['/api/programs','/api/admin/users','/api/admin/audit'])assert.equal((await f.call(route)).status,401);
 const admin=await f.login(),{session:user}=await f.create(admin,'user@example.test');
 for(const route of ['/admin','/admin/users','/admin/programs','/admin/audit','/api/admin/users','/api/admin/audit'])assert.equal((await f.call(route,'GET',undefined,user)).status,403,route);
 assert.equal((await f.call('/api/admin/users','POST',{name:'Forged'},user)).status,403);
 assert.equal((await f.call('/api/admin/programs/x','PUT',{},user)).status,403);
 assert.equal((await f.call('/api/programs','GET',undefined,user)).body.programs.length,173);
 assert.equal((await f.call('/server/app.cjs','GET',undefined,admin)).status,404);
 assert.equal((await f.call('/var/ofe.sqlite','GET',undefined,admin)).status,404);
});
test('CSRF, origin, inactive accounts, role revocation, logout and expiry are enforced on the server',async t=>{
 const f=await fixture(t),admin=await f.login(),created=await f.create(admin,'operator@example.test','program_admin');
 assert.equal((await f.call('/api/auth/logout','POST',{},admin,{'X-CSRF-Token':'wrong'})).status,403);
 assert.equal((await f.call('/api/auth/logout','POST',{},admin,{Origin:'https://evil.example'})).status,403);
 let record=(await f.call('/api/admin/users','GET',undefined,admin)).body.users.find(x=>x.id===created.user.id);
 assert.equal((await f.call('/api/admin/users/'+record.id,'PATCH',{...record,role:'simulator_user'},admin)).status,200);
 assert.equal((await f.call('/api/programs','GET',undefined,created.session)).status,401);
 const next=await f.login('operator@example.test',NEXT);record=(await f.call('/api/admin/users','GET',undefined,admin)).body.users.find(x=>x.id===record.id);
 await f.call('/api/admin/users/'+record.id,'PATCH',{...record,status:'inactive'},admin);
 assert.equal((await f.call('/api/programs','GET',undefined,next)).status,401);
 const denied=await f.call('/api/auth/login','POST',{email:'operator@example.test',password:NEXT});assert.equal(denied.status,401);assert.equal(denied.body.error,'Usuario o contraseña incorrectos.');
 const logged=await f.login();await f.call('/api/auth/logout','POST',{},logged);assert.equal((await f.call('/api/auth/session','GET',undefined,logged)).status,401);
 const idle=await f.login();f.store.db.prepare('UPDATE sessions SET last_seen=0 WHERE user_id=?').run(admin.user.id);assert.equal((await f.call('/api/auth/session','GET',undefined,idle)).status,401);
 const expired=await f.login();f.store.db.prepare('UPDATE sessions SET expires_at=0').run();assert.equal((await f.call('/api/auth/session','GET',undefined,expired)).status,401);
});
test('user lifecycle validates duplicates, last admin, password reset, version conflicts and audits without secrets',async t=>{
 const f=await fixture(t),admin=await f.login(),person=await f.create(admin,'person@example.test');
 const duplicate=await f.call('/api/admin/users','POST',{name:'Another',email:'PERSON@example.test',role:'simulator_user',status:'active',password:PASSWORD},admin);assert.equal(duplicate.status,409);
 assert.equal((await f.call('/api/admin/users/'+admin.user.id,'PATCH',{...admin.user,status:'inactive'},admin)).status,409);
 let row=(await f.call('/api/admin/users','GET',undefined,admin)).body.users.find(x=>x.id===person.user.id);
 assert.equal((await f.call('/api/admin/users/'+row.id,'PATCH',{...row,name:'Nuevo nombre',role:'program_admin'},admin)).status,200);
 assert.equal((await f.call('/api/admin/users/'+row.id,'PATCH',{...row,name:'Conflicto'},admin)).status,409);
 row=(await f.call('/api/admin/users','GET',undefined,admin)).body.users.find(x=>x.id===person.user.id);
 const reset=await f.call('/api/admin/users/'+row.id+'/password','POST',{version:row.version,password:PASSWORD},admin);assert.equal(reset.status,200);
 assert.equal((await f.call('/api/auth/session','GET',undefined,person.session)).status,401);
 const resetSession=await f.login('person@example.test');assert.equal(resetSession.user.must_change_password,1);
 assert.equal((await f.call('/api/programs','GET',undefined,resetSession)).status,403);
 const records=(await f.call('/api/admin/audit','GET',undefined,admin)).body.records;
 for(const action of ['USER_CREATE','USER_UPDATE','USER_ROLE_CHANGE','PASSWORD_CHANGE','PASSWORD_RESET_REQUESTED','PASSWORD_RESET_COMPLETED'])assert.ok(records.some(x=>x.action===action),action);
 for(const record of records){assert.ok(record.timestamp&&record.request_id);assert.ok(!JSON.stringify(record).includes(PASSWORD));assert.ok(!JSON.stringify(record).includes(NEXT));assert.ok(!JSON.stringify(record).includes('scrypt$'));}
});
test('program admin edits by stable ID, cannot manage users, sees scoped audit and updates are transactional',async t=>{
 const f=await fixture(t),admin=await f.login(),{session:editor}=await f.create(admin,'editor@example.test','program_admin');
 const programs=(await f.call('/api/programs','GET',undefined,editor)).body.programs;
 const same=programs.filter(x=>x.nombre==='Especialización En Seguridad De La Información');assert.equal(same.length,2);assert.notEqual(same[0].id,same[1].id);
 const p=same[1],change={version:p.version,changes:{valorMatricula:p.valorMatricula+100,nombre:p.nombre+' actualizado'}};
 let result=await f.call('/api/admin/programs/'+encodeURIComponent(p.id),'PUT',change,editor);assert.equal(result.status,200);assert.equal(result.body.program.id,p.id);
 assert.equal((await f.call('/api/admin/programs/'+encodeURIComponent(p.id),'PUT',change,editor)).status,409);
 const rows=(await f.call('/api/admin/audit','GET',undefined,editor)).body.records;assert.ok(rows.every(x=>x.module==='programs'));
 const edits=rows.filter(x=>x.action==='PROGRAM_UPDATE');assert.equal(edits.length,2);assert.equal(new Set(edits.map(x=>x.request_id)).size,1);assert.equal(edits.find(x=>x.field_name==='valorMatricula').old_value,String(p.valorMatricula));
 assert.equal((await f.call('/api/admin/users','GET',undefined,editor)).status,403);
 const current=result.body.program;
 f.store.db.exec("CREATE TRIGGER fail_program_audit BEFORE INSERT ON audit_log WHEN NEW.action='PROGRAM_UPDATE' BEGIN SELECT RAISE(ABORT,'test rollback'); END;");
 result=await f.call('/api/admin/programs/'+encodeURIComponent(p.id),'PUT',{version:current.version,changes:{valorMatricula:1}},editor);assert.equal(result.status,500);
 assert.equal(JSON.parse(f.store.db.prepare('SELECT data FROM programs WHERE id=?').get(p.id).data).valorMatricula,current.valorMatricula);
 f.store.db.exec('DROP TRIGGER fail_program_audit');
 const before=JSON.stringify(f.store.db.prepare('SELECT * FROM programs').all());
 assert.equal((await f.call('/api/admin/programs/'+encodeURIComponent(p.id),'PUT',{version:current.version,changes:{nombre:null}},editor)).status,422);
 assert.equal((await f.call('/api/admin/programs','POST',{updates:[null]},editor)).status,422);
 result=await f.call('/api/admin/programs','POST',{updates:[{id:p.id,version:current.version,changes:{valorMatricula:1}},{id:same[0].id,version:999,changes:{valorMatricula:2}}]},editor);assert.equal(result.status,409);assert.equal(JSON.stringify(f.store.db.prepare('SELECT * FROM programs').all()),before);
});
test('login throttling and production secure cookies',async t=>{
 const f=await fixture(t);for(let i=0;i<10;i++)assert.equal((await f.call('/api/auth/login','POST',{email:'missing@example.test',password:'invalid'})).status,401);
 assert.equal((await f.call('/api/auth/login','POST',{email:'missing@example.test',password:'invalid'})).status,429);
 const secure=await createApplication({root,database:':memory:',origin:'https://example.test',production:true});t.after(()=>secure.close());await secure.store.bootstrap('Admin','secure@example.test',PASSWORD);await new Promise(resolve=>secure.server.listen(0,'127.0.0.1',resolve));
 const response=await fetch('http://127.0.0.1:'+secure.server.address().port+'/api/auth/login',{method:'POST',headers:{Origin:'https://example.test','Content-Type':'application/json'},body:JSON.stringify({email:'secure@example.test',password:PASSWORD})});assert.equal(response.status,200);assert.match(response.headers.get('set-cookie'),/__Host-ofe_session=.*; Secure/);
 await assert.rejects(createApplication({root,database:':memory:',origin:'http://example.test',production:true}));
});
test('migrations and consistent backups preserve users and catalog across restarts',async t=>{
 const fs=require('node:fs'),os=require('node:os'),{openStore}=require('../server/store.cjs'),{backup,DatabaseSync}=require('node:sqlite');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-persist-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const file=path.join(dir,'data.sqlite');
 let store=await openStore(file,root);await store.bootstrap('Persistencia','persist@example.test',PASSWORD);const ids=store.db.prepare('SELECT id FROM programs ORDER BY rowid').all().map(x=>x.id);
 store.close();store=await openStore(file,root);assert.equal(store.db.prepare('SELECT count(*) AS n FROM users').get().n,1);assert.deepEqual(store.db.prepare('SELECT id FROM programs ORDER BY rowid').all().map(x=>x.id),ids);assert.equal(store.db.prepare('SELECT count(*) AS n FROM schema_migrations').get().n,5);
 const target=path.join(dir,'backup.sqlite');await backup(store.db,target);store.close();const copy=new DatabaseSync(target,{readOnly:true});assert.equal(copy.prepare('SELECT count(*) AS n FROM audit_log').get().n,1);assert.equal(copy.prepare('PRAGMA integrity_check').get().integrity_check,'ok');copy.close();
});
test('mandatory audit failure rolls back user creation and invalid fields never create records',async t=>{
 const f=await fixture(t),admin=await f.login();
 for(const patch of [{role:'superuser'},{status:'deleted'},{password:'short'},{email:'invalid'}]){
  const r=await f.call('/api/admin/users','POST',{name:'Validation',email:'validation@example.test',role:'simulator_user',status:'active',password:PASSWORD,...patch},admin);assert.equal(r.status,422);
 }
 f.store.db.exec("CREATE TRIGGER fail_user_audit BEFORE INSERT ON audit_log WHEN NEW.action='USER_CREATE' BEGIN SELECT RAISE(ABORT,'test rollback'); END;");
 const r=await f.call('/api/admin/users','POST',{name:'Rollback',email:'rollback@example.test',role:'simulator_user',status:'active',password:PASSWORD},admin);assert.equal(r.status,500);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM users').get().n,1);
});
