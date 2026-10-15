'use strict';
const {selectorContext}=require('./selector-context.cjs');
async function fixture(){
 const f=selectorContext('ofe'),c=f.context,e=f.elements;await c.SimuladorOFE.init();const p=c.SimuladorOFE.catalog.programs.find(p=>p.nivel==='pregrado');
 for(const tab of [1,2,3,7]){e['prog'+tab].value=p.id;c.setMat(tab);}
 for(const tab of [1,2,3,7])e['tasa'+tab].value=1.25;
 e.plazo1.value=6;e.plazoCP.value=6;e.plazoLP.value=60;e.plazo3.value=12;e.plazo7.value=6;e.cap7.value=1000000;
 c.calcular1();c.calcular2();c.calcular3();c.calcular7();
 e['refi-capital'].value=10000000;e['refi-intcorr'].value=200000;e['refi-mora'].value=50000;e['refi-costos'].value=100000;e['refi-cuotas-nva'].value=24;e['refi-tasa-nva'].value=1.25;e['refi-capacidad'].value=1000000;c.calcularRefi();
 c.SimuladorOFE.state.languages.context={tabId:1,valorIdiomas:1000000,progNombre:p.nombre};e['id-tasa'].value=1.25;e['id-meses'].value=6;e['id-cont-val'].value=0;c.calcularIdiomas();
 return f;
}
module.exports={fixture};
