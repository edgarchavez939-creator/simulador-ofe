'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fixture}=require('./test-support/report-fixtures.cjs'),ExcelJS=require('../shared/vendor/exceljs-4.4.0.min.js');
const host={ExcelJS,Date,Intl};new Function('window',fs.readFileSync(require.resolve('../shared/exports/excel-report.js'),'utf8'))(host);
const logo=new Uint8Array(fs.readFileSync(require.resolve('../shared/branding/ofe-color.png')));
test('upfront total leads its cash and guarantee breakdown for every result without mutating the financial snapshot',async()=>{
 const {context:c,elements:e}=await fixture();
 for(const key of [1,2,3,7,'languages']){
  const d=c.OFEReport.result(key),before=JSON.stringify(d),cards=c.OFEResultDetails.cards(key,d);
  assert.equal(cards[0].label,'Pago total de contado');assert.equal(cards[0].value,key===7?d.desembolso:d.pagoInicial);
  assert.equal(cards[1].value,d.cuotaInicial);assert.match(cards[1].detail,/%/);
  assert.ok(Math.abs(cards.slice(1).reduce((sum,item)=>sum+item.value,0)-cards[0].value)<1e-6);
  assert.equal(JSON.stringify(d),before);
 }
 e.pctCP.value=0;e.pctLP.value=100;c.calcular2();let cards=c.OFEResultDetails.cards(2,c.OFEReport.result(2));assert.ok(cards.some(c=>c.label==='Garantisa largo plazo'));assert.ok(!cards.some(c=>c.label==='Garantisa corto plazo'));
 c.SimuladorOFE.state.languages.context={tabId:2,valorIdiomas:1000000,progNombre:'Programa'};e['id-pctCP'].value=40;e['id-pctLP'].value=60;c.calcularIdiomas();cards=c.OFEResultDetails.cards('languages',c.OFEReport.result('languages'));assert.equal(cards.filter(c=>/^Garantisa/.test(c.label)).length,2);
});
test('compact Excel retains exact totals and every schedule entry, including separate components and logo',async()=>{
 const {context:c}=await fixture();
 for(const key of [1,2,3,7,5,'languages']){
  const report=JSON.parse(JSON.stringify(c.OFEReport.normalize(key,c.OFEReport.result(key)))),before=JSON.stringify(report),wb=host.OFEExcel.build(report,logo),opened=new ExcelJS.Workbook();await opened.xlsx.load(await wb.xlsx.writeBuffer());
  assert.equal(JSON.stringify(report),before);
  const summary=opened.getWorksheet('Resumen');assert.ok(summary.rowCount<=42);if(key===3){assert.equal(summary.getImages().length,0);assert.equal(opened.creator,'Simulador de crédito');assert.ok(!summary.headerFooter.oddFooter.includes('Universidad del Norte'));}else assert.equal(summary.getImages()[0].range.ext.width,324);
  const values=[];summary.eachRow(row=>row.eachCell(cell=>{if(cell.type!==ExcelJS.ValueType.Merge)values.push(cell.value);}));
  const total=report.sections.find(s=>/^Totales/.test(s.title)).fields.find(f=>/^Costo total/.test(f.label)).value;assert.ok(values.includes(total));
  assert.equal(values.filter(v=>v==='Monto financiado').length,report.sections.filter(s=>/^(Financiación|Componente)/.test(s.title)).flatMap(s=>s.fields).filter(f=>f.label==='Monto financiado').length);
  const sheet=opened.getWorksheet('Plan de pagos'),rows=report.plans.flatMap(p=>p.rows);assert.equal(sheet.rowCount,rows.length+5);
  assert.equal(sheet.getCell(4,2).value,'Pago mensual');
  rows.forEach((r,i)=>{for(const [col,value] of [[1,r.installment],[2,r.payment],[3,r.capital],[4,r.interest],[5,r.balance]])assert.equal(sheet.getCell(i+5,col).value,value);});
 }
 const base=JSON.parse(JSON.stringify(c.OFEReport.normalize(1,c.OFEReport.result(1))));base.plans.push({...base.plans[0],name:'Componente adicional'});const multi=host.OFEExcel.build(base).getWorksheet('Plan de pagos');assert.equal(multi.getCell(4,1).value,'Componente');assert.equal(multi.getCell(5,3).value,base.plans[0].rows[0].payment);assert.equal(multi.rowCount,base.plans[0].rows.length*2+5);
});
test('PDF header logo is exactly ten percent smaller while its source asset is reused',async()=>{
 const {context:c}=await fixture(),calls=[],{jsPDF}=require('../shared/vendor/jspdf-4.2.1.umd.min.js');c.jspdf={jsPDF:function(options){const doc=new jsPDF(options),add=doc.addImage;doc.addImage=function(...args){calls.push(args);return add.apply(this,args);};return doc;}};
 vm.runInContext(fs.readFileSync(require.resolve('../shared/exports/pdf-report.js'),'utf8'),c);
 const identity={regular:fs.readFileSync(require.resolve('../shared/fonts/PublicSans-Regular.ttf')).toString('base64'),bold:fs.readFileSync(require.resolve('../shared/fonts/PublicSans-Bold.ttf')).toString('base64'),logo};
 c.OFEPdf.build([c.OFEReport.pdf(1)],identity);assert.ok(calls.length);for(const args of calls){assert.equal(args[0],logo);assert.equal(args[4],270*.9);assert.equal(args[5]/args[4],59/304);}
});
