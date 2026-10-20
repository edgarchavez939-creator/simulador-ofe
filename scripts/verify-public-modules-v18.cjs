'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {createApplication}=require('../server/app.cjs'),{openStore}=require('../server/store.cjs');
const schema=require('../shared/settings/public-modules.js');
const {selectorContext}=require('./test-support/selector-context.cjs');
const root=path.resolve(__dirname,'..'),PASSWORD='Only-test-public-modules-2026!';
async function fixture(t){
 const app=await createApplication({root,database:':memory:',origin:'http://127.0.0.1:8787',publicEnabled:true});await app.store.bootstrap('QA','public-modules@example.test',PASSWORD);await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',data,session,extra={}){const r=await fetch(base+route,{method,headers:{Origin:app.origin,...(data?{'Content-Type':'application/json'}:{}),...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{}),...extra},...(data?{body:JSON.stringify(data)}:{})});return {status:r.status,headers:r.headers,body:await r.json()};}
 const response=await call('/api/auth/login','POST',{email:'public-modules@example.test',password:PASSWORD});return {app,call,admin:{cookie:response.headers.get('set-cookie').split(';')[0],csrf:response.body.csrfToken}};
}
test('public modules expose only boolean visibility; admin permissions, CSRF, validation and conflicts remain enforced',async t=>{
 const f=await fixture(t),route='/api/admin/public-modules';assert.equal((await f.call(route)).status,401);assert.equal((await f.call(route,'PUT',{version:1,changes:{bank:false}})).status,401);
 const pub=await f.call('/api/public/modules');assert.equal(pub.status,200);assert.deepEqual(pub.body,{values:schema.defaults});assert.equal(pub.headers.get('cache-control'),'no-store');
 const before=(await f.call(route,'GET',undefined,f.admin)).body;
 for(const role of ['program_admin','simulator_user']){f.app.store.db.prepare('UPDATE users SET role=?').run(role);assert.equal((await f.call(route,'GET',undefined,f.admin)).status,403);assert.equal((await f.call(route,'PUT',{version:before.version,changes:{bank:false}},f.admin)).status,403);}f.app.store.db.prepare("UPDATE users SET role='system_admin'").run();
 assert.equal((await f.call(route,'PUT',{version:before.version,changes:{bank:false}},f.admin,{'X-CSRF-Token':'wrong'})).status,403);
 for(const changes of [{bank:'false'},{bank:0},{admin:true},{},[]])assert.equal((await f.call(route,'PUT',{version:before.version,changes},f.admin)).status,422);
 const result=await f.call(route,'PUT',{version:before.version,changes:{bank:false,mixed:false}},f.admin);assert.equal(result.status,200);assert.equal(result.body.version,before.version+1);assert.equal(result.body.values.bank,false);
 assert.equal((await f.call(route,'PUT',{version:before.version,changes:{history:false}},f.admin)).status,409);
 const unchanged=await f.call(route,'PUT',{version:result.body.version,changes:{bank:false}},f.admin);assert.equal(unchanged.body.version,result.body.version);
 const records=f.app.store.db.prepare("SELECT * FROM audit_log WHERE entity_type='public_modules'").all();assert.equal(records.length,2);assert.ok(records.every(row=>row.module==='settings'&&row.action==='CONFIG_UPDATE'&&row.old_value==='true'&&row.new_value==='false'));assert.equal(new Set(records.map(row=>row.request_id)).size,1);
 assert.deepEqual((await f.call('/api/public/modules')).body,{values:result.body.values});
});
test('public module updates roll back on audit failure and allow an intentional empty public menu',async t=>{
 const f=await fixture(t),route='/api/admin/public-modules',before=(await f.call(route,'GET',undefined,f.admin)).body;
 const catalog=JSON.stringify(f.app.store.db.prepare('SELECT * FROM programs').all()),settings=JSON.stringify(f.app.store.db.prepare('SELECT * FROM global_settings').all());
 f.app.store.db.exec("CREATE TRIGGER fail_public_modules BEFORE INSERT ON audit_log WHEN NEW.entity_type='public_modules' BEGIN SELECT RAISE(ABORT,'rollback'); END;");
 assert.equal((await f.call(route,'PUT',{version:before.version,changes:{shortTerm:false,bank:false}},f.admin)).status,500);assert.deepEqual((await f.call(route,'GET',undefined,f.admin)).body,before);f.app.store.db.exec('DROP TRIGGER fail_public_modules');
 const none=Object.fromEntries(Object.keys(schema.defaults).map(key=>[key,false]));const saved=await f.call(route,'PUT',{version:before.version,changes:none},f.admin);assert.equal(saved.status,200);assert.deepEqual((await f.call('/api/public/modules')).body,{values:none});
 assert.equal(JSON.stringify(f.app.store.db.prepare('SELECT * FROM programs').all()),catalog);assert.equal(JSON.stringify(f.app.store.db.prepare('SELECT * FROM global_settings').all()),settings);
});
test('the visibility migration preserves catalog and survives a persistent database restart',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-public-modules-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const file=path.join(dir,'db.sqlite');let store=await openStore(file,root);
 await store.bootstrap('Migration QA','migration@example.test',PASSWORD);
 const before=JSON.stringify(store.db.prepare('SELECT * FROM programs').all()),users=JSON.stringify(store.db.prepare('SELECT * FROM users').all()),settings=JSON.stringify(store.db.prepare('SELECT * FROM global_settings').all());
 store.db.exec("DROP TABLE public_module_settings; DELETE FROM schema_migrations WHERE name='004-public-modules.sql';");store.close();store=await openStore(file,root);
 assert.deepEqual(JSON.parse(store.db.prepare('SELECT data FROM public_module_settings').get().data),schema.defaults);assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM users').all()),users);assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM programs').all()),before);assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM global_settings').all()),settings);
 store.db.prepare('UPDATE public_module_settings SET data=?,version=3 WHERE id=1').run(JSON.stringify({...schema.defaults,bank:false}));store.close();store=await openStore(file,root);
 try{assert.equal(store.db.prepare('SELECT version FROM public_module_settings').get().version,3);assert.equal(JSON.parse(store.db.prepare('SELECT data FROM public_module_settings').get().data).bank,false);assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM programs').all()),before);}finally{store.close();}
});
function navigation(values,internal=false){
 let definition;const buttons=schema.definitions.map(item=>({dataset:{tab:String(item.tab),action:'switch-tab'},hidden:false,classList:{contains:()=>false},matches:()=>true}));
 const labels=['SIMULAR','ANALIZAR','HISTORIAL'].map(group=>({hidden:false,classList:{contains:name=>name==='nav__label'},nextElementSibling:buttons.find(button=>schema.definitions.find(item=>item.tab===Number(button.dataset.tab)).group===group)}));
 for(let i=0;i<buttons.length;i++){const current=schema.definitions[i],next=schema.definitions[i+1];buttons[i].nextElementSibling=next&&next.group===current.group?buttons[i+1]:null;}
 const views=schema.definitions.map(item=>({dataset:{view:String(item.tab)},hidden:item.tab!==1})),main={children:[],appendChild(child){this.children.push(child);}},headers={'header-title':{},'header-desc':{}},visited=[];
 const c=vm.createContext({OFEPublicModuleDefinitions:schema,...(internal?{OFE_SERVER:{}}:{OFE_PUBLIC:{apiBaseUrl:'/api/public'}}),ProgramCatalogHttp:{async request(){if(values instanceof Error)throw values;return {values};}},SimuladorOFE:{register(name,mod){definition=mod;}},toast(){},switchTab(tab){visited.push(tab);views.forEach(view=>{view.hidden=Number(view.dataset.view)!==tab;});},document:{querySelectorAll(selector){if(selector.includes('.nav__item[data-tab]'))return buttons;if(selector==='nav.nav .nav__label')return labels;if(selector==='.view[data-view]')return views;return [];},getElementById(id){return id==='main-content'?main:headers[id];},createElement(){return {setAttribute(){}};}}});c.window=c;vm.runInContext(fs.readFileSync(path.join(root,'shared/ui/public-navigation.js'),'utf8'),c);return {c,definition,buttons,visited,main,views};
}
test('public navigation selects an enabled entry, blocks hidden targets, supports all-off and leaves internal navigation intact',async()=>{
 const f=navigation({...schema.defaults,shortTerm:false,bank:false});await f.definition.init();assert.equal(f.visited[0],2);assert.equal(f.buttons.find(button=>button.dataset.tab==='3').hidden,true);f.c.switchTab(3);assert.deepEqual(f.visited,[2]);f.c.switchTab(7);assert.deepEqual(f.visited,[2,7]);
 const empty=navigation(Object.fromEntries(Object.keys(schema.defaults).map(key=>[key,false])));await empty.definition.init();assert.equal(empty.main.children.length,1);assert.ok(empty.views.every(view=>view.hidden));assert.deepEqual(empty.visited,[]);
 const error=navigation(Error('Unavailable'));await assert.rejects(error.definition.init(),/Unavailable/);assert.deepEqual(error.visited,[]);
 const internal=navigation({...schema.defaults,bank:false},true);await internal.definition.init();internal.c.switchTab(3);assert.deepEqual(internal.visited,[3]);assert.ok(internal.buttons.every(button=>!button.hidden));
});
test('projection starts off and can be explicitly enabled; initial-payment bar preserves exact segment widths and includes percentages',async()=>{
 for(const app of ['public','ofe']){
  const {context:c,elements:e}=selectorContext(app);await c.SimuladorOFE.init();const html=fs.readFileSync(path.join(root,'apps',app,'index.html'),'utf8');
  for(const id of ['proyLP','id-proyLP'])assert.doesNotMatch(html.match(new RegExp('<input[^>]*id="'+id+'"[^>]*>'))[0],/\bchecked/);
  const p=c.SimuladorOFE.catalog.programs.find(item=>item.nivel==='pregrado');e.prog2.value=p.id;c.setMat(2);c.calcular2();assert.equal(c.SimuladorOFE.state.results.projectionLP,null);e.proyLP.checked=true;c.calcular2();assert.ok(c.SimuladorOFE.state.results.projectionLP);e.proyLP.checked=false;c.calcular2();assert.equal(c.SimuladorOFE.state.results.projectionLP,null);
  const bar=c.OFEComposition.html(.1,49.9,50,0);assert.match(bar,/width:0\.1%/);assert.match(bar,/tuition-composition__percent">0,1%/);assert.match(bar,/tuition-composition__percent">49,9%/);assert.match(bar,/tuition-composition__percent">50,0%/);assert.match(bar,/Beneficios/);
 }
});
