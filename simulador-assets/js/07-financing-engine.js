// ── BENEFICIOS / DESCUENTOS ──────────────────────────────────────────────────
// Implementación única: Financing Input Engine v3 (ver bloque siguiente).

// ── SYNC: % ↔ $ for financing inputs ─────────────────────────────────────────
// Tab 1 & 3: pct → val, or val → pct, using matNeta as base

// Tab2: pctCP → valCP (on % change); valCP → pctCP (on $ change)

// ══════════════════════════════════════════════════════════════════
// FINANCING INPUT ENGINE — v3
// Model: financiado = mat - sum(beneficios) - contado
// ══════════════════════════════════════════════════════════════════

// ── State ────────────────────────────────────────────────────────
const financingState = SimuladorOFE.state.financing;

// ── Getters ──────────────────────────────────────────────────────
function getMat(tabId) {
  return Math.max(0, parseFloat(document.getElementById('mat'+tabId)?.value)||0);
}
function getTotalBeneficios(tabId) {
  return SimuladorOFE.state.financing.benefits[tabId].reduce((s,b) => s + (parseFloat(b.val)||0), 0);
}
function getContadoVal(tabId) {
  return Math.max(0, parseFloat(document.getElementById('cont'+tabId+'-val')?.value)||0);
}
function getFinanciado(tabId) {
  const mat = getMat(tabId);
  const benef = getTotalBeneficios(tabId);
  const cont = getContadoVal(tabId);
  return Math.max(0, mat - benef - cont);
}


// ── Sync financed amount → contado (bidirectional) ───────────────
function syncFinPctToVal(tabId) {
  // % financiado es sobre mat total (no sobre neta)
  const mat    = getMat(tabId);
  const benef  = getTotalBeneficios(tabId);
  const pct    = Math.max(0, parseFloat(document.getElementById('finpct'+tabId)?.value)||0);
  const fin    = Math.round(mat * pct / 100);                // % of mat
  const fvEl   = document.getElementById('finval'+tabId);
  if(fvEl) fvEl.value = fin > 0 ? fin : '';
  const cont   = Math.max(0, mat - benef - fin);             // contado = mat - benef - fin
  const cpEl   = document.getElementById('cont'+tabId+'-pct');
  const cvEl   = document.getElementById('cont'+tabId+'-val');
  if(cvEl) cvEl.value = cont > 0 ? Math.round(cont) : '';
  if(cpEl) cpEl.value = mat > 0 ? Math.round((cont/mat)*1000)/10 : '';
  recalcAll(tabId);
}

// When user types financed $ directly → contado = mat - benef - fin
function syncFinanciadoFromVal(tabId) {
  const mat    = getMat(tabId);
  const benef  = getTotalBeneficios(tabId);
  const fin    = Math.max(0, parseFloat(document.getElementById('finval'+tabId)?.value)||0);
  const cont   = Math.max(0, mat - benef - fin);             // contado = mat - benef - fin
  const cpEl   = document.getElementById('cont'+tabId+'-pct');
  const cvEl   = document.getElementById('cont'+tabId+'-val');
  if(cvEl) cvEl.value = cont > 0 ? Math.round(cont) : '';
  if(cpEl) cpEl.value = mat > 0 ? Math.round((cont/mat)*1000)/10 : '';
  recalcAll(tabId);
}
// For Tab2 CP financed $ → update CP% based on total financiado
function syncFinanciadoCP() {
  // CP/LP $ → update % based on mat
  const mat = getMat(2);
  const valCP = Math.max(0, parseFloat(document.getElementById('finvalCP')?.value)||0);
  const pct  = mat > 0 ? Math.round((valCP/mat)*1000)/10 : 0;
  const pEl  = document.getElementById('pctCP');
  if(pEl) pEl.value = pct || '';
  ajustarContraparte('CP');
}
function syncFinanciadoLP() {
  const mat = getMat(2);
  const valLP = Math.max(0, parseFloat(document.getElementById('finvalLP')?.value)||0);
  const pct  = mat > 0 ? Math.round((valLP/mat)*1000)/10 : 0;
  const pEl  = document.getElementById('pctLP');
  if(pEl) pEl.value = pct || '';
  ajustarContraparte('LP');
}

// ── Main recalc ───────────────────────────────────────────────────
function recalcAll(tabId) {
  const mat   = getMat(tabId);
  const benef = getTotalBeneficios(tabId);
  const cont  = getContadoVal(tabId);
  const matNeta = Math.max(0, mat - benef);
  const fin   = Math.max(0, matNeta - cont);

  // Validations
  if(mat > 0 && benef > mat) {
    showAlert(tabId, icon('alert-triangle') + ' Los beneficios superan el valor de la matrícula.');
  }
  if(mat > 0 && cont > matNeta) {
    showAlert(tabId, icon('alert-triangle') + ' El pago de contado supera la matrícula neta (después de beneficios).');
  }

  // Sync contado % from value
  const cPctEl = document.getElementById('cont'+tabId+'-pct');
  if(cPctEl && mat > 0 && document.activeElement !== cPctEl) {
    cPctEl.value = mat > 0 ? Math.round((cont/mat)*1000)/10 : 0;
  }

  // Update breakdown panel
  const bp = document.getElementById('breakdown-'+tabId);
  if(bp) {
    bp.style.display = mat > 0 ? 'block' : 'none';
    const finPct = mat > 0 ? ((fin/mat)*100).toFixed(1) : 0;
    document.getElementById('bd-mat-'+tabId).textContent   = cop(mat);
    document.getElementById('bd-benef-'+tabId).textContent = benef > 0 ? cop(benef)+' ('+(mat>0?((benef/mat)*100).toFixed(1):0)+'%)' : cop(0);
    document.getElementById('bd-cont-'+tabId).textContent  = cont  > 0 ? cop(cont) +' ('+(mat>0?((cont/mat)*100).toFixed(1):0)+'%)' : cop(0);
    document.getElementById('bd-fin-'+tabId).textContent   = cop(fin)+' ('+finPct+'% de matrícula)';
    // Sync the editable financed $ and % fields if not active
    const fvEl2 = document.getElementById('finval'+tabId);
    if(fvEl2 && document.activeElement !== fvEl2) fvEl2.value = fin > 0 ? Math.round(fin) : '';
    const fpEl2 = document.getElementById('finpct'+tabId);
    if(fpEl2 && document.activeElement !== fpEl2) fpEl2.value = (mat>0&&fin>0) ? Math.round((fin/mat)*1000)/10 : '';  // % of mat

    // Composición de la matrícula (la pestaña 2 la pinta updateSplit2 con CP/LP)
    if(tabId !== 2) {
      const bPct = mat > 0 ? (benef/mat)*100 : 0;
      const cPct = mat > 0 ? (cont/mat)*100  : 0;
      const fPct = mat > 0 ? (fin/mat)*100   : 0;
      const dEl = document.getElementById('dist-'+tabId);
      if(dEl) {
        if(mat > 0) { dEl.hidden = false; dEl.innerHTML = distribucionHTML(bPct, cPct, fPct, 0); }
        else dEl.hidden = true;
      }
    }
  }

  // Garantisa display (tabs 1 & 2)
  if(tabId === 1) {
    const gar = fin * GARANTISA_CP;
    document.getElementById('garantisa1-val').textContent =
      fin > 0 ? cop(gar)+' sobre '+cop(fin)+' financiado (4.17% = 3.5%+IVA)' : '—';
  }
  if(tabId === 2) {
    updateSplit2(fin);
  }
}

// ── Contado sync ─────────────────────────────────────────────────
function syncContadoFromPct(tabId) {
  const mat  = getMat(tabId);
  const pct  = Math.max(0, parseFloat(document.getElementById('cont'+tabId+'-pct')?.value)||0);
  const val  = mat > 0 ? Math.round(mat * pct / 100) : 0;
  const vEl  = document.getElementById('cont'+tabId+'-val');
  if(vEl) vEl.value = val || '';
  if(tabId === 2) redistribuirCPLP();
  recalcAll(tabId);
}
function syncContadoFromVal(tabId) {
  const mat = getMat(tabId);
  const val = Math.max(0, parseFloat(document.getElementById('cont'+tabId+'-val')?.value)||0);
  const pct = mat > 0 ? Math.round((val/mat)*1000)/10 : 0;
  const pEl = document.getElementById('cont'+tabId+'-pct');
  if(pEl && document.activeElement !== pEl) pEl.value = pct || '';
  if(tabId === 2) redistribuirCPLP();
  recalcAll(tabId);
}

// ── Tab2 CP/LP split ──────────────────────────────────────────────
// ── Barra de composición: qué parte de la matrícula cubre cada concepto ──
function distribucionHTML(benefPct, contPct, cpPct, lpPct) {
  const total = (benefPct||0) + (contPct||0) + (cpPct||0) + (lpPct||0);
  const dif   = Math.round((100 - total) * 10) / 10;
  const ok    = Math.abs(dif) < 0.15;
  const segs = [
    {p: benefPct, cls: 'benef', lbl: 'Beneficios'},
    {p: contPct,  cls: 'cont',  lbl: 'Contado'},
    {p: cpPct,    cls: 'fin',   lbl: 'Corto plazo'},
    {p: lpPct,    cls: 'lp',    lbl: 'Largo plazo'},
  ].filter(s => s.p > 0);
  const barra = segs.map(s =>
    `<div class="stack-seg stack-seg--${s.cls}" style="width:${Math.min(100, s.p)}%" title="${s.lbl}: ${s.p.toFixed(1)}%"></div>`).join('');
  const leyenda = segs.map(s =>
    `<span><span class="stack-dot stack-dot--${s.cls}"></span>${s.lbl} <strong class="u-num">${s.p.toFixed(1)}%</strong></span>`).join('');
  const estado = ok
    ? `<span class="chip chip--success">${icon('check-circle')} Distribución completa</span>`
    : (dif > 0
        ? `<span class="chip chip--warning">${icon('alert-triangle')} Falta ${dif.toFixed(1)}% por asignar</span>`
        : `<span class="chip chip--danger">${icon('alert-triangle')} Excede ${Math.abs(dif).toFixed(1)}%</span>`);
  return `<div class="dist__head"><span class="dist__title">Composición de la matrícula</span>${estado}</div>
    <div class="stack-bar">${barra}</div>
    <div class="stack-legend">${leyenda}</div>`;
}

function updateSplit2(fin) {
  // CP% and LP% are % of total matrícula, not of financed amount
  const mat   = getMat(2);
  const benef = getTotalBeneficios(2);
  const pCP   = parseFloat(document.getElementById('pctCP')?.value)||0;
  const pLP   = parseFloat(document.getElementById('pctLP')?.value)||0;
  const valCP = Math.round(mat * pCP / 100);
  const valLP = Math.round(mat * pLP / 100);
  const cont  = getContadoVal(2);
  const contPct = mat > 0 ? Math.round((cont/mat)*1000)/10 : 0;
  const benefPct = mat > 0 ? Math.round((benef/mat)*1000)/10 : 0;
  const totalPct = pCP + pLP + contPct + benefPct;
  const fcpEl = document.getElementById('finvalCP');
  const flpEl = document.getElementById('finvalLP');
  if(fcpEl && document.activeElement !== fcpEl) fcpEl.value = valCP || '';
  if(flpEl && document.activeElement !== flpEl) flpEl.value = valLP || '';
  const tEl = document.getElementById('split-total-2');
  if(tEl) {
    if(mat > 0) { tEl.hidden = false; tEl.innerHTML = distribucionHTML(benefPct, contPct, pCP, pLP); }
    else tEl.hidden = true;
  }
  // Garantisa display
  document.getElementById('gCP-val').textContent = valCP > 0 ? cop(valCP*GARANTISA_CP)+' sobre '+cop(valCP) : '—';
  document.getElementById('gLP-val').textContent = valLP > 0 ? cop(valLP*GARANTISA_LP)+' sobre '+cop(valLP) : '—';
}
function syncSplitFromPct(which) {
  const mat = getMat(2);  // CP/LP % are of total matrícula
  const id  = which==='CP' ? 'pctCP' : 'pctLP';
  const vid = which==='CP' ? 'finvalCP' : 'finvalLP';
  const pct = Math.max(0, parseFloat(document.getElementById(id)?.value)||0);
  const vel = document.getElementById(vid);
  if(vel) vel.value = Math.round(mat * pct / 100) || '';
  ajustarContraparte(which);
}


// Reparte el remanente (matrícula − beneficios − contado) entre CP y LP,
// conservando la proporción que el asesor definió entre ambos tramos.
function redistribuirCPLP() {
  if(financingState.redistributing) return;
  const mat = getMat(2);
  if(mat <= 0) return;
  const benef = getTotalBeneficios(2);
  const cont  = getContadoVal(2);
  const pctRestante = Math.max(0, ((mat - benef - cont) / mat) * 100);

  const cpEl = document.getElementById('pctCP');
  const lpEl = document.getElementById('pctLP');
  if(!cpEl || !lpEl) return;
  const pCP = parseFloat(cpEl.value)||0;
  const pLP = parseFloat(lpEl.value)||0;
  const suma = pCP + pLP;

  let nCP, nLP;
  if(suma <= 0) { nCP = pctRestante; nLP = 0; }
  else          { nCP = pctRestante * (pCP/suma); nLP = pctRestante * (pLP/suma); }

  financingState.redistributing = true;
  if(document.activeElement !== cpEl) cpEl.value = Math.round(nCP*10)/10 || '';
  if(document.activeElement !== lpEl) lpEl.value = Math.round(nLP*10)/10 || '';
  financingState.redistributing = false;
}

// Al editar un tramo, el contrario absorbe la diferencia (el contado no se toca)
function ajustarContraparte(which) {
  const mat = getMat(2);
  if(mat <= 0) return;
  const benef = getTotalBeneficios(2);
  const cont  = getContadoVal(2);
  const disponible = Math.max(0, ((mat - benef - cont) / mat) * 100);

  const idEd   = which === 'CP' ? 'pctCP' : 'pctLP';
  const idOtro = which === 'CP' ? 'pctLP' : 'pctCP';
  const elEd   = document.getElementById(idEd);
  const elOtro = document.getElementById(idOtro);
  if(!elEd || !elOtro) return;

  const pEd = Math.max(0, parseFloat(elEd.value)||0);
  // Si lo tecleado supera lo disponible, el otro tramo queda en 0 y el
  // indicador de composición señala el exceso.
  const pOtro = Math.max(0, disponible - pEd);

  financingState.redistributing = true;
  if(document.activeElement !== elOtro) elOtro.value = Math.round(pOtro*10)/10 || '';
  financingState.redistributing = false;

  const vidOtro = which === 'CP' ? 'finvalLP' : 'finvalCP';
  const velOtro = document.getElementById(vidOtro);
  if(velOtro && document.activeElement !== velOtro) velOtro.value = Math.round(mat * pOtro / 100) || '';

  recalcAll(2);
}


// ── Beneficios engine ─────────────────────────────────────────────
function addBenef(tabId) {
  const id = Date.now();
  SimuladorOFE.state.financing.benefits[tabId].push({id, nombre:'', pct:0, val:0});
  renderBeneficios(tabId);
  setTimeout(()=>{
    const rows = document.querySelectorAll('#benef-items-'+tabId+' [data-field="nombre"]');
    if(rows.length) rows[rows.length-1].focus();
  }, 40);
}
function delBenef(tabId, id) {
  SimuladorOFE.state.financing.benefits[tabId] = SimuladorOFE.state.financing.benefits[tabId].filter(b=>b.id!==id);
  renderBeneficios(tabId);
  recalcAll(tabId);
}
function updateBenefField(tabId, id, field, rawVal) {
  const b = SimuladorOFE.state.financing.benefits[tabId].find(x=>x.id===id);
  if(!b) return;
  const mat = getMat(tabId);
  if(field === 'nombre') {
    b.nombre = rawVal; return;
  }
  if(field === 'pct') {
    const pct = Math.max(0, parseFloat(rawVal)||0);
    b.pct = pct;
    b.val = mat > 0 ? Math.round(mat * pct / 100) : 0;
    // update the $ input in the DOM
    const vEl = document.getElementById('benef-val-'+id);
    if(vEl && document.activeElement !== vEl) vEl.value = b.val || '';
  } else if(field === 'val') {
    const val = Math.max(0, parseFloat(rawVal)||0);
    b.val = val;
    b.pct = mat > 0 ? Math.round((val/mat)*1000)/10 : 0;
    const pEl = document.getElementById('benef-pct-'+id);
    if(pEl && document.activeElement !== pEl) pEl.value = b.pct || '';
  }
  recalcAll(tabId);
}
function renderBeneficios(tabId) {
  const container = document.getElementById('benef-items-'+tabId);
  if(!container) return;
  container.innerHTML = SimuladorOFE.state.financing.benefits[tabId].map(b => `
    <div class="benef-item">
      <div class="benef-item__main">
        <input class="input input--sm" type="text" placeholder="Ej: Beca, Caja compensación..."
          aria-label="Nombre del beneficio" value="${escAttr(b.nombre)}"
          data-input-action="benef-field" data-tab="${tabId}" data-id="${b.id}" data-field="nombre">
        <div class="dual u-mt-2">
          <div class="input-affix input-affix--sm">
            <input id="benef-pct-${b.id}" class="input" type="number" placeholder="0" min="0" max="100" step="0.1"
              aria-label="Porcentaje del beneficio" value="${b.pct||''}"
              data-input-action="benef-field" data-tab="${tabId}" data-id="${b.id}" data-field="pct"><span class="input-affix__tag input-affix__tag--end">%</span>
          </div>
          <div class="dual__sep" aria-hidden="true">${icon('arrows-h')}</div>
          <div class="input-affix input-affix--sm">
            <span class="input-affix__tag">$</span><input id="benef-val-${b.id}" class="input" data-money-field type="number" placeholder="0" min="0" step="1000"
              aria-label="Valor del beneficio" value="${b.val||''}"
              data-input-action="benef-field" data-tab="${tabId}" data-id="${b.id}" data-field="val">
          </div>
        </div>
      </div>
      <button class="btn btn--ghost btn--icon btn--sm" data-action="del-benef" data-tab="${tabId}" data-id="${b.id}"
        aria-label="Eliminar beneficio">${icon('x')}</button>
    </div>`).join('');
  activarSeparadorMiles(container);
  if(tabId === 7) recalc7(); else recalcAll(tabId);
}




// ── LP: auto-calculate amortization period = semestres × 6 × 1.5 ─────────────
// ── Semestres efectivamente financiados ─────────────────────────────────────
// El plazo de amortización LP depende de cuántos semestres usa el crédito,
// no de la duración total del programa.
function getSemFinanciados() {
  const total  = parseInt(document.getElementById('plazoLP')?.value)||8;
  const inicio = Math.max(1, parseInt(document.getElementById('inicioLP')?.value)||1);
  return {
    total,
    inicio: Math.min(inicio, total),
    financiados: Math.max(1, total - Math.min(inicio, total) + 1)
  };
}

function calcPlazoLPAuto() {
  const {total, inicio, financiados} = getSemFinanciados();
  const mesesPago = Math.round(financiados * 6 * 1.5);
  const elSem = document.getElementById('sem-financiados');
  if(elSem) elSem.textContent = financiados + ' sem.';
  const el = document.getElementById('plazo-lp-auto');
  if(el) el.textContent = mesesPago > 0 ? mesesPago + ' meses' : '—';
  const nota = document.getElementById('lp-formula-nota');
  if(nota) nota.innerHTML = financiados === total
    ? `Financia los ${total} semestres · Plazo LP = 1.5 × ${financiados} sem. × 6 meses`
    : `Financia del ${inicio}° al ${total}° semestre (${financiados} de ${total}) · Plazo LP = 1.5 × ${financiados} sem. × 6 meses`;
  // Espejo en el modal de idiomas
  const elId = document.getElementById('id-lp-auto-meses');
  if(elId) elId.textContent = mesesPago + ' meses';
  return mesesPago;
}

function calcLPAutoId() {
  // Idiomas hereda el mismo esquema de semestres financiados del Mixto
  const {financiados} = getSemFinanciados();
  const mesesPago = Math.round(financiados * 6 * 1.5);
  const el = document.getElementById('id-lp-auto-meses');
  if(el) el.textContent = mesesPago + ' meses';
  const elSem = document.getElementById('id-sem-financiados');
  if(elSem) elSem.textContent = financiados + ' sem.';
  const nota = document.getElementById('id-sem-fin-nota');
  if(nota) {
    const sf = getSemFinanciados();
    nota.textContent = sf.financiados === sf.total
      ? `Financia los ${sf.total} semestres.`
      : `Financia del ${sf.inicio}° al ${sf.total}° semestre (${sf.financiados} de ${sf.total}).`;
  }
  return mesesPago;
}

function getLPPlazoMeses() {
  // Plazo de amortización LP = 1.5 × semestres FINANCIADOS × 6 meses
  return Math.round(getSemFinanciados().financiados * 6 * 1.5);
}
SimuladorOFE.register('financing-engine', {
  init(){
    updEq1(); updEqCP(); updEqLP();
    convertirTasas();
    activarSeparadorMiles();
    recalcAll(1); recalcAll(2); recalcAll(3); recalc7();
    calcPlazoLPAuto();
    calcLPAutoId();
    renderHistorial();
    document.getElementById('plazo1')?.addEventListener('input', updEq1);
    document.getElementById('plazoCP')?.addEventListener('input', updEqCP);
    document.getElementById('plazoLP')?.addEventListener('input', updEqLP);
  }
});
