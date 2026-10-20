'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {createApplication}=require('../server/app.cjs'),{openStore}=require('../server/store.cjs'),{readInstitutional}=require('../server/institutional-settings.cjs');
const S=require('../shared/settings/institutional-settings.js'),P=require('../shared/ui/brand-palette.js'),{fixture:reports}=require('./test-support/report-fixtures.cjs'),{jsPDF}=require('../shared/vendor/jspdf-4.2.1.umd.min.js');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file)),PASSWORD='Institutional-QA-2026-only!';
const identity={regular:read('shared/fonts/PublicSans-Regular.ttf').toString('base64'),bold:read('shared/fonts/PublicSans-Bold.ttf').toString('base64'),logo:new Uint8Array(read('shared/branding/ofe-color.png'))};
const resource=(suffix='pregrado')=>({...S.resources.shortTerm,enabled:true,url:'https://example.test/apoyo/'+suffix,text:'CONSULTAR INSTRUCCIONES '+suffix.toUpperCase(),description:'Guía de apoyo para la radicación',type:'tutorial'});
async function fixture(t,options={}){
 const app=await createApplication({root,database:':memory:',origin:'http://127.0.0.1:8787',publicEnabled:true,...options});await app.store.bootstrap('QA','institutional@example.test',PASSWORD);await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',data,session,headers={}){const response=await fetch(base+route,{method,redirect:'manual',headers:{Origin:app.origin,...(data?{'Content-Type':'application/json'}:{}),...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{}),...headers},...(data?{body:JSON.stringify(data)}:{})});const text=await response.text();let body;try{body=JSON.parse(text);}catch{body=text;}return {status:response.status,headers:response.headers,body};}
 const login=await call('/api/auth/login','POST',{email:'institutional@example.test',password:PASSWORD});return {app,call,admin:{cookie:login.headers.get('set-cookie').split(';')[0],csrf:login.body.csrfToken}};
}
test('maintenance is enforced by server on every public route and API while internal authorized operation stays available',async t=>{
 const f=await fixture(t,{publicFrameOrigins:['https://www.uninorte.edu.co']});const before=(await f.call('/api/admin/maintenance','GET',undefined,f.admin)).body;assert.equal(before.values.enabled,false);
 const saved=await f.call('/api/admin/maintenance','PUT',{version:before.version,changes:{enabled:true,title:'Ajustes <institucionales> %%MESSAGE%%',message:'Regresaremos pronto & con mejoras.\nGracias por tu comprensión.'}},f.admin);assert.equal(saved.status,200);
 for(const route of ['/apps/public/','/apps/public/index.html','/apps/public','/simulador','/simulador/','/apps/public/simulador-assets/js/03-finance-core.js','/apps/public/runtime-config.js','/apps/public/../public/']){
  for(const session of [undefined,f.admin]){const result=await f.call(route,'GET',undefined,session);assert.equal(result.status,503,route);assert.match(result.body,/Ajustes &lt;institucionales&gt; %%MESSAGE%%/);assert.match(result.headers.get('content-security-policy'),/frame-ancestors 'self' https:\/\/www\.uninorte\.edu\.co/);assert.equal(result.headers.get('retry-after'),'60');assert.equal(result.headers.get('cache-control'),'no-store');}
 }
 assert.equal((await f.call('/apps/public/','HEAD')).status,503);
 for(const route of ['/api/public/programs','/api/public/programs/pregrado%3Aarquitectura','/api/public/simulation-settings','/api/public/modules','/api/public/radication-resources'])assert.equal((await f.call(route,'GET',undefined,f.admin)).status,503,route);
 const status=await f.call('/api/public/status');assert.deepEqual(status.body,{maintenance:saved.body.values});assert.doesNotMatch(JSON.stringify(status.body),/updated_by|csrf|institutional@example/);
 for(const route of ['/login','/auth-assets/styles.css','/auth-assets/theme.js','/auth-assets/fonts.css','/shared/ui/maintenance.css','/shared/ui/maintenance.js','/shared/branding/ofe-color.png'])assert.equal((await f.call(route)).status,200,route);
 assert.equal((await f.call('/apps/ofe/','GET',undefined,f.admin)).status,200);assert.equal((await f.call('/api/programs','GET',undefined,f.admin)).body.programs.length,173);assert.equal((await f.call('/api/radication-resources','GET',undefined,f.admin)).status,200);assert.equal((await f.call('/api/health')).status,200);
 assert.equal((await f.call('/api/admin/maintenance','PUT',{version:saved.body.version,changes:{enabled:false}},f.admin)).status,200);assert.equal((await f.call('/apps/public/')).status,200);assert.equal((await f.call('/api/public/programs')).status,200);
});
test('institutional settings enforce permissions, CSRF, validation, optimistic locking and transactional audit',async t=>{
 const f=await fixture(t);
 for(const route of ['/api/admin/maintenance','/api/admin/radication-resources']){
  const changes=route.endsWith('maintenance')?{enabled:true}:{initialPayment:resource('idiomas')};assert.equal((await f.call(route)).status,401);assert.equal((await f.call(route,'PUT',{version:1,changes})).status,401);
  for(const role of ['program_admin','simulator_user']){f.app.store.db.prepare('UPDATE users SET role=?').run(role);assert.equal((await f.call(route,'GET',undefined,f.admin)).status,403);assert.equal((await f.call(route,'PUT',{version:1,changes},f.admin)).status,403);}f.app.store.db.prepare("UPDATE users SET role='system_admin'").run();
  assert.equal((await f.call(route,'PUT',{version:1,changes},f.admin,{'X-CSRF-Token':'invalid'})).status,403);assert.equal((await f.call(route,'PUT',{version:1,changes},f.admin,{Origin:'https://other.example.test'})).status,403);
  const before=(await f.call(route,'GET',undefined,f.admin)).body;f.app.store.db.exec("CREATE TRIGGER reject_institutional_audit BEFORE INSERT ON audit_log WHEN NEW.entity_type IN ('maintenance','radication_resources') BEGIN SELECT RAISE(ABORT,'rollback'); END;");assert.equal((await f.call(route,'PUT',{version:before.version,changes},f.admin)).status,500);assert.deepEqual((await f.call(route,'GET',undefined,f.admin)).body,before);f.app.store.db.exec('DROP TRIGGER reject_institutional_audit');
  const saved=await f.call(route,'PUT',{version:before.version,changes},f.admin);assert.equal(saved.status,200);assert.equal((await f.call(route,'PUT',{version:before.version,changes},f.admin)).status,409);assert.equal((await f.call(route,'PUT',{version:saved.body.version,changes},f.admin)).body.version,saved.body.version);
 }
 const records=f.app.store.db.prepare("SELECT * FROM audit_log WHERE entity_type IN ('maintenance','radication_resources') AND result='SUCCESS'").all();assert.equal(records.length,2);assert.ok(records.every(row=>row.actor_email==='institutional@example.test'&&row.action==='CONFIG_UPDATE'));
 for(const changes of [{enabled:'yes'},{title:''},{message:'x'.repeat(501)},{__proto__:null,extra:true}])assert.equal((await f.call('/api/admin/maintenance','PUT',{version:2,changes},f.admin)).status,422);
});
test('radication links are independent, HTTPS only, allow any resource extension and expose no administrative metadata',async t=>{
 const f=await fixture(t),route='/api/admin/radication-resources',before=(await f.call(route,'GET',undefined,f.admin)).body;assert.deepEqual(before.values,S.resources);assert.deepEqual((await f.call('/api/public/radication-resources')).body,{values:{}});
 for(const url of ['http://example.test/','javascript:alert(1)','data:text/html,test','https://user:pass@example.test/','https://example.test/ a','https://example.test/\n','https:\\example.test/'])assert.equal((await f.call(route,'PUT',{version:before.version,changes:{initialPayment:{...resource(),url}}},f.admin)).status,422,url);
 assert.equal((await f.call(route,'PUT',{version:before.version,changes:{unknown:resource()}},f.admin)).status,422);
 const a=resource('pregrado.pdf'),b=resource('video'),c={...resource('idiomas'),enabled:false};let saved=(await f.call(route,'PUT',{version:1,changes:{'shortTerm':a,'mixed':b,initialPayment:c}},f.admin)).body;
 assert.deepEqual((await f.call('/api/public/radication-resources')).body,{values:{'shortTerm':a,'mixed':b}});
 saved=(await f.call(route,'PUT',{version:saved.version,changes:{initialPayment:{...c,enabled:true,url:''}}},f.admin)).body;assert.deepEqual(saved.values['shortTerm'],a);assert.deepEqual(saved.values['mixed'],b);assert.equal(Object.hasOwn((await f.call('/api/public/radication-resources')).body.values,'initialPayment'),false);
 for(const type of Object.keys(S.types))assert.doesNotThrow(()=>S.validateResources({initialPayment:{...resource(),type}},true));
});
test('new institutional settings migrate and persist without changing users, 173 programs, financial settings or appearance',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-institutional-v19-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const file=path.join(dir,'data.sqlite');let store=await openStore(file,root);await store.bootstrap('QA','migration@example.test',PASSWORD);const tables=['users','programs','global_settings','appearance_settings','public_module_settings'],snapshot=Object.fromEntries(tables.map(name=>[name,JSON.stringify(store.db.prepare('SELECT * FROM '+name).all())]));store.db.exec("DROP TABLE institutional_settings; DELETE FROM schema_migrations WHERE name='005-institutional-settings.sql';");store.close();store=await openStore(file,root);for(const name of tables)assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM '+name).all()),snapshot[name]);assert.deepEqual(readInstitutional(store.db,'maintenance').values,S.maintenance);
 store.db.prepare("UPDATE institutional_settings SET data=?,version=8 WHERE name='maintenance'").run(JSON.stringify({...S.maintenance,enabled:true}));store.db.prepare("UPDATE institutional_settings SET data=? WHERE name='radication_resources'").run(JSON.stringify({...S.resources,initialPayment:resource('idiomas')}));store.close();store=await openStore(file,root);assert.equal(readInstitutional(store.db,'maintenance').version,8);assert.equal(readInstitutional(store.db,'maintenance').values.enabled,true);assert.deepEqual(readInstitutional(store.db,'radication_resources').values.initialPayment,resource('idiomas'));for(const name of tables)assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM '+name).all()),snapshot[name]);store.close();
});
function renderer(c){const calls=[],links=[];c.jspdf={jsPDF:function(options){const doc=new jsPDF(options),text=doc.text,link=doc.link;doc.text=function(value,x,y,options){calls.push({text:String(value),x,y,size:doc.getFontSize(),font:{name:doc.getFont().fontName,style:doc.getFont().fontStyle},page:doc.getCurrentPageInfo().pageNumber,options});return text.call(doc,value,x,y,options);};doc.link=function(x,y,w,h,options){links.push({x,y,w,h,...options,page:doc.getCurrentPageInfo().pageNumber});return link.call(doc,x,y,w,h,options);};return doc;}};vm.runInContext(read('shared/exports/pdf-report.js').toString(),c);return {calls,links};}
test('three module resources apply equally to pregrado and posgrado without moving existing PDF elements',async()=>{
 const {context:c}=await reports(),r=renderer(c);const configured=Object.fromEntries(S.modules.map(item=>[item.id,resource(item.id)]));
 assert.deepEqual(JSON.parse(JSON.stringify(S.modules.map(item=>item.id))),['initialPayment','shortTerm','mixed']);
 for(const [key,id] of [[7,'initialPayment'],[1,'shortTerm'],[2,'mixed']])for(const level of ['pregrado','posgrado']){
  const data=JSON.parse(JSON.stringify(c.OFEReport.result(key)));data.reportSnapshot={...data.reportSnapshot,level,moduleId:id};
  const report=c.OFEReport.pdf(key,data);assert.equal(report.creditModuleId,id);r.calls.length=0;r.links.length=0;
  const before=c.OFEPdf.build([report],identity),calls=structuredClone(r.calls);r.calls.length=0;r.links.length=0;
  const after=c.OFEPdf.build([report],identity,configured),item=configured[id];assert.equal(after.getNumberOfPages(),before.getNumberOfPages());assert.equal(JSON.stringify(r.calls.filter(call=>![item.text,item.description].includes(call.text))),JSON.stringify(calls));assert.equal(r.links.length,1);assert.equal(r.links[0].url,item.url);assert.ok(r.links[0].w>120&&r.links[0].h>=14);assert.equal(r.calls.find(call=>call.text===item.text).y,784);assert.equal(r.calls.find(call=>call.text===item.text).size,9.5);assert.ok(Buffer.from(after.output('arraybuffer')).toString('latin1').includes('/URI ('+item.url+')'));
 }
});
test('empty/disabled/unsafe/foreign module links never leak to other PDF reports or neutral bank exports',async()=>{
 const {context:c,elements:e}=await reports(),r=renderer(c),short=c.OFEReport.pdf(1);const invalid=[{}, {shortTerm:{...resource(),enabled:false}}, {shortTerm:{...resource(),url:''}}, {shortTerm:{...resource(),url:'javascript:alert(1)'}}, {mixed:resource()}, {initialPayment:resource()}];
 for(const values of invalid){r.calls.length=0;r.links.length=0;c.OFEPdf.build([short],identity,values);assert.equal(r.links.length,0);assert.ok(!r.calls.some(call=>call.text===resource().text));}
 const configured=Object.fromEntries(S.modules.map(item=>[item.id,resource(item.id)]));
 for(const key of [3,5]){r.calls.length=0;r.links.length=0;const report=c.OFEReport.pdf(key);c.OFEPdf.build([report],identity,configured);assert.equal(report.creditModuleId,null);assert.equal(r.links.length,0);if(key===3)assert.ok(!/Uninorte|Universidad del Norte/.test(r.calls.map(call=>call.text).join(' ')));}
 for(const [cp,lp] of [[100,0],[0,100]]){e.pctCP.value=cp;e.pctLP.value=lp;c.calcular2();const report=c.OFEReport.pdf(2);assert.equal(report.creditModuleId,'mixed');r.links.length=0;c.OFEPdf.build([report],identity,configured);assert.equal(r.links.length,1);assert.equal(r.links[0].url,configured.mixed.url);}
 assert.equal(S.resourceFor({...short,creditModuleId:'initialPayment'},configured),null);assert.throws(()=>S.validateResources({languages:resource()},true));assert.throws(()=>S.validateResources({'shortTerm:pregrado':resource()},true));
});
test('brand calibration keeps mode neutrals and semantic status colors, and derives legible custom brand text and actions',()=>{
 for(const dark of [false,true])for(const value of ['#FFFFFF','#000000','#FFCC00','#960A11','#777777']){
  const tokens=P.tokens({...P.defaults,brand_red:value,brand_gold:value},dark);for(const token of Object.keys(tokens))assert.doesNotMatch(token,/^--(?:bg|surface|text|success|danger|warning|info|border)(?:-|$)/);
  const background=dark?'#20262E':'#FFFFFF';if(tokens['--accent'])assert.ok(P.contrast(tokens['--accent'],background)>=4.5);if(tokens['--brand-gold-ink'])assert.ok(P.contrast(tokens['--brand-gold-ink'],background)>=4.5);if(tokens['--ofe-on-brand'])assert.ok(P.contrast(value,tokens['--ofe-on-brand'])>=4.5);
 }
 for(const app of ['ofe','public'])assert.match(read('apps/'+app+'/index.html').toString(),/institutional\.css\?v=20/);
});
test('an already open public page checks maintenance before calculating/exporting and responds to focus without trusting UI flags',async()=>{
 const handlers={},main={inert:false};let enabled=false,reloads=0,clicks=0,checks=0,module;
 const c=vm.createContext({OFE_PUBLIC:{apiBaseUrl:'/api/public'},WeakSet,AbortSignal,fetch:async()=>{checks++;return {ok:true,json:async()=>({maintenance:{enabled}})};},location:{reload(){reloads++;}},SimuladorOFE:{register(name,value){module=value;}},document:{getElementById:()=>main,addEventListener(name,fn){handlers[name]=fn;}},setInterval(){},addEventListener(name,fn){handlers[name]=fn;}});c.window=c;vm.runInContext(read('shared/ui/public-availability.js').toString(),c);await module.init();
 const button={dataset:{action:'calcular'},click(){handlers.click({target:{closest:()=>button},preventDefault(){},stopImmediatePropagation(){}});clicks++;}};const event={target:{closest:()=>button},preventDefault(){},stopImmediatePropagation(){}};
 handlers.click(event);await new Promise(resolve=>setImmediate(resolve));assert.equal(clicks,1);assert.ok(checks>=2);
 enabled=true;handlers.click(event);await new Promise(resolve=>setImmediate(resolve));assert.equal(clicks,1);assert.ok(reloads>=1);assert.equal(main.inert,true);
 main.inert=false;handlers.focus();await new Promise(resolve=>setImmediate(resolve));assert.equal(main.inert,true);
});
test('language PDFs inherit the originating module snapshot even when controls or language context change afterwards',async()=>{
 const {context:c,elements:e}=await reports(),r=renderer(c),configured=Object.fromEntries(S.modules.map(item=>[item.id,resource(item.id)]));
 assert.equal(c.OFEReport.pdf('languages').creditModuleId,'shortTerm');
 c.SimuladorOFE.state.languages.context.tabId=2;e['id-tasa'].value=1.25;e['id-meses'].value=6;e['id-pctCP'].value=40;e['id-pctLP'].value=60;e['id-mesesLP'].value=8;c.calcularIdiomas();
 const snapshot=c.OFEReport.pdf('languages');assert.equal(snapshot.creditModuleId,'mixed');c.SimuladorOFE.state.languages.context.tabId=1;r.links.length=0;c.OFEPdf.build([c.OFEReport.pdf('languages')],identity,configured);assert.equal(r.links[0].url,configured.mixed.url);assert.equal(c.OFEReport.pdf('languages').creditModuleId,'mixed');
 c.SimuladorOFE.state.languages.context.tabId=3;c.calcularIdiomas();assert.equal(c.OFEReport.pdf('languages').creditModuleId,null);r.links.length=0;c.OFEPdf.build([c.OFEReport.pdf('languages')],identity,configured);assert.equal(r.links.length,0);
});
test('existing per-level links migrate safely with a preserved administrative copy and no loss of users or financial data',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-v20-migration-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const identical of [true,false]){
  const file=path.join(dir,identical?'same.sqlite':'different.sqlite');let store=await openStore(file,root);await store.bootstrap('QA','legacy@example.test',PASSWORD);
  const before=Object.fromEntries(['users','programs','global_settings','public_module_settings','appearance_settings'].map(name=>[name,JSON.stringify(store.db.prepare('SELECT * FROM '+name).all())]));
  const legacy={'shortTerm:pregrado':resource('pregrado'),'shortTerm:posgrado':resource(identical?'pregrado':'posgrado'),languages:resource('old-idiomas')};
  store.db.prepare("UPDATE institutional_settings SET data=?,version=7 WHERE name='radication_resources'").run(JSON.stringify(legacy));store.db.exec("DROP TABLE radication_resources_legacy; DELETE FROM schema_migrations WHERE name='006-radication-modules.sql';");store.close();store=await openStore(file,root);
  const saved=readInstitutional(store.db,'radication_resources');assert.deepEqual(Object.keys(saved.values),['initialPayment','shortTerm','mixed']);assert.equal(saved.version,8);assert.deepEqual(saved.previousResources.values,legacy);assert.deepEqual(saved.values.shortTerm,identical?legacy['shortTerm:pregrado']:S.resources.shortTerm);assert.deepEqual(saved.values.initialPayment,S.resources.initialPayment);assert.deepEqual(saved.values.mixed,S.resources.mixed);
  assert.equal(store.db.prepare("SELECT count(*) AS n FROM audit_log WHERE action='CONFIG_MIGRATION'").get().n,1);for(const [name,value] of Object.entries(before))assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM '+name).all()),value);
  const snapshot=JSON.stringify(saved);store.close();store=await openStore(file,root);assert.equal(JSON.stringify(readInstitutional(store.db,'radication_resources')),snapshot);assert.equal(store.db.prepare("SELECT count(*) AS n FROM audit_log WHERE action='CONFIG_MIGRATION'").get().n,1);store.close();
 }
});
