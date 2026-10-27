// ══════════════════════════════════════════════════════════════════
// Iconografía — set Lucide, SVG inline con currentColor (viewBox 0 0 24 24)
// ══════════════════════════════════════════════════════════════════
function icon(name,cls){return window.OFEIcons.render(name,cls);}

// ── Safe text/attribute encoding for dynamic UI content ─────────────────────
function escHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escAttr(value) { return escHTML(value); }



// ── Estado de controles en atributos ARIA ──
function _pressed(el, on){ if(el) el.setAttribute('aria-pressed', on ? 'true' : 'false'); }

// ── Toasts ──
// ── Estado ocupado accesible para acciones que generan/leen archivos ──
function runButtonTask(button, task, loadingLabel) {
  if(typeof task !== 'function') return;
  if(!button) return task();
  if(button.getAttribute('aria-busy') === 'true') return;
  const actionLabel=String(button.textContent||'').trim().replace(/\s+/g,' ');
  const operation=window.OFELoading?.begin(loadingLabel||actionLabel||'Procesando solicitud',{message:'Procesando la operación…'});
  const wasDisabled = button.disabled;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.classList.add('is-busy');
  // Permite que el navegador pinte el estado busy antes de una tarea síncrona pesada.
  return new Promise(resolve => {
    requestAnimationFrame(() => setTimeout(async () => {
      try { resolve(await task()); }
      catch(error) {
        console.error('[Acción]', error);
        toast('No fue posible completar la acción. Inténtalo nuevamente.', 'error');
        resolve(undefined);
      } finally {
        button.classList.remove('is-busy');
        button.removeAttribute('aria-busy');
        button.disabled = wasDisabled;
        operation?.end();
      }
    }, 0));
  });
}

// ── Tablas y regiones desplazables accesibles ──
function enhanceTableAccessibility(root = document) {
  const scope = root?.querySelectorAll ? root : document;
  scope.querySelectorAll('.table-wrap, .u-overflow-x, .preview-wrap').forEach(wrapper => {
    const table = wrapper.querySelector('table');
    if(!table) return;
    table.querySelectorAll('thead th').forEach(th => th.setAttribute('scope','col'));
    if(!wrapper.hasAttribute('tabindex')) wrapper.setAttribute('tabindex','0');
    if(!wrapper.hasAttribute('role')) wrapper.setAttribute('role','region');
    if(!wrapper.hasAttribute('aria-label')) {
      const caption = table.querySelector('caption')?.textContent?.trim();
      const container = wrapper.closest('.card, .section, .view') || wrapper.parentElement;
      const heading = container?.querySelector('.section__title, .card__title, .card-title, h2, h3')?.textContent?.trim();
      wrapper.setAttribute('aria-label', caption || (heading ? `${heading} — tabla` : 'Tabla de datos'));
    }
  });
}

function initDynamicAccessibility() {
  enhanceTableAccessibility(document);
  const main = document.getElementById('main-content');
  if(!main || typeof MutationObserver === 'undefined') return;
  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if(node.nodeType === 1) enhanceTableAccessibility(node);
    }));
  });
  observer.observe(main, {childList:true, subtree:true});
}


function resultHero({eyebrow='Resultado de la simulación', label='Cuota estimada', value='—', meta='', metrics=[], tone='success', note=''} = {}) {
  const safeMetrics = (metrics||[]).filter(Boolean).slice(0,4);
  return `<section class="result-hero result-hero--${escHTML(tone)}" aria-label="${escAttr(eyebrow)}">
    <div class="result-hero__eyebrow">${icon('check-circle')} ${escHTML(eyebrow)}</div>
    <div class="result-hero__label">${escHTML(label)}</div>
    <div class="result-hero__value">${escHTML(value)}</div>
    ${meta ? `<div class="result-hero__meta">${escHTML(meta)}</div>` : ''}
    ${safeMetrics.length ? `<div class="result-hero__metrics">${safeMetrics.map(m=>`<div class="result-hero__metric"><span class="result-hero__metric-label">${escHTML(m.label||'')}</span><strong class="result-hero__metric-value">${escHTML(m.value||'—')}</strong></div>`).join('')}</div>` : ''}
    ${note ? `<div class="result-hero__note">${escHTML(note)}</div>` : ''}
  </section>`;
}

function resultActions(tabId, {canCompare=false, primaryLabel='Guardar escenario', primaryAction='guardar-escenario', primaryTab=tabId} = {}) {
  return `<div class="result-actions" aria-label="Acciones del resultado">
    <span class="result-actions__label">¿Qué quieres hacer con este resultado?</span>
    ${primaryLabel ? `<button class="btn btn--primary btn--sm" data-action="${escAttr(primaryAction)}" data-tab="${primaryTab}">${icon(primaryAction==='switch-tab'?'history':'save')} ${escHTML(primaryLabel)}</button>` : ''}
    <button class="btn btn--secondary btn--sm" data-action="pdf" data-tab="${tabId}">${icon('file-text')} PDF</button>
    <button class="btn btn--tertiary btn--sm" data-action="xls" data-tab="${tabId}">${icon('bar-chart')} Excel</button>
    ${canCompare ? `<button class="btn btn--ghost btn--sm" data-action="open-compare" data-tab="${tabId}">${icon('scale')} Comparar</button>` : ''}
  </div>`;
}

function resultStateHTML({type='empty', iconName='bar-chart', title='Sin resultados todavía', desc='', actionLabel='', actionTab=null} = {}) {
  const action = actionLabel && actionTab ? `<div class="result-state__action"><button class="btn btn--secondary btn--sm" data-action="switch-tab" data-tab="${actionTab}">${escHTML(actionLabel)}</button></div>` : '';
  const spinner = type === 'loading' ? '<span class="spinner" aria-hidden="true"></span>' : icon(iconName,'icon-xl');
  return `<div class="result-state result-state--${escHTML(type)}" role="${type==='error'?'alert':'status'}"><div class="result-state__inner"><div class="result-state__icon">${spinner}</div><div class="result-state__title">${escHTML(title)}</div>${desc?`<div class="result-state__desc">${escHTML(desc)}</div>`:''}${action}</div></div>`;
}

function setResultLoading(tabId, title='Calculando escenario…') {
  const map = {1:'res1',2:'res2',3:'res3',5:'res-refi',7:'res7'};
  const target = document.getElementById(map[tabId]);
  if(target) target.innerHTML = resultStateHTML({type:'loading', title, desc:'Estamos organizando los valores para mostrarte el resultado financiero.'});
}

function markViewHasResult(tabId, hasResult=true) {
  const view = document.getElementById('tab'+tabId);
  if(view) view.classList.toggle('has-result', !!hasResult);
}

function calculationResultForTab(tabId) {
  if(tabId===1) return SimuladorOFE.state.results.shortTerm;
  if(tabId===2) return SimuladorOFE.state.results.mixed;
  if(tabId===3) return SimuladorOFE.state.results.bank;
  if(tabId===5) return SimuladorOFE.state.restructuring.current;
  if(tabId===7) return SimuladorOFE.state.results.initialPayment;
  return null;
}
function runCalculation(button, tabId, task, loadingTitle) {
  const targetId={1:'res1',2:'res2',3:'res3',5:'res-refi',7:'res7'}[tabId];
  const target=document.getElementById(targetId);
  const previousHTML=target?.innerHTML || '';
  const before=calculationResultForTab(tabId);
  const epoch=window.SimulationLifecycle?.begin(tabId);
  setResultLoading(tabId, loadingTitle);
  return Promise.resolve(runButtonTask(button, async () => {
    if(window.OFE_PUBLIC)try{await window.OFEGlobalSettings?.prepare(tabId,()=>!window.SimulationLifecycle||window.SimulationLifecycle.current(tabId,epoch));}
    catch(error){if(!window.SimulationLifecycle||window.SimulationLifecycle.current(tabId,epoch)){if(target)target.innerHTML=previousHTML;markViewHasResult(tabId,!!before);toast(error.message,'error');}return;}
    if(window.SimulationLifecycle && !window.SimulationLifecycle.current(tabId,epoch)) return;
    if ([1,2,3,7].includes(tabId)) sincronizarMatriculaCatalogo(tabId);
    let result;
    try { SimuladorOFE.state.ui.calculationTab=tabId; result=task(); } finally { delete SimuladorOFE.state.ui.calculationTab; }
    const after=calculationResultForTab(tabId);
    if(after && after !== before) {
      if ([1,2,3,7].includes(tabId)) {
        const program = programaSeleccionado(tabId);
        after.progId = program?.id || null;
        after.catalogSource = SimuladorOFE.catalog.source;
        after.nivel = nivelState[tabId];
        after.subnivel = program?.subnivel || null;
        if (program) after.progNombre = program.nombre;
      }
      requestAnimationFrame(()=>{if(!window.SimulationLifecycle || window.SimulationLifecycle.current(tabId,epoch)) markViewHasResult(tabId,true);});
    }
    else if(target) { target.innerHTML=previousHTML; markViewHasResult(tabId, !!before); }
    return result;
  },loadingTitle)).finally(()=>window.SimulationLifecycle?.end(tabId,epoch));
}

function toast(mensaje, tipo){
  const cont = document.getElementById('toasts');
  if(!cont) return;
  const ic = {success:'check-circle', error:'x-circle', warning:'alert-triangle', info:'info'}[tipo] || 'info';
  const el = document.createElement('div');
  el.className = 'toast' + (tipo ? ' toast--'+tipo : '');
  if(SimuladorOFE.state.ui.calculationTab)el.dataset.simulationTab=String(SimuladorOFE.state.ui.calculationTab);
  el.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  const ico = document.createElement('span');
  ico.className = 'toast__icon';
  ico.innerHTML = icon(ic); // trusted static SVG from ICONS
  const body = document.createElement('div');
  body.className = 'toast__body';
  body.textContent = String(mensaje ?? '');
  el.append(ico, body);
  // Mantén el feedback no intrusivo: como máximo tres mensajes visibles.
  while(cont.children.length >= 3) cont.firstElementChild?.remove();
  cont.appendChild(el);
  setTimeout(()=>{ el.classList.add('toast--leaving'); setTimeout(()=>el.remove(),220); }, 3600);
}


// ── Validación inline de formularios ────────────────────────────────────────
function clearFieldError(controlOrId) {
  const control = typeof controlOrId === 'string' ? document.getElementById(controlOrId) : controlOrId;
  if(!control) return;
  const field = control.closest('.field');
  if(!field) return;
  field.classList.remove('is-error');
  control.removeAttribute('aria-invalid');
  const err = field.querySelector('.field__error');
  if(err) {
    const described = (control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).filter(id => id !== err.id);
    if(described.length) control.setAttribute('aria-describedby', described.join(' ')); else control.removeAttribute('aria-describedby');
    err.remove();
  }
}

function showFieldError(controlId, message, fallbackAlertId) {
  const control = document.getElementById(controlId);
  if(!control) {
    if(fallbackAlertId && typeof showAlert === 'function') showAlert(fallbackAlertId, message);
    else toast(message, 'error');
    return;
  }
  clearFieldError(control);
  const field = control.closest('.field');
  if(!field) { toast(message, 'error'); return; }
  field.classList.add('is-error');
  control.setAttribute('aria-invalid','true');
  const err = document.createElement('div');
  err.className = 'field__error';
  err.id = controlId + '-error';
  err.setAttribute('role','alert');
  err.textContent = message;
  const described = new Set((control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
  described.add(err.id);
  control.setAttribute('aria-describedby', Array.from(described).join(' '));
  field.appendChild(err);
  control.focus({preventScroll:true});
  control.scrollIntoView({behavior:'smooth', block:'center'});
}

function clearControlValidationFromEvent(target) {
  if(target?.dataset?.validationOwner==='rate') return;
  if(target?.matches?.('input, select, textarea')) clearFieldError(target);
}

// ── Confirmación propia del Design System ──────────────────────────────────
function confirmAction({title='Confirmar acción', message='', confirmLabel='Confirmar', tone='danger', onConfirm} = {}) {
  const modal = document.getElementById('confirm-modal');
  if(!modal) { if(typeof onConfirm === 'function') onConfirm(); return; }
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-desc').textContent = message;
  const accept = document.getElementById('confirm-accept');
  accept.textContent = confirmLabel;
  accept.className = 'btn ' + (tone === 'danger' ? 'btn--danger' : 'btn--primary');
  SimuladorOFE.state.ui.confirmCallback = typeof onConfirm === 'function' ? onConfirm : null;
  abrirModalAccesible(modal, '[data-action="confirm-cancel"]');
}

function cancelConfirm() {
  SimuladorOFE.state.ui.confirmCallback = null;
  cerrarModalAccesible(document.getElementById('confirm-modal'));
}

function acceptConfirm() {
  const callback = SimuladorOFE.state.ui.confirmCallback;
  SimuladorOFE.state.ui.confirmCallback = null;
  cerrarModalAccesible(document.getElementById('confirm-modal'));
  if(typeof callback === 'function') setTimeout(callback, 0);
}

// ── Menú lateral (pantallas angostas) ──
function _syncSidebarA11y(){
  const sb = document.getElementById('sidebar');
  if(!sb) return;
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  const open = sb.dataset.open === 'true';
  if(mobile && !open) {
    sb.inert = true;
    sb.setAttribute('aria-hidden','true');
  } else {
    sb.inert = false;
    sb.removeAttribute('aria-hidden');
  }
}

function toggleSidebar(open){
  const sb = document.getElementById('sidebar'), sc = document.getElementById('sidebar-scrim');
  if(!sb) return;
  const v = open === undefined ? sb.dataset.open !== 'true' : open;
  sb.dataset.open = v ? 'true' : 'false';
  if(sc) sc.dataset.open = v ? 'true' : 'false';
  const mb = document.getElementById('menu-btn');
  if(mb) mb.setAttribute('aria-expanded', v ? 'true' : 'false');
  _syncSidebarA11y();
  if(v && window.matchMedia('(max-width: 900px)').matches) {
    setTimeout(()=>sb.querySelector('.nav__item[data-tab]')?.focus(), 0);
  } else if(!v && sb.contains(document.activeElement) && mb) {
    mb.focus();
  }
}

// ── Theme toggle (claro/oscuro) ──────────────────────────────────────────────
function applyTheme(theme) { window.OFETheme.setPreference(theme); }
function toggleTheme() { applyTheme(window.OFETheme.resolved()==='dark'?'light':'dark'); }
function initTheme(){ window.OFETheme.charts(); }

const GARANTISA_CP = Object.freeze({valueOf:()=>SimuladorOFE.config.garantisaCP});
const GARANTISA_LP = Object.freeze({valueOf:()=>SimuladorOFE.config.garantisaLP});

const cop = v => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0}).format(Math.round(v));

// Los selectores usan el catálogo validado del arranque, sin nuevas peticiones.
const nivelState = SimuladorOFE.state.ui.levelByTab;

function programasDelCatalogo() {
  const programs = SimuladorOFE.catalog.programs;
  if (!Array.isArray(programs)) throw new Error('[ProgramCatalog] El catálogo aún no está listo');
  return programs;
}

function programaSeleccionado(tabId) {
  const sel = document.getElementById('prog'+tabId);
  if (!sel || !sel.value) return null;
  const subnivel = document.getElementById('subnivel'+tabId)?.value || '';
  return programasDelCatalogo().find(program =>
    program.id === sel.value && program.activo && program.nivel === nivelState[tabId] &&
    (program.nivel !== 'posgrado' || !subnivel || program.subnivel === subnivel)
  ) || null;
}

function poblarSubniveles(tabId) {
  const sel = document.getElementById('subnivel'+tabId);
  if (!sel) return;
  const actual = sel.value;
  const subniveles = Array.from(new Set(programasDelCatalogo()
    .filter(program => program.activo && program.nivel === 'posgrado')
    .map(program => program.subnivel)));
  // Conservar el orden conocido y añadir únicamente subniveles presentes en la fuente.
  const orden = ['Doctorado', 'Maestría', 'Especialización'];
  subniveles.sort((a, b) => {
    const rank = value => orden.includes(value) ? orden.indexOf(value) : orden.length;
    return rank(a) - rank(b) || a.localeCompare(b, 'es');
  });
  sel.innerHTML = '<option value="">— Todos los subniveles —</option>';
  subniveles.forEach(subnivel => {
    const option = document.createElement('option');
    option.value = subnivel;
    option.textContent = subnivel;
    sel.appendChild(option);
  });
  if (subniveles.includes(actual)) sel.value = actual;
}

function poblarProgramas(tabId) {
  const sel = document.getElementById('prog'+tabId);
  if (!sel) return;
  const nivel = nivelState[tabId];
  const subnivel = document.getElementById('subnivel'+tabId)?.value || '';
  const programs = programasDelCatalogo().filter(program => program.activo && program.nivel === nivel);
  const key = program => JSON.stringify([program.subnivel, program.nombre]);
  const counts = new Map();
  programs.forEach(program => counts.set(key(program), (counts.get(key(program)) || 0) + 1));
  sel.innerHTML = '<option value="">— Seleccionar programa —</option>';
  programs.filter(program => nivel !== 'posgrado' || !subnivel || program.subnivel === subnivel)
    .forEach(program => {
      const option = document.createElement('option');
      option.value = program.id;
      // Los consumidores financieros legacy leen textContent para el nombre.
      option.textContent = program.nombre + (nivel === 'posgrado' && !subnivel ? ' ('+program.subnivel+')' : '');
      option.label = option.textContent + (counts.get(key(program)) > 1
        ? ' — Matrícula ' + cop(program.valorMatricula)
        : '');
      sel.appendChild(option);
    });
  window.ProgramPicker?.sync(tabId);
}

function sincronizarMatriculaCatalogo(tabId) {
  const program = programaSeleccionado(tabId);
  const input = document.getElementById('mat'+tabId);
  if (!input) return program;
  input.readOnly = !!program;
  input.setAttribute('aria-readonly', String(!!program));
  if (program) { input.value = program.valorMatricula; clearFieldError(input); }
  const hint = document.getElementById('mat'+tabId+'-source');
  if (hint) hint.textContent = program
    ? 'Valor registrado del programa. Elimina la selección para ingresar una matrícula manual.'
    : 'Sin programa seleccionado. Puedes ingresar la matrícula manualmente.';
  return program;
}

function limpiarSeleccionPrograma(tabId) {
  window.SimulationLifecycle?.beforeProgramChange(tabId,'');
  const mat = document.getElementById('mat'+tabId);
  if (mat) { mat.value = ''; fmtLbl('mat'+tabId); }
  sincronizarMatriculaCatalogo(tabId);
  window.ProgramPicker?.sync(tabId);
  const idiomas = document.getElementById('btn-idiomas-'+tabId);
  if (idiomas) {
    idiomas.style.display = 'none';
    delete idiomas.dataset.idiomas;
    delete idiomas.dataset.prog;
  }
  if (tabId === 7) {
    SimuladorOFE.state.results.initialPaymentProgramName = '';
    recalc7();
  } else {
    recalcAll(tabId);
  }
}

function setNivel(tabId, nivel) {
  nivelState[tabId] = nivel;
  _pressed(document.getElementById('nbtn-'+tabId+'-pre'), nivel === 'pregrado');
  _pressed(document.getElementById('nbtn-'+tabId+'-pos'), nivel === 'posgrado');
  const group = document.getElementById('subnivel-fg-'+tabId);
  if (group) group.style.display = nivel === 'posgrado' ? 'block' : 'none';
  const subnivel = document.getElementById('subnivel'+tabId);
  if (subnivel) subnivel.value = '';
  poblarProgramas(tabId);
  limpiarSeleccionPrograma(tabId);
}

function filtrarProgramas(tabId) {
  poblarProgramas(tabId);
  limpiarSeleccionPrograma(tabId);
}

// Los historiales nuevos conservan ID y origen; los antiguos se resuelven
// solo cuando nombre/matrícula identifican un registro sin ambigüedad.
function programaDeHistorial(snapshot) {
  const programs = programasDelCatalogo().filter(program => program.activo);
  const sameName = program => program.nombre.trim() === String(snapshot.progNombre || '').trim();
  if (snapshot.progId) {
    if (snapshot.catalogSource && snapshot.catalogSource !== SimuladorOFE.catalog.source) return null;
    return programs.find(program => program.id === snapshot.progId &&
      (!snapshot.nivel || program.nivel === snapshot.nivel)) || null;
  }
  const candidates = programs.filter(sameName);
  const sameTuition = candidates.filter(program => program.valorMatricula === snapshot.mat);
  return sameTuition.length === 1 ? sameTuition[0] : candidates.length === 1 ? candidates[0] : null;
}

// Unidad state
const unidades = SimuladorOFE.state.ui.termUnits;


function getMeses(plazoEl, key) {
  const v = parseInt(document.getElementById(plazoEl).value) || 0;
  // All short-term fields are meses-only; '2lp' now also meses-only
  return v;
}

function updEq1() { /* tab1 is meses-only, no equiv label needed */ }
function updEqCP() { /* CP is meses-only */ }
function updEqLP() { /* LP is meses-only */ }

// ══════════════════════════════════════════════════════════════════
// CONTROL LOCAL DE ACCESO — NO ES AUTENTICACIÓN DE SEGURIDAD
//
// Este archivo se ejecuta completamente en el navegador. Cualquier persona con
// acceso al código o a DevTools puede inspeccionar/modificar la lógica cliente.
// Por tanto, estas claves solo actúan como barrera operativa de interfaz.
// La autorización real de funciones sensibles debe implementarse fuera del
// frontend (servidor/SSO/API autenticada) antes de considerarlas protegidas.
//
// Las claves NO se almacenan en texto plano. Solo se conserva un derivado
// PBKDF2-SHA-256 con salt independiente por módulo.
// ══════════════════════════════════════════════════════════════════




const PIN_ITER = 210000;

// ── Reestructuración de Crédito: PBKDF2, 6 dígitos ──
const REFI_SALT = 'sim-credito-educativo-uninorte-v5-refinanciacion';
const REFI_LEN  = 6;
const REFI_HASH = 'd085a324aaa76bf490a51179b4899a16c76775cbd5684e252f0fdc298c9a0262';

// ── Actualizador: PBKDF2, 8 dígitos ──
const ADM_SALT  = 'sim-credito-educativo-uninorte-v4-actualizador';
const ADM_LEN   = 8;
const ADM_HASH  = 'f57f2e13a4c1101efb34f36aae9bdb554831dd8edcc198735eb4d249e5894ccf';

async function _hashPin(pin, salt){
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {name:'PBKDF2', salt: enc.encode(salt), iterations: PIN_ITER, hash:'SHA-256'},
    key, 256
  );
  return Array.from(new Uint8Array(bits)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// Utilidad de mantenimiento local. Genera únicamente el derivado para reemplazar
// manualmente la constante correspondiente. No convierte este control en auth real.
async function generarHashClave(nuevaClave, modulo='actualizador'){
  if(!/^\d+$/.test(nuevaClave)) { console.warn('La clave debe ser numérica.'); return; }
  const esRefi = modulo === 'refinanciacion';
  const salt = esRefi ? REFI_SALT : ADM_SALT;
  const h = await _hashPin(nuevaClave, salt);
  console.log('%c Control local: reemplaza las constantes del módulo en el código.', 'font-weight:bold');
  console.log(`LEN  = ${nuevaClave.length}`);
  console.log(`HASH = '${h}'`);
  return h;
}

// ── Gestión accesible de modales ─────────────────────────────────────────────
function _modalFocusable(root) {
  if(!root) return [];
  return Array.from(root.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null);
}

function _syncModalBackground() {
  const anyOpen = !!document.querySelector('.scrim[data-open="true"]');
  const app = document.querySelector('.app');
  if(app) {
    app.inert = anyOpen;
    if(anyOpen) app.setAttribute('aria-hidden','true');
    else app.removeAttribute('aria-hidden');
  }
  document.body.style.overflow = anyOpen ? 'hidden' : '';
}

function abrirModalAccesible(scrim, initialFocus) {
  if(!scrim) return;
  const current = document.activeElement;
  SimuladorOFE.state.ui.modalReturnFocus = current instanceof HTMLElement ? current : null;
  SimuladorOFE.state.ui.activeModalId = scrim.id || null;
  scrim.hidden = false;
  scrim.setAttribute('aria-hidden','false');
  requestAnimationFrame(() => {
    scrim.dataset.open = 'true';
    _syncModalBackground();
  });
  setTimeout(() => {
    const target = typeof initialFocus === 'string' ? scrim.querySelector(initialFocus) : initialFocus;
    (target || _modalFocusable(scrim)[0] || scrim.querySelector('.modal'))?.focus?.();
  }, 80);
}

function cerrarModalAccesible(scrim, restoreFocus = true) {
  if(!scrim) return;
  scrim.dataset.open = 'false';
  scrim.setAttribute('aria-hidden','true');
  const returnFocus = SimuladorOFE.state.ui.modalReturnFocus;
  SimuladorOFE.state.ui.activeModalId = null;
  SimuladorOFE.state.ui.modalReturnFocus = null;
  _syncModalBackground();
  setTimeout(() => {
    if(scrim.dataset.open !== 'true') scrim.hidden = true;
  }, 190);
  if(restoreFocus && returnFocus?.isConnected) setTimeout(() => returnFocus.focus(), 0);
}

function _trapModalFocus(e) {
  if(e.key !== 'Tab') return false;
  const open = Array.from(document.querySelectorAll('.scrim[data-open="true"]')).pop();
  if(!open) return false;
  const focusable = _modalFocusable(open);
  if(!focusable.length) { e.preventDefault(); open.querySelector('.modal')?.focus?.(); return true; }
  const first = focusable[0], last = focusable[focusable.length - 1];
  if(e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); return true; }
  if(!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); return true; }
  if(!open.contains(document.activeElement)) { e.preventDefault(); first.focus(); return true; }
  return false;
}

// ── Config por pestaña ──
function _pinCfg(target){
  return target === 6
    ? {len: ADM_LEN, verify: async p => (await _hashPin(p, ADM_SALT)) === ADM_HASH,
       titulo:'Control local · Actualizador de Programas',
       texto:'Ingresa la clave operativa. Este bloqueo ocurre solo en el navegador y no sustituye autenticación ni permisos del servidor.'}
    : {len: REFI_LEN, verify: async p => (await _hashPin(p, REFI_SALT)) === REFI_HASH,
       titulo:'Control local · Reestructuración de Crédito',
       texto:'Ingresa la clave operativa del equipo de crédito. Este bloqueo ocurre solo en el navegador y no constituye autorización de seguridad.'};
}

// Dibuja las casillas según la longitud de la clave requerida
function _renderPinInputs(len){
  const cont = document.getElementById('refi-pin-inputs');
  if(!cont) return;
  cont.innerHTML = '';
  for(let i=0;i<len;i++){
    const inp = document.createElement('input');
    inp.type='password'; inp.maxLength=1; inp.inputMode='numeric'; inp.id='rp'+i;
    inp.setAttribute('aria-label', `Dígito ${i+1} de ${len} de la clave`);
    inp.setAttribute('aria-describedby', 'pin-desc');
    inp.setAttribute('autocomplete', i===0 ? 'one-time-code' : 'off');
    inp.addEventListener('input', ()=>refiPinInput(i));
    inp.addEventListener('keydown', e=>{
      if(e.key==='Backspace' && !inp.value && i>0) document.getElementById('rp'+(i-1)).focus();
    });
    cont.appendChild(inp);
  }
  if(len > 6) cont.style.gap = '5px';
  else cont.style.gap = '8px';
}

function _abrirPinModal(target){
  SimuladorOFE.state.access.pinTarget = target;
  const cfg = _pinCfg(target);
  const t = document.getElementById('pin-title'), d = document.getElementById('pin-desc'), ic = document.getElementById('pin-icon');
  if(t) t.textContent = cfg.titulo;
  if(d) d.textContent = cfg.texto;
  if(ic) ic.innerHTML = icon(target === 6 ? 'settings' : 'lock', 'icon-lg');
  _renderPinInputs(cfg.len);
  abrirModalAccesible(document.getElementById('refi-pin-modal'), '#rp0');
}

const VIEW_META = Object.freeze({
  1:{section:'SIMULAR', title:'Crédito a Corto Plazo', desc:'Simula las condiciones de financiación para este escenario.', status:'Lineamientos vigentes'},
  2:{section:'SIMULAR', title:'Corto y Largo Plazo', desc:'Distribuye la financiación entre corto y largo plazo y revisa su impacto.', status:'Lineamientos vigentes'},
  3:{section:'SIMULAR', title:'Crédito Banco Aliado', desc:'Evalúa un escenario de financiación con las condiciones del banco aliado.', status:'Lineamientos vigentes'},
  5:{section:'SIMULAR', title:'Reestructuración de Crédito', desc:'Construye escenarios de reestructuración sobre un saldo existente.', status:'Control operativo'},
  7:{section:'ANALIZAR', title:'Cálculo de Cuota Inicial', desc:'Calcula la cuota inicial requerida a partir de la capacidad de pago mensual.', status:'Herramienta de análisis'},
  4:{section:'ANALIZAR', title:'Conversor de Tasas', desc:'Convierte tasas entre periodicidades para comparar condiciones equivalentes.', status:'Herramienta de análisis'},
  8:{section:'ANALIZAR', title:'Comparar escenarios', desc:'Accede a las comparaciones disponibles dentro de cada modalidad de simulación.', status:'Escenarios guardados'},
  9:{section:'HISTORIAL', title:'Mis simulaciones', desc:'Consulta las simulaciones recientes guardadas localmente en este navegador.', status:'Datos locales'},
  6:{section:'ADMINISTRACIÓN', title:'Actualizar Programas', desc:'Actualiza programas y valores publicados sin modificar el motor financiero.', status:'Acceso restringido'}
});

function switchTab(n) {
  if(n === 6 && !window.OFEPermissions?.allowed('programs.update')) { toast('La administración requiere la conexión institucional de DTIC.', 'warning'); return; }
  if(n === 5 && !SimuladorOFE.state.access.restructuringUnlocked) { _abrirPinModal(5); return; }
  document.querySelectorAll('.nav__item[data-tab]').forEach(b => {
    const on = Number(b.dataset.tab) === n;
    if(on) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('.view[data-view]').forEach(p => { p.hidden = Number(p.dataset.view) !== n; });
  const meta = window.OFETextSettings?.view(n,VIEW_META[n]) || VIEW_META[n];
  if(meta) {
    const ht = document.getElementById('header-title');
    const hd = document.getElementById('header-desc');
    const hs = document.getElementById('header-section');
    const hst = document.getElementById('header-status');
    if(ht) ht.textContent = meta.title;
    if(hd) hd.textContent = meta.desc;
    if(hs) hs.textContent = meta.section;
    if(hst) hst.textContent = meta.status;
    document.title = meta.title + ' · Simulador OFE';
  }
  toggleSidebar(false);
  if(n === 8 && typeof renderComparisonHub === 'function') renderComparisonHub();
  if(n === 9 && typeof renderHistorial === 'function') renderHistorial();
  enhanceTableAccessibility(document.getElementById('tab'+n) || document);
  window.scrollTo({top:0, behavior:'smooth'});
}


function refiPinInput(idx) {
  const len = _pinCfg(SimuladorOFE.state.access.pinTarget).len;
  const val = document.getElementById('rp'+idx).value.replace(/\D/g,'');
  document.getElementById('rp'+idx).value = val;
  if(val && idx < len-1) document.getElementById('rp'+(idx+1)).focus();
  if(idx === len-1 && val) verificarRefiPin();
}


async function verificarRefiPin() {
  if(SimuladorOFE.state.access.pinBusy) return;
  const cfg = _pinCfg(SimuladorOFE.state.access.pinTarget);
  const len = cfg.len;
  const pin = Array.from({length:len}, (_,i)=>document.getElementById('rp'+i)?.value||'').join('');
  if(pin.length < len) return;

  SimuladorOFE.state.access.pinBusy = true;
  const btn = document.querySelector('.btn-refi-pin');
  const btnTxt = btn ? btn.textContent : '';
  if(btn){ btn.textContent = 'Verificando…'; btn.disabled = true; btn.setAttribute('aria-busy','true'); btn.classList.add('is-busy'); }

  const ok = await cfg.verify(pin);

  if(btn){ btn.textContent = btnTxt; btn.disabled = false; btn.removeAttribute('aria-busy'); btn.classList.remove('is-busy'); }
  SimuladorOFE.state.access.pinBusy = false;

  if(ok) {
    if(SimuladorOFE.state.access.pinTarget === 6) SimuladorOFE.state.access.updaterUnlocked = true; else SimuladorOFE.state.access.restructuringUnlocked = true;
    cerrarModalAccesible(document.getElementById('refi-pin-modal'));
    for(let i=0;i<len;i++){ const el=document.getElementById('rp'+i); if(el) el.value=''; }
    document.getElementById('refi-pin-error').hidden = true;
    const _t = SimuladorOFE.state.access.pinTarget;
    switchTab(_t);
    if(_t === 6) setTimeout(()=>{ autoLeerSimulador(); }, 150);
  } else {
    const err = document.getElementById('refi-pin-error');
    err.innerHTML = '<span class="note__icon">'+icon('alert-triangle')+'</span><div>Clave incorrecta. Inténtalo de nuevo.</div>';
    err.hidden = false;
    setTimeout(()=>{ err.hidden = true; }, 3000);
    for(let i=0;i<len;i++){
      const el = document.getElementById('rp'+i);
      if(!el) continue;
      el.value=''; el.dataset.error='true'; el.setAttribute('aria-invalid','true');
      setTimeout(()=>{ el.dataset.error='false'; el.removeAttribute('aria-invalid'); }, 400);
    }
    document.getElementById('rp0')?.focus();
  }
}

function cancelarRefiPin() {
  cerrarModalAccesible(document.getElementById('refi-pin-modal'));
  const len = _pinCfg(SimuladorOFE.state.access.pinTarget).len;
  for(let i=0;i<len;i++){ const el=document.getElementById('rp'+i); if(el) el.value=''; }
}

// ── Escape global: cierra la capa superior abierta (modales y menú lateral) ──
function handleGlobalKeyboard(e) {
  if(e.key === 'Tab' && _trapModalFocus(e)) return;
  if(e.key !== 'Escape' && e.key !== 'Enter') return;

  const pin  = document.getElementById('refi-pin-modal');
  const idi  = document.getElementById('modal-idiomas');
  const cfm  = document.getElementById('confirm-modal');
  const side = document.getElementById('sidebar');
  const activeModal = SimuladorOFE.state.ui.activeModalId ? document.getElementById(SimuladorOFE.state.ui.activeModalId) : null;
  const pinAbierto  = pin  && pin.dataset.open  === 'true';
  const idiAbierto  = idi  && idi.dataset.open  === 'true';
  const cfmAbierto  = cfm  && cfm.dataset.open  === 'true';
  const genericAbierto = activeModal && activeModal.dataset.open === 'true' && ![pin, idi, cfm].includes(activeModal);
  const sideAbierto = side && side.dataset.open === 'true';

  // Enter verifica la clave únicamente desde sus casillas; no intercepta botones.
  if(e.key === 'Enter') {
    if(pinAbierto && e.target?.closest?.('.pin-inputs')) { e.preventDefault(); verificarRefiPin(); }
    return;
  }

  // Orden de cierre: lo más superficial primero
  if(cfmAbierto)          { cancelConfirm();     e.preventDefault(); }
  else if(pinAbierto)     { cancelarRefiPin(); e.preventDefault(); }
  else if(idiAbierto)     { cerrarIdiomas();   e.preventDefault(); }
  else if(genericAbierto) { cerrarModalAccesible(activeModal); e.preventDefault(); }
  else if(sideAbierto)    { toggleSidebar(false); e.preventDefault(); }
}


SimuladorOFE.register('core-ui', {
  async init(app){
    initTheme();
    await window.OFEPermissions?.refresh();
    [1,2,3,7].forEach(id => { poblarSubniveles(id); poblarProgramas(id); sincronizarMatriculaCatalogo(id); window.ProgramPicker?.init(id); });
    _syncSidebarA11y();
    window.addEventListener('resize', _syncSidebarA11y, {passive:true});
    document.addEventListener('keydown', handleGlobalKeyboard);
    initDynamicAccessibility();
    app.services['core-ui'] = Object.assign(app.services['core-ui'] || {}, {
      abrirModal: abrirModalAccesible,
      cerrarModal: cerrarModalAccesible,
      runButtonTask,
      enhanceTables: enhanceTableAccessibility,
      confirmAction,
      showFieldError,
      clearFieldError,
      selectedProgram: programaSeleccionado
    });
  }
});

// ======================================================
// SELECCIÓN COMPARTIDA DE PROGRAMAS Y TASAS
// ======================================================
function calcTA(id) {
  const tm = parseFloat(document.getElementById('tasa'+id).value)/100;
  if(!isNaN(tm)) document.getElementById('ta'+id).textContent = ((Math.pow(1+tm,12)-1)*100).toFixed(2)+'%';
}
calcTA(1); calcTA(2); calcTA(3);

function setMat(id) {
  if (!document.getElementById('prog'+id)) return;
  window.SimulationLifecycle?.beforeProgramChange(id, document.getElementById('prog'+id).value);
  const program = sincronizarMatriculaCatalogo(id);
  if (!program) return limpiarSeleccionPrograma(id);
  const { valorMatricula: valor, valorIdiomas: idiomas, nivel, semestres, nombre } = program;
  document.getElementById('mat'+id).value = valor;
  fmtLbl('mat'+id);
  window.ProgramPicker?.sync(id);
  if (id === 2 && nivel === 'pregrado') {
    const plazo = document.getElementById('plazoLP');
    if (plazo) {
      plazo.value = semestres || 8;
      calcPlazoLPAuto();
    }
  }
  if (id === 7) {
    SimuladorOFE.state.results.initialPaymentProgramName = nombre;
    recalc7();
  } else {
    recalcAll(id);
  }
  const button = document.getElementById('btn-idiomas-'+id);
  if (button) {
    if (nivel === 'pregrado' && idiomas > 0) {
      button.style.display = 'grid';
      button.dataset.idiomas = idiomas;
      button.dataset.prog = nombre;
      button.querySelector('.idiomas-val').textContent = cop(idiomas);
    } else {
      button.style.display = 'none';
      delete button.dataset.idiomas;
      delete button.dataset.prog;
    }
  }
}
