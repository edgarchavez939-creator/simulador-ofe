'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {selectorContext}=require('./test-support/selector-context.cjs');
const {read}=require('./test-support/catalog-context.cjs');
async function setup(app){const f=selectorContext(app);vm.runInContext(read('shared/simulation/lifecycle.js'),f.context);vm.runInContext(read('shared/program-catalog/program-picker.js'),f.context);await f.context.SimuladorOFE.init();return f;}
for(const app of ['public','ofe'])for(const tab of [1,2,3,7])test(`${app}/${tab}: A→B→A and clear never restore old results; session/theme/history remain`,async()=>{
 const {context:c,elements:e,button}=await setup(app),programs=c.SimuladorOFE.catalog.programs.filter(p=>p.nivel==='pregrado'),[a,b]=programs;
 e['prog'+tab].value=a.id;c.setMat(tab);e['prog'+tab].value=b.id;c.setMat(tab);assert.equal(Number(e['mat'+tab].value),b.valorMatricula);assert.equal(c.calculationResultForTab(tab),null);
 if(tab===7)e.cap7.value=1000000;
 await c.runCalculation(button(),tab,{1:c.calcular1,2:c.calcular2,3:c.calcular3,7:c.calcular7}[tab],'Prueba');
 c.registrarHistorial(tab);const history=JSON.stringify(c.getHistorial());
 c.SimuladorOFE.state.financing.benefits[tab]=[{val:100,pct:1}];c.SimuladorOFE.state.comparison.scenarios[tab]=[{progId:b.id}];
 c.SimuladorOFE.state.results.projectionLP=tab===2?{test:true}:null;
 c.SimuladorOFE.state.languages.context={tabId:tab,progNombre:b.nombre};c.SimuladorOFE.state.results.languages={cuota:100};
 const config=c.SimuladorOFE.config,access=c.SimuladorOFE.state.access;
 c.applyTheme('dark');e['prog'+tab].value=a.id;c.setMat(tab);
 assert.equal(c.calculationResultForTab(tab),null);assert.equal(e['prog'+tab].value,a.id);assert.equal(e['mat'+tab].readOnly,true);assert.match(e['res'+tab].innerHTML,/Nueva simulación/);
 assert.equal(c.SimuladorOFE.state.financing.benefits[tab].length,0);assert.equal(c.SimuladorOFE.state.comparison.scenarios[tab].length,0);assert.equal(c.SimuladorOFE.state.results.languages,null);
 assert.equal(c.SimuladorOFE.config,config);assert.equal(c.SimuladorOFE.state.access,access);assert.equal(c.document.documentElement.getAttribute('data-theme'),'dark');assert.equal(JSON.stringify(c.getHistorial()),history);
 e['prog'+tab].value=b.id;c.setMat(tab);assert.equal(c.calculationResultForTab(tab),null);
 e['prog'+tab].value='';c.setMat(tab);assert.equal(e['mat'+tab].readOnly,false);assert.equal(e['mat'+tab].value,'');
});
test('pending calculation is cancelled when program changes',async()=>{
 const {context:c,elements:e,button}=await setup('public');const [a,b]=c.SimuladorOFE.catalog.programs;
 e.prog1.value=a.id;c.setMat(1);const pending=c.runCalculation(button(),1,c.calcular1,'Calculando');e.prog1.value=b.id;c.setMat(1);await pending;
 assert.equal(c.calculationResultForTab(1),null);assert.match(e.res1.innerHTML,/Nueva simulación/);
});
test('restructuring v2 retains amortization, costs and zero interest; validates and resets',async()=>{
 const {context:c,elements:e}=await setup('ofe');e['refi-capital'].value=10000000;e['refi-intcorr'].value=100000;e['refi-mora'].value=50000;e['refi-costos'].value=200000;e['refi-cuotas-nva'].value=24;e['refi-tasa-nva'].value=1.53;e['refi-capacidad'].value=100000;c.calcularRefi();
 const d=c.SimuladorOFE.state.restructuring.current,expected=c.amortizacion(10350000,1.53/100,24);
 assert.equal(d.principal,10350000);assert.equal(d.cuota,expected.cuota);assert.equal(d.totInt,expected.totInt);assert.match(e['res-refi'].innerHTML,/supera/);assert.match(e['res-refi'].innerHTML,/no registrados/);
 e['refi-tasa-nva'].value=0;c.calcularRefi();assert.equal(c.SimuladorOFE.state.restructuring.current.cuota,10350000/24);
 let error;c.showFieldError=(id,message)=>error={id,message};
 for(const [id,value] of [['refi-capital',-1],['refi-cuotas-nva',1.5],['refi-cuotas-nva',601],['refi-tasa-nva',-2],['refi-intcorr',-1]]){
  const old=e[id].value;e[id].value=value;c.calcularRefi();assert.equal(error.id,id);e[id].value=old;
 }
 c.limpiarRefi();assert.equal(c.SimuladorOFE.state.restructuring.current,null);assert.equal(e['refi-capacidad'].value,'');
});
test('restructuring accepts minimum and large valid amounts without changing common financial files',async()=>{
 const {context:c,elements:e}=await setup('ofe');
 for(const amount of [1,1000000000000]){e['refi-capital'].value=amount;e['refi-cuotas-nva'].value=1;e['refi-tasa-nva'].value=0;c.calcularRefi();assert.equal(c.SimuladorOFE.state.restructuring.current.cuota,amount);}
});

test('restructuring scenarios save, compare, delete and keep independent snapshots',async()=>{
 const {context:c,elements:e}=await setup('ofe');e['refi-capital'].value='10.000.000,50';e['refi-tasa-nva'].value=1.53;e['refi-cuotas-nva'].value=24;c.calcularRefi();c.guardarEscRefi();
 e['refi-cuotas-nva'].value=36;c.calcularRefi();c.guardarEscRefi();
 assert.equal(c.SimuladorOFE.state.restructuring.scenarios.length,2);assert.equal(c.SimuladorOFE.state.restructuring.scenarios[0].n,24);assert.match(e['esc-panel-refi'].innerHTML,/Menor cuota/);
 c.compararEscRefi();assert.match(e['comparison-hub'].innerHTML,/Reestructuración/);c.eliminarEscRefi(0);assert.equal(c.SimuladorOFE.state.restructuring.scenarios.length,1);
 c.invalidarRefi();assert.equal(c.SimuladorOFE.state.restructuring.current,null);assert.match(e['res-refi'].innerHTML,/Condiciones modificadas/);
});

test('identified Excel proposals preserve IDs, validate versions, reject malformed rows and report exact changes',async()=>{
 const {context:c}=await setup('ofe');const programs=Array.from(c.SimuladorOFE.catalog.programs,p=>({...p,version:1}));
 const api=c.ProgramCatalogImport,p=programs.find(x=>x.nivel==='pregrado');
 const headers=['Programa','Valor Pregrado','Valor Idiomas','Semestres','ID','Version'];
 let raw=[headers,[p.nombre,p.valorMatricula+100,p.valorIdiomas,p.semestres,p.id,1]];
 let result=api.identified(raw,'pregrado',programs);assert.equal(result.errors.length,0);assert.equal(result.updates[0].id,p.id);assert.equal(result.updates[0].changes.valorMatricula,p.valorMatricula+100);assert.equal(Object.keys(result.updates[0].changes).length,1);
 raw[1][5]=0;assert.ok(api.identified(raw,'pregrado',programs).errors.length);raw[1][5]=1;raw[1][1]=-1;assert.ok(api.identified(raw,'pregrado',programs).errors.length);
 assert.ok(api.identified([['Programa','Valor'],['Nombre',100]],'pregrado',programs).errors.length);
});
