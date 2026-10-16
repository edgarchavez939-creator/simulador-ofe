'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {selectorContext}=require('./test-support/selector-context.cjs');
for(const app of ['public','ofe']){
 test(app+': Garantisa uses two lines, Colombian currency and the actual financed base',async()=>{
  const {context:c,elements:e}=selectorContext(app);await c.SimuladorOFE.init();
  assert.deepEqual(JSON.parse(JSON.stringify(c.OFEGuaranteeCopy.format(13170800,549222.36,.0417))),{title:'Aporte Garantisa: $549.222',detail:'4,17% sobre $13.170.800 financiados'});
  const p=c.SimuladorOFE.catalog.programs.find(p=>p.nombre==='Ciencia Política y Gobierno');assert.ok(p);
  e.prog1.value=p.id;c.setMat(1);e['cont1-val'].value=0;c.recalcAll(1);
  assert.equal(e['garantisa1-label'].textContent,'Aporte Garantisa: $549.222');assert.equal(e['garantisa1-val'].textContent,'4,17% sobre $13.170.800 financiados');
  c.SimuladorOFE.state.financing.benefits[1]=[{val:170800}];e['cont1-val'].value=1000000;c.recalcAll(1);
  assert.equal(e['garantisa1-label'].textContent,'Aporte Garantisa: $500.400');assert.equal(e['garantisa1-val'].textContent,'4,17% sobre $12.000.000 financiados');
  c.calcular1();assert.equal(c.SimuladorOFE.state.results.shortTerm.financiado,12000000);assert.equal(c.SimuladorOFE.state.results.shortTerm.garantisa,500400);
  e.prog2.value=p.id;c.setMat(2);e.pctCP.value=40;e.pctLP.value=60;c.recalcAll(2);
  assert.equal(e['gCP-val'].textContent,'4,17% sobre $5.268.320 financiados');assert.equal(e['gLP-val'].textContent,'2,86% sobre $7.902.480 financiados');
  e.prog7.value=p.id;c.setMat(7);e.cap7.value=1000000;const preview=c.recalc7();
  assert.equal(e['garantisa7-label'].textContent,c.OFEGuaranteeCopy.format(preview.fin,preview.gar,preview.fundRate).title);assert.equal(e['gar7-val'].textContent,c.OFEGuaranteeCopy.format(preview.fin,preview.gar,preview.fundRate).detail);
  e['cont1-val'].value=p.valorMatricula;c.SimuladorOFE.state.financing.benefits[1]=[];c.recalcAll(1);assert.equal(e['garantisa1-label'].textContent,'Aporte Garantisa: —');
 });
}
test('Garantisa legend follows per-simulation configurable percentages including zero',async()=>{
 const vm=require('node:vm'),{read}=require('./test-support/catalog-context.cjs');
 const {context:c,elements:e}=selectorContext('ofe');await c.SimuladorOFE.init();
 let config={version:1,values:{default_interest_rate:1.53,default_installments:6,garantisa_cp_percent:5,garantisa_lp_percent:3}};
 c.OFE_SERVER={};c.OFEAuth={request:async()=>config};c.NodeFilter={SHOW_TEXT:4};c.document.createTreeWalker=()=>({nextNode:()=>null});
 vm.runInContext(read('shared/settings/simulation-settings.js'),c);await c.SimuladorOFE.modules['global-simulation-settings'].init();
 const p=c.SimuladorOFE.catalog.programs.find(p=>p.nivel==='pregrado');e.prog1.value=p.id;c.setMat(1);e['cont1-val'].value=0;c.recalcAll(1);
 assert.equal(e['garantisa1-val'].textContent,'5,00% sobre $'+p.valorMatricula.toLocaleString('es-CO')+' financiados');
 config={...config,version:2,values:{...config.values,garantisa_cp_percent:0}};await c.OFEGlobalSettings.renew(1);c.recalcAll(1);
 assert.equal(e['garantisa1-label'].textContent,'Aporte Garantisa: $0');assert.match(e['garantisa1-val'].textContent,/^0,00% sobre/);
});
