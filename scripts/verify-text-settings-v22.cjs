'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createApplication}=require('../server/app.cjs'),{openStore}=require('../server/store.cjs'),{readInstitutional}=require('../server/institutional-settings.cjs');
const {schema:S,validate,documentMetrics}=require('../server/text-settings.cjs');
const {fixture:reports}=require('./test-support/report-fixtures.cjs'),{selectorContext}=require('./test-support/selector-context.cjs');
const {jsPDF}=require('../shared/vendor/jspdf-4.2.1.umd.min.js');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p)),PASSWORD='Only-fictitious-text-tests-2026!';
const identity={regular:read('shared/fonts/PublicSans-Regular.ttf').toString('base64'),bold:read('shared/fonts/PublicSans-Bold.ttf').toString('base64'),logo:new Uint8Array(read('shared/branding/ofe-color.png'))};
async function fixture(t){const app=await createApplication({root,database:':memory:',origin:'http://127.0.0.1:8787',publicEnabled:true});await app.store.bootstrap('QA Textos','texts@example.test',PASSWORD);await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',data,session,headers={}){const response=await fetch(base+route,{method,headers:{Origin:app.origin,...(data?{'Content-Type':'application/json'}:{}),...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{}),...headers},...(data?{body:JSON.stringify(data)}:{})});return {status:response.status,headers:response.headers,body:await response.json()};}
 const login=await call('/api/auth/login','POST',{email:'texts@example.test',password:PASSWORD});return {app,call,admin:{cookie:login.headers.get('set-cookie').split(';')[0],csrf:login.body.csrfToken}};
}
function renderer(c){const calls=[],geometry=[];c.jspdf={jsPDF:function(options){const doc=new jsPDF(options);for(const name of ['rect','line','addImage','addPage']){const original=doc[name];doc[name]=function(...args){geometry.push({name,page:doc.getCurrentPageInfo().pageNumber,args:args.map(v=>ArrayBuffer.isView(v)?'image':v)});return original.apply(this,args);};}const text=doc.text;doc.text=function(value,x,y,options){calls.push({text:String(value),x,y,page:doc.getCurrentPageInfo().pageNumber,size:doc.getFontSize(),options});return text.call(this,value,x,y,options);};return doc;}};vm.runInContext(read('shared/exports/pdf-report.js').toString(),c);return {calls,geometry};}
const financial=calls=>calls.filter(c=>c.y>135&&c.y<714);

test('text schema bounds characters, rejects markup, unsupported glyphs and unauthorized fields, and measures every default with real Public Sans',()=>{
 assert.equal(Object.keys(validate(S.defaults)).length,42);
 for(const [key,d] of Object.entries(S.definitions)){assert.throws(()=>validate({[key]:'x'.repeat(d.max+1)},true));assert.throws(()=>validate({[key]:''},true));if(d.pdf){const fit=S.fit(documentMetrics(),key,d.default);assert.ok(fit.lines.length<=d.pdf.lines);assert.ok(fit.size>=d.pdf.min);}}
 for(const changes of [{constructor:'x'},{unknown:'x'},{ui_academic:'<script>x</script>'},{ui_academic:'a\u0000b'},{pdf_header:'Emoji 😀'},{pdf_header:'Glifo ɏ'}])assert.throws(()=>validate(changes,true));
 assert.throws(()=>validate({pdf_title_bank:'Uninorte'},true));assert.throws(()=>validate({pdf_legal_bank:'Universidad del Norte'},true));
});
test('width, not character count, limits fixed PDF boxes; legal notices retain the mandatory sentence and never silently truncate',()=>{
 const narrow='i'.repeat(70),wide='W'.repeat(70);assert.doesNotThrow(()=>validate({pdf_header:narrow},true));assert.throws(()=>validate({pdf_header:wide},true),/no cabe/);
 assert.throws(()=>validate({pdf_legal_main:'W'.repeat(500)},true),/no cabe/);
 const legal=S.fit(documentMetrics(),'pdf_legal_main','Texto breve sujeto a revisión jurídica.');assert.ok(legal.lines.join(' ').endsWith(S.mandatory));assert.ok(legal.lines.length<=3);
 const reduced='W '.repeat(150).trim();let valid;for(let i=150;i>70;i--){const text='W '.repeat(i).trim();try{const fit=S.fit(documentMetrics(),'pdf_legal_main',text);if(fit.size<8.1){valid={text,fit};break;}}catch{}}
 assert.ok(valid);assert.ok(valid.fit.size>=7.2);assert.doesNotThrow(()=>validate({pdf_legal_main:valid.text},true));assert.ok(reduced);
});
test('text routes enforce authentication, permissions, CSRF, version conflicts and unchanged-field no-ops',async t=>{
 const f=await fixture(t),route='/api/admin/text-settings';assert.equal((await f.call(route)).status,401);assert.equal((await f.call('/api/text-settings')).status,401);
 for(const role of ['program_admin','simulator_user']){f.app.store.db.prepare('UPDATE users SET role=?').run(role);assert.equal((await f.call(route,'GET',undefined,f.admin)).status,403);assert.equal((await f.call(route,'PUT',{version:1,changes:{ui_academic:'Académico'}},f.admin)).status,403);assert.equal((await f.call('/api/text-settings','GET',undefined,f.admin)).status,200);}f.app.store.db.prepare("UPDATE users SET role='system_admin'").run();
 assert.equal((await f.call(route,'PUT',{version:1,changes:{ui_academic:'Académico'}},f.admin,{'X-CSRF-Token':'bad'})).status,403);assert.equal((await f.call(route,'PUT',{version:1,changes:{ui_academic:'Académico'}},f.admin,{Origin:'https://else.example.test'})).status,403);
 const saved=await f.call(route,'PUT',{version:1,changes:{ui_academic:'Académico'}},f.admin);assert.equal(saved.status,200);assert.equal(saved.body.version,2);assert.equal((await f.call(route,'PUT',{version:1,changes:{ui_academic:'Otro'}},f.admin)).status,409);assert.equal((await f.call(route,'PUT',{version:2,changes:{ui_academic:'Académico'}},f.admin)).body.version,2);
});
test('invalid PDF text cannot be saved through the API, and audit failure rolls back the whole text update',async t=>{
 const f=await fixture(t),route='/api/admin/text-settings',before=(await f.call(route,'GET',undefined,f.admin)).body;
 for(const changes of [{pdf_header:'W'.repeat(70)},{pdf_legal_main:'W'.repeat(500)},{pdf_legal_bank:'Uninorte'},{ui_academic:'x'.repeat(66)}])assert.equal((await f.call(route,'PUT',{version:1,changes},f.admin)).status,422);
 assert.deepEqual((await f.call(route,'GET',undefined,f.admin)).body,before);
 f.app.store.db.exec("CREATE TRIGGER reject_text_audit BEFORE INSERT ON audit_log WHEN NEW.entity_type='texts' BEGIN SELECT RAISE(ABORT,'rollback'); END;");assert.equal((await f.call(route,'PUT',{version:1,changes:{ui_academic:'Académico',pdf_header:'Nueva simulación'}},f.admin)).status,500);assert.deepEqual((await f.call(route,'GET',undefined,f.admin)).body,before);f.app.store.db.exec('DROP TRIGGER reject_text_audit');
 assert.equal((await f.call(route,'PUT',{version:1,changes:{ui_academic:'Académico',pdf_header:'Nueva simulación'}},f.admin)).status,200);
 const rows=f.app.store.db.prepare("SELECT * FROM audit_log WHERE entity_type='texts' AND result='SUCCESS'").all();assert.equal(rows.length,2);assert.ok(rows.every(row=>row.actor_email==='texts@example.test'&&row.action==='CONFIG_UPDATE'));
});
test('public text settings contain only values and version, follow global updates, and respect maintenance and public activation',async t=>{
 const f=await fixture(t);await f.call('/api/admin/text-settings','PUT',{version:1,changes:{ui_module_1_title:'Simula tu crédito',pdf_legal_main:'Documento informativo sujeto a validación.'}},f.admin);
 const data=(await f.call('/api/public/text-settings')).body;assert.deepEqual(Object.keys(data).sort(),['values','version']);assert.equal(data.values.ui_module_1_title,'Simula tu crédito');assert.doesNotMatch(JSON.stringify(data),/texts@example|updated_by|csrf/);
 await f.call('/api/admin/maintenance','PUT',{version:1,changes:{enabled:true}},f.admin);assert.equal((await f.call('/api/public/text-settings')).status,503);assert.equal((await f.call('/api/text-settings','GET',undefined,f.admin)).status,200);
});
test('text storage initializes alongside an existing installation and persists without changing users, programs, settings, maintenance, links or appearance',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-text-migration-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const file=path.join(dir,'data.sqlite');let store=await openStore(file,root);await store.bootstrap('QA','migration.text@example.test',PASSWORD);
 const tables=['users','programs','global_settings','institutional_settings','appearance_settings','public_module_settings'],before=Object.fromEntries(tables.map(name=>[name,JSON.stringify(store.db.prepare('SELECT * FROM '+name).all())]));store.db.exec("DROP TABLE text_settings; DELETE FROM schema_migrations WHERE name='007-text-settings.sql';");store.close();store=await openStore(file,root);for(const [name,value] of Object.entries(before))assert.equal(JSON.stringify(store.db.prepare('SELECT * FROM '+name).all()),value);
 assert.deepEqual(readInstitutional(store.db,'texts').values,S.defaults);store.db.prepare('UPDATE text_settings SET data=?,version=7').run(JSON.stringify({...S.defaults,ui_academic:'Académico guardado'}));store.close();store=await openStore(file,root);assert.equal(readInstitutional(store.db,'texts').values.ui_academic,'Académico guardado');assert.equal(readInstitutional(store.db,'texts').version,7);assert.equal(store.db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');store.close();
});
test('changing all configurable PDF titles and notices preserves financial text, rules, images, page count, tables and positions in every modality',async()=>{
 const {context:c}=await reports(),r=renderer(c);for(const key of [1,2,3,7,5,'languages']){
  const model=c.OFEReport.pdf(key);r.calls.length=0;r.geometry.length=0;const before=c.OFEPdf.build([model],identity),baseline=JSON.stringify(financial(r.calls)),geometry=JSON.stringify(r.geometry);const custom=JSON.parse(JSON.stringify(model));custom.textSettings.values={...S.defaults,pdf_header:'Escenario de financiación educativa',pdf_title_short_pre:'Financiación de pregrado',pdf_title_mixed_pre:'Distribución de la financiación',pdf_title_bank:'Propuesta del banco aliado',pdf_title_languages:'Financiación de idiomas',pdf_title_initial:'Aporte inicial estimado',pdf_title_refi:'Propuesta de reestructuración',pdf_scope:'INFORMACIÓN DEL DOCUMENTO',pdf_legal_main:'Simulación informativa. Las condiciones quedan sujetas a estudio y aprobación.',pdf_legal_bank:'Simulación informativa sujeta al estudio y aprobación de la entidad financiera.'};r.calls.length=0;r.geometry.length=0;const after=c.OFEPdf.build([custom],identity);
  assert.equal(after.getNumberOfPages(),before.getNumberOfPages());assert.equal(JSON.stringify(financial(r.calls)),baseline);assert.equal(JSON.stringify(r.geometry),geometry);assert.ok(r.calls.some(item=>item.text.includes('INFORMACIÓN DEL DOCUMENTO')));assert.ok(r.calls.every(item=>item.x>=34&&item.x<=544&&item.y<818));if(key===3)assert.doesNotMatch(r.calls.map(item=>item.text).join(' '),/Uninorte|Universidad del Norte|Vigilado Mineducación/);
 }
});
test('out-of-band oversized or unsupported text falls back safely and cannot move a PDF footer or financial body',async()=>{
 const {context:c}=await reports(),r=renderer(c),model=c.OFEReport.pdf(1);const baseline=c.OFEPdf.build([model],identity),body=JSON.stringify(financial(r.calls));
 for(const invalid of ['W'.repeat(800),'X\n'.repeat(100),'😀'.repeat(40),'ɏ'.repeat(10)]){const report=JSON.parse(JSON.stringify(model));report.textSettings.values.pdf_legal_main=invalid;r.calls.length=0;const result=c.OFEPdf.build([report],identity);assert.equal(result.getNumberOfPages(),baseline.getNumberOfPages());assert.equal(JSON.stringify(financial(r.calls)),body);const footer=r.calls.filter(item=>item.y>=748&&item.y<774);assert.ok(footer.length<=3*result.getNumberOfPages());assert.ok(footer.map(item=>item.text).join(' ').includes(S.mandatory));}
});
test('existing simulations retain their text version for PDF and Excel; new calculations and language origin snapshots are independent',async()=>{
 const {context:c,elements:e}=await reports();const old=c.OFEReport.pdf(1),stored=c.OFEReport.result(1),moneyBefore=stored.cuota;c.OFETextSettings.adopt({version:2,values:{...S.defaults,ui_module_1_title:'Mi crédito',pdf_header:'Otra cabecera',pdf_legal_main:'Nuevo aviso sujeto a validación.'}});
 assert.equal(JSON.stringify(c.OFEReport.pdf(1)),JSON.stringify(old));assert.equal(c.OFEReport.normalize(1,stored).disclaimer,S.defaults.pdf_legal_main);assert.equal(stored.cuota,moneyBefore);c.calcular1();const fresh=c.OFEReport.pdf(1);assert.equal(fresh.textSettings.version,2);assert.equal(fresh.disclaimer,'Nuevo aviso sujeto a validación.');assert.equal(c.OFEReport.result(1).cuota,moneyBefore);
 c.OFETextSettings.adopt({version:3,values:S.defaults});c.SimuladorOFE.state.languages.context.tabId=1;c.calcularIdiomas();assert.equal(c.OFEReport.pdf('languages').textSettings.version,2);
 assert.equal(c.OFETextSettings.view(1,{title:'Anterior',desc:'Anterior'}).title,S.defaults.ui_module_1_title);assert.equal(e['mat1'].readOnly,true);
});
test('configuration exposes the Textos tab, bounded controls, original-value restoration, exact PDF preview and the shared client in both apps',()=>{
 const ui=read('shared/admin/text-settings-ui.js').toString(),nav=read('shared/admin/integration-settings.js').toString();assert.match(nav,/\['texts','file-text','Textos'\]/);assert.match(nav,/next=\(index\+1\)%4/);assert.match(ui,/PDF de muestra/);assert.match(ui,/data-text-reset/);assert.match(ui,/S\.fit\(metrics/);assert.match(ui,/maxlength=/);assert.match(ui,/aria-invalid/);assert.match(ui,/\/api\/admin\/text-settings/);
 for(const app of ['ofe','public']){const html=read('apps/'+app+'/index.html').toString();assert.match(html,/text-content\.js\?v=22/);assert.match(html,/text-settings\.js\?v=22/);assert.match(html,/data-text-key="ui_academic"/);assert.match(html,/data-text-tip="ui_help_benefits"/);assert.match(html,/data-text-key="ui_short_plan"/);}
});
