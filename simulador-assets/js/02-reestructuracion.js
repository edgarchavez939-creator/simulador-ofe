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
  const capital = parseFloat(document.getElementById('refi-capital').value)||0;
  const intCorr = parseFloat(document.getElementById('refi-intcorr').value)||0;
  const mora    = parseFloat(document.getElementById('refi-mora').value)||0;
  const saldo   = capital + intCorr + mora;
  const nNva    = parseInt(document.getElementById('refi-cuotas-nva').value)||0;
  const tmNva   = parseFloat(document.getElementById('refi-tasa-nva').value)/100;
  const costos  = parseFloat(document.getElementById('refi-costos').value)||0;
  const ingreso = parseFloat(document.getElementById('refi-ingreso').value)||0;

  if(!capital||capital<=0) return showFieldError('refi-capital','Ingresa al menos el capital pendiente.');
  if(!nNva||nNva<=0)   return showFieldError('refi-cuotas-nva','Ingresa el plazo de la reestructuración.');
  if(isNaN(tmNva))     return showFieldError('refi-tasa-nva','Ingresa la tasa de reestructuración.');

  const principal = saldo + costos;
  const B = amortizacion(principal, tmNva, nNva);
  const totalB = B.totCap + B.totInt;

  // Store current scenario data on window for "guardar"
  SimuladorOFE.state.restructuring.current = {
    saldo, capital, intCorr, mora, costos, principal,
    n: nNva, tm: tmNva, cuota: B.cuota, totInt: B.totInt, totCap: B.totCap,
    totalGeneral: totalB, rows: B.rows,
    ingreso,
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
      note:'La comparación se construye sobre el saldo registrado y las nuevas condiciones. La aplicación actual no almacena cuota ni plazo vigentes del crédito original.'
    })}
    <div class="restruct-flow" aria-label="Flujo de reestructuración">
      <div class="restruct-step"><span>1 | Saldo actual</span><strong>${cop(saldo)}</strong></div>
      <div class="restruct-step"><span>2 | Nuevas condiciones</span><strong>${nNva} meses | ${(tmNva*100).toFixed(2)}% M.V.</strong></div>
      <div class="restruct-step"><span>3 | Nueva cuota</span><strong>${cop(B.cuota)}</strong></div>
      <div class="restruct-step"><span>4 | Impacto</span><strong>${cop(B.totInt)} en intereses</strong></div>
    </div>
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

    ${ingreso>0 ? (()=>{
      const pct = (B.cuota/ingreso)*100;
      let nivel, color, bg, msg;
      if(pct <= 30) { nivel='Sostenible'; color='var(--success)'; bg='var(--success-soft)';
        msg='La cuota representa el '+pct.toFixed(1)+'% del ingreso mensual. Está dentro del rango recomendado (≤30%), lo que sugiere una carga financiera manejable.'; }
      else if(pct <= 40) { nivel='Ajustada'; color='var(--warning)'; bg='var(--warning-soft)';
        msg='La cuota representa el '+pct.toFixed(1)+'% del ingreso mensual. Está en un rango de atención (30%-40%). Es viable pero deja poco margen ante imprevistos.'; }
      else { nivel='Riesgo de sobreendeudamiento'; color='var(--danger)'; bg='var(--danger-soft)';
        msg='La cuota representa el '+pct.toFixed(1)+'% del ingreso mensual, superando el 40% recomendado. Existe un riesgo elevado de incumplimiento; conviene evaluar un plazo más largo o un saldo menor.'; }
      return `<div class="section__title u-mt-5"> Capacidad de Pago</div>
      <div style="background:${bg};border-left:5px solid ${color};border-radius:0 var(--r-md) var(--r-md) 0;padding:14px 18px;margin-bottom:16px;">
        <div class="u-row-between u-mb-10">
          <div>
            <div class="eyebrow">Cuota vs Ingreso</div>
            <div style="font-size:22px;font-weight:700;color:${color};">${pct.toFixed(1)}%</div>
          </div>
          <div class="u-text-right">
            <div class="u-fs-11-muted">Diagnóstico</div>
            <div style="font-size:15px;font-weight:700;color:${color};">${nivel}</div>
          </div>
        </div>
        <div class="meter-track u-mb-10">
          <div style="height:100%;width:${Math.min(100,pct)}%;background:${color};border-radius:20px;transition:width .4s;"></div>
        </div>
        <div class="text-sm-readable">${msg}</div>
        <div class="text-muted-xs u-mt-8">Cuota ${cop(B.cuota)} sobre ingreso ${cop(ingreso)} | Disponible tras cuota: ${cop(ingreso-B.cuota)}</div>
      </div>`;
    })() : ''}

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
function expPDFRefi() {
  const d=SimuladorOFE.state.restructuring.current;
  if(!d) return toast('Primero calcula un escenario.','warning');
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  const tea=((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'%';
  pdfApprovedOnePageCredit(doc,{
    title:'Reestructuracion de Credito',program:d.label||'Escenario de reestructuracion',programHint:'Escenario simulado',contextLabel:'Saldo actual',contextValue:cop(d.saldo),contextHint:'Base a reestructurar',contextIcon:'money',
    heroLabel:'Nueva cuota mensual estimada',heroValue:cop(d.cuota),heroMeta:`${d.n} cuotas  |  ${(d.tm*100).toFixed(2)}% M.V.  (${tea} E.A.)`,
    note:'Es la cuota mensual estimada despues de aplicar las nuevas condiciones al saldo actual del credito.',
    metrics:[
      {label:'Saldo actual',value:cop(d.saldo),hint:'Antes de reestructurar.',icon:'banknote'},
      {label:'Monto reestructurado',value:cop(d.principal),hint:'Saldo + costos aplicables.',icon:'document'},
      {label:'Total intereses',value:cop(d.totInt),hint:'Costo financiero.',icon:'percent'},
      {label:'Total a pagar',value:cop(d.totalGeneral),hint:'Nuevo escenario.',icon:'trending-up'}
    ],
    leftTitle:'Saldo a la fecha',leftRows:[['Capital pendiente',cop(d.capital)],d.intCorr>0?['Intereses corrientes',cop(d.intCorr)]:null,d.mora>0?['Mora / moratorios',cop(d.mora)]:null,['Saldo total',cop(d.saldo),'total']],
    rightTitle:'Nuevas condiciones',rightRows:[d.costos>0?['Costos de reestructuracion',cop(d.costos)]:null,['Nuevo plazo',`${d.n} meses`],['Nueva tasa M.V.',(d.tm*100).toFixed(2)+'%'],['Nueva cuota',cop(d.cuota),'total']],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,
    conditions:[['Plazo',`${d.n} meses`],['Tasa de interes (M.V.)',(d.tm*100).toFixed(2)+'%'],['Tasa de interes (E.A.)',tea],['Sistema de amortizacion','Cuota fija'],d.ingreso>0?['Cuota / ingreso',((d.cuota/d.ingreso)*100).toFixed(1)+'%']:null,['Periodicidad de pago','Mensual']],
    notes:['El resultado parte del saldo y los conceptos ingresados en este escenario.','La simulacion es informativa y puede cambiar segun las condiciones vigentes.','Verifica la informacion antes de formalizar la reestructuracion.']
  });
  pdfPie(doc);doc.save(safePDF('Reestructuracion de Credito - '+(d.label||'Escenario'))+'.pdf');toast('PDF descargado','success');
}

function expPDFRefiComp() {
  if(reestructState.scenarios.length<2) return toast('Guarda al menos 2 escenarios para comparar.','warning');
  const {jsPDF}=window.jspdf; const doc=new jsPDF({orientation:'landscape'});
  const P=PDF, PW=297, M=14, CW=PW-M*2;
  doc.setFillColor(...P.rojo); doc.rect(M,9,12,1.5,'F');
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(...P.texto2); doc.text('SIMULACION DE CREDITO EDUCATIVO',M,18);
  doc.setFont('helvetica','bold'); doc.setFontSize(20); doc.setTextColor(...P.negro); doc.text('Comparativa de Reestructuracion',M,29);
  doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(...P.texto2); doc.text('Comparacion de escenarios guardados',M,37);
  const meta=pdfGeneratedMeta();
  doc.setFillColor(...P.suave); doc.setDrawColor(...P.linea); doc.roundedRect(PW-78,12,64,24,2.5,2.5,'FD');
  doc.setFontSize(7.2); doc.setTextColor(...P.texto3); doc.text('Fecha',PW-73,20); doc.text('Hora',PW-73,28);
  doc.setFont('helvetica','bold'); doc.setTextColor(...P.texto2); doc.text(meta.fecha,PW-19,20,{align:'right'}); doc.text(meta.hora,PW-19,28,{align:'right'});
  let y=48;
  doc.setFillColor(...P.suave); doc.setDrawColor(...P.linea); doc.roundedRect(M,y,CW,24,2.5,2.5,'FD');
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...P.texto2); doc.text('Saldo base a reestructurar',M+7,y+9);
  doc.setFont('helvetica','bold'); doc.setFontSize(19); doc.setTextColor(...P.negro); doc.text(cop(reestructState.scenarios[0].saldo),M+7,y+19);
  y+=32;
  const n=reestructState.scenarios.length,gap=5,cardW=(CW-gap*(n-1))/n;
  reestructState.scenarios.forEach((e,i)=>{
    const x=M+i*(cardW+gap);
    doc.setFillColor(...P.suave); doc.setDrawColor(...P.linea); doc.roundedRect(x,y,cardW,48,2.5,2.5,'FD');
    doc.setFillColor(...P.rojo); doc.rect(x,y,cardW,2,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(...P.negro); pdfText(doc,'Escenario '+(i+1),x+6,y+10);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.2); doc.setTextColor(...P.texto3); pdfText(doc,e.label||'',x+6,y+16);
    doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(...P.rojoOsc); pdfText(doc,cop(e.cuota),x+6,y+28);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...P.texto2);
    pdfText(doc,`${e.n} meses | ${(e.tm*100).toFixed(2)}% M.V.`,x+6,y+35);
    pdfText(doc,'Total a pagar: '+cop(e.totalGeneral),x+6,y+42);
  });
  y+=59;
  doc.setFillColor(...P.negro); doc.rect(M,y,CW,8,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(255,255,255);
  const conceptW=67,colW=(CW-conceptW)/n;
  doc.text('Concepto',M+4,y+5.2); reestructState.scenarios.forEach((e,i)=>doc.text('Esc. '+(i+1),M+conceptW+(i+.5)*colW,y+5.2,{align:'center'}));
  y+=8;
  const rows=[
    ['Plazo',reestructState.scenarios.map(e=>e.n+' meses')],
    ['Tasa M.V.',reestructState.scenarios.map(e=>(e.tm*100).toFixed(2)+'%')],
    ['Monto reestructurado',reestructState.scenarios.map(e=>cop(e.principal))],
    ['Cuota mensual',reestructState.scenarios.map(e=>cop(e.cuota))],
    ['Total intereses',reestructState.scenarios.map(e=>cop(e.totInt))],
    ['Total a pagar',reestructState.scenarios.map(e=>cop(e.totalGeneral))]
  ];
  rows.forEach((r,idx)=>{
    if(idx%2){doc.setFillColor(...P.suave);doc.rect(M,y,CW,8,'F');}
    doc.setFont('helvetica',idx===rows.length-1?'bold':'normal');doc.setFontSize(8);doc.setTextColor(...P.texto2);pdfText(doc,r[0],M+4,y+5.2);
    r[1].forEach((v,i)=>{doc.setFont('helvetica','bold');pdfText(doc,v,M+conceptW+(i+1)*colW-4,y+5.2,{align:'right'});}); y+=8;
  });
  // Pie landscape
  const h=doc.internal.pageSize.getHeight();
  doc.setDrawColor(...P.linea);doc.line(M,h-14,PW-M,h-14);doc.setFillColor(...P.rojo);doc.rect(M,h-8.5,8,1.2,'F');
  doc.setFont('helvetica','normal');doc.setFontSize(6.8);doc.setTextColor(...P.texto3);doc.text('Simulador de Credito Educativo',M+11,h-7.5);doc.text('Generado el '+meta.fecha+' - '+meta.hora,PW/2,h-7.5,{align:'center'});doc.text('Pag. 1 de 1',PW-M,h-7.5,{align:'right'});
  doc.save('Comparativa Reestructuracion de Credito.pdf');
  toast('PDF comparativo descargado','success');
}

function limpiarRefi() {
  document.getElementById('refi-capital').value = '';
  document.getElementById('refi-intcorr').value = 0;
  document.getElementById('refi-mora').value = 0;
  document.getElementById('refi-saldo-total').textContent = '$ 0';
  document.getElementById('refi-cuotas-nva').value = 24;
  document.getElementById('refi-tasa-nva').value = 1.5;
  document.getElementById('refi-costos').value = 0;
  document.getElementById('refi-ingreso').value = 0;
  calcTaRefi('nva');
  reestructState.scenarios.splice(0, reestructState.scenarios.length);
  SimuladorOFE.state.restructuring.current = null;
  markViewHasResult(5,false);
  renderEscRefi();
  document.getElementById('res-refi').innerHTML = `
    <div class="card empty-state">
      <div class="empty-state__icon">${icon('rotate-ccw')}</div>
      <p class="u-fs-base">Ingresa el saldo a la fecha y los datos de un escenario de reestructuración, luego presiona <strong>Calcular Escenario</strong></p>
    </div>`;
}

function calcTA(id) {
  const tm = parseFloat(document.getElementById('tasa'+id).value)/100;
  if(!isNaN(tm)) document.getElementById('ta'+id).textContent = ((Math.pow(1+tm,12)-1)*100).toFixed(2)+'%';
}
calcTA(1); calcTA(2); calcTA(3);

function setMat(id) {
  const sel = document.getElementById('prog'+id);
  if(!sel || !sel.value) return;
  let data;
  try { data = JSON.parse(sel.value); } catch(e) { return; }
  const {v: valor, idiomas, nivel, semestres, subnivel} = data;
  const progNombre = sel.options[sel.selectedIndex].textContent.replace(/ \(.*\)$/,'');
  // Set matrícula
  document.getElementById('mat'+id).value = valor;
  fmtLbl('mat'+id);
  // Set plazoLP — always look up directly from PROGRAMAS array (most reliable)
  if(id === 2 && nivel === 'pregrado') {
    // First try to get from option value (new format), fall back to PROGRAMAS lookup
    const semFromOption = semestres;
    const semFromArray  = (PROGRAMAS.find(p => p[0] === progNombre) || [])[3];
    const sem = semFromArray || semFromOption || 8;
    const plazoEl = document.getElementById('plazoLP');
    if(plazoEl) {
      plazoEl.value = sem;
      calcPlazoLPAuto();
    }
  }
  if(id < 3) recalcAll(id);
  if(id === 7) { SimuladorOFE.state.results.initialPaymentProgramName = progNombre; recalc7(); }
  // idiomas only for pregrado
  const btnEl = document.getElementById('btn-idiomas-'+id);
  if(btnEl){
    if(nivel==='pregrado' && idiomas > 0){
      btnEl.style.display = 'flex';
      btnEl.dataset.idiomas = idiomas;
      btnEl.dataset.prog = progNombre;
      btnEl.querySelector('.idiomas-val').textContent = cop(idiomas);
    } else {
      btnEl.style.display = 'none';
    }
  }
}



SimuladorOFE.register('reestructuracion', {
  init(app){
    app.services['reestructuracion'] = {
      calcularRefi: typeof calcularRefi === 'function' ? calcularRefi : undefined,
      limpiarRefi: typeof limpiarRefi === 'function' ? limpiarRefi : undefined,
      compararEscRefi: typeof compararEscRefi === 'function' ? compararEscRefi : undefined
    };
  }
});
