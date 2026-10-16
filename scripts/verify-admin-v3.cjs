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
const filters=require('../shared/admin/filters.js');
test('program level multiselect composes with accent-insensitive search and status',()=>{
 const rows=[{nombre:'Ingeniería Electrónica',nivel:'pregrado',activo:true},{nombre:'Medicina',nivel:'pregrado',activo:true},{nombre:'Ingeniería avanzada',nivel:'posgrado',activo:false}];
 assert.equal(filters.programs(rows).length,3);assert.equal(filters.programs(rows,{levels:['pregrado']}).length,2);assert.equal(filters.programs(rows,{levels:['posgrado']}).length,1);assert.equal(filters.programs(rows,{levels:['pregrado','posgrado']}).length,3);assert.equal(filters.programs(rows,{query:'ingenieria',levels:['pregrado']}).length,1);assert.equal(filters.programs(rows,{query:'ingenieria',status:'inactive'}).length,1);
 assert.equal(filters.users([{name:'Édgar',email:'example@test.co',role:'system_admin',status:'active'}],{query:'edgar',role:'system_admin',status:'active'}).length,1);
});
test('settings permissions, field validation, optimistic versions and atomic audit are enforced',async t=>{
 const f=await fixture(t),admin=await f.login();
 const before=(await f.call('/api/admin/settings','GET',undefined,admin)).body;
 assert.deepEqual(before.values,{default_interest_rate:1.53,default_installments:6,garantisa_cp_percent:4.17,garantisa_lp_percent:2.86});
 assert.equal((await f.call('/api/admin/settings')).status,401);
 assert.equal((await f.call('/api/admin/settings','PUT',{version:before.version,changes:{default_interest_rate:1.3}},admin,{'X-CSRF-Token':'incorrect'})).status,403);
 for(const query of ['from=2026-02-30','from=2026-10-16&to=2026-10-15'])assert.equal((await f.call('/api/admin/audit?'+query,'GET',undefined,admin)).status,422);
 for(const role of ['simulator_user','program_admin']){
  const {session}=await f.create(admin,role+'@example.test',role);
  assert.equal((await f.call('/api/admin/settings','GET',undefined,session)).status,403);
  assert.equal((await f.call('/api/admin/settings','PUT',{version:before.version,changes:{default_interest_rate:1.3}},session)).status,403);
  assert.equal((await f.call('/admin/settings','GET',undefined,session)).status,403);
  assert.equal((await f.call('/api/simulation-settings','GET',undefined,session)).status,200);
 }
 for(const changes of [{default_interest_rate:-1},{default_interest_rate:11},{default_interest_rate:'1.3'},{default_interest_rate:1.333},{default_installments:0},{default_installments:1.5},{default_installments:61},{garantisa_cp_percent:101},{garantisa_lp_percent:-1},{unknown:1}])assert.equal((await f.call('/api/admin/settings','PUT',{version:before.version,changes},admin)).status,422,JSON.stringify(changes));
 let response=await f.call('/api/admin/settings','PUT',{version:before.version,changes:{default_interest_rate:1.25}},admin);assert.equal(response.status,200);
 response=await f.call('/api/admin/settings','PUT',{version:response.body.version,changes:{default_interest_rate:1.3,default_installments:8,garantisa_cp_percent:5,garantisa_lp_percent:3}},admin);assert.equal(response.status,200);assert.equal(response.body.version,before.version+2);assert.equal(response.body.updated_by,admin.user.id);
 assert.equal((await f.call('/api/admin/settings','PUT',{version:before.version,changes:{default_installments:4}},admin)).status,409);
 let records=(await f.call('/api/admin/audit?module=settings&action=CONFIG_UPDATE&entity=default_interest_rate&result=SUCCESS','GET',undefined,admin)).body.records;assert.equal(records.length,2);assert.ok(records.some(x=>x.old_value==='1.25'&&x.new_value==='1.3'));
 const state=JSON.stringify(response.body);
 const unchanged=await f.call('/api/admin/settings','PUT',{version:response.body.version,changes:{default_interest_rate:1.3}},admin);assert.equal(JSON.stringify(unchanged.body),state);
 f.store.db.exec("CREATE TRIGGER fail_config_audit BEFORE INSERT ON audit_log WHEN NEW.action='CONFIG_UPDATE' BEGIN SELECT RAISE(ABORT,'test rollback'); END;");
 assert.equal((await f.call('/api/admin/settings','PUT',{version:response.body.version,changes:{default_interest_rate:0,default_installments:9}},admin)).status,500);
 const after=(await f.call('/api/simulation-settings','GET',undefined,admin)).body;assert.equal(JSON.stringify(after),state);f.store.db.exec('DROP TRIGGER fail_config_audit');
 assert.equal((await f.call('/api/admin/settings','PUT',{version:after.version,changes:{default_interest_rate:0,garantisa_cp_percent:0}},admin)).status,200);
});
test('new configuration migration preserves existing catalog, users and settings on restart',async t=>{
 const fs=require('node:fs'),os=require('node:os'),{openStore}=require('../server/store.cjs');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-settings-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const file=path.join(dir,'data.sqlite');let store=await openStore(file,root);
 store.db.prepare('UPDATE global_settings SET data=?,version=7 WHERE id=1').run(JSON.stringify({default_interest_rate:1.3,default_installments:8,garantisa_cp_percent:5,garantisa_lp_percent:3}));const catalog=JSON.stringify(store.db.prepare('SELECT id,data FROM programs ORDER BY rowid').all());store.close();store=await openStore(file,root);assert.equal(store.db.prepare('SELECT version FROM global_settings').get().version,7);assert.equal(JSON.stringify(store.db.prepare('SELECT id,data FROM programs ORDER BY rowid').all()),catalog);store.close();
});
test('simulation snapshots retain old results and exports; new rate, installments and Garantisa apply after reset',async()=>{
 const vm=require('node:vm'),{selectorContext}=require('./test-support/selector-context.cjs'),{read}=require('./test-support/catalog-context.cjs');
 const {context:c,elements:e,button}=selectorContext('ofe');await c.SimuladorOFE.init();
 let settings={version:1,updated_at:new Date().toISOString(),values:{default_interest_rate:1.25,default_installments:6,garantisa_cp_percent:4.17,garantisa_lp_percent:2.86}};
 c.OFE_SERVER={};c.OFEAuth={request:async()=>JSON.parse(JSON.stringify(settings))};c.NodeFilter={SHOW_TEXT:4};c.document.createTreeWalker=()=>({nextNode:()=>null});
 vm.runInContext(read('shared/settings/simulation-settings.js'),c);await c.SimuladorOFE.modules['global-simulation-settings'].init();
 assert.equal(e.tasa1.value,'1.25');assert.equal(e.plazo1.value,'6');assert.equal(e.plazo3.value,'12');assert.equal(e['refi-cuotas-nva'].value,'24');
 const program=c.SimuladorOFE.catalog.programs.find(p=>p.nivel==='pregrado');e.prog1.value=program.id;c.setMat(1);c.calcular1();const old=c.SimuladorOFE.state.results.shortTerm;
 assert.equal(old.garantisa,old.financiado*.0417);assert.equal(old.settingsSnapshot.version,1);const serialized=JSON.stringify(old);
 settings={version:2,updated_at:new Date().toISOString(),values:{default_interest_rate:1.3,default_installments:8,garantisa_cp_percent:5,garantisa_lp_percent:3}};c.OFEGlobalSettings.adopt(settings);assert.equal(c.runFinancialSelfTests().ok,true);
 assert.equal(JSON.stringify(old),serialized);assert.equal(e.tasa1.value,'1.25');assert.equal(c.garantisaLabel(old),'4,17');
 let exported;c.OFEExcel.download=async report=>(exported=report);await c.expXLS1();assert.equal(exported.sections.find(section=>section.title==='Garantisa').fields.find(field=>field.label==='Porcentaje aplicado').value,.0417);
 await c.limpiarTab(1,true);assert.equal(e.tasa1.value,'1.3');assert.equal(e.plazo1.value,'8');e.prog1.value=program.id;c.setMat(1);await c.runCalculation(button(),1,()=>c.calcular1(),'Prueba');const next=c.SimuladorOFE.state.results.shortTerm;
 assert.ok(Math.abs(next.tm-.013)<1e-12);assert.equal(next.n,8);assert.equal(next.garantisa,next.financiado*.05);assert.equal(c.garantisaLabel(next),'5,00');await c.expXLS1();assert.equal(exported.sections.find(section=>section.title==='Garantisa').fields.find(field=>field.label==='Porcentaje aplicado').value,.05);
 c.SimuladorOFE.state.results.languages={...next,isMixto:true,finCP:4000000,finLP:6000000,garCP:200000,garLP:180000,garantisa:380000};await c.expXLSIdiomas();const initial=exported.sections.find(section=>section.title==='Aporte inicial').fields;assert.equal(initial.find(field=>field.label==='Garantisa corto plazo').value,200000);assert.equal(initial.find(field=>field.label==='Garantisa largo plazo').value,180000);assert.equal(JSON.stringify(old),serialized);
 // Explicit user inputs survive preparation; zero is a valid setting and rate.
 await c.limpiarTab(2,true);e.tasa2.value=0;await c.OFEGlobalSettings.prepare(2);assert.equal(e.tasa2.value,'0');
 const projection=c.OFEGlobalSettings.withSnapshot(next.settingsSnapshot,()=>c.proyectarLP(10000000,60,1,3,0));assert.equal(projection.acumGarantisa,540000);assert.equal(projection.plazoPago,27);
 settings={...settings,version:3,values:{...settings.values,default_interest_rate:0,garantisa_cp_percent:0}};await c.limpiarTab(1,true);e.prog1.value=program.id;c.setMat(1);c.calcular1();assert.equal(c.SimuladorOFE.state.results.shortTerm.garantisa,0);assert.equal(c.SimuladorOFE.state.results.shortTerm.totInt,0);
});

test('migration upgrades an existing v1 database without replacing users or 173 program records',async t=>{
 const fs=require('node:fs'),os=require('node:os'),{DatabaseSync}=require('node:sqlite'),{openStore}=require('../server/store.cjs');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-upgrade-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const seed=await openStore(':memory:',root),programs=seed.db.prepare('SELECT id,data,version FROM programs ORDER BY rowid').all();seed.close();
 const file=path.join(dir,'v1.sqlite'),old=new DatabaseSync(file);old.exec(fs.readFileSync(path.join(root,'server/migrations/001-autonomous.sql'),'utf8'));old.exec('CREATE TABLE schema_migrations(name TEXT PRIMARY KEY,applied_at TEXT NOT NULL)');old.prepare('INSERT INTO schema_migrations VALUES(?,?)').run('001-autonomous.sql','2026-10-01T00:00:00Z');
 old.prepare('INSERT INTO roles VALUES(?)').run('system_admin');old.prepare('INSERT INTO users(id,name,email,password_hash,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run('existing-admin','Existing','existing@example.test','fixture-hash','system_admin','active','2026-10-01','2026-10-01');
 for(const row of programs)old.prepare('INSERT INTO programs(id,data,version) VALUES(?,?,?)').run(row.id,row.data,row.version);old.close();
 const store=await openStore(file,root);assert.equal(store.db.prepare('SELECT count(*) n FROM programs').get().n,173);assert.equal(JSON.stringify(store.db.prepare('SELECT id,data,version FROM programs ORDER BY rowid').all()),JSON.stringify(programs));assert.equal(store.db.prepare('SELECT password_hash FROM users WHERE id=?').get('existing-admin').password_hash,'fixture-hash');assert.ok(store.permissions('system_admin').includes('settings.update'));assert.equal(store.db.prepare('SELECT version FROM global_settings').get().version,1);store.close();
});

test('language-only program updates persist, retain tuition and produce a field audit',async t=>{
 const f=await fixture(t),admin=await f.login();
 const before=(await f.call('/api/programs','GET',undefined,admin)).body.programs.find(p=>p.nivel==='pregrado');
 const changed=await f.call('/api/admin/programs/'+encodeURIComponent(before.id),'PUT',{version:before.version,changes:{valorIdiomas:175000}},admin);
 assert.equal(changed.status,200,JSON.stringify(changed.body));
 const after=(await f.call('/api/programs','GET',undefined,admin)).body.programs.find(p=>p.id===before.id);
 assert.equal(after.valorIdiomas,175000);assert.equal(after.valorMatricula,before.valorMatricula);assert.equal(after.version,before.version+1);
 const records=(await f.call('/api/admin/audit?module=programs&action=PROGRAM_UPDATE&result=SUCCESS','GET',undefined,admin)).body.records.filter(row=>row.entity_id===before.id);
 assert.equal(records.length,1);assert.equal(records[0].field_name,'valorIdiomas');assert.equal(Number(JSON.parse(records[0].old_value)),before.valorIdiomas);assert.equal(JSON.parse(records[0].new_value),175000);
 assert.equal((await f.call('/api/admin/programs/'+encodeURIComponent(before.id),'PUT',{version:before.version,changes:{valorIdiomas:200000}},admin)).status,409);
});
