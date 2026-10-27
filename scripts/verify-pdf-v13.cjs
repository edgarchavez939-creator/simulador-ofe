'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {fixture}=require('./test-support/report-fixtures.cjs');
const {selectorContext}=require('./test-support/selector-context.cjs');
const {jsPDF}=require('../shared/vendor/jspdf-4.2.1.umd.min.js');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p));
const identity={regular:read('shared/fonts/PublicSans-Regular.ttf').toString('base64'),bold:read('shared/fonts/PublicSans-Bold.ttf').toString('base64'),logo:new Uint8Array(read('shared/branding/ofe-color.png'))};
function renderer(c){
 const calls=[];c.jspdf={jsPDF:function(options){const doc=new jsPDF(options),text=doc.text;doc.text=function(value,x,y,options){calls.push({text:String(value),x,y,options,font:doc.getFont().fontName,page:doc.getNumberOfPages()});return text.call(this,value,x,y,options);};return doc;}};
 vm.runInContext(read('shared/exports/pdf-report.js').toString(),c);return calls;
}
const amount=v=>'$'+Math.round(v).toLocaleString('es-CO');
test('PDF uses exact same normalized amounts as Excel for all modalities; real output has Public Sans, logo, ascending legend and privacy',async()=>{
 const {context:c}=await fixture();const calls=renderer(c);
 for(const key of [1,2,3,7,5,'languages']){
  calls.length=0;const r=c.OFEReport.pdf(key),normalized=c.OFEReport.normalize(key,c.OFEReport.result(key));assert.equal(JSON.stringify(r.sections),JSON.stringify(normalized.sections));
  const d=c.OFEPdf.build([r],identity),texts=calls.map(x=>x.text),combined=texts.join('\n');
  const output=Buffer.from(d.output('arraybuffer'));assert.ok(output.length>20000);assert.ok(combined.includes('Usuario Público'));assert.ok(!combined.includes('@'));
  if(key===3){assert.ok(combined.includes('Crédito Banco Aliado'));assert.ok(combined.includes('la entidad financiera'));assert.ok(!/Uninorte|Universidad del Norte|Vigilado Mineducación/.test(combined));assert.ok(!/\/Subtype\s*\/Image/.test(output.toString('latin1')));}
  else{assert.ok(combined.includes('Simulación de Crédito Uninorte'));assert.ok(calls.some(x=>x.text==='Vigilado Mineducación'&&x.options.angle===90));}
  assert.ok(calls.every(x=>x.font==='PublicSans'));assert.ok(calls.every(x=>x.x>=34&&x.x<=544&&x.y<818));
  assert.ok(combined.replace(/\s+/g,' ').includes('no constituye aprobación del crédito.'));
  const financing=normalized.sections.find(s=>s.title==='Financiación'||s.title==='Financiación de la nueva condición'||s.title==='Financiación total');assert.ok(combined.includes(amount(financing.fields.find(f=>/Monto financiado/.test(f.label)).value)));
  const total=normalized.sections.find(s=>/^Totales/.test(s.title)).fields.find(f=>/Costo total/.test(f.label));assert.ok(texts.includes(amount(total.value)));
  const textByPage=new Map();for(const call of calls){if(!textByPage.has(call.page))textByPage.set(call.page,[]);textByPage.get(call.page).push(call.text);}
  assert.equal(calls.filter(x=>x.text==='Generado por').length,d.getNumberOfPages());
 }
});
test('signature is derived from authenticated email; public ignores identity; snapshots and projections survive mutable controls/configuration',async()=>{
 for(const [email,publicMode,wanted] of [['qa.autor@example.test',false,'qa.autor'],['asesor.credito@example.test',false,'asesor.credito'],['qa.autor@example.test',true,'Usuario Público']]){
  const {context:c,elements:e}=selectorContext('ofe');c.OFE_SERVER={};if(publicMode)c.OFE_PUBLIC={};c.OFEAuth={...c.OFEAuth,request:async()=>({values:c.OFETextSchema.defaults,version:1}),getUser:async()=>({email,name:'Nombre que no se debe imprimir'})};await c.SimuladorOFE.init();
  e.prog1.value=c.SimuladorOFE.catalog.programs[0].id;c.setMat(1);e.plazo1.value=6;e.tasa1.value=1.53;c.calcular1();const d=c.OFEReport.result(1),before=c.OFEReport.pdf(1);assert.equal(before.signature,wanted);
  d.reportSnapshot={...d.reportSnapshot,generatedBy:'falso@example.com',signature:'FIRMA ARBITRARIA'};e.tasa1.value=9;c.SimuladorOFE.config={garantisaCP:.99};assert.equal(JSON.stringify(c.OFEReport.pdf(1)),JSON.stringify(before));
  const first=c.OFEReport.pdf(1);first.signature='ALTERADA';first.sections.length=0;assert.equal(JSON.stringify(c.OFEReport.pdf(1)),JSON.stringify(before));
 }
 const {context:c}=await fixture();const d=c.OFEReport.result(2),before=c.OFEReport.pdf(2);c.SimuladorOFE.state.results.projectionLP={filas:[{s:999}]};assert.equal(JSON.stringify(c.OFEReport.pdf(2)),JSON.stringify(before));assert.ok(d);
});
test('zero optional charges vanish, pure LP stays pending and high values/long names/long plans paginate without clipping',async()=>{
 const {context:c,elements:e}=await fixture();const calls=renderer(c);
 e.pctCP.value=0;e.pctLP.value=100;c.calcular2();c.OFEPdf.build([c.OFEReport.pdf(2)],identity);let text=calls.map(x=>x.text).join('\n');assert.ok(text.includes('tasa, cuota e intereses pendientes'));assert.ok(!text.includes('Cuota mensual estimada'));
 calls.length=0;const a=c.amortizacion(1e12,.0125,96),d={...a,mat:1e12,financiado:1e12,n:96,tm:.0125,cuotaInicial:0,garantisa:0,pagoInicial:0,totalGeneral:a.totCap+a.totInt,reportSnapshot:{program:'Especialización en '+('Gestión e Innovación Organizacional '.repeat(7)),level:'posgrado',occurredAt:'2026-10-16T15:00:00Z'}};
 const report=c.OFEReport.pdf(1,d),doc=c.OFEPdf.build([report],identity);assert.ok(doc.getNumberOfPages()>=5);text=calls.map(x=>x.text).join('\n');assert.ok(!text.includes('Aporte Garantisa'));assert.ok(!text.includes('Cuota inicial'));assert.ok(calls.every(x=>x.y<818));
 const rows=calls.filter(x=>/^\d+$/.test(x.text)&&x.x>84&&x.x<90);assert.equal(rows.length,96);
});
test('combined and restructuring comparison exports route to the shared renderer without financial recalculation',async()=>{
 const {context:c}=await fixture();let reports;c.OFEPdf={download:async value=>reports=value};vm.runInContext(read('apps/ofe/simulador-assets/js/10-pdf-aptos.js').toString(),c);
 await c.expPDFCombinado();assert.equal(reports.length,2);assert.ok(reports[1].modality.includes('idiomas'));
 c.SimuladorOFE.state.restructuring.scenarios.push(c.SimuladorOFE.state.restructuring.current,c.SimuladorOFE.state.restructuring.current);await c.expPDFRefiComp();assert.equal(reports.length,2);assert.ok(reports[0].modality.includes('Escenario 1'));
});
test('twenty-semester projection uses the calculation snapshot and continues without truncating rows',async()=>{
 const {context:c,elements:e}=await fixture();e.proyLP.checked=true;e.plazoLP.value=20;e.inicioLP.value=1;c.calcular2();const before=c.OFEReport.pdf(2);assert.equal(before.projections[0].data.filas.length,20);
 c.SimuladorOFE.state.results.projectionLP.filas.length=0;e.ipcLP.value=99;assert.equal(c.OFEReport.pdf(2).projections[0].data.filas.length,20);
 const calls=renderer(c),doc=c.OFEPdf.build([before],identity);assert.ok(doc.getNumberOfPages()>=4);assert.ok(calls.some(x=>x.text==='20'&&x.x===87));assert.ok(calls.every(x=>x.y<818));
});
