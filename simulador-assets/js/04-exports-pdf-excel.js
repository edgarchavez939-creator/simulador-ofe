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
  // Marca grafica angular inspirada en el sistema institucional (sin logo).
  doc.setFillColor(...P.suave2); doc.triangle(174,0,210,0,210,17,'F');
  doc.setFillColor(...P.rojo); doc.triangle(190,0,210,0,210,10,'F');
  doc.setFillColor(...P.doradoS); doc.triangle(198,10,210,10,210,20,'F');

  doc.setFillColor(...P.rojo); doc.rect(P.M, 9, 12, 1.5, 'F');
  doc.setFont('helvetica','normal'); doc.setFontSize(8.2); doc.setTextColor(...P.texto2);
  doc.text('SIMULACION DE CREDITO EDUCATIVO', P.M, 18);
  doc.setFont('helvetica','bold'); doc.setFontSize(20.5); doc.setTextColor(...P.negro);
  pdfText(doc, titulo, P.M, 29);
  doc.setFont('helvetica','normal'); doc.setFontSize(10.2); doc.setTextColor(...P.texto2);
  pdfText(doc, subtitulo, P.M, 37);

  const x=132, y=13, w=64, h=24;
  doc.setFillColor(...P.suave); doc.setDrawColor(...P.linea); doc.roundedRect(x,y,w,h,2.5,2.5,'FD');
  doc.setFont('helvetica','normal'); doc.setFontSize(7.3); doc.setTextColor(...P.texto3);
  doc.text('Fecha de simulacion',x+5,y+8); doc.text('Hora',x+5,y+16);
  doc.setDrawColor(...P.linea); doc.line(x+32,y+4,x+32,y+h-4);
  doc.setFont('helvetica','bold'); doc.setTextColor(...P.texto2);
  doc.text(safePDF(meta.fecha),x+w-5,y+8,{align:'right'});
  doc.text(safePDF(meta.hora),x+w-5,y+16,{align:'right'});
  doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0); doc.setFontSize(10);
  return 45;
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


function pdfApprovedIcon(doc, type, cx, cy, color=PDF.rojo){
  doc.setDrawColor(...color); doc.setTextColor(...color); doc.setLineWidth(0.7);
  if(type==='program'){
    doc.line(cx-4,cy-1,cx,cy-3.5); doc.line(cx,cy-3.5,cx+4,cy-1); doc.line(cx+4,cy-1,cx,cy+1.5); doc.line(cx,cy+1.5,cx-4,cy-1);
    doc.line(cx-2.6,cy+0.3,cx-2.6,cy+3.1); doc.line(cx+2.6,cy+0.3,cx+2.6,cy+3.1); doc.line(cx-2.6,cy+3.1,cx+2.6,cy+3.1);
  }else if(type==='calendar'){
    doc.roundedRect(cx-4,cy-3.4,8,7,1,1,'S'); doc.line(cx-4,cy-1,cx+4,cy-1); doc.line(cx-2.2,cy-4,cx-2.2,cy-2.2); doc.line(cx+2.2,cy-4,cx+2.2,cy-2.2);
  }else if(type==='money'){
    doc.circle(cx,cy,4,'S'); doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.text('$',cx,cy+2.3,{align:'center'});
  }else if(type==='shield'){
    doc.line(cx,cy-4,cx+3.5,cy-2.4); doc.line(cx+3.5,cy-2.4,cx+2.7,cy+2); doc.line(cx+2.7,cy+2,cx,cy+4); doc.line(cx,cy+4,cx-2.7,cy+2); doc.line(cx-2.7,cy+2,cx-3.5,cy-2.4); doc.line(cx-3.5,cy-2.4,cx,cy-4);
    doc.line(cx-1.7,cy,cx-.3,cy+1.3); doc.line(cx-.3,cy+1.3,cx+2,cy-1.2);
  }else if(type==='bars'){
    doc.rect(cx-4,cy+1,1.5,3,'S'); doc.rect(cx-1,cy-1,1.5,5,'S'); doc.rect(cx+2,cy-3.5,1.5,7.5,'S');
  }else if(type==='percent'){
    doc.circle(cx-2.4,cy-2.4,1,'S'); doc.circle(cx+2.4,cy+2.4,1,'S'); doc.line(cx-3.2,cy+3.2,cx+3.2,cy-3.2);
  }else if(type==='info'){
    doc.circle(cx,cy,4,'S'); doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.text('i',cx,cy+2.2,{align:'center'});
  }else if(type==='document'){
    doc.roundedRect(cx-3.3,cy-4,6.6,8,0.8,0.8,'S'); doc.line(cx-1.8,cy-1.5,cx+1.8,cy-1.5); doc.line(cx-1.8,cy+.5,cx+1.8,cy+.5); doc.line(cx-1.8,cy+2.5,cx+.8,cy+2.5);
  }else{
    doc.circle(cx,cy,3.4,'S');
  }
  doc.setLineWidth(0.2); doc.setTextColor(0,0,0);
}

function pdfApprovedContext(doc,y,left,right){
  const P=PDF,h=27,gap=4,w=(P.CW-gap)/2;
  doc.setFillColor(...P.suave); doc.setDrawColor(...P.linea); doc.roundedRect(P.M,y,P.CW,h,2.5,2.5,'FD');
  doc.setDrawColor(...P.linea); doc.line(P.M+w+gap/2,y+5,P.M+w+gap/2,y+h-5);
  const draw=(x,obj)=>{
    doc.setFillColor(...P.rojoS); doc.circle(x+12,y+13.5,6.8,'F'); pdfApprovedIcon(doc,obj.icon||'program',x+12,y+13.5,P.rojoOsc);
    doc.setFont('helvetica','bold'); doc.setFontSize(7.1); doc.setTextColor(...P.texto3); pdfText(doc,(obj.label||'').toUpperCase(),x+24,y+8.3);
    doc.setFont('helvetica','bold'); doc.setFontSize(9.7); doc.setTextColor(...P.negro); const lines=doc.splitTextToSize(safePDF(obj.value||''),w-30); doc.text(lines,x+24,y+15.2);
    if(obj.hint){doc.setFont('helvetica','normal');doc.setFontSize(7.1);doc.setTextColor(...P.texto2);pdfText(doc,obj.hint,x+24,y+24.2);}
  };
  draw(P.M,left||{}); draw(P.M+w+gap,right||{});
  return y+h+4;
}

function pdfApprovedHero(doc,y,cfg){
  const P=PDF,leftW=104,gap=4,rightW=P.CW-leftW-gap,h=43;
  doc.setFillColor(...P.rojoOsc); doc.roundedRect(P.M,y,leftW,h,2.5,2.5,'F');
  doc.setFillColor(...P.rojoS); doc.roundedRect(P.M+leftW+gap,y,rightW,h,2.5,2.5,'F');
  // subtle angular overlay
  doc.setFillColor(...P.rojo); doc.triangle(P.M+leftW-16,y,P.M+leftW,y,P.M+leftW,y+16,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8.6);doc.setTextColor(255,255,255);pdfText(doc,(cfg.label||'').toUpperCase(),P.M+8,y+10);
  doc.setFont('helvetica','bold');doc.setFontSize(25.5);pdfText(doc,cfg.value||'',P.M+8,y+27);
  doc.setFont('helvetica','normal');doc.setFontSize(8.7);pdfText(doc,cfg.meta||'',P.M+8,y+36);
  pdfApprovedIcon(doc,'info',P.M+leftW+gap+10,y+12,P.rojoOsc);
  doc.setFont('helvetica','bold');doc.setFontSize(9.1);doc.setTextColor(...P.rojoOsc);pdfText(doc,cfg.noteTitle||'Que significa este valor?',P.M+leftW+gap+18,y+12.5);
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...P.texto2);const lines=doc.splitTextToSize(safePDF(cfg.note||''),rightW-24);doc.text(lines,P.M+leftW+gap+18,y+21);
  return y+h+5;
}

function pdfApprovedSectionTitle(doc,x,y,title){
  doc.setFillColor(...PDF.rojo);doc.rect(x,y,8,1.4,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(10.5);doc.setTextColor(...PDF.negro);pdfText(doc,title,x,y+7.3);
  return y+10;
}

function pdfApprovedMetrics(doc,y,items){
  const P=PDF,gap=4,w=(P.CW-gap*3)/4,h=28;
  items.forEach((it,i)=>{
    const x=P.M+i*(w+gap);
    doc.setFillColor(...P.suave);doc.setDrawColor(...P.linea);doc.roundedRect(x,y,w,h,2.2,2.2,'FD');
    doc.setFillColor(...(it.tint||P.rojoS));doc.circle(x+9,y+8,4.8,'F');pdfApprovedIcon(doc,it.icon||'money',x+9,y+8,it.iconColor||P.rojoOsc);
    doc.setFont('helvetica','normal');doc.setFontSize(6.8);doc.setTextColor(...P.texto2);pdfText(doc,it.label,x+17,y+8.5);
    doc.setFont('helvetica','bold');doc.setFontSize(12.2);doc.setTextColor(...P.negro);pdfText(doc,it.value,x+5,y+19);
    if(it.hint){doc.setFont('helvetica','normal');doc.setFontSize(6.3);doc.setTextColor(...P.texto3);const lines=doc.splitTextToSize(safePDF(it.hint),w-10);doc.text(lines,x+5,y+25);}
  });
  return y+h+4;
}

function pdfApprovedDetailTable(doc,x,y,w,title,rows){
  y=pdfApprovedSectionTitle(doc,x,y,title);
  const clean=(rows||[]).filter(Boolean),headerH=7,rowH=6.4;
  doc.setFillColor(...PDF.negro);doc.rect(x,y,w,headerH,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(7.3);doc.setTextColor(255,255,255);pdfText(doc,'Concepto',x+5,y+4.8);pdfText(doc,'Valor',x+w-5,y+4.8,{align:'right'});y+=headerH;
  clean.forEach((r,idx)=>{
    const total=r[2]==='total'; if(total){doc.setFillColor(...PDF.suave2);doc.rect(x,y,w,rowH,'F');} else if(idx%2){doc.setFillColor(...PDF.suave);doc.rect(x,y,w,rowH,'F');}
    doc.setDrawColor(...PDF.linea);doc.line(x,y+rowH,x+w,y+rowH);
    doc.setFont('helvetica',total?'bold':'normal');doc.setFontSize(7.2);doc.setTextColor(...(total?PDF.negro:PDF.texto2));pdfText(doc,r[0],x+5,y+4.4);
    doc.setFont('helvetica','bold');doc.setTextColor(...PDF.negro);pdfText(doc,String(r[1]),x+w-5,y+4.4,{align:'right'});y+=rowH;
  });
  return y+2;
}

function pdfApprovedDateForInstallment(index){
  const now=new Date(); const day=now.getDate(); const d=new Date(now.getFullYear(),now.getMonth()+index,1); const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(); d.setDate(Math.min(day,last));
  const dd=String(d.getDate()).padStart(2,'0'),mm=String(d.getMonth()+1).padStart(2,'0'); return `${dd}/${mm}/${d.getFullYear()}`;
}

function pdfApprovedPlanCompact(doc,x,y,w,rows,totCap,totInt,title='Plan de pagos estimado'){
  y=pdfApprovedSectionTitle(doc,x,y,title);
  const cols=[{t:'Cuota',w:w*.13,a:'center'},{t:'Fecha estimada',w:w*.25,a:'center'},{t:'Capital',w:w*.21,a:'right'},{t:'Intereses',w:w*.18,a:'right'},{t:'Valor cuota',w:w*.23,a:'right'}];
  const xAt=i=>x+cols.slice(0,i).reduce((s,c)=>s+c.w,0); const headerH=7,rowH=5.9;
  doc.setFillColor(...PDF.negro);doc.rect(x,y,w,headerH,'F');doc.setFont('helvetica','bold');doc.setFontSize(6.6);doc.setTextColor(255,255,255);
  cols.forEach((c,i)=>{const xx=c.a==='right'?xAt(i)+c.w-2:c.a==='center'?xAt(i)+c.w/2:xAt(i)+2;doc.text(c.t,xx,y+4.8,{align:c.a});});y+=headerH;
  (rows||[]).forEach((r,idx)=>{if(idx%2){doc.setFillColor(...PDF.suave);doc.rect(x,y,w,rowH,'F');}doc.setDrawColor(...PDF.linea);doc.line(x,y+rowH,x+w,y+rowH);doc.setFont('helvetica','normal');doc.setFontSize(6.5);doc.setTextColor(...PDF.texto2);const vals=[String(r.i),pdfApprovedDateForInstallment(r.i),cop(r.capital),cop(r.interes),cop(r.cuota)];cols.forEach((c,i)=>{const xx=c.a==='right'?xAt(i)+c.w-2:c.a==='center'?xAt(i)+c.w/2:xAt(i)+2;pdfText(doc,vals[i],xx,y+4.1,{align:c.a});});y+=rowH;});
  doc.setFillColor(...PDF.suave2);doc.rect(x,y,w,7,'F');doc.setFont('helvetica','bold');doc.setFontSize(6.8);doc.setTextColor(...PDF.negro);pdfText(doc,'Total',x+3,y+4.8);pdfText(doc,cop(totCap),xAt(3)-2,y+4.8,{align:'right'});pdfText(doc,cop(totInt),xAt(4)-2,y+4.8,{align:'right'});pdfText(doc,cop((totCap||0)+(totInt||0)),x+w-2,y+4.8,{align:'right'});return y+9;
}

function pdfApprovedConditionsCompact(doc,x,y,w,rows){
  const clean=(rows||[]).filter(Boolean),rowH=5.3,h=9+clean.length*rowH;
  doc.setFillColor(...PDF.suave);doc.setDrawColor(...PDF.linea);doc.roundedRect(x,y,w,h,2.2,2.2,'FD');doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(...PDF.negro);pdfText(doc,'Condiciones del credito',x+5,y+6.5);let yy=y+11.5;
  clean.forEach(([k,v],idx)=>{doc.setFont('helvetica','normal');doc.setFontSize(6.6);doc.setTextColor(...PDF.texto2);pdfText(doc,k,x+5,yy);doc.setFont('helvetica','bold');pdfText(doc,String(v),x+w-5,yy,{align:'right'});if(idx<clean.length-1){doc.setDrawColor(...PDF.linea);doc.line(x+5,yy+1.7,x+w-5,yy+1.7);}yy+=rowH;});return y+h+3;
}

function pdfApprovedNotesCompact(doc,x,y,w,bullets){
  const lines=[];(bullets||[]).forEach(b=>{const arr=doc.splitTextToSize(safePDF(b),w-14);if(arr.length){lines.push('- '+arr[0]);lines.push(...arr.slice(1).map(s=>'  '+s));}});const h=9+lines.length*3.05;
  doc.setFillColor(...PDF.suave);doc.setDrawColor(...PDF.linea);doc.roundedRect(x,y,w,h,2.2,2.2,'FD');pdfApprovedIcon(doc,'info',x+7,y+6.5,PDF.negro);doc.setFont('helvetica','bold');doc.setFontSize(8.2);doc.setTextColor(...PDF.negro);pdfText(doc,'Ten en cuenta',x+13,y+7);doc.setFont('helvetica','normal');doc.setFontSize(6.1);doc.setTextColor(...PDF.texto2);doc.text(lines,x+5,y+11.5);return y+h+2;
}

function pdfApprovedOnePageCredit(doc,cfg){
  let y=pdfHeader(doc,cfg.title,cfg.subtitle||'Resultados de tu simulacion de financiacion.');
  y=pdfApprovedContext(doc,y,{label:'Programa academico',value:cfg.program||'Programa',hint:cfg.programHint||'Programa simulado',icon:'program'},{label:cfg.contextLabel||'Periodo financiado',value:cfg.contextValue||'',hint:cfg.contextHint||'',icon:cfg.contextIcon||'calendar'});
  y=pdfApprovedHero(doc,y,{label:cfg.heroLabel,value:cfg.heroValue,meta:cfg.heroMeta,noteTitle:cfg.noteTitle||'Que significa este valor?',note:cfg.note});
  y=pdfApprovedSectionTitle(doc,PDF.M,y,'Resumen financiero');
  y=pdfApprovedMetrics(doc,y,cfg.metrics);
  const gap=6,colW=(PDF.CW-gap)/2,ya=pdfApprovedDetailTable(doc,PDF.M,y,colW,cfg.leftTitle,cfg.leftRows),yb=pdfApprovedDetailTable(doc,PDF.M+colW+gap,y,colW,cfg.rightTitle,cfg.rightRows);
  y=Math.max(ya,yb)+1.5;
  if((cfg.rows||[]).length<=8){
    const leftW=112,rightW=64,xR=PDF.M+leftW+6;
    pdfApprovedPlanCompact(doc,PDF.M,y,leftW,cfg.rows,cfg.totCap,cfg.totInt,cfg.planTitle||'Plan de pagos estimado');
    let yr=pdfApprovedConditionsCompact(doc,xR,y,rightW,cfg.conditions||[]); pdfApprovedNotesCompact(doc,xR,yr,rightW,cfg.notes||[]);
  }else{
    let yr=pdfApprovedConditionsCompact(doc,PDF.M,y,PDF.CW,cfg.conditions||[]); pdfApprovedNotesCompact(doc,PDF.M,yr,PDF.CW,cfg.notes||[]);
    doc.addPage(); let yp=pdfHeader(doc,cfg.planPageTitle||'Plan de pagos',cfg.planPageSubtitle||cfg.title); pdfPlanTable(doc,PDF.M,yp,PDF.CW,cfg.rows,cfg.totCap,cfg.totInt,cfg.planTitle||'Plan de pagos estimado');
  }
}

function expPDF1(){
  const d=SimuladorOFE.state.results.shortTerm;
  if(!d) return toast('Primero realiza el calculo','warning');
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  const tea=((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'%';
  pdfApprovedOnePageCredit(doc,{
    title:'Credito a Corto Plazo', program:d.progNombre||'Programa', contextValue:`${d.n} meses`, contextHint:'Corresponde al periodo seleccionado',
    heroLabel:'Cuota mensual estimada', heroValue:cop(d.cuota), heroMeta:`${d.n} cuotas  |  ${(d.tm*100).toFixed(2)}% M.V.  (${tea} E.A.)`,
    note:'Es el pago mensual estimado del credito una vez efectuado el pago inicial. Incluye capital e intereses, de acuerdo con las condiciones seleccionadas.',
    metrics:[
      {label:'Valor de la matricula',value:cop(d.matNeta||d.mat),hint:'Corresponde al costo total del periodo.',icon:'money'},
      {label:'Pago inicial total',value:cop(d.pagoInicial),hint:'Incluye cuota inicial y Garantisa.',icon:'shield'},
      {label:'Valor financiado',value:cop(d.financiado),hint:'Monto del credito.',icon:'bars'},
      {label:'Total intereses',value:cop(d.totInt),hint:'Corresponde al costo financiero.',icon:'percent'}
    ],
    leftTitle:'Detalle del pago inicial', leftRows:[['Cuota inicial (contado)',cop(d.cuotaInicial)],['Garantisa (4.17% s/financiado)',cop(d.garantisa)],['Total pago inicial',cop(d.pagoInicial),'total']],
    rightTitle:'Detalle del credito', rightRows:[['Capital financiado',cop(d.financiado)],['Total intereses',cop(d.totInt)],['Total del credito',cop(d.totCap+d.totInt),'total']],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,
    conditions:[['Plazo',`${d.n} meses`],['Tasa de interes (M.V.)',(d.tm*100).toFixed(2)+'%'],['Tasa de interes (E.A.)',tea],['Sistema de amortizacion','Cuota fija'],['Tipo de credito','Corto plazo'],['Periodicidad de pago','Mensual']],
    notes:['La tasa de interes aplicada es de '+(d.tm*100).toFixed(2)+'% M.V. ('+tea+' E.A.).','El valor de la matricula incluye el pago inicial, aporte Garantisa, capital e intereses del credito.','Los resultados de esta simulacion son informativos y pueden cambiar segun las condiciones vigentes.']
  });
  pdfPie(doc);
  doc.save(safePDF('Credito Corto Plazo - '+(d.progNombre||'Simulacion'))+'.pdf'); toast('PDF descargado','success');
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
  const tea=((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'%';
  const totCP=d.CP?(d.CP.totCap+d.CP.totInt):0;
  const nPagoLP=(d.LP&&d.LP.nPago)||Math.round((d.nLP||8)*6*1.5);
  let y=pdfHeader(doc,'Credito Corto y Largo Plazo');
  y=pdfApprovedContext(doc,y,{label:'Programa academico',value:d.progNombre||'Programa',hint:'Programa simulado',icon:'program'},{label:'Distribucion financiada',value:`CP ${d.pCP||0}% / LP ${d.pLP||0}%`,hint:'Composicion del escenario',icon:'bars'});
  y=pdfApprovedHero(doc,y,{label:d.CP?'Cuota estimada del corto plazo':'Capital de largo plazo',value:d.CP?cop(d.CP.cuota):cop(d.finLP||0),meta:`${(d.tm*100).toFixed(2)}% M.V.  (${tea} E.A.)`,noteTitle:'Como leer este resultado?',note:'La cuota mostrada corresponde al tramo de corto plazo. El tramo de largo plazo se presenta como capital, porque su tasa y cuota se definen al iniciar la amortizacion.'});
  y=pdfApprovedSectionTitle(doc,PDF.M,y,'Resumen financiero');
  y=pdfApprovedMetrics(doc,y,[
    {label:'Matricula neta',value:cop(d.matNeta||d.mat),hint:'Base financiable.',icon:'money'},
    {label:'Pago inicial total',value:cop(d.pagoInicial),hint:'Contado + Garantisa.',icon:'shield'},
    {label:'Financiacion CP',value:cop(d.finCP||0),hint:d.CP?`${d.nCP||0} cuotas`:'Sin tramo CP',icon:'bars'},
    {label:'Capital LP',value:cop(d.finLP||0),hint:d.LP?`${nPagoLP} meses estimados`:'Sin tramo LP',icon:'percent'}
  ]);
  const gap=6,colW=(PDF.CW-gap)/2,ya=pdfApprovedDetailTable(doc,PDF.M,y,colW,'Detalle del pago inicial',[
    ['Pago de contado',cop(d.cuotaInicial)],d.garCP>0?['Garantisa CP (4.17%)',cop(d.garCP)]:null,d.garLP>0?['Garantisa LP (2.86%)',cop(d.garLP)]:null,['Total pago inicial',cop(d.pagoInicial),'total']
  ]),yb=pdfApprovedDetailTable(doc,PDF.M+colW+gap,y,colW,'Detalle de la financiacion',[
    d.CP?['Total credito CP',cop(totCP)]:null,d.CP?['Intereses CP',cop(d.CP.totInt)]:null,d.LP?['Capital LP',cop(d.finLP)]:null,['Total conocido',cop(d.pagoInicial+totCP+(d.finLP||0)),'total']
  ]);
  y=Math.max(ya,yb)+2;
  const leftW=112,rightW=64,xR=PDF.M+leftW+6;
  if(d.CP && (d.CP.rows||[]).length<=8){
    pdfApprovedPlanCompact(doc,PDF.M,y,leftW,d.CP.rows,d.CP.totCap,d.CP.totInt,'Plan de pagos CP');
    let yr=pdfApprovedConditionsCompact(doc,xR,y,rightW,[['Tasa CP M.V.',(d.tm*100).toFixed(2)+'%'],['Tasa CP E.A.',tea],d.CP?['Plazo CP',`${d.nCP||0} meses`]:null,d.LP?['Plazo LP estimado',`${nPagoLP} meses`]:null,d.LP?['Periodo de gracia','12 meses']:null]);
    pdfApprovedNotesCompact(doc,xR,yr,rightW,['La cuota definitiva del LP depende de la tasa vigente al iniciar amortizacion.','El capital LP no incluye intereses futuros.','La simulacion es informativa.']);
  } else {
    let yr=pdfApprovedConditionsCompact(doc,PDF.M,y,PDF.CW,[['Tasa CP M.V.',(d.tm*100).toFixed(2)+'%'],['Tasa CP E.A.',tea],d.CP?['Plazo CP',`${d.nCP||0} meses`]:null,d.LP?['Plazo LP estimado',`${nPagoLP} meses`]:null,d.LP?['Periodo de gracia','12 meses']:null]);
    pdfApprovedNotesCompact(doc,PDF.M,yr,PDF.CW,['La cuota definitiva del LP depende de la tasa vigente al iniciar amortizacion.','El capital LP no incluye intereses futuros.','La simulacion es informativa.']);
    if(d.CP){doc.addPage();let yp=pdfHeader(doc,'Detalle del tramo de Corto Plazo','Plan de pagos asociado al escenario mixto.');yp=pdfApprovedContext(doc,yp,{label:'Programa academico',value:d.progNombre||'Programa',icon:'program'},{label:'Monto CP',value:cop(d.finCP),hint:`${d.nCP||0} cuotas`,icon:'money'});pdfPlanTable(doc,PDF.M,yp,PDF.CW,d.CP.rows,d.CP.totCap,d.CP.totInt,'Plan de pagos del corto plazo');}
  }
  if(SimuladorOFE.state.results.projectionLP){
    let yp=20;
    if(doc.internal.getNumberOfPages()===1 || d.CP){doc.addPage(); yp=20;}
    pdfProyeccionLP(doc,yp,SimuladorOFE.state.results.projectionLP,'Matricula');
  }
  pdfPie(doc);doc.save(safePDF('Credito Mixto - '+(d.progNombre||'Simulacion'))+'.pdf');toast('PDF descargado','success');
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
  const tea=((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'%';
  pdfApprovedOnePageCredit(doc,{
    title:'Credito Banco Aliado',program:d.progNombre||'Programa',contextLabel:'Periodo financiado',contextValue:`${d.n} meses`,contextHint:'Escenario banco aliado',
    heroLabel:'Cuota mensual estimada',heroValue:cop(d.cuota),heroMeta:`${d.n} cuotas  |  ${(d.tm*100).toFixed(2)}% M.V.  (${tea} E.A.)`,
    note:'Es la cuota mensual estimada con las condiciones configuradas para el banco aliado. Los cargos iniciales, cuando existan, se presentan por separado.',
    metrics:[
      {label:'Valor de la matricula',value:cop(d.matNeta||d.mat),hint:'Base del periodo.',icon:'money'},
      {label:'Pago inicial total',value:cop(d.pagoInicial),hint:d.cargos>0?'Incluye otros cargos.':'Pago de contado.',icon:'shield'},
      {label:'Valor financiado',value:cop(d.financiado),hint:'Monto del credito.',icon:'bars'},
      {label:'Total intereses',value:cop(d.totInt),hint:'Costo financiero.',icon:'percent'}
    ],
    leftTitle:'Detalle del pago inicial',leftRows:[['Cuota inicial (contado)',cop(d.cuotaInicial)],d.cargos>0?['Otros cargos',cop(d.cargos)]:null,['Total pago inicial',cop(d.pagoInicial),'total']],
    rightTitle:'Detalle del credito',rightRows:[['Capital financiado',cop(d.financiado)],['Total intereses',cop(d.totInt)],['Total del credito',cop(d.totCap+d.totInt),'total']],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,
    conditions:[['Plazo',`${d.n} meses`],['Tasa de interes (M.V.)',(d.tm*100).toFixed(2)+'%'],['Tasa de interes (E.A.)',tea],['Sistema de amortizacion','Cuota fija'],['Tipo de credito','Banco aliado'],['Periodicidad de pago','Mensual']],
    notes:['Los cargos del banco, cuando existan, se reflejan en el pago inicial.','La simulacion es informativa y puede cambiar segun las condiciones vigentes.','Verifica la informacion antes de formalizar el credito.']
  });
  pdfPie(doc);doc.save(safePDF('Credito Banco Aliado - '+(d.progNombre||'Simulacion'))+'.pdf');toast('PDF descargado','success');
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
