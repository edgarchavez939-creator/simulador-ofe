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
const updaterState = SimuladorOFE.state.updater;

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
    updaterState.htmlContent = content;
    const dz = document.getElementById('dz-html');
    dz.innerHTML = `<div class="dropzone__icon">${icon('check-circle')}</div><p><strong>${escHTML(file.name)}</strong> cargado correctamente</p>`;
    dz.style.background = 'var(--success-soft)'; dz.style.borderColor = 'var(--success)';
    const sizeKB = Math.round(content.length / 1024);
    const sizeNote = sizeKB < 80 ? ' ' + icon('alert-triangle') + ' El archivo parece pequeño ('+sizeKB+'KB). Verifica que sea la versión más reciente.' : ' ('+sizeKB+'KB)';
    // Sincronización automática: leer los programas vigentes del propio HTML
    const sync = extraerProgramasDelHTML(content);
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
  setDropzoneBusy('dz-xls', true);
  showMsg('msg-xls','Leyendo el archivo Excel…','info');
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      updaterState.workbook = XLSX.read(ev.target.result, {type:'array'});
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
  if(rawData.length < 2) { showMsg('parsed-status','La hoja está vacía','err'); return; }

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

  updaterState.parsedData[sheetName] = {tipo, rows};

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
    showMsg('parsed-status', `${rows.length} programas listos para importar`, 'ok');
  }

  checkReady();
}

// ══════════════════════════════════════════════════
// Check if ready to generate
// ══════════════════════════════════════════════════
function checkReady() {
  const bp = document.getElementById('btn-publicar');
  const hasPre = Object.values(updaterState.parsedData).some(d=>d.tipo==='pregrado' && d.rows.length > 0);
  const hasPos = Object.values(updaterState.parsedData).some(d=>d.tipo==='posgrado' && d.rows.length > 0);
  const ready = updaterState.htmlContent && (hasPre || hasPos);
  document.getElementById('btn-gen').disabled = !ready;
  if(bp) bp.disabled = !ready;

  if(hasPre || hasPos) {
    const preRows = Object.values(updaterState.parsedData).find(d=>d.tipo==='pregrado');
    const posRows = Object.values(updaterState.parsedData).find(d=>d.tipo==='posgrado');
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
  if(!updaterState.htmlContent) return {error:'Primero carga el index.html'};

  let newHtml = updaterState.htmlContent;
  let cambios = [];

  const preData = Object.values(updaterState.parsedData).find(d=>d.tipo==='pregrado');
  const posData = Object.values(updaterState.parsedData).find(d=>d.tipo==='posgrado');

  if(preData && preData.rows.length > 0) {
    const normalized = preData.rows.map(([n,v,i,s]) => [String(n), Number(v), Number(i)||0, Number(s)||8]);
    const jsonData = safeEmbeddedJSON(normalized);
    if(!RE_PRE.test(newHtml)) return {error:'No se encontró el marcador de PROGRAMAS en el HTML'};
    newHtml = newHtml.replace(RE_PRE, MK_PRE_S + jsonData + MK_PRE_E);
    cambios.push(`${preData.rows.length} programas de pregrado`);
  }

  if(posData && posData.rows.length > 0) {
    const normalized = posData.rows.map(([n,s,v]) => [String(n), String(s), Number(v)]);
    const jsonData = safeEmbeddedJSON(normalized);
    if(!RE_POS.test(newHtml)) return {error:'No se encontró el marcador de POSGRADOS en el HTML'};
    newHtml = newHtml.replace(RE_POS, MK_POS_S + jsonData + MK_POS_E);
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
  okMsg.hidden = false;
  showMsg('msg-gen','','');
  toast('index.html generado y descargado', 'success');
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
    const pregrado = Array.isArray(preRaw)
      ? preRaw.map(r => [String(r[0] ?? ''), Number(r[1])||0, Number(r[2])||0, Number(r[3])||8])
      : [];
    const posgrado = Array.isArray(posRaw)
      ? posRaw.map(r => [String(r[0] ?? ''), String(r[1] ?? ''), Number(r[2])||0])
      : [];
    if(pregrado.length === 0 && posgrado.length === 0) return null;
    return {pregrado, posgrado};
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
  const fuentePre = (updaterState.currentUndergrad && updaterState.currentUndergrad.length) ? updaterState.currentUndergrad : _PRE_ACTUAL;
  const fuentePos = (updaterState.currentPostgrad && updaterState.currentPostgrad.length) ? updaterState.currentPostgrad : _POS_ACTUAL;

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
