// Reutiliza el parser COP estricto; conserva decimales y rechaza negativos.
function initRefiMoney(){
 const descriptor=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
 for(const id of ['refi-capital','refi-intcorr','refi-mora','refi-costos','refi-ingreso','refi-capacidad']){
  const field=document.getElementById(id);if(!field||field.dataset.refiMoney)return;
  field.dataset.refiMoney='1';
  Object.defineProperty(field,'value',{configurable:true,get(){const text=descriptor.get.call(this);if(text==='')return '';try{return String(ProgramCatalogImport.amount(text));}catch(_){return 'NaN';}},set(value){descriptor.set.call(this,String(value??''));}});
  field.addEventListener('blur',()=>{const number=Number(field.value);if(field.value!==''&&Number.isFinite(number))descriptor.set.call(field,new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(number));});
 }
}

// ── REFINANCIACIÓN — cálculo ─────────────────────────────────────────────────
function sumarSaldoRefi() {
  const cap  = parseFloat(document.getElementById('refi-capital').value)||0;
  const intC = parseFloat(document.getElementById('refi-intcorr').value)||0;
  const mora = parseFloat(document.getElementById('refi-mora').value)||0;
  const total = cap + intC + mora;
  document.getElementById('refi-saldo-total').textContent = cop(total);
  return total;
}

function calcTaRefi(which) {
  const tm = parseFloat(document.getElementById('refi-tasa-nva').value)/100;
  if(!isNaN(tm)) document.getElementById('refi-ta-nva').textContent =
    ((Math.pow(1+tm,12)-1)*100).toFixed(2)+'%';
}

// ── Estado de escenarios de reestructuración ──────────────────────
const reestructState = SimuladorOFE.state.restructuring;

function calcularRefi() {
  const definitions=[
    ['refi-capital','Capital pendiente',true,1e12],['refi-intcorr','Intereses corrientes',false,1e12],
    ['refi-mora','Intereses de mora',false,1e12],['refi-costos','Costos adicionales',false,1e12],
    ['refi-ingreso','Ingreso mensual',false,1e12],['refi-capacidad','Capacidad mensual',false,1e12],
    ['refi-cuotas-nva','Plazo',true,600],['refi-tasa-nva','Tasa mensual',true,100]
  ];
  const values={};
  for(const [id,label,required,max] of definitions){
    clearFieldError(id);
    const raw=document.getElementById(id)?.value??'',number=raw===''&&!required?0:Number(raw);
    if((required&&raw==='')||!Number.isFinite(number)||number<0||number>max||
      ((id==='refi-capital'||id==='refi-cuotas-nva')&&number<=0)||
      (id==='refi-cuotas-nva'&&!Number.isInteger(number))) {
      return showFieldError(id,label+': ingresa un valor válido'+(id==='refi-cuotas-nva'?' de 1 a 600 meses.':'.'));
    }
    values[id]=number;
  }
  const capital=values['refi-capital'],intCorr=values['refi-intcorr'],mora=values['refi-mora'];
  const saldo=capital+intCorr+mora,nNva=values['refi-cuotas-nva'],tmNva=values['refi-tasa-nva']/100;
  const costos=values['refi-costos'],ingreso=values['refi-ingreso'],capacidad=values['refi-capacidad'];

  const principal = saldo + costos;
  const B = amortizacion(principal, tmNva, nNva);
  const totalB = B.totCap + B.totInt;

  // Store current scenario data on window for "guardar"
  SimuladorOFE.state.restructuring.current = {
    saldo, capital, intCorr, mora, costos, principal,
    n: nNva, tm: tmNva, cuota: B.cuota, totInt: B.totInt, totCap: B.totCap,
    totalGeneral: totalB, rows: B.rows,
    ingreso, capacidad,
    label: nNva+' meses @ '+(tmNva*100).toFixed(2)+'%',
    sub: 'Saldo '+cop(saldo)+(costos>0?' + costos '+cop(costos):'')
  };

  document.getElementById('res-refi').innerHTML = `
  <div class="card">
    ${fechaBadgeHtml()}
    <div class="card-title">Resultado de la reestructuración</div>
    ${resultHero({
      eyebrow:'Reestructuración de Crédito', label:'Nueva cuota estimada', value:cop(B.cuota),
      meta:`${nNva} cuotas | ${(tmNva*100).toFixed(2)}% M.V.`, tone:'info',
      metrics:[
        {label:'Saldo actual',value:cop(saldo)},
        {label:'Monto reestructurado',value:cop(principal)},
        {label:'Total intereses',value:cop(B.totInt)},
        {label:'Total a pagar',value:cop(totalB)}
      ],
      note:'Los intereses corrientes y de mora ya causados forman parte del saldo. Los costos adicionales se financian junto con ese saldo. La tasa y el plazo indicados se aplican a la nueva propuesta.'
    })}
    <section class="restruct-comparison" aria-label="Saldo actual y nueva propuesta">
      <div class="card"><span class="eyebrow">Situación actual</span><h3>Saldo a la fecha</h3><strong>${cop(saldo)}</strong><p>Capital ${cop(capital)} + intereses causados ${cop(intCorr+mora)}.</p><p class="field__hint">Cuota vigente y plazo restante: no registrados. No se calcula un ahorro sin esos datos.</p></div>
      <div class="card"><span class="eyebrow">Nueva propuesta</span><h3>Monto a reestructurar</h3><strong>${cop(principal)}</strong><p>Saldo ${cop(saldo)} + costos financiados ${cop(costos)}.</p><p class="field__hint">${nNva} cuotas de ${cop(B.cuota)}. Total de intereses nuevos: ${cop(B.totInt)}.</p></div>
    </section>
    ${capacidad>0?`<div class="note note--${B.cuota>capacidad?'warning':'success'}" role="status">${B.cuota>capacidad?'La nueva cuota supera':'La nueva cuota está dentro de'} tu capacidad declarada de ${cop(capacidad)} por mes. Diferencia: ${cop(Math.abs(capacidad-B.cuota))}. Ajusta la propuesta si lo necesitas.</div>`:''}
    <div class="result-actions" aria-label="Acciones del escenario">
      <span class="result-actions__label">Guarda este escenario para compararlo con otra alternativa.</span>
      <button class="btn btn--primary btn--sm" data-action="guardar-esc-refi">${icon('save')} Guardar escenario</button>
      <button class="btn btn--secondary btn--sm" data-action="pdf-refi">${icon('file-text')} PDF</button>
      ${reestructState.scenarios.length>=2?`<button class="btn btn--ghost btn--sm" data-action="comparar-esc-refi">${icon('scale')} Comparar</button>`:''}
    </div>
    <div class="financial-details">
    <div class="section__title u-mt-5 u-mt-0 u-text-info">Saldo a la fecha</div>
    <div class="kpi-grid">
      <div class="kpi"><span class="kpi__label">Capital pendiente</span><div class="kpi__value kpi__value--md">${cop(capital)}</div></div>
      ${intCorr>0?`<div class="kpi"><span class="kpi__label">Intereses corrientes</span><div class="kpi__value kpi__value--md">${cop(intCorr)}</div></div>`:''}
      ${mora>0?`<div class="kpi kpi--warning"><span class="kpi__label">Mora / Moratorios</span><div class="kpi__value kpi__value--md">${cop(mora)}</div></div>`:''}
      <div class="kpi kpi--accent u-col-span-all"><span class="kpi__label">Saldo total a refinanciar</span><div class="kpi__value kpi__value--md">${cop(saldo)}</div></div>
    </div>

    <div class="section__title u-mt-5">Nueva financiación — ${nNva} meses @ ${(tmNva*100).toFixed(2)}%</div>
    <div class="kpi-grid">
      ${costos>0?`<div class="kpi"><span class="kpi__label">Saldo + Costos</span><div class="kpi__value kpi__value--md">${cop(principal)}</div></div>`:''}
      <div class="kpi kpi--success"><span class="kpi__label">Cuota Mensual</span><div class="kpi__value kpi__value--md">${cop(B.cuota)}</div></div>
      <div class="kpi"><span class="kpi__label">Total Intereses</span><div class="kpi__value kpi__value--md">${cop(B.totInt)}</div></div>
      <div class="kpi kpi--accent u-col-span-all"><span class="kpi__label">Total a Pagar</span><div class="kpi__value kpi__value--md">${cop(totalB)}</div></div>
    </div>

    ${ingreso>0 ? `<div class="card"><h3>Cuota e ingreso declarado</h3><p>La nueva cuota representa el <strong>${((B.cuota/ingreso)*100).toFixed(1)}%</strong> del ingreso mensual registrado (${cop(ingreso)}).</p><p>Disponible después de la cuota: <strong>${cop(ingreso-B.cuota)}</strong>.</p><p class="field__hint">Es una comparación informativa; no constituye aprobación de crédito.</p></div>` : ''}

    <div class="section__title u-mt-5">Plan de Pagos (${nNva} cuotas)</div>
    ${renderTabla(B.rows, B.cuota, B.totInt, B.totCap)}

    </div>
  </div>`;

  markViewHasResult(5,true);
  renderEscRefi();
  if(typeof registrarHistorial === 'function') setTimeout(()=>registrarHistorial(5),100);
  toast('Escenario de reestructuración calculado','success');
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

function limpiarRefi() {
  document.getElementById('refi-capital').value = '';
  document.getElementById('refi-intcorr').value = '';
  document.getElementById('refi-mora').value = '';
  document.getElementById('refi-saldo-total').textContent = '$ 0';
  document.getElementById('refi-cuotas-nva').value = 24;
  document.getElementById('refi-tasa-nva').value = 1.53;
  document.getElementById('refi-costos').value = '';
  document.getElementById('refi-ingreso').value = '';
  document.getElementById('refi-capacidad').value = '';
  ['refi-capital','refi-intcorr','refi-mora','refi-costos','refi-ingreso','refi-capacidad','refi-cuotas-nva','refi-tasa-nva'].forEach(clearFieldError);
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
    initRefiMoney();
    document.getElementById('tab5')?.addEventListener('input',event=>{if(event.target.matches?.('input'))invalidarRefi();});
    calcTaRefi();
    app.services['reestructuracion'] = {
      calcularRefi: typeof calcularRefi === 'function' ? calcularRefi : undefined,
      limpiarRefi: typeof limpiarRefi === 'function' ? limpiarRefi : undefined,
      compararEscRefi: typeof compararEscRefi === 'function' ? compararEscRefi : undefined
    };
  }
});
