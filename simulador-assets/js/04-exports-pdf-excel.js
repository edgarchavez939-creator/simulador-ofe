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
  if(!SimuladorOFE.state.results.shortTerm) return toast('Primero realiza el calculo','warning');
  const d = SimuladorOFE.state.results.shortTerm;
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
  toast('PDF descargado', 'success');
}

function expXLS1(){
  const d=SimuladorOFE.state.results.shortTerm; if(!d)return;
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
  toast('Excel descargado', 'success');
}

function expPDF2(){
  if(!SimuladorOFE.state.results.mixed) return toast('Primero realiza el calculo','warning');
  const d = SimuladorOFE.state.results.mixed;
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
  y = pdfProyeccionLP(doc, y, SimuladorOFE.state.results.projectionLP, 'Matricula');

  pdfPie(doc);
  doc.save(safePDF('Credito Mixto - ' + (d.progNombre||'Simulacion')) + '.pdf');
  toast('PDF descargado', 'success');
}

function expXLS2(){
  const d=SimuladorOFE.state.results.mixed; if(!d)return;
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
  toast('Excel descargado', 'success');
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
  const _benef3snap = SimuladorOFE.state.financing.benefits[3].map(b=>({nombre:b.nombre||'Descuento',val:b.val||0,pct:b.pct||0}));
  const _benef3total = getTotalBeneficios(3);
  const _matNeta3 = Math.max(0, mat - _benef3total);
  SimuladorOFE.state.results.bank={rows,cuota,totInt,totCap,financiado,mat,n,tm,cuotaInicial,cargos,pagoInicial,totalGeneral,
    progNombre:_prog3Nombre, pct:Math.round(pct*10)/10,
    beneficios:_benef3snap, benefTotal:_benef3total, matNeta:_matNeta3};
  setTimeout(()=>registrarHistorial(3), 100);

  const morado='var(--info)', morado_s='var(--info-soft)';
  document.getElementById('res3').innerHTML=`
  <div class="card">
    ${fechaBadgeHtml()}
    <div class="card-title">Resultado de la simulación</div>
    ${resultHero({
      eyebrow:'Crédito Banco Aliado', label:'Cuota estimada', value:cop(cuota),
      meta:`${n} cuotas · ${(tm*100).toFixed(2)}% M.V.`, tone:'info',
      metrics:[
        {label:'Valor financiado',value:cop(financiado)},
        {label:'Total intereses',value:cop(totInt)},
        {label:'Total crédito',value:cop(totalCredito)},
        {label:'Pago inicial',value:cop(pagoInicial)}
      ],
      note:cargos>0?`El pago inicial incluye ${cop(cargos)} en otros cargos del banco.`:'El resultado se calcula con las condiciones configuradas para el banco aliado.'
    })}
    ${resultActions(3,{canCompare:SimuladorOFE.state.comparison.scenarios[3].length>=2})}
    <div class="financial-details">
    <div class="section__title u-mt-5 u-mt-0 u-mb-10 u-text-info">${icon('credit-card')} Pago Inicial</div>
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
    <div class="total-banner info-banner u-mb-20">
      <div><div class="tl">Pago Inicial</div><div class="tv">${cop(pagoInicial)}</div><div class="ts">Contado + cargos</div></div>
      <div class="total-banner__op" aria-hidden="true">+</div>
      <div><div class="tl">Total Crédito</div><div class="tv">${cop(totalCredito)}</div><div class="ts">${n} cuotas de ${cop(cuota)}</div></div>
      <div class="total-banner__op" aria-hidden="true">=</div>
      <div class="u-text-right"><div class="tl">Costo Total Matrícula</div><div class="tv">${cop(totalGeneral)}</div><div class="ts">Todo incluido</div></div>
    </div>
    <div class="section__title u-mt-5">Tabla de Amortización (${n} meses)</div>
    ${renderTabla(rows,cuota,totInt,totCap)}
    </div>
  </div>`;
  markViewHasResult(3,true);
  setTimeout(()=>renderEscenarios(3),50);
  toast('Simulación calculada correctamente','success');
}

function expPDF3(){
  if(!SimuladorOFE.state.results.bank) return toast('Primero realiza el calculo','warning');
  const d = SimuladorOFE.state.results.bank;
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
  toast('PDF descargado', 'success');
}

function expXLS3(){
  const d=SimuladorOFE.state.results.bank; if(!d)return;
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
  toast('Excel descargado', 'success');
}



SimuladorOFE.register('exports', {
  init(app){
    app.services['exports'] = {
      expPDF1: typeof expPDF1 === 'function' ? expPDF1 : undefined,
      expXLS1: typeof expXLS1 === 'function' ? expXLS1 : undefined,
      expPDF2: typeof expPDF2 === 'function' ? expPDF2 : undefined,
      expXLS2: typeof expXLS2 === 'function' ? expXLS2 : undefined,
      expPDF3: typeof expPDF3 === 'function' ? expPDF3 : undefined,
      expXLS3: typeof expXLS3 === 'function' ? expXLS3 : undefined
    };
  }
});
