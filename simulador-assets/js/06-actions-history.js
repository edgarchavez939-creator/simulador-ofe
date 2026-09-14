// ── Delegación centralizada de acciones de interfaz ───────────────────────────
// Evita lógica onclick embebida y funciona también con controles renderizados dinámicamente.
function handleUIAction(event) {
  const el = event.target.closest('[data-action]');
  if(!el) return;
  const action = el.dataset.action;
  const tab = Number(el.dataset.tab);
  const id = Number(el.dataset.id);
  const index = Number(el.dataset.index);

  switch(action) {
    case 'sidebar-close': return toggleSidebar(false);
    case 'sidebar-open': return toggleSidebar(true);
    case 'theme-toggle': return toggleTheme();
    case 'switch-tab': return switchTab(tab);
    case 'set-nivel': return setNivel(tab, el.dataset.nivel);
    case 'add-benef': return addBenef(tab);
    case 'del-benef': return delBenef(tab, id);
    case 'abrir-idiomas': return abrirIdiomas(tab);
    case 'calcular':
      if(tab===1) return runCalculation(el, 1, () => calcular1(), 'Calculando crédito a corto plazo…');
      if(tab===2) return runCalculation(el, 2, () => calcular2(), 'Calculando escenario corto y largo plazo…');
      if(tab===3) return runCalculation(el, 3, () => calcular3(), 'Calculando crédito con banco aliado…');
      if(tab===7) return runCalculation(el, 7, () => calcular7(), 'Calculando cuota inicial requerida…');
      return;
    case 'limpiar-tab': return tab===7 ? limpiar7() : limpiarTab(tab);
    case 'tipo-eq': return setTipoEq(el.dataset.tipo);
    case 'calcular-refi': return runCalculation(el, 5, () => calcularRefi(), 'Calculando nuevas condiciones…');
    case 'limpiar-refi': return limpiarRefi();
    case 'descargar-plantilla': return runButtonTask(el, () => descargarPlantilla());
    case 'file-proxy': return document.getElementById(el.dataset.target)?.click();
    case 'auto-leer': return runButtonTask(el, () => autoLeerSimulador());
    case 'set-tipo': return setTipo(el.dataset.tipo);
    case 'generar-html': return runButtonTask(el, () => generarHTML());
    case 'guardar-esc-refi': return guardarEscRefi();
    case 'pdf-refi': return runButtonTask(el, () => expPDFRefi());
    case 'comparar-esc-refi': return compararEscRefi();
    case 'eliminar-esc-refi': return eliminarEscRefi(index);
    case 'pdf-refi-comp': return runButtonTask(el, () => expPDFRefiComp());
    case 'pdf':
      if(tab===1) return runButtonTask(el, () => expPDF1());
      if(tab===2) return runButtonTask(el, () => expPDF2());
      if(tab===3) return runButtonTask(el, () => expPDF3());
      if(tab===7) return runButtonTask(el, () => expPDF7());
      return;
    case 'xls':
      if(tab===1) return runButtonTask(el, () => expXLS1());
      if(tab===2) return runButtonTask(el, () => expXLS2());
      if(tab===3) return runButtonTask(el, () => expXLS3());
      if(tab===7) return runButtonTask(el, () => expXLS7());
      return;
    case 'guardar-escenario': return guardarEscenario(tab);
    case 'pdf-idiomas': return runButtonTask(el, () => expPDFIdiomas());
    case 'xls-idiomas': return runButtonTask(el, () => expXLSIdiomas());
    case 'pdf-combinado': return runButtonTask(el, () => expPDFCombinado());
    case 'del-benef-idiomas': return delBenefId(id);
    case 'limpiar-historial': return limpiarHistorial();
    case 'eliminar-historial': return eliminarHistorial(id);
    case 'comparar-escenarios': return compararEscenarios(tab);
    case 'eliminar-escenario': return eliminarEscenario(tab, index);
    case 'xls-comparativa': return runButtonTask(el, () => expXLSComparativa(tab));
    case 'open-compare': return openCompareForTab(tab);
    case 'hist-ver': return verHistorial(id);
    case 'hist-duplicar': return duplicarHistorial(id);
    case 'hist-comparar': return compararHistorial(id);
    case 'detail-close': return cerrarDetalleHistorial();
    case 'scrim-detail': if(event.target===el) return cerrarDetalleHistorial(); return;
    case 'scrim-idiomas': if(event.target===el) return cerrarIdiomas(); return;
    case 'cerrar-idiomas': return cerrarIdiomas();
    case 'add-benef-idiomas': return addBenefId();
    case 'calcular-idiomas': return calcularIdiomas();
    case 'scrim-pin': if(event.target===el) return cancelarRefiPin(); return;
    case 'verificar-pin': return verificarRefiPin();
    case 'cancelar-pin': return cancelarRefiPin();
    case 'scrim-confirm': if(event.target===el) return cancelConfirm(); return;
    case 'confirm-cancel': return cancelConfirm();
    case 'confirm-accept': return acceptConfirm();
  }
}


function handleUIInput(event) {
  clearControlValidationFromEvent(event.target);
  const el = event.target.closest('[data-input-action]');
  if(!el) return;
  const action = el.dataset.inputAction;
  const tab = Number(el.dataset.tab);
  const id = Number(el.dataset.id);
  switch(action) {
    case 'mat-recalc': fmtLbl('mat'+tab); return recalcAll(tab);
    case 'mat7-recalc': fmtLbl('mat7'); return recalc7();
    case 'cap7-recalc': fmtLbl('cap7'); return recalc7();
    case 'contado-pct': return syncContadoFromPct(tab);
    case 'contado-val': return syncContadoFromVal(tab);
    case 'fin-pct-val': return syncFinPctToVal(tab);
    case 'fin-val': return syncFinanciadoFromVal(tab);
    case 'calc-ta': return calcTA(tab);
    case 'split-pct': return syncSplitFromPct(el.dataset.tramo);
    case 'fin-cp': return syncFinanciadoCP();
    case 'fin-lp': return syncFinanciadoLP();
    case 'upd-eq-cp': return updEqCP();
    case 'plazo-lp-auto': return calcPlazoLPAuto();
    case 'convertir-tasas': return convertirTasas();
    case 'sumar-refi': return sumarSaldoRefi();
    case 'ta-refi': return calcTaRefi(el.dataset.tipo);
    case 'recalc7': return recalc7();
    case 'benef-id-field': return updateBenefIdField(id, el.dataset.field, el.value);
    case 'benef-field': return updateBenefField(tab, id, el.dataset.field, el.value);
    case 'contado-id': return syncContadoId(el.dataset.modo);
    case 'recalc-id': return recalcId();
    case 'lp-auto-id': return calcLPAutoId();
    case 'ta-idiomas': return calcTaIdiomas();
  }
}



function calcTa7() {
  const tm = parseFloat(document.getElementById('tasa7')?.value)/100;
  const el = document.getElementById('ta7');
  if(el && !isNaN(tm)) el.textContent = ((Math.pow(1+tm,12)-1)*100).toFixed(2)+'%';
}

function recalc7() {
  calcTa7();
  const mat   = getMat(7);
  const benef = getTotalBeneficios(7);
  const cap   = Math.max(0, parseFloat(document.getElementById('cap7')?.value)||0);
  const n     = parseInt(document.getElementById('plazo7')?.value)||0;
  const tm    = parseFloat(document.getElementById('tasa7')?.value)/100;

  const finMax = (isNaN(tm) || !n || !cap) ? 0 : maxFinanciado(cap, tm, n);
  const neto   = Math.max(0, mat - benef);
  const fin    = Math.min(finMax, neto);
  const gar    = fin * GARANTISA_CP;

  const gEl = document.getElementById('gar7-val');
  if(gEl) gEl.textContent = fin > 0
    ? cop(gar) + ' sobre ' + cop(fin) + ' financiado'
    : '—';
  return {mat, benef, neto, cap, n, tm, finMax, fin, gar};
}

function calcular7() {
  const d = recalc7();
  if(!(d.mat > 0))  return showAlert(7, 'Ingresa el valor de la matrícula.');
  if(d.benef > d.mat) return showAlert(7, 'Las becas superan el valor de la matrícula.');
  if(!(d.cap > 0))  return showAlert(7, 'Ingresa la capacidad de pago mensual.');
  if(!(d.n > 0))    return showAlert(7, 'Ingresa el número de cuotas.');
  if(isNaN(d.tm))   return showAlert(7, 'Ingresa la tasa de interés.');

  const cuotaInicial = Math.max(0, d.neto - d.fin);
  const desembolso   = cuotaInicial + d.gar;
  const A            = amortizacion(d.fin, d.tm, d.n);
  const totalCredito = A.totCap + A.totInt;
  const costoTotal   = desembolso + totalCredito;
  const pctInicial   = d.mat > 0 ? (cuotaInicial / d.mat) * 100 : 0;
  const pctFin       = d.mat > 0 ? (d.fin / d.mat) * 100 : 0;
  const pctBenef     = d.mat > 0 ? (d.benef / d.mat) * 100 : 0;
  // ¿La capacidad alcanza para financiar todo el saldo?
  const cubreTodo    = d.finMax >= d.neto - 1;
  const holgura      = cubreTodo ? d.finMax - d.neto : 0;

  const benefRows = SimuladorOFE.state.financing.benefits[7].filter(b => (b.val||0) > 0);

  SimuladorOFE.state.results.initialPayment = {...d, cuotaInicial, desembolso, totalCredito, costoTotal,
    cuota: A.cuota, totInt: A.totInt, totCap: A.totCap, rows: A.rows,
    progNombre: SimuladorOFE.state.results.initialPaymentProgramName, pct: Math.round(pctFin*10)/10,
    beneficios: benefRows.map(b=>({nombre:b.nombre||'Descuento', val:b.val||0, pct:b.pct||0})),
    benefTotal: d.benef, matNeta: d.neto};

  document.getElementById('res7').innerHTML = `
  <div class="card">
    ${fechaBadgeHtml()}
    <div class="card__title">Resultado del cálculo</div>
    ${resultHero({
      eyebrow:'Cálculo de Cuota Inicial',
      label:'Cuota inicial requerida', value:cop(cuotaInicial),
      meta:`Capacidad mensual ${cop(d.cap)} · ${d.n} cuotas · ${(d.tm*100).toFixed(2)}% M.V.`, tone:cubreTodo?'success':'info',
      metrics:[
        {label:'Monto financiable',value:cop(d.fin)},
        {label:'Cuota mensual',value:cop(A.cuota)},
        {label:'Total intereses',value:cop(A.totInt)},
        {label:'Total al desembolso',value:cop(desembolso)}
      ],
      note:cubreTodo?'La capacidad de pago permite financiar todo el saldo neto de matrícula.':'La cuota inicial cubre la diferencia entre la matrícula neta y el monto financiable con la capacidad declarada.'
    })}
    ${resultActions(7,{canCompare:false,primaryLabel:'Ver en Mis simulaciones',primaryAction:'switch-tab',primaryTab:9})}
    <div class="financial-details">

    ${cubreTodo ? `
      <div class="note note--success u-mb-4">
        <span class="note__icon">${icon('check-circle')}</span>
        <div>Con esa capacidad de pago <strong>no se requiere cuota inicial</strong>: el crédito cubre la totalidad del saldo.
        ${holgura > 0 ? `Incluso queda un margen de <strong>${cop(holgura)}</strong> de capacidad no utilizada.` : ''}</div>
      </div>` : ''}

    <div class="kpi-grid u-mb-4">
      <div class="kpi kpi--accent">
        <div class="kpi__label">Cuota inicial a cubrir</div>
        <div class="kpi__value">${cop(cuotaInicial)}</div>
        <div class="kpi__foot">${pctInicial.toFixed(1)}% de la matrícula</div>
      </div>
      <div class="kpi kpi--warning">
        <div class="kpi__label">Aporte Garantisa (4.17%)</div>
        <div class="kpi__value kpi__value--md">${cop(d.gar)}</div>
        <div class="kpi__foot">Sobre el monto financiado</div>
      </div>
      <div class="kpi kpi--info u-col-span-all">
        <div class="kpi__label">Total a pagar al momento del desembolso</div>
        <div class="kpi__value">${cop(desembolso)}</div>
        <div class="kpi__foot">Cuota inicial + Garantisa</div>
      </div>
    </div>

    <div class="section__title">${icon('percent')} Cómo se compone la matrícula</div>
    <div class="dist u-mb-4">${distribucionHTML(pctBenef, pctInicial, pctFin, 0)}</div>

    <div class="section__title">${icon('credit-card')} Crédito resultante</div>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi__label">Monto financiado</div><div class="kpi__value kpi__value--md">${cop(d.fin)}</div></div>
      <div class="kpi kpi--success"><div class="kpi__label">Cuota mensual</div><div class="kpi__value kpi__value--md">${cop(A.cuota)}</div><div class="kpi__foot">Capacidad: ${cop(d.cap)}</div></div>
      <div class="kpi"><div class="kpi__label">Total intereses</div><div class="kpi__value kpi__value--md">${cop(A.totInt)}</div></div>
      <div class="kpi"><div class="kpi__label">Número de cuotas</div><div class="kpi__value kpi__value--md">${d.n}</div></div>
    </div>

    <div class="total-banner">
      <div><div class="tl">Desembolso inicial</div><div class="tv">${cop(desembolso)}</div><div class="ts">Cuota inicial + Garantisa</div></div>
      <div class="total-banner__op" aria-hidden="true">+</div>
      <div><div class="tl">Total crédito</div><div class="tv">${cop(totalCredito)}</div><div class="ts">${d.n} cuotas de ${cop(A.cuota)}</div></div>
      <div class="total-banner__op" aria-hidden="true">=</div>
      <div class="u-text-right"><div class="tl">Costo total matrícula</div><div class="tv">${cop(costoTotal)}</div><div class="ts">Todo incluido</div></div>
    </div>

    ${benefRows.length ? `
      <div class="section__title">${icon('gift')} Becas y descuentos aplicados</div>
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th>Concepto</th><th>Valor</th><th>% matrícula</th></tr></thead>
        <tbody>${benefRows.map(b=>`<tr><td>${escHTML(b.nombre||'Descuento')}</td><td class="u-success">${cop(b.val)}</td><td>${(b.pct||0).toFixed(1)}%</td></tr>`).join('')}</tbody>
        <tfoot><tr><td>TOTAL</td><td>${cop(d.benef)}</td><td>${pctBenef.toFixed(1)}%</td></tr></tfoot>
      </table></div>` : ''}

    <div class="section__title">${icon('table')} Plan de pagos (${d.n} cuotas)</div>
    ${renderTabla(A.rows, A.cuota, A.totInt, A.totCap)}

    </div>
  </div>`;

  markViewHasResult(7,true);
  toast('Cuota inicial calculada', 'success');
  setTimeout(()=>registrarHistorial(7), 100);
}

function limpiar7() {
  ['mat7','cap7'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
  ['mat7-lbl','cap7-lbl'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=''; });
  document.getElementById('plazo7').value = 6;
  document.getElementById('tasa7').value  = 1.5;
  document.getElementById('prog7').value  = '';
  SimuladorOFE.state.financing.benefits[7] = [];
  renderBeneficios(7);
  SimuladorOFE.state.results.initialPayment = null;
  markViewHasResult(7,false);
  document.getElementById('res7').innerHTML = '<div class="card"><div class="empty">'
    + '<div class="empty__icon">' + icon('wallet','icon-xl') + '</div>'
    + '<div class="empty__title">Sin resultados todavía</div>'
    + '<div class="empty__desc">Ingresa la capacidad de pago mensual, el plazo y la tasa, luego presiona <strong>Calcular Cuota Inicial</strong>.</div>'
    + '</div></div>';
  recalc7();
}

// ── Exportables ──
function expPDF7() {
  const d = SimuladorOFE.state.results.initialPayment;
  if(!d) return toast('Primero realiza el calculo', 'warning');
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  let y = pdfHeader(doc, 'Cálculo de Cuota Inicial', (d.progNombre||'') + ' - capacidad de ' + cop(d.cap) + ' al mes');

  y = pdfCondiciones(doc, y, {
    modalidad: 'Credito a corto plazo',
    tasa: d.tm,
    plazo: d.n + ' cuotas mensuales',
    garantisa: 'Aporte del 4.17% sobre el monto financiado (3.5% + IVA)'
  });

  y = pdfBenefSection(doc, y, d.mat, d.beneficios||[], d.benefTotal||0, d.matNeta||d.mat, d.cuotaInicial);

  y = pdfSectionBar(doc, 'CAPACIDAD DE PAGO DECLARADA', y, PDF.violeta);
  y = pdfKV(doc, y, [
    ['Capacidad de pago mensual', cop(d.cap)],
    ['Monto financiable con esa capacidad', cop(d.fin)],
  ]);

  y = pdfSectionBar(doc, 'RESULTADO - LO QUE DEBE CUBRIR HOY', y, PDF.ambar);
  y = pdfKV(doc, y, [
    ['Cuota inicial requerida', cop(d.cuotaInicial)],
    ['Aporte Garantisa', cop(d.gar)],
    ['Total a pagar hoy', cop(d.desembolso), 'total'],
  ], {tintaTotal: PDF.ambarS, colorTotal: PDF.ambar});

  y = pdfSectionBar(doc, 'CREDITO RESULTANTE', y);
  y = pdfKV(doc, y, [
    ['Monto financiado', cop(d.fin)],
    ['Numero de cuotas', d.n + ' meses'],
    ['Valor de la cuota mensual', cop(d.cuota)],
    ['Total intereses', cop(d.totInt)],
    ['Total del credito', cop(d.totalCredito), 'total'],
  ]);

  y = pdfSectionBar(doc, 'COSTO TOTAL DE LA MATRICULA', y, PDF.verde);
  y = pdfKV(doc, y, [['Costo total *', cop(d.costoTotal), 'total']],
    {tintaTotal: PDF.verdeS, colorTotal: PDF.verde});
  y = pdfCostoFootnote(doc, y);

  if(y > 205) { doc.addPage(); y = 22; }
  y = pdfTablaAmort(doc, y, d.rows, d.totCap, d.totInt, 'PLAN DE PAGOS (' + d.n + ' CUOTAS)');

  pdfPie(doc);
  doc.save(safePDF('Calculo Cuota Inicial - ' + (d.progNombre||'Simulacion')) + '.pdf');
  toast('PDF descargado', 'success');
}

function expXLS7() {
  const d = SimuladorOFE.state.results.initialPayment;
  if(!d) return toast('Primero realiza el cálculo', 'warning');
  const benefRows = (d.beneficios||[]).filter(b=>b.val>0).map(b=>['  - '+(b.nombre||'Descuento')+' ('+(b.pct||0).toFixed(1)+'%)', -Math.round(b.val)]);
  const ws = XLSX.utils.aoa_to_sheet([
    ['Cálculo de Cuota Inicial'], [''],
    ['Programa', d.progNombre||''],
    ['Valor matrícula', Math.round(d.mat)],
    ...(benefRows.length ? [['--- BECAS Y DESCUENTOS ---'], ...benefRows,
        ['Total descuentos', -Math.round(d.benefTotal||0)], ['Matrícula neta', Math.round(d.matNeta)], ['']] : [['']]),
    ['--- CAPACIDAD DE PAGO ---'],
    ['Capacidad mensual', Math.round(d.cap)],
    ['Número de cuotas', d.n],
    ['Tasa mensual (%)', +(d.tm*100).toFixed(2)],
    ['Tasa efectiva anual (%)', +((Math.pow(1+d.tm,12)-1)*100).toFixed(2)], [''],
    ['--- RESULTADO ---'],
    ['Monto financiable', Math.round(d.fin)],
    ['CUOTA INICIAL A CUBRIR', Math.round(d.cuotaInicial)],
    ['Aporte Garantisa (4.17%)', Math.round(d.gar)],
    ['Total al desembolso', Math.round(d.desembolso)],
    ['Cuota mensual', Math.round(d.cuota)],
    ['Total intereses', Math.round(d.totInt)],
    ['COSTO TOTAL MATRÍCULA', Math.round(d.costoTotal)], [''],
    ['Cuota','Cuota Mensual','Capital','Interés','Saldo'],
    ...d.rows.map(r=>[r.i,Math.round(r.cuota),Math.round(r.capital),Math.round(r.interes),Math.round(r.saldo)])
  ]);
  ws['!cols'] = [{wch:38},{wch:18},{wch:16},{wch:16},{wch:16}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cuota Inicial');
  XLSX.writeFile(wb, 'Cuota Inicial - ' + (d.progNombre||'Simulacion') + '.xlsx');
  toast('Excel descargado', 'success');
}

function limpiarTab(tabId, confirmed = false) {
  if(!confirmed) return confirmAction({
    title:'Iniciar una nueva simulación',
    message:'Se limpiarán los campos, resultados y escenarios guardados de esta modalidad.',
    confirmLabel:'Limpiar simulación',
    tone:'danger',
    onConfirm:()=>limpiarTab(tabId, true)
  });
  // Reset nivel
  setNivel(tabId, 'pregrado');
  // Reset selects
  const prog = document.getElementById('prog'+tabId);
  if(prog) prog.value = '';
  const sn = document.getElementById('subnivel'+tabId);
  if(sn) sn.value = '';
  // Reset mat
  const mat = document.getElementById('mat'+tabId);
  if(mat){ mat.value=''; fmtLbl('mat'+tabId); }
  // Reset common fields
  const fields = {
    1: [['cont1-pct','0'],['cont1-val',''],['plazo1','6'],['tasa1','1.5']],
    2: [['cont2-pct','0'],['cont2-val',''],['pctCP','40'],['finvalCP',''],['pctLP','60'],['finvalLP',''],['plazoCP','6'],['plazoLP','9'],['tasa2','1.5']],
    3: [['cont3-pct','0'],['cont3-val',''],['plazo3','12'],['tasa3','1.5'],['cargos3','0']]
  };
  (fields[tabId]||[]).forEach(([id,val]) => {
    const el = document.getElementById(id);
    if(el) el.value = val;
  });
  calcTA(tabId);
  // Clear results
  const resPlaceholders = {
    1: '<div class="card"><div class="empty"><div class="empty__icon">' + icon('bar-chart','icon-xl') + '</div><div class="empty__title">Sin resultados todavía</div><div class="empty__desc">Completa los datos del crédito y presiona <strong>Calcular Crédito</strong> para ver la simulación.</div></div></div>',
    2: '<div class="card"><div class="empty"><div class="empty__icon">' + icon('git-branch','icon-xl') + '</div><div class="empty__title">Sin resultados todavía</div><div class="empty__desc">Completa los datos del crédito y presiona <strong>Calcular Crédito Mixto</strong> para ver la simulación.</div></div></div>',
    3: '<div class="card"><div class="empty"><div class="empty__icon">' + icon('building','icon-xl') + '</div><div class="empty__title">Sin resultados todavía</div><div class="empty__desc">Completa los datos del crédito y presiona <strong>Calcular Crédito</strong> para ver la simulación.</div></div></div>'
  };

  document.getElementById('res'+tabId).innerHTML = resPlaceholders[tabId];
  // Hide idiomas btn
  const ib = document.getElementById('btn-idiomas-'+tabId);
  if(ib) ib.style.display='none';
  // Reset data objects
  if(tabId===1) SimuladorOFE.state.results.shortTerm=null;
  if(tabId===2) SimuladorOFE.state.results.mixed=null;
  if(tabId===3) SimuladorOFE.state.results.bank=null;
  markViewHasResult(tabId,false);
  // Clear beneficios
  SimuladorOFE.state.financing.benefits[tabId] = [];
  renderBeneficios(tabId);
  recalcAll(tabId);
  // Clear saved scenarios for this tab
  SimuladorOFE.state.comparison.scenarios[tabId] = [];
  const escPanel = document.getElementById('esc-panel-'+tabId);
  if(escPanel){ escPanel.innerHTML=''; escPanel.style.display='none'; }
  // Reset aportes info
  if(tabId<=2) recalcAll(tabId);
}

// ── ESCENARIOS ENGINE ─────────────────────────────────────────────────────────
const comparisonState = SimuladorOFE.state.comparison;
const historyState = SimuladorOFE.state.history;


// ── HISTORIAL DE SIMULACIONES (localStorage) ─────────────────────────────────
const _HIST_KEY = historyState.key;
const _HIST_MAX = historyState.max;

function getHistorial() {
  try { return JSON.parse(localStorage.getItem(_HIST_KEY)) || []; }
  catch(e) { return []; }
}
function saveHistorial(list) {
  try { localStorage.setItem(_HIST_KEY, JSON.stringify(list.slice(0, _HIST_MAX))); }
  catch(e) { /* storage full or disabled */ }
}

function registrarHistorial(tabId) {
  let entry = null;
  const fecha = new Date().toLocaleString('es-CO',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const tabNames = {1:'Corto Plazo', 2:'Mixto CP/LP', 3:'Banco Aliado', 5:'Reestructuración', 7:'Cuota Inicial'};

  if(tabId===1 && SimuladorOFE.state.results.shortTerm) {
    entry = {tabId, fecha, prog:SimuladorOFE.state.results.shortTerm.progNombre||'Programa', tipo:tabNames[1],
      resumen:SimuladorOFE.state.results.shortTerm.pct+'% · '+SimuladorOFE.state.results.shortTerm.n+' meses · '+(SimuladorOFE.state.results.shortTerm.tm*100).toFixed(2)+'%',
      cuota:SimuladorOFE.state.results.shortTerm.cuota, total:SimuladorOFE.state.results.shortTerm.totalGeneral,
      snap:JSON.parse(JSON.stringify(SimuladorOFE.state.results.shortTerm))};
  } else if(tabId===2 && SimuladorOFE.state.results.mixed) {
    const totCred = (SimuladorOFE.state.results.mixed.CP?(SimuladorOFE.state.results.mixed.CP.totCap+SimuladorOFE.state.results.mixed.CP.totInt):0)+(SimuladorOFE.state.results.mixed.LP?(SimuladorOFE.state.results.mixed.LP.noAmortize?SimuladorOFE.state.results.mixed.LP.capital:(SimuladorOFE.state.results.mixed.LP.totCap+SimuladorOFE.state.results.mixed.LP.totInt)):0);
    entry = {tabId, fecha, prog:SimuladorOFE.state.results.mixed.progNombre||'Programa', tipo:tabNames[2],
      resumen:'CP'+SimuladorOFE.state.results.mixed.pCP+'% LP'+SimuladorOFE.state.results.mixed.pLP+'% · '+(SimuladorOFE.state.results.mixed.tm*100).toFixed(2)+'%',
      cuota:(SimuladorOFE.state.results.mixed.CP?SimuladorOFE.state.results.mixed.CP.cuota:0), total:SimuladorOFE.state.results.mixed.pagoInicial+totCred,
      snap:JSON.parse(JSON.stringify(SimuladorOFE.state.results.mixed))};
  } else if(tabId===3 && SimuladorOFE.state.results.bank) {
    entry = {tabId, fecha, prog:SimuladorOFE.state.results.bank.progNombre||'Programa', tipo:tabNames[3],
      resumen:SimuladorOFE.state.results.bank.pct+'% · '+SimuladorOFE.state.results.bank.n+' meses · '+(SimuladorOFE.state.results.bank.tm*100).toFixed(2)+'%',
      cuota:SimuladorOFE.state.results.bank.cuota, total:SimuladorOFE.state.results.bank.totalGeneral,
      snap:JSON.parse(JSON.stringify(SimuladorOFE.state.results.bank))};
  } else if(tabId===5 && SimuladorOFE.state.restructuring.current) {
    const d = SimuladorOFE.state.restructuring.current;
    entry = {tabId, fecha, prog:'Crédito reestructurado', tipo:tabNames[5],
      resumen:d.n+' meses · '+(d.tm*100).toFixed(2)+'% · saldo '+cop(d.saldo),
      cuota:d.cuota, total:d.totalGeneral, snap:JSON.parse(JSON.stringify(d))};
  } else if(tabId===7 && SimuladorOFE.state.results.initialPayment) {
    const d = SimuladorOFE.state.results.initialPayment;
    entry = {tabId, fecha, prog:d.progNombre||'Programa', tipo:tabNames[7],
      resumen:'capacidad '+cop(d.cap)+'/mes · '+d.n+' cuotas · '+(d.tm*100).toFixed(2)+'%',
      cuota:d.cuota, total:d.costoTotal, snap:JSON.parse(JSON.stringify(d))};
  }
  if(!entry) return;
  entry.id = Date.now();
  const list = getHistorial();
  list.unshift(entry);
  saveHistorial(list);
  renderHistorial();
}

function eliminarHistorial(id) {
  saveHistorial(getHistorial().filter(e=>e.id!==id));
  renderHistorial();
}

function limpiarHistorial(confirmed = false) {
  if(!confirmed) return confirmAction({
    title:'Borrar historial',
    message:'Se eliminarán todas las simulaciones guardadas en este navegador. Esta acción no se puede deshacer.',
    confirmLabel:'Borrar historial',
    tone:'danger',
    onConfirm:()=>limpiarHistorial(true)
  });
  localStorage.removeItem(_HIST_KEY);
  renderHistorial();
  toast('Historial eliminado', 'success');
}

function historyRecordMeta(entry) {
  const d = entry?.snap || {};
  const financiado = entry.tabId===2 ? (d.finCP||0)+(d.finLP||0)
    : entry.tabId===5 ? (d.principal||d.saldo||0)
    : (d.financiado ?? d.fin ?? 0);
  const plazo = entry.tabId===2 ? `${d.nCP||0}m CP · ${d.nLP||0}m LP` : `${d.n||0} meses`;
  return {financiado, plazo};
}

function renderHistorial() {
  const panel = document.getElementById('historial-panel');
  if(!panel) return;
  const list = getHistorial();
  if(list.length === 0) {
    panel.hidden = false;
    panel.innerHTML = `<div class="history-empty"><div class="history-empty__icon">${icon('history')}</div><h3>Aún no hay simulaciones guardadas</h3><p>Cuando completes una simulación, aparecerá aquí automáticamente para que puedas verla, duplicarla o llevarla a una comparación.</p><button class="btn btn--secondary btn--sm u-mt-4" data-action="switch-tab" data-tab="1">Crear una simulación</button></div>`;
    return;
  }
  panel.hidden = false;
  let html = `<div class="history-toolbar"><div><strong>Mis simulaciones</strong><div class="history-count">${list.length} registro${list.length===1?'':'s'} guardado${list.length===1?'':'s'} en este navegador</div></div><button class="btn btn--sm btn--ghost" data-action="limpiar-historial">Borrar todo</button></div><div class="history-grid">`;
  list.forEach(e => {
    const m = historyRecordMeta(e);
    const canCompare = [1,2,3,5].includes(e.tabId);
    html += `<article class="history-card">
      <div class="history-card__top"><div><div class="history-card__type">${escHTML(e.tipo)}</div><div class="history-card__program">${escHTML(e.prog)}</div></div><span class="history-card__status">Calculada</span></div>
      <div class="history-card__date">${escHTML(e.fecha)}</div>
      <div class="history-card__metrics">
        <div class="history-card__metric"><span>Monto</span><strong>${cop(m.financiado)}</strong></div>
        <div class="history-card__metric"><span>Cuota</span><strong>${cop(e.cuota)}</strong></div>
        <div class="history-card__metric"><span>Plazo</span><strong>${escHTML(m.plazo)}</strong></div>
      </div>
      <div class="history-card__actions">
        <button class="btn btn--tertiary btn--sm" data-action="hist-ver" data-id="${e.id}">${icon('eye')} Ver</button>
        <button class="btn btn--tertiary btn--sm" data-action="hist-duplicar" data-id="${e.id}">${icon('copy')} Duplicar</button>
        <button class="btn btn--tertiary btn--sm" data-action="hist-comparar" data-id="${e.id}" ${canCompare?'':'disabled title="Comparación no disponible para esta herramienta"'}>${icon('scale')} Comparar</button>
        <button class="btn btn--ghost btn--sm" data-action="eliminar-historial" data-id="${e.id}">${icon('trash-2')} Eliminar</button>
      </div>
    </article>`;
  });
  html += '</div>';
  panel.innerHTML = html;
}

function getHistoryEntry(id) { return getHistorial().find(e => Number(e.id)===Number(id)) || null; }

function verHistorial(id) {
  const e = getHistoryEntry(id); if(!e) return;
  const d = e.snap || {}; const meta = historyRecordMeta(e);
  const modal = document.getElementById('detail-modal');
  if(!modal) return;
  document.getElementById('detail-title').textContent = e.tipo + ' · ' + e.prog;
  document.getElementById('detail-desc').textContent = 'Simulación realizada ' + e.fecha;
  const rows = [
    ['Monto financiado / base', cop(meta.financiado)],
    ['Cuota', cop(e.cuota)],
    ['Plazo', meta.plazo],
    ['Tasa mensual', Number.isFinite(d.tm)?(d.tm*100).toFixed(2)+'%':'—'],
    ['Intereses', cop(d.totInt ?? (d.CP?.totInt||0)+(d.LP?.totInt||0))],
    ['Total', cop(e.total)]
  ];
  document.getElementById('detail-body').innerHTML = `<div class="detail-list">${rows.map(([k,v])=>`<div class="detail-row"><span>${escHTML(k)}</span><strong>${escHTML(v)}</strong></div>`).join('')}</div>`;
  abrirModalAccesible(modal,'[data-action="detail-close"]');
}
function cerrarDetalleHistorial(){ cerrarModalAccesible(document.getElementById('detail-modal')); }

function selectProgramByName(tabId, name) {
  const sel = document.getElementById('prog'+tabId); if(!sel || !name) return;
  const option = Array.from(sel.options).find(o => (o.textContent||'').replace(/ \(.*\)$/,'').trim() === String(name).trim());
  if(option) sel.value = option.value;
}

function duplicarHistorial(id) {
  const e=getHistoryEntry(id); if(!e) return;
  const d=e.snap||{}; const tab=e.tabId;
  switchTab(tab);
  if([1,2,3,7].includes(tab)) {
    setNivel(tab,'pregrado');
    selectProgramByName(tab,d.progNombre);
    const mat=document.getElementById('mat'+tab); if(mat) mat.value=Math.round(d.mat||0);
    if(SimuladorOFE.state.financing.benefits[tab] && Array.isArray(d.beneficios)) {
      SimuladorOFE.state.financing.benefits[tab]=d.beneficios.map((b,i)=>({id:Date.now()+i,nombre:b.nombre||'Descuento',val:b.val||0,pct:b.pct||0,modo:'valor'})); renderBeneficios(tab);
    }
  }
  if(tab===1){ document.getElementById('cont1-val').value=Math.round(d.cuotaInicial||0); document.getElementById('plazo1').value=d.n||6; document.getElementById('tasa1').value=((d.tm||.015)*100).toFixed(2); recalcAll(1); }
  if(tab===2){ document.getElementById('cont2-val').value=Math.round(d.cuotaInicial||0); document.getElementById('pctCP').value=d.pCP||0; document.getElementById('pctLP').value=d.pLP||0; document.getElementById('plazoCP').value=d.nCP||6; document.getElementById('plazoLP').value=d.nLP||8; document.getElementById('tasa2').value=((d.tm||.015)*100).toFixed(2); recalcAll(2); }
  if(tab===3){ document.getElementById('cont3-val').value=Math.round(d.cuotaInicial||0); document.getElementById('plazo3').value=d.n||12; document.getElementById('tasa3').value=((d.tm||.015)*100).toFixed(2); document.getElementById('cargos3').value=Math.round(d.cargos||0); recalcAll(3); }
  if(tab===5){ document.getElementById('refi-capital').value=Math.round(d.capital||0); document.getElementById('refi-intcorr').value=Math.round(d.intCorr||0); document.getElementById('refi-mora').value=Math.round(d.mora||0); document.getElementById('refi-costos').value=Math.round(d.costos||0); document.getElementById('refi-ingreso').value=Math.round(d.ingreso||0); document.getElementById('refi-cuotas-nva').value=d.n||24; document.getElementById('refi-tasa-nva').value=((d.tm||.015)*100).toFixed(2); sumarSaldoRefi(); calcTaRefi(); }
  if(tab===7){ document.getElementById('cap7').value=Math.round(d.cap||0); document.getElementById('plazo7').value=d.n||6; document.getElementById('tasa7').value=((d.tm||.015)*100).toFixed(2); recalc7(); }
  toast('Simulación duplicada. Puedes ajustar los datos y volver a calcular.','success');
}

function historyScenario(entry) {
  const d=entry?.snap||{};
  if(entry.tabId===1) return {label:(d.progNombre||'Programa')+' — '+(d.pct||0)+'%',sub:(d.n||0)+' meses · tasa '+((d.tm||0)*100).toFixed(2)+'%',cuota:d.cuota||0,totalCredito:(d.totCap||0)+(d.totInt||0),pagoInicial:d.pagoInicial||0,totalGeneral:d.totalGeneral||0,financiado:d.financiado||0,intereses:d.totInt||0,data:JSON.parse(JSON.stringify(d))};
  if(entry.tabId===3) return {label:(d.progNombre||'Programa')+' — '+(d.pct||0)+'%',sub:(d.n||0)+' meses · tasa '+((d.tm||0)*100).toFixed(2)+'%',cuota:d.cuota||0,totalCredito:(d.totCap||0)+(d.totInt||0),pagoInicial:d.pagoInicial||0,totalGeneral:d.totalGeneral||0,financiado:d.financiado||0,intereses:d.totInt||0,data:JSON.parse(JSON.stringify(d))};
  if(entry.tabId===2){ const totalCredito=(d.CP?d.CP.totCap+d.CP.totInt:0)+(d.LP?(d.LP.noAmortize?d.LP.capital:d.LP.totCap+d.LP.totInt):0); return {label:(d.progNombre||'Programa')+' — CP'+(d.pCP||0)+'% LP'+(d.pLP||0)+'%',sub:(d.nCP||0)+' m CP · '+(d.nLP||0)+' m LP · tasa '+((d.tm||0)*100).toFixed(2)+'%',cuota:(d.CP?.cuota||0)+(d.LP?.cuota||0),totalCredito,pagoInicial:d.pagoInicial||0,totalGeneral:(d.pagoInicial||0)+totalCredito,financiado:(d.finCP||0)+(d.finLP||0),intereses:(d.CP?.totInt||0)+(d.LP?.totInt||0),isMixto:true,finCP:d.finCP||0,finLP:d.finLP||0,nCP:d.nCP||0,nLP:d.nLP||0,cuotaCP:d.CP?.cuota||0,cuotaLP:d.LP?.cuota||0,intCP:d.CP?.totInt||0,intLP:d.LP?.totInt||0,totCP:d.CP?d.CP.totCap+d.CP.totInt:0,totLP:d.LP?(d.LP.noAmortize?d.LP.capital:d.LP.totCap+d.LP.totInt):0,lpGrace:d.nLP?Math.round(d.nLP*1.5):null,data:JSON.parse(JSON.stringify(d))}; }
  return null;
}

function compararHistorial(id) {
  const e=getHistoryEntry(id); if(!e) return;
  if(e.tabId===5){ const d=JSON.parse(JSON.stringify(e.snap||{})); const list=SimuladorOFE.state.restructuring.scenarios; if(list.length>=3) list.shift(); list.push(d); renderComparisonHub(); switchTab(8); toast('Escenario agregado a la comparación.','success'); return; }
  const sc=historyScenario(e); if(!sc) return toast('Esta simulación no admite comparación.','info');
  const list=SimuladorOFE.state.comparison.scenarios[e.tabId]; if(list.length>=3) list.shift(); list.push(sc); renderEscenarios(e.tabId); switchTab(8); toast('Escenario agregado a la comparación.','success');
}


function guardarEscenario(tabId, replaceOldest = false) {
  let snapshot = null;
  if(tabId===1 && SimuladorOFE.state.results.shortTerm) {
    snapshot = {
      label: (SimuladorOFE.state.results.shortTerm.progNombre||'Programa') + ' — ' + SimuladorOFE.state.results.shortTerm.pct + '%',
      sub: SimuladorOFE.state.results.shortTerm.n + ' meses · tasa ' + (SimuladorOFE.state.results.shortTerm.tm*100).toFixed(2) + '%',
      cuota: SimuladorOFE.state.results.shortTerm.cuota, totalCredito: SimuladorOFE.state.results.shortTerm.totCap+SimuladorOFE.state.results.shortTerm.totInt,
      pagoInicial: SimuladorOFE.state.results.shortTerm.pagoInicial, totalGeneral: SimuladorOFE.state.results.shortTerm.totalGeneral,
      financiado: SimuladorOFE.state.results.shortTerm.financiado, intereses: SimuladorOFE.state.results.shortTerm.totInt,
      data: JSON.parse(JSON.stringify(SimuladorOFE.state.results.shortTerm))
    };
  } else if(tabId===2 && SimuladorOFE.state.results.mixed) {
    const totCred = (SimuladorOFE.state.results.mixed.CP?(SimuladorOFE.state.results.mixed.CP.totCap+SimuladorOFE.state.results.mixed.CP.totInt):0)+(SimuladorOFE.state.results.mixed.LP?(SimuladorOFE.state.results.mixed.LP.noAmortize?SimuladorOFE.state.results.mixed.LP.capital:(SimuladorOFE.state.results.mixed.LP.totCap+SimuladorOFE.state.results.mixed.LP.totInt)):0);
    const lpGracePeriod = SimuladorOFE.state.results.mixed.nLP ? Math.round(SimuladorOFE.state.results.mixed.nLP * 1.5) : null;
    snapshot = {
      label: (SimuladorOFE.state.results.mixed.progNombre||'Programa') + ' — CP' + SimuladorOFE.state.results.mixed.pCP + '% LP' + SimuladorOFE.state.results.mixed.pLP + '%',
      sub: (SimuladorOFE.state.results.mixed.nCP||0) + ' m CP · ' + (SimuladorOFE.state.results.mixed.nLP||0) + ' m LP · tasa ' + (SimuladorOFE.state.results.mixed.tm*100).toFixed(2) + '%',
      cuota: (SimuladorOFE.state.results.mixed.CP?SimuladorOFE.state.results.mixed.CP.cuota:0)+(SimuladorOFE.state.results.mixed.LP?SimuladorOFE.state.results.mixed.LP.cuota:0),
      totalCredito: totCred, pagoInicial: SimuladorOFE.state.results.mixed.pagoInicial,
      totalGeneral: SimuladorOFE.state.results.mixed.pagoInicial+totCred,
      financiado: SimuladorOFE.state.results.mixed.finCP+SimuladorOFE.state.results.mixed.finLP, intereses: (SimuladorOFE.state.results.mixed.CP?SimuladorOFE.state.results.mixed.CP.totInt:0)+(SimuladorOFE.state.results.mixed.LP?SimuladorOFE.state.results.mixed.LP.totInt:0),
      isMixto: true,
      finCP: SimuladorOFE.state.results.mixed.finCP||0,       finLP: SimuladorOFE.state.results.mixed.finLP||0,
      nCP:   SimuladorOFE.state.results.mixed.nCP||0,         nLP:   SimuladorOFE.state.results.mixed.nLP||0,
      cuotaCP: SimuladorOFE.state.results.mixed.CP?SimuladorOFE.state.results.mixed.CP.cuota:0,   cuotaLP: SimuladorOFE.state.results.mixed.LP?SimuladorOFE.state.results.mixed.LP.cuota:0,
      intCP:   SimuladorOFE.state.results.mixed.CP?SimuladorOFE.state.results.mixed.CP.totInt:0,  intLP:   SimuladorOFE.state.results.mixed.LP?SimuladorOFE.state.results.mixed.LP.totInt:0,
      totCP:   SimuladorOFE.state.results.mixed.CP?(SimuladorOFE.state.results.mixed.CP.totCap+SimuladorOFE.state.results.mixed.CP.totInt):0,
      totLP:   SimuladorOFE.state.results.mixed.LP?(SimuladorOFE.state.results.mixed.LP.noAmortize?SimuladorOFE.state.results.mixed.LP.capital:(SimuladorOFE.state.results.mixed.LP.totCap+SimuladorOFE.state.results.mixed.LP.totInt)):0,
      lpGrace: lpGracePeriod,
      data: JSON.parse(JSON.stringify(SimuladorOFE.state.results.mixed))
    };
  } else if(tabId===3 && SimuladorOFE.state.results.bank) {
    snapshot = {
      label: (SimuladorOFE.state.results.bank.progNombre||'Programa') + ' — ' + SimuladorOFE.state.results.bank.pct + '%',
      sub: SimuladorOFE.state.results.bank.n + ' meses · tasa ' + (SimuladorOFE.state.results.bank.tm*100).toFixed(2) + '%',
      cuota: SimuladorOFE.state.results.bank.cuota, totalCredito: SimuladorOFE.state.results.bank.totCap+SimuladorOFE.state.results.bank.totInt,
      pagoInicial: SimuladorOFE.state.results.bank.pagoInicial, totalGeneral: SimuladorOFE.state.results.bank.totalGeneral,
      financiado: SimuladorOFE.state.results.bank.financiado, intereses: SimuladorOFE.state.results.bank.totInt,
      data: JSON.parse(JSON.stringify(SimuladorOFE.state.results.bank))
    };
  }
  if(!snapshot) return toast('Primero calcula un crédito antes de guardar el escenario.', 'warning');
  if(SimuladorOFE.state.comparison.scenarios[tabId].length >= 3 && !replaceOldest) {
    return confirmAction({
      title:'Reemplazar escenario',
      message:'Ya tienes 3 escenarios guardados. Para guardar este escenario se reemplazará el más antiguo.',
      confirmLabel:'Reemplazar',
      tone:'primary',
      onConfirm:()=>guardarEscenario(tabId, true)
    });
  }
  if(SimuladorOFE.state.comparison.scenarios[tabId].length >= 3) SimuladorOFE.state.comparison.scenarios[tabId].shift();
  SimuladorOFE.state.comparison.scenarios[tabId].push(snapshot);
  renderEscenarios(tabId);
  if(typeof renderComparisonHub==='function') renderComparisonHub();
  toast('Escenario guardado para comparar','success');
}

function eliminarEscenario(tabId, idx) {
  SimuladorOFE.state.comparison.scenarios[tabId].splice(idx, 1);
  renderEscenarios(tabId);
  if(typeof renderComparisonHub==='function') renderComparisonHub();
  toast('Escenario eliminado','success');
}

function renderEscenarios(tabId) {
  const panel = document.getElementById('esc-panel-'+tabId);
  if(!panel) return;
  const list = SimuladorOFE.state.comparison.scenarios[tabId];
  if(list.length === 0) { panel.hidden = true; return; }
  panel.hidden = false;
  const colors = ['var(--accent)','var(--success)','var(--info)'];
  let html = `<div class="card__head u-mt-5">
    <h3>${icon('clipboard')} Escenarios Guardados (${list.length}/3)</h3>
    ${list.length >= 2 ? `<button class="btn btn--sm btn--primary" data-action="open-compare" data-tab="${tabId}">${icon('scale')} Comparar</button>` : ''}
  </div>
  <div class="list">`;
  list.forEach((e,i) => {
    html += `<div class="list-item">
      <div class="step-num step-num--fill" style="background:${colors[i]}">${i+1}</div>
      <div class="list-item__main">
        <strong>${escHTML(e.label)}</strong>
        <span>${escHTML(e.sub)}</span>
      </div>
      <div class="u-text-right u-mr-8">
        <div style="font-size:13px;font-weight:700;color:${colors[i]};">${cop(e.cuota)}/mes</div>
        <div class="u-fs-11-muted">Total: ${cop(e.totalGeneral)}</div>
      </div>
      <button class="btn btn--ghost btn--icon btn--sm" data-action="eliminar-escenario" data-tab="${tabId}" data-index="${i}" aria-label="Eliminar" title="Eliminar">${icon('x')}</button>
    </div>`;
  });
  html += '</div>';
  // Save as escenario btn
  html += `<button class="btn btn--sm" data-action="guardar-escenario" data-tab="${tabId}">${icon('save')} Guardar simulación actual como escenario</button>`;
  panel.innerHTML = html;
}


// ── Exportar comparativa de escenarios a Excel ───────────────────────────────
function expXLSComparativa(tabId) {
  const list = SimuladorOFE.state.comparison.scenarios[tabId];
  if(!list || list.length < 2) return toast('Guarda al menos 2 escenarios para comparar.', 'warning');
  const isMixto = tabId === 2 && list.every(e => e.isMixto);

  const aoa = [];
  const tabNames = {1:'Crédito Corto Plazo', 2:'Crédito Mixto CP/LP', 3:'Crédito Banco Aliado'};
  aoa.push(['Comparativa de Escenarios — '+tabNames[tabId]]);
  aoa.push(['Generado', new Date().toLocaleString('es-CO')]);
  aoa.push([]);

  // Header row
  const header = ['Concepto', ...list.map((e,i)=>'Escenario '+(i+1))];
  aoa.push(header);
  aoa.push(['Programa', ...list.map(e=>e.label)]);
  aoa.push(['Detalle', ...list.map(e=>e.sub)]);
  aoa.push([]);

  if(isMixto) {
    aoa.push(['Monto Financiado Total', ...list.map(e=>Math.round(e.financiado))]);
    aoa.push(['  Monto CP', ...list.map(e=>Math.round(e.finCP))]);
    aoa.push(['  Monto LP', ...list.map(e=>Math.round(e.finLP))]);
    aoa.push(['Pago Inicial', ...list.map(e=>Math.round(e.pagoInicial))]);
    aoa.push(['Cuota Mensual CP (mientras estudia)', ...list.map(e=>Math.round(e.cuotaCP))]);
    aoa.push(['Intereses CP', ...list.map(e=>Math.round(e.intCP))]);
    aoa.push(['Total Crédito CP', ...list.map(e=>Math.round(e.totCP))]);
    aoa.push(['Capital LP (al graduarse, sin intereses)', ...list.map(e=>Math.round(e.finLP))]);
    aoa.push(['Plazo estimado pago LP (meses)', ...list.map(e=>e.lpGrace||'')]);
    aoa.push(['Total Crédito (CP+LP)', ...list.map(e=>Math.round(e.totalCredito))]);
    aoa.push(['COSTO TOTAL', ...list.map(e=>Math.round(e.totalGeneral))]);
  } else {
    aoa.push(['Monto Financiado', ...list.map(e=>Math.round(e.financiado))]);
    aoa.push(['Pago Inicial', ...list.map(e=>Math.round(e.pagoInicial))]);
    aoa.push(['Cuota Mensual', ...list.map(e=>Math.round(e.cuota))]);
    aoa.push(['Total Intereses', ...list.map(e=>Math.round(e.intereses))]);
    aoa.push(['Total Crédito', ...list.map(e=>Math.round(e.totalCredito))]);
    aoa.push(['COSTO TOTAL', ...list.map(e=>Math.round(e.totalGeneral))]);
  }

  aoa.push([]);
  // Difference vs Esc.1
  const diffRow = ['Diferencia vs Esc.1', ''];
  for(let i=1;i<list.length;i++) diffRow.push(Math.round(list[i].totalGeneral - list[0].totalGeneral));
  aoa.push(diffRow);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{wch:42}, ...list.map(()=>({wch:20}))];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Comparativa');
  XLSX.writeFile(wb, 'Comparativa Escenarios - '+tabNames[tabId]+'.xlsx');
  toast('Excel descargado', 'success');
}

function compararEscenarios(tabId) {
  const list = SimuladorOFE.state.comparison.scenarios[tabId];
  if(list.length < 2) return;
  const colors = ['var(--accent)','var(--success)','var(--info)'];
  const isMixto = tabId === 2 && list.every(e => e.isMixto);

  // Build field definitions — mixto gets CP/LP breakdown
  let fields;
  if(isMixto) {
    fields = [
      {key:'financiado',  label:'Monto Financiado Total', hint:''},
      {key:'finCP',       label:'  ' + icon('circle-dot') + ' Monto CP', hint:'', indent:true},
      {key:'finLP',       label:'  ' + icon('circle-dot') + ' Monto LP', hint:'', indent:true},
      {key:'pagoInicial', label:'Pago Inicial', hint:''},
      // CP block
      {key:'cuotaCP',     label:'  ' + icon('circle-dot') + ' Cuota Mensual CP', hint:'Mientras estudia', indent:true, tag:'cp'},
      {key:'intCP',       label:'  ' + icon('circle-dot') + ' Intereses CP', hint:'', indent:true},
      {key:'totCP',       label:'  ' + icon('circle-dot') + ' Total Crédito CP', hint:'', indent:true},
      // LP block
      {key:'cuotaLP',     label:'  ' + icon('circle-dot') + ' Cuota Mensual LP', hint:'Al graduarse', indent:true, tag:'lp'},
      {key:'intLP',       label:'  ' + icon('circle-dot') + ' Intereses LP', hint:'', indent:true},
      {key:'totLP',       label:'  ' + icon('circle-dot') + ' Total Crédito LP', hint:'', indent:true},
      {key:'totalCredito',label:'Total Crédito (CP+LP)', hint:''},
      {key:'totalGeneral',label:'COSTO TOTAL', hint:''},
    ];
  } else {
    fields = [
      {key:'financiado',   label:'Monto Financiado'},
      {key:'pagoInicial',  label:'Pago Inicial'},
      {key:'cuota',        label:'Cuota Mensual'},
      {key:'intereses',    label:'Total Intereses'},
      {key:'totalCredito', label:'Total Crédito'},
      {key:'totalGeneral', label:'COSTO TOTAL'},
    ];
  }

  let html = `<div class="card__head u-mt-5 section-divider-top section-divider-top--compact">
    <h3>${icon('scale')} Comparativa de Escenarios</h3>
    <button class="btn btn--sm btn--primary u-bg-success" data-action="xls-comparativa" data-tab="${tabId}">${icon('bar-chart')} Exportar a Excel</button>
  </div>`;

  // Context note for mixto
  if(isMixto) {
    const nCP0 = list[0].nCP, nLP0 = list[0].nLP;
    const grace0 = list[0].lpGrace;
    html += `<div class="callout callout--accent-soft u-mb-12">
      <strong>${icon('circle-dot')} Corto Plazo:</strong> se paga <em>mientras estudia</em> (${nCP0} meses) &nbsp;|&nbsp;
      <strong>${icon('circle-dot')} Largo Plazo:</strong> se paga <em>al graduarse</em>${grace0?' — comienza aprox. después de '+grace0+' meses (1.5× el plazo LP)':''}</div>`;
  }

  html += `<div class="u-overflow-x"><table class="tbl"><thead><tr>
    <th class="u-text-left">Concepto</th>
    ${list.map((e,i)=>{
      const sub = isMixto
        ? `CP ${e.nCP}m · LP ${e.nLP}m · ${(e.data.tm*100).toFixed(2)}%`
        : e.label;
      return `<th class="th--fill" style="background:${colors[i]};">Escenario ${i+1}<br>
        <span class="scenario-meta scenario-meta--primary">${e.label.replace('% LP','% · LP ')}</span><br>
        <span class="scenario-meta scenario-meta--secondary">${sub}</span></th>`;
    }).join('')}
  </tr></thead><tbody>`;

  fields.forEach(f => {
    const vals = list.map(e => e[f.key] || 0);
    const allSame = vals.every(v=>v===vals[0]);
    const minVal = Math.min(...vals), maxVal = Math.max(...vals);
    const isCost = f.key !== 'financiado' && f.key !== 'finCP' && f.key !== 'finLP';
    const isSection = f.key==='cuotaCP' || f.key==='cuotaLP';
    const rowStyle = f.indent
      ? 'background:var(--surface-2);'
      : (f.key==='totalGeneral'?'font-weight:700;background:var(--warning-soft);border-top:2px solid var(--warning);':'');

    const hintSpan = f.hint
      ? `<span class="text-muted-2xs u-block">${f.hint}</span>` : '';

    html += `<tr style="${rowStyle}">`;
    html += `<td style="${f.indent?'padding-left:20px;color:var(--text-2);':''}">${f.label.replace(/^\s+/,'')}${hintSpan}</td>`;
    vals.forEach(v => {
      let cls = '';
      if(!allSame) {
        if(isCost) cls = v===minVal ? 'cmp-best' : (v===maxVal ? 'cmp-worst' : '');
        else cls = v===maxVal ? 'cmp-best' : '';
      }
      html += `<td class="${cls}">${cop(v)}</td>`;
    });
    html += '</tr>';
  });

  // Difference row
  if(list.length >= 2) {
    html += `<tr><td class="u-fw-700">Diferencia vs Esc.1</td><td>—</td>
      ${list.slice(1).map((_,i)=>{
        const d = list[0].totalGeneral - list[i+1].totalGeneral;
        const color = d>0 ? 'var(--success)' : 'var(--danger)';
        return `<td style="color:${color};font-weight:700;">${d>0?'-':'+'}${cop(Math.abs(d))}</td>`;
      }).join('')}
    </tr>`;
  }

  html += '</tbody></table></div>';

  const panel = document.getElementById('esc-panel-'+tabId);
  const oldCmp = panel.querySelector('.cmp-wrap');
  if(oldCmp) oldCmp.remove();
  const wrap = document.createElement('div');
  wrap.className = 'cmp-wrap';
  wrap.innerHTML = html;
  panel.appendChild(wrap);
  wrap.scrollIntoView({behavior:'smooth', block:'nearest'});
}


function openCompareForTab(tabId) {
  switchTab(8);
  requestAnimationFrame(()=>document.getElementById('compare-group-'+tabId)?.scrollIntoView({behavior:'smooth',block:'start'}));
}

function compareGroupHTML(tabId, list, title, subtitle, options={}) {
  if(!list || list.length===0) return '';
  const bestCost = list.reduce((b,e,i)=>Number(e.totalGeneral||Infinity)<Number(list[b].totalGeneral||Infinity)?i:b,0);
  const bestPayment = list.reduce((b,e,i)=>Number(e.cuota||Infinity)<Number(list[b].cuota||Infinity)?i:b,0);
  const cards = list.map((e,i)=>{
    const d=e.data||e;
    const tasa=Number.isFinite(d.tm)?(d.tm*100).toFixed(2)+'% M.V.':'—';
    const plazo=e.isMixto?`${e.nCP||0}m CP · ${e.nLP||0}m LP`:`${d.n||e.n||0} meses`;
    return `<article class="compare-card ${i===bestCost?'compare-card--best-cost':''} ${i===bestPayment?'compare-card--best-payment':''}">
      <div class="compare-card__num">Escenario ${String.fromCharCode(65+i)}</div>
      <div class="compare-card__title">${escHTML(e.label||title)}</div>
      <div class="compare-card__payment">${cop(e.cuota||0)}<span>cuota estimada</span></div>
      <div class="compare-card__rows">
        <div class="compare-card__row"><span>Monto financiado</span><strong>${cop(e.financiado||e.principal||0)}</strong></div>
        <div class="compare-card__row"><span>Plazo</span><strong>${escHTML(plazo)}</strong></div>
        <div class="compare-card__row"><span>Tasa</span><strong>${escHTML(tasa)}</strong></div>
        <div class="compare-card__row"><span>Intereses</span><strong>${cop(e.intereses??e.totInt??0)}</strong></div>
        <div class="compare-card__row"><span>Total</span><strong>${cop(e.totalGeneral||0)}</strong></div>
      </div>
      <div class="compare-badges">${i===bestPayment?'<span class="compare-badge compare-badge--payment">Menor cuota</span>':''}${i===bestCost?'<span class="compare-badge compare-badge--cost">Menor costo total</span>':''}</div>
    </article>`;
  }).join('');
  const ready=list.length>=2;
  const insight=ready?`<div class="compare-insight">${icon('lightbulb')}<div><strong>${bestPayment===bestCost?'Una alternativa concentra ambas ventajas.':'Hay un intercambio entre cuota y costo.'}</strong> ${bestPayment===bestCost?`El Escenario ${String.fromCharCode(65+bestCost)} combina la menor cuota y el menor costo total.`:`El Escenario ${String.fromCharCode(65+bestPayment)} reduce la cuota; el Escenario ${String.fromCharCode(65+bestCost)} minimiza el costo total.`}</div></div>`:`<div class="compare-insight">${icon('info')}<div>Guarda al menos un escenario adicional para identificar automáticamente la menor cuota y el menor costo total.</div></div>`;
  return `<section class="compare-group" id="compare-group-${tabId}"><div class="compare-group__head"><div><h3>${escHTML(title)}</h3><p>${escHTML(subtitle)}</p></div><div class="u-row u-gap-2">${ready && options.export!==false?`<button class="btn btn--tertiary btn--sm" data-action="xls-comparativa" data-tab="${tabId}">${icon('bar-chart')} Excel</button>`:''}<button class="btn btn--ghost btn--sm" data-action="switch-tab" data-tab="${tabId}">Editar escenarios</button></div></div><div class="compare-scenarios">${cards}</div>${insight}</section>`;
}

function renderComparisonHub() {
  const root=document.getElementById('comparison-hub'); if(!root) return;
  const groups=[];
  const defs={1:['Crédito a Corto Plazo','Compara cuota, tasa, intereses y costo total.'],2:['Corto y Largo Plazo','Contrasta distribuciones entre CP y LP con los valores actualmente conocidos.'],3:['Crédito Banco Aliado','Evalúa el impacto de plazo, tasa y cargos en cada alternativa.']};
  [1,2,3].forEach(tab=>{ const list=SimuladorOFE.state.comparison.scenarios[tab]||[]; if(list.length) groups.push(compareGroupHTML(tab,list,...defs[tab])); });
  const refi=SimuladorOFE.state.restructuring.scenarios||[];
  if(refi.length) {
    const mapped=refi.map(e=>({label:e.label,cuota:e.cuota,totalGeneral:e.totalGeneral,financiado:e.principal,intereses:e.totInt,n:e.n,tm:e.tm,data:e}));
    groups.push(compareGroupHTML(5,mapped,'Reestructuración de Crédito','Compara la nueva cuota, costo financiero y plazo de cada escenario.',{export:false}));
  }
  if(!groups.length) {
    root.innerHTML=`<div class="compare-empty"><div class="compare-empty__icon">${icon('scale')}</div><h3>No hay escenarios para comparar</h3><p>Calcula una simulación y guarda al menos un escenario. Cuando tengas dos alternativas de una misma modalidad podrás identificar rápidamente menor cuota y menor costo total.</p><button class="btn btn--primary btn--sm u-mt-4" data-action="switch-tab" data-tab="1">Crear primer escenario</button></div>`;
  } else root.innerHTML=groups.join('');
}

// ── COMBINED PDF (pregrado + idiomas) ────────────────────────────────────────
function expPDFCombinado() {
  const dp   = SimuladorOFE.state.results.languages;
  const tabId = SimuladorOFE.state.languages.context.tabId;
  let dm = null, tipoLabel = '';
  if(tabId===1 && SimuladorOFE.state.results.shortTerm)  { dm=SimuladorOFE.state.results.shortTerm; tipoLabel='Crédito Corto Plazo'; }
  if(tabId===2 && SimuladorOFE.state.results.mixed)  { dm=SimuladorOFE.state.results.mixed; tipoLabel='Crédito Mixto'; }
  if(tabId===3 && SimuladorOFE.state.results.bank)  { dm=SimuladorOFE.state.results.bank; tipoLabel='Crédito Banco Aliado'; }
  if(!dp||!dm) return toast('Primero calcula ambos créditos (pregrado e idiomas) para generar el PDF combinado.', 'warning');

  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  const filename = (dp.progNombre+' - Combinado').replace(/[^a-zA-Z0-9\-_ áéíóúÁÉÍÓÚñÑ]/g,'').trim();
  const hw = ['#','Cuota','Capital','Interés','Saldo'], cw = [14,42,38,38,44];

  function drawTable(doc, rows, y, titulo) {
    const tc = rows.reduce((s,r)=>s+r.capital,0), ti = rows.reduce((s,r)=>s+r.interes,0);
    return pdfTablaAmort(doc, y, rows, tc, ti, titulo || 'PLAN DE PAGOS');
  }

  function drawKV(doc, rows, y) { return pdfKV(doc, y, rows); }

  // ══ PAGE 1: RESUMEN COMBINADO ══════════════════════════════════
  let y = pdfHeader(doc, 'Reporte Combinado — Pregrado + Idiomas', dp.progNombre+' · '+tipoLabel);
  y = pdfCondiciones(doc, y, {
    modalidad: tipoLabel + ' + Credito de idiomas',
    tasa: dm.tm,
    plazo: (tabId === 2 ? ('Corto plazo: ' + (dm.nCP||0) + ' cuotas') : ((dm.n||0) + ' cuotas mensuales'))
           + '  |  Idiomas: ' + (dp.n||0) + ' cuotas',
    garantisa: tabId === 2 ? 'Corto plazo 4.17% - Largo plazo 2.86%' : 'Aporte del 4.17% sobre el monto financiado',
    gracia: tabId === 2 ? '12 meses despues de graduarse (tramo de largo plazo)' : null
  });

  y = addFechaToDoc(doc, y); y+=4;

  const cuotaPre = dm.cuota || ((dm.CP?dm.CP.cuota:0)+(dm.LP?dm.LP.cuota:0));
  const totCredPre = dm.totCap ? (dm.totCap+dm.totInt) : ((dm.CP?(dm.CP.totCap+dm.CP.totInt):0)+(dm.LP?(dm.LP.totCap+dm.LP.totInt):0));
  const pagoIniPre = dm.pagoInicial||0;
  const totGenPre  = pagoIniPre + totCredPre;
  const costoTotal = pagoIniPre + dp.pagoInicial + totCredPre + dp.totalCredito;

  y = pdfSectionBar(doc, 'RESUMEN COMBINADO', y); y+=2;

  // Group 1: Pago inicial
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(160,110,45);
  doc.text(safePDF('① PAGO AL MOMENTO DEL DESEMBOLSO'), 16, y); doc.setTextColor(0,0,0); doc.setFontSize(11); y+=7;
  y = drawKV(doc, [
    ['  Pago Inicial Pregrado', cop(pagoIniPre)],
    ['  Pago Inicial Idiomas', cop(dp.pagoInicial)],
  ], y);
  doc.setFillColor(251,244,233); doc.rect(14,y-5,180,8,'F');
  doc.setFont('helvetica','bold'); doc.text(safePDF('Total Pago Inicial:'), 16, y);
  doc.text(safePDF(cop(pagoIniPre+dp.pagoInicial)), 150, y, {align:'right'}); y+=10;

  // Group 2: Crédito
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(26,58,92);
  doc.text(safePDF('② CRÉDITO A AMORTIZAR'), 16, y); doc.setTextColor(0,0,0); doc.setFontSize(11); y+=7;
  y = drawKV(doc, [
    ['  Total Crédito Pregrado', cop(totCredPre)],
    ['  Total Crédito Idiomas', cop(dp.totalCredito)],
  ], y);
  doc.setFillColor(234,241,248); doc.rect(14,y-5,180,8,'F');
  doc.setFont('helvetica','bold'); doc.text(safePDF('Total Crédito:'), 16, y);
  doc.text(safePDF(cop(totCredPre+dp.totalCredito)), 150, y, {align:'right'}); y+=10;

  // Group 3: Cuota mensual
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(61,107,74);
  doc.text(safePDF('③ CUOTA MENSUAL COMBINADA'), 16, y); doc.setTextColor(0,0,0); doc.setFontSize(11); y+=7;
  y = drawKV(doc, [
    ['  Cuota Mensual Pregrado', cop(cuotaPre)],
    ['  Cuota Mensual Idiomas', cop(dp.cuota)],
  ], y);
  doc.setFillColor(235,243,238); doc.rect(14,y-5,180,8,'F');
  doc.setFont('helvetica','bold'); doc.text(safePDF('Cuota Mensual Total:'), 16, y);
  doc.text(safePDF(cop(cuotaPre+dp.cuota)), 150, y, {align:'right'}); y+=12;

  // Costo total
  const barH = 22;
  doc.setFillColor(26,58,92); doc.rect(14, y-7, 180, barH, 'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(11);
  doc.text(safePDF('COSTO TOTAL SEMESTRE'), 18, y);
  doc.text(safePDF(cop(costoTotal)), 190, y, {align:'right'});
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text(safePDF('(Total Pago Inicial  +  Total Credito)'), 104, y+9, {align:'center'});
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal'); doc.setFontSize(11);
  y += barH + 4;
  y = pdfCostoFootnote(doc, y, '* Valor matrícula + Garantisa pregrado + Garantisa idiomas + Intereses de ambos créditos');

  // ══ PAGE 2: PREGRADO DETAIL ════════════════════════════════════
  doc.addPage();
  y = pdfHeader(doc, 'Detalle — '+tipoLabel, dp.progNombre);
  y = addFechaToDoc(doc, y); y+=2;

  if(tabId === 1 || tabId === 3) {
    // Single amortization
    y = pdfBenefSection(doc,y,dm.mat,dm.beneficios||[],dm.benefTotal||0,dm.matNeta||dm.mat,dm.cuotaInicial);
    y += 2; y = pdfSectionBar(doc,'PAGO INICIAL — al momento del desembolso',y);
    y = drawKV(doc,[
      dm.benefTotal>0?['Matrícula Neta',cop(dm.matNeta||dm.mat)]:['Valor Matrícula',cop(dm.mat)],
      ['Pago de Contado',cop(dm.cuotaInicial)],
      ['Garantisa 4.17%',cop(dm.garantisa)],
      ['Total Pago Inicial',cop(dm.pagoInicial)]
    ], y);
    y += 2; y = pdfSectionBar(doc,'CRÉDITO A AMORTIZAR',y);
    y = drawKV(doc,[
      ['Monto Financiado',cop(dm.financiado)+'  ('+dm.pct+'% de matrícula)'],
      ['Cuota Mensual',cop(dm.cuota)],
      ['Total Intereses',cop(dm.totInt)],
      ['Total Crédito',cop(dm.totCap+dm.totInt)],
      ['COSTO TOTAL PREGRADO',cop(dm.totalGeneral)]
    ], y);
    y = pdfCostoFootnote(doc, y);
    y += 2; y = pdfSectionBar(doc,'TABLA DE AMORTIZACIÓN',y);
    y = drawTable(doc, dm.rows, y);
  } else if(tabId === 2) {
    // Mixto: CP + LP
    y = pdfBenefSection(doc,y,dm.mat,dm.beneficios||[],dm.benefTotal||0,dm.matNeta||dm.mat,dm.cuotaInicial);
    y += 2; y = pdfSectionBar(doc,'PAGO INICIAL — al momento del desembolso',y);
    y = drawKV(doc,[
      dm.benefTotal>0?['Matrícula Neta',cop(dm.matNeta||dm.mat)]:['Valor Matrícula',cop(dm.mat)],
      ['Pago de Contado',cop(dm.cuotaInicial)],
      dm.garCP>0?['Garantisa CP (4.17%)',cop(dm.garCP)]:null,
      dm.garLP>0?['Garantisa LP (2.86%)',cop(dm.garLP)]:null,
      ['Total Pago Inicial',cop(dm.pagoInicial)]
    ], y);
    if(dm.CP) {
      y += 2; y = pdfSectionBar(doc,'CORTO PLAZO — '+dm.pCP+'%',y);
      y = drawKV(doc,[['Monto CP',cop(dm.finCP)],['Cuota CP',cop(dm.CP.cuota)],['Total CP',cop(dm.CP.totCap+dm.CP.totInt)]],y);
      y += 2; y = pdfSectionBar(doc,'TABLA AMORTIZACIÓN — CORTO PLAZO',y);
      y = drawTable(doc, dm.CP.rows, y);
    }
    if(dm.LP) {
      if(y > 180) { doc.addPage(); y=20; }
      const nPagoComb = dm.LP.nPago || Math.round((dm.nLP||8)*6*1.5);
      y = pdfSectionBar(doc,'LARGO PLAZO — '+dm.pLP+'% ('+nPagoComb+' cuotas - solo capital)',y,[46,125,50]);
      y = drawKV(doc,[
        ['Capital LP',cop(dm.finLP)],
        ['Plazo Estimado',nPagoComb+' cuotas mensuales'],
        ['Periodo de Gracia','12 meses post-grado']
      ],y);
      y += 2; y = pdfSectionBar(doc,'PLAN DE PAGOS LP — SOLO CAPITAL (interes: tasa futura)',y,[46,125,50]);
      const hwLPc=['#','Capital','Saldo Capital','Interes'], cwLPc=[14,50,50,62];
      doc.setTextColor(0,0,0); doc.setFontSize(9);
      const semLPcomb=dm.nLP||8;
      doc.setFillColor(235,243,238); doc.rect(14,y-4,180,38,'F');
      doc.setDrawColor(61,107,74); doc.rect(14,y-4,180,38,'S'); doc.setDrawColor(0,0,0);
      [['Capital a amortizar:',cop(dm.finLP)],
       ['Semestres de la carrera:',semLPcomb+' semestres'],
       ['Plazo estimado de pago:',nPagoComb+' meses ('+Math.round(nPagoComb/12*10)/10+' anos)'],
       ['Interes:','Tasa vigente al iniciar amortizacion']
      ].forEach(([k,v])=>{doc.setFont('helvetica','bold');pdfText(doc,k,16,y);doc.setFont('helvetica','normal');pdfText(doc,v,192,y,{align:'right'});y+=8;});
      y+=4; doc.setFontSize(11);
    }
    const totCred2 = (dm.CP?(dm.CP.totCap+dm.CP.totInt):0)+(dm.LP?(dm.LP.totCap+dm.LP.totInt):0);
    y = pdfCostoFootnote(doc, y);
  }

  // ══ PAGE 3: IDIOMAS DETAIL ═════════════════════════════════════
  doc.addPage();
  y = pdfHeader(doc, 'Detalle — Crédito Idiomas', dp.progNombre);
  y = addFechaToDoc(doc, y); y+=2;

  // Beneficios idiomas
  const benefsIdSnap = SimuladorOFE.state.languages.benefits.filter(b=>b.val>0);
  y = pdfBenefSection(doc,y,dp.mat,benefsIdSnap,SimuladorOFE.state.languages.benefits.reduce((s,b)=>s+(b.val||0),0),dp.mat-SimuladorOFE.state.languages.benefits.reduce((s,b)=>s+(b.val||0),0),dp.cuotaInicial);
  y += 2; y = pdfSectionBar(doc,'PAGO INICIAL — al momento del desembolso',y);
  y = drawKV(doc,[
    ['Pago de Contado',cop(dp.cuotaInicial)],
    ['Garantisa 4.17%',cop(dp.garantisa)],
    ['Total Pago Inicial',cop(dp.pagoInicial)]
  ], y);
  y += 2; y = pdfSectionBar(doc,'CRÉDITO A AMORTIZAR',y);
  y = drawKV(doc,[
    ['Valor Idiomas',cop(dp.mat)],
    ['Monto Financiado',cop(dp.financiado)],
    ['Cuota Mensual',cop(dp.cuota)],
    ['Total Intereses',cop(dp.totInt)],
    ['Total Crédito Idiomas',cop(dp.totalCredito)],
    ['COSTO TOTAL IDIOMAS',cop(dp.totalGeneral)]
  ], y);
  y = pdfCostoFootnote(doc, y, '* Valor idiomas + Garantisa + Intereses del crédito');

  // Proyecciones (matricula + idiomas) al final del combinado
  const _addProys = () => {
    y = pdfProyeccionLP(doc, y, SimuladorOFE.state.results.projectionLP, 'Matricula');
    y = pdfProyeccionLP(doc, y, SimuladorOFE.state.results.projectionLanguagesLP, 'Idiomas');
  };
  if(dp.isMixto && dp.idCP && dp.idLP) {
    y += 2; y = pdfSectionBar(doc,'TABLA CP IDIOMAS - '+Math.round((SimuladorOFE.state.languages.context.pctCP||40))+'% ('+dp.n+' cuotas)',y);
    y = drawTable(doc, dp.idCP.rows, y);
    if(y > 180) { doc.addPage(); y=20; }
    const nLPidPDF = dp.mesesLP || dp.idLP.nPago || 72;
    y = pdfSectionBar(doc,'PLAN LP IDIOMAS - '+Math.round((SimuladorOFE.state.languages.context.pctLP||60))+'% ('+nLPidPDF+' cuotas - solo capital)',y,[46,125,50]);
    // Capital-only LP table for idiomas
    doc.setTextColor(0,0,0); doc.setFontSize(9);
    const semLPidComb = dp.semLP||8;
    doc.setFillColor(235,243,238); doc.rect(14,y-4,180,38,'F');
    doc.setDrawColor(61,107,74); doc.rect(14,y-4,180,38,'S'); doc.setDrawColor(0,0,0);
    [['Capital a amortizar:',cop(dp.finLP)],
     ['Semestres de la carrera:',semLPidComb+' semestres'],
     ['Plazo estimado de pago:',nLPidPDF+' meses ('+Math.round(nLPidPDF/12*10)/10+' anos)'],
     ['Interes:','Tasa vigente al iniciar amortizacion']
    ].forEach(([k,v])=>{doc.setFont('helvetica','bold');pdfText(doc,k,16,y);doc.setFont('helvetica','normal');pdfText(doc,v,192,y,{align:'right'});y+=8;});
    y+=4; doc.setFontSize(11); y+=4;
    // Disclaimer
    doc.setFillColor(235,243,238); doc.rect(14,y-3,180,20,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(61,107,74);
    pdfText(doc,'Sera amortizado en el numero de semestres que dure la carrera (x 1.5).',16,y); y+=5;
    doc.setFont('helvetica','normal'); doc.setTextColor(58,53,50);
    pdfText(doc,'Cuota definitiva: tasa vigente al iniciar amortizacion. Gracia: 1 año post-grado.',16,y); y+=8;
    doc.setTextColor(0,0,0); doc.setFontSize(11);
    y = pdfProyeccionLP(doc, y, SimuladorOFE.state.results.projectionLanguagesLP, 'Idiomas');
  } else {
    y += 2; y = pdfSectionBar(doc,'TABLA AMORTIZACION IDIOMAS ('+dp.n+' cuotas)',y);
    y = drawTable(doc, dp.rows, y);
  }

  pdfPie(doc);
  doc.save(filename+'.pdf');
  toast('PDF descargado', 'success');
}



function handleUIChange(event) {
  clearControlValidationFromEvent(event.target);
  const el = event.target.closest('[data-change-action]');
  if(!el) return;
  const action = el.dataset.changeAction;
  const tab = Number(el.dataset.tab);
  if(action==='filtrar-programas') return filtrarProgramas(tab);
  if(action==='set-mat') return setMat(tab);
  if(action==='convertir-tasas') return convertirTasas();
  if(action==='cargar-html') return cargarHTML(event);
  if(action==='cargar-excel') return cargarExcel(event);
}

function handleUIDragOver(event) {
  const dz = event.target.closest('[data-dropzone]');
  if(dz) dzOver(event, dz.id);
}
function handleUIDragLeave(event) {
  const dz = event.target.closest('[data-dropzone]');
  if(dz) dzLeave(dz.id);
}
function handleUIDrop(event) {
  const dz = event.target.closest('[data-dropzone]');
  if(dz) dzDrop(event, dz.dataset.dropzone);
}

SimuladorOFE.register('actions-history', {
  init(){
    document.addEventListener('click', handleUIAction);
    document.addEventListener('input', handleUIInput);
    document.addEventListener('change', handleUIChange);
    document.addEventListener('dragover', handleUIDragOver);
    document.addEventListener('dragleave', handleUIDragLeave);
    document.addEventListener('drop', handleUIDrop);
    try { runFinancialSelfTests(); }
    catch(e) { console.error('[Motor financiero] Error ejecutando pruebas internas', e); }
  }
});
