'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {selectorContext}=require('./test-support/selector-context.cjs');
const finance=require('../shared/finance/restructuring.js'),money=require('../shared/ui/refi-money.js');
const ExcelJS=require('../shared/vendor/exceljs-4.4.0.min.js'),{jsPDF}=require('../shared/vendor/jspdf-4.2.1.umd.min.js');
const read=p=>fs.readFileSync(require.resolve('../'+p));
const identity={regular:read('shared/fonts/PublicSans-Regular.ttf').toString('base64'),bold:read('shared/fonts/PublicSans-Bold.ttf').toString('base64'),logo:new Uint8Array(read('shared/branding/ofe-color.png'))};
const close=(actual,expected,tolerance=1e-6)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} != ${expected}`);
async function setup(){const f=selectorContext('ofe');await f.context.SimuladorOFE.init();const e=f.elements;e['refi-cutoff'].value='2026-10-20';e['refi-capital'].value=10000000.5;e['refi-intcorr'].value=200000.25;e['refi-mora'].value=50000.75;e['refi-costos'].value=100000.5;e['refi-cuotas-nva'].value=24;e['refi-tasa-nva'].value=1.25;return f;}
function treatment(e){e['refi-paid-capital'].value=500000.5;e['refi-paid-intCorr'].value=100000.25;e['refi-forgiven-mora'].value=50000.75;e['refi-paid-costos'].value=50000.5;e['refi-treatment-note'].value='Supuesto de simulación: condonación de mora pendiente de autorización.';}
function current(e){e['refi-compare-enabled'].checked=true;e['refi-current-payment'].value=700000;e['refi-current-rate'].value=1.53;e['refi-current-term'].value=18;e['refi-current-total'].value=12600000;}

test('allocation balances cents per concept; rejects negative, nonfinite, oversized and overallocated amounts',()=>{
 const a=finance.allocate({capital:100.25,intCorr:20.5,mora:5.75,costos:10},{capital:30.15,intCorr:5.5,costos:10},{mora:5.75});
 assert.deepEqual([a.gross,a.initial,a.forgiven,a.financed],[136.5,45.65,5.75,85.1]);
 for(const row of a.rows)close(row.amount,row.paid+row.forgiven+row.financed);
 for(const value of [-1,NaN,Infinity,1e12+1])assert.throws(()=>finance.allocate({capital:value,intCorr:0,mora:0,costos:0}));
 assert.throws(()=>finance.allocate({capital:100,intCorr:0,mora:0,costos:0},{capital:80},{capital:20.01}),{code:'allocation'});
});
test('minimum affordable term is proven against the immediately smaller term, including zero interest and infeasibility',()=>{
 for(const [p,r,c] of [[10000000,.0153,500000],[1000000,0,200000],[1e12,.01,12000000000],[1,0,.5]]){
  const result=finance.minimumTerm(p,r,c);assert.ok(result.payment<=c+1e-7);if(result.term>1)assert.ok(finance.payment(p,r,result.term-1)>c);
 }
 assert.equal(finance.minimumTerm(1000000,0,200000).term,5);
 assert.throws(()=>finance.minimumTerm(1000000,.01,10000),{code:'interest'});
 assert.throws(()=>finance.minimumTerm(1000000,.01,5000),{code:'interest'});
 assert.throws(()=>finance.minimumTerm(1000000,0,1000),{code:'limit'});
 assert.throws(()=>finance.minimumTerm(1000000,.01,0),{code:'capacity'});
 assert.deepEqual(finance.minimumTerm(0,0,1),{term:0,payment:0});
 assert.throws(()=>finance.minimumTerm(1,.01,10,600,()=>NaN),{code:'numeric'});
});
test('manual default retains the legacy schedule and exact cents, and no savings are fabricated without current-loan data',async()=>{
 const {context:c,elements:e}=await setup();c.calcularRefi();const d=c.SimuladorOFE.state.restructuring.current,old=c.amortizacion(10350002,.0125,24);
 assert.equal(d.principal,10350002);assert.equal(JSON.stringify(d.rows),JSON.stringify(old.rows));assert.equal(d.totalGeneral,old.totCap+old.totInt);assert.equal(d.comparison,null);
 assert.match(e['res-refi'].innerHTML,/no registrados/);assert.equal(d.refiForm.values['refi-capital'],'10000000.5');
});
test('initial payments and simulated forgiveness are excluded from new interest, require a reference, and never double count costs',async()=>{
 const {context:c,elements:e}=await setup();treatment(e);let error;c.showFieldError=(id,message)=>error={id,message};e['refi-treatment-note'].value='';c.calcularRefi();assert.equal(error.id,'refi-treatment-note');assert.equal(c.SimuladorOFE.state.restructuring.current,null);
 treatment(e);c.calcularRefi();const d=c.SimuladorOFE.state.restructuring.current;
 assert.equal(d.pagoInicial,650001.25);assert.equal(d.treatment.forgiven,50000.75);assert.equal(d.principal,9650000);
 const expected=c.amortizacion(9650000,.0125,24);assert.equal(d.cuota,expected.cuota);assert.equal(d.totInt,expected.totInt);assert.equal(d.totalGeneral,650001.25+expected.totCap+expected.totInt);
 assert.match(e['res-refi'].innerHTML,/no constituye aprobación|no aprueba|simulada/);
 e['refi-forgiven-capital'].value=10000000;c.invalidarRefi();c.calcularRefi();assert.equal(error.id,'refi-paid-capital');assert.equal(c.SimuladorOFE.state.restructuring.current,null);
});
test('current-loan comparison uses the declared pending total at the same cutoff, separates monthly relief from higher total cost, and validates completeness',async()=>{
 const {context:c,elements:e}=await setup();current(e);e['refi-cuotas-nva'].value=60;c.calcularRefi();const d=c.SimuladorOFE.state.restructuring.current;
 assert.equal(d.comparison.current.cutoff,d.cutoff);assert.equal(d.comparison.current.total,12600000);close(d.comparison.current.rate,.0153);assert.equal(d.comparison.additionalMonths,42);
 close(d.comparison.paymentRelief,700000-d.cuota);close(d.comparison.totalDifference,d.totalGeneral-12600000);assert.ok(d.comparison.paymentRelief>0);assert.ok(d.comparison.totalDifference>0);assert.match(e['res-refi'].innerHTML,/Aumento del total pendiente/);
 let error;c.showFieldError=(id,message)=>error={id,message};for(const id of ['refi-current-payment','refi-current-rate','refi-current-term','refi-current-total']){const value=e[id].value;e[id].value='';c.invalidarRefi();c.calcularRefi();assert.equal(error.id,id);e[id].value=value;}
 e['refi-current-total'].value=1;c.calcularRefi();assert.equal(error.id,'refi-current-total');e['refi-current-total'].value=12600000;e['refi-cutoff'].value='2026-02-30';c.calcularRefi();assert.equal(error.id,'refi-cutoff');
});
test('capacity mode derives the smallest term from the existing payment engine; infeasible cases have no exportable result',async()=>{
 const {context:c,elements:e}=await setup();treatment(e);e['refi-plazo-mode'].value='capacity';e['refi-capacidad'].value=500000;c.syncRefiControls();assert.equal(e['refi-cuotas-nva'].readOnly,true);c.calcularRefi();const d=c.SimuladorOFE.state.restructuring.current;
 assert.ok(d.cuota<=500000);assert.ok(c.cuotaMes(d.principal,d.tm,d.n-1)>500000);assert.equal(Number(e['refi-cuotas-nva'].value),d.n);assert.equal(d.termMode,'capacity');
 let error;c.showFieldError=(id,message)=>error={id,message};for(const capacity of [0,1000,9650000*.0125]){e['refi-capacidad'].value=capacity;c.invalidarRefi();c.calcularRefi();assert.equal(error.id,'refi-capacidad');assert.equal(c.SimuladorOFE.state.restructuring.current,null);}
 e['refi-tasa-nva'].value=0;e['refi-capacidad'].value=2000000;c.calcularRefi();assert.equal(c.SimuladorOFE.state.restructuring.current.n,5);
});
test('full payment or full simulated forgiveness produces no new loan, interest, or amortization',async()=>{
 for(const action of ['paid','forgiven']){const {context:c,elements:e}=await setup();for(const [key,id] of [['capital','capital'],['intCorr','intcorr'],['mora','mora'],['costos','costos']])e[`refi-${action}-${key}`].value=e['refi-'+id].value;e['refi-treatment-note'].value='Supuesto de liquidación completa, sujeto a aprobación.';c.calcularRefi();const d=c.SimuladorOFE.state.restructuring.current;assert.equal(d.principal,0);assert.equal(d.n,0);assert.equal(d.cuota,0);assert.equal(d.totInt,0);assert.equal(d.rows.length,0);assert.equal(d.totalGeneral,action==='paid'?10350002:0);assert.equal(c.OFEReport.normalize(5,d).plans.length,0);}
});
test('saved scenarios and history restore every new control without losing cents or leaking later changes; clear resets them',async()=>{
 const {context:c,elements:e}=await setup();treatment(e);current(e);e['refi-plazo-mode'].value='capacity';e['refi-capacidad'].value=500000;c.calcularRefi();c.guardarEscRefi();c.registrarHistorial(5);const d=c.SimuladorOFE.state.restructuring.scenarios[0],before=JSON.stringify(d),history=c.getHistorial().find(x=>x.tabId===5);
 assert.ok(history);e['refi-capital'].value=1;e['refi-paid-capital'].value=0;e['refi-treatment-note'].value='Otro';e['refi-compare-enabled'].checked=false;c.duplicarHistorial(history.id);
 assert.equal(c.SimuladorOFE.state.restructuring.current,null);assert.equal(e['refi-capital'].value,'10000000.5');assert.equal(e['refi-paid-capital'].value,'500000.5');assert.equal(e['refi-compare-enabled'].checked,true);assert.equal(e['refi-plazo-mode'].value,'capacity');assert.equal(e['refi-cutoff'].value,'2026-10-20');assert.equal(e['refi-treatment-note'].value,d.treatmentNote);assert.equal(JSON.stringify(d),before);
 await c.limpiarRefi();assert.equal(c.SimuladorOFE.state.restructuring.current,null);assert.equal(e['refi-compare-enabled'].checked,false);assert.equal(e['refi-plazo-mode'].value,'manual');assert.equal(e['refi-cuotas-nva'].readOnly,false);assert.equal(e['refi-paid-capital'].value,'');assert.equal(e['refi-current-total'].value,'');assert.equal(e['refi-treatment-note'].value,'');assert.equal(c.SimuladorOFE.state.restructuring.scenarios.length,0);
});
test('money editing groups while typing, preserves the cursor and decimals, parses pastes strictly, and rejects negative text',()=>{
 class Field {constructor(){this.raw='';this.dataset={};this.events={};this.selectionStart=0;}get value(){return this.raw;}set value(v){this.raw=String(v);}setAttribute(){}addEventListener(n,h){(this.events[n]??=[]).push(h);}setSelectionRange(a){this.selectionStart=a;}dispatchEvent(e){for(const h of this.events[e.type]||[])h(e);}}
 const native=Object.getOwnPropertyDescriptor(Field.prototype,'value'),f=new Field();money.attach(f,Field.prototype);
 const display=()=>native.get.call(f),type=(text,caret=text.length)=>{native.set.call(f,text);f.selectionStart=caret;f.dispatchEvent({type:'input'});};
 type('1000');assert.equal(display(),'1.000');assert.equal(f.value,'1000');assert.equal(f.selectionStart,5);
 type('1.2000',3);assert.equal(display(),'12.000');assert.equal(f.selectionStart,2);
 type('1000000,');assert.equal(display(),'1.000.000,');assert.equal(f.value,'1000000');type('1.000.000,50');assert.equal(f.value,'1000000.5');assert.equal(display(),'1.000.000,50');
 f.value='1000000.25';assert.equal(display(),'1.000.000,25');assert.equal(f.value,'1000000.25');
 const paste=text=>f.events.paste[0]({preventDefault(){},clipboardData:{getData:()=>text}});
 paste('$ 2.345.678,90');assert.equal(f.value,'2345678.9');paste('2,345,678.90');assert.equal(f.value,'2345678.9');paste('-1000');assert.equal(display(),'-1000');assert.equal(f.value,'NaN');
 for(const value of ['1,2,3','1.20.300','123.4567','Infinity',''])assert.throws(()=>money.parse(value));
});
test('PDF and serialized Excel preserve the same enhanced snapshot, full schedule and concept allocation without clipping or inventing approval',async()=>{
 const {context:c,elements:e}=await setup();treatment(e);current(e);e['refi-plazo-mode'].value='capacity';e['refi-capacidad'].value=500000;c.calcularRefi();const d=c.SimuladorOFE.state.restructuring.current,report=c.OFEReport.pdf(5),before=JSON.stringify(report),calls=[];
 c.jspdf={jsPDF:function(options){const doc=new jsPDF(options),text=doc.text;doc.text=function(value,x,y,options){calls.push({text:String(value),x,y});return text.call(this,value,x,y,options);};return doc;}};vm.runInContext(read('shared/exports/pdf-report.js').toString(),c);
 const pdf=c.OFEPdf.build([report],identity),texts=calls.map(x=>x.text);assert.ok(pdf.getNumberOfPages()>=2);assert.ok(calls.every(x=>x.x>=34&&x.x<=544&&x.y<818));assert.ok(texts.includes('Condonación'));assert.ok(texts.some(t=>t.includes('no constituye aprobación')));assert.ok(!texts.some(t=>/\bNaN\b|Infinity/.test(t)));assert.equal(calls.filter(x=>/^\d+$/.test(x.text)&&x.x===87).length,d.n);
 const host={ExcelJS,Date,Intl};new Function('window',read('shared/exports/excel-report.js').toString())(host);const book=host.OFEExcel.build(report,identity.logo),opened=new ExcelJS.Workbook();await opened.xlsx.load(await book.xlsx.writeBuffer());const sheet=opened.getWorksheet('Tratamiento del saldo');
 d.treatment.rows.forEach((row,i)=>{for(const [col,value] of [[1,row.label],[2,row.amount],[3,row.paid],[4,row.forgiven],[5,row.financed]])assert.equal(sheet.getCell(i+2,col).value,value);});assert.equal(sheet.getCell('C6').value,d.pagoInicial);assert.equal(sheet.getCell('D6').value,d.treatment.forgiven);assert.equal(sheet.getCell('E6').value,d.principal);assert.equal(opened.getWorksheet('Plan de pagos').rowCount,d.n+5);
 assert.equal(JSON.stringify(report),before);e['refi-paid-capital'].value=0;e['refi-current-total'].value=1;assert.equal(JSON.stringify(c.OFEReport.pdf(5)),before);
});
