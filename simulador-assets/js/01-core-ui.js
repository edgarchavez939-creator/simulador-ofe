// ══════════════════════════════════════════════════════════════════
// Iconografía — set Lucide, SVG inline con currentColor (viewBox 0 0 24 24)
// ══════════════════════════════════════════════════════════════════
const ICONS = {
  'graduation-cap': '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  'landmark':       '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  'calendar':       '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  'git-branch':     '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  'building':       '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  'repeat':         '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  'rotate-ccw':     '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  'settings':       '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'moon':           '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  'sun':            '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  'banknote':       '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  'gift':           '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  'credit-card':    '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  'trending-up':    '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  'bar-chart':      '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  'file-text':      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>',
  'files':          '<path d="M15 2H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4 8v12a2 2 0 0 0 2 2h9"/>',
  'save':           '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7"/>',
  'scale':          '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  'trash':          '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  'trash-2':        '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  'eye':            '<path d="M2.06 12.35a1 1 0 0 1 0-.7C3.73 7.6 7.7 5 12 5c4.3 0 8.27 2.6 9.94 6.65a1 1 0 0 1 0 .7C20.27 16.4 16.3 19 12 19c-4.3 0-8.27-2.6-9.94-6.65Z"/><circle cx="12" cy="12" r="3"/>',
  'copy':           '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'history':        '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  'lock':           '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'search':         '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'download':       '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  'upload':         '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  'cloud-upload':   '<path d="M12 13v8M16 16l-4-3-4 3"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
  'check-circle':   '<path d="M21.8 10A10 10 0 1 1 17 3.34"/><path d="m9 11 3 3L22 4"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  'x-circle':       '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  'x':              '<path d="M18 6 6 18M6 6l12 12"/>',
  'arrow-right':    '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'arrows-h':       '<path d="m18 8 4 4-4 4M2 12h20M6 8l-4 4 4 4"/>',
  'circle-dot':     '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',
  'lightbulb':      '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
  'clipboard':      '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  'book-open':      '<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  'globe':          '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  'info':           '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  'scissors':       '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  'link':           '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'clock':          '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  'percent':        '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  'table':          '<path d="M12 3v18M3 9h18M3 15h18"/><rect width="18" height="18" x="3" y="3" rx="2"/>',
  'wallet':         '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  'menu':           '<path d="M4 12h16M4 6h16M4 18h16"/>',
  'inbox':          '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  'calculator':     '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>',
  'refresh':        '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
  'plus':           '<path d="M5 12h14M12 5v14"/>',
  'external-link':  '<path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'chevron-down':   '<path d="m6 9 6 6 6-6"/>',
  'shield':         '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  'rocket':         '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
};

function icon(name, cls) {
  const p = ICONS[name];
  if (!p) return '';
  return '<svg class="icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
}

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
function runButtonTask(button, task) {
  if(typeof task !== 'function') return;
  if(!button) return task();
  if(button.getAttribute('aria-busy') === 'true') return;
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
  setResultLoading(tabId, loadingTitle);
  return runButtonTask(button, () => {
    const result = task();
    const after=calculationResultForTab(tabId);
    if(after && after !== before) requestAnimationFrame(()=>markViewHasResult(tabId, true));
    else if(target) { target.innerHTML=previousHTML; markViewHasResult(tabId, !!before); }
    return result;
  });
}

function toast(mensaje, tipo){
  const cont = document.getElementById('toasts');
  if(!cont) return;
  const ic = {success:'check-circle', error:'x-circle', warning:'alert-triangle', info:'info'}[tipo] || 'info';
  const el = document.createElement('div');
  el.className = 'toast' + (tipo ? ' toast--'+tipo : '');
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
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const ico = document.getElementById('theme-ico');
  const lbl = document.getElementById('theme-label');
  if(ico) ico.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
  if(lbl) lbl.textContent = theme === 'dark' ? 'Tema claro' : 'Tema oscuro';
  try { localStorage.setItem('simulador_tema', theme); } catch(e){}
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}
function initTheme(){
  let saved = 'light';
  try { saved = localStorage.getItem('simulador_tema') || 'light'; } catch(e){}
  applyTheme(saved);
}

const GARANTISA_CP = SimuladorOFE.config.garantisaCP;
const GARANTISA_LP = SimuladorOFE.config.garantisaLP;

const cop = v => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0}).format(Math.round(v));

// Populate selects
// nivel state per tab
const nivelState = SimuladorOFE.state.ui.levelByTab;

function poblarProgramas(tabId) {
  const sel = document.getElementById('prog'+tabId);
  if(!sel) return;
  const nivel = nivelState[tabId];
  const subnivel = (document.getElementById('subnivel'+tabId)||{}).value || '';
  sel.innerHTML = '<option value="">— Seleccionar programa —</option>';
  if(nivel === 'pregrado') {
    PROGRAMAS.forEach(([n, v, idiomas, sem]) => {
      const o = document.createElement('option');
      o.value = JSON.stringify({v, idiomas: idiomas||0, semestres: sem||8, nivel:'pregrado'});
      o.textContent = n;
      sel.appendChild(o);
    });
  } else {
    const filtrados = subnivel ? POSGRADOS.filter(p=>p[1]===subnivel) : POSGRADOS;
    filtrados.forEach(([n,s,v]) => {
      const o = document.createElement('option');
      o.value = JSON.stringify({v, idiomas:0, nivel:'posgrado', subnivel:s});
      o.textContent = n + (subnivel ? '' : ' ('+s+')');
      sel.appendChild(o);
    });
  }
}

function setNivel(tabId, nivel) {
  nivelState[tabId] = nivel;
  _pressed(document.getElementById('nbtn-'+tabId+'-pre'), nivel==='pregrado');
  _pressed(document.getElementById('nbtn-'+tabId+'-pos'), nivel==='posgrado');
  const sfg = document.getElementById('subnivel-fg-'+tabId);
  if(sfg) sfg.style.display = nivel==='posgrado' ? 'block' : 'none';
  // reset subnivel select
  const snSel = document.getElementById('subnivel'+tabId);
  if(snSel) snSel.value = '';
  // reset idiomas btn
  const ib = document.getElementById('btn-idiomas-'+tabId);
  if(ib) ib.style.display = 'none';
  poblarProgramas(tabId);
  // clear mat
  const matEl = document.getElementById('mat'+tabId);
  if(matEl){ matEl.value=''; fmtLbl('mat'+tabId); }
}

function filtrarProgramas(tabId) {
  poblarProgramas(tabId);
  const matEl = document.getElementById('mat'+tabId);
  if(matEl){ matEl.value=''; fmtLbl('mat'+tabId); }
  const ib = document.getElementById('btn-idiomas-'+tabId);
  if(ib) ib.style.display = 'none';
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
  1:{section:'SIMULAR', title:'Crédito a Corto Plazo', desc:'Define matrícula, aporte inicial, plazo y tasa para estimar la cuota del crédito a corto plazo.', status:'Lineamientos vigentes'},
  2:{section:'SIMULAR', title:'Corto y Largo Plazo', desc:'Distribuye el monto financiado entre corto y largo plazo y revisa el efecto de cada tramo.', status:'Lineamientos vigentes'},
  3:{section:'SIMULAR', title:'Crédito Banco Aliado', desc:'Evalúa la financiación con el banco aliado usando el programa, plazo y tasa aplicables.', status:'Lineamientos vigentes'},
  5:{section:'SIMULAR', title:'Reestructuración de Crédito', desc:'Recalcula un saldo vigente bajo nuevas condiciones y revisa su impacto financiero.', status:'Control operativo'},
  7:{section:'ANALIZAR', title:'Cálculo de Cuota Inicial', desc:'Estima cuánto debes aportar al inicio según tu capacidad máxima de pago mensual.', status:'Herramienta de análisis'},
  4:{section:'ANALIZAR', title:'Conversor de Tasas', desc:'Convierte una tasa a periodicidades equivalentes para comparar alternativas bajo la misma base.', status:'Herramienta de análisis'},
  8:{section:'ANALIZAR', title:'Comparar escenarios', desc:'Accede a las comparaciones disponibles dentro de cada modalidad de simulación.', status:'Escenarios guardados'},
  9:{section:'HISTORIAL', title:'Mis simulaciones', desc:'Consulta las simulaciones recientes guardadas localmente en este navegador.', status:'Datos locales'},
  6:{section:'ADMINISTRACIÓN', title:'Actualizar Programas', desc:'Actualiza programas y valores publicados sin modificar el motor financiero.', status:'Acceso restringido'}
});

function switchTab(n) {
  if(n === 6 && !SimuladorOFE.state.access.updaterUnlocked)  { _abrirPinModal(6); return; }
  if(n === 5 && !SimuladorOFE.state.access.restructuringUnlocked) { _abrirPinModal(5); return; }
  document.querySelectorAll('.nav__item[data-tab]').forEach(b => {
    const on = Number(b.dataset.tab) === n;
    if(on) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('.view[data-view]').forEach(p => { p.hidden = Number(p.dataset.view) !== n; });
  const meta = VIEW_META[n];
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
  init(app){
    initTheme();
    [1,2,3,7].forEach(id => poblarProgramas(id));
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
      clearFieldError
    });
  }
});
