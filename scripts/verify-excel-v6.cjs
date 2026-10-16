'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {read}=require('./test-support/catalog-context.cjs'),{fixture}=require('./test-support/report-fixtures.cjs');
const ExcelJS=require('../shared/vendor/exceljs-4.4.0.min.js');
const exportHost={ExcelJS,Date,Intl};new Function('window',read('shared/exports/excel-report.js'))(exportHost);const build=report=>exportHost.OFEExcel.build(JSON.parse(JSON.stringify(report)));
const find=(report,label)=>report.sections.flatMap(s=>s.fields).find(field=>field.label===label)?.value;
test('all supported effective/nominal periods preserve the original annual basis and round-trip',()=>{
 const c=vm.createContext({});c.window=c;vm.runInContext(read('shared/finance/rate-converter.js'),c);const {equivalent,periods}=c.OFERateConverter;
 for(const sourcePeriod of Object.keys(periods))for(const targetPeriod of Object.keys(periods))for(const sourceType of ['efectiva','nominal'])for(const targetType of ['efectiva','nominal'])for(const value of [0,.125,1.25,18]){
  const args={sourcePeriod,targetPeriod,sourceType,targetType,sourceCapitalization:'m',targetCapitalization:'t',value},forward=equivalent(args);
  const inverse=equivalent({sourcePeriod:targetPeriod,targetPeriod:sourcePeriod,sourceType:targetType,targetType:sourceType,sourceCapitalization:'t',targetCapitalization:'m',value:forward.result*100});assert.ok(Math.abs(inverse.result*100-value)<1e-7,JSON.stringify(args));
  const annual=sourceType==='efectiva'?Math.pow(1+value/100,periods[sourcePeriod].n)-1:Math.pow(1+value/100*periods[sourcePeriod].n/12,12)-1;assert.equal(forward.annual,annual);
 }
 for(const sourceCapitalization of Object.keys(periods))for(const targetCapitalization of Object.keys(periods)){const x=equivalent({value:12,sourceType:'nominal',targetType:'nominal',sourcePeriod:'a',targetPeriod:'a',sourceCapitalization,targetCapitalization});assert.ok(Number.isFinite(x.result));}
 for(const value of ['',null,-1,NaN,Infinity])assert.throws(()=>equivalent({value}));assert.throws(()=>equivalent({value:1,sourcePeriod:'invalid'}));assert.throws(()=>equivalent({value:1e200,sourcePeriod:'d'}));assert.equal(equivalent({value:0}).result,0);
});
test('normalized snapshots retain real amounts, optional identity and future LP uncertainty',async()=>{
 const {context:c,elements:e}=await fixture();
 for(const key of [1,2,3,7,5,'languages']){
  const d=c.OFEReport.result(key),before=JSON.stringify(d),r=c.OFEReport.normalize(key,d);assert.equal(r.disclaimer,c.OFEReport.disclaimer);assert.ok(r.occurredAt);assert.equal(JSON.stringify(d),before);
  if(key===7){assert.equal(find(r,'Total inicial'),d.desembolso);assert.equal(find(r,'Cuota inicial requerida (sin Garantisa)'),d.cuotaInicial);assert.equal(find(r,'Capacidad mensual indicada'),d.capIngresada);assert.equal(find(r,'Diferencia disponible'),0);}
  if(key===3){assert.equal(find(r,'Otros cargos iniciales'),d.cargos);assert.ok(!r.sections.some(s=>s.title==='Garantisa'));}
  if(key===2){assert.equal(r.pending,true);assert.ok(r.sections.some(s=>s.title==='Componente largo plazo'&&/pendientes/.test(s.note)));assert.ok(!r.sections.find(s=>s.title==='Componente largo plazo').fields.some(f=>f.label==='Cuota mensual estimada'));assert.ok(Math.abs(find(r,'Costo total conocido, sin intereses futuros LP')-(d.pagoInicial+d.CP.totCap+d.CP.totInt+d.finLP))<1e-6);}
  if(key===5){assert.equal(find(r,'Saldo actual'),d.saldo);assert.equal(find(r,'Monto reestructurado'),d.principal);assert.ok(!r.program);}
 }
 const old=c.OFEReport.result(1),serialized=JSON.stringify(c.OFEReport.normalize(1,old));e.tasa1.value=9;c.SimuladorOFE.config={...c.SimuladorOFE.config,garantisaCP:.5};assert.equal(JSON.stringify(c.OFEReport.normalize(1,old)),serialized);
 e.prog1.value='';c.setMat(1);e.mat1.value=1000000;c.calcular1();assert.equal(c.OFEReport.normalize(1,c.OFEReport.result(1)).program,null);
 const long={...old,reportSnapshot:{...old.reportSnapshot,program:'Especialización '+('Programa académico con nombre extenso '.repeat(8))}};assert.ok(c.OFEReport.normalize(1,long).program.length>250);
});
test('real XLSX reopens with Aptos Narrow, typed amounts/date/percent, frozen plan, filters, totals and print legend',async()=>{
 const {context:c}=await fixture();c.ExcelJS=ExcelJS;c.Date=Date;c.Intl=Intl;
 for(const key of [1,2,3,7,5,'languages']){
  const r=c.OFEReport.normalize(key,c.OFEReport.result(key)),wb=build(r),buffer=await wb.xlsx.writeBuffer(),opened=new ExcelJS.Workbook();await opened.xlsx.load(buffer);
  assert.equal(opened.worksheets[0].name,'Resumen');const summary=opened.getWorksheet('Resumen'),plan=opened.getWorksheet('Plan de pagos');let hasDate=false,hasPercent=false,hasMoney=false,hasLegend=false;
  for(const sheet of opened.worksheets)sheet.eachRow(row=>row.eachCell(cell=>{if(cell.type===ExcelJS.ValueType.Merge)return;if(cell.value!==null){assert.equal(cell.font.name,'Aptos Narrow');if(String(cell.value)===(key===3?c.OFEReport.disclaimer.replace('la Universidad del Norte y/o las entidades que intervengan en el proceso de financiación','la entidad financiera'):c.OFEReport.disclaimer))hasLegend=true;if(cell.value instanceof Date)hasDate=true;if(cell.numFmt==='0.00%'){hasPercent=true;assert.equal(typeof cell.value,'number');}if(cell.numFmt?.includes('es-CO')){hasMoney=true;assert.equal(typeof (cell.value?.formula?cell.value.result:cell.value),'number');}}}));
  assert.ok(hasDate&&hasPercent&&hasMoney&&hasLegend);assert.ok(summary.pageSetup.printArea);assert.equal(summary.autoFilter,undefined);assert.equal(plan.views[0].ySplit,4);assert.ok(plan.autoFilter);assert.equal(plan.pageSetup.printTitlesRow,'1:4');assert.match(plan.getCell(plan.rowCount,3).value.formula,/SUM/);
  assert.equal(plan.getCell(5,3).value,r.plans[0].rows[0].capital);assert.equal(plan.getCell(5,2).value,r.plans[0].rows[0].payment);
  const d=c.OFEReport.result(key);assert.ok(Math.abs(plan.getCell(plan.rowCount,3).value.result-(key===2?d.CP.totCap:d.totCap))<1e-6);
 }
});
test('zero Garantisa, minimum/large values, long plans, missing identity and pure LP export without invented payments',async()=>{
 const {context:c,elements:e}=await fixture();c.ExcelJS=ExcelJS;c.Date=Date;
 for(const principal of [1,1e12]){const a=c.amortizacion(principal,.0125,600),d={...a,financiado:principal,mat:principal,n:600,tm:.0125,cuotaInicial:0,garantisa:0,pagoInicial:0,totalGeneral:a.totCap+a.totInt,progNombre:'Programa'};const r=c.OFEReport.normalize(1,d),wb=build(r);assert.equal(r.program,null);assert.equal(find(r,'Aporte Garantisa'),0);assert.equal(r.plans[0].rows.length,600);assert.equal(wb.getWorksheet('Plan de pagos').rowCount,605);await wb.xlsx.writeBuffer();}
 e.pctCP.value=0;e.pctLP.value=100;c.calcular2();const lp=c.OFEReport.result(2),r=c.OFEReport.normalize(2,lp);assert.equal(r.modality,'Crédito largo plazo');assert.equal(r.plans.length,0);assert.equal(build(r).worksheets.length,1);assert.equal(find(r,'Costo total conocido, sin intereses futuros LP'),lp.pagoInicial+lp.finLP);
 c.SimuladorOFE.state.languages.context={tabId:2,valorIdiomas:1000000,progNombre:'Administración de Empresas'};e['id-pctCP'].value=40;e['id-pctLP'].value=60;e['id-cont-val'].value=0;c.calcularIdiomas();const language=c.OFEReport.result('languages'),ids=c.OFEReport.normalize('languages',language);assert.equal(ids.pending,true);assert.ok(ids.modality.includes('Idiomas'));assert.equal(find(ids,'Garantisa largo plazo'),language.garLP);
});
