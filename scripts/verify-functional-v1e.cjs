const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const { selectorContext } = require('./test-support/selector-context.cjs');
const { loadApp, read, plain } = require('./test-support/catalog-context.cjs');

for (const app of ['public','ofe']) {
  test(`${app}: four selectors lock catalog tuition, restore canonical values and unlock manual input`, async () => {
    const {context:c, elements:e, button} = selectorContext(app); await c.SimuladorOFE.init();
    const p = c.SimuladorOFE.catalog.programs[0];
    for(const tab of [1,2,3,7]) {
      assert.equal(e['mat'+tab].readOnly, false);
      e['prog'+tab].value=p.id; c.setMat(tab);
      assert.equal(e['mat'+tab].readOnly,true);
      e['mat'+tab].value=1;
      if(tab===7) e.cap7.value=1000000;
      await c.runCalculation(button(),tab,{1:c.calcular1,2:c.calcular2,3:c.calcular3,7:c.calcular7}[tab],'Test');
      assert.equal(c.calculationResultForTab(tab).mat,p.valorMatricula);
      e['prog'+tab].value='';c.setMat(tab);
      assert.equal(e['mat'+tab].readOnly,false); assert.equal(e['mat'+tab].value,'');
      e['mat'+tab].value=4800000; c.sincronizarMatriculaCatalogo(tab);
      assert.equal(Number(e['mat'+tab].value),4800000);
    }
  });
  test(`${app}: capacity caps at required payment and reacts to terms, benefits and fund rate without drift`, async () => {
    const {context:c, elements:e}=selectorContext(app);await c.SimuladorOFE.init();
    e.mat7.value=4800000;e.tasa7.value=0;e.plazo7.value=6;e.cap7.value=1200000;
    let d=c.recalc7();assert.equal(d.cap,800000);assert.equal(Number(e.cap7.value),800000);assert.equal(d.fin,4800000);
    e.plazo7.value=4;d=c.recalc7();assert.equal(d.cap,1200000);
    e.plazo7.value=6;e.cap7.value=500000;d=c.recalc7();assert.equal(d.cap,500000);assert.equal(d.fin,3000000);
    c.calcular7();d=c.SimuladorOFE.state.results.initialPayment;
    assert.equal(d.cuotaInicial,1800000);assert.equal(d.desembolso,d.cuotaInicial+d.gar);
    assert.match(e.res7.innerHTML,/Total inicial a pagar/);assert.match(e.res7.innerHTML,/no incluye el aporte/);
    e.cap7.value=99999999;e.tasa7.value=1.53;e.plazo7.value=6;d=c.recalc7();
    const required=c.cuotaMes(4800000,1.53/100,6);
    assert.equal(d.cap,required);assert.equal(d.fin,4800000);
    for(let i=0;i<20;i++) assert.equal(c.recalc7().cap,required);
    c.SimuladorOFE.state.financing.benefits[7]=[{id:1,nombre:'Beca',val:1200000,pct:25}];
    d=c.recalc7();assert.equal(d.neto,3600000);assert.equal(d.cap,c.cuotaMes(3600000,1.53/100,6));
    c.SimuladorOFE.config={...c.SimuladorOFE.config,garantisaCP:.05};d=c.recalc7();assert.equal(d.gar,180000);
    c.SimuladorOFE.state.financing.benefits[7][0].val=4800000;c.calcular7();
    assert.equal(c.SimuladorOFE.state.results.initialPayment.desembolso,0);
    c.limpiar7();assert.equal(e.cap7.value,'');assert.equal(e.mat7.readOnly,false);
  });
  test(`${app}: PDF and Excel use the same initial payment totals`, async()=>{
    const {context:c,elements:e}=selectorContext(app);await c.SimuladorOFE.init();
    e.mat7.value=4800000;e.tasa7.value=0;e.plazo7.value=6;e.cap7.value=500000;c.calcular7();
    const d=c.SimuladorOFE.state.results.initialPayment;let report, workbook;
    c.jspdf={jsPDF:class {save(){}}};c.pdfPremiumCreditReport=(_doc,cfg)=>report=cfg;c.pdfPie=()=>{};
    c.expPDF7();assert.equal(report.heroValue,vm.runInContext('cop(SimuladorOFE.state.results.initialPayment.desembolso)',c));assert.equal(report.heroSide.length,3);
    assert.equal(report.heroSide[0].value,vm.runInContext('cop(SimuladorOFE.state.results.initialPayment.cuotaInicial)',c));assert.equal(report.heroSide[1].value,vm.runInContext('cop(SimuladorOFE.state.results.initialPayment.gar)',c));
    c.OFEExcel.download=async model=>(workbook=model);
    await c.expXLS7();assert.equal(workbook.sections.flatMap(section=>section.fields).find(row=>row.label==='Total inicial').value,d.desembolso);
    // El último script sustituye los exportadores legacy en el navegador.
    vm.runInContext(read(`apps/${app}/simulador-assets/js/10-pdf-aptos.js`),c);
    c.captureReport=cfg=>report=cfg;vm.runInContext('PDFV5.report = cfg => captureReport(cfg)',c);
    await c.expPDF7();assert.equal(report.hero.label,'Total inicial a pagar');
    assert.equal(report.hero.value,'$ 1.925.100');assert.equal(report.hero.side[0].value,'$ 1.800.000');
    assert.equal(report.hero.side[1].value,'$ 125.100');assert.match(report.note,/no incluye el aporte/);
    assert.equal(workbook.sections.flatMap(section=>section.fields).find(row=>row.label==='Cuota inicial requerida (sin Garantisa)').value,d.cuotaInicial);
  });
}

test('search supports accents, partial text, keyboard selection, duplicate labels and clearing',async()=>{
  const {context:c,elements:e}=selectorContext('public');
  vm.runInContext(read('shared/program-catalog/program-picker.js'),c);await c.SimuladorOFE.init();
  const input=e['program-search1'],list=e['program-options1'];
  input.value='INGENIERIA industrial';input.fire('input');
  assert.equal(list.children.length,2);assert.match(list.children[1].textContent,/Ingeniería Industrial/);
  input.fire('keydown',{key:'Enter'});assert.equal(e.mat1.readOnly,true);assert.equal(input.attributes['aria-expanded'],'false');
  e['program-clear1'].fire('click');assert.equal(e.prog1.value,'');assert.equal(e.mat1.readOnly,false);
  c.setNivel(1,'posgrado');input.value='seguridad de la informacion';input.fire('input');
  assert.equal(list.children.length,3);assert.notEqual(list.children[1].textContent,list.children[2].textContent);
  input.fire('keydown',{key:'ArrowDown'});input.fire('keydown',{key:'Enter'});
  assert.equal(Number(e.mat1.value),14346600);
  input.value='zzzz';input.fire('input');assert.equal(list.children.length,1);input.fire('keydown',{key:'Escape'});
  assert.equal(input.attributes['aria-expanded'],'false');assert.equal(e.mat1.readOnly,false);
});

function importer(){const {context:c,snapshot}=loadApp('ofe');vm.runInContext(read('shared/program-catalog/catalog-import.js'),c);return {c,api:c.ProgramCatalogImport,snapshot};}
test('import parses COP formats exactly and rejects malformed or negative data',()=>{
  const {api}=importer();
  for(const input of [20495600,'20.495.600','$ 20.495.600','20,495,600','COP 20495600']) assert.equal(api.amount(input),20495600);
  for(const input of ['',null,-1,Infinity,'9'.repeat(400),'1.2.3','1x23','-100','1e6']) assert.throws(()=>api.amount(input));
  assert.equal(api.amount('1.234,50'),1234.5);
  const result=api.parse([['Nombre','Valor','Idiomas','Semestres'],['Programa','1.000.000',0,8.5],['',1000,0,8],['Otro',-2,0,8]],'pregrado',{nombre:0,valor:1,idiomas:2,semestres:3});
  assert.equal(result.valid,false);assert.equal(result.errors.length,3);
  assert.equal(api.parse([['N','V'],['Programa',1000]],'pregrado',{nombre:0}).valid,false);
});
test('import validates all sheets, retains same-name rows and leaves live catalog unchanged',()=>{
  const {api,snapshot}=importer();const before=JSON.stringify(snapshot);
  const pos=api.parse([['N','S','V'],...snapshot.posgrados],'posgrado',{nombre:0,subnivel:1,valor:2});
  const candidate=api.prepare({pos},snapshot);
  assert.equal(candidate.total,173);assert.equal(candidate.uniqueIds,173);assert.equal(candidate.duplicateGroups,1);
  assert.deepEqual(plain(candidate.changedLevels),[]);assert.equal(JSON.stringify(snapshot),before);
  assert.throws(()=>api.prepare({pos,bad:{valid:false,rows:[]}},snapshot));
});
test('permissions deny unconfigured authentication and clear grants after session expiry',async()=>{
  const {context:c}=loadApp('ofe');c.document.querySelectorAll=()=>[];
  await c.OFEPermissions.refresh();assert.equal(c.OFEPermissions.allowed('programs.update'),false);
  c.OFEAuth={isAuthenticated:async()=>true,can:async permission=>permission==='programs.update'};
  await c.OFEPermissions.refresh();assert.equal(c.OFEPermissions.allowed('programs.update'),true);
  c.OFEAuth.isAuthenticated=async()=>false;await c.OFEPermissions.refresh();assert.equal(c.OFEPermissions.allowed('programs.update'),false);
});
test('updater cannot export changes without institutional persistence and audit',async()=>{
  const {context:c}=selectorContext('ofe');await c.SimuladorOFE.init();
  vm.runInContext(read('shared/program-catalog/catalog-import.js'),c);
  vm.runInContext(read('apps/ofe/simulador-assets/js/08-updater.js'),c);
  assert.match(c.construirHTMLActualizado().error,/API autenticada/);
});
test('every rendered delegated button action has a handler',()=>{
  for(const app of ['public','ofe']) {
    const markup=read(`apps/${app}/index.html`);
    const actions=new Set(Array.from(markup.matchAll(/data-action="([^"]+)"/g),m=>m[1]));
    const source=read(`apps/${app}/simulador-assets/js/06-actions-history.js`);
    for(const action of actions) assert.ok(source.includes(`case '${action}':`),`${app}: ${action}`);
  }
});

test('initial payment history retains zero interest and makes the initial total explicit',async()=>{
  const {context:c,elements:e}=selectorContext('public');await c.SimuladorOFE.init();
  e.mat7.value=4800000;e.cap7.value=500000;e.plazo7.value=6;e.tasa7.value=0;
  c.calcular7();c.registrarHistorial(7);const entry=c.getHistorial()[0];
  assert.match(e['historial-panel'].innerHTML,/Total inicial a pagar/);
  c.duplicarHistorial(entry.id);assert.equal(Number(e.tasa7.value),0);
  c.abrirModalAccesible=()=>{};c.verHistorial(entry.id);
  assert.match(e['detail-body'].innerHTML,/Cuota inicial requerida \(sin fondo\)/);
  assert.match(e['detail-body'].innerHTML,/Total inicial a pagar/);
});
test('invalid remapping clears preview readiness and uploaded HTML is validated without numeric defaults',async()=>{
  const {context:c,elements:e}=selectorContext('ofe');await c.SimuladorOFE.init();
  // The legacy validator remains an isolated compatibility test; its UI is retired.
  for(const id of ['preview-area','parsed-status','btn-gen','cnt-pre','cnt-pos','resumen-cambios','msg-gen'])e[id]=c.document.createElement('div');
  vm.runInContext(read('shared/program-catalog/catalog-import.js'),c);
  vm.runInContext(read('apps/ofe/simulador-assets/js/08-updater.js'),c);
  const html=read('apps/ofe/index.html');const extracted=c.extraerProgramasDelHTML(html);
  assert.equal(extracted.pregrado.length,29);assert.equal(extracted.posgrado.length,144);
  const state=c.SimuladorOFE.state.updater;
  state.workbook={Sheets:{Pre:[['N','V'],['Programa',1000000]]}};
  c.XLSX={utils:{sheet_to_json:sheet=>sheet}};
  for(const [key,value] of [['nombre','0'],['valor','1']]) {e['map-'+key]=c.document.createElement('input');e['map-'+key].value=value;}
  c.previewSheet('Pre');assert.equal(state.parsedData.Pre.valid,true);assert.equal(e['btn-gen'].disabled,true);
  e['map-valor'].value='';c.previewSheet('Pre');assert.equal(state.parsedData.Pre.valid,false);
  assert.equal(e['btn-gen'].disabled,true);assert.equal(e['preview-area'].innerHTML,'');
});
