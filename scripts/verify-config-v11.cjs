'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {createApplication}=require('../server/app.cjs'),{openStore}=require('../server/store.cjs');
const P=require('../shared/ui/brand-palette.js');
const root=path.resolve(__dirname,'..'),PASSWORD='Only-a-test-password-2026!';
async function fixture(t,options={}){
 const app=await createApplication({root,database:':memory:',origin:'http://127.0.0.1:8787',publicEnabled:true,...options});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',data,session,headers={}){const response=await fetch(base+route,{method,redirect:'manual',headers:{Origin:app.origin,...(data?{'Content-Type':'application/json'}:{}),...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{}),...headers},...(data?{body:JSON.stringify(data)}:{})});const text=await response.text();let body;try{body=JSON.parse(text);}catch{body=text;}return {status:response.status,body,headers:response.headers};}
 await app.store.bootstrap('Administrador de pruebas','admin@example.test',PASSWORD);const login=await call('/api/auth/login','POST',{email:'admin@example.test',password:PASSWORD});const admin={cookie:login.headers.get('set-cookie').split(';')[0],csrf:login.body.csrfToken};return {...app,call,admin};
}
test('palette accepts only four brand colors, derives readable text and never configures mode neutrals',()=>{
 assert.deepEqual(P.validate({brand_red:'#a12345'}),{brand_red:'#A12345'});
 for(const changes of [{},[],null,{brand_red:'red'},{brand_gold:'#fff'},{brand_red:'#123456;display:none'},{brand_white:'#FFFFFF'},{bg:'#000000'},{__proto__:null,brand_red:123}])assert.throws(()=>P.validate(changes));
 const colors=['#FFFFFF','#000000','#FFCC00','#960A11','#00FF00','#112233','#777777','#7B7B7B'];
 for(const color of colors){assert.ok(P.contrast(color,P.foreground(color))>=4.5);for(const bg of ['#FFFFFF','#20262E'])assert.ok(P.contrast(P.readable(color,bg),bg)>=4.5);}
 for(const dark of [false,true])for(const key of Object.keys(P.tokens({brand_red:'#A12345',brand_gold:'#AA7711',brand_yellow:'#FFDD00',brand_sand:'#DDCC99'},dark)))assert.ok(!/^--(?:bg|surface|text|uninorte-black|border|danger|success|info)(?:-|$)/.test(key),key);
 assert.equal(P.css(P.defaults),':root:not([data-theme="dark"]){}:root[data-theme="dark"]{}');assert.match(P.css({...P.defaults,brand_red:'#A12345'}),/--action-primary:#A12345/);
});
test('integration status uses deployment origin and permissions; CSS reveals only safe public presentation',async t=>{
 const f=await fixture(t,{publicFrameOrigins:['https://www.uninorte.edu.co']});assert.equal((await f.call('/api/admin/public-access')).status,401);assert.equal((await f.call('/api/admin/appearance')).status,401);
 const status=await f.call('/api/admin/public-access','GET',undefined,f.admin);assert.deepEqual(status.body,{enabled:true,url:'http://127.0.0.1:8787/apps/public/',frameOrigins:['https://www.uninorte.edu.co']});
 const actor=f.store.db.prepare('SELECT * FROM users').get();for(const role of ['simulator_user','program_admin']){f.store.db.prepare('UPDATE users SET role=? WHERE id=?').run(role,actor.id);for(const route of ['/api/admin/appearance','/api/admin/public-access'])assert.equal((await f.call(route,'GET',undefined,f.admin)).status,403);assert.equal((await f.call('/api/admin/appearance','PUT',{version:1,changes:{brand_red:'#123456'}},f.admin)).status,403);}f.store.db.prepare("UPDATE users SET role='system_admin' WHERE id=?").run(actor.id);
 for(const route of ['/shared/ui/brand.css','/auth-assets/brand.css']){const r=await f.call(route);assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/css/);assert.equal(r.headers.get('cache-control'),'no-store');assert.doesNotMatch(r.body,/admin@example|updated_by|scrypt|csrf|version/);}
});
test('appearance changes validate, audit by field, prevent conflicts and roll back atomically',async t=>{
 const f=await fixture(t),before=(await f.call('/api/admin/appearance','GET',undefined,f.admin)).body;assert.deepEqual(before.values,P.defaults);
 assert.equal((await f.call('/api/admin/appearance','PUT',{version:before.version,changes:{brand_red:'#A12345'}},f.admin,{'X-CSRF-Token':'incorrect'})).status,403);assert.equal(f.store.db.prepare("SELECT module FROM audit_log WHERE action='ADMIN_REQUEST_FAILURE' ORDER BY timestamp DESC LIMIT 1").get().module,'settings');
 for(const changes of [{brand_black:'#000000'},{brand_red:'rgba(1,2,3,1)'},{brand_gold:'#ABCDEF\n'},{brand_red:'#123'},{brand_red:123}])assert.equal((await f.call('/api/admin/appearance','PUT',{version:before.version,changes},f.admin)).status,422);
 const financial=JSON.stringify((await f.call('/api/admin/settings','GET',undefined,f.admin)).body),catalog=JSON.stringify(f.store.db.prepare('SELECT * FROM programs').all());
 const saved=await f.call('/api/admin/appearance','PUT',{version:before.version,changes:{brand_red:'#a12345',brand_gold:'#AA7711'}},f.admin);assert.equal(saved.status,200);assert.equal(saved.body.version,before.version+1);assert.equal(saved.body.values.brand_red,'#A12345');
 const audit=(await f.call('/api/admin/audit?category=administrative&module=settings','GET',undefined,f.admin)).body.records.filter(row=>row.entity_type==='appearance');assert.equal(audit.length,2);assert.equal(audit.find(row=>row.field_name==='brand_red').old_value,'"#960A11"');assert.equal(audit.find(row=>row.field_name==='brand_red').new_value,'"#A12345"');assert.equal(new Set(audit.map(row=>row.request_id)).size,1);
 const css=(await f.call('/shared/ui/brand.css')).body;assert.match(css,/--action-primary:#A12345/);assert.match(css,/--uninorte-gold:#AA7711/);
 assert.equal((await f.call('/api/admin/appearance','PUT',{version:before.version,changes:{brand_red:'#234567'}},f.admin)).status,409);
 const unchanged=await f.call('/api/admin/appearance','PUT',{version:saved.body.version,changes:{brand_red:'#A12345'}},f.admin);assert.equal(unchanged.body.version,saved.body.version);
 f.store.db.exec("CREATE TRIGGER fail_appearance_audit BEFORE INSERT ON audit_log WHEN NEW.entity_type='appearance' BEGIN SELECT RAISE(ABORT,'rollback'); END;");assert.equal((await f.call('/api/admin/appearance','PUT',{version:saved.body.version,changes:{brand_yellow:'#AABBCC',brand_sand:'#AACCBB'}},f.admin)).status,500);assert.deepEqual((await f.call('/api/admin/appearance','GET',undefined,f.admin)).body.values,saved.body.values);f.store.db.exec('DROP TRIGGER fail_appearance_audit');
 const restored=await f.call('/api/admin/appearance','PUT',{version:saved.body.version,changes:P.defaults},f.admin);assert.equal(restored.status,200);assert.deepEqual(restored.body.values,P.defaults);assert.equal((await f.call('/shared/ui/brand.css')).body,P.css(P.defaults));assert.equal(JSON.stringify(f.store.db.prepare('SELECT * FROM programs').all()),catalog);assert.equal(JSON.stringify((await f.call('/api/admin/settings','GET',undefined,f.admin)).body),financial);
});
test('appearance migration and custom palette survive restart without altering existing users, catalog or finance settings',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-brand-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const file=path.join(dir,'data.sqlite');let store=await openStore(file,root);await store.bootstrap('Prueba','test@example.test',PASSWORD);const programs=JSON.stringify(store.db.prepare('SELECT * FROM programs').all()),users=JSON.stringify(store.db.prepare('SELECT * FROM users').all()),financial=JSON.stringify(store.db.prepare('SELECT * FROM global_settings').all());
 store.db.exec("DROP TABLE appearance_settings; DELETE FROM schema_migrations WHERE name='003-appearance.sql';");store.close();store=await openStore(file,root);assert.deepEqual(JSON.parse(store.db.prepare('SELECT data FROM appearance_settings').get().data),P.defaults);assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM programs').all()),programs);assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM users').all()),users);assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM global_settings').all()),financial);
 store.db.prepare('UPDATE appearance_settings SET data=?,version=7 WHERE id=1').run(JSON.stringify({...P.defaults,brand_red:'#123456'}));store.close();store=await openStore(file,root);assert.equal(store.db.prepare('SELECT version FROM appearance_settings').get().version,7);assert.equal(JSON.parse(store.db.prepare('SELECT data FROM appearance_settings').get().data).brand_red,'#123456');assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM programs').all()),programs);assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM users').all()),users);assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM global_settings').all()),financial);store.close();
});
test('embed code is exact and the preview helper rejects other origins or non-public destinations',()=>{
 const vm=require('node:vm'),c=vm.createContext({location:{origin:'https://simulador-ofe-pruebas.onrender.com'},URL,SimuladorOFE:{register(){}},document:{},OFEBrandPalette:P});c.window=c;vm.runInContext(fs.readFileSync(path.join(root,'shared/admin/integration-settings.js'),'utf8'),c);
 const url='https://simulador-ofe-pruebas.onrender.com/apps/public/';assert.equal(c.OFEIntegrationSettings.publicURL(url),url);assert.match(c.OFEIntegrationSettings.iframeCode(url),/src="https:\/\/simulador-ofe-pruebas.onrender.com\/apps\/public\/"/);
 for(const value of ['https://evil.example/apps/public/','https://simulador-ofe-pruebas.onrender.com/apps/ofe/','javascript:alert(1)',url+'?admin=users'])assert.throws(()=>c.OFEIntegrationSettings.publicURL(value));
});

test('public preview notifies its same-origin parent only after startup succeeds or fails',async()=>{
 const vm=require('node:vm'),source=fs.readFileSync(path.join(root,'apps/public/simulador-assets/js/09-bootstrap.js'),'utf8');
 for(const preview of [true,false])for(const success of [true,false]){
  const messages=[],elements=Object.fromEntries(['main-content','app-startup-status'].map(id=>[id,{setAttribute(){},removeAttribute(){}}]));
  const c=vm.createContext({URLSearchParams,OFE_PUBLIC:{},location:{search:preview?'?preview=1&reload=7':'',origin:'https://example.test'},parent:{postMessage:(message,origin)=>messages.push({message,origin})},document:{readyState:'complete',getElementById:id=>elements[id]},SimuladorOFE:{async init(){if(!success)throw Error('Unavailable');}},console:{error(){}}});c.window=c;vm.runInContext(source,c);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(messages.length,preview?1:0);if(preview){assert.equal(messages[0].origin,'https://example.test');assert.equal(messages[0].message.previewId,'7');assert.equal(messages[0].message.type,success?'ofe:public-ready':'ofe:public-error');}
  assert.equal(elements['main-content'].inert,!success);assert.equal(elements['app-startup-status'].hidden,success);
 }
});
