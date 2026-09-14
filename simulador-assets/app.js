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
  cont.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(6px)'; setTimeout(()=>el.remove(),200); }, 4200);
}

// ── Menú lateral (pantallas angostas) ──
function toggleSidebar(open){
  const sb = document.getElementById('sidebar'), sc = document.getElementById('sidebar-scrim');
  if(!sb) return;
  const v = open === undefined ? sb.dataset.open !== 'true' : open;
  sb.dataset.open = v ? 'true' : 'false';
  if(sc) sc.dataset.open = v ? 'true' : 'false';
  const mb = document.getElementById('menu-btn');
  if(mb) mb.setAttribute('aria-expanded', v ? 'true' : 'false');
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
(function initTheme(){
  let saved = 'light';
  try { saved = localStorage.getItem('simulador_tema') || 'light'; } catch(e){}
  applyTheme(saved);
})();

const GARANTISA_CP = 0.0417;
const GARANTISA_LP = 0.0286;

const cop = v => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0}).format(Math.round(v));

// Populate selects
// nivel state per tab
const nivelState = {1:'pregrado', 2:'pregrado', 3:'pregrado', 7:'pregrado'};

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

[1,2,3,7].forEach(id => poblarProgramas(id));

// Unidad state
const unidades = { 1: 'm', '2cp': 'm', '2lp': 'm' };

function setUnidad(tab, u, seg) {
  const key = seg ? tab+seg : String(tab);
  unidades[key] = u;
  if (!seg) {
    _pressed(document.getElementById('u'+tab+'-m'), u==='m');
    _pressed(document.getElementById('u'+tab+'-a'), u==='a');
    updEq1();
  } else if (seg==='cp') {
    updEqCP(); // CP plazo is meses-only, no toggle
  } else {
    updEqLP();
  }
}

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
let _refiUnlocked = false;
let _admUnlocked  = false;
let _pinTarget    = 5;

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

// Alias conservado por compatibilidad con instrucciones/versiones anteriores.
async function cambiarClaveActualizador(nuevaClave){
  return generarHashClave(nuevaClave, 'actualizador');
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
  _pinTarget = target;
  const cfg = _pinCfg(target);
  const t = document.getElementById('pin-title'), d = document.getElementById('pin-desc'), ic = document.getElementById('pin-icon');
  if(t) t.textContent = cfg.titulo;
  if(d) d.textContent = cfg.texto;
  if(ic) ic.innerHTML = icon(target === 6 ? 'settings' : 'lock', 'icon-lg');
  _renderPinInputs(cfg.len);
  document.getElementById('refi-pin-modal').dataset.open = 'true';
  setTimeout(()=>document.getElementById('rp0')?.focus(), 120);
}

function switchTab(n) {
  if(n === 6 && !_admUnlocked)  { _abrirPinModal(6); return; }
  if(n === 5 && !_refiUnlocked) { _abrirPinModal(5); return; }
  document.querySelectorAll('.nav__item[data-tab]').forEach(b => {
    const on = Number(b.dataset.tab) === n;
    if(on) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('.view[data-view]').forEach(p => { p.hidden = Number(p.dataset.view) !== n; });
  const t = document.querySelector('.nav__item[data-tab="'+n+'"] .nav__item-text');
  const ht = document.getElementById('header-title');
  if(t && ht) ht.textContent = t.textContent;
  toggleSidebar(false);
  window.scrollTo({top:0, behavior:'smooth'});
}

function refiPinInput(idx) {
  const len = _pinCfg(_pinTarget).len;
  const val = document.getElementById('rp'+idx).value.replace(/\D/g,'');
  document.getElementById('rp'+idx).value = val;
  if(val && idx < len-1) document.getElementById('rp'+(idx+1)).focus();
  if(idx === len-1 && val) verificarRefiPin();
}

let _pinBusy = false;
async function verificarRefiPin() {
  if(_pinBusy) return;
  const cfg = _pinCfg(_pinTarget);
  const len = cfg.len;
  const pin = Array.from({length:len}, (_,i)=>document.getElementById('rp'+i)?.value||'').join('');
  if(pin.length < len) return;

  _pinBusy = true;
  const btn = document.querySelector('.btn-refi-pin');
  const btnTxt = btn ? btn.textContent : '';
  if(btn){ btn.textContent = 'Verificando…'; btn.disabled = true; }

  const ok = await cfg.verify(pin);

  if(btn){ btn.textContent = btnTxt; btn.disabled = false; }
  _pinBusy = false;

  if(ok) {
    if(_pinTarget === 6) _admUnlocked = true; else _refiUnlocked = true;
    document.getElementById('refi-pin-modal').dataset.open = 'false';
    for(let i=0;i<len;i++){ const el=document.getElementById('rp'+i); if(el) el.value=''; }
    document.getElementById('refi-pin-error').hidden = true;
    const _t = _pinTarget;
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
      el.value=''; el.dataset.error='true';
      setTimeout(()=>{ el.dataset.error='false'; }, 400);
    }
    document.getElementById('rp0')?.focus();
  }
}

function cancelarRefiPin() {
  document.getElementById('refi-pin-modal').dataset.open = 'false';
  const len = _pinCfg(_pinTarget).len;
  for(let i=0;i<len;i++){ const el=document.getElementById('rp'+i); if(el) el.value=''; }
}

// ── Escape global: cierra la capa superior abierta (modales y menú lateral) ──
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape' && e.key !== 'Enter') return;

  const pin  = document.getElementById('refi-pin-modal');
  const idi  = document.getElementById('modal-idiomas');
  const side = document.getElementById('sidebar');
  const pinAbierto  = pin  && pin.dataset.open  === 'true';
  const idiAbierto  = idi  && idi.dataset.open  === 'true';
  const sideAbierto = side && side.dataset.open === 'true';

  if(e.key === 'Enter') { if(pinAbierto) verificarRefiPin(); return; }

  // Orden de cierre: lo más superficial primero
  if(pinAbierto)       { cancelarRefiPin(); e.preventDefault(); }
  else if(idiAbierto)  { cerrarIdiomas();   e.preventDefault(); }
  else if(sideAbierto) { toggleSidebar(false); e.preventDefault(); }
});

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
const _escRefi = [];  // [{n, tm, costos, principal, cuota, totInt, totCap, totalGeneral, rows, label, sub}]

function calcularRefi() {
  const capital = parseFloat(document.getElementById('refi-capital').value)||0;
  const intCorr = parseFloat(document.getElementById('refi-intcorr').value)||0;
  const mora    = parseFloat(document.getElementById('refi-mora').value)||0;
  const saldo   = capital + intCorr + mora;
  const nNva    = parseInt(document.getElementById('refi-cuotas-nva').value)||0;
  const tmNva   = parseFloat(document.getElementById('refi-tasa-nva').value)/100;
  const costos  = parseFloat(document.getElementById('refi-costos').value)||0;
  const ingreso = parseFloat(document.getElementById('refi-ingreso').value)||0;

  if(!capital||capital<=0) return alert('Ingresa al menos el capital pendiente.');
  if(!nNva||nNva<=0)   return alert('Ingresa el plazo de la refinanciación.');
  if(isNaN(tmNva))     return alert('Ingresa la tasa de refinanciación.');

  const principal = saldo + costos;
  const B = amortizacion(principal, tmNva, nNva);
  const totalB = B.totCap + B.totInt;

  // Store current scenario data on window for "guardar"
  window._refiActual = {
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
    <div class="card-title" style="color:var(--info);">Escenario de Reestructuración</div>

    <div class="section__title u-mt-5" style="margin-top:0;color:var(--info);">Saldo a la fecha</div>
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
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div>
            <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;">Cuota vs Ingreso</div>
            <div style="font-size:22px;font-weight:700;color:${color};">${pct.toFixed(1)}%</div>
          </div>
          <div class="u-text-right">
            <div class="u-fs-11-muted">Diagnóstico</div>
            <div style="font-size:15px;font-weight:700;color:${color};">${nivel}</div>
          </div>
        </div>
        <div style="background:var(--surface);border-radius:20px;height:10px;overflow:hidden;margin-bottom:10px;">
          <div style="height:100%;width:${Math.min(100,pct)}%;background:${color};border-radius:20px;transition:width .4s;"></div>
        </div>
        <div style="font-size:12px;color:var(--text);line-height:1.6;">${msg}</div>
        <div style="font-size:11px;color:var(--text-3);margin-top:8px;">Cuota ${cop(B.cuota)} sobre ingreso ${cop(ingreso)} · Disponible tras cuota: ${cop(ingreso-B.cuota)}</div>
      </div>`;
    })() : ''}

    <div class="section__title u-mt-5">Plan de Pagos (${nNva} cuotas)</div>
    ${renderTabla(B.rows, B.cuota, B.totInt, B.totCap)}

    <div class="btn-row" style="margin-top:14px;">
      <button class="btn btn--sm u-flex-1" data-action="guardar-esc-refi">${icon('save')} Guardar para comparar</button>
      <button class="btn btn--sm" data-action="pdf-refi">${icon('file-text')} PDF Escenario</button>
    </div>
  </div>`;

  renderEscRefi();
}

// ── PDF: single refinancing scenario ─────────────────────────────────────────
function expPDFRefi() {
  const d = window._refiActual;
  if(!d) return alert('Primero calcula un escenario.');
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  let y = pdfHeader(doc, 'Refinanciacion', d.label);
  y = pdfCondiciones(doc, y, {
    modalidad: 'Refinanciacion de saldo',
    tasa: d.tm,
    plazo: d.n + ' cuotas mensuales',
    extra: d.costos > 0 ? [['Costos de refinanciacion', cop(d.costos)]] : null
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
  if(d.costos>0){ fr.push(['Costos refinanciacion',cop(d.costos)]); fr.push(['Monto financiado (saldo+costos)',cop(d.principal)]); }
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

  doc.save(safePDF('Refinanciacion - '+d.label)+'.pdf');
}

// ── PDF: comparison of scenarios ─────────────────────────────────────────────
function expPDFRefiComp() {
  if(_escRefi.length < 2) return alert('Guarda al menos 2 escenarios para comparar.');
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
  pdfText(doc,'Comparativa de Refinanciacion - '+_escRefi.length+' escenarios',MARGIN,28);
  doc.setTextColor(0,0,0);
  let y = 48;
  doc.setFont('helvetica','italic'); doc.setFontSize(9); doc.setTextColor(125,116,106);
  pdfText(doc,'Generado el '+new Date().toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}),MARGIN,y);
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal'); doc.setFontSize(11); y+=8;

  // Saldo base bar
  doc.setFillColor(45,95,110); doc.rect(MARGIN,y-5,CONTENT_W,8,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  pdfText(doc,'SALDO BASE A REFINANCIAR',MARGIN+2,y);
  pdfText(doc,cop(_escRefi[0].saldo),PW-MARGIN-2,y,{align:'right'});
  doc.setTextColor(0,0,0); doc.setFontSize(11); y+=12;

  // Comparison table — dynamic columns
  doc.setFillColor(26,58,92); doc.rect(MARGIN,y-5,CONTENT_W,8,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  pdfText(doc,'COMPARATIVA DE ESCENARIOS',MARGIN+2,y);
  doc.setTextColor(0,0,0); doc.setFontSize(11); y+=10;

  const n = _escRefi.length;
  const conceptW = 70;
  const colW = (CONTENT_W - conceptW) / n;  // distribute remaining width evenly
  const colRight = i => MARGIN + conceptW + i*colW + colW - 4;  // right edge of each col

  // Header row with scenario labels
  doc.setFillColor(26,58,92); doc.setTextColor(255,255,255); doc.rect(MARGIN,y-5,CONTENT_W,9,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9);
  pdfText(doc,'Concepto',MARGIN+2,y);
  _escRefi.forEach((e,i)=>{
    pdfText(doc,'Escenario '+(i+1),colRight(i),y-1,{align:'right'});
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    pdfText(doc,e.label,colRight(i),y+3,{align:'right'});
    doc.setFontSize(9); doc.setFont('helvetica','bold');
  });
  y+=11; doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');

  const rows = [
    ['Plazo', _escRefi.map(e=>e.n+' meses')],
    ['Tasa mensual', _escRefi.map(e=>(e.tm*100).toFixed(2)+'%')],
    ['Tasa efectiva anual', _escRefi.map(e=>((Math.pow(1+e.tm,12)-1)*100).toFixed(2)+'%')],
    ['Costos refinanciacion', _escRefi.map(e=>cop(e.costos))],
    ['Monto financiado', _escRefi.map(e=>cop(e.principal))],
    ['Cuota mensual', _escRefi.map(e=>cop(e.cuota))],
    ['Total intereses', _escRefi.map(e=>cop(e.totInt))],
    ['TOTAL A PAGAR', _escRefi.map(e=>cop(e.totalGeneral))],
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
    'Recomendado: Escenario '+(a.idxMenorCosto+1)+' ('+_escRefi[a.idxMenorCosto].label+')',
    ce, MARGIN, {bg:[232,245,233], text:[46,125,50]}
  );
  const yEnd2 = renderColumn(
    'ANALISIS PARA EL OTORGANTE',
    'Recomendado: Escenario '+(a.idxMenorPlazo+1)+' ('+_escRefi[a.idxMenorPlazo].label+')',
    co, MARGIN+halfW2+10, {bg:[224,247,250], text:[0,131,143]}
  );

  // Indicators summary table at bottom
  let yInd = Math.max(yEnd1, yEnd2) + 6;
  if(yInd > 175) { doc.addPage(); yInd = 24; }
  doc.setFillColor(26,58,92); doc.rect(MARGIN,yInd-5,CONTENT_W,8,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  pdfText(doc,'INDICADORES FINANCIEROS POR ESCENARIO',MARGIN+2,yInd);
  doc.setTextColor(0,0,0); yInd += 10;

  const nn = _escRefi.length, cW = (CONTENT_W-70)/nn;
  const cRight = i => MARGIN+70+i*cW+cW-4;
  doc.setFillColor(26,58,92); doc.setTextColor(255,255,255); doc.rect(MARGIN,yInd-5,CONTENT_W,7,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
  pdfText(doc,'Indicador',MARGIN+2,yInd);
  _escRefi.forEach((e,i)=>pdfText(doc,'Esc.'+(i+1),cRight(i),yInd,{align:'right'}));
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
  doc.save('Comparativa Refinanciacion.pdf');
}

function guardarEscRefi() {
  if(!window._refiActual) return;
  if(_escRefi.length >= 3) _escRefi.shift();
  _escRefi.push(JSON.parse(JSON.stringify(window._refiActual)));
  renderEscRefi();
}

function eliminarEscRefi(idx) {
  _escRefi.splice(idx, 1);
  renderEscRefi();
}

function renderEscRefi() {
  const panel = document.getElementById('esc-panel-refi');
  if(!panel) return;
  if(_escRefi.length === 0) { panel.hidden = true; return; }
  panel.hidden = false;
  const colors = ['var(--info)','var(--success)','var(--info)'];
  let html = `<div class="card__head u-mt-5">
    <h3>${icon('clipboard')} Escenarios Guardados (${_escRefi.length}/3)</h3>
    ${_escRefi.length >= 2 ? `<button class="btn btn--sm btn--primary" data-action="comparar-esc-refi"> Comparar</button>` : ''}
  </div><div class="list">`;
  _escRefi.forEach((e,i) => {
    html += `<div class="list-item">
      <div class="step-num step-num--fill" style="background:${colors[i]}">${i+1}</div>
      <div class="list-item__main"><strong>${escHTML(e.label)}</strong><span>${escHTML(e.sub)}</span></div>
      <div style="text-align:right;margin-right:8px;">
        <div style="font-size:13px;font-weight:700;color:${colors[i]};">${cop(e.cuota)}/mes</div>
        <div class="u-fs-11-muted">Total: ${cop(e.totalGeneral)}</div>
      </div>
      <button class="btn btn--ghost btn--icon btn--sm" data-action="eliminar-esc-refi" data-index="${i}" title="Eliminar">${icon('x')}</button>
    </div>`;
  });
  html += '</div>';
  panel.innerHTML = html;
}


// ── Motor de análisis financiero de escenarios de reestructuración ─────────────
function analizarEscenariosRefi() {
  const list = _escRefi;
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
  if(_escRefi.length < 2) return;
  const colors = ['var(--info)','var(--success)','var(--info)'];
  const fields = [
    {key:'saldo',        label:'Saldo a refinanciar'},
    {key:'costos',       label:'Costos refinanciación'},
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
  const bestEstIdx = _escRefi.reduce((b,e,i)=> e.totalGeneral < _escRefi[b].totalGeneral ? i : b, 0);
  const bestCuotaIdx = _escRefi.reduce((b,e,i)=> e.cuota < _escRefi[b].cuota ? i : b, 0);
  // Otorgante: prioriza menor plazo (recupera más rápido) y mayor interés (ingreso)
  const bestOtoIdx = _escRefi.reduce((b,e,i)=>{
    if(e.n < _escRefi[b].n) return i;
    if(e.n === _escRefi[b].n && e.totInt > _escRefi[b].totInt) return i;
    return b;
  }, 0);

  const colE = 'var(--success)', colO = 'var(--info)';
  const _a = analizarEscenariosRefi();
  const _ce = comentarioEstudiante(_a);
  const _co = comentarioOtorgante(_a);

  let html = `<div class="card__head u-mt-5"><h3>${icon('scale')} Comparativa de Escenarios</h3>
    <button class="btn btn--sm btn--primary" style="background:var(--danger);" data-action="pdf-refi-comp">${icon('file-text')} PDF Comparativa</button>
  </div>

  <div class="verdict-grid">
    <div class="verdict" style="background:var(--success-soft);border-color:${colE};">
      <div class="verdict__title" style="color:${colE};">${icon('graduation-cap')} Análisis para el Estudiante</div>
      <div class="verdict__head" style="color:${colE};">Recomendado: Escenario ${_a.idxMenorCosto+1} — ${_escRefi[_a.idxMenorCosto].label}</div>
      <div class="verdict__body">${_ce.map(l=>'<div style="margin-bottom:6px;">'+l+'</div>').join('')}</div>
    </div>
    <div class="verdict" style="background:var(--info-soft);border-color:${colO};">
      <div class="verdict__title" style="color:${colO};">${icon('landmark')} Análisis para el Otorgante</div>
      <div class="verdict__head" style="color:${colO};">Recomendado: Escenario ${_a.idxMenorPlazo+1} — ${_escRefi[_a.idxMenorPlazo].label}</div>
      <div class="verdict__body">${_co.map(l=>'<div style="margin-bottom:6px;">'+l+'</div>').join('')}</div>
    </div>
  </div>
  <div style="overflow-x:auto;"><table class="tbl"><thead><tr>
    <th class="u-text-left">Concepto</th>
    ${_escRefi.map((e,i)=>`<th class="th--fill" style="background:${colors[i]};">Escenario ${i+1}<br><span style="font-size:10px;opacity:.8;font-weight:400;">${e.label}</span></th>`).join('')}
  </tr></thead><tbody>`;

  fields.forEach(f => {
    const vals = _escRefi.map((e,i) => {
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
    ${_escRefi.slice(1).map((e,i)=>{
      const d = e.totalGeneral - _escRefi[0].totalGeneral;
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
  _escRefi.splice(0, _escRefi.length);
  window._refiActual = null;
  renderEscRefi();
  document.getElementById('res-refi').innerHTML = `
    <div class="card" style="text-align:center;padding:60px 24px;color:var(--text-3);">
      <div style="font-size:48px;margin-bottom:16px;opacity:.3;">${icon('rotate-ccw')}</div>
      <p style="font-size:14px;">Ingresa el saldo a la fecha y los datos de un escenario de refinanciación, luego presiona <strong>Calcular Escenario</strong></p>
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
  if(id === 7) { window._prog7Nombre = progNombre; recalc7(); }
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


// ══════════════════════════════════════════════════════════════════
// SEPARADOR DE MILES EN VIVO
// Los campos de dinero se convierten a texto para poder mostrar los
// puntos de miles mientras se escribe. Para no romper las lecturas
// existentes (parseFloat(el.value)), se sombrea la propiedad `value`
// del elemento: devuelve solo dígitos, mientras en pantalla se ve
// el número formateado.
// ══════════════════════════════════════════════════════════════════
const _NAT_VALUE = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

function _fmtMiles(v) {
  const d = String(v == null ? '' : v).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
}

function aplicarSeparadorMiles(el) {
  if(!el || el.dataset.money === '1') return;
  el.dataset.money = '1';

  // type=number no admite puntos: se pasa a texto con teclado numérico
  el.setAttribute('type', 'text');
  el.setAttribute('inputmode', 'numeric');
  el.setAttribute('autocomplete', 'off');

  const previo = _NAT_VALUE.get.call(el);

  Object.defineProperty(el, 'value', {
    configurable: true,
    get() { return _NAT_VALUE.get.call(this).replace(/\./g, ''); },
    set(v) { _NAT_VALUE.set.call(this, _fmtMiles(v)); }
  });

  // Reformatea conservando la posición del cursor
  el.addEventListener('input', function() {
    const bruto = _NAT_VALUE.get.call(this);
    const pos   = this.selectionStart || 0;
    const digitosAntes = bruto.slice(0, pos).replace(/\D/g, '').length;
    const nuevo = _fmtMiles(bruto);
    if(nuevo !== bruto) {
      _NAT_VALUE.set.call(this, nuevo);
      // Reubicar el cursor tras la misma cantidad de dígitos
      let cuenta = 0, idx = 0;
      while(idx < nuevo.length && cuenta < digitosAntes) {
        if(/\d/.test(nuevo[idx])) cuenta++;
        idx++;
      }
      try { this.setSelectionRange(idx, idx); } catch(e) {}
    }
  });

  // Al pegar, limpiar cualquier formato de origen
  el.addEventListener('paste', function(e) {
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData).getData('text') || '';
    this.value = txt.replace(/\D/g, '');
    this.dispatchEvent(new Event('input', {bubbles: true}));
  });

  if(previo) _NAT_VALUE.set.call(el, _fmtMiles(previo));
}

// Marca como monetario todo campo con prefijo $ o paso de 1000
function activarSeparadorMiles(raiz) {
  const ambito = raiz || document;
  ambito.querySelectorAll('input[data-money-field]').forEach(aplicarSeparadorMiles);
}

function fmtLbl(id) {
  const inp = document.getElementById(id);
  const el  = document.getElementById(id+'-lbl');
  if(!el) return;
  // Si el propio campo ya muestra los miles, la etiqueta sería redundante
  if(inp && inp.dataset.money === '1') { el.textContent = ''; return; }
  const v = parseFloat(inp?.value);
  el.textContent = (!isNaN(v)&&v>0) ? cop(v) : '';
}

function actualizarAportes(tab) {
  if(tab===1) {
    const mat  = parseFloat(document.getElementById('mat1').value)||0;
    const neta = getMatNeta(1);  // mat after descuentos
    const pct  = parseFloat(document.getElementById('pct1').value)||0;
    const fin  = neta * pct/100;
    const gar  = fin * GARANTISA_CP;
    const contAuto = Math.max(0, 100 - pct);
    document.getElementById('cont1').value = contAuto;
    const cont = contAuto;
    // Sync $ field
    const fvEl = document.getElementById('finval1');
    if(fvEl && document.activeElement !== fvEl) fvEl.value = fin > 0 ? Math.round(fin) : '';
    document.getElementById('garantisa1-val').textContent = neta>0 ? `${cop(gar)} sobre ${cop(fin)} financiado (4.17% = 3.5% + IVA)` : '—';
    document.getElementById('pct1-info').textContent = neta>0&&pct>0 ? `Monto a financiar: ${cop(fin)} (base neta: ${cop(neta)})` : '';
    document.getElementById('cont1-info').textContent = neta>0&&cont>0 ? `Cuota inicial contado: ${cop(neta*cont/100)}` : '';
    const total = pct + cont;
    const finW = Math.min(pct,100), ctW = Math.min(cont, Math.max(0,100-pct));
    document.getElementById('pb1-fin').style.width = finW+'%';
    document.getElementById('pb1-ct').style.width  = ctW+'%';
    document.getElementById('pb1-fin-lbl').textContent = `Financiado ${pct}%`;
    document.getElementById('pb1-ct-lbl').textContent  = `Contado ${cont}%`;
    const tEl = document.getElementById('pb1-total-lbl');
    tEl.textContent = `= ${total}%`+(total===100?' ':total>100?' ':'');
    tEl.className = 'pct-simple-total '+(total===100?'ok':total>100?'over':'under');
    if(total>100) showAlert(1,icon('alert-triangle') + ' La suma de % financiado + contado supera 100%');
  } else {
    const mat  = parseFloat(document.getElementById('mat2').value)||0;
    const neta = getMatNeta(2);
    const cp   = parseFloat(document.getElementById('pctCP').value)||0;
    const lp   = parseFloat(document.getElementById('pctLP').value)||0;
    const contAuto = Math.max(0, 100 - cp - lp);
    document.getElementById('cont2').value = contAuto;
    const cont = contAuto;
    const finCP = neta*cp/100, finLP = neta*lp/100;
    // Sync $ fields for CP and LP
    const fcpEl = document.getElementById('finvalCP');
    const flpEl = document.getElementById('finvalLP');
    if(fcpEl && document.activeElement!==fcpEl) fcpEl.value = finCP>0 ? Math.round(finCP) : '';
    if(flpEl && document.activeElement!==flpEl) flpEl.value = finLP>0 ? Math.round(finLP) : '';
    document.getElementById('gCP-val').textContent = neta>0 ? `${cop(finCP*GARANTISA_CP)} sobre ${cop(finCP)}` : '—';
    document.getElementById('gLP-val').textContent = neta>0 ? `${cop(finLP*GARANTISA_LP)} sobre ${cop(finLP)}` : '—';
    const total = cp+lp+cont;
    document.getElementById('dist2-info').textContent = neta>0 ? `CP ${cop(finCP)} | LP ${cop(finLP)} | Contado ${cop(neta*cont/100)}` : '';
    const cpW=Math.min(cp,100), lpW=Math.min(lp,Math.max(0,100-cp)), ctW=Math.min(cont,Math.max(0,100-cp-lp));
    document.getElementById('pb2-cp').style.width = cpW+'%';
    document.getElementById('pb2-lp').style.width = lpW+'%';
    document.getElementById('pb2-ct').style.width = ctW+'%';
    document.getElementById('pb2-cp-lbl').textContent = `CP ${cp}%`;
    document.getElementById('pb2-lp-lbl').textContent = `LP ${lp}%`;
    document.getElementById('pb2-ct-lbl').textContent = `Contado ${cont}%`;
    const tEl = document.getElementById('pb2-total');
    tEl.textContent = `= ${total}%`+(total===100?' ':total>100?' ':'');
    tEl.className = 'pct-bar-total '+(total===100?'ok':total>100?'over':'under');
    if(total>100) showAlert(2,icon('alert-triangle') + ' La suma de CP + LP supera 100%');
  }
}

function actualizarPctBar3() {
  const neta = getMatNeta(3);
  const pct  = parseFloat(document.getElementById('pct3').value)||0;
  const contAuto = Math.max(0, 100 - pct);
  document.getElementById('cont3').value = contAuto;
  const fin = neta * pct/100;
  // Sync $ field
  const fvEl = document.getElementById('finval3');
  if(fvEl && document.activeElement!==fvEl) fvEl.value = fin>0 ? Math.round(fin) : '';
  const total = pct + contAuto;
  document.getElementById('pb3-fin').style.width = Math.min(pct,100)+'%';
  document.getElementById('pb3-ct').style.width  = Math.min(contAuto,Math.max(0,100-pct))+'%';
  document.getElementById('pb3-fin-lbl').textContent = `Financiado ${pct}%`;
  document.getElementById('pb3-ct-lbl').textContent  = `Contado ${contAuto}%`;
  const tEl = document.getElementById('pb3-total-lbl');
  tEl.textContent = `= ${total}%`+(total===100?' ':total>100?' ':'');
  tEl.className = 'pct-simple-total '+(total===100?'ok':total>100?'over':'under');
}

function showAlert(id,msg){ const el=document.getElementById('alert'+id); el.textContent=msg; el.style.display='block'; setTimeout(()=>el.style.display='none',5000); }

// Política financiera: los cálculos conservan precisión completa en memoria.
// El redondeo a pesos COP se aplica únicamente al presentar/exportar valores.
const FINANCIAL_EPSILON = 0.01;

function cuotaMes(P,tm,n){
  P = Number(P); tm = Number(tm); n = Number(n);
  if(!Number.isFinite(P) || !Number.isFinite(tm) || !Number.isFinite(n) || P < 0 || tm < 0 || n <= 0) return 0;
  return tm===0 ? P/n : P*(tm*Math.pow(1+tm,n))/(Math.pow(1+tm,n)-1);
}

function amortizacion(P,tm,n){
  P = Number(P); tm = Number(tm); n = Math.trunc(Number(n));
  if(!Number.isFinite(P) || !Number.isFinite(tm) || !Number.isFinite(n) || P < 0 || tm < 0 || n <= 0) {
    return {rows:[],cuota:0,totInt:0,totCap:0};
  }
  const cuota=cuotaMes(P,tm,n); let saldo=P, totInt=0, totCap=0;
  const rows=[];
  for(let i=1;i<=n;i++){
    const int=saldo*tm, cap=cuota-int;
    saldo=Math.max(0,saldo-cap);
    totInt+=int; totCap+=cap;
    rows.push({i,cuota,capital:cap,interes:int,saldo});
  }
  // Evita residuos binarios insignificantes sin redondear la amortización.
  if(saldo < FINANCIAL_EPSILON) saldo = 0;
  if(rows.length) rows[rows.length-1].saldo = saldo;
  return {rows,cuota,totInt,totCap};
}

function renderTabla(rows,cuota,totInt,totCap){
  let h=`<div class="table-wrap"><table class="tbl"><thead><tr><th class="u-text-left">Cuota</th><th>Cuota Mensual</th><th>Capital</th><th>Interés</th><th>Saldo</th></tr></thead><tbody>`;
  rows.forEach(r=>{ h+=`<tr><td>${r.i}</td><td>${cop(r.cuota)}</td><td>${cop(r.capital)}</td><td>${cop(r.interes)}</td><td>${cop(r.saldo)}</td></tr>`; });
  h+=`</tbody><tfoot><tr><td>TOTAL</td><td>—</td><td>${cop(totCap)}</td><td>${cop(totInt)}</td><td>—</td></tr></tfoot></table></div>`;
  return h;
}

function calcular1(){
  const mat=getMat(1);
  const tm=parseFloat(document.getElementById('tasa1').value)/100;
  const n=getMeses('plazo1','1');
  const financiado=getFinanciado(1);
  const cuotaInicial=getContadoVal(1);
  const pct=mat>0?Math.round((financiado/mat)*1000)/10:0;

  if(!mat||mat<=0) return showAlert(1,'Ingresa el valor de matrícula.');
  if(financiado<=0) return showAlert(1,'El monto financiado es cero. Revisa beneficios y pago de contado.');
  if(!n||n<=0) return showAlert(1,'Ingresa el plazo de amortización.');
  if(isNaN(tm)) return showAlert(1,'Ingresa la tasa de interés.');

  const garantisa = financiado*GARANTISA_CP;
  const principal = financiado;
  const pagoInicial = cuotaInicial + garantisa;
  const {rows,cuota,totInt,totCap} = amortizacion(principal,tm,n);
  const totalPagar = totCap+totInt;
  const totalGeneral = pagoInicial + totalPagar;

  const _prog1 = document.getElementById('prog1');
  const _prog1Nombre = _prog1.options[_prog1.selectedIndex]?.textContent?.replace(/ \(.*\)$/,'') || 'Programa';
  const _benef1snap = _benefs[1].map(b=>({nombre:b.nombre||'Descuento',val:b.val||0,pct:b.pct||0}));
  const _benef1total = getTotalBeneficios(1);
  const _matNeta1 = Math.max(0, mat - _benef1total);
  window._d1 = {rows,cuota,totInt,totCap,principal,financiado,garantisa,mat,n,tm,cuotaInicial,pagoInicial,totalGeneral,
    progNombre:_prog1Nombre, pct:Math.round(pct*10)/10,
    beneficios:_benef1snap, benefTotal:_benef1total, matNeta:_matNeta1};
  setTimeout(()=>registrarHistorial(1), 100);

  document.getElementById('res1').innerHTML=`
  <div class="card">
    ${fechaBadgeHtml()}
    <div class="card-title">Resumen Financiero — Corto Plazo</div>
    <div class="section__title u-mt-5" style="margin-top:0;margin-bottom:10px;color:var(--danger);">${icon('credit-card')} Pago Inicial (al momento del desembolso)</div>
    <div class="kpi-grid">
      <div class="kpi"><span class="kpi__label">Cuota Inicial Contado</span><div class="kpi__value kpi__value--md">${cop(cuotaInicial)}</div></div>
      <div class="kpi kpi--warning"><span class="kpi__label">Garantisa (4.17% s/financiado)</span><div class="kpi__value kpi__value--md">${cop(garantisa)}</div></div>
      <div class="kpi kpi--warning u-col-span-all"><span class="kpi__label">Total Pago Inicial</span><div class="kpi__value kpi__value--md">${cop(pagoInicial)}</div></div>
    </div>
    <div class="section__title u-mt-5">${icon('calendar')} Crédito a Amortizar</div>
    <div class="kpi-grid">
      <div class="kpi"><span class="kpi__label">Valor Matrícula</span><div class="kpi__value kpi__value--md">${cop(mat)}</div></div>
      <div class="kpi"><span class="kpi__label">Monto Financiado</span><div class="kpi__value kpi__value--md">${cop(financiado)}</div></div>
      <div class="kpi kpi--success"><span class="kpi__label">Cuota Mensual</span><div class="kpi__value kpi__value--md">${cop(cuota)}</div></div>
      <div class="kpi"><span class="kpi__label">Total Intereses</span><div class="kpi__value kpi__value--md">${cop(totInt)}</div></div>
      <div class="kpi kpi--accent u-col-span-all"><span class="kpi__label">Total Crédito (capital + intereses)</span><div class="kpi__value kpi__value--md">${cop(totalPagar)}</div></div>
    </div>
    <div class="total-banner" style="margin-bottom:20px;">
      <div><div class="tl">Pago Inicial</div><div class="tv">${cop(pagoInicial)}</div><div class="ts">Contado + Garantisa</div></div>
      <div style="font-size:28px;opacity:.5;">+</div>
      <div><div class="tl">Total Crédito</div><div class="tv">${cop(totalPagar)}</div><div class="ts">${n} cuotas de ${cop(cuota)}</div></div>
      <div style="font-size:28px;opacity:.5;">=</div>
      <div class="u-text-right"><div class="tl">Costo Total Matrícula</div><div class="tv">${cop(totalGeneral)}</div><div class="ts">Todo incluido</div></div>
    </div>
    <div class="section__title u-mt-5">Tabla de Amortización (${n} cuotas)</div>
    ${renderTabla(rows,cuota,totInt,totCap)}
    <div class="btn-row">
      <button class="btn btn--sm" data-action="pdf" data-tab="1">${icon('file-text')} Descargar PDF</button>
      <button class="btn btn--sm" data-action="xls" data-tab="1">${icon('bar-chart')} Descargar Excel</button>
    </div>
  </div>`;
  // render save btn + existing scenarios
  setTimeout(()=>{ const p=document.getElementById('esc-panel-1'); if(p){ const sb=document.createElement('div'); sb.style='margin-top:14px;'; sb.innerHTML=`<button class="btn btn--sm" data-action="guardar-escenario" data-tab="1">${icon('save')} Guardar como escenario para comparar</button>`; document.getElementById('res1').querySelector('.card').appendChild(sb); } renderEscenarios(1); },50);
}


// ── Proyección multi-semestre de la porción LP (Crédito Mixto) ───────────────
// Modela cuánto capital LP acumula el estudiante si toma el mismo esquema
// cada semestre de su programa, ajustando la matrícula por IPC anual.
function proyectarLP(matriculaActual, pctLP, semInicio, semTotal, ipcAnual) {
  const filas = [];
  let acumCapital = 0, acumGarantisa = 0, acumMatricula = 0;
  let pos = 0;
  for(let s = semInicio; s <= semTotal; s++) {
    pos++;
    // El IPC corre desde el inicio del financiamiento (la matrícula ingresada es la de hoy).
    // La matrícula se ajusta una vez al año = cada 2 semestres.
    const anioRel = Math.ceil(pos / 2);
    const factor  = Math.pow(1 + ipcAnual, anioRel - 1);
    const matSem  = matriculaActual * factor;
    const capLP   = matSem * pctLP / 100;
    const garLP   = capLP * GARANTISA_LP;
    acumMatricula += matSem;
    acumCapital   += capLP;
    acumGarantisa += garLP;
    filas.push({s, pos, matSem, capLP, garLP, acumCapital});
  }
  const semFinanciados  = filas.length;
  const mesesFinanciados = semFinanciados * 6;
  const plazoPago = Math.round(mesesFinanciados * 1.5);
  return {filas, acumCapital, acumGarantisa, acumMatricula,
          semFinanciados, semInicio, semTotal, mesesFinanciados, plazoPago};
}

function renderProyeccionLP(p, pctLP, ipcPct, etiqueta) {
  const lbl = etiqueta || 'Largo Plazo';
  const parcial = p.semFinanciados !== p.semTotal;
  const filasHtml = p.filas.map(f => `<tr>
      <td class="u-text-center">${f.s}°</td>
      <td>${cop(f.matSem)}</td>
      <td>${cop(f.capLP)}</td>
      <td>${cop(f.garLP)}</td>
      <td style="font-weight:600;color:var(--success);">${cop(f.acumCapital)}</td>
    </tr>`).join('');
  return `
  <div class="section__title u-mt-5">${icon('trending-up')} Proyección de la financiación — ${lbl}</div>
  <div style="background:var(--success-soft);border-radius:var(--r-md);padding:12px 16px;font-size:12px;color:var(--text);margin-bottom:12px;line-height:1.6;">
    Escenario estimado financiando el <strong>${pctLP}%</strong> a largo plazo
    ${parcial
      ? `desde el <strong>${p.semInicio}° hasta el ${p.semTotal}° semestre</strong> (<strong>${p.semFinanciados} de ${p.semTotal}</strong> semestres)`
      : `en <strong>los ${p.semFinanciados} semestres</strong> del programa`},
    con un ajuste de matrícula del <strong>${ipcPct}% anual</strong>. Los valores son proyectados y pueden variar.
  </div>
  <div class="kpi-grid">
    <div class="kpi"><span class="kpi__label">Semestres financiados</span><div class="kpi__value kpi__value--md">${p.semFinanciados} de ${p.semTotal}</div></div>
    <div class="kpi"><span class="kpi__label">Garantisa LP acumulada</span><div class="kpi__value kpi__value--md">${cop(p.acumGarantisa)}</div></div>
    <div class="kpi"><span class="kpi__label">Base total proyectada</span><div class="kpi__value kpi__value--md">${cop(p.acumMatricula)}</div></div>
    <div class="kpi"><span class="kpi__label">Plazo de amortización</span><div class="kpi__value kpi__value--md">${p.plazoPago} meses</div></div>
    <div class="kpi u-col-span-all">
      <span class="kpi__label">Capital LP total al graduarse</span>
      <div class="kpi__value kpi__value--md">${cop(p.acumCapital)}</div>
    </div>
  </div>
  <div class="table-wrap" style="margin-top:10px;">
    <table class="tbl"><thead><tr>
        <th class="u-text-center">Sem.</th>
        <th>Base proyectada</th>
        <th>Capital LP</th>
        <th>Garantisa LP</th>
        <th>LP acumulado</th>
      </tr></thead>
      <tbody>${filasHtml}</tbody>
      <tfoot><tr>
        <td class="u-text-center">TOTAL</td>
        <td>${cop(p.acumMatricula)}</td>
        <td>${cop(p.acumCapital)}</td>
        <td>${cop(p.acumGarantisa)}</td>
        <td>${cop(p.acumCapital)}</td>
      </tr></tfoot>
    </table>
  </div>
  <div style="background:var(--warning-soft);border-left:4px solid var(--warning);border-radius:0 var(--r-md) var(--r-md) 0;
    padding:12px 16px;margin-top:10px;font-size:12px;color:var(--text);line-height:1.7;">
    <strong>Al graduarse</strong>, el estudiante habría acumulado <strong>${cop(p.acumCapital)}</strong> de capital
    a largo plazo por ${lbl.toLowerCase()}, que se amortizaría en aproximadamente <strong>${p.plazoPago} meses</strong>
    (1.5 × ${p.semFinanciados} semestres financiados × 6 meses), tras el período de gracia de 1 año.
    La cuota dependerá de la tasa vigente en ese momento.
  </div>`;
}

function calcular2(){
  const mat=getMat(2);
  const pCP=parseFloat(document.getElementById('pctCP').value)||0;
  const pLP=parseFloat(document.getElementById('pctLP').value)||0;
  const tm=parseFloat(document.getElementById('tasa2').value)/100;
  const nCP=getMeses('plazoCP','2cp');
  const nLP=getMeses('plazoLP','2lp');
  const finTotal=getFinanciado(2);
  const cuotaInicial=getContadoVal(2);

  if(!mat||mat<=0) return showAlert(2,'Ingresa el valor de matrícula.');
  if(finTotal<=0) return showAlert(2,'El monto financiado es cero. Revisa beneficios y pago de contado.');
  if(pCP+pLP<=0) return showAlert(2,'Define al menos un tramo (CP o LP).');
  const totalPct2 = pCP + pLP + (mat>0?getTotalBeneficios(2)/mat*100:0) + (mat>0?cuotaInicial/mat*100:0);
  if(pCP+pLP > mat > 0 ? (1-(getTotalBeneficios(2)/mat))*100 : 100) showAlert(2,icon('alert-triangle') + ' CP+LP supera el monto neto disponible para financiar.');
  if(pCP>0&&(!nCP||nCP<=0)) return showAlert(2,'Ingresa el plazo para Corto Plazo.');
  if(pLP>0&&(!nLP||nLP<=0)) return showAlert(2,'Ingresa el plazo para Largo Plazo.');

  // CP/LP are % of total matrícula (fix 3)
  const finCP=mat*pCP/100, finLP=mat*pLP/100;
  const garCP=finCP*GARANTISA_CP, garLP=finLP*GARANTISA_LP;
  const princCP=finCP, princLP=finLP;
  const pagoInicial = cuotaInicial + garCP + garLP;

  let CP=null,LP=null;
  if(pCP>0) CP=amortizacion(princCP,tm,nCP);
  // LP: DO NOT amortize — rate is unknown at simulation time (will be rate at graduation)
  // Only store capital and estimated payoff period
  const nLP_pago = getLPPlazoMeses();  // 1.5 × semestres × 6
  // LP placeholder object (no rows, no interest)
  if(pLP>0) LP = { capital: princLP, nPago: nLP_pago, noAmortize: true,
    cuota: null, totInt: 0, totCap: princLP, rows: [] };

  const _prog2 = document.getElementById('prog2');
  const _prog2Nombre = _prog2.options[_prog2.selectedIndex]?.textContent?.replace(/ \(.*\)$/,'') || 'Programa';
  const _benef2snap = _benefs[2].map(b=>({nombre:b.nombre||'Descuento',val:b.val||0,pct:b.pct||0}));
  const _benef2total = getTotalBeneficios(2);
  const _matNeta2 = Math.max(0, mat - _benef2total);
  window._d2={CP,LP,mat,finCP,finLP,garCP,garLP,princCP,princLP,nCP,nLP,tm,cuotaInicial,pagoInicial,pCP,pLP,
    progNombre:_prog2Nombre,
    beneficios:_benef2snap, benefTotal:_benef2total, matNeta:_matNeta2};
  setTimeout(()=>registrarHistorial(2), 100);

  const totCP=CP?(CP.totCap+CP.totInt):0;
  const totLP=LP?LP.capital:0;  // LP: only capital shown (no interest at simulation time)
  const totCredito=totCP+totLP;
  const totGeneral=pagoInicial+totCredito;

  let html=`<div class="card">${fechaBadgeHtml()}<div class="card-title">Resultados Crédito Mixto</div>`;

  // Bloque pago inicial
  html+=`<div class="section__title u-mt-5" style="margin-top:0;margin-bottom:10px;color:var(--danger);">${icon('credit-card')} Pago Inicial (al momento del desembolso)</div>
  <div class="kpi-grid">
    <div class="kpi"><span class="kpi__label">Cuota Inicial Contado</span><div class="kpi__value kpi__value--md">${cop(cuotaInicial)}</div></div>
    ${garCP>0?`<div class="kpi kpi--warning"><span class="kpi__label">Garantisa CP (4.17%)</span><div class="kpi__value kpi__value--md">${cop(garCP)}</div></div>`:''}
    ${garLP>0?`<div class="kpi kpi--warning"><span class="kpi__label">Garantisa LP (2.86%)</span><div class="kpi__value kpi__value--md">${cop(garLP)}</div></div>`:''}
    <div class="kpi kpi--warning u-col-span-all"><span class="kpi__label">Total Pago Inicial</span><div class="kpi__value kpi__value--md">${cop(pagoInicial)}</div></div>
  </div>`;

  if(CP){
    html+=`<div class="tramo tramo--cp"><span>${icon('circle-dot')} Corto Plazo — ${pCP}% · ${cop(finCP)}</span></div>
    <div class="kpi-grid">
      <div class="kpi"><span class="kpi__label">Monto Financiado CP</span><div class="kpi__value kpi__value--md">${cop(finCP)}</div></div>
      <div class="kpi kpi--success"><span class="kpi__label">Cuota Mensual CP</span><div class="kpi__value kpi__value--md">${cop(CP.cuota)}</div></div>
      <div class="kpi"><span class="kpi__label">Intereses CP</span><div class="kpi__value kpi__value--md">${cop(CP.totInt)}</div></div>
      <div class="kpi u-col-span-all"><span class="kpi__label">Total Crédito CP</span><div class="kpi__value kpi__value--md">${cop(totCP)}</div></div>
    </div>
    <div class="section__title u-mt-5">Tabla Amortización — Corto Plazo (${nCP} cuotas)</div>
    ${renderTabla(CP.rows,CP.cuota,CP.totInt,CP.totCap)}`;
  }

  if(LP){
    const semLP = parseInt(document.getElementById('plazoLP')?.value)||8;
    const graceMeses = 12;
    html+=`<div class="tramo tramo--lp" style="margin-top:24px;"><span>${icon('circle-dot')} Largo Plazo — ${pLP}% · ${cop(finLP)}</span></div>
    <div class="kpi-grid">
      <div class="kpi"><span class="kpi__label">Capital Financiado LP</span><div class="kpi__value kpi__value--md">${cop(finLP)}</div></div>
      <div class="kpi"><span class="kpi__label">Semestres Financiados</span><div class="kpi__value kpi__value--md">${getSemFinanciados().financiados} de ${semLP}</div></div>
      <div class="kpi"><span class="kpi__label">Período de Gracia</span><div class="kpi__value kpi__value--md">${graceMeses} meses</div></div>
      <div class="kpi"><span class="kpi__label">Plazo Estimado de Pago</span><div class="kpi__value kpi__value--md">${LP.nPago} meses</div></div>
    </div>
    <div style="background:var(--success-soft);border-left:4px solid var(--success);border-radius:0 var(--r-md) var(--r-md) 0;
      padding:14px 18px;margin:12px 0;font-size:13px;color:var(--text);line-height:1.7;">
      <strong style="color:var(--success);display:block;margin-bottom:6px;">${icon('info')} Información sobre el Crédito Largo Plazo</strong>
      La cuota definitiva del crédito de largo plazo no puede determinarse actualmente, ya que la
      tasa de interés será la vigente al momento de iniciar la amortización. Durante el período
      de gracia de un (1) año se causarán intereses conforme a las condiciones vigentes en esa fecha.
      <br><br>
      <strong>Cronograma estimado:</strong><br>
      ${icon('book-open')} Semestres financiados: ${getSemFinanciados().financiados} (${getSemFinanciados().financiados*6} meses) · 
      ${icon('clock')} Período de gracia: ${graceMeses} meses · 
      ${icon('credit-card')} Amortización: ${LP.nPago} meses después de graduarse
    </div>`;

    // Proyección multi-semestre (si está activada)
    const verProy = document.getElementById('proyLP')?.checked;
    if(verProy && semLP > 0 && pLP > 0) {
      const ipcPct = parseFloat(document.getElementById('ipcLP')?.value);
      const ipc = (isNaN(ipcPct) ? 5 : ipcPct) / 100;
      const sf = getSemFinanciados();
      const proy = proyectarLP(mat, pLP, sf.inicio, sf.total, ipc);
      window._proyLP = {...proy, pctLP:pLP, ipcPct:(isNaN(ipcPct)?5:ipcPct), etiqueta:'Matrícula'};
      html += renderProyeccionLP(proy, pLP, (isNaN(ipcPct)?5:ipcPct), 'Matrícula');
    } else {
      window._proyLP = null;
    }
  }

  if(CP&&LP){
    html+=`<div class="section__title u-mt-5" style="margin-top:24px;">Comparativa Capital vs Intereses</div>
    <div class="u-mt-4"><canvas id="chMixto" role="img" aria-label="Comparativa capital vs intereses corto y largo plazo">Gráfica comparativa</canvas></div>`;
  }

  html+=`<div class="total-banner">
    <div><div class="tl">Pago Inicial</div><div class="tv">${cop(pagoInicial)}</div><div class="ts">Contado + Garantisa</div></div>
    <div class="total-banner__op" aria-hidden="true">+</div>
    <div>
      <div class="tl">Crédito CP (con intereses)</div><div class="tv">${cop(totCP)}</div>
      <div class="ts">${CP?nCP+' cuotas':''}</div>
    </div>
    ${LP?`<div class="total-banner__op" aria-hidden="true">+</div>
    <div><div class="tl">Capital LP (sin intereses)</div><div class="tv">${cop(totLP)}</div>
    <div class="ts">${LP.nPago} meses al graduarse</div></div>`:''}
  </div>
  ${LP?`<div style="background:var(--success-soft);border-radius:var(--r-md);padding:10px 14px;font-size:12px;color:var(--success);margin-top:8px;font-style:italic;">
    * El costo total definitivo del crédito LP se determinará al momento de iniciar la amortización, según la tasa vigente.
  </div>`:''}
  <div class="btn-row">
    <button class="btn btn--sm" data-action="pdf" data-tab="2">${icon('file-text')} Descargar PDF</button>
    <button class="btn btn--sm" data-action="xls" data-tab="2">${icon('bar-chart')} Descargar Excel</button>
  </div></div>`;

  document.getElementById('res2').innerHTML=html;
  setTimeout(()=>{ const p=document.getElementById('esc-panel-2'); if(p){ const sb=document.createElement('div'); sb.style='margin-top:14px;'; sb.innerHTML=`<button class="btn btn--sm" data-action="guardar-escenario" data-tab="2">${icon('save')} Guardar como escenario para comparar</button>`; document.getElementById('res2').querySelector('.card').appendChild(sb); } renderEscenarios(2); },50);

  if(CP&&LP){
    setTimeout(()=>{
      const ctx=document.getElementById('chMixto');
      if(!ctx)return;
      new Chart(ctx,{type:'bar',data:{
        labels:['Corto Plazo','Largo Plazo (capital)'],
        datasets:[
          {label:'Capital',data:[Math.round(CP.totCap),Math.round(LP.capital)],backgroundColor:'var(--accent)',borderRadius:6},
          {label:'Intereses CP',data:[Math.round(CP.totInt),0],backgroundColor:'var(--success)',borderRadius:6}
        ]},
        options:{responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:true,position:'top',labels:{font:{family:'Inter',size:12},boxWidth:12,padding:16}},
          tooltip:{callbacks:{label:c=>' '+cop(c.raw)}}},
          scales:{x:{grid:{display:false},ticks:{font:{family:'Inter',size:12}}},
            y:{ticks:{font:{family:'Inter',size:11},callback:v=>cop(v)}}}}
      });
    },100);
  }
}


// ── PDF text sanitizer ────────────────────────────────────────────────────────
// jsPDF's built-in Helvetica doesn't support accented/unicode chars.
// Replace them so the PDF renders cleanly.
function safePDF(text) {
  if(text === null || text === undefined) return '';
  return String(text)
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
    .replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n')
    .replace(/Á/g,'A').replace(/É/g,'E').replace(/Í/g,'I')
    .replace(/Ó/g,'O').replace(/Ú/g,'U').replace(/Ñ/g,'N')
    .replace(/ü/g,'u').replace(/Ü/g,'U')
    .replace(/[—–]/g,'-')          // em/en dash → hyphen
    .replace(/[""'']/g,'"')        // smart quotes → straight
    .replace(/[①②③]/g,(m)=>({'①':'(1)','②':'(2)','③':'(3)'}[m]||''))
    .replace(/[]/gu,'')
    .replace(/\uFE0F/g,'')          // variation selector
    .replace(/[^\x00-\x7E]/g,''); // strip remaining non-ASCII
}
// Wrap doc.text to always sanitize
function pdfText(doc, text, x, y, opts) {
  doc.text(safePDF(String(text)), x, y, opts||{});
}


// ── LP amortization table: capital only (interest TBD at graduation) ─────────
function renderTablaLP(capital, n) {
  const cuotaCap = capital / n;  // equal capital payments
  const hw = ['#','Capital','Saldo','Interes'], cw = [16,50,50,60];
  let doc_rows = [];
  let saldo = capital;
  for(let i=1; i<=n; i++) {
    saldo = Math.max(0, capital - cuotaCap*i);
    doc_rows.push([i, cuotaCap, saldo]);
  }
  return doc_rows;
}

function renderTablaLPHtml(capital, n, semestres) {
  // Single-row summary — no multi-row table
  const sem = semestres || Math.round(n/6/1.5);
  return `<div class="table-wrap"><table class="tbl">
    <thead><tr>
      <th class="u-text-left">Concepto</th>
      <th>Valor</th>
    </tr></thead><tbody>
    <tr><td style="font-family:'Inter',sans-serif;">Capital a amortizar</td><td style="font-weight:700;color:var(--success);">${cop(capital)}</td></tr>
    <tr><td style="font-family:'Inter',sans-serif;">Semestres de la carrera</td><td>${sem} semestres</td></tr>
    <tr><td style="font-family:'Inter',sans-serif;">Plazo estimado de amortización</td><td>${n} meses</td></tr>
    <tr><td style="font-family:'Inter',sans-serif;color:var(--warning);">Interés</td><td style="color:var(--text-3);font-style:italic;">Tasa vigente al graduarse</td></tr>
    </tbody></table></div>
  <p style="font-size:11px;color:var(--success);margin-top:6px;">
    Será amortizado en el número de semestres que dure la carrera (× 1.5), después del período de gracia de 1 año.
  </p>`;
}

// ---- EXPORTS ----


// ══════════════════════════════════════════════════════════════════
// PDF — capa de composición
// Paleta alineada al Design System OFE. Nota: jsPDF corrompe las
// tildes con sus fuentes estándar, por eso safePDF() las normaliza.
// ══════════════════════════════════════════════════════════════════
const PDF = {
  azul:   [26, 79, 216],    // --brand-600
  azulOsc:[23, 64, 184],    // --brand-700
  verde:  [14, 143, 126],   // --success
  ambar:  [179, 114, 13],   // --warning
  rojo:   [207, 47, 61],    // --danger
  violeta:[91, 69, 214],    // --info
  texto:  [12, 18, 32],     // --text
  texto2: [65, 75, 92],     // --text-2
  texto3: [107, 118, 136],  // --text-3
  linea:  [229, 232, 238],  // --border
  suave:  [246, 247, 249],  // --bg
  azulS:  [238, 243, 255],  // --accent-soft
  verdeS: [226, 246, 242],
  ambarS: [253, 243, 226],
  M: 14,            // margen
  W: 210,           // ancho A4
  get CW() { return this.W - this.M * 2; },   // 182
};

// Encabezado institucional con la marca OFE
function pdfHeader(doc, titulo, subtitulo = '', sub2 = '') {
  const P = PDF;
  doc.setFillColor(...P.azul);
  doc.rect(0, 0, P.W, 34, 'F');

  // Marca: cuadro con las siglas
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(P.M, 8, 15, 15, 3.5, 3.5, 'F');
  doc.setTextColor(...P.azul);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('OFE', P.M + 7.5, 17.6, {align: 'center'});

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text(safePDF(titulo), P.M + 20, 15);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text('Oficina de Financiamiento Estudiantil - Universidad del Norte', P.M + 20, 21);
  if(subtitulo) { doc.setFontSize(9.5); doc.text(safePDF(subtitulo), P.M + 20, 28); }

  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  return 44;
}

// Barra de sección
function pdfSectionBar(doc, label, y, color) {
  const P = PDF;
  const rgb = color || P.azul;
  doc.setFillColor(...rgb);
  doc.rect(P.M, y - 5, P.CW, 7.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text(safePDF(label), P.M + 2.5, y);
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  return y + 10;
}

// Fila clave-valor con alineación a los márgenes
function pdfKV(doc, y, filas, opts = {}) {
  const P = PDF;
  const paso = opts.paso || 6.5;
  filas.filter(Boolean).forEach(([k, v, estilo]) => {
    const fuerte = estilo === 'total';
    if(fuerte) {
      doc.setFillColor(...(opts.tintaTotal || P.azulS));
      doc.rect(P.M, y - 4.6, P.CW, paso + 0.6, 'F');
    }
    doc.setFont('helvetica', fuerte ? 'bold' : 'normal');
    doc.setFontSize(fuerte ? 10 : 9.5);
    doc.setTextColor(...(fuerte ? P.texto : P.texto2));
    doc.text(safePDF(k), P.M + 2.5, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(fuerte ? (opts.colorTotal || P.azul) : P.texto));
    doc.text(safePDF(String(v)), P.W - P.M - 2.5, y, {align: 'right'});
    y += paso;
  });
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  return y + 1.5;
}

// Bloque de condiciones vigentes del crédito
function pdfCondiciones(doc, y, cond) {
  const P = PDF;
  y = pdfSectionBar(doc, 'CONDICIONES DEL CREDITO', y, P.texto2);
  const filas = [];
  if(cond.modalidad)  filas.push(['Modalidad', cond.modalidad]);
  if(cond.tasa != null) {
    filas.push(['Tasa de interes', (cond.tasa * 100).toFixed(2) + '% mes vencido']);
    filas.push(['Tasa efectiva anual', ((Math.pow(1 + cond.tasa, 12) - 1) * 100).toFixed(2) + '% E.A.']);
  }
  if(cond.plazo)      filas.push(['Plazo', cond.plazo]);
  if(cond.garantisa)  filas.push(['Fondo de garantias', cond.garantisa]);
  if(cond.gracia)     filas.push(['Periodo de gracia', cond.gracia]);
  if(cond.extra) cond.extra.forEach(f => filas.push(f));
  y = pdfKV(doc, y, filas);
  // Vigencia
  doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
  doc.setTextColor(...P.texto3);
  doc.text(safePDF('Condiciones vigentes a la fecha de esta simulacion. Sujetas a cambio segun los lineamientos institucionales.'), P.M + 2.5, y);
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  return y + 6;
}

// Tabla de amortización legible: encabezado, filas alternas y total
function pdfTablaAmort(doc, y, rows, totCap, totInt, titulo) {
  const P = PDF;
  y = pdfSectionBar(doc, titulo || 'PLAN DE PAGOS', y);
  const cols = [
    {t: 'Cuota',  w: 18, a: 'left'},
    {t: 'Valor cuota', w: 42, a: 'right'},
    {t: 'Abono a capital', w: 42, a: 'right'},
    {t: 'Interes', w: 38, a: 'right'},
    {t: 'Saldo',   w: 42, a: 'right'},
  ];
  const xAt = i => P.M + cols.slice(0, i).reduce((s, c) => s + c.w, 0);
  const pintaCabecera = () => {
    doc.setFillColor(...P.texto2);
    doc.rect(P.M, y - 4.8, P.CW, 7.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
    cols.forEach((c, i) => {
      const x = c.a === 'right' ? xAt(i) + c.w - 2.5 : xAt(i) + 2.5;
      doc.text(c.t, x, y, {align: c.a});
    });
    doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    y += 7.5;
  };
  pintaCabecera();
  rows.forEach((r, idx) => {
    if(y > 268) { doc.addPage(); y = 22; pintaCabecera(); }
    if(idx % 2 === 1) { doc.setFillColor(...P.suave); doc.rect(P.M, y - 4.2, P.CW, 6, 'F'); }
    doc.setTextColor(...P.texto2);
    const vals = [String(r.i), cop(r.cuota), cop(r.capital), cop(r.interes), cop(r.saldo)];
    cols.forEach((c, i) => {
      const x = c.a === 'right' ? xAt(i) + c.w - 2.5 : xAt(i) + 2.5;
      doc.text(safePDF(vals[i]), x, y, {align: c.a});
    });
    y += 6;
  });
  // Totales
  if(y > 264) { doc.addPage(); y = 22; }
  doc.setFillColor(...P.azulS);
  doc.rect(P.M, y - 4.4, P.CW, 7, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
  doc.setTextColor(...P.texto);
  const tot = ['TOTAL', '', cop(totCap), cop(totInt), ''];
  cols.forEach((c, i) => {
    if(!tot[i]) return;
    const x = c.a === 'right' ? xAt(i) + c.w - 2.5 : xAt(i) + 2.5;
    doc.text(safePDF(tot[i]), x, y, {align: c.a});
  });
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  return y + 9;
}

// Pie de página en todas las hojas
function pdfPie(doc) {
  const P = PDF;
  const n = doc.internal.getNumberOfPages();
  for(let i = 1; i <= n; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    const w = doc.internal.pageSize.getWidth();
    doc.setDrawColor(...P.linea); doc.setLineWidth(0.3);
    doc.line(P.M, h - 13, w - P.M, h - 13);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.setTextColor(...P.texto3);
    doc.text(safePDF('Simulacion informativa - no constituye aprobacion de credito. Generado el ' + fechaSimulacion()), P.M, h - 8.5);
    doc.text('Pagina ' + i + ' de ' + n, w - P.M, h - 8.5, {align: 'right'});
  }
  doc.setTextColor(0, 0, 0);
}

function addFechaToDoc(doc, y) { return y; }   // la fecha ahora vive en el pie

function pdfCostoFootnote(doc, y, texto) {
  const P = PDF;
  const nota = texto || '* Valor matricula + Aporte Garantisa + Intereses del credito';
  doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
  doc.setTextColor(...P.texto3);
  doc.text(safePDF(nota), P.M + 2.5, y);
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  return y + 6;
}

function pdfBenefSection(doc, y, mat, beneficios, benefTotal, matNeta, cuotaInicial) {
  // Breakdown: mat → beneficios → contado → financiado
  if(beneficios && beneficios.length > 0) {
    y = pdfSectionBar(doc, 'BENEFICIOS / DESCUENTOS APLICADOS', y, [46,125,50]);
    doc.setFont('helvetica','bold'); doc.text(safePDF('Valor Matrícula Bruta:'), 16, y);
    doc.setFont('helvetica','normal'); doc.text(safePDF(cop(mat)), 150, y, {align:'right'}); y+=7;
    beneficios.forEach(b => {
      if((b.val||0) > 0) {
        const label = (b.nombre||'Descuento').substring(0,35);
        doc.setFont('helvetica','normal'); doc.text(safePDF('  - '+label+':'), 16, y);
        doc.setFont('helvetica','bold'); doc.setTextColor(61,107,74);
        doc.text(safePDF('-'+cop(b.val)+(mat>0?' ('+b.pct.toFixed(1)+'%)':'')), 150, y, {align:'right'});
        doc.setTextColor(0,0,0); y+=6;
      }
    });
    doc.setFont('helvetica','bold'); doc.text(safePDF('= Matrícula Neta:'), 16, y);
    doc.text(safePDF(cop(matNeta)), 150, y, {align:'right'}); y+=7;
  }
  return y;
}
function expPDF1(){
  if(!window._d1) return toast('Primero realiza el calculo','warning');
  const d = window._d1;
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  let y = pdfHeader(doc, 'Simulacion de Credito', 'Credito a Corto Plazo - ' + (d.progNombre||''));

  // 1) Condiciones vigentes
  y = pdfCondiciones(doc, y, {
    modalidad: 'Credito a corto plazo',
    tasa: d.tm,
    plazo: d.n + ' cuotas mensuales',
    garantisa: 'Aporte del 4.17% sobre el monto financiado (3.5% + IVA)'
  });

  // 2) Beneficios
  y = pdfBenefSection(doc, y, d.mat, d.beneficios||[], d.benefTotal||0, d.matNeta||d.mat, d.cuotaInicial);

  // 3) Lo que paga hoy
  y = pdfSectionBar(doc, 'PAGO AL MOMENTO DEL DESEMBOLSO', y, PDF.ambar);
  y = pdfKV(doc, y, [
    d.benefTotal > 0 ? ['Matricula neta (despues de descuentos)', cop(d.matNeta||d.mat)] : ['Valor de la matricula', cop(d.mat)],
    ['Pago de contado', cop(d.cuotaInicial)],
    ['Aporte Garantisa', cop(d.garantisa)],
    ['Total a pagar hoy', cop(d.pagoInicial), 'total'],
  ], {tintaTotal: PDF.ambarS, colorTotal: PDF.ambar});

  // 4) Lo que financia
  y = pdfSectionBar(doc, 'CREDITO A AMORTIZAR', y);
  y = pdfKV(doc, y, [
    ['Monto financiado', cop(d.financiado) + '  (' + d.pct + '% de la matricula)'],
    ['Numero de cuotas', d.n + ' meses'],
    ['Valor de la cuota mensual', cop(d.cuota)],
    ['Total intereses', cop(d.totInt)],
    ['Total del credito', cop(d.totCap + d.totInt), 'total'],
  ]);

  // 5) Costo total
  y = pdfSectionBar(doc, 'COSTO TOTAL DE LA MATRICULA', y, PDF.verde);
  y = pdfKV(doc, y, [['Costo total *', cop(d.totalGeneral), 'total']],
    {tintaTotal: PDF.verdeS, colorTotal: PDF.verde});
  y = pdfCostoFootnote(doc, y);

  // 6) Plan de pagos
  if(y > 210) { doc.addPage(); y = 22; }
  y = pdfTablaAmort(doc, y, d.rows, d.totCap, d.totInt, 'PLAN DE PAGOS (' + d.n + ' CUOTAS)');

  pdfPie(doc);
  doc.save(safePDF('Credito Corto Plazo - ' + (d.progNombre||'Simulacion')) + '.pdf');
}

function expXLS1(){
  const d=window._d1; if(!d)return;
  const wb=XLSX.utils.book_new();
  const benefRows1 = (d.beneficios||[]).filter(b=>b.val>0).map(b=>['  - '+(b.nombre||'Descuento')+' ('+b.pct.toFixed(1)+'%)',-Math.round(b.val)]);
  const ws=XLSX.utils.aoa_to_sheet([
    ['Crédito a Corto Plazo'],[''],
    ['--- MATRÍCULA ---'],
    ['Valor Matrícula Bruta',Math.round(d.mat)],
    ...(benefRows1.length>0?[['--- BENEFICIOS / DESCUENTOS ---'],...benefRows1,['Total Descuentos',-Math.round(d.benefTotal||0)],['Matrícula Neta',Math.round(d.matNeta||d.mat)],['']]:
      [['']]),
    ['--- PAGO INICIAL ---'],
    ['Pago de Contado',Math.round(d.cuotaInicial)],
    ['Garantisa (4.17% s/financiado)',Math.round(d.garantisa)],
    ['Total Pago Inicial',Math.round(d.pagoInicial)],[''],
    ['--- CRÉDITO ---'],
    ['Monto Financiado ('+d.pct+'% de matrícula)',Math.round(d.financiado)],
    ['Cuota Mensual',Math.round(d.cuota)],
    ['Total Intereses',Math.round(d.totInt)],
    ['Total Crédito',Math.round(d.totCap+d.totInt)],
    ['COSTO TOTAL MATRÍCULA',Math.round(d.totalGeneral)],[''],
    ['Cuota','Cuota Mensual','Capital','Interés','Saldo'],
    ...d.rows.map(r=>[r.i,Math.round(r.cuota),Math.round(r.capital),Math.round(r.interes),Math.round(r.saldo)])
  ]);
  XLSX.utils.book_append_sheet(wb,ws,'Corto Plazo');
  const fn1x = (d.progNombre+' - '+d.pct+'%').replace(/[^a-zA-Z0-9\-_ áéíóúÁÉÍÓÚñÑ]/g,'').trim();
  XLSX.writeFile(wb,fn1x+'.xlsx');
}

function expPDF2(){
  if(!window._d2) return toast('Primero realiza el calculo','warning');
  const d = window._d2;
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  const semLP  = d.nLP || 8;
  const nPagoLP = (d.LP && d.LP.nPago) || Math.round(semLP * 6 * 1.5);
  let y = pdfHeader(doc, 'Simulacion de Credito', 'Credito Mixto Corto y Largo Plazo - ' + (d.progNombre||''));

  // Condiciones: la tasa LP no se conoce hoy
  y = pdfCondiciones(doc, y, {
    modalidad: 'Credito mixto (corto y largo plazo)',
    tasa: d.tm,
    plazo: 'Corto plazo: ' + (d.nCP||0) + ' cuotas mensuales',
    garantisa: 'Corto plazo 4.17% - Largo plazo 2.86% sobre cada tramo',
    gracia: '12 meses despues de graduarse (tramo de largo plazo)',
    extra: [
      ['Duracion del programa', semLP + ' semestres'],
      ['Plazo estimado largo plazo', nPagoLP + ' cuotas (1.5 x semestres financiados)'],
      ['Tasa del largo plazo', 'La vigente al iniciar la amortizacion']
    ]
  });

  y = pdfBenefSection(doc, y, d.mat, d.beneficios||[], d.benefTotal||0, d.matNeta||d.mat, d.cuotaInicial);

  y = pdfSectionBar(doc, 'PAGO AL MOMENTO DEL DESEMBOLSO', y, PDF.ambar);
  y = pdfKV(doc, y, [
    d.benefTotal > 0 ? ['Matricula neta (despues de descuentos)', cop(d.matNeta||d.mat)] : ['Valor de la matricula', cop(d.mat)],
    ['Pago de contado', cop(d.cuotaInicial)],
    d.garCP > 0 ? ['Aporte Garantisa corto plazo (4.17%)', cop(d.garCP)] : null,
    d.garLP > 0 ? ['Aporte Garantisa largo plazo (2.86%)', cop(d.garLP)] : null,
    ['Total a pagar hoy', cop(d.pagoInicial), 'total'],
  ], {tintaTotal: PDF.ambarS, colorTotal: PDF.ambar});

  // Tramo corto plazo
  if(d.CP) {
    y = pdfSectionBar(doc, 'TRAMO CORTO PLAZO (' + d.pCP + '%) - SE PAGA MIENTRAS ESTUDIA', y);
    y = pdfKV(doc, y, [
      ['Monto financiado', cop(d.finCP)],
      ['Numero de cuotas', (d.nCP||0) + ' meses'],
      ['Valor de la cuota mensual', cop(d.CP.cuota)],
      ['Total intereses', cop(d.CP.totInt)],
      ['Total tramo corto plazo', cop(d.CP.totCap + d.CP.totInt), 'total'],
    ]);
  }

  // Tramo largo plazo: capital, sin intereses hoy
  if(d.LP) {
    if(y > 215) { doc.addPage(); y = 22; }
    y = pdfSectionBar(doc, 'TRAMO LARGO PLAZO (' + d.pLP + '%) - SE PAGA AL GRADUARSE', y, PDF.verde);
    y = pdfKV(doc, y, [
      ['Capital a amortizar', cop(d.finLP)],
      ['Semestres del programa', semLP + ' semestres'],
      ['Periodo de gracia', '12 meses despues de graduarse'],
      ['Plazo estimado de pago', nPagoLP + ' cuotas mensuales'],
      ['Valor de la cuota', 'Se define al iniciar la amortizacion'],
    ]);
    // Aviso reglamentario
    doc.setFillColor(...PDF.verdeS);
    doc.rect(PDF.M, y - 4, PDF.CW, 22, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(...PDF.verde);
    doc.text(safePDF('Sobre la cuota del largo plazo'), PDF.M + 2.5, y + 1.5);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.8); doc.setTextColor(...PDF.texto2);
    doc.text(safePDF('La cuota definitiva no puede determinarse hoy: la tasa sera la vigente al momento de iniciar la'), PDF.M + 2.5, y + 7);
    doc.text(safePDF('amortizacion. Durante el periodo de gracia de un (1) ano se causaran intereses conforme a las'), PDF.M + 2.5, y + 11.5);
    doc.text(safePDF('condiciones vigentes en esa fecha.'), PDF.M + 2.5, y + 16);
    doc.setTextColor(0,0,0); doc.setFont('helvetica','normal'); doc.setFontSize(10);
    y += 27;
  }

  // Costo total
  const totCP = d.CP ? (d.CP.totCap + d.CP.totInt) : 0;
  const totLP = d.LP ? (d.LP.noAmortize ? d.LP.capital : (d.LP.totCap + d.LP.totInt)) : 0;
  if(y > 225) { doc.addPage(); y = 22; }
  y = pdfSectionBar(doc, 'COSTO TOTAL DE LA MATRICULA', y, PDF.verde);
  y = pdfKV(doc, y, [
    ['Pago al desembolso', cop(d.pagoInicial)],
    ['Credito corto plazo (con intereses)', cop(totCP)],
    ['Capital largo plazo (sin intereses aun)', cop(totLP)],
    ['Costo total conocido a hoy *', cop(d.pagoInicial + totCP + totLP), 'total'],
  ], {tintaTotal: PDF.verdeS, colorTotal: PDF.verde});
  y = pdfCostoFootnote(doc, y, '* No incluye los intereses del tramo de largo plazo, que se definiran al iniciar su amortizacion.');

  // Plan de pagos del corto plazo
  if(d.CP) {
    if(y > 205) { doc.addPage(); y = 22; }
    y = pdfTablaAmort(doc, y, d.CP.rows, d.CP.totCap, d.CP.totInt, 'PLAN DE PAGOS CORTO PLAZO (' + (d.nCP||0) + ' CUOTAS)');
  }

  // Proyeccion multi-semestre si esta disponible
  y = pdfProyeccionLP(doc, y, window._proyLP, 'Matricula');

  pdfPie(doc);
  doc.save(safePDF('Credito Mixto - ' + (d.progNombre||'Simulacion')) + '.pdf');
}

function expXLS2(){
  const d=window._d2; if(!d)return;
  const wb=XLSX.utils.book_new();
  const benefRows2 = (d.beneficios||[]).filter(b=>b.val>0).map(b=>['  - '+(b.nombre||'Descuento')+' ('+b.pct.toFixed(1)+'%)',-Math.round(b.val)]);
  const resumen=[
    ['Crédito Mixto — Resumen'],[''],
    ['Valor Matrícula Bruta',Math.round(d.mat)],
    ...(benefRows2.length>0?[['--- BENEFICIOS / DESCUENTOS ---'],...benefRows2,
      ['Total Descuentos',-Math.round(d.benefTotal||0)],
      ['Matrícula Neta',Math.round(d.matNeta||d.mat)],['']]:
      [['']]),
    ['--- PAGO INICIAL ---'],
    ['Pago de Contado',Math.round(d.cuotaInicial)],
    ['Garantisa CP (4.17%)',Math.round(d.garCP)],
    ['Garantisa LP (2.86%)',Math.round(d.garLP)],
    ['Total Pago Inicial',Math.round(d.pagoInicial)],[''],
    ['Total Crédito CP',d.CP?Math.round(d.CP.totCap+d.CP.totInt):0],
    ['Total Crédito LP',d.LP?Math.round(d.LP.totCap+d.LP.totInt):0],
    ['COSTO TOTAL MATRÍCULA',Math.round(d.pagoInicial+(d.CP?(d.CP.totCap+d.CP.totInt):0)+(d.LP?(d.LP.totCap+d.LP.totInt):0))]
  ];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(resumen),'Resumen');
  if(d.CP){
    const ws=XLSX.utils.aoa_to_sheet([
      ['Corto Plazo'],['Valor Matrícula',Math.round(d.mat)],['Monto Financiado CP',Math.round(d.finCP)],
      ['Garantisa (pago inicial)',Math.round(d.garCP)],
      ['Cuota Mensual',Math.round(d.CP.cuota)],
      ['Total Intereses',Math.round(d.CP.totInt)],
      ['Total Crédito',Math.round(d.CP.totCap+d.CP.totInt)],[],
      ['Cuota','Cuota Mensual','Capital','Interés','Saldo'],
      ...d.CP.rows.map(r=>[r.i,Math.round(r.cuota),Math.round(r.capital),Math.round(r.interes),Math.round(r.saldo)])
    ]);
    XLSX.utils.book_append_sheet(wb,ws,'Corto Plazo');
  }
  if(d.LP){
    const ws=XLSX.utils.aoa_to_sheet([
      ['Largo Plazo'],['Valor Matrícula',Math.round(d.mat)],['Monto Financiado LP',Math.round(d.finLP)],
      ['Garantisa (pago inicial)',Math.round(d.garLP)],
      ['Cuota Mensual',Math.round(d.LP.cuota)],
      ['Total Intereses',Math.round(d.LP.totInt)],
      ['Total Crédito',Math.round(d.LP.totCap+d.LP.totInt)],[],
      ['Cuota','Cuota Mensual','Capital','Interés','Saldo'],
      ...d.LP.rows.map(r=>[r.i,Math.round(r.cuota),Math.round(r.capital),Math.round(r.interes),Math.round(r.saldo)])
    ]);
    XLSX.utils.book_append_sheet(wb,ws,'Largo Plazo');
  }
  const fn2x = (d.progNombre+' - CP'+d.pCP+'% LP'+d.pLP+'%').replace(/[^a-zA-Z0-9\-_ áéíóúÁÉÍÓÚñÑ]/g,'').trim();
  XLSX.writeFile(wb,fn2x+'.xlsx');
}


function calcular3(){
  const mat=getMat(3);
  const tm=parseFloat(document.getElementById('tasa3').value)/100;
  const n=parseInt(document.getElementById('plazo3').value)||0;
  const cargos=parseFloat(document.getElementById('cargos3').value)||0;
  const financiado=getFinanciado(3);
  const cuotaInicial=getContadoVal(3);
  const pct=mat>0?Math.round((financiado/mat)*1000)/10:0;

  if(!mat||mat<=0) return showAlert(3,'Ingresa el valor de matrícula.');
  if(financiado<=0) return showAlert(3,'El monto financiado es cero. Revisa beneficios y pago de contado.');
  if(!n||n<=0) return showAlert(3,'Ingresa el número de meses.');
  if(isNaN(tm)) return showAlert(3,'Ingresa la tasa de interés.');
  const pagoInicial=cuotaInicial+cargos;
  const {rows,cuota,totInt,totCap}=amortizacion(financiado,tm,n);
  const totalCredito=totCap+totInt;
  const totalGeneral=pagoInicial+totalCredito;

  const _prog3 = document.getElementById('prog3');
  const _prog3Nombre = _prog3.options[_prog3.selectedIndex]?.textContent?.replace(/ \(.*\)$/,'') || 'Programa';
  const _benef3snap = _benefs[3].map(b=>({nombre:b.nombre||'Descuento',val:b.val||0,pct:b.pct||0}));
  const _benef3total = getTotalBeneficios(3);
  const _matNeta3 = Math.max(0, mat - _benef3total);
  window._d3={rows,cuota,totInt,totCap,financiado,mat,n,tm,cuotaInicial,cargos,pagoInicial,totalGeneral,
    progNombre:_prog3Nombre, pct:Math.round(pct*10)/10,
    beneficios:_benef3snap, benefTotal:_benef3total, matNeta:_matNeta3};
  setTimeout(()=>registrarHistorial(3), 100);

  const morado='var(--info)', morado_s='var(--info-soft)';
  document.getElementById('res3').innerHTML=`
  <div class="card">
    ${fechaBadgeHtml()}
    <div class="card-title" style="color:var(--info);">Resumen — Crédito Banco Aliado</div>
    <div class="section__title u-mt-5" style="margin-top:0;margin-bottom:10px;color:var(--info);">${icon('credit-card')} Pago Inicial</div>
    <div class="kpi-grid">
      <div class="kpi"><span class="kpi__label">Cuota Inicial Contado</span><div class="kpi__value kpi__value--md">${cop(cuotaInicial)}</div></div>
      ${cargos>0?`<div class="kpi"><span class="kpi__label">Otros Cargos</span><div class="kpi__value kpi__value--md">${cop(cargos)}</div></div>`:''}
      <div class="kpi u-col-span-all"><span class="kpi__label">Total Pago Inicial</span><div class="kpi__value kpi__value--md">${cop(pagoInicial)}</div></div>
    </div>
    <div class="section__title u-mt-5">${icon('calendar')} Crédito a Amortizar</div>
    <div class="kpi-grid">
      <div class="kpi"><span class="kpi__label">Valor Matrícula</span><div class="kpi__value kpi__value--md">${cop(mat)}</div></div>
      <div class="kpi"><span class="kpi__label">Monto Financiado</span><div class="kpi__value kpi__value--md">${cop(financiado)}</div></div>
      <div class="kpi"><span class="kpi__label">Cuota Mensual</span><div class="kpi__value kpi__value--md">${cop(cuota)}</div></div>
      <div class="kpi"><span class="kpi__label">Total Intereses</span><div class="kpi__value kpi__value--md">${cop(totInt)}</div></div>
      <div class="kpi u-col-span-all"><span class="kpi__label">Total Crédito (capital + intereses)</span><div class="kpi__value kpi__value--md">${cop(totalCredito)}</div></div>
    </div>
    <div class="total-banner" style="background:linear-gradient(90deg,var(--info),var(--info));margin-bottom:20px;">
      <div><div class="tl">Pago Inicial</div><div class="tv">${cop(pagoInicial)}</div><div class="ts">Contado + cargos</div></div>
      <div class="total-banner__op" aria-hidden="true">+</div>
      <div><div class="tl">Total Crédito</div><div class="tv">${cop(totalCredito)}</div><div class="ts">${n} cuotas de ${cop(cuota)}</div></div>
      <div class="total-banner__op" aria-hidden="true">=</div>
      <div class="u-text-right"><div class="tl">Costo Total Matrícula</div><div class="tv">${cop(totalGeneral)}</div><div class="ts">Todo incluido</div></div>
    </div>
    <div class="section__title u-mt-5">Tabla de Amortización (${n} meses)</div>
    ${renderTabla(rows,cuota,totInt,totCap)}
    <div class="btn-row">
      <button class="btn btn--sm" data-action="pdf" data-tab="3">${icon('file-text')} Descargar PDF</button>
      <button class="btn btn--sm" data-action="xls" data-tab="3">${icon('bar-chart')} Descargar Excel</button>
    </div>
  </div>`;
  setTimeout(()=>{ const p=document.getElementById('esc-panel-3'); if(p){ const sb=document.createElement('div'); sb.style='margin-top:14px;'; sb.innerHTML=`<button class="btn btn--sm" data-action="guardar-escenario" data-tab="3">${icon('save')} Guardar como escenario para comparar</button>`; document.getElementById('res3').querySelector('.card').appendChild(sb); } renderEscenarios(3); },50);
}

function expPDF3(){
  if(!window._d3) return toast('Primero realiza el calculo','warning');
  const d = window._d3;
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  let y = pdfHeader(doc, 'Simulacion de Credito', 'Credito Banco Aliado - ' + (d.progNombre||''));

  y = pdfCondiciones(doc, y, {
    modalidad: 'Credito con banco aliado',
    tasa: d.tm,
    plazo: d.n + ' cuotas mensuales',
    extra: d.cargos > 0 ? [['Otros cargos del banco', cop(d.cargos)]] : null
  });

  y = pdfBenefSection(doc, y, d.mat, d.beneficios||[], d.benefTotal||0, d.matNeta||d.mat, d.cuotaInicial);

  y = pdfSectionBar(doc, 'PAGO AL MOMENTO DEL DESEMBOLSO', y, PDF.ambar);
  y = pdfKV(doc, y, [
    d.benefTotal > 0 ? ['Matricula neta (despues de descuentos)', cop(d.matNeta||d.mat)] : ['Valor de la matricula', cop(d.mat)],
    ['Pago de contado', cop(d.cuotaInicial)],
    d.cargos > 0 ? ['Otros cargos', cop(d.cargos)] : null,
    ['Total a pagar hoy', cop(d.pagoInicial), 'total'],
  ], {tintaTotal: PDF.ambarS, colorTotal: PDF.ambar});

  y = pdfSectionBar(doc, 'CREDITO A AMORTIZAR', y);
  y = pdfKV(doc, y, [
    ['Monto financiado', cop(d.financiado) + '  (' + d.pct + '% de la matricula)'],
    ['Numero de cuotas', d.n + ' meses'],
    ['Valor de la cuota mensual', cop(d.cuota)],
    ['Total intereses', cop(d.totInt)],
    ['Total del credito', cop(d.totCap + d.totInt), 'total'],
  ]);

  y = pdfSectionBar(doc, 'COSTO TOTAL DE LA MATRICULA', y, PDF.verde);
  y = pdfKV(doc, y, [['Costo total *', cop(d.totalGeneral), 'total']],
    {tintaTotal: PDF.verdeS, colorTotal: PDF.verde});
  y = pdfCostoFootnote(doc, y);

  if(y > 210) { doc.addPage(); y = 22; }
  y = pdfTablaAmort(doc, y, d.rows, d.totCap, d.totInt, 'PLAN DE PAGOS (' + d.n + ' CUOTAS)');

  pdfPie(doc);
  doc.save(safePDF('Credito Banco Aliado - ' + (d.progNombre||'Simulacion')) + '.pdf');
}

function expXLS3(){
  const d=window._d3; if(!d)return;
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet([
    ['Crédito Banco Aliado'],[''],
    ['Valor Matrícula Bruta',Math.round(d.mat)],
    ...((d.beneficios||[]).filter(b=>b.val>0).length>0?
      [['--- BENEFICIOS / DESCUENTOS ---'],...(d.beneficios||[]).filter(b=>b.val>0).map(b=>['  - '+(b.nombre||'Descuento')+' ('+b.pct.toFixed(1)+'%)',-Math.round(b.val)]),
       ['Total Descuentos',-Math.round(d.benefTotal||0)],['Matrícula Neta',Math.round(d.matNeta||d.mat)],['']]:[['']]),
    ['--- PAGO INICIAL ---'],
    ['Cuota Inicial Contado',Math.round(d.cuotaInicial)],
    ['Otros Cargos',Math.round(d.cargos)],
    ['Total Pago Inicial',Math.round(d.pagoInicial)],[''],
    ['--- CRÉDITO ---'],
    ['Monto Financiado',Math.round(d.financiado)],
    ['Cuota Mensual',Math.round(d.cuota)],
    ['Total Intereses',Math.round(d.totInt)],
    ['Total Crédito',Math.round(d.totCap+d.totInt)],
    ['COSTO TOTAL MATRÍCULA',Math.round(d.totalGeneral)],[''],
    ['Cuota','Cuota Mensual','Capital','Interés','Saldo'],
    ...d.rows.map(r=>[r.i,Math.round(r.cuota),Math.round(r.capital),Math.round(r.interes),Math.round(r.saldo)])
  ]);
  XLSX.utils.book_append_sheet(wb,ws,'Banco Aliado');
  const fn3x = (d.progNombre+' - '+d.pct+'%').replace(/[^a-zA-Z0-9\-_ áéíóúÁÉÍÓÚñÑ]/g,'').trim();
  XLSX.writeFile(wb,fn3x+'.xlsx');
}


// ── IDIOMAS ──────────────────────────────────────────────────────────────────
let _idiomasCtx = {};  // stores {tabId, valorIdiomas, progNombre}

// ── Idiomas beneficios state ─────────────────────────────────────
const _benefsId = [];  // [{id, nombre, pct, val}]

function addBenefId() {
  const id = Date.now();
  _benefsId.push({id, nombre:'', pct:0, val:0});
  renderBenefId();
  setTimeout(()=>{
    const rows = document.querySelectorAll('#benef-items-id .benef-item-name');
    if(rows.length) rows[rows.length-1].focus();
  }, 40);
}
function delBenefId(id) {
  const i = _benefsId.findIndex(b=>b.id===id);
  if(i>=0) _benefsId.splice(i,1);
  renderBenefId(); recalcId();
}
function updateBenefIdField(id, field, rawVal) {
  const b = _benefsId.find(x=>x.id===id);
  if(!b) return;
  const mat = _idiomasCtx.valorIdiomas || 0;
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
  container.innerHTML = _benefsId.map(b => `
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
  const total = _benefsId.reduce((s,b)=>s+(parseFloat(b.val)||0),0);
  const mat   = _idiomasCtx.valorIdiomas||0;
  activarSeparadorMiles(container);
  const sub   = document.getElementById('benef-subtotal-id');
  if(sub) sub.textContent = total>0 ? 'Total descuentos: '+cop(total)+(mat>0?' ('+((total/mat)*100).toFixed(1)+'%)':'') : '';
}
function syncContadoId(from) {
  const mat = _idiomasCtx.valorIdiomas||0;
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
  const mat    = _idiomasCtx.valorIdiomas||0;
  const benef  = _benefsId.reduce((s,b)=>s+(parseFloat(b.val)||0),0);
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
  const isMId = (_idiomasCtx.tabId === 2);
  if(isMId) {
    const matId = _idiomasCtx.valorIdiomas || 0;
    const pCP2 = parseFloat(document.getElementById('id-pctCP')?.value)||0;
    const pLP2 = parseFloat(document.getElementById('id-pctLP')?.value)||0;
    const benefId = _benefsId.reduce((s,b)=>s+(b.val||0),0);
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
  _idiomasCtx = {tabId, valorIdiomas, progNombre};

  document.getElementById('modal-val-idiomas').textContent = cop(valorIdiomas);
  document.getElementById('modal-prog-name').textContent = progNombre;
  const tabNames = {1:'Crédito Corto Plazo', 2:'Crédito Mixto', 3:'Banco Aliado'};
  document.getElementById('modal-tab-name').textContent = tabNames[tabId] || '';
  document.getElementById('res-idiomas').innerHTML = '';
  document.getElementById('modal-alert').hidden = true;

  // ── Inherit ALL conditions from parent tab ──────────────────────
  // Always reset beneficios idiomas first
  _benefsId.splice(0, _benefsId.length);  // fully empty the array

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
    _benefs[1].forEach(b => {
      _benefsId.push({id: Date.now()*1000+_benefsId.length, nombre: b.nombre,
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
    _benefs[2].forEach(b => {
      _benefsId.push({id: Date.now()*1000+_benefsId.length, nombre: b.nombre,
        pct: b.pct, val: Math.round(valorIdiomas * b.pct / 100)});
    });
    // Store CP/LP split for combined display
    _idiomasCtx.pctCP  = parseFloat(document.getElementById('pctCP').value)||40;
    _idiomasCtx.pctLP  = parseFloat(document.getElementById('pctLP').value)||60;
    _idiomasCtx.mesesCP = parseInt(document.getElementById('plazoCP').value)||6;
    _idiomasCtx.semLP   = parseInt(document.getElementById('plazoLP').value)||8;  // semestres
    _idiomasCtx.mesesLP = Math.round(_idiomasCtx.semLP * 6 * 1.5);  // auto-calculated payoff months

  } else if(tabId === 3) {
    const tasa3 = parseFloat(document.getElementById('tasa3').value)||1.5;
    const meses3 = parseInt(document.getElementById('plazo3').value)||12;
    document.getElementById('id-tasa').value  = tasa3.toFixed(2);
    document.getElementById('id-meses').value = meses3;
    const cont3pct = parseFloat(document.getElementById('cont3-pct').value)||0;
    document.getElementById('id-cont-pct').value = cont3pct || '';
    document.getElementById('id-cont-val').value  = cont3pct > 0 ? Math.round(valorIdiomas * cont3pct / 100) : '';
    _benefs[3].forEach(b => {
      _benefsId.push({id: Date.now()*1000+_benefsId.length, nombre: b.nombre,
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
    document.getElementById('id-pctCP').value  = _idiomasCtx.pctCP  || 40;
    document.getElementById('id-pctLP').value  = _idiomasCtx.pctLP  || 60;
    document.getElementById('id-meses').value  = _idiomasCtx.mesesCP || 6;
    document.getElementById('id-mesesLP').value= _idiomasCtx.semLP || 8;  // semestres
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
  document.getElementById('modal-idiomas').dataset.open = 'true';
  document.body.style.overflow = 'hidden';
}

function cerrarIdiomas() {
  document.getElementById('modal-idiomas').dataset.open = 'false';
  document.body.style.overflow = '';
}

function calcTaIdiomas() {
  const tm = parseFloat(document.getElementById('id-tasa').value)/100;
  if(!isNaN(tm)) document.getElementById('id-ta').textContent = ((Math.pow(1+tm,12)-1)*100).toFixed(2)+'%';
}

function calcularIdiomas() {
  const mat   = _idiomasCtx.valorIdiomas;
  const tabId = _idiomasCtx.tabId;
  const benef = _benefsId.reduce((s,b)=>s+(parseFloat(b.val)||0),0);
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
  let pctCP   = parseFloat(document.getElementById('id-pctCP')?.value)  || _idiomasCtx.pctCP  || 40;
  let pctLP   = parseFloat(document.getElementById('id-pctLP')?.value)  || _idiomasCtx.pctLP  || 60;
  let mesesLP = parseInt(document.getElementById('id-mesesLP')?.value)  || _idiomasCtx.mesesLP || 9;
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
    Object.assign(_idiomasCtx, {pctCP, pctLP, mesesCP: n, mesesLP: nLPpago, semLP: semLPId});
    const _pagoInicialId = pagoInicialMixto;
    const _totalGeneralId = _pagoInicialId + totalCredito;

    // ── Build results for Mixto ──────────────────────────────────
    const splitCheck = pctCP + pctLP;
    const splitOk = Math.abs(splitCheck - (1 - (benef/mat) - (cont/mat))*100) < 2;

    window._dIdiomas = {rows,cuota,totInt,totCap,financiado: finCP+finLP, mat,n,tm,
      cuotaInicial,garantisa:garantisaMixto,garCP,garLP,finCP,finLP,
      pagoInicial:_pagoInicialId,totalCredito,totalGeneral:_totalGeneralId,
      progNombre:_idiomasCtx.progNombre,beneficios:benef,isMixto,
      idCP,idLP,pctCP,pctLP,mesesLP:nLPpago,semLP:semLPId,semFin:semFinId};

    // ── Proyección multi-semestre de la porción LP de IDIOMAS ──
    let _proyIdiomasHtml = '';
    const verProyId = document.getElementById('id-proyLP')?.checked;
    if(verProyId && pctLP > 0 && semFinId > 0) {
      const ipcPctId = parseFloat(document.getElementById('id-ipcLP')?.value);
      const ipcId = (isNaN(ipcPctId) ? 5 : ipcPctId) / 100;
      const inicioId = Math.max(1, semLPId - semFinId + 1);
      const proyId = proyectarLP(mat, pctLP, inicioId, semLPId, ipcId);
      window._proyLPIdiomas = {...proyId, pctLP, ipcPct:(isNaN(ipcPctId)?5:ipcPctId), etiqueta:'Idiomas'};
      _proyIdiomasHtml = renderProyeccionLP(proyId, pctLP, (isNaN(ipcPctId)?5:ipcPctId), 'Idiomas');
    } else {
      window._proyLPIdiomas = null;
    }

    document.getElementById('res-idiomas').innerHTML = `
    <div style="border-top:1.5px solid var(--border);padding-top:20px;">
      ${fechaBadgeHtml()}
      <div class="section__title u-mt-5" style="margin-top:0;color:var(--danger);">${icon('credit-card')} Pago Inicial — Idiomas Mixto</div>
      <div class="kpi-grid">
        <div class="kpi"><span class="kpi__label">Valor Idiomas</span><div class="kpi__value kpi__value--md">${cop(mat)}</div></div>
        <div class="kpi"><span class="kpi__label">Financiado CP + LP</span><div class="kpi__value kpi__value--md">${cop(finCP+finLP)}</div></div>
        <div class="kpi"><span class="kpi__label">Pago de Contado</span><div class="kpi__value kpi__value--md">${cop(cuotaInicial)}</div></div>
        <div class="kpi kpi--warning"><span class="kpi__label">Garantisa CP (4.17%)</span><div class="kpi__value kpi__value--md">${cop(garCP)}</div></div>
        <div class="kpi kpi--warning"><span class="kpi__label">Garantisa LP (2.86%)</span><div class="kpi__value kpi__value--md">${cop(garLP)}</div></div>
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
      <div style="background:var(--success-soft);border-left:4px solid var(--success);border-radius:0 var(--r-md) var(--r-md) 0;
        padding:14px 18px;margin:10px 0;font-size:13px;color:var(--text);line-height:1.7;">
        <strong style="color:var(--success);display:block;margin-bottom:6px;">${icon('info')} Crédito LP Idiomas — Tasa Futura</strong>
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
      <div style="background:var(--success-soft);border-radius:var(--r-md);padding:8px 12px;font-size:11px;color:var(--success);margin-top:6px;font-style:italic;">
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
    window._proyLPIdiomas = null;
    const res = amortizacion(financiado, tm, n);
    rows = res.rows; cuota = res.cuota; totInt = res.totInt; totCap = res.totCap;
    totalCredito = totCap + totInt;
  }

  const totalGeneral = pagoInicial + totalCredito;

  // Retrieve main tab totals for combined scenario
  let mainPagoInicial = 0, mainTotalCredito = 0, mainCuotaMensual = 0, mainLabel = '';
  if(tabId===1 && window._d1) {
    mainPagoInicial = window._d1.pagoInicial||0;
    mainTotalCredito = (window._d1.totCap||0)+(window._d1.totInt||0);
    mainCuotaMensual = window._d1.cuota||0;
    mainLabel = 'Crédito Corto Plazo';
  } else if(tabId===2 && window._d2) {
    mainPagoInicial = window._d2.pagoInicial||0;
    mainTotalCredito = (window._d2.CP?(window._d2.CP.totCap+window._d2.CP.totInt):0)+(window._d2.LP?(window._d2.LP.noAmortize?window._d2.LP.capital:(window._d2.LP.totCap+window._d2.LP.totInt)):0);
    mainCuotaMensual = (window._d2.CP?window._d2.CP.cuota:0);  // LP cuota unknown
    mainLabel = 'Crédito Mixto (CP+LP)';
  } else if(tabId===7 && window._d7) {
    entry = {tabId, fecha, prog:_d7.progNombre||'Programa', tipo:tabNames[7],
      resumen:'capacidad '+cop(_d7.cap)+'/mes · '+_d7.n+' cuotas · '+(_d7.tm*100).toFixed(2)+'%',
      cuota:_d7.cuota, total:_d7.costoTotal,
      snap:JSON.parse(JSON.stringify(_d7))};
  } else if(tabId===3 && window._d3) {
    mainPagoInicial = window._d3.pagoInicial||0;
    mainTotalCredito = (window._d3.totCap||0)+(window._d3.totInt||0);
    mainCuotaMensual = window._d3.cuota||0;
    mainLabel = 'Crédito Banco Aliado';
  }

  const hasMain = mainTotalCredito > 0;
  const combinedPagoInicial = mainPagoInicial + pagoInicial;
  const combinedTotal = mainTotalCredito + totalGeneral;

  document.getElementById('res-idiomas').innerHTML = `
    <div style="border-top:1.5px solid var(--border);padding-top:20px;">
      ${fechaBadgeHtml()}
      <div class="section__title u-mt-5" style="margin-top:0;color:var(--danger);">${icon('credit-card')} Pago Inicial — Idiomas</div>
      <div class="kpi-grid">
        <div class="kpi"><span class="kpi__label">Cuota Inicial Contado</span><div class="kpi__value kpi__value--md">${cop(cuotaInicial)}</div></div>
        <div class="kpi kpi--warning"><span class="kpi__label">Garantisa (4.17%)</span><div class="kpi__value kpi__value--md">${cop(garantisa)}</div></div>
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
      <div style="margin-top:24px;background:linear-gradient(135deg,var(--accent-soft),var(--success-soft));border-radius:12px;padding:18px 20px;border:1.5px solid var(--accent);">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--accent);margin-bottom:14px;"> Escenario Combinado — ${mainLabel} + Idiomas</div>
        <div class="kpi-grid">
          <div class="kpi"><span class="kpi__label">Pago Inicial (pregrado)</span><div class="kpi__value kpi__value--md">${cop(mainPagoInicial)}</div></div>
          <div class="kpi"><span class="kpi__label">Pago Inicial (idiomas)</span><div class="kpi__value kpi__value--md">${cop(pagoInicial)}</div></div>
          <div class="kpi kpi--warning u-col-span-all"><span class="kpi__label">Total Pago Inicial Combinado</span><div class="kpi__value kpi__value--md">${cop(combinedPagoInicial)}</div></div>
          <div class="kpi"><span class="kpi__label">Cuota Mensual Pregrado</span><div class="kpi__value kpi__value--md">${cop(mainCuotaMensual)}</div></div>
          <div class="kpi kpi--success"><span class="kpi__label">Cuota Mensual Idiomas</span><div class="kpi__value kpi__value--md">${cop(cuota)}</div></div>
          <div class="kpi kpi--accent u-col-span-all"><span class="kpi__label">Cuota Mensual Total Combinada</span><div class="kpi__value kpi__value--md">${cop(mainCuotaMensual+cuota)}</div></div>
        </div>
        <div class="total-banner" style="margin-top:14px;margin-bottom:0;">
          <div><div class="tl">Costo Pregrado</div><div class="tv">${cop(mainPagoInicial+mainTotalCredito)}</div></div>
          <div class="total-banner__op" aria-hidden="true">+</div>
          <div><div class="tl">Costo Idiomas</div><div class="tv">${cop(totalGeneral)}</div></div>
          <div class="total-banner__op" aria-hidden="true">=</div>
          <div class="u-text-right"><div class="tl">Costo Total Semestre</div><div class="tv">${cop(combinedPagoInicial+mainTotalCredito+totalCredito)}</div></div>
        </div>
      </div>` : `
      <div style="background:var(--danger-soft);border-radius:10px;padding:14px 16px;font-size:13px;color:var(--danger);margin-top:16px;">
         <strong>Consejo:</strong> Primero calcula el crédito de pregrado en la pestaña correspondiente para ver el escenario combinado aquí.
      </div>`}

      <div class="btn-row u-mt-16">
        <button class="btn btn--sm" data-action="pdf-idiomas">${icon('file-text')} PDF Idiomas</button>
        <button class="btn btn--sm" data-action="xls-idiomas">${icon('bar-chart')} Excel Idiomas</button>
        <button class="btn btn--sm" data-action="pdf-combinado">${icon('files')} PDF Combinado (Pregrado + Idiomas)</button>
      </div>
    </div>
  `;

  window._dIdiomas = {rows,cuota,totInt,totCap,financiado,mat,n,tm,cuotaInicial,garantisa,pagoInicial,totalCredito,totalGeneral,progNombre:_idiomasCtx.progNombre,beneficios:benef,isMixto,idCP:isMixto?idCP:null,idLP:isMixto?idLP:null};
}

function expPDFIdiomas(){
  const d = window._dIdiomas;
  if(!d) return toast('Primero calcula el credito de idiomas','warning');
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  const pct = Math.round((d.financiado/d.mat)*100);
  const filename = (d.progNombre + ' - Idiomas').replace(/[^a-zA-Z0-9\-_ ]/g,'').trim();
  let y = pdfHeader(doc, 'Credito de Idiomas', (d.progNombre||'') + ' - ' + pct + '% financiado');

  y = pdfCondiciones(doc, y, {
    modalidad: d.isMixto ? 'Credito de idiomas - mixto (corto y largo plazo)' : 'Credito de idiomas - corto plazo',
    tasa: d.tm,
    plazo: d.isMixto ? ('Corto plazo: ' + d.n + ' cuotas mensuales') : (d.n + ' cuotas mensuales'),
    garantisa: d.isMixto ? 'Corto plazo 4.17% - Largo plazo 2.86% sobre cada tramo'
                         : 'Aporte del 4.17% sobre el monto financiado (3.5% + IVA)',
    gracia: d.isMixto ? '12 meses despues de graduarse (tramo de largo plazo)' : null
  });

  y = pdfSectionBar(doc, 'PAGO AL MOMENTO DEL DESEMBOLSO', y, PDF.ambar);
  y = pdfKV(doc, y, [
    ['Valor del programa de idiomas', cop(d.mat)],
    ['Pago de contado', cop(d.cuotaInicial)],
    d.isMixto && d.garCP ? ['Aporte Garantisa corto plazo (4.17%)', cop(d.garCP)] : null,
    d.isMixto && d.garLP ? ['Aporte Garantisa largo plazo (2.86%)', cop(d.garLP)] : null,
    !d.isMixto ? ['Aporte Garantisa (4.17%)', cop(d.garantisa)] : null,
    ['Total a pagar hoy', cop(d.pagoInicial), 'total'],
  ], {tintaTotal: PDF.ambarS, colorTotal: PDF.ambar});

  if(d.isMixto && d.idCP) {
    y = pdfSectionBar(doc, 'TRAMO CORTO PLAZO (' + (d.pctCP||0).toFixed(1) + '%) - SE PAGA MIENTRAS ESTUDIA', y);
    y = pdfKV(doc, y, [
      ['Monto financiado', cop(d.finCP)],
      ['Numero de cuotas', d.n + ' meses'],
      ['Valor de la cuota mensual', cop(d.idCP.cuota)],
      ['Total intereses', cop(d.idCP.totInt)],
      ['Total tramo corto plazo', cop(d.idCP.totCap + d.idCP.totInt), 'total'],
    ]);
    const nLP = d.mesesLP || 72;
    y = pdfSectionBar(doc, 'TRAMO LARGO PLAZO (' + (d.pctLP||0).toFixed(1) + '%) - SE PAGA AL GRADUARSE', y, PDF.verde);
    y = pdfKV(doc, y, [
      ['Capital a amortizar', cop(d.finLP)],
      ['Semestres del programa', (d.semLP||8) + ' semestres'],
      ['Periodo de gracia', '12 meses despues de graduarse'],
      ['Plazo estimado de pago', nLP + ' cuotas mensuales'],
      ['Valor de la cuota', 'Se define al iniciar la amortizacion'],
    ]);
  } else {
    y = pdfSectionBar(doc, 'CREDITO A AMORTIZAR', y);
    y = pdfKV(doc, y, [
      ['Monto financiado', cop(d.financiado)],
      ['Numero de cuotas', d.n + ' meses'],
      ['Valor de la cuota mensual', cop(d.cuota)],
      ['Total intereses', cop(d.totInt)],
      ['Total del credito', cop(d.totalCredito), 'total'],
    ]);
  }

  y = pdfSectionBar(doc, 'COSTO TOTAL DE IDIOMAS', y, PDF.verde);
  y = pdfKV(doc, y, [['Costo total *', cop(d.totalGeneral), 'total']],
    {tintaTotal: PDF.verdeS, colorTotal: PDF.verde});
  y = pdfCostoFootnote(doc, y, '* Valor de idiomas + Aporte Garantisa + Intereses del credito');

  const filas = (d.isMixto && d.idCP) ? d.idCP.rows : d.rows;
  const tc = (d.isMixto && d.idCP) ? d.idCP.totCap : d.totCap;
  const ti = (d.isMixto && d.idCP) ? d.idCP.totInt : d.totInt;
  if(y > 205) { doc.addPage(); y = 22; }
  y = pdfTablaAmort(doc, y, filas, tc, ti,
      'PLAN DE PAGOS' + (d.isMixto ? ' CORTO PLAZO' : ' IDIOMAS') + ' (' + d.n + ' CUOTAS)');

  y = pdfProyeccionLP(doc, y, window._proyLPIdiomas, 'Idiomas');
  pdfPie(doc);
  doc.save(safePDF(filename) + '.pdf');
}

function expXLSIdiomas(){
  const d=window._dIdiomas; if(!d)return;
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
}

// Backdrop click handled via onclick on the modal div (see HTML)


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

let _tcTipoEq = 'efectiva';

function setTipoEq(tipo) {
  _tcTipoEq = tipo;
  _pressed(document.getElementById('tc-ev'), tipo==='efectiva');
  _pressed(document.getElementById('tc-nom'), tipo==='nominal');
  document.getElementById('tc-nom-per-wrap').style.display = tipo==='nominal' ? 'block' : 'none';
  convertirTasas();
}

function convertirTasas() {
  const valorInput = parseFloat(document.getElementById('tc-valor').value);
  const periodoOrigen = document.getElementById('tc-periodo').value;
  if(isNaN(valorInput) || valorInput < 0) {
    document.getElementById('tc-tabla').innerHTML = '<p style="color:var(--text-3);text-align:center;padding:24px;">Ingresa una tasa válida.</p>';
    return;
  }

  const i_input = valorInput / 100;
  const n_origen = TC_PERIODOS[periodoOrigen].n; // períodos por año del origen

  // Convert input rate to Effective Annual Rate (EAR) first
  let ear;
  if(_tcTipoEq === 'efectiva') {
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

  let html = `<div class="table-wrap"><table class="tbl">
    <thead><tr>
      <th class="u-text-left">Período</th>
      <th>Períodos/Año</th>
      <th>Tasa Efectiva</th>
      <th>Nominal Anual</th>
    </tr></thead><tbody>`;

  results.forEach(r => {
    const highlight = r.isOrigen ? 'background:var(--info-soft);font-weight:700;' : '';
    const badge = r.isOrigen ? ' <span style="background:var(--info);color:white;font-size:10px;padding:2px 6px;border-radius:10px;margin-left:4px;">ORIGEN</span>' : '';
    html += `<tr style="${highlight}">
      <td style="text-align:left;font-family:'Inter',sans-serif;font-weight:${r.isOrigen?'700':'500'};color:${r.isOrigen?'var(--info)':'var(--text)'};">${r.label}${badge}</td>
      <td class="u-text-center">${r.n}</td>
      <td style="color:${r.isOrigen?'var(--info)':'inherit'};">${fmt(r.i_ef)}</td>
      <td style="color:var(--text-3);">${fmtN(r.nom_anual)}</td>
    </tr>`;
  });

  html += `</tbody></table></div>`;

  // EAR banner
  html += `<div style="margin-top:14px;background:linear-gradient(90deg,var(--info),var(--info));border-radius:var(--r-md);padding:14px 18px;color:white;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    <div>
      <div style="font-size:11px;opacity:.8;text-transform:uppercase;letter-spacing:.5px;">Tasa Efectiva Anual equivalente</div>
      <div style="font-size:26px;font-weight:700;">${(ear*100).toFixed(4)}%</div>
    </div>
    <div class="u-text-right">
      <div style="font-size:11px;opacity:.8;">Tasa de entrada</div>
      <div style="font-size:18px;font-weight:600;">${valorInput.toFixed(4)}% ${TC_PERIODOS[periodoOrigen].label}</div>
    </div>
  </div>`;

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
      if(tab===1) return calcular1();
      if(tab===2) return calcular2();
      if(tab===3) return calcular3();
      if(tab===7) return calcular7();
      return;
    case 'limpiar-tab': return tab===7 ? limpiar7() : limpiarTab(tab);
    case 'tipo-eq': return setTipoEq(el.dataset.tipo);
    case 'calcular-refi': return calcularRefi();
    case 'limpiar-refi': return limpiarRefi();
    case 'descargar-plantilla': return descargarPlantilla();
    case 'file-proxy': return document.getElementById(el.dataset.target)?.click();
    case 'auto-leer': return autoLeerSimulador();
    case 'set-tipo': return setTipo(el.dataset.tipo);
    case 'generar-html': return generarHTML();
    case 'guardar-esc-refi': return guardarEscRefi();
    case 'pdf-refi': return expPDFRefi();
    case 'comparar-esc-refi': return compararEscRefi();
    case 'eliminar-esc-refi': return eliminarEscRefi(index);
    case 'pdf-refi-comp': return expPDFRefiComp();
    case 'pdf':
      if(tab===1) return expPDF1();
      if(tab===2) return expPDF2();
      if(tab===3) return expPDF3();
      if(tab===7) return expPDF7();
      return;
    case 'xls':
      if(tab===1) return expXLS1();
      if(tab===2) return expXLS2();
      if(tab===3) return expXLS3();
      if(tab===7) return expXLS7();
      return;
    case 'guardar-escenario': return guardarEscenario(tab);
    case 'pdf-idiomas': return expPDFIdiomas();
    case 'xls-idiomas': return expXLSIdiomas();
    case 'pdf-combinado': return expPDFCombinado();
    case 'del-benef-idiomas': return delBenefId(id);
    case 'limpiar-historial': return limpiarHistorial();
    case 'eliminar-historial': return eliminarHistorial(id);
    case 'comparar-escenarios': return compararEscenarios(tab);
    case 'eliminar-escenario': return eliminarEscenario(tab, index);
    case 'xls-comparativa': return expXLSComparativa(tab);
    case 'scrim-idiomas': if(event.target===el) return cerrarIdiomas(); return;
    case 'cerrar-idiomas': return cerrarIdiomas();
    case 'add-benef-idiomas': return addBenefId();
    case 'calcular-idiomas': return calcularIdiomas();
    case 'scrim-pin': if(event.target===el) return cancelarRefiPin(); return;
    case 'verificar-pin': return verificarRefiPin();
    case 'cancelar-pin': return cancelarRefiPin();
  }
}

document.addEventListener('click', handleUIAction);

function handleUIInput(event) {
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

document.addEventListener('input', handleUIInput);

document.addEventListener('change', event => {
  const el = event.target.closest('[data-change-action]');
  if(!el) return;
  const action = el.dataset.changeAction;
  const tab = Number(el.dataset.tab);
  if(action==='filtrar-programas') return filtrarProgramas(tab);
  if(action==='set-mat') return setMat(tab);
  if(action==='convertir-tasas') return convertirTasas();
  if(action==='cargar-html') return cargarHTML(event);
  if(action==='cargar-excel') return cargarExcel(event);
});

document.addEventListener('dragover', event => {
  const dz = event.target.closest('[data-dropzone]');
  if(!dz) return;
  dzOver(event, dz.id);
});
document.addEventListener('dragleave', event => {
  const dz = event.target.closest('[data-dropzone]');
  if(!dz) return;
  dzLeave(dz.id);
});
document.addEventListener('drop', event => {
  const dz = event.target.closest('[data-dropzone]');
  if(!dz) return;
  dzDrop(event, dz.dataset.dropzone);
});


window.addEventListener('DOMContentLoaded', () => {
  try { runFinancialSelfTests(); } catch(e) { console.error('[Motor financiero] Error ejecutando pruebas internas', e); }
}, {once:true});

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

  const benefRows = _benefs[7].filter(b => (b.val||0) > 0);

  window._d7 = {...d, cuotaInicial, desembolso, totalCredito, costoTotal,
    cuota: A.cuota, totInt: A.totInt, totCap: A.totCap, rows: A.rows,
    progNombre: _prog7Nombre, pct: Math.round(pctFin*10)/10,
    beneficios: benefRows.map(b=>({nombre:b.nombre||'Descuento', val:b.val||0, pct:b.pct||0})),
    benefTotal: d.benef, matNeta: d.neto};

  document.getElementById('res7').innerHTML = `
  <div class="card">
    ${fechaBadgeHtml()}
    <div class="card__title">${icon('wallet')} Cálculo de Cuota Inicial</div>

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

    <div class="btn-row">
      <button class="btn btn--sm" data-action="pdf" data-tab="7">${icon('file-text')} Descargar PDF</button>
      <button class="btn btn--sm" data-action="xls" data-tab="7">${icon('bar-chart')} Descargar Excel</button>
    </div>
  </div>`;

  toast('Cuota inicial calculada', 'success');
  setTimeout(()=>registrarHistorial(7), 100);
}

function limpiar7() {
  ['mat7','cap7'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
  ['mat7-lbl','cap7-lbl'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=''; });
  document.getElementById('plazo7').value = 6;
  document.getElementById('tasa7').value  = 1.5;
  document.getElementById('prog7').value  = '';
  _benefs[7] = [];
  renderBeneficios(7);
  window._d7 = null;
  document.getElementById('res7').innerHTML = '<div class="card"><div class="empty">'
    + '<div class="empty__icon">' + icon('wallet','icon-xl') + '</div>'
    + '<div class="empty__title">Sin resultados todavía</div>'
    + '<div class="empty__desc">Ingresa la capacidad de pago mensual, el plazo y la tasa, luego presiona <strong>Calcular Cuota Inicial</strong>.</div>'
    + '</div></div>';
  recalc7();
}

// ── Exportables ──
function expPDF7() {
  const d = window._d7;
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
}

function expXLS7() {
  const d = window._d7;
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
}

function limpiarTab(tabId) {
  if(!confirm('¿Limpiar todos los campos y resultados de esta pestaña?')) return;
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
  if(tabId===1) window._d1=null;
  if(tabId===2) window._d2=null;
  if(tabId===3) window._d3=null;
  // Clear beneficios
  _benefs[tabId] = [];
  renderBeneficios(tabId);
  recalcAll(tabId);
  // Clear saved scenarios for this tab
  _escenarios[tabId] = [];
  const escPanel = document.getElementById('esc-panel-'+tabId);
  if(escPanel){ escPanel.innerHTML=''; escPanel.style.display='none'; }
  // Reset aportes info
  if(tabId<=2) actualizarAportes(tabId);
}

// ── ESCENARIOS ENGINE ─────────────────────────────────────────────────────────
const _escenarios = {1:[], 2:[], 3:[]};


// ── HISTORIAL DE SIMULACIONES (localStorage) ─────────────────────────────────
const _HIST_KEY = 'simulador_credito_historial_v1';
const _HIST_MAX = 10;

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
  const tabNames = {1:'Corto Plazo', 2:'Mixto CP/LP', 3:'Banco Aliado', 7:'Cuota Inicial'};

  if(tabId===1 && window._d1) {
    entry = {tabId, fecha, prog:_d1.progNombre||'Programa', tipo:tabNames[1],
      resumen:_d1.pct+'% · '+_d1.n+' meses · '+(_d1.tm*100).toFixed(2)+'%',
      cuota:_d1.cuota, total:_d1.totalGeneral,
      snap:JSON.parse(JSON.stringify(_d1))};
  } else if(tabId===2 && window._d2) {
    const totCred = (_d2.CP?(_d2.CP.totCap+_d2.CP.totInt):0)+(_d2.LP?(_d2.LP.noAmortize?_d2.LP.capital:(_d2.LP.totCap+_d2.LP.totInt)):0);
    entry = {tabId, fecha, prog:_d2.progNombre||'Programa', tipo:tabNames[2],
      resumen:'CP'+_d2.pCP+'% LP'+_d2.pLP+'% · '+(_d2.tm*100).toFixed(2)+'%',
      cuota:(_d2.CP?_d2.CP.cuota:0), total:_d2.pagoInicial+totCred,
      snap:JSON.parse(JSON.stringify(_d2))};
  } else if(tabId===3 && window._d3) {
    entry = {tabId, fecha, prog:_d3.progNombre||'Programa', tipo:tabNames[3],
      resumen:_d3.pct+'% · '+_d3.n+' meses · '+(_d3.tm*100).toFixed(2)+'%',
      cuota:_d3.cuota, total:_d3.totalGeneral,
      snap:JSON.parse(JSON.stringify(_d3))};
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

function limpiarHistorial() {
  if(!confirm('¿Borrar todo el historial de simulaciones guardadas en este navegador?')) return;
  localStorage.removeItem(_HIST_KEY);
  renderHistorial();
}

function renderHistorial() {
  const panel = document.getElementById('historial-panel');
  if(!panel) return;
  const list = getHistorial();
  if(list.length === 0) { panel.innerHTML=''; panel.hidden = true; return; }
  panel.hidden = false;
  const tabColors = {1:'var(--accent)', 2:'var(--success)', 3:'var(--info)'};
  let html = `<div class="card__head u-mt-5">
    <h3>${icon('history')} Historial de Simulaciones (${list.length})</h3>
    <button class="btn btn--sm btn--ghost" data-action="limpiar-historial">Borrar todo</button>
  </div>
  <div class="list">`;
  list.forEach(e => {
    html += `<div class="list-item">
      <div class="stack-dot" style="background:${tabColors[e.tabId]||'var(--text-3)'}"></div>
      <div class="list-item__main">
        <strong>${escHTML(e.prog)}</strong>
        <span class="u-accent">${escHTML(e.tipo)}</span>
        <span>${escHTML(e.resumen)}</span>
        <span class="u-muted">${escHTML(e.fecha)}</span>
      </div>
      <div class="u-num u-center">
        <div style="font-weight:700;font-size:13px;">${cop(e.cuota)}/mes</div>
        <div class="u-fs-11-muted">${cop(e.total)}</div>
      </div>
      <button class="btn btn--ghost btn--icon btn--sm" data-action="eliminar-historial" data-id="${e.id}" title="Eliminar">${icon('x')}</button>
    </div>`;
  });
  html += '</div>';
  panel.innerHTML = html;
}

function guardarEscenario(tabId) {
  let snapshot = null;
  if(tabId===1 && window._d1) {
    snapshot = {
      label: (_d1.progNombre||'Programa') + ' — ' + _d1.pct + '%',
      sub: _d1.n + ' meses · tasa ' + (_d1.tm*100).toFixed(2) + '%',
      cuota: _d1.cuota, totalCredito: _d1.totCap+_d1.totInt,
      pagoInicial: _d1.pagoInicial, totalGeneral: _d1.totalGeneral,
      financiado: _d1.financiado, intereses: _d1.totInt,
      data: JSON.parse(JSON.stringify(_d1))
    };
  } else if(tabId===2 && window._d2) {
    const totCred = (_d2.CP?(_d2.CP.totCap+_d2.CP.totInt):0)+(_d2.LP?(_d2.LP.noAmortize?_d2.LP.capital:(_d2.LP.totCap+_d2.LP.totInt)):0);
    const lpGracePeriod = _d2.nLP ? Math.round(_d2.nLP * 1.5) : null;
    snapshot = {
      label: (_d2.progNombre||'Programa') + ' — CP' + _d2.pCP + '% LP' + _d2.pLP + '%',
      sub: (_d2.nCP||0) + ' m CP · ' + (_d2.nLP||0) + ' m LP · tasa ' + (_d2.tm*100).toFixed(2) + '%',
      cuota: (_d2.CP?_d2.CP.cuota:0)+(_d2.LP?_d2.LP.cuota:0),
      totalCredito: totCred, pagoInicial: _d2.pagoInicial,
      totalGeneral: _d2.pagoInicial+totCred,
      financiado: _d2.finCP+_d2.finLP, intereses: (_d2.CP?_d2.CP.totInt:0)+(_d2.LP?_d2.LP.totInt:0),
      isMixto: true,
      finCP: _d2.finCP||0,       finLP: _d2.finLP||0,
      nCP:   _d2.nCP||0,         nLP:   _d2.nLP||0,
      cuotaCP: _d2.CP?_d2.CP.cuota:0,   cuotaLP: _d2.LP?_d2.LP.cuota:0,
      intCP:   _d2.CP?_d2.CP.totInt:0,  intLP:   _d2.LP?_d2.LP.totInt:0,
      totCP:   _d2.CP?(_d2.CP.totCap+_d2.CP.totInt):0,
      totLP:   _d2.LP?(_d2.LP.noAmortize?_d2.LP.capital:(_d2.LP.totCap+_d2.LP.totInt)):0,
      lpGrace: lpGracePeriod,
      data: JSON.parse(JSON.stringify(_d2))
    };
  } else if(tabId===3 && window._d3) {
    snapshot = {
      label: (_d3.progNombre||'Programa') + ' — ' + _d3.pct + '%',
      sub: _d3.n + ' meses · tasa ' + (_d3.tm*100).toFixed(2) + '%',
      cuota: _d3.cuota, totalCredito: _d3.totCap+_d3.totInt,
      pagoInicial: _d3.pagoInicial, totalGeneral: _d3.totalGeneral,
      financiado: _d3.financiado, intereses: _d3.totInt,
      data: JSON.parse(JSON.stringify(_d3))
    };
  }
  if(!snapshot) return alert('Primero calcula un crédito antes de guardar el escenario.');
  if(_escenarios[tabId].length >= 3) {
    if(!confirm('Ya tienes 3 escenarios guardados. ¿Reemplazar el más antiguo?')) return;
    _escenarios[tabId].shift();
  }
  _escenarios[tabId].push(snapshot);
  renderEscenarios(tabId);
}

function eliminarEscenario(tabId, idx) {
  _escenarios[tabId].splice(idx, 1);
  renderEscenarios(tabId);
}

function renderEscenarios(tabId) {
  const panel = document.getElementById('esc-panel-'+tabId);
  if(!panel) return;
  const list = _escenarios[tabId];
  if(list.length === 0) { panel.hidden = true; return; }
  panel.hidden = false;
  const colors = ['var(--accent)','var(--success)','var(--info)'];
  let html = `<div class="card__head u-mt-5">
    <h3>${icon('clipboard')} Escenarios Guardados (${list.length}/3)</h3>
    ${list.length >= 2 ? `<button class="btn btn--sm btn--primary" data-action="comparar-escenarios" data-tab="${tabId}"> Comparar</button>` : ''}
  </div>
  <div class="list">`;
  list.forEach((e,i) => {
    html += `<div class="list-item">
      <div class="step-num step-num--fill" style="background:${colors[i]}">${i+1}</div>
      <div class="list-item__main">
        <strong>${escHTML(e.label)}</strong>
        <span>${escHTML(e.sub)}</span>
      </div>
      <div style="text-align:right;margin-right:8px;">
        <div style="font-size:13px;font-weight:700;color:${colors[i]};">${cop(e.cuota)}/mes</div>
        <div class="u-fs-11-muted">Total: ${cop(e.totalGeneral)}</div>
      </div>
      <button class="btn btn--ghost btn--icon btn--sm" data-action="eliminar-escenario" data-tab="${tabId}" data-index="${i}" title="Eliminar">${icon('x')}</button>
    </div>`;
  });
  html += '</div>';
  // Save as escenario btn
  html += `<button class="btn btn--sm" data-action="guardar-escenario" data-tab="${tabId}">${icon('save')} Guardar simulación actual como escenario</button>`;
  panel.innerHTML = html;
}


// ── Exportar comparativa de escenarios a Excel ───────────────────────────────
function expXLSComparativa(tabId) {
  const list = _escenarios[tabId];
  if(!list || list.length < 2) return alert('Guarda al menos 2 escenarios para comparar.');
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
}

function compararEscenarios(tabId) {
  const list = _escenarios[tabId];
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

  let html = `<div class="card__head u-mt-5" style="margin-top:20px;border-top:1.5px solid var(--border);padding-top:16px;">
    <h3>${icon('scale')} Comparativa de Escenarios</h3>
    <button class="btn btn--sm btn--primary" style="background:var(--success);" data-action="xls-comparativa" data-tab="${tabId}">${icon('bar-chart')} Exportar a Excel</button>
  </div>`;

  // Context note for mixto
  if(isMixto) {
    const nCP0 = list[0].nCP, nLP0 = list[0].nLP;
    const grace0 = list[0].lpGrace;
    html += `<div style="background:var(--accent-soft);border-radius:var(--r-md);padding:10px 14px;font-size:12px;margin-bottom:12px;color:var(--text);">
      <strong>${icon('circle-dot')} Corto Plazo:</strong> se paga <em>mientras estudia</em> (${nCP0} meses) &nbsp;|&nbsp;
      <strong>${icon('circle-dot')} Largo Plazo:</strong> se paga <em>al graduarse</em>${grace0?' — comienza aprox. después de '+grace0+' meses (1.5× el plazo LP)':''}</div>`;
  }

  html += `<div style="overflow-x:auto;"><table class="tbl"><thead><tr>
    <th class="u-text-left">Concepto</th>
    ${list.map((e,i)=>{
      const sub = isMixto
        ? `CP ${e.nCP}m · LP ${e.nLP}m · ${(e.data.tm*100).toFixed(2)}%`
        : e.label;
      return `<th class="th--fill" style="background:${colors[i]};">Escenario ${i+1}<br>
        <span style="font-size:9px;opacity:.85;font-weight:400;">${e.label.replace('% LP','% · LP ')}</span><br>
        <span style="font-size:9px;opacity:.7;font-weight:400;">${sub}</span></th>`;
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
      ? `<span style="font-size:10px;color:var(--text-3);font-weight:400;display:block;">${f.hint}</span>` : '';

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
    html += `<tr><td style="font-weight:700;">Diferencia vs Esc.1</td><td>—</td>
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

// ── COMBINED PDF (pregrado + idiomas) ────────────────────────────────────────
function expPDFCombinado() {
  const dp   = window._dIdiomas;
  const tabId = _idiomasCtx.tabId;
  let dm = null, tipoLabel = '';
  if(tabId===1 && window._d1)  { dm=window._d1; tipoLabel='Crédito Corto Plazo'; }
  if(tabId===2 && window._d2)  { dm=window._d2; tipoLabel='Crédito Mixto'; }
  if(tabId===3 && window._d3)  { dm=window._d3; tipoLabel='Crédito Banco Aliado'; }
  if(!dp||!dm) return alert('Primero calcula ambos créditos (pregrado e idiomas) para generar el PDF combinado.');

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
  const benefsIdSnap = _benefsId.filter(b=>b.val>0);
  y = pdfBenefSection(doc,y,dp.mat,benefsIdSnap,_benefsId.reduce((s,b)=>s+(b.val||0),0),dp.mat-_benefsId.reduce((s,b)=>s+(b.val||0),0),dp.cuotaInicial);
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
    y = pdfProyeccionLP(doc, y, window._proyLP, 'Matricula');
    y = pdfProyeccionLP(doc, y, window._proyLPIdiomas, 'Idiomas');
  };
  if(dp.isMixto && dp.idCP && dp.idLP) {
    y += 2; y = pdfSectionBar(doc,'TABLA CP IDIOMAS - '+Math.round((_idiomasCtx.pctCP||40))+'% ('+dp.n+' cuotas)',y);
    y = drawTable(doc, dp.idCP.rows, y);
    if(y > 180) { doc.addPage(); y=20; }
    const nLPidPDF = dp.mesesLP || dp.idLP.nPago || 72;
    y = pdfSectionBar(doc,'PLAN LP IDIOMAS - '+Math.round((_idiomasCtx.pctLP||60))+'% ('+nLPidPDF+' cuotas - solo capital)',y,[46,125,50]);
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
    y = pdfProyeccionLP(doc, y, window._proyLPIdiomas, 'Idiomas');
  } else {
    y += 2; y = pdfSectionBar(doc,'TABLA AMORTIZACION IDIOMAS ('+dp.n+' cuotas)',y);
    y = drawTable(doc, dp.rows, y);
  }

  pdfPie(doc);
  doc.save(filename+'.pdf');
}


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
const _benefs = {1:[], 2:[], 3:[], 7:[]};  // [{id, nombre, pct, val}]

// ── Getters ──────────────────────────────────────────────────────
function getMat(tabId) {
  return Math.max(0, parseFloat(document.getElementById('mat'+tabId)?.value)||0);
}
function getTotalBeneficios(tabId) {
  return _benefs[tabId].reduce((s,b) => s + (parseFloat(b.val)||0), 0);
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
let _redistribuyendo = false;

// Reparte el remanente (matrícula − beneficios − contado) entre CP y LP,
// conservando la proporción que el asesor definió entre ambos tramos.
function redistribuirCPLP() {
  if(_redistribuyendo) return;
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

  _redistribuyendo = true;
  if(document.activeElement !== cpEl) cpEl.value = Math.round(nCP*10)/10 || '';
  if(document.activeElement !== lpEl) lpEl.value = Math.round(nLP*10)/10 || '';
  _redistribuyendo = false;
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

  _redistribuyendo = true;
  if(document.activeElement !== elOtro) elOtro.value = Math.round(pOtro*10)/10 || '';
  _redistribuyendo = false;

  const vidOtro = which === 'CP' ? 'finvalLP' : 'finvalCP';
  const velOtro = document.getElementById(vidOtro);
  if(velOtro && document.activeElement !== velOtro) velOtro.value = Math.round(mat * pOtro / 100) || '';

  recalcAll(2);
}

function autoContado2() {
  const mat   = getMat(2);
  const benef = getTotalBeneficios(2);
  const pCP   = parseFloat(document.getElementById('pctCP')?.value)||0;
  const pLP   = parseFloat(document.getElementById('pctLP')?.value)||0;
  const finCP = mat*pCP/100, finLP = mat*pLP/100;
  const cont  = Math.max(0, mat - benef - finCP - finLP);
  const cvEl  = document.getElementById('cont2-val');
  const cpEl  = document.getElementById('cont2-pct');
  if(cvEl) cvEl.value = cont > 0 ? Math.round(cont) : '';
  if(cpEl) cpEl.value = mat > 0 ? Math.round((cont/mat)*1000)/10 : '';
  recalcAll(2);
}
function syncSplitFromVal(which) {
  const fin = getFinanciado(2);
  const id  = which==='CP' ? 'pctCP' : 'pctLP';
  const vid = which==='CP' ? 'finvalCP' : 'finvalLP';
  const val = Math.max(0, parseFloat(document.getElementById(vid)?.value)||0);
  const pel = document.getElementById(id);
  if(pel && fin > 0) pel.value = Math.round((val/fin)*1000)/10 || '';
  updateSplit2(fin);
}

// ── Beneficios engine ─────────────────────────────────────────────
function addBenef(tabId) {
  const id = Date.now();
  _benefs[tabId].push({id, nombre:'', pct:0, val:0});
  renderBeneficios(tabId);
  setTimeout(()=>{
    const rows = document.querySelectorAll('#benef-items-'+tabId+' .benef-item-name');
    if(rows.length) rows[rows.length-1].focus();
  }, 40);
}
function delBenef(tabId, id) {
  _benefs[tabId] = _benefs[tabId].filter(b=>b.id!==id);
  renderBeneficios(tabId);
  recalcAll(tabId);
}
function updateBenefField(tabId, id, field, rawVal) {
  const b = _benefs[tabId].find(x=>x.id===id);
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
  container.innerHTML = _benefs[tabId].map(b => `
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

// ── Compatibility shims (called from old HTML event handlers still present) ──
function actualizarAportes(tab) { recalcAll(tab); }
function actualizarPctBar3()    { recalcAll(3); }
function recalcMatNeta(tab)     { recalcAll(tab); }
function getMatNeta(tab) {
  return Math.max(0, getMat(tab) - getTotalBeneficios(tab));
}
function totalBeneficios(tab) { return getTotalBeneficios(tab); }


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
// Init
updEq1(); updEqCP(); updEqLP();
convertirTasas();
activarSeparadorMiles();
recalcAll(1); recalcAll(2); recalcAll(3); recalc7();
calcPlazoLPAuto();
calcLPAutoId();
renderHistorial();
document.getElementById('plazo1').addEventListener('input',updEq1);
document.getElementById('plazoCP').addEventListener('input',updEqCP);
document.getElementById('plazoLP').addEventListener('input',updEqLP);


// ══════════════════════════════════════════════════════════════════
// ACTUALIZADOR DE PROGRAMAS — integrado en el simulador
// ------------------------------------------------------------------
// Los marcadores se construyen en tiempo de ejecución. Si estuvieran
// escritos literalmente aquí, este mismo archivo los contendría dos
// veces (en los datos y en el código) y el reemplazo sería ambiguo.
// ══════════════════════════════════════════════════════════════════
const _mk = n => '/*%' + '%' + n + '%' + '%*/';
const MK_PRE_S = _mk('PROGRAMAS_START'), MK_PRE_E = _mk('PROGRAMAS_END');
const MK_POS_S = _mk('POSGRADOS_START'), MK_POS_E = _mk('POSGRADOS_END');
const _reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE_PRE = new RegExp(_reEsc(MK_PRE_S) + '[\\s\\S]*?' + _reEsc(MK_PRE_E));
const RE_POS = new RegExp(_reEsc(MK_POS_S) + '[\\s\\S]*?' + _reEsc(MK_POS_E));






// ══════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════
let htmlContent = null;
let workbook = null;
let activeSheet = null;
let sheetTipo = {}; // sheetName → 'pregrado' | 'posgrado'
let parsedData = {}; // sheetName → {tipo, rows}

function resetState() {
  htmlContent = null; workbook = null; activeSheet = null;
  sheetTipo = {}; parsedData = {};
  document.getElementById('sheets-area').style.display = 'none';
  document.getElementById('resumen-cambios').style.display = 'none';
  document.getElementById('btn-gen').disabled = true;
  showMsg('msg-html','','');
  showMsg('msg-xls','','');
  showMsg('msg-gen','','');
}

// ══════════════════════════════════════════════════
// DRAG & DROP helpers
// ══════════════════════════════════════════════════
function dzOver(e, id) { e.preventDefault(); document.getElementById(id).classList.add('over'); }
function dzLeave(id)   { document.getElementById(id).classList.remove('over'); }
function dzDrop(e, type) {
  e.preventDefault();
  dzLeave(type === 'html' ? 'dz-html' : 'dz-xls');
  const file = e.dataTransfer.files[0];
  if(!file) return;
  if(type === 'html') processHTML(file);
  else processExcel(file);
}

// ══════════════════════════════════════════════════
// STEP 1 — Load HTML
// ══════════════════════════════════════════════════
function cargarHTML(e) { processHTML(e.target.files[0]); }

function processHTML(file) {
  if(!file.name.endsWith('.html')) return showMsg('msg-html','El archivo debe ser un .html','err');
  const reader = new FileReader();
  reader.onload = ev => {
    const content = ev.target.result;
    if(!content.includes(MK_PRE_S) || !content.includes(MK_POS_S)) {
      showMsg('msg-html',icon('alert-triangle') + ' Este HTML no contiene los marcadores de actualización (bloques de datos de programas). Debe ser el index.html descargado directamente de tu repositorio GitHub, no una copia editada manualmente.','err');
      return;
    }
    htmlContent = content;
    const dz = document.getElementById('dz-html');
    dz.innerHTML = `<div class="dropzone__icon">${icon('check-circle')}</div><p><strong>${escHTML(file.name)}</strong> cargado correctamente</p>`;
    dz.style.background = 'var(--success-soft)'; dz.style.borderColor = 'var(--success)';
    const sizeKB = Math.round(content.length / 1024);
    const sizeNote = sizeKB < 80 ? ' ' + icon('alert-triangle') + ' El archivo parece pequeño ('+sizeKB+'KB). Verifica que sea la versión más reciente.' : ' ('+sizeKB+'KB)';
    // Sincronización automática: leer los programas vigentes del propio HTML
    const sync = extraerProgramasDelHTML(content);
    let syncNote = '';
    if(sync) {
      _PRE_VIGENTE = sync.pregrado;
      _POS_VIGENTE = sync.posgrado;
      syncNote = ` · ${icon('refresh')} Sincronizado: ${sync.pregrado.length} pregrado, ${sync.posgrado.length} posgrado`;
      actualizarBadgeSync();
    }
    showMsg('msg-html',icon('check-circle') + ' Simulador cargado. Marcadores detectados correctamente.'+sizeNote+syncNote,'ok');
    checkReady();
  };
  reader.readAsText(file, 'UTF-8');
}

// ══════════════════════════════════════════════════
// STEP 2 — Load Excel
// ══════════════════════════════════════════════════
function cargarExcel(e) { processExcel(e.target.files[0]); }

function processExcel(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      workbook = XLSX.read(ev.target.result, {type:'array'});
      const dz = document.getElementById('dz-xls');
      dz.innerHTML = `<div class="dropzone__icon">${icon('check-circle')}</div><p><strong>${escHTML(file.name)}</strong> — ${workbook.SheetNames.length} hoja(s) encontrada(s)</p>`;
      dz.style.background = 'var(--success-soft)'; dz.style.borderColor = 'var(--success)';
      showMsg('msg-xls','Excel cargado. Configura cada hoja abajo.','ok');
      renderSheetTabs();
      document.getElementById('sheets-area').style.display = 'block';
    } catch(e) {
      showMsg('msg-xls','Error leyendo el Excel: ' + e.message,'err');
    }
  };
  reader.readAsArrayBuffer(file);
}

function renderSheetTabs() {
  const container = document.getElementById('sheet-tabs');
  container.innerHTML = '';
  workbook.SheetNames.forEach((name, i) => {
    const btn = document.createElement('button');
    btn.className = 'sheet-tab' + (i===0?' active':'');
    btn.textContent = name;
    btn.onclick = () => selectSheet(name);
    container.appendChild(btn);
    if(!sheetTipo[name]) sheetTipo[name] = 'pregrado';
  });
  selectSheet(workbook.SheetNames[0]);
}

function selectSheet(name) {
  activeSheet = name;
  document.querySelectorAll('.sheet-tab').forEach(b => _pressed(b, b.textContent === name));
  const tipo = sheetTipo[name] || 'pregrado';
  _pressed(document.getElementById('tipo-pre'), tipo==='pregrado');
  _pressed(document.getElementById('tipo-pos'), tipo==='posgrado');
  renderMapper(name);
}

function setTipo(tipo) {
  sheetTipo[activeSheet] = tipo;
  _pressed(document.getElementById('tipo-pre'), tipo==='pregrado');
  _pressed(document.getElementById('tipo-pos'), tipo==='posgrado');
  renderMapper(activeSheet);
}

function renderMapper(sheetName) {
  const ws = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  if(rawData.length < 2) { showMsg('parsed-status','La hoja está vacía','err'); return; }

  const headers = rawData[0].map(String);
  const tipo = sheetTipo[sheetName] || 'pregrado';

  const fields = tipo === 'pregrado'
    ? [{key:'nombre',label:'Programa'},{key:'valor',label:'Valor Matrícula'},{key:'idiomas',label:'Valor Idiomas'},{key:'semestres',label:'Semestres (duración del programa)'}]
    : [{key:'nombre',label:'Programa'},{key:'subnivel',label:'Subnivel (Doctorado/Maestría/Especialización)'},{key:'valor',label:'Valor Matrícula'}];

  const mapperArea = document.getElementById('mapper-cols');
  mapperArea.innerHTML = '';

  // Auto-detect columns
  const autoMap = {};
  headers.forEach((h,i) => {
    const hl = h.toLowerCase();
    if(hl.includes('programa') || hl.includes('nombre')) autoMap.nombre = i;
    if(hl.includes('idioma')) autoMap.idiomas = i;
    if(hl.includes('subnivel') || hl.includes('nivel')) autoMap.subnivel = i;
    if((hl.includes('valor') || hl.includes('precio') || hl.includes('matricula')) && !hl.includes('idioma')) autoMap.valor = i;
    if(hl.includes('semestre') || hl.includes('duracion') || hl.includes('duración')) autoMap.semestres = i;
  });

  fields.forEach(f => {
    const div = document.createElement('div');
    const grid = document.createElement('div');
    grid.className = 'mapper-grid';

    const labelWrap = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = f.label;
    labelWrap.appendChild(label);

    const arrow = document.createElement('div');
    arrow.className = 'mapper-arrow';
    arrow.textContent = '→';

    const selectWrap = document.createElement('div');
    const select = document.createElement('select');
    select.id = 'map-' + f.key;
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '— Seleccionar columna —';
    select.appendChild(empty);
    headers.forEach((h, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = h || '(Columna ' + (i + 1) + ')';
      if(autoMap[f.key] === i) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', () => previewSheet(sheetName));
    selectWrap.appendChild(select);

    grid.append(labelWrap, arrow, selectWrap);
    div.appendChild(grid);
    mapperArea.appendChild(div);
  });

  previewSheet(sheetName);
}

function previewSheet(sheetName) {
  const ws = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  const tipo = sheetTipo[sheetName] || 'pregrado';
  const fields = tipo === 'pregrado' ? ['nombre','valor','idiomas','semestres'] : ['nombre','subnivel','valor'];

  const mapping = {};
  let allMapped = true;
  fields.forEach(f => {
    const sel = document.getElementById('map-'+f);
    if(sel && sel.value !== '') mapping[f] = parseInt(sel.value);
    else { if(f !== 'idiomas' && f !== 'semestres') allMapped = false; }
  });

  if(!allMapped) { document.getElementById('preview-area').innerHTML = ''; return; }

  // Parse rows (skip header)
  const rows = [];
  const errors = [];
  rawData.slice(1).forEach((row, ri) => {
    if(!row[mapping.nombre]) return;
    const nombre = String(row[mapping.nombre]).trim();
    const valorRaw = row[mapping.valor];
    const valor = typeof valorRaw === 'number' ? valorRaw : parseFloat(String(valorRaw).replace(/[^0-9.]/g,''));

    if(!nombre) return;
    if(isNaN(valor) || valor <= 0) { errors.push(`Fila ${ri+2}: valor inválido "${valorRaw}"`); return; }

    if(tipo === 'pregrado') {
      const idiomasRaw = mapping.idiomas !== undefined ? row[mapping.idiomas] : 0;
      const idiomas = typeof idiomasRaw === 'number' ? idiomasRaw : parseFloat(String(idiomasRaw||'0').replace(/[^0-9.]/g,'')) || 0;
      const semestresRaw = mapping.semestres !== undefined ? row[mapping.semestres] : 8;
      const semestres = typeof semestresRaw === 'number' ? Math.round(semestresRaw) : parseInt(String(semestresRaw||'8').replace(/[^0-9]/g,'')) || 8;
      rows.push([nombre, valor, idiomas, semestres]);
    } else {
      const subnivel = String(row[mapping.subnivel]||'').trim();
      const validos = ['Doctorado','Maestría','Especialización'];
      if(!validos.includes(subnivel)) { errors.push(`Fila ${ri+2}: subnivel "${subnivel}" inválido`); return; }
      rows.push([nombre, subnivel, valor]);
    }
  });

  parsedData[sheetName] = {tipo, rows};

  // Render preview
  const cop = v => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(v);
  const headers_preview = tipo === 'pregrado'
    ? ['Programa','Valor Matrícula','Valor Idiomas','Semestres']
    : ['Programa','Subnivel','Valor Matrícula'];

  let html = `<div class="preview-wrap"><table class="tbl"><thead><tr>${headers_preview.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>`;
  rows.slice(0,10).forEach(r => {
    if(tipo === 'pregrado') html += `<tr><td>${escHTML(r[0])}</td><td>${cop(r[1])}</td><td>${r[2]>0?cop(r[2]):'No aplica'}</td><td>${r[3]||8} sem.</td></tr>`;
    else html += `<tr><td>${escHTML(r[0])}</td><td>${escHTML(r[1])}</td><td>${cop(r[2])}</td></tr>`;
  });
  if(rows.length > 10) html += `<tr><td colspan="3" style="text-align:center;color:var(--text-3);font-style:italic;">... y ${rows.length-10} más</td></tr>`;
  html += `</tbody></table></div>`;
  html += `<p style="margin-top:8px;font-size:13px;color:var(--text-3);">Vista previa de primeras 10 filas <span class="count-badge">${rows.length} programas</span></p>`;

  document.getElementById('preview-area').innerHTML = html;

  if(errors.length > 0) {
    showMsg('parsed-status', icon('alert-triangle') + ' ' + errors.slice(0,3).join(' | ') + (errors.length>3?` (+${errors.length-3} más)`:''), 'err');
  } else {
    showMsg('parsed-status', `${icon('check-circle')} ${rows.length} programas listos para importar`, 'ok');
  }

  checkReady();
}

// ══════════════════════════════════════════════════
// Check if ready to generate
// ══════════════════════════════════════════════════
function checkReady() {
  const bp = document.getElementById('btn-publicar');
  const hasPre = Object.values(parsedData).some(d=>d.tipo==='pregrado' && d.rows.length > 0);
  const hasPos = Object.values(parsedData).some(d=>d.tipo==='posgrado' && d.rows.length > 0);
  const ready = htmlContent && (hasPre || hasPos);
  document.getElementById('btn-gen').disabled = !ready;
  if(bp) bp.disabled = !ready;

  if(hasPre || hasPos) {
    const preRows = Object.values(parsedData).find(d=>d.tipo==='pregrado');
    const posRows = Object.values(parsedData).find(d=>d.tipo==='posgrado');
    document.getElementById('cnt-pre').textContent = preRows ? preRows.rows.length : '—';
    document.getElementById('cnt-pos').textContent = posRows ? posRows.rows.length : '—';
    document.getElementById('resumen-cambios').style.display = 'block';
  }
}

// ══════════════════════════════════════════════════
// STEP 3 — Generate new index.html
// ══════════════════════════════════════════════════
// ── Construye el HTML actualizado (sin descargar ni publicar) ───────────────
function construirHTMLActualizado() {
  if(!htmlContent) return {error:'Primero carga el index.html'};

  let newHtml = htmlContent;
  let cambios = [];

  const preData = Object.values(parsedData).find(d=>d.tipo==='pregrado');
  const posData = Object.values(parsedData).find(d=>d.tipo==='posgrado');

  if(preData && preData.rows.length > 0) {
    const normalized = preData.rows.map(([n,v,i,s]) => [String(n), Number(v), Number(i)||0, Number(s)||8]);
    const jsArr = 'const PROGRAMAS = ' + JSON.stringify(normalized, null, 2) + ';';
    if(!RE_PRE.test(newHtml)) return {error:'No se encontró el marcador de PROGRAMAS en el HTML'};
    newHtml = newHtml.replace(RE_PRE, MK_PRE_S + jsArr + MK_PRE_E);
    cambios.push(`${preData.rows.length} programas de pregrado`);
  }

  if(posData && posData.rows.length > 0) {
    const normalized = posData.rows.map(([n,s,v]) => [String(n), String(s), Number(v)]);
    const jsArr = 'const POSGRADOS = ' + JSON.stringify(normalized, null, 2) + ';';
    if(!RE_POS.test(newHtml)) return {error:'No se encontró el marcador de POSGRADOS en el HTML'};
    newHtml = newHtml.replace(RE_POS, MK_POS_S + jsArr + MK_POS_E);
    cambios.push(`${posData.rows.length} programas de posgrado`);
  }

  if(cambios.length === 0) return {error:'No hay datos para actualizar'};
  return {html:newHtml, cambios};
}

// ── Descarga manual (respaldo) ──────────────────────────────────────────────
function generarHTML() {
  const r = construirHTMLActualizado();
  if(r.error) return showMsg('msg-gen', r.error, 'err');

  const blob = new Blob([r.html], {type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'index.html'; a.click();
  URL.revokeObjectURL(url);

  const okMsg = document.getElementById('msg-gen-ok');
  okMsg.textContent = ' Descargado con ' + r.cambios.join(' y ') + '. Súbelo a GitHub para actualizar el simulador.';
  okMsg.style.display = 'block';
  showMsg('msg-gen','','');
}

// ══════════════════════════════════════════════════════════════════
// PUBLICACIÓN
// Por seguridad, este cliente estático no solicita ni maneja tokens
// de GitHub. La actualización se genera como index.html y se publica
// mediante un canal autenticado externo.
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════
// Download templates
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════════════
// SINCRONIZACIÓN AUTOMÁTICA DE PROGRAMAS
// Lee los programas vigentes directamente del index.html cargado,
// para que la plantilla descargable siempre refleje lo publicado.
// ══════════════════════════════════════════════════
let _PRE_VIGENTE = null;   // se llena al cargar el HTML
let _POS_VIGENTE = null;

function extraerProgramasDelHTML(html) {
  try {
    // Pregrado: ["Nombre", valor, idiomas, semestres]
    const iP1 = html.indexOf(MK_PRE_S);
    const iP2 = html.indexOf(MK_PRE_E);
    if(iP1 < 0 || iP2 < 0) return null;
    const blkPre = html.slice(iP1, iP2);
    const pregrado = [];
    const rePre = /\["((?:[^"\\]|\\.)*)"\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+)\s*)?\]/g;
    let m;
    while((m = rePre.exec(blkPre)) !== null) {
      pregrado.push([m[1].replace(/\\"/g,'"'), +m[2], +m[3], m[4] ? +m[4] : 8]);
    }

    // Posgrado: ["Nombre", "Subnivel", valor]
    const iG1 = html.indexOf(MK_POS_S);
    const iG2 = html.indexOf(MK_POS_E);
    const posgrado = [];
    if(iG1 >= 0 && iG2 >= 0) {
      const blkPos = html.slice(iG1, iG2);
      const rePos = /\["((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*(\d+)\s*\]/g;
      let n;
      while((n = rePos.exec(blkPos)) !== null) {
        posgrado.push([n[1].replace(/\\"/g,'"'), n[2].replace(/\\"/g,'"'), +n[3]]);
      }
    }
    if(pregrado.length === 0 && posgrado.length === 0) return null;
    return {pregrado, posgrado};
  } catch(e) { return null; }
}

function actualizarBadgeSync() {
  const el = document.getElementById('sync-badge');
  if(!el) return;
  if(_PRE_VIGENTE || _POS_VIGENTE) {
    el.hidden = false;
    el.innerHTML = `<span class="note__icon">${icon('refresh')}</span><div><strong>Plantilla sincronizada</strong> con el simulador cargado —
      ${(_PRE_VIGENTE||[]).length} programas de pregrado y ${(_POS_VIGENTE||[]).length} de posgrado.</div>`;
  } else {
    el.hidden = true;
  }
}

// Programas actuales pre-cargados (extraidos del simulador vigente)
const _PRE_ACTUAL = [
    ["Administración de Empresas",16105200,0,10],
    ["Arquitectura",16618800,1635500,9],
    ["Ciencia de Datos",13574400,1635500,8],
    ["Ciencia Política y Gobierno",13170800,1635500,8],
    ["Comunicación Social y Period.",11976300,1635500,9],
    ["Contaduría Pública",7945700,0,8],
    ["Derecho",13422900,1635500,10],
    ["Diseño Gráfico",13342300,1635500,8],
    ["Diseño Industrial",16461100,1635500,8],
    ["Economía",12553400,1635500,8],
    ["Enfermería",7601500,0,8],
    ["Filosofía y Humanidades",6917800,0,8],
    ["Geología",13331000,1635500,9],
    ["Ingeniería Biomédica",15471900,1635500,8],
    ["Ingeniería Civil",13574400,1635500,10],
    ["Ingeniería Eléctrica",13574400,1635500,10],
    ["Ingeniería Electrónica",15471900,1635500,10],
    ["Ingeniería Industrial",16641300,1635500,10],
    ["Ingeniería Mecánica",13574400,1635500,10],
    ["Ingeniería Sistemas Y Computación",13574400,1635500,10],
    ["Lenguas Modernas y Cultura",12673500,1635500,8],
    ["Licenciatura en Pedagogía Infantil",8703000,1635500,8],
    ["Matemáticas",8153900,1635500,8],
    ["Medicina",28431000,1995700,12],
    ["Música",13466700,1635500,8],
    ["Negocios Internacionales",17922800,1635500,10],
    ["Odontología",17877500,1995700,10],
    ["Psicología",11976300,1635500,10],
    ["Relaciones Internacionales",12673500,1635500,10]
];
const _POS_ACTUAL = [
    ["Doctorado En Administración","Doctorado",30388900],
    ["Doctorado En Ciencias Biomédicas","Doctorado",20841700],
    ["Doctorado En Ciencias Del Mar","Doctorado",17509050],
    ["Doctorado En Ciencias Naturales","Doctorado",18483900],
    ["Doctorado En Ciencias Sociales","Doctorado",22390300],
    ["Doctorado En Comunicación","Doctorado",21319300],
    ["Doctorado En Derecho","Doctorado",22347800],
    ["Doctorado En Economía","Doctorado",22390300],
    ["Doctorado En Educación","Doctorado",18623500],
    ["Doctorado En Ingeniería Civil","Doctorado",21914400],
    ["Doctorado En Ingeniería De Sistemas Y Computación","Doctorado",21914400],
    ["Doctorado En Ingeniería Eléctrica Y Electrónica","Doctorado",21914400],
    ["Doctorado En Ingeniería Industrial","Doctorado",21914400],
    ["Doctorado En Ingeniería Mecánica","Doctorado",21914400],
    ["Doctorado En Psicología","Doctorado",21319300],
    ["CAR - Especialización En Gerencia De La Calidad Y Auditoría En Salud","Especialización",16543700],
    ["CAR - Especialización En Seguridad Y Salud En El Trabajo","Especialización",16543700],
    ["Especialización En Análisis Y Diseño De Estructuras","Especialización",20495600],
    ["Especialización En Arqueología","Especialización",15032100],
    ["Especialización En Comunicación Digital","Especialización",15032100],
    ["Especialización En Derecho Administrativo","Especialización",14739100],
    ["Especialización En Derecho Ambiental, Territorial Y Urbanístico","Especialización",14739100],
    ["Especialización En Derecho Civil Y De Familia","Especialización",14739100],
    ["Especialización En Derecho Comercial","Especialización",16440000],
    ["Especialización En Derecho Constitucional","Especialización",14739100],
    ["Especialización En Derecho Contractual","Especialización",14739100],
    ["Especialización En Derecho De Sociedades","Especialización",14739100],
    ["Especialización En Derecho Laboral","Especialización",14739100],
    ["Especialización En Derecho Penal","Especialización",16567700],
    ["Especialización En Derecho Público","Especialización",14739100],
    ["Especialización En Derechos Humanos","Especialización",14739100],
    ["Especialización En Dermatología","Especialización",52550300],
    ["Especialización En Desarrollo Familiar","Especialización",13454400],
    ["Especialización En Desarrollo Organizacional Y Procesos Humanos","Especialización",15971200],
    ["Especialización En Desarrollo Social","Especialización",16902400],
    ["Especialización En Dirección De Operaciones","Especialización",17421300],
    ["Especialización En Diseño Y Evaluación De Proyectos","Especialización",20495600],
    ["Especialización En Enfermería Del Cuidado Crítico Adulto","Especialización",9640900],
    ["Especialización En Enfermería Del Cuidado Neonatal","Especialización",9640900],
    ["Especialización En Finanzas","Especialización",25324000],
    ["Especialización En Gerencia De Empresas Comerciales","Especialización",25324000],
    ["Especialización En Gerencia De La Calidad Y Auditoría En Salud","Especialización",18227700],
    ["Especialización En Gerencia De La Calidad Y Auditoría En Salud Virtual","Especialización",14582100],
    ["Especialización En Gerencia De La Comunicación Organizacional","Especialización",13800400],
    ["Especialización En Gerencia De Proyectos","Especialización",20495600],
    ["Especialización En Gerencia De Proyectos De Construcción","Especialización",20495600],
    ["Especialización En Gerencia De Servicios De Salud","Especialización",18944500],
    ["Especialización En Gerencia De Tecnologías De La Información","Especialización",20495600],
    ["Especialización En Gerencia Del Talento Humano","Especialización",21915000],
    ["Especialización En Gerencia Financiera De Servicios De Salud","Especialización",18909700],
    ["Especialización En Gerencia Pública","Especialización",21915000],
    ["Especialización En Gestión De Sistemas Eléctricos De Potencia","Especialización",20495600],
    ["Especialización En Gobierno Y Políticas Públicas","Especialización",14739100],
    ["Especialización En Ingeniería De Procesos Industriales","Especialización",20495600],
    ["Especialización En Ingeniería De Sistemas Hídricos Urbanos","Especialización",18638700],
    ["Especialización En Ingeniería Del Software","Especialización",20495600],
    ["Especialización En La Enseñanza Del Inglés","Especialización",12854100],
    ["Especialización En Logística De Transporte Internacional De Mercancia","Especialización",23557300],
    ["Especialización En Logística Empresarial","Especialización",18638700],
    ["Especialización En Medicina Familiar","Especialización",39362300],
    ["Especialización En Medicina Interna","Especialización",52550300],
    ["Especialización En Mercadeo","Especialización",25324000],
    ["Especialización En Negociación Y Manejo De Conflictos","Especialización",14945800],
    ["Especialización En Neonatología","Especialización",60377100],
    ["Especialización En Oftalmología","Especialización",54503900],
    ["Especialización En Pavimentos Y Geotecnia Vial","Especialización",20495600],
    ["Especialización En Pediatría","Especialización",52550300],
    ["Especialización En Psicología Forense","Especialización",14906800],
    ["Especialización En Psiquiatría","Especialización",52550300],
    ["Especialización En Radiología E Imágenes Diagnósticas","Especialización",54503900],
    ["Especialización En Responsabilidad Civil Y Seguros","Especialización",14739100],
    ["Especialización En Seguridad De La Información","Especialización",20495600],
    ["Especialización En Seguridad De La Información","Especialización",14346600],
    ["Especialización En Seguridad Y Salud En El Trabajo","Especialización",16543700],
    ["Especialización En Seguridad Y Salud En El Trabajo Virtual","Especialización",14582100],
    ["Especialización En Transformación Digital","Especialización",20495600],
    ["Especialización En Tributación","Especialización",14739100],
    ["Especialización En Valoración De Bienes","Especialización",14070600],
    ["RIO - Especialización En Gerencia De La Calidad Y Auditoría En Salud","Especialización",16543700],
    ["RIO - Especialización En Seguridad Y Salud En El Trabajo","Especialización",16543700],
    ["SM - Especialización En Derecho Público","Especialización",12528100],
    ["SM - Especialización En Dirección Estratégica Empresarial","Especialización",13191200],
    ["SM - Especialización En Finanzas","Especialización",18993000],
    ["SM - Especialización En Gerencia De La Calidad Y Auditoría En Salud","Especialización",13539100],
    ["SM - Especialización En Gerencia De Proyectos","Especialización",15371800],
    ["SM - Especialización En Seguridad Y Salud En El Trabajo","Especialización",12407700],
    ["SM - Especialización En Tributación","Especialización",12528100],
    ["Maestría En Administración De Empresas","Maestría",25324000],
    ["Maestría En Análisis Y Gestión De Sistemas Eléctricos","Maestría",21034700],
    ["Maestría En Analítica De Datos","Maestría",21034700],
    ["Maestría En Ciencia Política Y Gobierno","Maestría",17770000],
    ["Maestría En Ciencias Básicas Biomédicas","Maestría",19241600],
    ["Maestría En Ciencias De La Tierra","Maestría",14068300],
    ["Maestría En Ciencias Naturales","Maestría",12658900],
    ["Maestría En Comunicación","Maestría",16307400],
    ["Maestría En Cooperación Internacional Y Gestión De Proyectos","Maestría",15694100],
    ["Maestría En Derecho","Maestría",17770000],
    ["Maestría En Derecho Ambiental Y Urbano-Territorial","Maestría",17770000],
    ["Maestría En Derecho Civil Y De Familia","Maestría",14739100],
    ["Maestría En Derecho Del Comercio","Maestría",17770000],
    ["Maestría En Derecho Del Trabajo Y De La Seguridad Social","Maestría",17770000],
    ["Maestría En Derecho Público","Maestría",17770000],
    ["Maestría En Desarrollo Organizacional Y Procesos Humanos","Maestría",15694100],
    ["Maestría En Desarrollo Social","Maestría",16902400],
    ["Maestría En Diseño E Innovación Md+I","Maestría",16089700],
    ["Maestría En Economia","Maestría",15743100],
    ["Maestría En Educación","Maestría",12658900],
    ["Maestría En Educación Mediada Por Tic","Maestría",11393000],
    ["Maestría En Enfermería","Maestría",11490200],
    ["Maestría En Epidemiología","Maestría",19241600],
    ["Maestría En Epidemiología Clínica","Maestría",20131400],
    ["Maestría En Estadística Aplicada","Maestría",12658900],
    ["Maestría En Filosofía","Maestría",11173700],
    ["Maestría En Finanzas","Maestría",25324000],
    ["Maestría En Fisica Aplicada","Maestría",12658900],
    ["Maestría En Gestión De Riesgos Naturales, Prevención Y Atención De Desastres","Maestría",21034700],
    ["Maestría En Gobierno De Tecnología Informática","Maestría",21034700],
    ["Maestría En Historia","Maestría",12883800],
    ["Maestría En Ingeniería Administrativa","Maestría",21034700],
    ["Maestría En Ingeniería Ambiental","Maestría",21034700],
    ["Maestría En Ingeniería Biomédica","Maestría",21034700],
    ["Maestría En Ingeniería Civil","Maestría",21034700],
    ["Maestría En Ingeniería De Sistemas Y Computación","Maestría",21034700],
    ["Maestría En Ingeniería Eléctrica","Maestría",21034700],
    ["Maestría En Ingeniería Electrónica","Maestría",21034700],
    ["Maestría En Ingeniería Industrial","Maestría",21034700],
    ["Maestría En Ingeniería Mecánica","Maestría",21034700],
    ["Maestría En La Enseñanza Del Inglés","Maestría",12854100],
    ["Maestría En Lenguaje Y Sociedad","Maestría",12854100],
    ["Maestría En Literatura Y Escrituras Creativas","Maestría",12044800],
    ["Maestría En Matemáticas","Maestría",12658900],
    ["Maestría En Mercadeo","Maestría",25324000],
    ["Maestría En Negociación Y Manejo De Conflictos","Maestría",17770000],
    ["Maestría En Negocios Internacionales","Maestría",25324000],
    ["Maestría En Pedagogía Social E Intervención Educativa En Contextos Sociales","Maestría",11393000],
    ["Maestría En Periodismo","Maestría",15694100],
    ["Maestría En Psicología Énfasis Investigativo","Maestría",16640700],
    ["Maestría En Relaciones Internacionales","Maestría",15694100],
    ["Maestría En Relaciones Públicas","Maestría",15694100],
    ["Maestría En Salud Pública","Maestría",19241600],
    ["Maestría En Sistemas Integrados De Gestión","Maestría",21034700],
    ["Maestría En Trastornos Cognoscitivos Y Del Aprendizaje","Maestría",15694100],
    ["Maestría En Tributación Y Aduanas","Maestría",17770000],
    ["Maestría En Urbanismo Y Desarrollo Territorial","Maestría",16089700]
];

function descargarPlantilla() {
  const wb = XLSX.utils.book_new();

  // Usa los programas del simulador cargado si están disponibles (auto-sync),
  // de lo contrario cae al respaldo interno.
  const fuentePre = (_PRE_VIGENTE && _PRE_VIGENTE.length) ? _PRE_VIGENTE : _PRE_ACTUAL;
  const fuentePos = (_POS_VIGENTE && _POS_VIGENTE.length) ? _POS_VIGENTE : _POS_ACTUAL;

  // Hoja 1 — Pregrado (4 columnas)
  const wsPre = XLSX.utils.aoa_to_sheet([
    ['Programa','Valor Pregrado','Valor Idiomas','Semestres'],
    ...fuentePre
  ]);
  wsPre['!cols'] = [{wch:42},{wch:16},{wch:16},{wch:12}];
  XLSX.utils.book_append_sheet(wb, wsPre, 'Pregrado');

  // Hoja 2 — Posgrado (3 columnas) con todos los programas actuales
  const wsPos = XLSX.utils.aoa_to_sheet([
    ['Programa','Subnivel','Valor'],
    ...fuentePos
  ]);
  wsPos['!cols'] = [{wch:60},{wch:18},{wch:16}];
  XLSX.utils.book_append_sheet(wb, wsPos, 'Posgrado');

  XLSX.writeFile(wb, 'plantilla-programas.xlsx');
}

// ══════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════
function showMsg(id, msg, tipo) {
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = msg;
  el.className = 'msg' + (tipo ? ' '+tipo : '');
  el.style.display = msg ? 'block' : 'none';
}

// ── Auto-lectura: el simulador lee su propio código fuente ──────────────────
// En GitHub Pages (https) funciona y evita tener que subir el index.html.
// Con file:// el navegador lo bloquea por CORS y se usa la carga manual.
async function autoLeerSimulador() {
  const dz    = document.getElementById('dz-html');
  const stat  = document.getElementById('self-read-status');
  try {
    const resp = await fetch(window.location.href, {cache:'no-store'});
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    const txt = await resp.text();
    if(!txt.includes(MK_PRE_S) || !txt.includes(MK_POS_S)) throw new Error('sin marcadores');
    htmlContent = txt;
    const sync = extraerProgramasDelHTML(txt);
    if(sync) { _PRE_VIGENTE = sync.pregrado; _POS_VIGENTE = sync.posgrado; actualizarBadgeSync(); }
    if(dz) dz.hidden = true;
    if(stat) {
      stat.hidden = false;
      stat.className = 'note note--success u-mb-3';
      stat.innerHTML = `<span class="note__icon">${icon('check-circle')}</span><div><strong>Simulador leído automáticamente</strong> — ${(sync?sync.pregrado.length:0)} programas de pregrado y ${(sync?sync.posgrado.length:0)} de posgrado detectados. No necesitas subir el index.html.</div>`;
    }
    checkReady();
    return true;
  } catch(e) {
    if(dz) dz.hidden = false;
    if(stat) {
      stat.hidden = false;
      stat.className = 'note note--warning u-mb-3';
      stat.innerHTML = `<span class="note__icon">${icon('info')}</span><div>Auto-lectura no disponible (abriste el archivo localmente). Sube el <strong>index.html</strong> manualmente abajo.</div>`;
    }
    return false;
  }
}
