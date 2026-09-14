// ── IDIOMAS ──────────────────────────────────────────────────────────────────
const languagesState = SimuladorOFE.state.languages;

// ── Idiomas beneficios state ─────────────────────────────────────

function addBenefId() {
  const id = Date.now();
  SimuladorOFE.state.languages.benefits.push({id, nombre:'', pct:0, val:0});
  renderBenefId();
  setTimeout(()=>{
    const rows = document.querySelectorAll('#benef-items-id [data-field="nombre"]');
    if(rows.length) rows[rows.length-1].focus();
  }, 40);
}
function delBenefId(id) {
  const i = SimuladorOFE.state.languages.benefits.findIndex(b=>b.id===id);
  if(i>=0) SimuladorOFE.state.languages.benefits.splice(i,1);
  renderBenefId(); recalcId();
}
function updateBenefIdField(id, field, rawVal) {
  const b = SimuladorOFE.state.languages.benefits.find(x=>x.id===id);
  if(!b) return;
  const mat = SimuladorOFE.state.languages.context.valorIdiomas || 0;
  if(field==='nombre'){ b.nombre=rawVal; return; }
  if(field==='pct'){
    b.pct = Math.max(0,parseFloat(rawVal)||0);
    b.val = mat>0 ? Math.round(mat*b.pct/100) : 0;
    const vEl=document.getElementById('benef-id-val-'+id);
    if(vEl && document.activeElement!==vEl) vEl.value = b.val||'';
  } else {
    b.val = Math.max(0,parseFloat(rawVal)||0);
    b.pct = mat>0 ? Math.round((b.val/mat)*1000)/10 : 0;
    const pEl=document.getElementById('benef-id-pct-'+id);
    if(pEl && document.activeElement!==pEl) pEl.value = b.pct||'';
  }
  recalcId();
}
function renderBenefId() {
  const container = document.getElementById('benef-items-id');
  if(!container) return;
  container.innerHTML = SimuladorOFE.state.languages.benefits.map(b => `
    <div class="benef-item">
      <div class="benef-item__main">
        <input class="input input--sm" type="text" placeholder="Ej: Beca, descuento..."
          aria-label="Nombre del beneficio" value="${escAttr(b.nombre)}"
          data-input-action="benef-id-field" data-id="${b.id}" data-field="nombre">
        <div class="dual u-mt-2">
          <div class="input-affix input-affix--sm">
            <input id="benef-id-pct-${b.id}" class="input" type="number" placeholder="0" min="0" max="100" step="0.1"
              aria-label="Porcentaje del beneficio" value="${b.pct||''}"
              data-input-action="benef-id-field" data-id="${b.id}" data-field="pct"><span class="input-affix__tag input-affix__tag--end">%</span>
          </div>
          <div class="dual__sep" aria-hidden="true">${icon('arrows-h')}</div>
          <div class="input-affix input-affix--sm">
            <span class="input-affix__tag">$</span><input id="benef-id-val-${b.id}" class="input" data-money-field type="number" placeholder="0" min="0" step="1000"
              aria-label="Valor del beneficio" value="${b.val||''}"
              data-input-action="benef-id-field" data-id="${b.id}" data-field="val">
          </div>
        </div>
      </div>
      <button class="btn btn--ghost btn--icon btn--sm" data-action="del-benef-idiomas" data-id="${b.id}"
        aria-label="Eliminar beneficio">${icon('x')}</button>
    </div>`).join('');
  const total = SimuladorOFE.state.languages.benefits.reduce((s,b)=>s+(parseFloat(b.val)||0),0);
  const mat   = SimuladorOFE.state.languages.context.valorIdiomas||0;
  activarSeparadorMiles(container);
  const sub   = document.getElementById('benef-subtotal-id');
  if(sub) sub.textContent = total>0 ? 'Total descuentos: '+cop(total)+(mat>0?' ('+((total/mat)*100).toFixed(1)+'%)':'') : '';
}
function syncContadoId(from) {
  const mat = SimuladorOFE.state.languages.context.valorIdiomas||0;
  if(from==='pct'){
    const pct = Math.max(0,parseFloat(document.getElementById('id-cont-pct').value)||0);
    const val = mat>0 ? Math.round(mat*pct/100) : 0;
    const vEl = document.getElementById('id-cont-val');
    if(vEl) vEl.value = val||'';
  } else {
    const val = Math.max(0,parseFloat(document.getElementById('id-cont-val').value)||0);
    const pct = mat>0 ? Math.round((val/mat)*1000)/10 : 0;
    const pEl = document.getElementById('id-cont-pct');
    if(pEl) pEl.value = pct||'';
  }
  recalcId();
}
function recalcId() {
  const mat    = SimuladorOFE.state.languages.context.valorIdiomas||0;
  const benef  = SimuladorOFE.state.languages.benefits.reduce((s,b)=>s+(parseFloat(b.val)||0),0);
  const cont   = Math.max(0,parseFloat(document.getElementById('id-cont-val')?.value)||0);
  const fin    = Math.max(0, mat - benef - cont);
  const bp = document.getElementById('breakdown-id');
  if(!bp) return;
  bp.style.display = mat>0 ? 'block' : 'none';
  document.getElementById('bd-mat-id').textContent   = cop(mat);
  document.getElementById('bd-benef-id').textContent = benef>0 ? cop(benef)+(mat>0?' ('+((benef/mat)*100).toFixed(1)+'%)':'') : cop(0);
  document.getElementById('bd-cont-id').textContent  = cont>0  ? cop(cont) +(mat>0?' ('+((cont/mat)*100).toFixed(1)+'%)':'') : cop(0);
  const finPct = mat>0 ? ((fin/mat)*100).toFixed(1) : 0;
  document.getElementById('bd-fin-id').textContent   = cop(fin)+' ('+finPct+'% de idiomas)';
  // Update Mixto split check display
  const isMId = (SimuladorOFE.state.languages.context.tabId === 2);
  if(isMId) {
    const matId = SimuladorOFE.state.languages.context.valorIdiomas || 0;
    const pCP2 = parseFloat(document.getElementById('id-pctCP')?.value)||0;
    const pLP2 = parseFloat(document.getElementById('id-pctLP')?.value)||0;
    const benefId = SimuladorOFE.state.languages.benefits.reduce((s,b)=>s+(b.val||0),0);
    const contId  = Math.max(0,parseFloat(document.getElementById('id-cont-val')?.value)||0);
    const benefPctId = matId>0 ? Math.round((benefId/matId)*1000)/10 : 0;
    const contPctId  = matId>0 ? Math.round((contId/matId)*1000)/10  : 0;
    const total2 = pCP2+pLP2+benefPctId+contPctId;
    const chkEl = document.getElementById('id-split-check');
    if(chkEl) {
      chkEl.innerHTML = distribucionHTML(benefPctId, contPctId, pCP2, pLP2);
      chkEl.hidden = false;
    }
    const finCPId = matId*pCP2/100, finLPId = matId*pLP2/100;
    const lbl1 = document.getElementById('id-finCP-lbl');
    const lbl2 = document.getElementById('id-finLP-lbl');
    if(lbl1) lbl1.textContent = matId>0 ? cop(finCPId) : '';
    if(lbl2) lbl2.textContent = matId>0 ? cop(finLPId) : '';
  }
}

function abrirIdiomas(tabId) {
  const btn = document.getElementById('btn-idiomas-'+tabId);
  const valorIdiomas = parseFloat(btn.dataset.idiomas) || 0;
  const progNombre = btn.dataset.prog || '';
  SimuladorOFE.state.languages.context = {tabId, valorIdiomas, progNombre};

  document.getElementById('modal-val-idiomas').textContent = cop(valorIdiomas);
  document.getElementById('modal-prog-name').textContent = progNombre;
  const tabNames = {1:'Crédito Corto Plazo', 2:'Crédito Mixto', 3:'Banco Aliado'};
  document.getElementById('modal-tab-name').textContent = tabNames[tabId] || '';
  document.getElementById('res-idiomas').innerHTML = '';
  document.getElementById('modal-alert').hidden = true;

  // ── Inherit ALL conditions from parent tab ──────────────────────
  // Always reset beneficios idiomas first
  SimuladorOFE.state.languages.benefits.splice(0, SimuladorOFE.state.languages.benefits.length);  // fully empty the array

  if(tabId === 1) {
    // Inherit tasa, meses, contado, beneficios from Tab1
    const tasa1 = parseFloat(document.getElementById('tasa1').value)||1.5;
    const meses1 = parseInt(document.getElementById('plazo1').value)||6;
    document.getElementById('id-tasa').value = tasa1.toFixed(2);
    document.getElementById('id-meses').value = meses1;
    // Inherit contado
    const cont1pct = parseFloat(document.getElementById('cont1-pct').value)||0;
    document.getElementById('id-cont-pct').value = cont1pct || '';
    document.getElementById('id-cont-val').value  = cont1pct > 0 ? Math.round(valorIdiomas * cont1pct / 100) : '';
    // Inherit beneficios (copy from tab1, scaled to idiomas value)
    SimuladorOFE.state.financing.benefits[1].forEach(b => {
      SimuladorOFE.state.languages.benefits.push({id: Date.now()*1000+SimuladorOFE.state.languages.benefits.length, nombre: b.nombre,
        pct: b.pct, val: Math.round(valorIdiomas * b.pct / 100)});
    });

  } else if(tabId === 2) {
    // Tab2 Mixto: inherit tasa, CP meses, contado, beneficios
    const tasa2 = parseFloat(document.getElementById('tasa2').value)||1.5;
    const mesesCP = parseInt(document.getElementById('plazoCP').value)||6;
    document.getElementById('id-tasa').value  = tasa2.toFixed(2);
    document.getElementById('id-meses').value = mesesCP;
    // Inherit contado
    const cont2pct = parseFloat(document.getElementById('cont2-pct').value)||0;
    document.getElementById('id-cont-pct').value = cont2pct || '';
    document.getElementById('id-cont-val').value  = cont2pct > 0 ? Math.round(valorIdiomas * cont2pct / 100) : '';
    // Inherit beneficios scaled to idiomas value
    SimuladorOFE.state.financing.benefits[2].forEach(b => {
      SimuladorOFE.state.languages.benefits.push({id: Date.now()*1000+SimuladorOFE.state.languages.benefits.length, nombre: b.nombre,
        pct: b.pct, val: Math.round(valorIdiomas * b.pct / 100)});
    });
    // Store CP/LP split for combined display
    SimuladorOFE.state.languages.context.pctCP  = parseFloat(document.getElementById('pctCP').value)||40;
    SimuladorOFE.state.languages.context.pctLP  = parseFloat(document.getElementById('pctLP').value)||60;
    SimuladorOFE.state.languages.context.mesesCP = parseInt(document.getElementById('plazoCP').value)||6;
    SimuladorOFE.state.languages.context.semLP   = parseInt(document.getElementById('plazoLP').value)||8;  // semestres
    SimuladorOFE.state.languages.context.mesesLP = Math.round(SimuladorOFE.state.languages.context.semLP * 6 * 1.5);  // auto-calculated payoff months

  } else if(tabId === 3) {
    const tasa3 = parseFloat(document.getElementById('tasa3').value)||1.5;
    const meses3 = parseInt(document.getElementById('plazo3').value)||12;
    document.getElementById('id-tasa').value  = tasa3.toFixed(2);
    document.getElementById('id-meses').value = meses3;
    const cont3pct = parseFloat(document.getElementById('cont3-pct').value)||0;
    document.getElementById('id-cont-pct').value = cont3pct || '';
    document.getElementById('id-cont-val').value  = cont3pct > 0 ? Math.round(valorIdiomas * cont3pct / 100) : '';
    SimuladorOFE.state.financing.benefits[3].forEach(b => {
      SimuladorOFE.state.languages.benefits.push({id: Date.now()*1000+SimuladorOFE.state.languages.benefits.length, nombre: b.nombre,
        pct: b.pct, val: Math.round(valorIdiomas * b.pct / 100)});
    });
  } else {
    document.getElementById('id-cont-pct').value = 0;
    document.getElementById('id-cont-val').value = '';
  }

  renderBenefId();
  calcTaIdiomas();

  // Show/hide Mixto-specific fields
  const isM = (tabId === 2);
  document.getElementById('id-mixto-block').style.display   = isM ? 'block' : 'none';
  document.getElementById('id-mesesLP-block').style.display = isM ? 'block' : 'none';
  if(isM) {
    document.getElementById('id-pctCP').value  = SimuladorOFE.state.languages.context.pctCP  || 40;
    document.getElementById('id-pctLP').value  = SimuladorOFE.state.languages.context.pctLP  || 60;
    document.getElementById('id-meses').value  = SimuladorOFE.state.languages.context.mesesCP || 6;
    document.getElementById('id-mesesLP').value= SimuladorOFE.state.languages.context.semLP || 8;  // semestres
    calcLPAutoId();  // refresca plazo + nota de semestres financiados heredados
    const label = document.getElementById('id-meses-label');
    const hint  = document.getElementById('id-meses-hint');
    if(label) label.childNodes[0].nodeValue = 'Meses Corto Plazo ';
    if(hint)  hint.textContent = '(mientras estudia)';
  } else {
    const label = document.getElementById('id-meses-label');
    const hint  = document.getElementById('id-meses-hint');
    if(label) label.childNodes[0].nodeValue = 'Número de Meses ';
    if(hint)  hint.textContent = '';
  }

  activarSeparadorMiles(document.getElementById('modal-idiomas'));
  recalcId();
  SimuladorOFE.services['core-ui'].abrirModal(document.getElementById('modal-idiomas'), '[data-action="cerrar-idiomas"]');
}

function cerrarIdiomas() {
  SimuladorOFE.services['core-ui'].cerrarModal(document.getElementById('modal-idiomas'));
}

function calcTaIdiomas() {
  const tm = parseFloat(document.getElementById('id-tasa').value)/100;
  if(!isNaN(tm)) document.getElementById('id-ta').textContent = ((Math.pow(1+tm,12)-1)*100).toFixed(2)+'%';
}

function calcularIdiomas() {
  const mat   = SimuladorOFE.state.languages.context.valorIdiomas;
  const tabId = SimuladorOFE.state.languages.context.tabId;
  const benef = SimuladorOFE.state.languages.benefits.reduce((s,b)=>s+(parseFloat(b.val)||0),0);
  const cont  = Math.max(0,parseFloat(document.getElementById('id-cont-val')?.value)||0);
  const tm    = parseFloat(document.getElementById('id-tasa').value)/100;
  const n     = parseInt(document.getElementById('id-meses').value)||0;

  const alertEl = document.getElementById('modal-alert');
  const showErr = msg => { alertEl.innerHTML = '<span class=\"note__icon\">'+icon('alert-triangle')+'</span><div>'+msg+'</div>'; alertEl.hidden = false; setTimeout(()=>{alertEl.hidden = true;},4000); };

  if(!mat||mat<=0) return showErr('Este programa no tiene valor de idiomas registrado.');
  if(!n||n<=0)    return showErr('Ingresa el número de meses.');
  if(isNaN(tm))   return showErr('Ingresa la tasa de interés.');
  if(benef > mat) return showErr('Los beneficios superan el valor de idiomas.');
  const matNeta = mat - benef;
  if(cont > matNeta) return showErr('El pago de contado supera el valor neto de idiomas.');

  const financiado = Math.max(0, matNeta - cont);
  if(financiado <= 0) return showErr('El monto financiado es cero. Revisa beneficios y pago de contado.');

  const garantisa    = financiado * GARANTISA_CP;
  const cuotaInicial = cont;
  const pagoInicial  = cuotaInicial + garantisa;

  // ── Tab2 Mixto: CP/LP % are of mat (valor idiomas), same logic as pregrado ──
  let isMixto = (tabId === 2);
  // Read from modal inputs (user can edit after inheriting)
  let pctCP   = parseFloat(document.getElementById('id-pctCP')?.value)  || SimuladorOFE.state.languages.context.pctCP  || 40;
  let pctLP   = parseFloat(document.getElementById('id-pctLP')?.value)  || SimuladorOFE.state.languages.context.pctLP  || 60;
  let mesesLP = parseInt(document.getElementById('id-mesesLP')?.value)  || SimuladorOFE.state.languages.context.mesesLP || 9;
  let finCP, finLP, garCP, garLP, idCP, idLP, cuota, totInt, totCap, rows, totalCredito;

  if(isMixto) {
    // pctCP and pctLP are % of mat (valor idiomas total)
    finCP = mat * pctCP / 100;
    finLP = mat * pctLP / 100;
    garCP = finCP * GARANTISA_CP;   // 4.17% — pago mientras estudia
    garLP = finLP * GARANTISA_LP;   // 2.86% — pago al graduarse
    // Override garantisa to sum of both tramos
    const garantisaMixto = garCP + garLP;
    // pagoInicial already calculated above — recalculate with separate garantisa
    const pagoInicialMixto = cuotaInicial + garantisaMixto;
    // CP: normal amortization
    idCP = amortizacion(finCP, tm, n);
    // LP: NO amortization — rate unknown at simulation time
    const semLPId = parseInt(document.getElementById('id-mesesLP')?.value)||8;
    const sfId    = getSemFinanciados();               // hereda inicio del Mixto
    const semFinId = Math.max(1, Math.min(sfId.financiados, semLPId));
    const nLPpago = Math.round(semFinId * 6 * 1.5);    // 1.5 × sem. financiados × 6
    idLP = { capital: finLP, nPago: nLPpago, semLP: semLPId, noAmortize: true,
             cuota: null, totInt: 0, totCap: finLP, rows: [] };
    cuota  = idCP.cuota;     // LP cuota is unknown
    totInt = idCP.totInt;    // LP interest: 0 at sim time
    totCap = idCP.totCap + finLP;
    rows   = idCP.rows;
    // LP capital included in total, but NO interest (future rate)
    totalCredito = (idCP.totCap + idCP.totInt) + finLP;
    Object.assign(SimuladorOFE.state.languages.context, {pctCP, pctLP, mesesCP: n, mesesLP: nLPpago, semLP: semLPId});
    const _pagoInicialId = pagoInicialMixto;
    const _totalGeneralId = _pagoInicialId + totalCredito;

    // ── Build results for Mixto ──────────────────────────────────
    const splitCheck = pctCP + pctLP;
    const splitOk = Math.abs(splitCheck - (1 - (benef/mat) - (cont/mat))*100) < 2;

    SimuladorOFE.state.results.languages = {rows,cuota,totInt,totCap,financiado: finCP+finLP, mat,n,tm,
      cuotaInicial,garantisa:garantisaMixto,garCP,garLP,finCP,finLP,
      pagoInicial:_pagoInicialId,totalCredito,totalGeneral:_totalGeneralId,
      progNombre:SimuladorOFE.state.languages.context.progNombre,beneficios:benef,isMixto,
      idCP,idLP,pctCP,pctLP,mesesLP:nLPpago,semLP:semLPId,semFin:semFinId};

    // ── Proyección multi-semestre de la porción LP de IDIOMAS ──
    let _proyIdiomasHtml = '';
    const verProyId = document.getElementById('id-proyLP')?.checked;
    if(verProyId && pctLP > 0 && semFinId > 0) {
      const ipcPctId = parseFloat(document.getElementById('id-ipcLP')?.value);
      const ipcId = (isNaN(ipcPctId) ? 5 : ipcPctId) / 100;
      const inicioId = Math.max(1, semLPId - semFinId + 1);
      const proyId = proyectarLP(mat, pctLP, inicioId, semLPId, ipcId);
      SimuladorOFE.state.results.projectionLanguagesLP = {...proyId, pctLP, ipcPct:(isNaN(ipcPctId)?5:ipcPctId), etiqueta:'Idiomas'};
      _proyIdiomasHtml = renderProyeccionLP(proyId, pctLP, (isNaN(ipcPctId)?5:ipcPctId), 'Idiomas');
    } else {
      SimuladorOFE.state.results.projectionLanguagesLP = null;
    }

    document.getElementById('res-idiomas').innerHTML = `
    <div class="section-divider-top">
      ${fechaBadgeHtml()}
      <div class="section__title u-mt-5 u-mt-0 u-text-danger">${icon('credit-card')} Pago Inicial — Idiomas Mixto</div>
      <div class="kpi-grid">
        <div class="kpi"><span class="kpi__label">Valor Idiomas</span><div class="kpi__value kpi__value--md">${cop(mat)}</div></div>
        <div class="kpi"><span class="kpi__label">Financiado CP + LP</span><div class="kpi__value kpi__value--md">${cop(finCP+finLP)}</div></div>
        <div class="kpi"><span class="kpi__label">Pago de Contado</span><div class="kpi__value kpi__value--md">${cop(cuotaInicial)}</div></div>
        <div class="kpi kpi--warning"><span class="kpi__label">${icon('shield')} Garantisa CP (4.17%)</span><div class="kpi__value kpi__value--md">${cop(garCP)}</div></div>
        <div class="kpi kpi--warning"><span class="kpi__label">${icon('shield')} Garantisa LP (2.86%)</span><div class="kpi__value kpi__value--md">${cop(garLP)}</div></div>
        <div class="kpi kpi--warning u-col-span-all"><span class="kpi__label">Total Pago Inicial</span><div class="kpi__value kpi__value--md">${cop(_pagoInicialId)}</div></div>
      </div>

      <div class="tramo tramo--cp"><span>${icon('circle-dot')} CP Idiomas — ${pctCP.toFixed(1)}% · ${cop(finCP)} · ${n} meses (mientras estudia)</span></div>
      <div class="kpi-grid">
        <div class="kpi kpi--success"><span class="kpi__label">Cuota Mensual CP</span><div class="kpi__value kpi__value--md">${cop(idCP.cuota)}</div></div>
        <div class="kpi"><span class="kpi__label">Intereses CP</span><div class="kpi__value kpi__value--md">${cop(idCP.totInt)}</div></div>
        <div class="kpi u-col-span-all"><span class="kpi__label">Total Crédito CP Idiomas</span><div class="kpi__value kpi__value--md">${cop(idCP.totCap+idCP.totInt)}</div></div>
      </div>
      <div class="section__title u-mt-5">Tabla CP Idiomas (${n} meses)</div>
      ${renderTabla(idCP.rows, idCP.cuota, idCP.totInt, idCP.totCap)}

      <div class="tramo tramo--lp u-mt-16"><span>${icon('circle-dot')} LP Idiomas — ${pctLP.toFixed(1)}% · ${cop(finLP)}</span></div>
      <div class="kpi-grid">
        <div class="kpi"><span class="kpi__label">Capital LP Idiomas</span><div class="kpi__value kpi__value--md">${cop(finLP)}</div></div>
        <div class="kpi"><span class="kpi__label">Semestres Financiados</span><div class="kpi__value kpi__value--md">${semFinId} de ${semLPId}</div></div>
        <div class="kpi"><span class="kpi__label">Período de Gracia</span><div class="kpi__value kpi__value--md">12 meses</div></div>
        <div class="kpi"><span class="kpi__label">Plazo Estimado de Pago</span><div class="kpi__value kpi__value--md">${nLPpago} meses</div></div>
      </div>
      <div class="callout callout--success u-my-10">
        <strong class="u-text-success u-block u-mb-6">${icon('info')} Crédito LP Idiomas — Tasa Futura</strong>
        La cuota definitiva del crédito de largo plazo de idiomas no puede determinarse actualmente,
        ya que la tasa de interés será la vigente al momento de iniciar la amortización.
        Durante el período de gracia de un (1) año se causarán intereses conforme a las condiciones vigentes en esa fecha.<br><br>
        <strong>Cronograma:</strong> ${icon('book-open')} ${semFinId*6} m. financiados · ${icon('clock')} 12 m. gracia · ${icon('credit-card')} ${nLPpago} m. amortización
      </div>

      ${_proyIdiomasHtml}

      <div class="total-banner u-mt-16">
        <div><div class="tl">Pago Inicial</div><div class="tv">${cop(_pagoInicialId)}</div><div class="ts">Contado + Garantisa</div></div>
        <div class="total-banner__op" aria-hidden="true">+</div>
        <div><div class="tl">Crédito CP (con intereses)</div><div class="tv">${cop(idCP.totCap+idCP.totInt)}</div></div>
        <div class="total-banner__op" aria-hidden="true">+</div>
        <div class="u-text-right"><div class="tl">Capital LP (sin intereses)</div><div class="tv">${cop(finLP)}</div><div class="ts">*tasa futura</div></div>
      </div>
      <div class="micro-note micro-note--success u-mt-6">
        * El costo total definitivo del LP idiomas se determinará al iniciar amortización, según tasa vigente.
      </div>

      <div class="btn-row u-mt-16">
        <button class="btn btn--sm" data-action="pdf-idiomas">${icon('file-text')} PDF Idiomas</button>
        <button class="btn btn--sm" data-action="xls-idiomas">${icon('bar-chart')} Excel Idiomas</button>
        <button class="btn btn--sm" data-action="pdf-combinado">${icon('files')} PDF Combinado (Pregrado + Idiomas)</button>
      </div>
    </div>`;
    return; // Mixto rendering done — exit early
  } else {
    SimuladorOFE.state.results.projectionLanguagesLP = null;
    const res = amortizacion(financiado, tm, n);
    rows = res.rows; cuota = res.cuota; totInt = res.totInt; totCap = res.totCap;
    totalCredito = totCap + totInt;
  }

  const totalGeneral = pagoInicial + totalCredito;

  // Retrieve main tab totals for combined scenario
  let mainPagoInicial = 0, mainTotalCredito = 0, mainCuotaMensual = 0, mainLabel = '';
  if(tabId===1 && SimuladorOFE.state.results.shortTerm) {
    mainPagoInicial = SimuladorOFE.state.results.shortTerm.pagoInicial||0;
    mainTotalCredito = (SimuladorOFE.state.results.shortTerm.totCap||0)+(SimuladorOFE.state.results.shortTerm.totInt||0);
    mainCuotaMensual = SimuladorOFE.state.results.shortTerm.cuota||0;
    mainLabel = 'Crédito Corto Plazo';
  } else if(tabId===2 && SimuladorOFE.state.results.mixed) {
    mainPagoInicial = SimuladorOFE.state.results.mixed.pagoInicial||0;
    mainTotalCredito = (SimuladorOFE.state.results.mixed.CP?(SimuladorOFE.state.results.mixed.CP.totCap+SimuladorOFE.state.results.mixed.CP.totInt):0)+(SimuladorOFE.state.results.mixed.LP?(SimuladorOFE.state.results.mixed.LP.noAmortize?SimuladorOFE.state.results.mixed.LP.capital:(SimuladorOFE.state.results.mixed.LP.totCap+SimuladorOFE.state.results.mixed.LP.totInt)):0);
    mainCuotaMensual = (SimuladorOFE.state.results.mixed.CP?SimuladorOFE.state.results.mixed.CP.cuota:0);  // LP cuota unknown
    mainLabel = 'Crédito Mixto (CP+LP)';
  } else if(tabId===7 && SimuladorOFE.state.results.initialPayment) {
    entry = {tabId, fecha, prog:SimuladorOFE.state.results.initialPayment.progNombre||'Programa', tipo:tabNames[7],
      resumen:'capacidad '+cop(SimuladorOFE.state.results.initialPayment.cap)+'/mes · '+SimuladorOFE.state.results.initialPayment.n+' cuotas · '+(SimuladorOFE.state.results.initialPayment.tm*100).toFixed(2)+'%',
      cuota:SimuladorOFE.state.results.initialPayment.cuota, total:SimuladorOFE.state.results.initialPayment.costoTotal,
      snap:JSON.parse(JSON.stringify(SimuladorOFE.state.results.initialPayment))};
  } else if(tabId===3 && SimuladorOFE.state.results.bank) {
    mainPagoInicial = SimuladorOFE.state.results.bank.pagoInicial||0;
    mainTotalCredito = (SimuladorOFE.state.results.bank.totCap||0)+(SimuladorOFE.state.results.bank.totInt||0);
    mainCuotaMensual = SimuladorOFE.state.results.bank.cuota||0;
    mainLabel = 'Crédito Banco Aliado';
  }

  const hasMain = mainTotalCredito > 0;
  const combinedPagoInicial = mainPagoInicial + pagoInicial;
  const combinedTotal = mainTotalCredito + totalGeneral;

  document.getElementById('res-idiomas').innerHTML = `
    <div class="section-divider-top">
      ${fechaBadgeHtml()}
      <div class="section__title u-mt-5 u-mt-0 u-text-danger">${icon('credit-card')} Pago Inicial — Idiomas</div>
      <div class="kpi-grid">
        <div class="kpi"><span class="kpi__label">Cuota Inicial Contado</span><div class="kpi__value kpi__value--md">${cop(cuotaInicial)}</div></div>
        <div class="kpi kpi--warning"><span class="kpi__label">${icon('shield')} Garantisa (4.17%)</span><div class="kpi__value kpi__value--md">${cop(garantisa)}</div></div>
        <div class="kpi kpi--warning u-col-span-all"><span class="kpi__label">Total Pago Inicial Idiomas</span><div class="kpi__value kpi__value--md">${cop(pagoInicial)}</div></div>
      </div>
      <div class="section__title u-mt-5">${icon('calendar')} Crédito Idiomas</div>
      <div class="kpi-grid">
        <div class="kpi"><span class="kpi__label">Valor Idiomas</span><div class="kpi__value kpi__value--md">${cop(mat)}</div></div>
        <div class="kpi"><span class="kpi__label">Monto Financiado</span><div class="kpi__value kpi__value--md">${cop(financiado)}</div></div>
        ${isMixto ? `
          <div class="kpi"><span class="kpi__label"> Cuota Mensual CP</span><div class="kpi__value kpi__value--md">${cop(idCP.cuota)}</div></div>
          <div class="kpi"><span class="kpi__label"> Cuota Mensual LP</span><div class="kpi__value kpi__value--md">${cop(idLP.cuota)}</div></div>
        ` : `
          <div class="kpi kpi--success"><span class="kpi__label">Cuota Mensual</span><div class="kpi__value kpi__value--md">${cop(cuota)}</div></div>
          <div class="kpi"><span class="kpi__label">Total Intereses</span><div class="kpi__value kpi__value--md">${cop(totInt)}</div></div>
        `}
        <div class="kpi kpi--accent u-col-span-all"><span class="kpi__label">Total Crédito Idiomas</span><div class="kpi__value kpi__value--md">${cop(totalCredito)}</div></div>
      </div>

      ${isMixto ? `
        <div class="section__title u-mt-5"> Tabla CP Idiomas (${n} meses · ${cop(finCP)})</div>
        ${renderTabla(idCP.rows, idCP.cuota, idCP.totInt, idCP.totCap)}
        <div class="section__title u-mt-5"> Tabla LP Idiomas (${mesesLP} meses · ${cop(finLP)})</div>
        ${renderTabla(idLP.rows, idLP.cuota, idLP.totInt, idLP.totCap)}
      ` : `
        <div class="section__title u-mt-5">Tabla de Amortización Idiomas (${n} meses)</div>
        ${renderTabla(rows, cuota, totInt, totCap)}
      `}

      ${hasMain ? `
      <div class="highlight-panel u-mt-24">
        <div class="eyebrow eyebrow--accent eyebrow--spaced u-mb-14"> Escenario Combinado — ${mainLabel} + Idiomas</div>
        <div class="kpi-grid">
          <div class="kpi"><span class="kpi__label">Pago Inicial (pregrado)</span><div class="kpi__value kpi__value--md">${cop(mainPagoInicial)}</div></div>
          <div class="kpi"><span class="kpi__label">Pago Inicial (idiomas)</span><div class="kpi__value kpi__value--md">${cop(pagoInicial)}</div></div>
          <div class="kpi kpi--warning u-col-span-all"><span class="kpi__label">Total Pago Inicial Combinado</span><div class="kpi__value kpi__value--md">${cop(combinedPagoInicial)}</div></div>
          <div class="kpi"><span class="kpi__label">Cuota Mensual Pregrado</span><div class="kpi__value kpi__value--md">${cop(mainCuotaMensual)}</div></div>
          <div class="kpi kpi--success"><span class="kpi__label">Cuota Mensual Idiomas</span><div class="kpi__value kpi__value--md">${cop(cuota)}</div></div>
          <div class="kpi kpi--accent u-col-span-all"><span class="kpi__label">Cuota Mensual Total Combinada</span><div class="kpi__value kpi__value--md">${cop(mainCuotaMensual+cuota)}</div></div>
        </div>
        <div class="total-banner u-mt-14 u-mb-0">
          <div><div class="tl">Costo Pregrado</div><div class="tv">${cop(mainPagoInicial+mainTotalCredito)}</div></div>
          <div class="total-banner__op" aria-hidden="true">+</div>
          <div><div class="tl">Costo Idiomas</div><div class="tv">${cop(totalGeneral)}</div></div>
          <div class="total-banner__op" aria-hidden="true">=</div>
          <div class="u-text-right"><div class="tl">Costo Total Semestre</div><div class="tv">${cop(combinedPagoInicial+mainTotalCredito+totalCredito)}</div></div>
        </div>
      </div>` : `
      <div class="callout callout--danger u-mt-16">
         <strong>Consejo:</strong> Primero calcula el crédito de pregrado en la pestaña correspondiente para ver el escenario combinado aquí.
      </div>`}

      <div class="btn-row u-mt-16">
        <button class="btn btn--sm" data-action="pdf-idiomas">${icon('file-text')} PDF Idiomas</button>
        <button class="btn btn--sm" data-action="xls-idiomas">${icon('bar-chart')} Excel Idiomas</button>
        <button class="btn btn--sm" data-action="pdf-combinado">${icon('files')} PDF Combinado (Pregrado + Idiomas)</button>
      </div>
    </div>
  `;

  SimuladorOFE.state.results.languages = {rows,cuota,totInt,totCap,financiado,mat,n,tm,cuotaInicial,garantisa,pagoInicial,totalCredito,totalGeneral,progNombre:SimuladorOFE.state.languages.context.progNombre,beneficios:benef,isMixto,idCP:isMixto?idCP:null,idLP:isMixto?idLP:null};
}

function expPDFIdiomas(){
  const d = SimuladorOFE.state.results.languages;
  if(!d) return toast('Primero calcula el credito de idiomas','warning');
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  const pct = Math.round((d.financiado/d.mat)*100);
  const filename = (d.progNombre + ' - Idiomas').replace(/[^a-zA-Z0-9\-_ ]/g,'').trim();
  const tea = ((Math.pow(1 + d.tm, 12) - 1) * 100).toFixed(2) + '% E.A.';
  let y = pdfHeader(doc, 'Credito de Idiomas', (d.progNombre||'') + ' - ' + pct + '% financiado');

  y = pdfHeroBand(doc, y, {
    eyebrow: 'Credito de idiomas',
    label: d.isMixto ? 'Cuota estimada del tramo corto plazo' : 'Cuota mensual estimada',
    value: cop(d.isMixto && d.idCP ? d.idCP.cuota : d.cuota),
    meta: d.isMixto ? `Esquema mixto · ${(d.tm*100).toFixed(2)}% M.V. · ${tea}` : `${d.n} cuotas mensuales · ${(d.tm*100).toFixed(2)}% M.V. · ${tea}`,
    note: d.isMixto ? 'El tramo LP de idiomas se resume como capital, ya que su cuota se define al iniciar amortizacion.' : 'Resumen ejecutivo del credito de idiomas.',
    tone: 'info'
  });
  y = pdfMetricCards(doc, y, [
    {label:'Valor idiomas', value: cop(d.mat)},
    {label:'Pago inicial', value: cop(d.pagoInicial)},
    {label:'Monto financiado', value: cop(d.financiado)},
    {label:'Costo total', value: cop(d.totalGeneral)}
  ], {columns:4, tone:'info'});

  y = pdfSectionLabel(doc, y, 'Desembolso al inicio', 'Conceptos que deben pagarse al momento del desembolso.', 'warning');
  y = pdfMetricCards(doc, y, [
    {label:'Pago de contado', value: cop(d.cuotaInicial)},
    d.isMixto && d.garCP ? {label:'Garantisa CP', value: cop(d.garCP), hint:'4.17%'} : null,
    d.isMixto && d.garLP ? {label:'Garantisa LP', value: cop(d.garLP), hint:'2.86%'} : null,
    !d.isMixto ? {label:'Garantisa', value: cop(d.garantisa), hint:'4.17% sobre el monto financiado'} : null,
    {label:'Total a pagar hoy', value: cop(d.pagoInicial)}
  ], {columns:2, tone:'warning'});

  if(d.isMixto && d.idCP) {
    y = pdfSectionLabel(doc, y, 'Estructura del credito idiomas', 'Se separa entre corto plazo e idioma LP.', 'accent');
    y = pdfMetricCards(doc, y, [
      {label:'Monto CP idiomas', value: cop(d.finCP), hint:`${d.n} cuotas`},
      {label:'Total CP idiomas', value: cop(d.idCP.totCap + d.idCP.totInt), hint:`Incluye ${cop(d.idCP.totInt)} en intereses`},
      {label:'Capital LP idiomas', value: cop(d.finLP), hint:`Plazo estimado ${d.mesesLP || (d.idLP && d.idLP.nPago) || 72} cuotas`},
      {label:'Periodo de gracia', value:'12 meses', hint:'Posterior al grado'}
    ], {columns:2, tone:'accent'});
    y = pdfCallout(doc, y, 'Importante sobre el tramo LP de idiomas', 'La tasa del largo plazo se definira al momento de iniciar su amortizacion. Por eso el PDF presenta el capital proyectado y no una cuota definitiva.', 'success');
  } else {
    y = pdfSectionLabel(doc, y, 'Credito a amortizar', 'Condiciones del credito de idiomas en corto plazo.', 'accent');
    y = pdfMetricCards(doc, y, [
      {label:'Monto financiado', value: cop(d.financiado)},
      {label:'Total intereses', value: cop(d.totInt)},
      {label:'Plazo', value: `${d.n} cuotas mensuales`},
      {label:'Total credito', value: cop(d.totalCredito)}
    ], {columns:2, tone:'accent'});
  }

  doc.addPage();
  y = 22;
  const filas = (d.isMixto && d.idCP) ? d.idCP.rows : d.rows;
  const tc = (d.isMixto && d.idCP) ? d.idCP.totCap : d.totCap;
  const ti = (d.isMixto && d.idCP) ? d.idCP.totInt : d.totInt;
  y = pdfSectionLabel(doc, y, 'Plan de pagos', d.isMixto ? `Cronograma del tramo CP de idiomas (${d.n} cuotas).` : `Cronograma de idiomas (${d.n} cuotas).`, 'accent');
  y = pdfTablaAmort(doc, y, filas, tc, ti, d.isMixto ? 'CRONOGRAMA CP IDIOMAS' : 'CRONOGRAMA IDIOMAS');
  y = pdfProyeccionLP(doc, y, SimuladorOFE.state.results.projectionLanguagesLP, 'Idiomas');
  pdfPie(doc);
  doc.save(safePDF(filename) + '.pdf');
  toast('PDF descargado', 'success');
}

function expXLSIdiomas(){
  const d=SimuladorOFE.state.results.languages; if(!d)return;
  const pctLabel = Math.round((d.financiado/d.mat)*100)+'%';
  const filename = (d.progNombre+' - Idiomas '+pctLabel).replace(/[^a-zA-Z0-9\-_ áéíóúÁÉÍÓÚñÑ]/g,'').trim();
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet([
    ['Crédito Idiomas — '+d.progNombre],[''],
    ['Valor Idiomas',Math.round(d.mat)],[''],
    ['--- PAGO INICIAL ---'],
    ['Cuota Inicial Contado',Math.round(d.cuotaInicial)],
    ['Garantisa (4.17% s/financiado)',Math.round(d.garantisa)],
    ['Total Pago Inicial',Math.round(d.pagoInicial)],[''],
    ['--- CRÉDITO ---'],
    ['Monto Financiado',Math.round(d.financiado)],
    ['Cuota Mensual',Math.round(d.cuota)],
    ['Total Intereses',Math.round(d.totInt)],
    ['Total Crédito',Math.round(d.totalCredito)],
    ['COSTO TOTAL IDIOMAS',Math.round(d.totalGeneral)],[''],
    ['Cuota','Cuota Mensual','Capital','Interés','Saldo'],
    ...d.rows.map(r=>[r.i,Math.round(r.cuota),Math.round(r.capital),Math.round(r.interes),Math.round(r.saldo)])
  ]);
  XLSX.utils.book_append_sheet(wb,ws,'Idiomas');
  XLSX.writeFile(wb,filename+'.xlsx');
  toast('Excel descargado', 'success');
}

// El clic sobre el backdrop se resuelve mediante delegación centralizada de data-action.


// ── CONVERSOR DE TASAS ───────────────────────────────────────────────────────
const TC_PERIODOS = {
  d:  {label:'Diaria',      n:365},
  s:  {label:'Semanal',     n:52},
  q:  {label:'Quincenal',   n:24},
  m:  {label:'Mensual',     n:12},
  b:  {label:'Bimestral',   n:6},
  t:  {label:'Trimestral',  n:4},
  c:  {label:'Cuatrimestral',n:3},
  sm: {label:'Semestral',   n:2},
  a:  {label:'Anual',       n:1},
};



function setTipoEq(tipo) {
  languagesState.equivalentRateType = tipo;
  _pressed(document.getElementById('tc-ev'), tipo==='efectiva');
  _pressed(document.getElementById('tc-nom'), tipo==='nominal');
  document.getElementById('tc-nom-per-wrap').style.display = tipo==='nominal' ? 'block' : 'none';
  convertirTasas();
}

function convertirTasas() {
  const valorInput = parseFloat(document.getElementById('tc-valor').value);
  const periodoOrigen = document.getElementById('tc-periodo').value;
  if(isNaN(valorInput) || valorInput < 0) {
    document.getElementById('tc-tabla').innerHTML = '<p class="empty-state empty-state--compact">Ingresa una tasa válida.</p>';
    return;
  }

  const i_input = valorInput / 100;
  const n_origen = TC_PERIODOS[periodoOrigen].n; // períodos por año del origen

  // Convert input rate to Effective Annual Rate (EAR) first
  let ear;
  if(languagesState.equivalentRateType === 'efectiva') {
    // Effective rate of period → EAR
    ear = Math.pow(1 + i_input, n_origen) - 1;
  } else {
    // Nominal rate with capitalization
    const capPer = document.getElementById('tc-nom-per').value;
    const m = TC_PERIODOS[capPer].n; // capitalizations per year
    const i_per_cap = i_input / (n_origen / m); // rate per capitalization period... 
    // Actually: nominal rate j with m caps/year → EAR = (1 + j/m)^m - 1
    // Here j is the nominal rate given in the origin period, so annual nominal = i_input * n_origen
    const j_annual = i_input * n_origen;
    ear = Math.pow(1 + j_annual / m, m) - 1;
  }

  // Now compute all equivalences from EAR
  const results = [];
  Object.entries(TC_PERIODOS).forEach(([key, {label, n}]) => {
    // Effective rate for this period
    const i_ef = Math.pow(1 + ear, 1/n) - 1;
    // Nominal rate for this period (compounded monthly as reference)
    // j = n * [(1+ear)^(1/n) - 1]  → that's just n * i_ef
    const i_nom = n * i_ef; // nominal annual converted to this period = i_nom/n... 
    // More useful: show nominal annual rate that corresponds
    const nom_anual = n * i_ef * 100; // nominal annual %
    results.push({key, label, n, i_ef, nom_anual, isOrigen: key === periodoOrigen});
  });

  // Build table
  const fmt = v => (v * 100).toFixed(6).replace(/\.?0+$/, '') + '%';
  const fmtN = v => v.toFixed(4).replace(/\.?0+$/, '') + '%';

  let html = `<div class="rate-result" role="status" aria-live="polite">
    <div class="rate-result__block"><span>Tasa de entrada</span><strong>${valorInput.toFixed(4)}% ${TC_PERIODOS[periodoOrigen].label}</strong></div>
    <div class="rate-result__arrow">${icon('arrow-right')}</div>
    <div class="rate-result__block"><span>Tasa efectiva anual equivalente</span><strong>${(ear*100).toFixed(4)}%</strong></div>
  </div>
  <div class="rate-explainer">Esta equivalencia permite comparar tasas expresadas en períodos distintos sobre una misma base. La tabla muestra las demás periodicidades relacionadas.</div>
  <div class="table-wrap u-mt-4"><table class="tbl">
    <thead><tr>
      <th class="u-text-left">Período</th>
      <th>Períodos/Año</th>
      <th>Tasa Efectiva</th>
      <th>Nominal Anual</th>
    </tr></thead><tbody>`;

  results.forEach(r => {
    const highlight = r.isOrigen ? 'background:var(--info-soft);font-weight:700;' : '';
    const badge = r.isOrigen ? ' <span class="badge-inline badge-inline--info">ORIGEN</span>' : '';
    html += `<tr style="${highlight}">
      <td style="text-align:left;font-family:'Inter',sans-serif;font-weight:${r.isOrigen?'700':'500'};color:${r.isOrigen?'var(--info)':'var(--text)'};">${r.label}${badge}</td>
      <td class="u-text-center">${r.n}</td>
      <td style="color:${r.isOrigen?'var(--info)':'inherit'};">${fmt(r.i_ef)}</td>
      <td class="u-muted">${fmtN(r.nom_anual)}</td>
    </tr>`;
  });

  html += `</tbody></table></div>`;

  document.getElementById('tc-tabla').innerHTML = html;
}


// ── DATE HELPER ──────────────────────────────────────────────────────────────
function fechaSimulacion() {
  const now = new Date();
  return now.toLocaleDateString('es-CO', {day:'2-digit',month:'long',year:'numeric'}) +
         ' ' + now.toLocaleTimeString('es-CO', {hour:'2-digit',minute:'2-digit'});
}
function fechaBadgeHtml() {
  return `<div class="gen-date">${icon('calendar')} Simulación generada el ${fechaSimulacion()}</div>`;
}

// ── Bloque de proyección LP reutilizable para PDFs ──────────────────────────
function pdfProyeccionLP(doc, y, pr, etiqueta) {
  if(!pr || !pr.filas || !pr.filas.length) return y;
  if(y > 165) { doc.addPage(); y = 20; }
  y = pdfSectionBar(doc,'PROYECCION DE LA FINANCIACION - '+(etiqueta||'LARGO PLAZO').toUpperCase(),y,[61,107,74]);
  doc.setFont('helvetica','italic'); doc.setFontSize(8); doc.setTextColor(125,116,106);
  const rango = pr.semFinanciados === pr.semTotal
    ? 'los '+pr.semFinanciados+' semestres del programa'
    : 'del '+pr.semInicio+' al '+pr.semTotal+' semestre ('+pr.semFinanciados+' de '+pr.semTotal+')';
  pdfText(doc,'Financiando el '+pr.pctLP+'% a largo plazo en '+rango+', con ajuste anual del '+pr.ipcPct+'%.',16,y); y+=7;
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal'); doc.setFontSize(9);
  const hwP=['Sem.','Base proyectada','Capital LP','Garantisa LP','LP acumulado'], cwP=[16,46,40,38,40];
  doc.setFillColor(61,107,74); doc.setTextColor(255,255,255); doc.rect(14,y-5,180,7,'F');
  let xP=14; hwP.forEach((h,i)=>{doc.setFont('helvetica','bold');doc.setFontSize(8.5);pdfText(doc,h,xP+1,y);xP+=cwP[i];});
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');
  pr.filas.forEach(f=>{
    y+=6; if(y>272){doc.addPage();y=20;}
    xP=14;
    [f.s+'\u00B0',cop(f.matSem),cop(f.capLP),cop(f.garLP),cop(f.acumCapital)].forEach((v,i)=>{pdfText(doc,String(v),xP+1,y);xP+=cwP[i];});
  });
  y+=8; if(y>248){doc.addPage();y=20;}
  doc.setFillColor(251,244,233); doc.rect(14,y-4,180,22,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(160,110,45);
  pdfText(doc,'Al graduarse: '+cop(pr.acumCapital)+' de capital a largo plazo'+(etiqueta?' ('+etiqueta+')':''),16,y+2); y+=7;
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(58,53,50);
  pdfText(doc,'Amortizable en aprox. '+pr.plazoPago+' meses (1.5 x '+pr.semFinanciados+' semestres financiados x 6), tras 1 año de gracia.',16,y+2); y+=5;
  pdfText(doc,'Base total proyectada: '+cop(pr.acumMatricula)+'  |  Garantisa LP acumulada: '+cop(pr.acumGarantisa),16,y+2); y+=10;
  doc.setTextColor(0,0,0); doc.setFontSize(11);
  return y;
}





// ── LIMPIAR TAB ───────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════
// CUOTA INICIAL REQUERIDA — cálculo inverso
// Dada la capacidad de pago mensual, ¿cuánto debe cubrir de entrada?
//   Financiado máximo = cuota x (1 - (1+tm)^-n) / tm   [valor presente]
//   Cuota inicial     = matrícula - becas - financiado
//   Garantisa         = financiado x 4.17%  (se paga con la cuota inicial)
// ══════════════════════════════════════════════════════════════════
function maxFinanciado(cuota, tm, n) {
  if(!(cuota > 0) || !(n > 0)) return 0;
  return tm === 0 ? cuota * n : cuota * (1 - Math.pow(1 + tm, -n)) / tm;
}

// ══════════════════════════════════════════════════════════════════
// AUTOPRUEBAS DEL MOTOR FINANCIERO
// No modifican estado ni interfaz. Se ejecutan al cargar y también
// pueden invocarse manualmente desde consola: runFinancialSelfTests()
// ══════════════════════════════════════════════════════════════════
function runFinancialSelfTests() {
  const results = [];
  const near = (a,b,tol=0.01) => Math.abs(a-b) <= tol;
  const test = (name, fn) => {
    try {
      const ok = fn() === true;
      results.push({name, ok, error: ok ? '' : 'Resultado fuera de tolerancia'});
    } catch(e) {
      results.push({name, ok:false, error:e?.message || String(e)});
    }
  };

  test('Cuota fija conocida: $10M, 1% MV, 12 meses', () =>
    near(cuotaMes(10000000, 0.01, 12), 888487.8867834167, 0.001));

  test('Tasa 0%: capital dividido uniformemente', () =>
    near(cuotaMes(1200000, 0, 12), 100000, 0.000001));

  test('Amortización conserva capital y cierra saldo', () => {
    const a = amortizacion(10000000, 0.01, 12);
    return a.rows.length === 12 && near(a.totCap, 10000000, FINANCIAL_EPSILON) &&
      near(a.rows[a.rows.length-1].saldo, 0, FINANCIAL_EPSILON) && a.totInt > 0;
  });

  test('Amortización a 0% no genera intereses', () => {
    const a = amortizacion(1200000, 0, 12);
    return near(a.totInt, 0, 0.000001) && near(a.totCap, 1200000, FINANCIAL_EPSILON);
  });

  test('Garantisa CP = 4.17% del financiado', () =>
    near(10000000 * GARANTISA_CP, 417000, 0.000001));

  test('Garantisa LP = 2.86% del financiado', () =>
    near(10000000 * GARANTISA_LP, 286000, 0.000001));

  test('Cálculo inverso coincide con cuota directa', () => {
    const P = 7500000, tm = 0.0125, n = 18;
    const c = cuotaMes(P, tm, n);
    return near(maxFinanciado(c, tm, n), P, FINANCIAL_EPSILON);
  });

  test('Proyección LP sin IPC mantiene base constante', () => {
    const p = proyectarLP(10000000, 60, 1, 4, 0);
    return p.filas.length === 4 && near(p.acumMatricula, 40000000, FINANCIAL_EPSILON) &&
      near(p.acumCapital, 24000000, FINANCIAL_EPSILON) &&
      near(p.acumGarantisa, 24000000 * GARANTISA_LP, FINANCIAL_EPSILON) && p.plazoPago === 36;
  });

  test('Proyección LP aplica IPC una vez cada 2 semestres', () => {
    const p = proyectarLP(10000000, 50, 1, 4, 0.10);
    return near(p.filas[0].matSem, 10000000) && near(p.filas[1].matSem, 10000000) &&
      near(p.filas[2].matSem, 11000000) && near(p.filas[3].matSem, 11000000);
  });

  test('Entradas inválidas no producen NaN/Infinity', () => {
    const a = amortizacion(-1, 0.01, 12);
    return cuotaMes(1000, -0.01, 12) === 0 && cuotaMes(1000, 0.01, 0) === 0 &&
      a.rows.length === 0 && a.cuota === 0;
  });

  const passed = results.filter(r=>r.ok).length;
  const report = {ok: passed === results.length, passed, total: results.length, results};
  if(report.ok) console.info(`[Motor financiero] ${passed}/${results.length} pruebas OK`);
  else console.error('[Motor financiero] Fallaron pruebas internas', report);
  return report;
}


SimuladorOFE.register('herramientas', {
  init(app){
    app.services['herramientas'] = {
      abrirIdiomas: typeof abrirIdiomas === 'function' ? abrirIdiomas : undefined,
      convertirTasas: typeof convertirTasas === 'function' ? convertirTasas : undefined,
      maxFinanciado: typeof maxFinanciado === 'function' ? maxFinanciado : undefined,
      runFinancialSelfTests: typeof runFinancialSelfTests === 'function' ? runFinancialSelfTests : undefined
    };
  }
});
