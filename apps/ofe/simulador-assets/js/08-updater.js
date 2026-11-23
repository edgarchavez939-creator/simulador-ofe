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

// Serializa datos de forma segura dentro de <script type="application/json">.
// Se escapan caracteres que podrían cerrar el bloque o introducir markup.
function safeEmbeddedJSON(value) {
  return JSON.stringify(value, null, 2)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}






// ══════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════
// Compatibility module: create legacy review state only when explicitly loaded.
const updaterState = SimuladorOFE.state.updater || (SimuladorOFE.state.updater = {
  htmlContent:null,workbook:null,activeSheet:null,sheetType:{},parsedData:{},currentUndergrad:null,currentPostgrad:null
});

function setDropzoneBusy(id, busy) {
  const el = document.getElementById(id);
  if(!el) return;
  if(busy) el.setAttribute('aria-busy','true');
  else el.removeAttribute('aria-busy');
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
  updaterState.htmlContent = null;
  updaterState.currentUndergrad = null;
  updaterState.currentPostgrad = null;
  checkReady();
  if(!file || !file.name?.toLowerCase().endsWith('.html')) return showMsg('msg-html','El archivo debe ser un .html','err');
  setDropzoneBusy('dz-html', true);
  showMsg('msg-html','Leyendo el archivo HTML…','info');
  const reader = new FileReader();
  reader.onload = ev => {
    const content = ev.target.result;
    if(!content.includes(MK_PRE_S) || !content.includes(MK_POS_S)) {
      showMsg('msg-html','Este HTML no contiene los marcadores de actualización (bloques de datos de programas). Debe ser el index.html descargado directamente de tu repositorio GitHub, no una copia editada manualmente.','err');
      return;
    }
    const sync = extraerProgramasDelHTML(content);
    if(!sync) return showMsg('msg-html','Los bloques del catálogo contienen datos inválidos. No se usará este archivo.','err');
    updaterState.htmlContent = content;
    const dz = document.getElementById('dz-html');
    dz.innerHTML = `<div class="dropzone__icon">${icon('check-circle')}</div><p><strong>${escHTML(file.name)}</strong> cargado correctamente</p>`;
    dz.style.background = 'var(--success-soft)'; dz.style.borderColor = 'var(--success)';
    const sizeKB = Math.round(content.length / 1024);
    const sizeNote = sizeKB < 80 ? ' ' + icon('alert-triangle') + ' El archivo parece pequeño ('+sizeKB+'KB). Verifica que sea la versión más reciente.' : ' ('+sizeKB+'KB)';
    // Sincronización automática: leer los programas vigentes del propio HTML
    let syncNote = '';
    if(sync) {
      updaterState.currentUndergrad = sync.pregrado;
      updaterState.currentPostgrad = sync.posgrado;
      syncNote = ` · ${icon('refresh')} Sincronizado: ${sync.pregrado.length} pregrado, ${sync.posgrado.length} posgrado`;
      actualizarBadgeSync();
    }
    showMsg('msg-html','Simulador cargado. Marcadores detectados correctamente.'+sizeNote+syncNote,'ok');
    checkReady();
  };
  reader.onerror = () => showMsg('msg-html','No fue posible leer el archivo HTML.','err');
  reader.onloadend = () => setDropzoneBusy('dz-html', false);
  reader.readAsText(file, 'UTF-8');
}

// ══════════════════════════════════════════════════
// STEP 2 — Load Excel
// ══════════════════════════════════════════════════
function cargarExcel(e) { processExcel(e.target.files[0]); }

function processExcel(file) {
  if(!file) return;
  updaterState.parsedData = {};
  updaterState.workbook = null;
  checkReady();
  setDropzoneBusy('dz-xls', true);
  showMsg('msg-xls','Leyendo el archivo Excel…','info');
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      updaterState.workbook = XLSX.read(ev.target.result, {type:'array'});
      updaterState.parsedData = Object.fromEntries(updaterState.workbook.SheetNames.map(name=>[name,{valid:false,rows:[],errors:['Hoja pendiente de revisión.']} ]));
      const dz = document.getElementById('dz-xls');
      dz.innerHTML = `<div class="dropzone__icon">${icon('check-circle')}</div><p><strong>${escHTML(file.name)}</strong> — ${updaterState.workbook.SheetNames.length} hoja(s) encontrada(s)</p>`;
      dz.style.background = 'var(--success-soft)'; dz.style.borderColor = 'var(--success)';
      showMsg('msg-xls','Excel cargado. Configura cada hoja abajo.','ok');
      renderSheetTabs();
      document.getElementById('sheets-area').style.display = 'block';
    } catch(e) {
      showMsg('msg-xls','Error leyendo el Excel: ' + e.message,'err');
    }
  };
  reader.onerror = () => showMsg('msg-xls','No fue posible leer el archivo Excel.','err');
  reader.onloadend = () => setDropzoneBusy('dz-xls', false);
  reader.readAsArrayBuffer(file);
}

function renderSheetTabs() {
  const container = document.getElementById('sheet-tabs');
  container.innerHTML = '';
  updaterState.workbook.SheetNames.forEach((name, i) => {
    const btn = document.createElement('button');
    btn.className = 'sheet-tab' + (i===0?' active':'');
    btn.textContent = name;
    btn.addEventListener('click', () => selectSheet(name));
    container.appendChild(btn);
    if(!updaterState.sheetType[name]) updaterState.sheetType[name] = 'pregrado';
  });
  selectSheet(updaterState.workbook.SheetNames[0]);
}

function selectSheet(name) {
  updaterState.activeSheet = name;
  document.querySelectorAll('.sheet-tab').forEach(b => _pressed(b, b.textContent === name));
  const tipo = updaterState.sheetType[name] || 'pregrado';
  _pressed(document.getElementById('tipo-pre'), tipo==='pregrado');
  _pressed(document.getElementById('tipo-pos'), tipo==='posgrado');
  renderMapper(name);
}

function setTipo(tipo) {
  updaterState.sheetType[updaterState.activeSheet] = tipo;
  _pressed(document.getElementById('tipo-pre'), tipo==='pregrado');
  _pressed(document.getElementById('tipo-pos'), tipo==='posgrado');
  renderMapper(updaterState.activeSheet);
}

function renderMapper(sheetName) {
  const ws = updaterState.workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  if(rawData.length < 2) { updaterState.parsedData[sheetName] = {valid:false, rows:[]}; checkReady(); showMsg('parsed-status','La hoja está vacía','err'); return; }

  const headers = rawData[0].map(String);
  const tipo = updaterState.sheetType[sheetName] || 'pregrado';

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
  const ws = updaterState.workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  const tipo = updaterState.sheetType[sheetName] || 'pregrado';
  const fields = tipo === 'pregrado' ? ['nombre','valor','idiomas','semestres'] : ['nombre','subnivel','valor'];

  const mapping = {};
  let allMapped = true;
  fields.forEach(f => {
    const sel = document.getElementById('map-'+f);
    if(sel && sel.value !== '') mapping[f] = parseInt(sel.value);
    else { if(f !== 'idiomas' && f !== 'semestres') allMapped = false; }
  });

  const result = ProgramCatalogImport.parse(rawData, tipo, mapping);
  updaterState.parsedData[sheetName] = result;
  const {rows, errors} = result;
  if(!allMapped) {
    document.getElementById('preview-area').innerHTML = '';
    showMsg('parsed-status', errors.join(' | '), 'err');
    checkReady(); return;
  }

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
  if(rows.length > 10) html += `<tr><td class="u-text-center u-muted-italic" colspan="3">... y ${rows.length-10} más</td></tr>`;
  html += `</tbody></table></div>`;
  html += `<p class="text-muted-md u-mt-8">Vista previa de primeras 10 filas <span class="count-badge">${rows.length} programas</span></p>`;

  document.getElementById('preview-area').innerHTML = html;

  if(errors.length > 0) {
    showMsg('parsed-status', errors.slice(0,3).join(' | ') + (errors.length>3?` (+${errors.length-3} más)`:''), 'err');
  } else {
    showMsg('parsed-status', `${rows.length} programas válidos para revisión`, 'ok');
  }

  checkReady();
}

// ══════════════════════════════════════════════════
// Check if ready to generate
// ══════════════════════════════════════════════════
function checkReady() {
  // El reemplazo de HTML no es una vía de escritura; usa la API auditada.
  document.getElementById('btn-gen').disabled = true;
  const bp = document.getElementById('btn-publicar');
  if(bp) bp.disabled = true;
  const entries = Object.values(updaterState.parsedData);
  for(const [tipo, id] of [['pregrado','cnt-pre'],['posgrado','cnt-pos']]) {
    const rows = entries.filter(entry=>entry.tipo===tipo).flatMap(entry=>entry.rows);
    document.getElementById(id).textContent = rows.length || '—';
  }
  document.getElementById('resumen-cambios').style.display = entries.length ? 'block' : 'none';
  let message = 'Guarda los cambios desde la propuesta identificada del módulo Programas. La publicación se valida y audita en el servidor.';
  if(entries.length) {
    try {
      const candidate = ProgramCatalogImport.prepare(updaterState.parsedData, {
        programas: updaterState.currentUndergrad || PROGRAMAS,
        posgrados: updaterState.currentPostgrad || POSGRADOS
      });
      message = `${candidate.total} programas; ${candidate.uniqueIds} IDs únicos; ${candidate.duplicateGroups} grupos con nombres repetidos que requieren conciliación de identidad institucional. ` + message;
    } catch(error) { message = error.message + ' ' + message; }
  }
  showMsg('msg-gen', message, 'info');
}

// ══════════════════════════════════════════════════
// STEP 3 — Validación de archivos anteriores
// ══════════════════════════════════════════════════
// La vía de reemplazo offline queda cerrada hasta contar con auditoría institucional.
function construirHTMLActualizado() {
  return {error:'La escritura del catálogo requiere la API autenticada y su auditoría en la misma transacción.'};
}

function generarHTML() {
  return showMsg('msg-gen', construirHTMLActualizado().error, 'err');
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
// Los programas vigentes viven en SimuladorOFE.state.updater.

function extraerProgramasDelHTML(html) {
  try {
    const parseBlock = (startMarker, endMarker, legacyName) => {
      const i1 = html.indexOf(startMarker), i2 = html.indexOf(endMarker);
      if(i1 < 0 || i2 < 0 || i2 <= i1) return [];
      let raw = html.slice(i1 + startMarker.length, i2).trim();
      // Compatibilidad con versiones P3.8 y anteriores, donde los bloques
      // contenían `const PROGRAMAS = [...]` / `const POSGRADOS = [...]`.
      raw = raw.replace(new RegExp('^const\\s+' + legacyName + '\\s*=\\s*'), '').replace(/;\s*$/, '');
      raw = raw.replace(/^\s*\/\/.*$/gm, '').trim();
      return JSON.parse(raw);
    };

    const preRaw = parseBlock(MK_PRE_S, MK_PRE_E, 'PROGRAMAS');
    const posRaw = parseBlock(MK_POS_S, MK_POS_E, 'POSGRADOS');
    if(!Array.isArray(preRaw) || !Array.isArray(posRaw)) return null;
    // Validar como catálogo publicado, no como formulario de actualización.
    // El Excel oficial contiene posgrados con matrícula 0: son valores explícitos,
    // válidos en el catálogo, aunque la edición manual pueda exigir valor positivo.
    ProgramCatalogValidator.readList(ProgramCatalogNormalizer.fromSnapshot({programas: preRaw, posgrados: posRaw}));
    return {pregrado: preRaw, posgrado: posRaw};
  } catch(e) { return null; }
}

function actualizarBadgeSync() {
  const el = document.getElementById('sync-badge');
  if(!el) return;
  if(updaterState.currentUndergrad || updaterState.currentPostgrad) {
    el.hidden = false;
    el.innerHTML = `<span class="note__icon">${icon('refresh')}</span><div><strong>Plantilla sincronizada</strong> con el simulador cargado —
      ${(updaterState.currentUndergrad||[]).length} programas de pregrado y ${(updaterState.currentPostgrad||[]).length} de posgrado.</div>`;
  } else {
    el.hidden = true;
  }
}

// Programas actuales pre-cargados (extraidos del simulador vigente)
const _PRE_ACTUAL = [
  [
    "Administración de Empresas",
    17506400,
    0,
    10
  ],
  [
    "Arquitectura",
    18064600,
    1777600,
    9
  ],
  [
    "Ciencia de Datos",
    14755400,
    1777600,
    8
  ],
  [
    "Ciencia Política y Gobierno",
    14316700,
    1777600,
    8
  ],
  [
    "Comunicación Social y Period.",
    13018200,
    1777600,
    9
  ],
  [
    "Contaduría Pública",
    8637000,
    0,
    8
  ],
  [
    "Derecho",
    14590700,
    1777600,
    10
  ],
  [
    "Diseño Gráfico",
    14503100,
    1777600,
    8
  ],
  [
    "Diseño Industrial",
    17893200,
    1777600,
    8
  ],
  [
    "Economía",
    13645500,
    1777600,
    8
  ],
  [
    "Enfermería",
    8080400,
    0,
    8
  ],
  [
    "Filosofía y Humanidades",
    7519600,
    0,
    8
  ],
  [
    "Geología",
    14490800,
    1777600,
    9
  ],
  [
    "Ingeniería Biomédica",
    16818000,
    1777600,
    8
  ],
  [
    "Ingeniería Civil",
    14755400,
    1777600,
    10
  ],
  [
    "Ingeniería Eléctrica",
    14755400,
    1777600,
    10
  ],
  [
    "Ingeniería Electrónica",
    16818000,
    1777600,
    10
  ],
  [
    "Ingeniería Industrial",
    18089100,
    1777600,
    10
  ],
  [
    "Ingeniería Mecánica",
    14755400,
    1777600,
    10
  ],
  [
    "Ingeniería Sistemas Y Computación",
    14755400,
    1777600,
    10
  ],
  [
    "Lenguas Modernas y Cultura",
    13776100,
    1777600,
    8
  ],
  [
    "Licenciatura en Pedagogía Infantil",
    9460200,
    1777600,
    8
  ],
  [
    "Matemáticas",
    8863300,
    1777600,
    8
  ],
  [
    "Medicina",
    30904500,
    2169300,
    12
  ],
  [
    "Música",
    14638300,
    1777600,
    8
  ],
  [
    "Negocios Internacionales",
    19482100,
    1777600,
    10
  ],
  [
    "Odontología",
    19432800,
    2169300,
    10
  ],
  [
    "Psicología",
    13018200,
    1777600,
    10
  ],
  [
    "Relaciones Internacionales",
    13776100,
    1777600,
    10
  ]
];
const _POS_ACTUAL = [
  [
    "Doctorado En Administración",
    "Doctorado",
    33032700
  ],
  [
    "Doctorado En Ciencias Biomédicas",
    "Doctorado",
    22654900
  ],
  [
    "Doctorado En Ciencias Del Mar",
    "Doctorado",
    0
  ],
  [
    "Doctorado En Ciencias Naturales",
    "Doctorado",
    20091900
  ],
  [
    "Doctorado En Ciencias Sociales",
    "Doctorado",
    24338200
  ],
  [
    "Doctorado En Comunicación",
    "Doctorado",
    0
  ],
  [
    "Doctorado En Derecho",
    "Doctorado",
    24292000
  ],
  [
    "Doctorado En Economía",
    "Doctorado",
    24338200
  ],
  [
    "Doctorado En Educación",
    "Doctorado",
    20243700
  ],
  [
    "Doctorado En Ingeniería Civil",
    "Doctorado",
    23820900
  ],
  [
    "Doctorado En Ingeniería De Sistemas Y Computación",
    "Doctorado",
    23820900
  ],
  [
    "Doctorado En Ingeniería Eléctrica Y Electrónica",
    "Doctorado",
    23820900
  ],
  [
    "Doctorado En Ingeniería Industrial",
    "Doctorado",
    23820900
  ],
  [
    "Doctorado En Ingeniería Mecánica",
    "Doctorado",
    23820900
  ],
  [
    "Doctorado En Psicología",
    "Doctorado",
    23174000
  ],
  [
    "CAR - Especialización En Gerencia De La Calidad Y Auditoría En Salud",
    "Especialización",
    0
  ],
  [
    "CAR - Especialización En Seguridad Y Salud En El Trabajo",
    "Especialización",
    17983000
  ],
  [
    "Especialización En Análisis Y Diseño De Estructuras",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Arqueología",
    "Especialización",
    16339800
  ],
  [
    "Especialización En Comunicación Digital",
    "Especialización",
    16339800
  ],
  [
    "Especialización En Derecho Administrativo",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Derecho Ambiental, Territorial Y Urbanístico",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Derecho Civil Y De Familia",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Derecho Comercial",
    "Especialización",
    17870200
  ],
  [
    "Especialización En Derecho Constitucional",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Derecho Contractual",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Derecho De Sociedades",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Derecho Laboral",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Derecho Penal",
    "Especialización",
    18009000
  ],
  [
    "Especialización En Derecho Público",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Derechos Humanos",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Dermatología",
    "Especialización",
    57122100
  ],
  [
    "Especialización En Desarrollo Familiar",
    "Especialización",
    14624900
  ],
  [
    "Especialización En Desarrollo Organizacional Y Procesos Humanos",
    "Especialización",
    17360600
  ],
  [
    "Especialización En Desarrollo Social",
    "Especialización",
    18372900
  ],
  [
    "Especialización En Dirección De Operaciones",
    "Especialización",
    18936900
  ],
  [
    "Especialización En Diseño Y Evaluación De Proyectos",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Enfermería Del Cuidado Crítico Adulto",
    "Especialización",
    10479600
  ],
  [
    "Especialización En Enfermería Del Cuidado Neonatal",
    "Especialización",
    10479600
  ],
  [
    "Especialización En Finanzas",
    "Especialización",
    27527100
  ],
  [
    "Especialización En Gerencia De Empresas Comerciales",
    "Especialización",
    27527100
  ],
  [
    "Especialización En Gerencia De La Calidad Y Auditoría En Salud",
    "Especialización",
    19813500
  ],
  [
    "Especialización En Gerencia De La Calidad Y Auditoría En Salud Virtual",
    "Especialización",
    15850700
  ],
  [
    "Especialización En Gerencia De La Comunicación Organizacional",
    "Especialización",
    15001000
  ],
  [
    "Especialización En Gerencia De Proyectos",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Gerencia De Proyectos De Construcción",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Gerencia De Servicios De Salud",
    "Especialización",
    20592600
  ],
  [
    "Especialización En Gerencia De Tecnologías De La Información",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Gerencia Del Talento Humano",
    "Especialización",
    23821600
  ],
  [
    "Especialización En Gerencia Financiera De Servicios De Salud",
    "Especialización",
    20554800
  ],
  [
    "Especialización En Gerencia Pública",
    "Especialización",
    23821600
  ],
  [
    "Especialización En Gestión De Sistemas Eléctricos De Potencia",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Gobierno Y Políticas Públicas",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Ingeniería De Procesos Industriales",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Ingeniería De Sistemas Hídricos Urbanos",
    "Especialización",
    20260200
  ],
  [
    "Especialización En Ingeniería Del Software",
    "Especialización",
    22278700
  ],
  [
    "Especialización En La Enseñanza Del Inglés",
    "Especialización",
    13972400
  ],
  [
    "Especialización En Logística De Transporte Internacional De Mercancia",
    "Especialización",
    0
  ],
  [
    "Especialización En Logística Empresarial",
    "Especialización",
    0
  ],
  [
    "Especialización En Medicina Familiar",
    "Especialización",
    42786800
  ],
  [
    "Especialización En Medicina Interna",
    "Especialización",
    57122100
  ],
  [
    "Especialización En Mercadeo",
    "Especialización",
    0
  ],
  [
    "Especialización En Negociación Y Manejo De Conflictos",
    "Especialización",
    16246000
  ],
  [
    "Especialización En Neonatología",
    "Especialización",
    65629900
  ],
  [
    "Especialización En Oftalmología",
    "Especialización",
    59245700
  ],
  [
    "Especialización En Pavimentos Y Geotecnia Vial",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Pediatría",
    "Especialización",
    57122100
  ],
  [
    "Especialización En Psicología Forense",
    "Especialización",
    16203600
  ],
  [
    "Especialización En Psiquiatría",
    "Especialización",
    57122100
  ],
  [
    "Especialización En Radiología E Imágenes Diagnósticas",
    "Especialización",
    59245700
  ],
  [
    "Especialización En Responsabilidad Civil Y Seguros",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Seguridad De La Información",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Seguridad De La Información",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Seguridad Y Salud En El Trabajo",
    "Especialización",
    17983000
  ],
  [
    "Especialización En Seguridad Y Salud En El Trabajo Virtual",
    "Especialización",
    15850700
  ],
  [
    "Especialización En Transformación Digital",
    "Especialización",
    22278700
  ],
  [
    "Especialización En Tributación",
    "Especialización",
    16021400
  ],
  [
    "Especialización En Valoración De Bienes",
    "Especialización",
    15294700
  ],
  [
    "RIO - Especialización En Gerencia De La Calidad Y Auditoría En Salud",
    "Especialización",
    0
  ],
  [
    "RIO - Especialización En Seguridad Y Salud En El Trabajo",
    "Especialización",
    17983000
  ],
  [
    "SM - Especialización En Derecho Público",
    "Especialización",
    13618000
  ],
  [
    "SM - Especialización En Dirección Estratégica Empresarial",
    "Especialización",
    14338800
  ],
  [
    "SM - Especialización En Finanzas",
    "Especialización",
    20645300
  ],
  [
    "SM - Especialización En Gerencia De La Calidad Y Auditoría En Salud",
    "Especialización",
    14717000
  ],
  [
    "SM - Especialización En Gerencia De Proyectos",
    "Especialización",
    16709100
  ],
  [
    "SM - Especialización En Seguridad Y Salud En El Trabajo",
    "Especialización",
    0
  ],
  [
    "SM - Especialización En Tributación",
    "Especialización",
    13618000
  ],
  [
    "Maestría En Administración De Empresas",
    "Maestría",
    27527100
  ],
  [
    "Maestría En Análisis Y Gestión De Sistemas Eléctricos",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Analítica De Datos",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Ciencia Política Y Gobierno",
    "Maestría",
    19315900
  ],
  [
    "Maestría En Ciencias Básicas Biomédicas",
    "Maestría",
    20915600
  ],
  [
    "Maestría En Ciencias De La Tierra",
    "Maestría",
    15292200
  ],
  [
    "Maestría En Ciencias Naturales",
    "Maestría",
    13760200
  ],
  [
    "Maestría En Comunicación",
    "Maestría",
    17726100
  ],
  [
    "Maestría En Cooperación Internacional Y Gestión De Proyectos",
    "Maestría",
    17059400
  ],
  [
    "Maestría En Derecho",
    "Maestría",
    19315900
  ],
  [
    "Maestría En Derecho Ambiental Y Urbano-Territorial",
    "Maestría",
    19315900
  ],
  [
    "Maestría En Derecho Civil Y De Familia",
    "Maestría",
    16021400
  ],
  [
    "Maestría En Derecho Del Comercio",
    "Maestría",
    19315900
  ],
  [
    "Maestría En Derecho Del Trabajo Y De La Seguridad Social",
    "Maestría",
    19315900
  ],
  [
    "Maestría En Derecho Público",
    "Maestría",
    19315900
  ],
  [
    "Maestría En Desarrollo Organizacional Y Procesos Humanos",
    "Maestría",
    17059400
  ],
  [
    "Maestría En Desarrollo Social",
    "Maestría",
    18372900
  ],
  [
    "Maestría En Diseño E Innovación Md+I",
    "Maestría",
    17489500
  ],
  [
    "Maestría En Economia",
    "Maestría",
    17112700
  ],
  [
    "Maestría En Educación",
    "Maestría",
    13760200
  ],
  [
    "Maestría En Educación Mediada Por Tic",
    "Maestría",
    12384100
  ],
  [
    "Maestría En Enfermería",
    "Maestría",
    12489800
  ],
  [
    "Maestría En Epidemiología",
    "Maestría",
    20915600
  ],
  [
    "Maestría En Epidemiología Clínica",
    "Maestría",
    21882800
  ],
  [
    "Maestría En Estadística Aplicada",
    "Maestría",
    13760200
  ],
  [
    "Maestría En Filosofía",
    "Maestría",
    0
  ],
  [
    "Maestría En Finanzas",
    "Maestría",
    27527100
  ],
  [
    "Maestría En Fisica Aplicada",
    "Maestría",
    13760200
  ],
  [
    "Maestría En Gestión De Riesgos Naturales, Prevención Y Atención De Desastres",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Gobierno De Tecnología Informática",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Historia",
    "Maestría",
    0
  ],
  [
    "Maestría En Ingeniería Administrativa",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Ingeniería Ambiental",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Ingeniería Biomédica",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Ingeniería Civil",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Ingeniería De Sistemas Y Computación",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Ingeniería Eléctrica",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Ingeniería Electrónica",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Ingeniería Industrial",
    "Maestría",
    22864700
  ],
  [
    "Maestría En Ingeniería Mecánica",
    "Maestría",
    22864700
  ],
  [
    "Maestría En La Enseñanza Del Inglés",
    "Maestría",
    12156300
  ],
  [
    "Maestría En Lenguaje Y Sociedad",
    "Maestría",
    13972400
  ],
  [
    "Maestría En Literatura Y Escrituras Creativas",
    "Maestría",
    13092600
  ],
  [
    "Maestría En Matemáticas",
    "Maestría",
    11693100
  ],
  [
    "Maestría En Mercadeo",
    "Maestría",
    0
  ],
  [
    "Maestría En Negociación Y Manejo De Conflictos",
    "Maestría",
    19315900
  ],
  [
    "Maestría En Negocios Internacionales",
    "Maestría",
    0
  ],
  [
    "Maestría En Pedagogía Social E Intervención Educativa En Contextos Sociales",
    "Maestría",
    0
  ],
  [
    "Maestría En Periodismo",
    "Maestría",
    17059400
  ],
  [
    "Maestría En Psicología Énfasis Investigativo",
    "Maestría",
    18088400
  ],
  [
    "Maestría En Relaciones Internacionales",
    "Maestría",
    17059400
  ],
  [
    "Maestría En Relaciones Públicas",
    "Maestría",
    17059400
  ],
  [
    "Maestría En Salud Pública",
    "Maestría",
    20915600
  ],
  [
    "Maestría En Sistemas Integrados De Gestión",
    "Maestría",
    0
  ],
  [
    "Maestría En Trastornos Cognoscitivos Y Del Aprendizaje",
    "Maestría",
    17059400
  ],
  [
    "Maestría En Tributación Y Aduanas",
    "Maestría",
    19315900
  ],
  [
    "Maestría En Urbanismo Y Desarrollo Territorial",
    "Maestría",
    17489500
  ]
];

function descargarPlantilla() {
  const wb = XLSX.utils.book_new();

  // Usa los programas del simulador cargado si están disponibles (auto-sync),
  // de lo contrario cae al respaldo interno.
  const live=window.OFE_SERVER ? SimuladorOFE.catalog.programs : null;
  const fuentePre = live ? live.filter(p=>p.nivel==='pregrado').map(p=>[p.nombre,p.valorMatricula,p.valorIdiomas,p.semestres,p.id,p.version]) : (updaterState.currentUndergrad && updaterState.currentUndergrad.length) ? updaterState.currentUndergrad : _PRE_ACTUAL;
  const fuentePos = live ? live.filter(p=>p.nivel==='posgrado').map(p=>[p.nombre,p.subnivel,p.valorMatricula,p.id,p.version]) : (updaterState.currentPostgrad && updaterState.currentPostgrad.length) ? updaterState.currentPostgrad : _POS_ACTUAL;

  // Hoja 1 — Pregrado (4 columnas)
  const wsPre = XLSX.utils.aoa_to_sheet([
    ['Programa','Valor Pregrado','Valor Idiomas','Semestres',...(live?['ID','Version']:[])],
    ...fuentePre
  ]);
  wsPre['!cols'] = [{wch:42},{wch:16},{wch:16},{wch:12},{wch:65},{wch:10}];
  XLSX.utils.book_append_sheet(wb, wsPre, 'Pregrado');

  // Hoja 2 — Posgrado (3 columnas) con todos los programas actuales
  const wsPos = XLSX.utils.aoa_to_sheet([
    ['Programa','Subnivel','Valor',...(live?['ID','Version']:[])],
    ...fuentePos
  ]);
  wsPos['!cols'] = [{wch:60},{wch:18},{wch:16},{wch:65},{wch:10}];
  XLSX.utils.book_append_sheet(wb, wsPos, 'Posgrado');

  XLSX.writeFile(wb, 'plantilla-programas.xlsx');
  toast('Plantilla Excel descargada', 'success');
}

// ══════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════
function showMsg(id, msg, tipo) {
  const el = document.getElementById(id);
  if(!el) return;
  const variant = tipo === 'ok' ? 'success' : tipo === 'err' ? 'danger' : tipo || '';
  el.textContent = msg;
  el.className = 'feedback' + (variant ? ' feedback--' + variant : '');
  el.hidden = !msg;
}

// ── Auto-lectura: el simulador lee su propio código fuente ──────────────────
// En GitHub Pages (https) funciona y evita tener que subir el index.html.
// Con file:// el navegador lo bloquea por CORS y se usa la carga manual.
async function autoLeerSimulador() {
  const dz    = document.getElementById('dz-html');
  const stat  = document.getElementById('self-read-status');
  if(stat) stat.setAttribute('aria-busy','true');
  try {
    const resp = await fetch(window.location.href, {cache:'no-store'});
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    const txt = await resp.text();
    if(!txt.includes(MK_PRE_S) || !txt.includes(MK_POS_S)) throw new Error('sin marcadores');
    updaterState.htmlContent = txt;
    const sync = extraerProgramasDelHTML(txt);
    if(sync) { updaterState.currentUndergrad = sync.pregrado; updaterState.currentPostgrad = sync.posgrado; actualizarBadgeSync(); }
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
  } finally {
    if(stat) stat.removeAttribute('aria-busy');
  }
}

SimuladorOFE.register('updater', {
  init(app){
    app.services['updater'] = {
      descargarPlantilla: typeof descargarPlantilla === 'function' ? descargarPlantilla : undefined,
      generarHTML: typeof generarHTML === 'function' ? generarHTML : undefined,
      autoLeerSimulador: typeof autoLeerSimulador === 'function' ? autoLeerSimulador : undefined
    };
  }
});
