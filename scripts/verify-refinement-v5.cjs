'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm'),fs=require('node:fs');
const {createApplication}=require('../server/app.cjs');
const root=path.resolve(__dirname,'..');
async function fixture(t){
 const app=await createApplication({root,database:':memory:',origin:'http://127.0.0.1:8787'});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
 await app.store.bootstrap('Administrador de prueba','admin@example.test','Only-a-test-password-2026!');
 const address='http://127.0.0.1:'+app.server.address().port;
 const response=await fetch(address+'/api/auth/login',{method:'POST',headers:{Origin:app.origin,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.test',password:'Only-a-test-password-2026!'})});const session=await response.json(),cookie=response.headers.get('set-cookie').split(';')[0];
 const call=async(route,method='GET',body)=>{const result=await fetch(address+route,{method,headers:{Cookie:cookie,Origin:app.origin,'X-CSRF-Token':session.csrfToken,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:result.status,body:await result.json()};};
 return {...app,call,user:session.user};
}
test('administrative audit excludes security events before pagination and preserves underlying records',async t=>{
 const f=await fixture(t),actor=f.store.db.prepare('SELECT * FROM users').get();
 for(let i=0;i<105;i++)f.store.audit(actor,i%2?'PASSWORD_CHANGE':'LOGIN_SUCCESS',i%2?'users':'auth',{type:'user',id:actor.id,name:actor.name},null,null,null,'security-'+i);
 for(const [action,module] of [['USER_CREATE','users'],['USER_UPDATE','users'],['USER_ROLE_CHANGE','users'],['USER_ACTIVATE','users'],['USER_DEACTIVATE','users'],['PROGRAM_UPDATE','programs'],['CONFIG_UPDATE','settings']])f.store.audit(actor,action,module,{type:'test',id:'entity',name:'Programa prueba'},'name','Anterior','Nuevo',action);
 f.store.audit(actor,'ADMIN_REQUEST_FAILURE','users',{type:'request'},null,null,null,'denied','DENIED');
 const data=(await f.call('/api/admin/audit?category=administrative')).body;
 assert.equal(data.records.length,8);assert.equal(data.nextOffset,null);assert.ok(data.records.every(row=>['USER_CREATE','USER_UPDATE','USER_ROLE_CHANGE','USER_ACTIVATE','USER_DEACTIVATE','ADMIN_BOOTSTRAP','PROGRAM_UPDATE','CONFIG_UPDATE'].includes(row.action)));
 assert.equal(f.store.db.prepare("SELECT count(*) n FROM audit_log WHERE action IN ('PASSWORD_CHANGE','LOGIN_SUCCESS')").get().n,106);
 for(const actorQuery of [actor.id,'ADMIN@EXAMPLE.TEST','Administrador'])assert.equal((await f.call('/api/admin/audit?category=administrative&actor='+encodeURIComponent(actorQuery))).body.records.length,8);
 f.store.db.prepare("UPDATE users SET role='program_admin' WHERE id=?").run(actor.id);const scoped=await f.call('/api/admin/audit?category=administrative');assert.equal(scoped.body.records.length,1);assert.equal(scoped.body.records[0].module,'programs');
 f.store.db.prepare("UPDATE users SET role='simulator_user' WHERE id=?").run(actor.id);assert.equal((await f.call('/api/admin/audit?category=administrative')).status,403);
});
test('local audit days include exactly midnight through end of day in Colombia across UTC dates',async t=>{
 const f=await fixture(t),actor=f.store.db.prepare('SELECT * FROM users').get();
 const times=['2026-10-15T04:59:59.999Z','2026-10-15T05:00:00.000Z','2026-10-16T04:59:59.999Z','2026-10-16T05:00:00.000Z'];
 for(let i=0;i<times.length;i++){f.store.audit(actor,'PROGRAM_UPDATE','programs',{type:'program',id:String(i)},'valorMatricula',1,2,'boundary-'+i);f.store.db.prepare('UPDATE audit_log SET timestamp=? WHERE request_id=?').run(times[i],'boundary-'+i);}
 const query='/api/admin/audit?category=administrative&module=programs&from=2026-10-15&to=2026-10-15&timeZone=America%2FBogota';const result=await f.call(query);assert.equal(result.status,200);assert.deepEqual(result.body.records.map(x=>x.entity_id).sort(),['1','2']);
 assert.equal((await f.call('/api/admin/audit?timeZone=Europe%2FMadrid')).status,422);assert.equal((await f.call('/api/admin/audit?from=2026-02-30&timeZone=America%2FBogota')).status,422);
 assert.equal(f.store.db.prepare("SELECT timestamp FROM audit_log WHERE request_id='boundary-0'").get().timestamp,times[0]);
});
test('parameter timestamps identify actual per-field modifications without inventing update history',async t=>{
 const f=await fixture(t),before=(await f.call('/api/admin/settings')).body;assert.deepEqual(before.fieldUpdates,{});
 const saved=await f.call('/api/admin/settings','PUT',{version:before.version,changes:{default_interest_rate:1.25}});assert.equal(saved.status,200);
 const after=(await f.call('/api/admin/settings')).body;assert.deepEqual(Object.keys(after.fieldUpdates),['default_interest_rate']);assert.ok(Number.isFinite(Date.parse(after.fieldUpdates.default_interest_rate)));assert.equal(after.values.default_installments,6);
});
test('shared date formatting is independent of browser timezone and hides zone identifiers',()=>{
 const c=vm.createContext({});c.window=c;vm.runInContext(fs.readFileSync(path.join(root,'shared/ui/dates.js'),'utf8'),c);
 assert.match(c.OFEDates.dateTime('2026-10-15T19:35:00.000Z'),/2:35/);assert.match(c.OFEDates.short('2026-10-15T04:59:59.999Z'),/^14/);
 assert.ok(!/UTC|GMT|Bogot|Colombia/.test(c.OFEDates.dateTime('2026-10-15T19:35:00Z')));assert.equal(c.OFEDates.dateTime(null),'Sin cambios registrados');assert.equal(c.OFEDates.dateTime('invalid'),'Fecha no disponible');
});
