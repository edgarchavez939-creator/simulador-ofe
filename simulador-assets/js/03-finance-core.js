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

function showAlert(id,msg){
  const clean = String(msg ?? '').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  const lower = clean.toLowerCase();
  let fieldId = null;
  if(lower.includes('valor de matrícula') || lower.includes('valor de la matrícula')) fieldId = 'mat'+id;
  else if(id===7 && lower.includes('capacidad de pago')) fieldId = 'cap7';
  else if(id===7 && lower.includes('número de cuotas')) fieldId = 'plazo7';
  else if(id===7 && lower.includes('tasa de interés')) fieldId = 'tasa7';
  else if((id===1 || id===3) && (lower.includes('plazo') || lower.includes('número de meses'))) fieldId = 'plazo'+id;
  else if((id===1 || id===3) && lower.includes('tasa')) fieldId = 'tasa'+id;
  else if((id===1 || id===3) && lower.includes('monto financiado')) fieldId = 'finval'+id;
  else if(id===2 && lower.includes('corto plazo')) fieldId = 'plazoCP';
  else if(id===2 && lower.includes('largo plazo')) fieldId = 'plazoLP';
  else if(id===2 && lower.includes('monto financiado')) fieldId = 'finvalCP';
  else if(lower.includes('pago de contado supera')) fieldId = 'cont'+id+'-val';
  if(fieldId && document.getElementById(fieldId)) return showFieldError(fieldId, clean, id);
  const el=document.getElementById('alert'+id);
  if(!el) return toast(clean, 'error');
  el.textContent=clean; el.hidden=false;
  setTimeout(()=>{ el.hidden=true; },5000);
}

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
  const _benef1snap = SimuladorOFE.state.financing.benefits[1].map(b=>({nombre:b.nombre||'Descuento',val:b.val||0,pct:b.pct||0}));
  const _benef1total = getTotalBeneficios(1);
  const _matNeta1 = Math.max(0, mat - _benef1total);
  SimuladorOFE.state.results.shortTerm = {rows,cuota,totInt,totCap,principal,financiado,garantisa,mat,n,tm,cuotaInicial,pagoInicial,totalGeneral,
    progNombre:_prog1Nombre, pct:Math.round(pct*10)/10,
    beneficios:_benef1snap, benefTotal:_benef1total, matNeta:_matNeta1};
  setTimeout(()=>registrarHistorial(1), 100);

  document.getElementById('res1').innerHTML=`
  <div class="card">
    ${fechaBadgeHtml()}
    <div class="card-title">Resultado de la simulación</div>
    ${resultHero({
      eyebrow:'Crédito a Corto Plazo',
      label:'Cuota estimada', value:cop(cuota),
      meta:`${n} cuotas · ${(tm*100).toFixed(2)}% M.V.`, tone:'success',
      metrics:[
        {label:'Valor financiado',value:cop(financiado)},
        {label:'Total intereses',value:cop(totInt)},
        {label:'Total crédito',value:cop(totalPagar)},
        {label:'Pago inicial',value:cop(pagoInicial)}
      ],
      note:'El costo total de la matrícula incluye pago inicial, aporte Garantisa, capital e intereses del crédito.'
    })}
    ${resultActions(1,{canCompare:SimuladorOFE.state.comparison.scenarios[1].length>=2})}
    <div class="financial-details">
    <div class="section__title u-mt-0 u-mb-10 u-text-danger">${icon('credit-card')} Pago Inicial (al momento del desembolso)</div>
    <div class="kpi-grid">
      <div class="kpi"><span class="kpi__label">Cuota Inicial Contado</span><div class="kpi__value kpi__value--md">${cop(cuotaInicial)}</div></div>
      <div class="kpi kpi--warning"><span class="kpi__label">${icon('shield')} Garantisa (4.17% s/financiado)</span><div class="kpi__value kpi__value--md">${cop(garantisa)}</div></div>
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
    <div class="total-banner u-mb-20">
      <div><div class="tl">Pago Inicial</div><div class="tv">${cop(pagoInicial)}</div><div class="ts">Contado + Garantisa</div></div>
      <div class="u-op-symbol">+</div>
      <div><div class="tl">Total Crédito</div><div class="tv">${cop(totalPagar)}</div><div class="ts">${n} cuotas de ${cop(cuota)}</div></div>
      <div class="u-op-symbol">=</div>
      <div class="u-text-right"><div class="tl">Costo Total Matrícula</div><div class="tv">${cop(totalGeneral)}</div><div class="ts">Todo incluido</div></div>
    </div>
    <div class="section__title u-mt-5">Tabla de Amortización (${n} cuotas)</div>
    ${renderTabla(rows,cuota,totInt,totCap)}
    </div>
  </div>`;
  markViewHasResult(1,true);
  setTimeout(()=>renderEscenarios(1),50);
  toast('Simulación calculada correctamente','success');
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
      <td class="u-strong-success">${cop(f.acumCapital)}</td>
    </tr>`).join('');
  return `
  <div class="section__title u-mt-5">${icon('trending-up')} Proyección de la financiación — ${lbl}</div>
  <div class="callout callout--success-soft u-mb-12">
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
  <div class="table-wrap u-mt-10">
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
  <div class="callout callout--warning u-mt-10">
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
  const _benef2snap = SimuladorOFE.state.financing.benefits[2].map(b=>({nombre:b.nombre||'Descuento',val:b.val||0,pct:b.pct||0}));
  const _benef2total = getTotalBeneficios(2);
  const _matNeta2 = Math.max(0, mat - _benef2total);
  SimuladorOFE.state.results.mixed={CP,LP,mat,finCP,finLP,garCP,garLP,princCP,princLP,nCP,nLP,tm,cuotaInicial,pagoInicial,pCP,pLP,
    progNombre:_prog2Nombre,
    beneficios:_benef2snap, benefTotal:_benef2total, matNeta:_matNeta2};
  setTimeout(()=>registrarHistorial(2), 100);

  const totCP=CP?(CP.totCap+CP.totInt):0;
  const totLP=LP?LP.capital:0;  // LP: only capital shown (no interest at simulation time)
  const totCredito=totCP+totLP;
  const totGeneral=pagoInicial+totCredito;

  let html=`<div class="card">${fechaBadgeHtml()}<div class="card-title">Resultado de la simulación</div>
  ${resultHero({
    eyebrow:'Corto y Largo Plazo',
    label:CP?'Cuota estimada durante estudios':'Capital financiado a largo plazo',
    value:CP?cop(CP.cuota):cop(finLP),
    meta:`CP ${pCP}% · LP ${pLP}% · ${(tm*100).toFixed(2)}% M.V.`, tone:'success',
    metrics:[
      {label:'Financiado total',value:cop(finCP+finLP)},
      {label:'Pago inicial',value:cop(pagoInicial)},
      {label:'Intereses CP',value:cop(CP?CP.totInt:0)},
      {label:'Capital LP',value:cop(finLP)}
    ],
    note:LP?'La cuota y el costo definitivo del tramo LP dependerán de la tasa vigente al iniciar su amortización.':'El resultado corresponde al tramo de corto plazo configurado.'
  })}
  ${resultActions(2,{canCompare:SimuladorOFE.state.comparison.scenarios[2].length>=2})}
  <div class="financial-details">`;

  // Bloque pago inicial
  html+=`<div class="section__title u-mt-0 u-mb-10 u-text-danger">${icon('credit-card')} Pago Inicial (al momento del desembolso)</div>
  <div class="kpi-grid">
    <div class="kpi"><span class="kpi__label">Cuota Inicial Contado</span><div class="kpi__value kpi__value--md">${cop(cuotaInicial)}</div></div>
    ${garCP>0?`<div class="kpi kpi--warning"><span class="kpi__label">${icon('shield')} Garantisa CP (4.17%)</span><div class="kpi__value kpi__value--md">${cop(garCP)}</div></div>`:''}
    ${garLP>0?`<div class="kpi kpi--warning"><span class="kpi__label">${icon('shield')} Garantisa LP (2.86%)</span><div class="kpi__value kpi__value--md">${cop(garLP)}</div></div>`:''}
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
    html+=`<div class="tramo tramo--lp u-mt-24"><span>${icon('circle-dot')} Largo Plazo — ${pLP}% · ${cop(finLP)}</span></div>
    <div class="kpi-grid">
      <div class="kpi"><span class="kpi__label">Capital Financiado LP</span><div class="kpi__value kpi__value--md">${cop(finLP)}</div></div>
      <div class="kpi"><span class="kpi__label">Semestres Financiados</span><div class="kpi__value kpi__value--md">${getSemFinanciados().financiados} de ${semLP}</div></div>
      <div class="kpi"><span class="kpi__label">Período de Gracia</span><div class="kpi__value kpi__value--md">${graceMeses} meses</div></div>
      <div class="kpi"><span class="kpi__label">Plazo Estimado de Pago</span><div class="kpi__value kpi__value--md">${LP.nPago} meses</div></div>
    </div>
    <div class="callout callout--success u-my-12">
      <strong class="u-text-success u-block u-mb-6">${icon('info')} Información sobre el Crédito Largo Plazo</strong>
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
      SimuladorOFE.state.results.projectionLP = {...proy, pctLP:pLP, ipcPct:(isNaN(ipcPct)?5:ipcPct), etiqueta:'Matrícula'};
      html += renderProyeccionLP(proy, pLP, (isNaN(ipcPct)?5:ipcPct), 'Matrícula');
    } else {
      SimuladorOFE.state.results.projectionLP = null;
    }
  }

  if(CP&&LP){
    html+=`<div class="section__title u-mt-5 u-mt-24">Comparativa Capital vs Intereses</div>
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
  ${LP?`<div class="micro-note micro-note--success u-mt-8">
    * El costo total definitivo del crédito LP se determinará al momento de iniciar la amortización, según la tasa vigente.
  </div>`:''}
  </div></div>`;

  document.getElementById('res2').innerHTML=html;
  markViewHasResult(2,true);
  setTimeout(()=>renderEscenarios(2),50);
  toast('Simulación calculada correctamente','success');

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
          plugins:{legend:{display:true,position:'top',labels:{font:{family:'Montserrat',size:12},boxWidth:12,padding:16}},
          tooltip:{callbacks:{label:c=>' '+cop(c.raw)}}},
          scales:{x:{grid:{display:false},ticks:{font:{family:'Montserrat',size:12}}},
            y:{ticks:{font:{family:'Montserrat',size:11},callback:v=>cop(v)}}}}
      });
    },100);
  }
}



SimuladorOFE.register('finance-core', {
  init(app){
    app.services['finance-core'] = {
      cuotaMes: typeof cuotaMes === 'function' ? cuotaMes : undefined,
      amortizacion: typeof amortizacion === 'function' ? amortizacion : undefined,
      calcular1: typeof calcular1 === 'function' ? calcular1 : undefined,
      calcular2: typeof calcular2 === 'function' ? calcular2 : undefined,
      proyectarLP: typeof proyectarLP === 'function' ? proyectarLP : undefined
    };
  }
});
