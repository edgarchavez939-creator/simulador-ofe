'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createApplication}=require('../server/app.cjs'),{fixture}=require('./test-support/report-fixtures.cjs');
const root=path.resolve(__dirname,'..'),vendor=path.join(root,'shared/vendor'),manifest=require('../shared/vendor/dependencies.json');
const XLSX=require('../shared/vendor/xlsx-0.20.3.full.min.js'),ExcelJS=require('../shared/vendor/exceljs-4.4.0.min.js');
test('local dependencies match their pinned versions, hashes and document integrity attributes',()=>{
 assert.equal(XLSX.version,'0.20.3');assert.equal(require('../shared/vendor/jspdf-4.2.1.umd.min.js').jsPDF.version,'4.2.1');assert.equal(require('../shared/vendor/chart-4.5.1.umd.min.js').version,'4.5.1');
 for(const item of manifest.dependencies){const bytes=fs.readFileSync(path.join(vendor,item.file));assert.equal(bytes.length,item.size);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.equal('sha384-'+crypto.createHash('sha384').update(bytes).digest('base64'),item.integrity);assert.ok(fs.statSync(path.join(vendor,item.license)).size>100);}
 assert.ok(!fs.existsSync(path.join(vendor,'jspdf-2.5.1.umd.min.js')));
 for(const file of ['index.html','apps/public/index.html','apps/ofe/index.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const references=[...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)].map(m=>m[1]);assert.ok(references.length>20);assert.ok(references.every(url=>!/^https?:|^\/\//i.test(url)),file);
  for(const item of manifest.dependencies){const tag=[...html.matchAll(/<script\b[^>]*>/g)].map(m=>m[0]).find(tag=>tag.includes('/'+item.file+'"'));assert.ok(tag,item.file);assert.ok(tag.includes('integrity="'+item.integrity+'"'));}
  const policy=html.match(/<meta content="([^"]+)" http-equiv="Content-Security-Policy"/)[1];assert.ok(!/https?:|unsafe-eval/.test(policy));assert.match(policy,/script-src 'self';/);
 }
});
test('real SheetJS parses the ExcelJS operational template and preserves every program identity and amount',async()=>{
 const {context:c}=await fixture(),programs=JSON.parse(JSON.stringify(c.SimuladorOFE.catalog.programs)).map(p=>({...p,version:1}));
 const host={ExcelJS,SimuladorOFE:{catalog:{programs}},OFEExcel:{formats:{money:'$#,##0'},async saveWorkbook(){}},toast(){}};new Function('window',fs.readFileSync(path.join(root,'shared/admin/program-template.js'),'utf8'))(host);
 const book=await host.descargarPlantilla(),bytes=await book.xlsx.writeBuffer(),parsed=XLSX.read(bytes,{type:'array'});let total=0;
 for(const [name,level] of [['Pregrado','pregrado'],['Posgrado','posgrado']]){
  const rows=XLSX.utils.sheet_to_json(parsed.Sheets[name],{header:1,defval:''}),before=JSON.stringify(programs),result=c.ProgramCatalogImport.identified(rows,level,programs);
  assert.equal(result.errors.length,0,JSON.stringify(result.errors));assert.equal(result.updates.length,level==='pregrado'?29:144);assert.ok(result.updates.every(row=>Object.keys(row.changes).length===0));assert.equal(JSON.stringify(programs),before);total+=result.updates.length;
  const changed=JSON.parse(JSON.stringify(rows));changed[1][level==='pregrado'?1:2]+=1234;if(level==='pregrado')changed[1][2]=175000;
  const proposal=c.ProgramCatalogImport.identified(changed,level,programs);assert.equal(proposal.errors.length,0);assert.equal(proposal.updates[0].changes.valorMatricula,rows[1][level==='pregrado'?1:2]+1234);if(level==='pregrado')assert.equal(proposal.updates[0].changes.valorIdiomas,175000);
  changed[1][level==='pregrado'?1:2]=-10;assert.ok(c.ProgramCatalogImport.identified(changed,level,programs).errors.length);
 }assert.equal(total,173);
});
test('SheetJS handles reserved column headers without changing Object.prototype',()=>{
 const before=Object.prototype.polluted,book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([['__proto__','constructor','Programa'],['valor','dato','Prueba']]),'Datos');
 const data=XLSX.write(book,{type:'buffer',bookType:'xlsx'}),parsed=XLSX.read(data,{type:'array'});XLSX.utils.sheet_to_json(parsed.Sheets.Datos);assert.equal(Object.prototype.polluted,before);assert.equal(({}).polluted,undefined);
});
test('the server serves all updated public dependencies locally under the restricted CSP and secure headers',async t=>{
 const app=await createApplication({root,database:':memory:',origin:'https://example.test',production:true,publicEnabled:true});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());const base='http://127.0.0.1:'+app.server.address().port;
 for(const route of ['/login','/apps/public/']){const r=await fetch(base+route);assert.equal(r.status,200);const csp=r.headers.get('content-security-policy');assert.match(csp,/script-src 'self';/);assert.match(csp,/font-src 'self' data:;/);assert.ok(!/cdnjs|googleapis|gstatic|unsafe-eval/.test(csp));assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.match(r.headers.get('strict-transport-security'),/max-age=31536000/);}
 for(const item of manifest.dependencies){const r=await fetch(base+'/shared/vendor/'+item.file);assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/javascript/);assert.equal(crypto.createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),item.sha256);}
 assert.equal((await fetch(base+'/shared/vendor/jspdf-2.5.1.umd.min.js',{redirect:'manual'})).status,303);
});
