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
  rojo:    [150, 10, 17],
  rojoOsc: [112, 7, 13],
  negro:   [21, 21, 21],
  dorado:  [183, 139, 30],
  texto:   [21, 21, 21],
  texto2:  [75, 83, 97],
  texto3:  [112, 117, 128],
  linea:   [220, 223, 228],
  suave:   [247, 248, 250],
  suave2:  [241, 243, 246],
  rojoS:   [252, 243, 244],
  doradoS: [251, 248, 237],
  M: 14,
  W: 210,
  get CW(){ return this.W - this.M * 2; }
};

function pdfGeneratedMeta(){
  const d = new Date();
  return {
    fecha: d.toLocaleDateString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric'}),
    hora: d.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})
  };
}

function pdfHeader(doc, titulo, subtitulo = 'Resultados de tu simulacion de financiacion.') {
  const P = PDF;
  const meta = pdfGeneratedMeta();
  doc.setFillColor(...P.rojo); doc.rect(P.M, 9, 12, 1.5, 'F');
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(...P.texto2);
  doc.text('SIMULACION DE CREDITO EDUCATIVO', P.M, 18);
  doc.setFont('helvetica','bold'); doc.setFontSize(21); doc.setTextColor(...P.negro);
  pdfText(doc, titulo, P.M, 29);
  doc.setFont('helvetica','normal'); doc.setFontSize(10.5); doc.setTextColor(...P.texto2);
  pdfText(doc, subtitulo, P.M, 37);

  const x=134, y=12, w=62, h=25;
  doc.setFillColor(...P.suave); doc.setDrawColor(...P.linea); doc.roundedRect(x,y,w,h,2.5,2.5,'FD');
  doc.setFont('helvetica','normal'); doc.setFontSize(7.4); doc.setTextColor(...P.texto3);
  doc.text('Fecha de simulacion',x+5,y+8); doc.text('Hora',x+5,y+16);
  doc.setDrawColor(...P.linea); doc.line(x+31,y+5,x+31,y+h-5);
  doc.setFont('helvetica','bold'); doc.setTextColor(...P.texto2);
  doc.text(safePDF(meta.fecha),x+w-5,y+8,{align:'right'});
  doc.text(safePDF(meta.hora),x+w-5,y+16,{align:'right'});
  doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0); doc.setFontSize(10);
  return 47;
}

function pdfEnsureSpace(doc, y, needed, startY = 20){
  const h = doc.internal.pageSize.getHeight();
  if(y + needed > h - 19){ doc.addPage(); return startY; }
  return y;
}

function pdfSectionTitle(doc, x, y, w, title, subtitle=''){
  y = pdfEnsureSpace(doc,y,subtitle?15:10);
  doc.setFillColor(...PDF.rojo); doc.rect(x,y,9,1.5,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(11.5); doc.setTextColor(...PDF.negro);
  pdfText(doc,title,x,y+8);
  if(subtitle){
    doc.setFont('helvetica','normal'); doc.setFontSize(7.7); doc.setTextColor(...PDF.texto3);
    pdfText(doc,subtitle,x+w,y+8,{align:'right'});
  }
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal'); doc.setFontSize(10);
  return y+13;
}

function pdfContextBand(doc,y,left,right){
  const P=PDF, gap=7, w=(P.CW-gap)/2, h=27;
  y=pdfEnsureSpace(doc,y,h+4);
  doc.setFillColor(...P.suave); doc.setDrawColor(...P.linea); doc.roundedRect(P.M,y,P.CW,h,2.5,2.5,'FD');
  doc.setDrawColor(...P.linea); doc.line(P.M+w+gap/2,y+5,P.M+w+gap/2,y+h-5);
  const draw=(x,obj)=>{
    doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(...P.texto3);
    pdfText(doc,(obj.label||'').toUpperCase(),x+6,y+8);
    doc.setFont('helvetica','bold'); doc.setFontSize(obj.valueSize||11.5); doc.setTextColor(...P.negro);
    const lines=doc.splitTextToSize(safePDF(obj.value||''),w-12); doc.text(lines,x+6,y+16);
    if(obj.hint){ doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...P.texto2); pdfText(doc,obj.hint,x+6,y+23); }
  };
  draw(P.M,left||{}); draw(P.M+w+gap,right||{});
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');
  return y+h+5;
}

function pdfHeroSplit(doc,y,cfg={}){
  const P=PDF, gap=4, leftW=103, rightW=P.CW-leftW-gap, h=43;
  y=pdfEnsureSpace(doc,y,h+5);
  doc.setFillColor(...P.rojo); doc.roundedRect(P.M,y,leftW,h,2.5,2.5,'F');
  doc.setFillColor(...P.rojoS); doc.roundedRect(P.M+leftW+gap,y,rightW,h,2.5,2.5,'F');

  doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(255,255,255);
  pdfText(doc,(cfg.label||'Resultado estimado').toUpperCase(),P.M+8,y+10);
  doc.setFont('helvetica','bold'); doc.setFontSize(cfg.valueSize||25); doc.setTextColor(255,255,255);
  pdfText(doc,cfg.value||'',P.M+8,y+27);
  doc.setFont('helvetica','normal'); doc.setFontSize(8.6); doc.setTextColor(255,255,255);
  pdfText(doc,cfg.meta||'',P.M+8,y+36);

  doc.setFillColor(...P.rojo); doc.circle(P.M+leftW+gap+9,y+11,2.6,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...P.rojoOsc);
  pdfText(doc,cfg.noteTitle||'Que significa este valor?',P.M+leftW+gap+16,y+13);
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(...P.texto2);
  const note=doc.splitTextToSize(safePDF(cfg.note||''),rightW-20); doc.text(note,P.M+leftW+gap+16,y+22);
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');
  return y+h+6;
}

function pdfMetricRow(doc,y,items){
  const P=PDF; items=(items||[]).filter(Boolean); if(!items.length) return y;
  const cols=items.length, gap=4, w=(P.CW-gap*(cols-1))/cols, h=30;
  y=pdfEnsureSpace(doc,y,h+4);
  items.forEach((it,i)=>{
    const x=P.M+i*(w+gap);
    doc.setFillColor(...P.suave); doc.setDrawColor(...P.linea); doc.roundedRect(x,y,w,h,2.2,2.2,'FD');
    doc.setFont('helvetica','normal'); doc.setFontSize(7.2); doc.setTextColor(...P.texto2);
    pdfText(doc,it.label||'',x+5,y+9);
    doc.setFont('helvetica','bold'); doc.setFontSize(it.valueSize||12.5); doc.setTextColor(...P.negro);
    const lines=doc.splitTextToSize(safePDF(String(it.value||'')),w-10); doc.text(lines,x+5,y+18);
    if(it.hint){ doc.setFont('helvetica','normal'); doc.setFontSize(6.8); doc.setTextColor(...P.texto3); pdfText(doc,it.hint,x+5,y+27); }
  });
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');
  return y+h+5;
}

function pdfDetailTable(doc,x,y,w,title,rows,opts={}){
  const headerH=7,rowH=7;
  const clean=(rows||[]).filter(Boolean);
  y=pdfSectionTitle(doc,x,y,w,title,opts.subtitle||'');
  y=pdfEnsureSpace(doc,y,headerH+clean.length*rowH+5);
  doc.setFillColor(...PDF.negro); doc.rect(x,y,w,headerH,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(7.8); doc.setTextColor(255,255,255);
  pdfText(doc,'Concepto',x+5,y+4.8); pdfText(doc,'Valor',x+w-5,y+4.8,{align:'right'});
  y+=headerH;
  clean.forEach((r,idx)=>{
    const total=r[2]==='total';
    if(total) doc.setFillColor(...PDF.suave2); else if(idx%2) doc.setFillColor(...PDF.suave);
    if(total||idx%2) doc.rect(x,y,w,rowH,'F');
    doc.setDrawColor(...PDF.linea); doc.line(x,y+rowH,x+w,y+rowH);
    doc.setFont('helvetica',total?'bold':'normal'); doc.setFontSize(7.8); doc.setTextColor(...(total?PDF.negro:PDF.texto2));
    pdfText(doc,r[0],x+5,y+4.9);
    doc.setFont('helvetica','bold'); doc.setTextColor(...PDF.negro); pdfText(doc,String(r[1]),x+w-5,y+4.9,{align:'right'});
    y+=rowH;
  });
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');
  return y+3;
}

function pdfConditionsBox(doc,x,y,w,rows,title='Condiciones del credito'){
  const clean=(rows||[]).filter(Boolean), rowH=6.3, h=10+clean.length*rowH;
  y=pdfEnsureSpace(doc,y,h+3);
  doc.setFillColor(...PDF.suave); doc.setDrawColor(...PDF.linea); doc.roundedRect(x,y,w,h,2.3,2.3,'FD');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...PDF.negro); pdfText(doc,title,x+5,y+7);
  let yy=y+13;
  clean.forEach(([k,v])=>{
    doc.setFont('helvetica','normal'); doc.setFontSize(7.3); doc.setTextColor(...PDF.texto2); pdfText(doc,k,x+5,yy);
    doc.setFont('helvetica','bold'); doc.setTextColor(...PDF.texto2); pdfText(doc,String(v),x+w-5,yy,{align:'right'});
    doc.setDrawColor(...PDF.linea); doc.line(x+5,yy+2,x+w-5,yy+2); yy+=rowH;
  });
  return y+h+4;
}

function pdfNoteBox(doc,x,y,w,title,bullets){
  const lines=[]; (bullets||[]).forEach(b=>{ const arr=doc.splitTextToSize(safePDF(b),w-14); if(arr.length){ lines.push('- '+arr[0]); lines.push(...arr.slice(1).map(s=>'  '+s)); }});
  const h=13+lines.length*4;
  y=pdfEnsureSpace(doc,y,h+3);
  doc.setFillColor(...PDF.suave); doc.setDrawColor(...PDF.linea); doc.roundedRect(x,y,w,h,2.3,2.3,'FD');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...PDF.negro); pdfText(doc,title,x+5,y+7);
  doc.setFont('helvetica','normal'); doc.setFontSize(7.3); doc.setTextColor(...PDF.texto2); doc.text(lines,x+5,y+13);
  return y+h+4;
}

function pdfPlanTable(doc,x,y,w,rows,totCap,totInt,title='Plan de pagos estimado'){
  y=pdfSectionTitle(doc,x,y,w,title,'');
  const cols=[
    {t:'Cuota',w:w*.12,a:'center'},
    {t:'Capital',w:w*.23,a:'right'},
    {t:'Intereses',w:w*.21,a:'right'},
    {t:'Valor cuota',w:w*.23,a:'right'},
    {t:'Saldo',w:w*.21,a:'right'}
  ];
  const xAt=i=>x+cols.slice(0,i).reduce((s,c)=>s+c.w,0);
  const drawHead=()=>{
    doc.setFillColor(...PDF.negro); doc.rect(x,y,w,7,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(7.1); doc.setTextColor(255,255,255);
    cols.forEach((c,i)=>{ const xx=c.a==='right'?xAt(i)+c.w-3:c.a==='center'?xAt(i)+c.w/2:xAt(i)+3; doc.text(c.t,xx,y+4.7,{align:c.a}); });
    y+=7;
  };
  drawHead();
  (rows||[]).forEach((r,idx)=>{
    if(y>267){ doc.addPage(); y=22; drawHead(); }
    if(idx%2){ doc.setFillColor(...PDF.suave); doc.rect(x,y,w,6.5,'F'); }
    doc.setFont('helvetica','normal'); doc.setFontSize(7.1); doc.setTextColor(...PDF.texto2);
    const vals=[String(r.i),cop(r.capital),cop(r.interes),cop(r.cuota),cop(r.saldo)];
    cols.forEach((c,i)=>{ const xx=c.a==='right'?xAt(i)+c.w-3:c.a==='center'?xAt(i)+c.w/2:xAt(i)+3; pdfText(doc,vals[i],xx,y+4.5,{align:c.a}); });
    doc.setDrawColor(...PDF.linea); doc.line(x,y+6.5,x+w,y+6.5); y+=6.5;
  });
  doc.setFillColor(...PDF.suave2); doc.rect(x,y,w,7,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(7.3); doc.setTextColor(...PDF.negro);
  pdfText(doc,'Total',x+3,y+4.8); pdfText(doc,cop(totCap),xAt(2)-3,y+4.8,{align:'right'}); pdfText(doc,cop(totInt),xAt(3)-3,y+4.8,{align:'right'}); pdfText(doc,cop((totCap||0)+(totInt||0)),xAt(4)-3,y+4.8,{align:'right'});
  return y+10;
}

function pdfTablaAmort(doc,y,rows,totCap,totInt,titulo){ return pdfPlanTable(doc,PDF.M,y,PDF.CW,rows,totCap,totInt,titulo||'Plan de pagos estimado'); }
function pdfSectionBar(doc,label,y){ return pdfSectionTitle(doc,PDF.M,y,PDF.CW,label,''); }
function pdfKV(doc,y,filas){ return pdfDetailTable(doc,PDF.M,y,PDF.CW,'Detalle',filas||[]); }
function pdfCondiciones(doc,y,cond){
  const rows=[];
  if(cond.modalidad) rows.push(['Tipo de credito',cond.modalidad]);
  if(cond.tasa!=null){ rows.push(['Tasa M.V.',(cond.tasa*100).toFixed(2)+'%']); rows.push(['Tasa E.A.',((Math.pow(1+cond.tasa,12)-1)*100).toFixed(2)+'%']); }
  if(cond.plazo) rows.push(['Plazo',cond.plazo]);
  if(cond.garantisa) rows.push(['Garantisa',cond.garantisa]);
  if(cond.gracia) rows.push(['Periodo de gracia',cond.gracia]);
  return pdfConditionsBox(doc,PDF.M,y,PDF.CW,rows,'Condiciones del credito');
}
function pdfCostoFootnote(doc,y,texto){ doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(...PDF.texto3); pdfText(doc,texto||'* Valores informativos sujetos a condiciones vigentes.',PDF.M,y); return y+5; }
function pdfBenefSection(doc,y,mat,beneficios,benefTotal,matNeta){
  const activos=(beneficios||[]).filter(b=>(b.val||0)>0); if(!activos.length) return y;
  const rows=[['Matricula bruta',cop(mat)],...activos.map(b=>[b.nombre||'Descuento','-'+cop(b.val)]),['Matricula neta',cop(matNeta),'total']];
  return pdfDetailTable(doc,PDF.M,y,PDF.CW,'Beneficios y descuentos aplicados',rows);
}
function pdfCallout(doc,y,title,body){ const arr=Array.isArray(body)?body:[body]; return pdfNoteBox(doc,PDF.M,y,PDF.CW,title,arr); }
function pdfMetricCards(doc,y,items){ return pdfMetricRow(doc,y,items); }
function pdfHeroBand(doc,y,cfg){ return pdfHeroSplit(doc,y,cfg); }
function pdfSectionLabel(doc,y,title,subtitle=''){ return pdfSectionTitle(doc,PDF.M,y,PDF.CW,title,subtitle); }
function addFechaToDoc(doc,y){ return y; }

function pdfPie(doc){
  const P=PDF, meta=pdfGeneratedMeta(), n=doc.internal.getNumberOfPages();
  for(let i=1;i<=n;i++){
    doc.setPage(i);
    const h=doc.internal.pageSize.getHeight(), w=doc.internal.pageSize.getWidth();
    doc.setDrawColor(...P.linea); doc.line(P.M,h-14,w-P.M,h-14);
    doc.setFillColor(...P.rojo); doc.rect(P.M,h-8.5,8,1.2,'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(6.8); doc.setTextColor(...P.texto3);
    doc.text('Simulador de Credito Educativo',P.M+11,h-7.5);
    doc.text(safePDF('Generado el '+meta.fecha+' - '+meta.hora),w/2,h-7.5,{align:'center'});
    doc.text('Pag. '+i+' de '+n,w-P.M,h-7.5,{align:'right'});
  }
  doc.setTextColor(0,0,0);
}

function expPDF1(){
  const d=SimuladorOFE.state.results.shortTerm;
  if(!d) return toast('Primero realiza el calculo','warning');
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  const tea=((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'% E.A.';
  let y=pdfHeader(doc,'Credito a Corto Plazo');

  y=pdfContextBand(doc,y,
    {label:'Programa academico',value:d.progNombre||'Programa',hint:'Programa simulado'},
    {label:'Periodo financiado',value:`${d.n} meses`,hint:'Corresponde al periodo seleccionado'}
  );
  y=pdfHeroSplit(doc,y,{
    label:'Cuota mensual estimada',value:cop(d.cuota),
    meta:`${d.n} cuotas | ${(d.tm*100).toFixed(2)}% M.V. (${tea})`,
    noteTitle:'Que significa este valor?',
    note:'Es el pago mensual estimado del credito una vez realizado el pago inicial. Incluye capital e intereses segun las condiciones seleccionadas.'
  });
  y=pdfSectionTitle(doc,PDF.M,y,PDF.CW,'Resumen financiero');
  y=pdfMetricRow(doc,y,[
    {label:'Valor de la matricula',value:cop(d.matNeta||d.mat),hint:'Base del periodo'},
    {label:'Pago inicial total',value:cop(d.pagoInicial),hint:'Contado + Garantisa'},
    {label:'Valor financiado',value:cop(d.financiado),hint:'Capital del credito'},
    {label:'Total intereses',value:cop(d.totInt),hint:'Costo financiero'}
  ]);

  const gap=6, colW=(PDF.CW-gap)/2, yDetail=y;
  const yA=pdfDetailTable(doc,PDF.M,yDetail,colW,'Detalle del pago inicial',[
    ['Cuota inicial (contado)',cop(d.cuotaInicial)],
    ['Garantisa (4.17% s/financiado)',cop(d.garantisa)],
    ['Total pago inicial',cop(d.pagoInicial),'total']
  ]);
  const yB=pdfDetailTable(doc,PDF.M+colW+gap,yDetail,colW,'Detalle del credito',[
    ['Capital financiado',cop(d.financiado)],
    ['Total intereses',cop(d.totInt)],
    ['Total del credito',cop(d.totCap+d.totInt),'total']
  ]);
  y=Math.max(yA,yB)+2;

  const cond=[
    ['Plazo',`${d.n} meses`],
    ['Tasa M.V.',(d.tm*100).toFixed(2)+'%'],
    ['Tasa E.A.',tea.replace(' E.A.','')],
    ['Sistema','Cuota fija'],
    ['Tipo de credito','Corto plazo']
  ];
  const notes=[
    'La simulacion es informativa y puede cambiar si cambian las condiciones vigentes.',
    'El total del credito corresponde a capital financiado mas intereses.',
    'Verifica la informacion antes de formalizar el credito.'
  ];

  if((d.rows||[]).length<=6 && y<205){
    const leftW=110,rightW=66,xR=PDF.M+leftW+6;
    pdfPlanTable(doc,PDF.M,y,leftW,d.rows,d.totCap,d.totInt,'Plan de pagos estimado');
    let yr=pdfConditionsBox(doc,xR,y,rightW,cond,'Condiciones del credito');
    pdfNoteBox(doc,xR,yr,rightW,'Ten en cuenta',notes);
  }else{
    y=pdfConditionsBox(doc,PDF.M,y,PDF.CW,cond,'Condiciones del credito');
    y=pdfNoteBox(doc,PDF.M,y,PDF.CW,'Ten en cuenta',notes);
    doc.addPage();
    pdfPlanTable(doc,PDF.M,22,PDF.CW,d.rows,d.totCap,d.totInt,'Plan de pagos estimado');
  }
  pdfPie(doc);
  doc.save(safePDF('Credito Corto Plazo - '+(d.progNombre||'Simulacion'))+'.pdf');
  toast('PDF descargado','success');
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
  const d=SimuladorOFE.state.results.mixed;
  if(!d) return toast('Primero realiza el calculo','warning');
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  const tea=((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'% E.A.';
  const totCP=d.CP?(d.CP.totCap+d.CP.totInt):0;
  const nPagoLP=(d.LP&&d.LP.nPago)||Math.round((d.nLP||8)*6*1.5);
  let y=pdfHeader(doc,'Credito Corto y Largo Plazo');

  y=pdfContextBand(doc,y,
    {label:'Programa academico',value:d.progNombre||'Programa',hint:'Programa simulado'},
    {label:'Distribucion financiada',value:`CP ${d.pCP||0}% / LP ${d.pLP||0}%`,hint:'Composicion del escenario'}
  );
  y=pdfHeroSplit(doc,y,{
    label:d.CP?'Cuota estimada del corto plazo':'Capital de largo plazo',
    value:d.CP?cop(d.CP.cuota):cop(d.finLP||0),
    meta:`${(d.tm*100).toFixed(2)}% M.V. (${tea})`,
    noteTitle:'Como leer este resultado?',
    note:'La cuota mostrada corresponde al tramo de corto plazo. El tramo de largo plazo se presenta como capital porque su tasa y cuota se definen al iniciar la amortizacion.'
  });
  y=pdfSectionTitle(doc,PDF.M,y,PDF.CW,'Resumen financiero');
  y=pdfMetricRow(doc,y,[
    {label:'Matricula neta',value:cop(d.matNeta||d.mat),hint:'Base financiable'},
    {label:'Pago inicial total',value:cop(d.pagoInicial),hint:'Contado + Garantisa'},
    {label:'Financiacion CP',value:cop(d.finCP||0),hint:d.CP?`${d.nCP||0} cuotas`:'Sin tramo CP'},
    {label:'Capital LP',value:cop(d.finLP||0),hint:d.LP?`${nPagoLP} meses estimados`:'Sin tramo LP'}
  ]);

  const gap=6,colW=(PDF.CW-gap)/2,yDetail=y;
  const yA=pdfDetailTable(doc,PDF.M,yDetail,colW,'Detalle del pago inicial',[
    ['Pago de contado',cop(d.cuotaInicial)],
    d.garCP>0?['Garantisa CP (4.17%)',cop(d.garCP)]:null,
    d.garLP>0?['Garantisa LP (2.86%)',cop(d.garLP)]:null,
    ['Total pago inicial',cop(d.pagoInicial),'total']
  ]);
  const yB=pdfDetailTable(doc,PDF.M+colW+gap,yDetail,colW,'Detalle de la financiacion',[
    d.CP?['Total credito CP',cop(totCP)]:null,
    d.CP?['Intereses CP',cop(d.CP.totInt)]:null,
    d.LP?['Capital LP',cop(d.finLP)]:null,
    ['Total conocido',cop(d.pagoInicial+totCP+(d.finLP||0)),'total']
  ]);
  y=Math.max(yA,yB)+2;
  y=pdfConditionsBox(doc,PDF.M,y,PDF.CW,[
    ['Tasa CP M.V.',(d.tm*100).toFixed(2)+'%'],
    ['Tasa CP E.A.',tea.replace(' E.A.','')],
    d.CP?['Plazo CP',`${d.nCP||0} meses`]:null,
    d.LP?['Plazo LP estimado',`${nPagoLP} meses`]:null,
    d.LP?['Periodo de gracia','12 meses post-grado']:null
  ],'Condiciones del credito');
  y=pdfNoteBox(doc,PDF.M,y,PDF.CW,'Ten en cuenta',[
    'La cuota y el costo final del largo plazo dependen de la tasa vigente cuando inicie su amortizacion.',
    'El valor presentado como capital LP no incluye intereses futuros.',
    'La simulacion es informativa y no constituye aprobacion del credito.'
  ]);

  if(d.CP){
    doc.addPage();
    let yp=pdfHeader(doc,'Detalle del tramo de Corto Plazo','Plan de pagos asociado al escenario mixto.');
    yp=pdfContextBand(doc,yp,{label:'Programa academico',value:d.progNombre||'Programa'},{label:'Monto CP',value:cop(d.finCP),hint:`${d.nCP||0} cuotas`});
    pdfPlanTable(doc,PDF.M,yp,PDF.CW,d.CP.rows,d.CP.totCap,d.CP.totInt,'Plan de pagos del corto plazo');
  }
  y=pdfProyeccionLP(doc,Math.min(250,y),SimuladorOFE.state.results.projectionLP,'Matricula');
  pdfPie(doc);
  doc.save(safePDF('Credito Mixto - '+(d.progNombre||'Simulacion'))+'.pdf');
  toast('PDF descargado','success');
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
      meta:`${n} cuotas | ${(tm*100).toFixed(2)}% M.V.`, tone:'info',
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
  const d=SimuladorOFE.state.results.bank;
  if(!d) return toast('Primero realiza el calculo','warning');
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  const tea=((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'% E.A.';
  let y=pdfHeader(doc,'Credito Banco Aliado');
  y=pdfContextBand(doc,y,
    {label:'Programa academico',value:d.progNombre||'Programa',hint:'Programa simulado'},
    {label:'Periodo financiado',value:`${d.n} meses`,hint:'Escenario banco aliado'}
  );
  y=pdfHeroSplit(doc,y,{
    label:'Cuota mensual estimada',value:cop(d.cuota),
    meta:`${d.n} cuotas | ${(d.tm*100).toFixed(2)}% M.V. (${tea})`,
    noteTitle:'Que significa este valor?',
    note:'Es la cuota mensual estimada con las condiciones configuradas para el banco aliado. Los cargos iniciales, cuando existan, se muestran por separado.'
  });
  y=pdfSectionTitle(doc,PDF.M,y,PDF.CW,'Resumen financiero');
  y=pdfMetricRow(doc,y,[
    {label:'Matricula neta',value:cop(d.matNeta||d.mat),hint:'Base del periodo'},
    {label:'Pago inicial total',value:cop(d.pagoInicial),hint:d.cargos>0?'Incluye otros cargos':'Pago de contado'},
    {label:'Valor financiado',value:cop(d.financiado),hint:'Capital del credito'},
    {label:'Total intereses',value:cop(d.totInt),hint:'Costo financiero'}
  ]);
  const gap=6,colW=(PDF.CW-gap)/2,yDetail=y;
  const yA=pdfDetailTable(doc,PDF.M,yDetail,colW,'Detalle del pago inicial',[
    ['Cuota inicial (contado)',cop(d.cuotaInicial)],
    d.cargos>0?['Otros cargos',cop(d.cargos)]:null,
    ['Total pago inicial',cop(d.pagoInicial),'total']
  ]);
  const yB=pdfDetailTable(doc,PDF.M+colW+gap,yDetail,colW,'Detalle del credito',[
    ['Capital financiado',cop(d.financiado)],
    ['Total intereses',cop(d.totInt)],
    ['Total del credito',cop(d.totCap+d.totInt),'total']
  ]);
  y=Math.max(yA,yB)+2;
  const cond=[['Plazo',`${d.n} meses`],['Tasa M.V.',(d.tm*100).toFixed(2)+'%'],['Tasa E.A.',tea.replace(' E.A.','')],['Tipo de credito','Banco aliado']];
  const notes=['Los cargos del banco, cuando existan, se reflejan en el pago inicial.','La simulacion es informativa y puede cambiar segun las condiciones vigentes.','Verifica la informacion antes de formalizar el credito.'];
  if((d.rows||[]).length<=6 && y<205){
    const leftW=110,rightW=66,xR=PDF.M+leftW+6;
    pdfPlanTable(doc,PDF.M,y,leftW,d.rows,d.totCap,d.totInt,'Plan de pagos estimado');
    let yr=pdfConditionsBox(doc,xR,y,rightW,cond,'Condiciones del credito');
    pdfNoteBox(doc,xR,yr,rightW,'Ten en cuenta',notes);
  }else{
    y=pdfConditionsBox(doc,PDF.M,y,PDF.CW,cond,'Condiciones del credito');
    y=pdfNoteBox(doc,PDF.M,y,PDF.CW,'Ten en cuenta',notes);
    doc.addPage(); pdfPlanTable(doc,PDF.M,22,PDF.CW,d.rows,d.totCap,d.totInt,'Plan de pagos estimado');
  }
  pdfPie(doc);
  doc.save(safePDF('Credito Banco Aliado - '+(d.progNombre||'Simulacion'))+'.pdf');
  toast('PDF descargado','success');
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
