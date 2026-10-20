const REFI_SOURCE={capital:'refi-capital',intCorr:'refi-intcorr',mora:'refi-mora',costos:'refi-costos'};
const REFI_MONEY_IDS=[...Object.values(REFI_SOURCE),'refi-ingreso','refi-capacidad','refi-current-payment','refi-current-total',...Object.keys(REFI_SOURCE).flatMap(key=>['refi-paid-'+key,'refi-forgiven-'+key])];
const REFI_FORM_IDS=[...REFI_MONEY_IDS,'refi-cuotas-nva','refi-tasa-nva','refi-cutoff','refi-current-rate','refi-current-term','refi-treatment-note','refi-plazo-mode'];
function refiToday(){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(item=>[item.type,item.value]));return parts.year+'-'+parts.month+'-'+parts.day;}
function initRefiMoney(){for(const id of REFI_MONEY_IDS)window.OFERefiMoney.attach(document.getElementById(id),HTMLInputElement.prototype);}
function refiAmounts(){return Object.fromEntries(Object.entries(REFI_SOURCE).map(([key,id])=>[key,Number(document.getElementById(id)?.value||0)]));}
function refiAllocation(){return window.OFERestructuring.allocate(refiAmounts(),Object.fromEntries(Object.keys(REFI_SOURCE).map(key=>[key,Number(document.getElementById('refi-paid-'+key)?.value||0)])),Object.fromEntries(Object.keys(REFI_SOURCE).map(key=>[key,Number(document.getElementById('refi-forgiven-'+key)?.value||0)])));}
function syncRefiControls(){
 const enabled=!!document.getElementById('refi-compare-enabled')?.checked,panel=document.getElementById('refi-current-fields');if(panel)panel.hidden=!enabled;
 for(const id of ['refi-current-payment','refi-current-rate','refi-current-term','refi-current-total']){const field=document.getElementById(id);if(field)field.disabled=!enabled;}
 const automatic=document.getElementById('refi-plazo-mode')?.value==='capacity',term=document.getElementById('refi-cuotas-nva');if(term){term.readOnly=automatic;term.setAttribute('aria-label',automatic?'Plazo mínimo calculado según capacidad':'Número de cuotas del nuevo escenario');}
 try{const data=refiAllocation();for(const row of data.rows){const gross=document.getElementById('refi-gross-'+row.key),financed=document.getElementById('refi-financed-'+row.key);if(gross)gross.textContent=cop(row.amount);if(financed)financed.textContent=cop(row.financed);}const summary=document.getElementById('refi-treatment-summary');if(summary)summary.textContent='Pago inicial: '+cop(data.initial)+' · Condonación simulada: '+cop(data.forgiven)+' · A financiar: '+cop(data.financed);}
 catch(error){for(const key of Object.keys(REFI_SOURCE)){const field=document.getElementById('refi-financed-'+key);if(field)field.textContent='—';}const summary=document.getElementById('refi-treatment-summary');if(summary)summary.textContent=error.message;}
}
function captureRefiForm(){return {values:Object.fromEntries(REFI_FORM_IDS.map(id=>[id,document.getElementById(id)?.value??''])),compare:!!document.getElementById('refi-compare-enabled')?.checked};}
function restoreRefiForm(data){
 invalidarRefi();REFI_FORM_IDS.forEach(clearFieldError);
 for(const id of REFI_FORM_IDS){const field=document.getElementById(id);if(field)field.value='';}document.getElementById('refi-compare-enabled').checked=false;document.getElementById('refi-plazo-mode').value='manual';document.getElementById('refi-cutoff').value=refiToday();
 const saved=data.refiForm;if(saved){for(const [id,value] of Object.entries(saved.values||{}))if(REFI_FORM_IDS.includes(id))document.getElementById(id).value=value;document.getElementById('refi-compare-enabled').checked=!!saved.compare;}
 else{for(const [id,value] of Object.entries({'refi-capital':data.capital,'refi-intcorr':data.intCorr,'refi-mora':data.mora,'refi-costos':data.costos,'refi-ingreso':data.ingreso,'refi-capacidad':data.capacidad,'refi-cuotas-nva':data.n||24,'refi-tasa-nva':(Number.isFinite(data.tm)?data.tm:.0153)*100}))document.getElementById(id).value=value??'';}
 sumarSaldoRefi();calcTaRefi();syncRefiControls();
}
function sumarSaldoRefi(){const values=refiAmounts(),total=values.capital+values.intCorr+values.mora;document.getElementById('refi-saldo-total').textContent=Number.isFinite(total)?cop(total):'Revisa los importes';syncRefiControls();return total;}
function calcTaRefi(){const tm=Number(document.getElementById('refi-tasa-nva').value)/100;if(Number.isFinite(tm))document.getElementById('refi-ta-nva').textContent=((Math.pow(1+tm,12)-1)*100).toFixed(2)+'%';}
const reestructState=SimuladorOFE.state.restructuring;
function refiDetailsHTML(data){
 const allocation=data.treatment,comparison=data.comparison;let html='';
 if(allocation.initial>0||allocation.forgiven>0){html+='<section class="refi-treatment-result"><h3 class="section__title">Tratamiento de los conceptos</h3><div class="table-wrap"><table class="tbl"><thead><tr><th>Concepto</th><th>Importe</th><th>Pago inicial</th><th>Condonación</th><th>A financiar</th></tr></thead><tbody>'+allocation.rows.map(row=>'<tr><td>'+escHTML(row.label)+'</td><td>'+cop(row.amount)+'</td><td>'+cop(row.paid)+'</td><td>'+cop(row.forgiven)+'</td><td>'+cop(row.financed)+'</td></tr>').join('')+'</tbody></table></div><p class="field__hint refi-allocation-note">'+escHTML(data.treatmentNote||'Sin condonación simulada.')+'</p></section>';}
 if(comparison){const relief=comparison.paymentRelief,delta=comparison.totalDifference;html+='<section class="refi-compare-results"><h3>Comparación desde la misma fecha de corte</h3><p class="field__hint">Corte: '+escHTML(data.cutoff)+'. El total de la propuesta incluye el pago inicial y todas las nuevas cuotas.</p><div class="kpi-grid"><div class="kpi"><span class="kpi__label">Cuota vigente</span><strong class="kpi__value kpi__value--md">'+cop(comparison.current.payment)+'</strong></div><div class="kpi"><span class="kpi__label">'+(relief>=0?'Reducción mensual':'Aumento mensual')+'</span><strong class="kpi__value kpi__value--md">'+cop(Math.abs(relief))+'</strong></div><div class="kpi"><span class="kpi__label">Total pendiente vigente informado</span><strong class="kpi__value kpi__value--md">'+cop(comparison.current.total)+'</strong></div><div class="kpi"><span class="kpi__label">'+(delta<=0?'Reducción del total pendiente':'Aumento del total pendiente')+'</span><strong class="kpi__value kpi__value--md">'+cop(Math.abs(delta))+'</strong></div></div><p>'+Math.abs(comparison.additionalMonths)+' meses '+(comparison.additionalMonths>=0?'adicionales':'menos')+' frente al plazo pendiente. Tasa vigente: '+(comparison.current.rate*100).toLocaleString('es-CO')+'% M.V.</p><p class="field__hint">Una cuota menor puede aumentar el total a pagar. Se comparan importes pendientes declarados, sin volver a sumar pagos anteriores ni intereses ya incluidos en el total vigente.</p></section>';}
 else html+='<p class="field__hint">Cuota vigente y plazo restante: no registrados. No se calcula un ahorro sin esos datos.</p>';
 if(data.termMode==='capacity'&&data.principal>0)html+='<div class="note note--info refi-solver-note">Plazo mínimo calculado: '+data.n+' meses. La cuota no supera la capacidad declarada; un plazo menor sí la superaría. Esta referencia no constituye aprobación de crédito.</div>';
 if(data.principal===0)html+='<div class="note note--info refi-solver-note">No queda monto a financiar. La propuesta se resuelve con el pago inicial y/o la condonación simulada, sin intereses nuevos ni plan de amortización.</div>';
 return html;
}
function calcularRefi(){
 REFI_FORM_IDS.forEach(clearFieldError);
 const mode=document.getElementById('refi-plazo-mode')?.value||'manual';if(!['manual','capacity'].includes(mode))return showFieldError('refi-plazo-mode','Selecciona cómo definir el plazo.');
 const definitions=[['refi-capital','Capital pendiente',false,1e12],['refi-intcorr','Intereses corrientes',false,1e12],['refi-mora','Intereses de mora',false,1e12],['refi-costos','Costos adicionales',false,1e12],['refi-ingreso','Ingreso mensual',false,1e12],['refi-capacidad','Capacidad mensual',false,1e12],['refi-tasa-nva','Tasa mensual',true,100]];
 const values={};
 for(const [id,label,required,max] of definitions){clearFieldError(id);const raw=document.getElementById(id)?.value??'',number=raw===''&&!required?0:Number(raw);if((required&&raw==='')||!Number.isFinite(number)||number<0||number>max)return showFieldError(id,label+': ingresa un valor válido.');values[id]=number;}
 const capital=values['refi-capital'],intCorr=values['refi-intcorr'],mora=values['refi-mora'],costos=values['refi-costos'],saldo=capital+intCorr+mora,ingreso=values['refi-ingreso'],capacidad=values['refi-capacidad'],tmNva=values['refi-tasa-nva']/100;
 if(saldo<=0)return showFieldError('refi-capital','Registra un saldo pendiente mayor que cero.');
 let treatment;try{treatment=refiAllocation();}catch(error){let id=REFI_SOURCE[error.field];for(const key of Object.keys(REFI_SOURCE))if(error.field===key+'-paid'||error.field===key+'-forgiven')id='refi-paid-'+key;return showFieldError(id||'refi-capital',error.message);}
 const treatmentNote=String(document.getElementById('refi-treatment-note')?.value||'').trim();if(treatmentNote.length>300||/[\u0000-\u001F\u007F]/.test(treatmentNote))return showFieldError('refi-treatment-note','Usa una referencia de hasta 300 caracteres en una sola línea.');if(treatment.forgiven>0&&!treatmentNote)return showFieldError('refi-treatment-note','Registra el supuesto o la referencia del acuerdo para la condonación simulada.');
 const principal=treatment.financed;let nNva=Number(document.getElementById('refi-cuotas-nva').value);
 if(principal>0){if(mode==='capacity'){try{nNva=window.OFERestructuring.minimumTerm(principal,tmNva,capacidad,600,cuotaMes).term;}catch(error){return showFieldError(error.field==='rate'?'refi-tasa-nva':'refi-capacidad',error.message);}document.getElementById('refi-cuotas-nva').value=nNva;}else if(!Number.isInteger(nNva)||nNva<1||nNva>600)return showFieldError('refi-cuotas-nva','Plazo: ingresa un valor válido de 1 a 600 meses.');}else nNva=0;
 const B=principal>0?amortizacion(principal,tmNva,nNva):{rows:[],cuota:0,totInt:0,totCap:0};if(![B.cuota,B.totInt,B.totCap].every(Number.isFinite))return showFieldError('refi-tasa-nva','No se obtiene una cuota válida con esta tasa. Revísala o utiliza cero si no se pactaron intereses.');
 const totalB=B.totCap+B.totInt,pagoInicial=treatment.initial,totalGeneral=pagoInicial+totalB,cutoff=document.getElementById('refi-cutoff')?.value||refiToday();if(!window.OFERestructuring.validDate(cutoff))return showFieldError('refi-cutoff','Selecciona una fecha de corte válida.');
 let comparison=null;if(document.getElementById('refi-compare-enabled')?.checked){
  const current={cutoff};for(const [key,id,max,integer] of [['payment','refi-current-payment',1e12,false],['rate','refi-current-rate',100,false],['term','refi-current-term',600,true],['total','refi-current-total',1e15,false]]){const raw=document.getElementById(id).value,number=Number(raw);if(raw===''||!Number.isFinite(number)||number<0||number>max||(integer&&(!Number.isInteger(number)||number<1))||(key!=='rate'&&number<=0))return showFieldError(id,'Completa este dato del crédito vigente con un valor válido.');current[key]=key==='rate'?number/100:number;}
  try{comparison=window.OFERestructuring.compare(current,{payment:B.cuota,term:nNva,total:totalGeneral},saldo);}catch(error){return showFieldError('refi-current-total',error.message);}
 }
 const data={saldo,capital,intCorr,mora,costos,principal,n:nNva,tm:tmNva,cuota:B.cuota,totInt:B.totInt,totCap:B.totCap,totalCredito:totalB,totalGeneral,rows:B.rows,ingreso,capacidad,pagoInicial,treatment,treatmentNote,comparison,cutoff,termMode:mode,refiForm:captureRefiForm(),label:principal>0?nNva+' meses @ '+(tmNva*100).toFixed(2)+'%':'Sin monto a financiar',sub:'Saldo '+cop(saldo)+' · Pago inicial '+cop(pagoInicial)};
 SimuladorOFE.state.restructuring.current=data;
 document.getElementById('res-refi').innerHTML='<div class="card">'+fechaBadgeHtml()+'<div class="card-title">Resultado de la reestructuración</div><p class="refi-cutoff">Saldo con corte al '+escHTML(cutoff)+'</p>'+resultHero({eyebrow:'Reestructuración de Crédito',label:principal>0?'Nueva cuota estimada':'Pago inicial de la propuesta',value:cop(principal>0?B.cuota:pagoInicial),meta:principal>0?nNva+' cuotas | '+(tmNva*100).toFixed(2)+'% M.V.':'Sin nueva financiación',tone:'info',metrics:[{label:'Saldo actual',value:cop(saldo)},{label:'Monto a financiar',value:cop(principal)},{label:'Pago inicial',value:cop(pagoInicial)},{label:'Total pendiente de la propuesta',value:cop(totalGeneral)}],note:'La nueva tasa se aplica únicamente al monto que queda a financiar. Los pagos iniciales y las condonaciones simuladas se muestran por separado.'})+refiDetailsHTML(data)+(capacidad>0?'<div class="note note--'+(B.cuota>capacidad?'warning':'success')+'" role="status">La nueva cuota '+(B.cuota>capacidad?'supera':'está dentro de')+' tu capacidad declarada de '+cop(capacidad)+' por mes. Diferencia: '+cop(Math.abs(capacidad-B.cuota))+'.</div>':'')+'<div class="result-actions"><span class="result-actions__label">Guarda esta propuesta para comparar alternativas.</span><button class="btn btn--primary btn--sm" data-action="guardar-esc-refi">'+icon('save')+' Guardar escenario</button><button class="btn btn--secondary btn--sm" data-action="pdf-refi">'+icon('file-text')+' PDF</button><button class="btn btn--secondary btn--sm" data-action="xls-refi">'+icon('table')+' Excel</button></div><div class="financial-details"><div class="section__title">Nueva financiación</div><div class="kpi-grid"><div class="kpi"><span class="kpi__label">Monto financiado</span><strong class="kpi__value kpi__value--md">'+cop(principal)+'</strong></div><div class="kpi"><span class="kpi__label">Intereses nuevos</span><strong class="kpi__value kpi__value--md">'+cop(B.totInt)+'</strong></div><div class="kpi kpi--accent"><span class="kpi__label">Total de cuotas futuras</span><strong class="kpi__value kpi__value--md">'+cop(totalB)+'</strong></div><div class="kpi kpi--accent"><span class="kpi__label">Total con pago inicial</span><strong class="kpi__value kpi__value--md">'+cop(totalGeneral)+'</strong></div></div>'+(ingreso>0?'<p>La cuota representa '+((B.cuota/ingreso)*100).toFixed(1)+'% del ingreso declarado. Disponible después de la cuota: '+cop(ingreso-B.cuota)+'.</p>':'')+(B.rows.length?'<div class="section__title u-mt-5">Plan de pagos ('+nNva+' cuotas)</div>'+renderTabla(B.rows,B.cuota,B.totInt,B.totCap):'')+'</div></div>';
 markViewHasResult(5,true);renderEscRefi();if(typeof registrarHistorial==='function')setTimeout(()=>registrarHistorial(5),100);toast('Escenario de reestructuración calculado','success');
}

// ── PDF: single refinancing scenario ─────────────────────────────────────────
function expPDFRefi(){
  const d=SimuladorOFE.state.restructuring.current;
  if(!d) return toast('Primero calcula un escenario.','warning');
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  const tea=((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'%';
  pdfPremiumCreditReport(doc,{
    type:'Reestructuracion de Credito',program:d.label||'Escenario de reestructuracion',level:'Escenario simulado',
    heroLabel:'Nueva cuota mensual estimada',heroValue:cop(d.cuota),heroMeta:`${d.n} cuotas | ${(d.tm*100).toFixed(2)}% M.V. | ${tea} E.A.`,
    heroSide:[{label:'Monto reestructurado',value:cop(d.principal)},{label:'Total intereses',value:cop(d.totInt)},{label:'Total a pagar',value:cop(d.totalGeneral),highlight:true}],
    summary:[
      {label:'Saldo actual',value:cop(d.saldo)},
      {label:'Nuevo plazo',value:`${d.n} meses`},
      {label:'Tasa de interes (EA)',value:tea},
      {label:'Costos aplicables',value:cop(d.costos||0)}
    ],
    conditionsLeft:[['Tipo de operacion','Reestructuracion'],['Tasa de interes (EA)',tea],['Nuevo plazo',`${d.n} meses`],['Nueva cuota',cop(d.cuota)]],
    conditionsRight:[['Saldo actual',cop(d.saldo)],['Monto reestructurado',cop(d.principal)],['Total intereses',cop(d.totInt)],['Costos aplicables',cop(d.costos||0)]],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,firstPageRows:5,
    note:'El resultado parte del saldo y de los conceptos ingresados. La simulacion es informativa y puede variar segun las condiciones vigentes.'
  });
  pdfPie(doc);doc.save(safePDF('Reestructuracion de Credito - '+(d.label||'Escenario'))+'.pdf');toast('PDF descargado','success');
}

function expPDFRefiComp(){
  if(reestructState.scenarios.length<2) return toast('Guarda al menos 2 escenarios para comparar.','warning');
  const {jsPDF}=window.jspdf; const doc=new jsPDF({orientation:'landscape'});
  const P=PDF,PW=297,M=14,CW=PW-M*2,meta=pdfGeneratedMeta();
  try{doc.addImage(PDF_UNINORTE_LOGO,'PNG',M,8,52,16,undefined,'FAST');}catch(_e){}
  doc.setFillColor(...P.rojo);doc.rect(246,0,51,23,'F');doc.setFillColor(...P.rojoOsc);doc.triangle(277,0,297,0,297,23,'F');doc.setDrawColor(...P.dorado);doc.setLineWidth(.4);doc.line(225,0,244,18);doc.line(244,18,252,18);doc.setLineWidth(.2);
  doc.setFont('helvetica','normal');doc.setFontSize(12);doc.setTextColor(...P.texto2);pdfText(doc,'Simulacion de Credito Educativo',M,34);
  doc.setFont('times','bold');doc.setFontSize(22);doc.setTextColor(...P.negro);pdfText(doc,'Comparativa de Reestructuracion',M,46);
  doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...P.texto3);pdfText(doc,'Generado el '+meta.fechaLarga+' - '+meta.hora,PW-M,44,{align:'right'});
  doc.setDrawColor(...P.linea);doc.line(M,51,PW-M,51);
  let y=58;
  doc.setFillColor(248,249,250);doc.setDrawColor(...P.linea);doc.roundedRect(M,y,CW,23,2,2,'FD');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(...P.texto2);pdfText(doc,'Saldo base a reestructurar',M+7,y+8);
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(...P.negro);pdfText(doc,cop(reestructState.scenarios[0].saldo),M+7,y+18);
  y+=31;
  const n=reestructState.scenarios.length,gap=5,cardW=(CW-gap*(n-1))/n;
  reestructState.scenarios.forEach((e,i)=>{
    const x=M+i*(cardW+gap);doc.setFillColor(249,249,250);doc.setDrawColor(...P.linea);doc.roundedRect(x,y,cardW,44,2,2,'FD');doc.setFillColor(...P.rojo);doc.rect(x,y,cardW,2,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...P.negro);pdfText(doc,'Escenario '+(i+1),x+6,y+10);
    doc.setFont('helvetica','normal');doc.setFontSize(6.8);doc.setTextColor(...P.texto3);pdfText(doc,e.label||'',x+6,y+16);
    doc.setFont('times','bold');doc.setFontSize(17);doc.setTextColor(...P.rojo);pdfText(doc,cop(e.cuota),x+6,y+28);
    doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...P.texto2);pdfText(doc,`${e.n} meses | ${(e.tm*100).toFixed(2)}% M.V.`,x+6,y+35);pdfText(doc,'Total a pagar: '+cop(e.totalGeneral),x+6,y+41);
  });
  y+=53;
  const headers=['Concepto',...reestructState.scenarios.map((_,i)=>'Escenario '+(i+1))], conceptW=68,colW=(CW-conceptW)/n,rowH=8;
  doc.setFillColor(...P.rojo);doc.rect(M,y,CW,rowH,'F');doc.setFont('helvetica','bold');doc.setFontSize(7.2);doc.setTextColor(255,255,255);pdfText(doc,'Concepto',M+conceptW/2,y+5.2,{align:'center'});
  reestructState.scenarios.forEach((_,i)=>pdfText(doc,'Escenario '+(i+1),M+conceptW+i*colW+colW/2,y+5.2,{align:'center'})); y+=rowH;
  const rows=[['Nueva cuota',e=>cop(e.cuota)],['Nuevo plazo',e=>`${e.n} meses`],['Tasa M.V.',e=>(e.tm*100).toFixed(2)+'%'],['Total intereses',e=>cop(e.totInt)],['Total a pagar',e=>cop(e.totalGeneral)]];
  rows.forEach((r,ri)=>{if(ri%2===0){doc.setFillColor(250,250,251);doc.rect(M,y,CW,rowH,'F');}doc.setDrawColor(...P.linea);doc.line(M,y+rowH,M+CW,y+rowH);doc.setFont('helvetica','normal');doc.setFontSize(7.2);doc.setTextColor(...P.texto2);pdfText(doc,r[0],M+4,y+5.2);reestructState.scenarios.forEach((e,i)=>{doc.setFont('helvetica','bold');doc.setTextColor(...P.negro);pdfText(doc,r[1](e),M+conceptW+(i+1)*colW-4,y+5.2,{align:'right'});});y+=rowH;});
  pdfPie(doc);doc.save('Comparativa Reestructuracion.pdf');toast('PDF comparativo descargado','success');
}

async function limpiarRefi() {
  if(window.OFE_SERVER)try{await window.OFEGlobalSettings?.renew(5);}catch(error){toast(error.message,'error');return;}
  document.getElementById('refi-capital').value = '';
  document.getElementById('refi-intcorr').value = '';
  document.getElementById('refi-mora').value = '';
  document.getElementById('refi-saldo-total').textContent = '$ 0';
  document.getElementById('refi-cuotas-nva').value = 24;
  document.getElementById('refi-tasa-nva').value = 1.53;
  window.OFEGlobalSettings?.applyDefaults(5);
  document.getElementById('refi-costos').value = '';
  document.getElementById('refi-ingreso').value = '';
  document.getElementById('refi-capacidad').value = '';
  REFI_FORM_IDS.forEach(clearFieldError);
  for(const id of REFI_FORM_IDS){if(['refi-cuotas-nva','refi-tasa-nva'].includes(id))continue;const field=document.getElementById(id);if(field)field.value='';}
  document.getElementById('refi-plazo-mode').value='manual';document.getElementById('refi-compare-enabled').checked=false;document.getElementById('refi-cutoff').value=refiToday();syncRefiControls();sumarSaldoRefi();
  calcTaRefi('nva');
  reestructState.scenarios.splice(0, reestructState.scenarios.length);
  SimuladorOFE.state.restructuring.current = null;
  markViewHasResult(5,false);
  renderEscRefi();
  document.getElementById('res-refi').innerHTML = `
    <div class="card empty-state">
      <div class="empty-state__icon">${icon('refresh')}</div>
      <p class="u-fs-base">Ingresa el saldo a la fecha y los datos de un escenario de reestructuración, luego presiona <strong>Calcular Escenario</strong></p>
    </div>`;
}




// Escenarios: reutilizan la comparación común y conservan snapshots independientes.
function guardarEscRefi(replaceOldest=false){
  if(!reestructState.current)return toast('Primero calcula una propuesta.','warning');
  if(reestructState.scenarios.length>=3&&!replaceOldest)return confirmAction({title:'Reemplazar escenario',message:'Ya hay tres alternativas. Se reemplazará la más antigua.',confirmLabel:'Reemplazar',onConfirm:()=>guardarEscRefi(true)});
  if(reestructState.scenarios.length>=3)reestructState.scenarios.shift();
  reestructState.scenarios.push(JSON.parse(JSON.stringify(reestructState.current)));renderEscRefi();renderComparisonHub();toast('Propuesta guardada.','success');
}
function eliminarEscRefi(index){if(!Number.isInteger(index)||index<0||index>=reestructState.scenarios.length)return;reestructState.scenarios.splice(index,1);renderEscRefi();renderComparisonHub();}
function renderEscRefi(){
  const panel=document.getElementById('esc-panel-refi');if(!panel)return;
  panel.hidden=!reestructState.scenarios.length;if(panel.hidden){panel.innerHTML='';return;}
  const mapped=reestructState.scenarios.map(d=>({label:d.label,cuota:d.cuota,totalGeneral:d.totalGeneral,financiado:d.principal,intereses:d.totInt,n:d.n,tm:d.tm,data:d}));
  panel.innerHTML=compareGroupHTML(5,mapped,'Propuestas guardadas','Cada alternativa conserva el saldo y las condiciones con que se calculó.',{export:false})+
    reestructState.scenarios.map((d,index)=>`<button class="btn btn--ghost btn--sm" data-action="eliminar-esc-refi" data-index="${index}">Eliminar propuesta ${index+1}</button>`).join('')+
    (mapped.length>=2?'<button class="btn btn--sm" data-action="pdf-refi-comp">PDF de propuestas</button>':'');
}
function compararEscRefi(){if(reestructState.scenarios.length<2)return toast('Guarda dos propuestas para comparar.','warning');switchTab(8);renderComparisonHub();}
function invalidarRefi(){
  if(!reestructState.current)return;reestructState.current=null;markViewHasResult(5,false);
  document.getElementById('res-refi').innerHTML='<div class="card"><div class="empty"><div class="empty__title">Condiciones modificadas</div><div class="empty__desc">Vuelve a simular para obtener una propuesta con los nuevos datos.</div></div></div>';
}

SimuladorOFE.register('reestructuracion', {
  init(app){
    initRefiMoney();document.getElementById('refi-cutoff').value=refiToday();syncRefiControls();
    document.getElementById('tab5')?.addEventListener('input',event=>{if(event.target.matches?.('input,select,textarea')){invalidarRefi();sumarSaldoRefi();}});
    document.getElementById('tab5')?.addEventListener('change',()=>{invalidarRefi();syncRefiControls();});
    calcTaRefi();
    app.services['reestructuracion'] = {
      calcularRefi: typeof calcularRefi === 'function' ? calcularRefi : undefined,
      limpiarRefi: typeof limpiarRefi === 'function' ? limpiarRefi : undefined,
      compararEscRefi: typeof compararEscRefi === 'function' ? compararEscRefi : undefined
    };
  }
});
