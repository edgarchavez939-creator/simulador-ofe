'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {prepareDemo}=require('../server/start-demo.cjs');
const {openStore}=require('../server/store.cjs');
const {verifyPassword}=require('../server/security.cjs');
const {createApplication}=require('../server/app.cjs');
const root=path.resolve(__dirname,'..'),password='Temporary-test-only-password-2026!';
function environment(database){return {OFE_EPHEMERAL_DEMO:'1',OFE_DEMO_ADMIN_NAME:'Administrador de prueba',OFE_DEMO_ADMIN_EMAIL:'demo@example.test',OFE_DEMO_ADMIN_PASSWORD:password,OFE_DATABASE:database};}
function directory(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-demo-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
test('demo requires explicit mode and private valid credentials; consumes the password without creating a public setup',async t=>{
 const db=path.join(directory(t),'invalid.sqlite'),env=environment(db);delete env.OFE_EPHEMERAL_DEMO;
 await assert.rejects(prepareDemo(env,root),/OFE_EPHEMERAL_DEMO/);assert.equal(env.OFE_DEMO_ADMIN_PASSWORD,undefined);assert.equal(fs.existsSync(db),false);
 const invalid=environment(db);invalid.OFE_DEMO_ADMIN_PASSWORD='short';await assert.rejects(prepareDemo(invalid,root),/12 a 128/);assert.equal(fs.existsSync(db),false);
});
test('demo first administrator uses real login, hash, permissions and audited sessions',async t=>{
 const env=environment(path.join(directory(t),'demo.sqlite'));
 assert.equal((await prepareDemo(env,root)).created,true);assert.equal(env.OFE_DEMO_ADMIN_PASSWORD,undefined);
 const app=await createApplication({root,database:env.OFE_DATABASE,origin:'http://127.0.0.1:8787'});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
 const base='http://127.0.0.1:'+app.server.address().port;
 let response=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:app.origin,'Content-Type':'application/json'},body:JSON.stringify({email:'demo@example.test',password})});
 assert.equal(response.status,200);const result=await response.json();assert.ok(result.permissions.includes('users.create'));assert.ok(!JSON.stringify(result).includes(password));
 const cookie=response.headers.get('set-cookie').split(';')[0];response=await fetch(base+'/api/programs',{headers:{Cookie:cookie}});const catalog=await response.json();assert.equal(catalog.programs.length,173);assert.equal(new Set(catalog.programs.map(p=>p.id)).size,173);
 const user=app.store.db.prepare('SELECT * FROM users').get();assert.ok(await verifyPassword(password,user.password_hash));assert.notEqual(user.password_hash,password);
 const audit=app.store.db.prepare('SELECT * FROM audit_log').all();assert.ok(audit.some(row=>row.action==='ADMIN_BOOTSTRAP'));assert.ok(audit.some(row=>row.action==='LOGIN_SUCCESS'));assert.ok(!JSON.stringify(audit).includes(password));
});
test('demo restart preserves existing accounts and edits; a new empty database reconstructs only the initial demonstration',async t=>{
 const dir=directory(t),db=path.join(dir,'first.sqlite');await prepareDemo(environment(db),root);
 let store=await openStore(db,root);const before=store.db.prepare('SELECT * FROM users').get();store.db.prepare('UPDATE users SET name=? WHERE id=?').run('Nombre editado',before.id);store.db.prepare('UPDATE programs SET version=7 WHERE id=?').run('pregrado:arquitectura');store.close();
 const changed=environment(db);changed.OFE_DEMO_ADMIN_PASSWORD='Different-temporary-password-2026!';assert.equal((await prepareDemo(changed,root)).created,false);
 store=await openStore(db,root);const after=store.db.prepare('SELECT * FROM users').get();assert.equal(after.id,before.id);assert.equal(after.name,'Nombre editado');assert.equal(after.password_hash,before.password_hash);assert.equal(store.db.prepare('SELECT version FROM programs WHERE id=?').get('pregrado:arquitectura').version,7);assert.equal(store.db.prepare("SELECT count(*) AS n FROM audit_log WHERE action='ADMIN_BOOTSTRAP'").get().n,1);store.close();
 const fresh=path.join(dir,'fresh.sqlite');await prepareDemo(environment(fresh),root);store=await openStore(fresh,root);assert.notEqual(store.db.prepare('SELECT id FROM users').get().id,before.id);assert.equal(store.db.prepare('SELECT count(*) AS n FROM programs').get().n,173);assert.equal(store.db.prepare('SELECT version FROM programs WHERE id=?').get('pregrado:arquitectura').version,1);store.close();
});
