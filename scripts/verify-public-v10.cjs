'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {createApplication}=require('../server/app.cjs');
const {publicOptions,frameOrigins,publicAssets,publicSettings}=require('../server/public-access.cjs');
const {selectorContext}=require('./test-support/selector-context.cjs');
const root=path.resolve(__dirname,'..'),PASSWORD='Only-a-test-password-2026!';
async function fixture(t,options={}){
 const app=await createApplication({root,database:':memory:',origin:'http://127.0.0.1:8787',publicEnabled:true,...options});
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
 const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',data,session){
  const response=await fetch(base+route,{method,redirect:'manual',headers:{Origin:app.origin,...(data?{'Content-Type':'application/json'}:{}),...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},...(data?{body:JSON.stringify(data)}:{})});
  const text=await response.text();let body;try{body=JSON.parse(text);}catch{body=text;}return {status:response.status,headers:response.headers,body};
 }
 async function login(){await app.store.bootstrap('Administrador de prueba','admin@example.test',PASSWORD);const r=await call('/api/auth/login','POST',{email:'admin@example.test',password:PASSWORD});assert.equal(r.status,200);return {cookie:r.headers.get('set-cookie').split(';')[0],csrf:r.body.csrfToken};}
 return {...app,base,call,login};
}
test('public activation is explicit and iframe origins reject paths, wildcard and header injection',async t=>{
 assert.equal(publicOptions({}).publicEnabled,false);assert.equal(publicOptions({OFE_PUBLIC_ENABLED:'1'}).publicEnabled,true);assert.throws(()=>publicOptions({OFE_PUBLIC_ENABLED:'true'}));
 assert.deepEqual(frameOrigins(['https://www.uninorte.edu.co/','https://www.uninorte.edu.co']),['https://www.uninorte.edu.co']);
 for(const value of ['*','https://*.uninorte.edu.co','https://site.test; frame-ancestors *','https://site.test\n','http://site.test','https://site.test/page','https://u:p@site.test','https://site.test?x=1',"https://site.test'"])assert.throws(()=>frameOrigins([value]),value);
 const f=await fixture(t,{publicEnabled:false});assert.equal((await f.call('/simulador/')).status,303);assert.equal((await f.call('/api/public/programs')).status,404);assert.equal((await f.call('/shared/settings/simulation-settings.js')).status,303);
});
test('public document, all referenced assets and HEAD work without a session; internal resources stay protected',async t=>{
 const f=await fixture(t,{publicFrameOrigins:['https://www.uninorte.edu.co','https://uninorte.edu.co']});
 const link=await f.call('/simulador/');assert.equal(link.status,303);assert.equal(link.headers.get('location'),'/apps/public/');
 for(const route of ['/apps/public/','/apps/public/index.html']){
  const r=await f.call(route);assert.equal(r.status,200);assert.match(r.body,/Simulador público/);assert.doesNotMatch(r.body,/data-tab="(?:5|6|10|11)"/);
  assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'self' https:\/\/www.uninorte.edu.co https:\/\/uninorte.edu.co;/);assert.equal(r.headers.get('x-frame-options'),null);assert.equal(r.headers.get('set-cookie'),null);
  assert.equal((await f.call(route,'HEAD')).body,'');
 }
 assert.equal((await f.call('/apps/public/runtime-config.js')).status,200);
 for(const route of publicAssets(root)){const r=await f.call(route);assert.equal(r.status,200,route);assert.equal(r.headers.get('set-cookie'),null,route);}
 for(const route of ['/apps/ofe/','/admin/programs','/runtime-config.js','/shared/admin/admin-ui.js','/server/app.cjs','/var/ofe.sqlite','/apps/ofe/simulador-assets/js/01-core-ui.js'])assert.equal((await f.call(route)).status,303,route);
 for(const route of ['/login','/api/public/programs','/api/admin/users']){const r=await f.call(route);assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.equal(r.headers.get('x-frame-options'),'DENY');}
 for(const route of ['/api/programs','/api/simulation-settings','/api/admin/users','/api/admin/audit'])assert.equal((await f.call(route)).status,401,route);
 assert.equal((await f.call('/api/public/admin/users')).status,404);
});
test('public data is active-only, read-only and follows audited administrative changes without leaking actor metadata',async t=>{
 assert.deepEqual(publicSettings({values:{default_interest_rate:1,default_installments:6,garantisa_cp_percent:4,garantisa_lp_percent:3,private_future_field:'secret'},updated_by:'private'}),{values:{default_interest_rate:1,default_installments:6,garantisa_cp_percent:4,garantisa_lp_percent:3}});
 const f=await fixture(t),admin=await f.login();
 const initial=await f.call('/api/public/programs');assert.equal(initial.body.programs.length,173);assert.equal(new Set(initial.body.programs.map(p=>p.id)).size,173);
 const allowed=['id','codigo','nombre','nivel','subnivel','valorMatricula','valorIdiomas','semestres','activo'].sort();assert.deepEqual(Object.keys(initial.body.programs[0]).sort(),allowed);
 const rows=(await f.call('/api/programs','GET',undefined,admin)).body.programs,p=rows.find(p=>p.nivel==='pregrado');
 const changed=await f.call('/api/admin/programs/'+encodeURIComponent(p.id),'PUT',{version:p.version,changes:{valorMatricula:p.valorMatricula+1,valorIdiomas:175000}},admin);assert.equal(changed.status,200);
 let result=await f.call('/api/public/programs/'+encodeURIComponent(p.id));assert.equal(result.status,200);assert.equal(result.body.valorIdiomas,175000);assert.equal(result.body.valorMatricula,p.valorMatricula+1);assert.deepEqual(Object.keys(result.body).sort(),allowed);
 const settings=(await f.call('/api/admin/settings','GET',undefined,admin)).body;assert.equal((await f.call('/api/admin/settings','PUT',{version:settings.version,changes:{garantisa_cp_percent:5,default_interest_rate:1.25}},admin)).status,200);
 const exposed=(await f.call('/api/public/simulation-settings')).body;assert.deepEqual(Object.keys(exposed),['values']);assert.equal(exposed.values.garantisa_cp_percent,5);assert.equal(exposed.values.default_interest_rate,1.25);
 const before=JSON.stringify(f.store.db.prepare('SELECT * FROM programs').all());
 for(const route of ['/api/public/programs','/api/public/programs/'+encodeURIComponent(p.id),'/api/public/simulation-settings'])for(const method of ['POST','PUT','PATCH','DELETE']){assert.equal((await f.call(route,method,{},admin)).status,405);assert.equal((await f.call(route,method,{})).status,401);}
 assert.equal(JSON.stringify(f.store.db.prepare('SELECT * FROM programs').all()),before);
 assert.equal((await f.call('/api/admin/programs/'+encodeURIComponent(p.id),'PUT',{version:changed.body.program.version,changes:{activo:false}},admin)).status,200);
 assert.equal((await f.call('/api/public/programs')).body.programs.length,172);assert.equal((await f.call('/api/public/programs/'+encodeURIComponent(p.id))).status,404);assert.equal((await f.call('/api/public/programs/not-present')).status,404);
});
test('connected public calculator uses live catalog and parameters, preserves results and fails closed on unavailable API',async t=>{
 const f=await fixture(t),admin=await f.login();
 const privateRows=(await f.call('/api/programs','GET',undefined,admin)).body.programs,p=privateRows.find(p=>p.nivel==='pregrado');
 await f.call('/api/admin/programs/'+encodeURIComponent(p.id),'PUT',{version:p.version,changes:{valorIdiomas:175000}},admin);
 const settings=(await f.call('/api/admin/settings','GET',undefined,admin)).body;await f.call('/api/admin/settings','PUT',{version:settings.version,changes:{garantisa_cp_percent:5,default_interest_rate:1.25}},admin);
 const calls=[],transport=(url,options)=>{calls.push(url);return fetch(f.base+url,options);};
 const {context:c,elements:e,button}=selectorContext('public',{publicApi:true,fetch:transport});await c.SimuladorOFE.init();assert.equal(c.SimuladorOFE.catalog.source,'api');assert.equal(c.ProgramCatalog.capabilities.write,false);
 assert.equal(e.tasa1.value,'1.25');assert.equal(c.SimuladorOFE.catalog.programs.find(row=>row.id===p.id).valorIdiomas,175000);
 e.prog1.value=p.id;c.setMat(1);e['cont1-val'].value=0;await c.runCalculation(button(),1,()=>c.calcular1(),'Prueba pública');
 const result=c.SimuladorOFE.state.results.shortTerm;assert.equal(result.garantisa,result.financiado*.05);assert.equal(result.settingsSnapshot.values.default_interest_rate,1.25);const saved=JSON.stringify(result);
 assert.ok(calls.every(route=>route.startsWith('/api/public/')));assert.equal(c.OFE_SERVER,undefined);
 c.fetch=async()=>{throw TypeError('Unavailable');};await assert.rejects(c.OFEGlobalSettings.renew(1),/No fue posible cargar/);assert.equal(JSON.stringify(result),saved);
 const failed=selectorContext('public',{publicApi:true,fetch:async()=>({ok:false,status:503})});await assert.rejects(failed.context.SimuladorOFE.init(),/HTTP 503/);assert.equal(failed.context.SimuladorOFE.state.initialized,undefined);
});
