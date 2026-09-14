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
      meta:`${nNva} cuotas · ${(tmNva*100).toFixed(2)}% M.V.`, tone:'info',
      metrics:[
        {label:'Saldo actual',value:cop(saldo)},
        {label:'Monto reestructurado',value:cop(principal)},
        {label:'Total intereses',value:cop(B.totInt)},
        {label:'Total a pagar',value:cop(totalB)}
      ],
      note:'La comparación se construye sobre el saldo registrado y las nuevas condiciones. La aplicación actual no almacena cuota ni plazo vigentes del crédito original.'
    })}
    <div class="restruct-flow" aria-label="Flujo de reestructuración">
      <div class="restruct-step"><span>1 · Saldo actual</span><strong>${cop(saldo)}</strong></div>
      <div class="restruct-step"><span>2 · Nuevas condiciones</span><strong>${nNva} meses · ${(tmNva*100).toFixed(2)}% M.V.</strong></div>
      <div class="restruct-step"><span>3 · Nueva cuota</span><strong>${cop(B.cuota)}</strong></div>
      <div class="restruct-step"><span>4 · Impacto</span><strong>${cop(B.totInt)} en intereses</strong></div>
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
        <div class="text-muted-xs u-mt-8">Cuota ${cop(B.cuota)} sobre ingreso ${cop(ingreso)} · Disponible tras cuota: ${cop(ingreso-B.cuota)}</div>
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
  const d = SimuladorOFE.state.restructuring.current;
  if(!d) return toast('Primero calcula un escenario.', 'warning');
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  let y = pdfHeader(doc, 'Reestructuracion de Credito', d.label);
  y = pdfCondiciones(doc, y, {
    modalidad: 'Reestructuracion de credito',
    tasa: d.tm,
    plazo: d.n + ' cuotas mensuales',
    extra: d.costos > 0 ? [['Costos de reestructuracion', cop(d.costos)]] : null
  });

  y = addFechaToDoc(doc, y); y+=2;

  y = pdfSectionBar(doc,'SALDO A LA FECHA',y,[0,131,143]);
  const sr = [['Capital pendiente',cop(d.capital)]];
  if(d.intCorr>0) sr.push(['Intereses corrientes',cop(d.intCorr)]);
  if(d.mora>0)    sr.push(['Mora / Moratorios',cop(d.mora)]);
  sr.push(['Saldo total a refinanciar',cop(d.saldo)]);
  sr.forEach(([k,v])=>{ doc.setFont('helvetica','bold'); pdfText(doc,k+':',16,y); doc.setFont('helvetica','normal'); pdfText(doc,v,192,y,{align:'right'}); y+=7; });

  y+=2; y = pdfSectionBar(doc,'NUEVA FINANCIACION',y,[46,125,50]);
  const fr = [
    ['Plazo', d.n+' meses'],
    ['Tasa mensual', (d.tm*100).toFixed(2)+'%'],
    ['Tasa efectiva anual', ((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'%'],
  ];
  if(d.costos>0){ fr.push(['Costos reestructuracion',cop(d.costos)]); fr.push(['Monto financiado (saldo+costos)',cop(d.principal)]); }
  fr.push(['Cuota Mensual',cop(d.cuota)]);
  fr.push(['Total Intereses',cop(d.totInt)]);
  fr.push(['TOTAL A PAGAR',cop(d.totalGeneral)]);
  fr.forEach(([k,v])=>{ doc.setFont('helvetica','bold'); pdfText(doc,k+':',16,y); doc.setFont('helvetica','normal'); pdfText(doc,v,192,y,{align:'right'}); y+=7; });

  // Capacidad de pago
  if(d.ingreso > 0) {
    const pct = (d.cuota/d.ingreso)*100;
    let nivel, rgb;
    if(pct<=30){ nivel='Sostenible'; rgb=[46,125,50]; }
    else if(pct<=40){ nivel='Ajustada'; rgb=[249,168,37]; }
    else { nivel='Riesgo de sobreendeudamiento'; rgb=[198,40,40]; }
    y+=2; y = pdfSectionBar(doc,'CAPACIDAD DE PAGO',y,rgb);
    [['Ingreso mensual',cop(d.ingreso)],
     ['Cuota mensual',cop(d.cuota)],
     ['Cuota / Ingreso',pct.toFixed(1)+'%  ('+nivel+')'],
     ['Disponible tras cuota',cop(d.ingreso-d.cuota)]
    ].forEach(([k,v])=>{ doc.setFont('helvetica','bold'); pdfText(doc,k+':',16,y); doc.setFont('helvetica','normal'); pdfText(doc,v,192,y,{align:'right'}); y+=7; });
    y+=2;
  }

  y+=2; y = pdfSectionBar(doc,'PLAN DE PAGOS ('+d.n+' cuotas)',y);
  const hw=['#','Cuota','Capital','Interes','Saldo'], cw=[14,42,42,40,42];
  doc.setFillColor(26,58,92); doc.setTextColor(255,255,255); doc.rect(14,y-5,180,7,'F');
  let x=14; hw.forEach((h,i)=>{doc.setFont('helvetica','bold');doc.setFontSize(9);pdfText(doc,h,x+1,y);x+=cw[i];});
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal'); doc.setFontSize(9);
  d.rows.forEach(r=>{
    y+=6; if(y>275){doc.addPage();y=20;}
    x=14;
    [r.i,cop(r.cuota),cop(r.capital),cop(r.interes),cop(r.saldo)].forEach((v,i)=>{pdfText(doc,String(v),x+1,y);x+=cw[i];});
  });
  doc.setFontSize(11);

  pdfPie(doc);

  doc.save(safePDF('Reestructuracion de Credito - '+d.label)+'.pdf');
  toast('PDF descargado', 'success');
}

// ── PDF: comparison of scenarios ─────────────────────────────────────────────
function expPDFRefiComp() {
  if(reestructState.scenarios.length < 2) return toast('Guarda al menos 2 escenarios para comparar.', 'warning');
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({orientation:'landscape'});  // horizontal
  const PW = 297;  // landscape width
  const MARGIN = 14, CONTENT_W = PW - MARGIN*2;  // 269

  // Header banner (landscape width)
  doc.setFillColor(26,58,92); doc.rect(0,0,PW,38,'F');
  doc.setTextColor(255,255,255);
  doc.setFont('helvetica','bold'); doc.setFontSize(18);
  pdfText(doc,'Simulador de Credito Educativo',MARGIN,18);
  doc.setFont('helvetica','normal'); doc.setFontSize(11);
  pdfText(doc,'Comparativa de Reestructuracion de Credito - '+reestructState.scenarios.length+' escenarios',MARGIN,28);
  doc.setTextColor(0,0,0);
  let y = 48;
  doc.setFont('helvetica','italic'); doc.setFontSize(9); doc.setTextColor(125,116,106);
  pdfText(doc,'Generado el '+new Date().toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}),MARGIN,y);
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal'); doc.setFontSize(11); y+=8;

  // Saldo base bar
  doc.setFillColor(45,95,110); doc.rect(MARGIN,y-5,CONTENT_W,8,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  pdfText(doc,'SALDO BASE A REFINANCIAR',MARGIN+2,y);
  pdfText(doc,cop(reestructState.scenarios[0].saldo),PW-MARGIN-2,y,{align:'right'});
  doc.setTextColor(0,0,0); doc.setFontSize(11); y+=12;

  // Comparison table — dynamic columns
  doc.setFillColor(26,58,92); doc.rect(MARGIN,y-5,CONTENT_W,8,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  pdfText(doc,'COMPARATIVA DE ESCENARIOS',MARGIN+2,y);
  doc.setTextColor(0,0,0); doc.setFontSize(11); y+=10;

  const n = reestructState.scenarios.length;
  const conceptW = 70;
  const colW = (CONTENT_W - conceptW) / n;  // distribute remaining width evenly
  const colRight = i => MARGIN + conceptW + i*colW + colW - 4;  // right edge of each col

  // Header row with scenario labels
  doc.setFillColor(26,58,92); doc.setTextColor(255,255,255); doc.rect(MARGIN,y-5,CONTENT_W,9,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9);
  pdfText(doc,'Concepto',MARGIN+2,y);
  reestructState.scenarios.forEach((e,i)=>{
    pdfText(doc,'Escenario '+(i+1),colRight(i),y-1,{align:'right'});
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    pdfText(doc,e.label,colRight(i),y+3,{align:'right'});
    doc.setFontSize(9); doc.setFont('helvetica','bold');
  });
  y+=11; doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');

  const rows = [
    ['Plazo', reestructState.scenarios.map(e=>e.n+' meses')],
    ['Tasa mensual', reestructState.scenarios.map(e=>(e.tm*100).toFixed(2)+'%')],
    ['Tasa efectiva anual', reestructState.scenarios.map(e=>((Math.pow(1+e.tm,12)-1)*100).toFixed(2)+'%')],
    ['Costos reestructuracion', reestructState.scenarios.map(e=>cop(e.costos))],
    ['Monto financiado', reestructState.scenarios.map(e=>cop(e.principal))],
    ['Cuota mensual', reestructState.scenarios.map(e=>cop(e.cuota))],
    ['Total intereses', reestructState.scenarios.map(e=>cop(e.totInt))],
    ['TOTAL A PAGAR', reestructState.scenarios.map(e=>cop(e.totalGeneral))],
  ];
  rows.forEach(([label,vals])=>{
    const isTotal = label==='TOTAL A PAGAR';
    if(isTotal){ doc.setFillColor(251,244,233); doc.rect(MARGIN,y-5,CONTENT_W,8,'F'); doc.setFont('helvetica','bold'); }
    else doc.setFont('helvetica','normal');
    doc.setFontSize(9);
    pdfText(doc,label,MARGIN+2,y);
    vals.forEach((v,i)=>{ pdfText(doc,String(v),colRight(i),y,{align:'right'}); });
    y+=8;
  });
  doc.setFontSize(11); y+=6;

  // ── Detailed financial analysis (new page) ──
  const a = analizarEscenariosRefi();
  doc.addPage();
  // Re-draw header banner on page 2
  doc.setFillColor(26,58,92); doc.rect(0,0,PW,30,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(15);
  pdfText(doc,'Analisis Financiero Detallado',MARGIN,18);
  doc.setTextColor(0,0,0); let y2 = 40;

  const halfW2 = (CONTENT_W - 10) / 2;
  // Strip HTML tags from comentario lines
  const strip = s => s.replace(/<[^>]+>/g,'');
  const ce = comentarioEstudiante(a).map(strip);
  const co = comentarioOtorgante(a).map(strip);

  // Helper to render a wrapped text block in a column
  function renderColumn(title, recomend, lines, x, color) {
    let yy = y2;
    doc.setFillColor(...color.bg); doc.rect(x, yy-4, halfW2, 8, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...color.text);
    pdfText(doc, title, x+3, yy+1.5); yy += 11;
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...color.text);
    const recLines = doc.splitTextToSize(recomend, halfW2-6);
    recLines.forEach(l=>{ pdfText(doc, l, x+3, yy); yy+=5; });
    yy += 2;
    doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(58,53,50);
    lines.forEach(line => {
      const wrapped = doc.splitTextToSize(line, halfW2-6);
      wrapped.forEach(l=>{ if(yy>200){doc.addPage();yy=20;} pdfText(doc, l, x+3, yy); yy+=4.6; });
      yy += 2.5;
    });
    doc.setTextColor(0,0,0);
    return yy;
  }

  const yEnd1 = renderColumn(
    'ANALISIS PARA EL ESTUDIANTE',
    'Recomendado: Escenario '+(a.idxMenorCosto+1)+' ('+reestructState.scenarios[a.idxMenorCosto].label+')',
    ce, MARGIN, {bg:[232,245,233], text:[46,125,50]}
  );
  const yEnd2 = renderColumn(
    'ANALISIS PARA EL OTORGANTE',
    'Recomendado: Escenario '+(a.idxMenorPlazo+1)+' ('+reestructState.scenarios[a.idxMenorPlazo].label+')',
    co, MARGIN+halfW2+10, {bg:[224,247,250], text:[0,131,143]}
  );

  // Indicators summary table at bottom
  let yInd = Math.max(yEnd1, yEnd2) + 6;
  if(yInd > 175) { doc.addPage(); yInd = 24; }
  doc.setFillColor(26,58,92); doc.rect(MARGIN,yInd-5,CONTENT_W,8,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  pdfText(doc,'INDICADORES FINANCIEROS POR ESCENARIO',MARGIN+2,yInd);
  doc.setTextColor(0,0,0); yInd += 10;

  const nn = reestructState.scenarios.length, cW = (CONTENT_W-70)/nn;
  const cRight = i => MARGIN+70+i*cW+cW-4;
  doc.setFillColor(26,58,92); doc.setTextColor(255,255,255); doc.rect(MARGIN,yInd-5,CONTENT_W,7,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
  pdfText(doc,'Indicador',MARGIN+2,yInd);
  reestructState.scenarios.forEach((e,i)=>pdfText(doc,'Esc.'+(i+1),cRight(i),yInd,{align:'right'}));
  yInd+=8; doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');

  [
    ['Sobrecosto financiero', a.ind.map(x=>cop(x.sobrecosto))],
    ['Sobrecosto sobre saldo', a.ind.map(x=>x.sobrecostoP.toFixed(1)+'%')],
    ['Costo financiero / mes', a.ind.map(x=>cop(x.costoPorMes))],
    ['Intereses / capital', a.ind.map(x=>x.ratioIntCap.toFixed(1)+'%')],
    ['Carga mensual (cuota)', a.ind.map(x=>cop(x.cuota))],
  ].forEach(([lbl,vals])=>{
    doc.setFontSize(8.5);
    pdfText(doc,lbl,MARGIN+2,yInd);
    vals.forEach((v,i)=>pdfText(doc,String(v),cRight(i),yInd,{align:'right'}));
    yInd+=7;
  });

  pdfPie(doc);
  doc.save('Comparativa Reestructuracion de Credito.pdf');
  toast('PDF descargado', 'success');
}

function guardarEscRefi() {
  if(!SimuladorOFE.state.restructuring.current) return;
  if(reestructState.scenarios.length >= 3) reestructState.scenarios.shift();
  reestructState.scenarios.push(JSON.parse(JSON.stringify(SimuladorOFE.state.restructuring.current)));
  renderEscRefi();
  if(typeof renderComparisonHub==='function') renderComparisonHub();
  toast('Escenario guardado para comparar','success');
}

function eliminarEscRefi(idx) {
  reestructState.scenarios.splice(idx, 1);
  renderEscRefi();
  if(typeof renderComparisonHub==='function') renderComparisonHub();
  toast('Escenario eliminado','success');
}

function renderEscRefi() {
  const panel = document.getElementById('esc-panel-refi');
  if(!panel) return;
  if(reestructState.scenarios.length === 0) { panel.hidden = true; return; }
  panel.hidden = false;
  const colors = ['var(--info)','var(--success)','var(--info)'];
  let html = `<div class="card__head u-mt-5">
    <h3>${icon('clipboard')} Escenarios Guardados (${reestructState.scenarios.length}/3)</h3>
    ${reestructState.scenarios.length >= 2 ? `<button class="btn btn--sm btn--primary" data-action="open-compare" data-tab="5">${icon('scale')} Comparar</button>` : ''}
  </div><div class="list">`;
  reestructState.scenarios.forEach((e,i) => {
    html += `<div class="list-item">
      <div class="step-num step-num--fill" style="background:${colors[i]}">${i+1}</div>
      <div class="list-item__main"><strong>${escHTML(e.label)}</strong><span>${escHTML(e.sub)}</span></div>
      <div class="u-text-right u-mr-8">
        <div style="font-size:13px;font-weight:700;color:${colors[i]};">${cop(e.cuota)}/mes</div>
        <div class="u-fs-11-muted">Total: ${cop(e.totalGeneral)}</div>
      </div>
      <button class="btn btn--ghost btn--icon btn--sm" data-action="eliminar-esc-refi" data-index="${i}" aria-label="Eliminar" title="Eliminar">${icon('x')}</button>
    </div>`;
  });
  html += '</div>';
  panel.innerHTML = html;
}


// ── Motor de análisis financiero de escenarios de reestructuración ─────────────
function analizarEscenariosRefi() {
  const list = reestructState.scenarios;
  if(list.length < 1) return null;

  // Compute per-scenario indicators
  const ind = list.map(e => {
    const sobrecosto = e.totalGeneral - e.saldo;             // costo financiero total (interes+costos)
    const sobrecostoP = e.saldo>0 ? (sobrecosto/e.saldo)*100 : 0;  // % sobre saldo
    const costoPorMes = e.n>0 ? sobrecosto/e.n : 0;          // costo financiero promedio mensual
    const ratioIntCap = e.principal>0 ? (e.totInt/e.principal)*100 : 0;  // intereses como % del capital
    const cargaMensual = e.cuota;                             // cuota = carga mensual
    return {sobrecosto, sobrecostoP, costoPorMes, ratioIntCap, cargaMensual,
            n:e.n, tm:e.tm, totalGeneral:e.totalGeneral, totInt:e.totInt,
            cuota:e.cuota, saldo:e.saldo, label:e.label};
  });

  // Best per criterion
  const idxMenorCosto  = ind.reduce((b,x,i)=> x.totalGeneral < ind[b].totalGeneral ? i : b, 0);
  const idxMenorCuota  = ind.reduce((b,x,i)=> x.cuota < ind[b].cuota ? i : b, 0);
  const idxMenorPlazo  = ind.reduce((b,x,i)=> x.n < ind[b].n ? i : b, 0);
  const idxMayorInt    = ind.reduce((b,x,i)=> x.totInt > ind[b].totInt ? i : b, 0);
  const idxMenorSobreP = ind.reduce((b,x,i)=> x.sobrecostoP < ind[b].sobrecostoP ? i : b, 0);

  // Spreads
  const costos = ind.map(x=>x.totalGeneral);
  const spreadCosto = Math.max(...costos) - Math.min(...costos);
  const cuotas = ind.map(x=>x.cuota);
  const spreadCuota = Math.max(...cuotas) - Math.min(...cuotas);

  return {ind, idxMenorCosto, idxMenorCuota, idxMenorPlazo, idxMayorInt,
          idxMenorSobreP, spreadCosto, spreadCuota};
}

// Genera el texto de análisis para el estudiante
function comentarioEstudiante(a) {
  const best = a.ind[a.idxMenorCosto];
  const lines = [];
  lines.push(`<strong>Escenario ${a.idxMenorCosto+1}</strong> ofrece el menor costo total (${cop(best.totalGeneral)}), con un sobrecosto financiero de <strong>${cop(best.sobrecosto)}</strong> (${best.sobrecostoP.toFixed(1)}% sobre el saldo refinanciado).`);

  // Cuota / carga mensual
  if(a.idxMenorCuota !== a.idxMenorCosto) {
    const bc = a.ind[a.idxMenorCuota];
    lines.push(`Si la prioridad es <strong>aliviar la carga mensual</strong>, el Escenario ${a.idxMenorCuota+1} tiene la cuota más baja (${cop(bc.cuota)}/mes), aunque su costo total es mayor por el plazo más largo. Es un equilibrio entre cuota cómoda y costo acumulado.`);
  } else {
    lines.push(`Este mismo escenario tiene la <strong>cuota más baja</strong> (${cop(best.cuota)}/mes), por lo que combina menor costo y menor carga mensual — la opción más favorable.`);
  }

  // Spread / decisión
  if(a.spreadCosto > 0) {
    lines.push(`La diferencia entre el escenario más caro y el más económico es de <strong>${cop(a.spreadCosto)}</strong>. ${a.spreadCosto > best.saldo*0.05 ? 'Es una diferencia significativa que justifica elegir con cuidado.' : 'La diferencia es moderada, así que la decisión puede priorizar la comodidad de la cuota.'}`);
  }

  // Regla práctica
  lines.push(`<em>Criterio:</em> a menor plazo, menos intereses totales pero mayor cuota; a mayor plazo, cuota más baja pero más intereses acumulados. La elección depende de la capacidad de pago mensual del estudiante.`);
  return lines;
}

// Genera el texto de análisis para el otorgante
function comentarioOtorgante(a) {
  const best = a.ind[a.idxMenorPlazo];
  const lines = [];
  lines.push(`<strong>Escenario ${a.idxMenorPlazo+1}</strong> recupera el saldo en el menor tiempo (${best.n} meses), reduciendo la <strong>exposición al riesgo de impago</strong> y liberando capital antes para nuevas colocaciones.`);

  // Ingreso por intereses
  const bi = a.ind[a.idxMayorInt];
  if(a.idxMayorInt !== a.idxMenorPlazo) {
    lines.push(`El mayor ingreso por intereses lo genera el Escenario ${a.idxMayorInt+1} (${cop(bi.totInt)}), pero a costa de un plazo más largo y mayor exposición temporal. Hay una tensión entre <strong>maximizar ingreso</strong> y <strong>minimizar riesgo</strong>.`);
  } else {
    lines.push(`Además genera el mayor ingreso por intereses (${cop(best.totInt)}), combinando recuperación rápida con buen rendimiento.`);
  }

  // Costo por mes de exposición
  lines.push(`Visto como costo financiero por mes de exposición, el Escenario ${a.idxMenorPlazo+1} concentra el rendimiento en menos tiempo (${cop(a.ind[a.idxMenorPlazo].costoPorMes)}/mes de financiación).`);

  // Criterio
  lines.push(`<em>Criterio:</em> plazos cortos reducen el riesgo de cartera y aceleran la rotación del capital; plazos largos aumentan el ingreso nominal por intereses pero elevan la probabilidad de mora. La política de riesgo de la institución define el balance óptimo.`);
  return lines;
}

function compararEscRefi() {
  if(reestructState.scenarios.length < 2) return;
  const colors = ['var(--info)','var(--success)','var(--info)'];
  const fields = [
    {key:'saldo',        label:'Saldo a refinanciar'},
    {key:'costos',       label:'Costos reestructuración'},
    {key:'principal',    label:'Monto financiado'},
    {key:'n',            label:'Plazo (meses)', isNum:true},
    {key:'tm',           label:'Tasa mensual', isPct:true},
    {key:'cuota',        label:'Cuota mensual'},
    {key:'_capacidad',   label:'Cuota / Ingreso (%)', isCalc:true},
    {key:'totInt',       label:'Total intereses'},
    {key:'_sobrecostoP', label:'Sobrecosto financiero (%)', isCalc:true},
    {key:'_costoPorMes', label:'Costo financiero / mes', isCalc:true},
    {key:'totalGeneral', label:'TOTAL A PAGAR'},
  ];
  // Determine best scenario for each perspective
  // Estudiante: prioriza menor costo total y menor cuota
  const bestEstIdx = reestructState.scenarios.reduce((b,e,i)=> e.totalGeneral < reestructState.scenarios[b].totalGeneral ? i : b, 0);
  const bestCuotaIdx = reestructState.scenarios.reduce((b,e,i)=> e.cuota < reestructState.scenarios[b].cuota ? i : b, 0);
  // Otorgante: prioriza menor plazo (recupera más rápido) y mayor interés (ingreso)
  const bestOtoIdx = reestructState.scenarios.reduce((b,e,i)=>{
    if(e.n < reestructState.scenarios[b].n) return i;
    if(e.n === reestructState.scenarios[b].n && e.totInt > reestructState.scenarios[b].totInt) return i;
    return b;
  }, 0);

  const colE = 'var(--success)', colO = 'var(--info)';
  const _a = analizarEscenariosRefi();
  const _ce = comentarioEstudiante(_a);
  const _co = comentarioOtorgante(_a);

  let html = `<div class="card__head u-mt-5"><h3>${icon('scale')} Comparativa de Escenarios</h3>
    <button class="btn btn--sm btn--primary u-bg-danger" data-action="pdf-refi-comp">${icon('file-text')} PDF Comparativa</button>
  </div>

  <div class="verdict-grid">
    <div class="verdict" style="background:var(--success-soft);border-color:${colE};">
      <div class="verdict__title" style="color:${colE};">${icon('graduation-cap')} Análisis para el Estudiante</div>
      <div class="verdict__head" style="color:${colE};">Recomendado: Escenario ${_a.idxMenorCosto+1} — ${reestructState.scenarios[_a.idxMenorCosto].label}</div>
      <div class="verdict__body">${_ce.map(l=>'<div class="u-mb-6">'+l+'</div>').join('')}</div>
    </div>
    <div class="verdict" style="background:var(--info-soft);border-color:${colO};">
      <div class="verdict__title" style="color:${colO};">${icon('landmark')} Análisis para el Otorgante</div>
      <div class="verdict__head" style="color:${colO};">Recomendado: Escenario ${_a.idxMenorPlazo+1} — ${reestructState.scenarios[_a.idxMenorPlazo].label}</div>
      <div class="verdict__body">${_co.map(l=>'<div class="u-mb-6">'+l+'</div>').join('')}</div>
    </div>
  </div>
  <div class="u-overflow-x"><table class="tbl"><thead><tr>
    <th class="u-text-left">Concepto</th>
    ${reestructState.scenarios.map((e,i)=>`<th class="th--fill" style="background:${colors[i]};">Escenario ${i+1}<br><span class="text-meta-soft">${e.label}</span></th>`).join('')}
  </tr></thead><tbody>`;

  fields.forEach(f => {
    const vals = reestructState.scenarios.map((e,i) => {
      if(f.key==='_sobrecostoP') return _a.ind[i].sobrecostoP;
      if(f.key==='_costoPorMes') return _a.ind[i].costoPorMes;
      if(f.key==='_capacidad') return (e.ingreso>0)?(e.cuota/e.ingreso*100):0;
      return e[f.key]||0;
    });
    const allSame = vals.every(v=>v===vals[0]);
    const minVal = Math.min(...vals), maxVal = Math.max(...vals);
    const flagBest = ['cuota','totInt','totalGeneral','n','_sobrecostoP','_costoPorMes'].includes(f.key);
    const isCalcRow = f.isCalc;
    html += `<tr style="${f.key==='totalGeneral'?'font-weight:700;background:var(--warning-soft);':isCalcRow?'background:var(--surface-2);font-size:12px;':''}"><td style="${isCalcRow?'color:var(--text-3);':''}">${isCalcRow?'↳ '+f.label:f.label}</td>`;
    vals.forEach(v => {
      let disp;
      if(f.isPct) disp = (v*100).toFixed(2)+'%';
      else if(f.isNum) disp = v+' meses';
      else if(f.key==='_sobrecostoP') disp = v.toFixed(1)+'%';
      else if(f.key==='_capacidad') disp = v>0 ? v.toFixed(1)+'%' : '—';
      else disp = cop(v);
      let cls='';
      if(flagBest && !allSame) cls = v===minVal ? 'cmp-best' : (v===maxVal ? 'cmp-worst' : '');
      html += `<td class="${cls}">${disp}</td>`;
    });
    html += '</tr>';
  });

  // Difference vs Esc.1
  html += `<tr><td>Diferencia vs Esc.1</td><td>—</td>
    ${reestructState.scenarios.slice(1).map((e,i)=>{
      const d = e.totalGeneral - reestructState.scenarios[0].totalGeneral;
      const color = d<0?'var(--success)':'var(--danger)';
      return `<td style="color:${color};font-weight:700;">${d<0?'-':'+'}${cop(Math.abs(d))}</td>`;
    }).join('')}
  </tr>`;
  html += '</tbody></table></div>';

  const panel = document.getElementById('esc-panel-refi');
  const oldCmp = panel.querySelector('.cmp-wrap');
  if(oldCmp) oldCmp.remove();
  const wrap = document.createElement('div');
  wrap.className = 'cmp-wrap';
  wrap.innerHTML = html;
  panel.appendChild(wrap);
  wrap.scrollIntoView({behavior:'smooth', block:'nearest'});
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
