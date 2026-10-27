'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const A=require('../shared/admin/audit-presentation.js'),S=require('../shared/settings/text-settings.js'),{createApplication}=require('../server/app.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const row=(type,field,extra={})=>({id:'qa',module:type==='user'?'users':type==='program'?'programs':'settings',entity_type:type,field_name:field,entity_name:'Registro de prueba',action:'CONFIG_UPDATE',actor_name:'Administración de prueba',result:'SUCCESS',...extra});
const icons={arrow:'→',chevron:'⌄'};
test('every current business category and all 42 configurable text fields have readable, shared table and detail labels',()=>{
 assert.equal(A.categories.length,8);assert.equal(Object.keys(S.definitions).length,42);
 for(const [key,def] of Object.entries(S.definitions)){
  const record=row('texts',key,{old_value:JSON.stringify('Anterior'),new_value:JSON.stringify('Nuevo')});
  assert.equal(A.describe(record).field,def.label);assert.equal(A.describe(record).category,'Textos del simulador y PDF');assert.equal(A.describe(record).action,'Actualizó un texto');
  const html=A.rowHTML(record,'Hoy','');assert.ok(html.includes(def.label));assert.ok(!html.includes(key));
  const detail=A.detailHTML(record,'Hoy',icons),visible=detail.split('<details class="audit-technical">')[0];assert.ok(visible.includes(def.label));assert.ok(!visible.includes(key));assert.ok(detail.includes(key));
 }
 for(const c of A.categories)assert.equal(A.describe(row(c.key,'')).category,c.label);
});
test('audit values translate profiles, public visibility, maintenance, money, percentages and resource types without losing false or zero',()=>{
 const profile=A.renderValue(JSON.stringify({name:'QA',role:'program_admin',status:'active'}),'profile','user');assert.match(profile,/Administrador de programas/);assert.match(profile,/Activo/);assert.doesNotMatch(profile,/>active<|>program_admin</);
 for(const [value,field,type,expected] of [[false,'shortTerm','public_modules','Oculto'],[true,'enabled','maintenance','Activado'],[false,'enabled','radication_resources','Deshabilitado'],[false,'activo','program','Inactivo'],['web','type','radication_resources','Página web'],[0,'valorIdiomas','program','$'],[4.17,'garantisa_cp_percent','setting','4,17 %']])assert.ok(A.renderValue(JSON.stringify(value),field,type).includes(expected));
 assert.match(A.renderValue(null,'name','user'),/Sin valor registrado/);assert.match(A.renderValue('""','name','user'),/Texto vacío/);
});
test('nested legacy resource migrations retain all values with readable labels instead of object coercion or technical field names',()=>{
 const value={'shortTerm:pregrado':{enabled:false,url:'https://example.test/video',text:'Radica aquí',type:'video'},initialPayment:{enabled:true,description:'Tu guía',type:'document'}};
 const html=A.renderValue(JSON.stringify(value),null,'radication_resources');
 for(const label of ['Crédito Pregrado - Corto Plazo','Cuota Inicial','Deshabilitado','Habilitado','Dirección del recurso','Radica aquí','Video','Documento','Tu guía'])assert.ok(html.includes(label));
 assert.doesNotMatch(html,/\[object Object\]|shortTerm:pregrado|>true<|>false</);
});
test('long user text remains complete, escapes HTML in both views and keeps unknown identifiers in the technical reference',()=>{
 const text='Condiciones de prueba '.repeat(80)+'<img src=x onerror="alert(1)"> & final';
 const record=row('texts','pdf_legal_main',{new_value:JSON.stringify(text),actor_name:'<script>QA</script>'});
 const html=A.detailHTML(record,'Hoy',icons);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img|<script/);assert.ok(html.includes(' &amp; final'));assert.equal((html.split('<details class="audit-technical">')[0].match(/Condiciones de prueba/g)||[]).length,80);
 assert.match(A.rowHTML(record,'Hoy',''),/&lt;script&gt;QA/);
 const unknown=row('future_category','future_field',{action:'FUTURE_EVENT'}),detail=A.detailHTML(unknown,'Hoy',icons);
 assert.doesNotMatch(A.rowHTML(unknown,'Hoy',''),/future_category|future_field|FUTURE_EVENT/);assert.doesNotMatch(detail.split('<details class="audit-technical">')[0],/future_category|future_field|FUTURE_EVENT/);assert.match(detail,/future_category/);assert.match(detail,/future_field/);
});
test('category choices respect the selected module and program-administrator scope; audit script dependencies load in order',()=>{
 assert.deepEqual(A.availableActions('program_admin','','').map(([key])=>key),['PROGRAM_UPDATE']);assert.deepEqual(A.availableActions('system_admin','','texts').map(([key])=>key),['CONFIG_UPDATE','CONFIG_MIGRATION']);assert.ok(A.availableActions('system_admin','users','').every(([key])=>key.startsWith('USER_')||key==='ADMIN_BOOTSTRAP'));
 assert.equal(A.availableCategories('system_admin','settings').length,6);assert.deepEqual(A.availableCategories('program_admin','').map(c=>c.key),['program']);assert.deepEqual(A.availableCategories('program_admin','settings'),[]);
 const html=read('apps/ofe/index.html');assert.ok(html.indexOf('text-settings.js')<html.indexOf('audit-presentation.js'));assert.ok(html.indexOf('audit-presentation.js')<html.indexOf('admin-ui.js'));
 const c=vm.createContext({});c.window=c;for(const file of ['shared/settings/text-settings.js','shared/admin/audit-presentation.js'])vm.runInContext(read(file),c);assert.equal(c.OFEAuditPresentation.fieldLabel('ui_academic','texts'),S.definitions.ui_academic.label);
});
async function fixture(t){
 const app=await createApplication({root,database:':memory:',origin:'http://127.0.0.1:8787'});await app.store.bootstrap('QA Auditoría','audit@example.test','LocalAudit-Pruebas2026!');await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
 const address='http://127.0.0.1:'+app.server.address().port,response=await fetch(address+'/api/auth/login',{method:'POST',headers:{Origin:app.origin,'Content-Type':'application/json'},body:JSON.stringify({email:'audit@example.test',password:'LocalAudit-Pruebas2026!'})}),cookie=response.headers.get('set-cookie').split(';')[0];await response.json();
 const actor=app.store.db.prepare('SELECT * FROM users').get();
 return {...app,actor,async call(query){const response=await fetch(address+'/api/admin/audit?category=administrative&'+query,{headers:{Cookie:cookie}});return {status:response.status,body:await response.json()};}};
}
test('category filtering is exact and parameterized, combines with module/action filters, rejects unknown categories and preserves stored logs',async t=>{
 const f=await fixture(t);
 for(const c of A.categories)f.store.audit(f.actor,c.key==='program'?'PROGRAM_UPDATE':c.key==='user'?'USER_UPDATE':'CONFIG_UPDATE',c.module,{type:c.key,id:c.key,name:c.label},c.key==='texts'?'ui_academic':'name','Anterior','Nuevo','cat-'+c.key);
 const before=JSON.stringify(f.store.db.prepare('SELECT * FROM audit_log ORDER BY id').all());
 for(const c of A.categories){const result=await f.call('entityType='+c.key);assert.equal(result.status,200);assert.ok(result.body.records.length);assert.ok(result.body.records.every(r=>r.entity_type===c.key));}
 const texts=await f.call('entityType=texts&module=settings&action=CONFIG_UPDATE');assert.equal(texts.body.records.length,1);assert.equal(texts.body.records[0].field_name,'ui_academic');assert.equal((await f.call('entityType=texts&module=users')).body.records.length,0);
 for(const value of ['request','session','unknown',"texts' OR 1=1 --"]){assert.equal((await f.call('entityType='+encodeURIComponent(value))).status,422);}
 assert.equal(JSON.stringify(f.store.db.prepare("SELECT * FROM audit_log WHERE action!='ADMIN_REQUEST_FAILURE' ORDER BY id").all()),before);
});
test('resource migration filter works; administrative pagination still excludes all authentication and password events',async t=>{
 const f=await fixture(t);for(let i=0;i<105;i++)f.store.audit(f.actor,'PASSWORD_CHANGE','users',{type:'user',id:f.actor.id},null,null,null,'secret-'+i);
 f.store.audit(f.actor,'CONFIG_MIGRATION','settings',{type:'radication_resources',id:'radication_resources'},null,{legacy:{enabled:true}},{shortTerm:{enabled:true}},'migration-qa');
 const migration=await f.call('entityType=radication_resources&action=CONFIG_MIGRATION');assert.equal(migration.body.records.length,1);assert.equal(migration.body.records[0].request_id,'migration-qa');
 const all=await f.call('');assert.equal(all.body.records.length,2);assert.equal(all.body.nextOffset,null);assert.ok(all.body.records.every(r=>!['PASSWORD_CHANGE','LOGIN_SUCCESS'].includes(r.action)));
 assert.equal(f.store.db.prepare("SELECT count(*) n FROM audit_log WHERE action='PASSWORD_CHANGE'").get().n,105);
});
test('changing category queries cannot bypass program-admin or simulator-user permissions',async t=>{
 const f=await fixture(t);for(const c of A.categories)f.store.audit(f.actor,c.key==='program'?'PROGRAM_UPDATE':'CONFIG_UPDATE',c.module,{type:c.key,id:c.key},'name',1,2,'scope-'+c.key);
 f.store.db.prepare("UPDATE users SET role='program_admin'").run();assert.deepEqual((await f.call('entityType=program')).body.records.map(r=>r.entity_type),['program']);for(const c of A.categories.filter(c=>c.key!=='program'))assert.equal((await f.call('entityType='+c.key)).body.records.length,0);
 f.store.db.prepare("UPDATE users SET role='simulator_user'").run();assert.equal((await f.call('entityType=program')).status,403);
});
test('show more keeps the last applied audit filters even when form controls have been edited',async()=>{
 const elements={'audit-count':{},'audit-filters':{values:[['entityType','texts']]},'audit-list':{innerHTML:'',insertAdjacentHTML(_,html){this.innerHTML+=html;}},'audit-more':{hidden:true}},calls=[];
 const context=vm.createContext({URLSearchParams,FormData:class{constructor(form){this.values=form.values;}[Symbol.iterator](){return this.values[Symbol.iterator]();}},$:id=>elements[id],auditQuery:null,auditCount:0,auditRows:new Map(),nextOffset:null,auditPresentation:A,date:value=>value,global:{icon:()=>''},api:async url=>{calls.push(url);return {records:[row('texts','ui_academic',{id:String(calls.length)})],nextOffset:100};}});
 const source=read('shared/admin/admin-ui.js'),start=source.indexOf(' async function loadAudit('),end=source.indexOf(' async function show(',start);vm.runInContext(source.slice(start,end),context);
 await context.loadAudit();elements['audit-filters'].values=[['entityType','appearance']];await context.loadAudit(100);
 assert.equal(new URL('http://test'+calls[1]).searchParams.get('entityType'),'texts');assert.equal(context.auditRows.size,2);
 await context.loadAudit(0);assert.equal(new URL('http://test'+calls[2]).searchParams.get('entityType'),'appearance');assert.equal(context.auditRows.size,1);
});
