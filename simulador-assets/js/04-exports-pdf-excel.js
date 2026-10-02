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
  carbon:  [38, 50, 58],
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

const PDF_UNINORTE_LOGO = ''; // PDFs v5 no usan logotipo institucional.

function pdfPremiumCodePrefix(type=''){
  return /Corto Plazo/i.test(type)?'CP':/Banco/i.test(type)?'BA':/Mixto|Corto y Largo/i.test(type)?'MX':/Idiomas/i.test(type)?'ID':/Cuota Inicial/i.test(type)?'CI':/Reestruct/i.test(type)?'RC':/Combinado/i.test(type)?'CB':'SIM';
}

function pdfPremiumHeader(doc,cfg={}){
  const P=PDF, meta=pdfGeneratedMeta();
  const code=cfg.code||`${pdfPremiumCodePrefix(cfg.type||cfg.modality||'')}-${meta.stamp}`;
  // Marca principal oficial del Brandbook.
  try{ doc.addImage(PDF_UNINORTE_LOGO,'PNG',P.M,8.5,54,16.7,undefined,'FAST'); }catch(_e){}
  // Geometría institucional superior derecha, sin slogans.
  doc.setFillColor(...P.rojo); doc.rect(165,0,45,24,'F');
  doc.setFillColor(...P.rojoOsc); doc.triangle(190,0,210,0,210,24,'F');
  doc.setFillColor(255,255,255); doc.triangle(143,0,165,0,165,20,'F');
  doc.setDrawColor(...P.dorado); doc.setLineWidth(.45); doc.line(139,0,157,18); doc.line(157,18,165,18); doc.setLineWidth(.2);
  doc.setDrawColor(132,10,16); doc.setLineWidth(.18);
  for(let x=175;x<=205;x+=7) doc.line(x,5,x,20);
  doc.line(171,19,208,7); doc.line(171,14,208,2); doc.setLineWidth(.2);

  doc.setFont('helvetica','normal'); doc.setFontSize(12.6); doc.setTextColor(...P.texto2);
  pdfText(doc,'Simulacion de',P.M,34.2);
  doc.setFont('times','bold'); doc.setFontSize(25.5); doc.setTextColor(...P.negro);
  pdfText(doc,'Credito',P.M,46.4);
  const cw=doc.getTextWidth('Credito ');
  doc.setTextColor(...P.rojo); pdfText(doc,'Educativo',P.M+cw,46.4);
  doc.setFillColor(...P.dorado); doc.rect(P.M,50.7,13,1.15,'F');

  const y=57.2, h=18.5;
  doc.setDrawColor(...P.linea); doc.line(P.M,y+h,P.W-P.M,y+h);
  const cols=[55,30,47,50], labels=['Programa academico','Nivel','Fecha de simulacion','Codigo de simulacion'];
  const vals=[cfg.program||'Programa',cfg.level||'Pregrado',meta.fechaLarga,code];
  let x=P.M;
  cols.forEach((w,i)=>{
    if(i>0){doc.setDrawColor(205,209,214);doc.line(x,y+2,x,y+h-2);}
    doc.setFont('helvetica','normal');doc.setFontSize(6.5);doc.setTextColor(...P.texto3);pdfText(doc,labels[i],x+(i?6:0),y+5.1);
    doc.setFont('helvetica','bold');doc.setFontSize(7.7);doc.setTextColor(...P.negro);
    const lines=doc.splitTextToSize(safePDF(String(vals[i]||'')),w-(i?10:5));
    doc.text(lines,x+(i?6:0),y+11.2,{lineHeightFactor:1.08});
    x+=w;
  });
  doc.setTextColor(0,0,0);doc.setFont('helvetica','normal');doc.setFontSize(10);
  return y+h+4.2;
}

function pdfPremiumSectionTitle(doc,y,title,subtitle=''){
  doc.setFont('times','bold'); doc.setFontSize(11.8); doc.setTextColor(...PDF.negro); pdfText(doc,title,PDF.M,y+6.4);
  if(subtitle){doc.setFont('helvetica','normal');doc.setFontSize(7.2);doc.setTextColor(...PDF.texto3);pdfText(doc,subtitle,PDF.M+doc.getTextWidth(safePDF(title))+3,y+6.4);}
  doc.setFillColor(...PDF.rojo); doc.rect(PDF.M,y+8.8,12,1.15,'F');
  return y+12.5;
}

function pdfPremiumHero(doc,y,cfg={}){
  const P=PDF,leftW=100,rightW=P.CW-leftW,h=39.8;
  doc.setFillColor(...P.rojo); doc.roundedRect(P.M,y,leftW,h,2.2,2.2,'F');
  // Patron arquitectónico abstracto dentro del bloque rojo.
  doc.setDrawColor(118,7,13);doc.setLineWidth(.18);
  for(let i=0;i<7;i++){const xx=P.M+66+i*4;doc.line(xx,y+7,xx,y+35);}
  doc.line(P.M+63,y+35,P.M+95,y+7);doc.line(P.M+70,y+39,P.M+100,y+11);doc.setLineWidth(.2);
  doc.setFont('times','normal');doc.setFontSize(11.2);doc.setTextColor(255,255,255);pdfText(doc,cfg.label||'Cuota mensual estimada',P.M+7,y+12.5);
  doc.setFont('times','bold');doc.setFontSize(cfg.valueSize||27);pdfText(doc,cfg.value||'',P.M+7,y+27.3);
  if(cfg.meta){doc.setFillColor(...P.dorado);doc.rect(P.M+7,y+33.2,12,1.05,'F');doc.setFont('helvetica','normal');doc.setFontSize(6.8);doc.setTextColor(255,255,255);pdfText(doc,cfg.meta,P.M+22,y+34.1);}

  const xr=P.M+leftW, innerX=xr+6.5, valueX=P.W-P.M-5.5, rows=(cfg.side||[]).filter(Boolean).slice(0,3), rowH=h/3;
  doc.setFillColor(248,248,249);doc.roundedRect(xr,y,rightW,h,2.2,2.2,'F');
  rows.forEach((r,i)=>{
    const yy=y+i*rowH;
    if(i===rows.length-1 && r.highlight){doc.setFillColor(...P.rojoS);doc.rect(xr+3,yy+1.5,rightW-6,rowH-3,'F');}
    if(i>0){doc.setDrawColor(...P.linea);doc.line(xr+6,yy,xr+rightW-6,yy);}
    doc.setFont('helvetica',r.highlight?'bold':'normal');doc.setFontSize(7.4);doc.setTextColor(...(r.highlight?P.negro:P.texto2));pdfText(doc,r.label,innerX,yy+8.4);
    doc.setFont('helvetica','bold');doc.setFontSize(r.highlight?10.3:9.2);doc.setTextColor(...P.negro);pdfText(doc,r.value,valueX,yy+8.6,{align:'right'});
  });
  return y+h+4.5;
}

function pdfPremiumSummary(doc,y,items,title='Resumen de tu financiacion'){
  y=pdfPremiumSectionTitle(doc,y,title);
  const clean=(items||[]).filter(Boolean).slice(0,4), gap=3.2, w=(PDF.CW-gap*(clean.length-1))/clean.length, h=22.8;
  clean.forEach((it,i)=>{
    const x=PDF.M+i*(w+gap);
    doc.setFillColor(248,249,250);doc.setDrawColor(235,236,239);doc.roundedRect(x,y,w,h,1.8,1.8,'FD');
    if(i===0){doc.setFillColor(...PDF.dorado);doc.rect(x+1.2,y+5,0.8,h-10,'F');}
    doc.setFont('helvetica','normal');doc.setFontSize(6.6);doc.setTextColor(...PDF.texto2);pdfText(doc,it.label,x+5,y+6.5);
    doc.setFont('helvetica','bold');doc.setFontSize(it.valueSize||10.8);doc.setTextColor(...PDF.negro);pdfText(doc,it.value,x+5,y+13.8);
    if(it.hint){doc.setFont('helvetica','normal');doc.setFontSize(6.0);doc.setTextColor(...PDF.texto3);const lines=doc.splitTextToSize(safePDF(it.hint),w-10);doc.text(lines,x+5,y+18.8,{lineHeightFactor:1.06});}
  });
  return y+h+4.2;
}

function pdfPremiumConditions(doc,y,leftRows,rightRows,title='Condiciones del credito'){
  y=pdfPremiumSectionTitle(doc,y,title);
  const gap=5, w=(PDF.CW-gap)/2, rowsL=(leftRows||[]).filter(Boolean), rowsR=(rightRows||[]).filter(Boolean), rowH=7.4;
  const n=Math.max(rowsL.length,rowsR.length), h=n*rowH;
  const draw=(x,rows)=>{
    rows.forEach((r,i)=>{
      const yy=y+i*rowH;
      if(i%2===0){doc.setFillColor(250,250,251);doc.rect(x,yy,w,rowH,'F');}
      doc.setDrawColor(...PDF.linea);doc.line(x,yy+rowH,x+w,yy+rowH);
      const split=x+w*.46;doc.line(split,yy,split,yy+rowH);
      doc.setFont('helvetica','normal');doc.setFontSize(6.75);doc.setTextColor(...PDF.texto2);pdfText(doc,r[0],x+4,yy+4.65);
      doc.setFont('helvetica','bold');doc.setFontSize(6.55);doc.setTextColor(...PDF.negro);const vv=doc.splitTextToSize(safePDF(String(r[1])),w*.50);doc.text(vv,split+4,yy+3.55,{lineHeightFactor:1.0});
    });
  };
  draw(PDF.M,rowsL);draw(PDF.M+w+gap,rowsR);
  return y+h+4.2;
}

function pdfPremiumDateForInstallment(index){
  const now=new Date();const day=now.getDate();const d=new Date(now.getFullYear(),now.getMonth()+index,1);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function pdfPremiumPlan(doc,y,rows,totCap,totInt,title='Tabla de amortizacion',maxRows=8){
  const all=rows||[], shown=all.slice(0,maxRows), subtitle=all.length>maxRows?`(primeras ${maxRows} cuotas)`:'';
  y=pdfPremiumSectionTitle(doc,y,title,subtitle);
  const cols=[
    {t:'No.',w:12,a:'center'},{t:'Fecha de pago',w:31,a:'center'},{t:'Cuota',w:35,a:'right'},{t:'Intereses',w:32,a:'right'},{t:'Abono a capital',w:37,a:'right'},{t:'Saldo',w:35,a:'right'}
  ];
  const x0=PDF.M, headerH=7.2,rowH=5.7, xAt=i=>x0+cols.slice(0,i).reduce((s,c)=>s+c.w,0);
  doc.setFillColor(...PDF.rojo);doc.rect(x0,y,PDF.CW,headerH,'F');doc.setFont('helvetica','bold');doc.setFontSize(6.25);doc.setTextColor(255,255,255);
  cols.forEach((c,i)=>{const xx=xAt(i);pdfText(doc,c.t,c.a==='center'?xx+c.w/2:xx+c.w-3.5,y+4.75,{align:c.a});if(i>0){doc.setDrawColor(196,66,72);doc.line(xx,y,xx,y+headerH);}});
  y+=headerH;
  shown.forEach((r,idx)=>{
    if(idx%2){doc.setFillColor(250,250,251);doc.rect(x0,y,PDF.CW,rowH,'F');}
    const vals=[r.i,pdfPremiumDateForInstallment(idx+1),cop(r.cuota),cop(r.interes),cop(r.capital),cop(r.saldo)];
    doc.setFont('helvetica','normal');doc.setFontSize(6.35);doc.setTextColor(...PDF.texto2);
    cols.forEach((c,i)=>{const xx=xAt(i);pdfText(doc,String(vals[i]),c.a==='center'?xx+c.w/2:xx+c.w-3.5,y+3.95,{align:c.a});doc.setDrawColor(...PDF.linea);doc.line(xx,y,xx,y+rowH);});
    doc.line(x0+PDF.CW,y,x0+PDF.CW,y+rowH);doc.line(x0,y+rowH,x0+PDF.CW,y+rowH);y+=rowH;
  });
  return y+3.4;
}

function pdfPremiumInfo(doc,y,text){
  const h=10.5;doc.setFillColor(247,248,249);doc.setDrawColor(236,237,240);doc.roundedRect(PDF.M,y,PDF.CW,h,2,2,'FD');
  pdfApprovedIcon(doc,'info',PDF.M+6.6,y+h/2,PDF.carbon,.55);
  doc.setFont('helvetica','normal');doc.setFontSize(6.25);doc.setTextColor(...PDF.texto2);const lines=doc.splitTextToSize(safePDF(text||''),PDF.CW-20);doc.text(lines,PDF.M+13,y+4.5,{lineHeightFactor:1.06});
  return y+h+2;
}

function pdfPremiumFullPlanPage(doc,cfg){
  doc.addPage(); let y=pdfPremiumHeader(doc,{program:cfg.program,level:cfg.level,type:cfg.type});
  y=pdfPremiumSectionTitle(doc,y,'Plan de pagos completo');
  // tabla extendida con el formato existente cuando excede 8 cuotas.
  pdfPlanTable(doc,PDF.M,y,PDF.CW,cfg.rows,cfg.totCap,cfg.totInt,'Plan de pagos completo');
}

function pdfPremiumCreditReport(doc,cfg){
  let y=pdfPremiumHeader(doc,{program:cfg.program,level:cfg.level,type:cfg.type});
  y=pdfPremiumHero(doc,y,{label:cfg.heroLabel,value:cfg.heroValue,meta:cfg.heroMeta,side:cfg.heroSide});
  y=pdfPremiumSummary(doc,y,cfg.summary||[],'Resumen de tu financiacion');
  y=pdfPremiumConditions(doc,y,cfg.conditionsLeft||[],cfg.conditionsRight||[],'Condiciones del credito');
  y=pdfPremiumPlan(doc,y,cfg.rows||[],cfg.totCap||0,cfg.totInt||0,cfg.planTitle||'Tabla de amortizacion',Math.min(cfg.firstPageRows||5,5));
  y=pdfPremiumInfo(doc,y,cfg.note||'Esta simulacion es informativa y puede variar segun las condiciones vigentes al momento de la formalizacion del credito.');
}

function pdfGeneratedMeta(){
  const d = new Date();
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2,'0');
  const min = String(d.getMinutes()).padStart(2,'0');
  return {
    fecha: `${dd}/${mm}/${yyyy}`,
    fechaLarga: `${d.getDate()} de ${meses[d.getMonth()]} de ${yyyy}`,
    hora: d.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}),
    stamp: `${yyyy}${mm}${dd}-${hh}${min}`
  };
}

function pdfHeader(doc, titulo, subtitulo = 'Resultados de tu simulacion de financiacion.') {
  const P = PDF;
  const meta = pdfGeneratedMeta();
  const codePrefix = /Corto Plazo/i.test(titulo) ? 'CP' : /Banco/i.test(titulo) ? 'BA' : /Mixto|Corto y Largo/i.test(titulo) ? 'MX' : /Idiomas/i.test(titulo) ? 'ID' : /Cuota Inicial/i.test(titulo) ? 'CI' : /Reestructuracion/i.test(titulo) ? 'RC' : 'SIM';

  doc.setFillColor(...P.suave2); doc.triangle(175,0,210,0,210,12.8,'F');
  doc.setFillColor(...P.rojo); doc.triangle(192,0,210,0,210,8.2,'F');
  doc.setFillColor(...P.doradoS); doc.triangle(201.5,8.2,210,8.2,210,14.6,'F');

  doc.setFillColor(...P.rojo); doc.rect(P.M, 8.5, 12, 1.35, 'F');
  doc.setFont('helvetica','normal'); doc.setFontSize(7.85); doc.setTextColor(...P.texto2);
  doc.text('SIMULACION DE CREDITO EDUCATIVO', P.M, 17.3);
  doc.setFont('helvetica','bold'); doc.setFontSize(19.2); doc.setTextColor(...P.negro);
  pdfText(doc, titulo, P.M, 27.7);
  doc.setFont('helvetica','normal'); doc.setFontSize(9.35); doc.setTextColor(...P.texto2);
  pdfText(doc, subtitulo, P.M, 35.6);

  const x=128.2, y=10.7, w=67.8, h=26.0, split=x+34.2;
  doc.setFillColor(248,249,251); doc.setDrawColor(216,220,225); doc.roundedRect(x,y,w,h,2.5,2.5,'FD');
  doc.setDrawColor(222,225,229); doc.line(split,y+4.0,split,y+h-4.0);
  const rowH=h/3;
  for(let r=1;r<3;r++) doc.line(x+5,y+rowH*r,x+w-5,y+rowH*r);
  const baselines=[y+6.15,y+14.75,y+23.35];
  const labels=['Fecha de simulacion','Hora','Codigo de simulacion'];
  const values=[meta.fechaLarga,meta.hora,`${codePrefix}-${meta.stamp}`];
  labels.forEach((label,i)=>{
    doc.setFont('helvetica','normal'); doc.setFontSize(6.15); doc.setTextColor(...P.texto3);
    pdfText(doc,label,x+5,baselines[i]);
    doc.setFont('helvetica','bold'); doc.setFontSize(6.3); doc.setTextColor(...P.texto2);
    pdfText(doc,values[i],x+w-5,baselines[i],{align:'right'});
  });
  doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0); doc.setFontSize(10);
  return 41.2;
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
  return y+h+4;
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

  pdfApprovedIcon(doc,'circle-help',P.M+leftW+gap+9,y+11,P.rojoOsc,.62);
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
  return y+h+4;
}

function pdfDetailTable(doc,x,y,w,title,rows,opts={}){
  const headerH=7,rowH=7;
  const clean=(rows||[]).filter(Boolean);
  y=pdfSectionTitle(doc,x,y,w,title,opts.subtitle||'');
  y=pdfEnsureSpace(doc,y,headerH+clean.length*rowH+5);
  doc.setFillColor(...PDF.negro); doc.rect(x,y,w,headerH,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(7.8); doc.setTextColor(255,255,255);
  pdfText(doc,'Concepto',x+w*.31,y+4.8,{align:'center'}); pdfText(doc,'Valor',x+w*.81,y+4.8,{align:'center'});
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
  return y+h+3;
}

function pdfNoteBox(doc,x,y,w,title,bullets){
  const lines=[]; (bullets||[]).forEach(b=>{ const arr=doc.splitTextToSize(safePDF(b),w-14); if(arr.length){ lines.push('- '+arr[0]); lines.push(...arr.slice(1).map(s=>'  '+s)); }});
  const h=13+lines.length*4;
  y=pdfEnsureSpace(doc,y,h+3);
  doc.setFillColor(...PDF.suave); doc.setDrawColor(...PDF.linea); doc.roundedRect(x,y,w,h,2.3,2.3,'FD');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...PDF.negro); pdfText(doc,title,x+5,y+7);
  doc.setFont('helvetica','normal'); doc.setFontSize(7.3); doc.setTextColor(...PDF.texto2); doc.text(lines,x+5,y+13);
  return y+h+3;
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
    cols.forEach((c,i)=>{ const xx=xAt(i)+c.w/2; doc.text(c.t,xx,y+4.7,{align:'center'}); });
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
    doc.setPage(i); const h=doc.internal.pageSize.getHeight(), w=doc.internal.pageSize.getWidth();
    doc.setDrawColor(...P.dorado);doc.setLineWidth(.35);doc.line(P.M,h-13.2,w-P.M-23,h-13.2);doc.setLineWidth(.2);
    doc.setFillColor(...P.rojo);doc.triangle(w-48,h-13.2,w-25,h-13.2,w-31,h-6.5,'F');doc.setFillColor(...P.rojoOsc);doc.triangle(w-25,h-13.2,w-P.M,h-13.2,w-P.M,h-5.5,'F');
    doc.setFont('helvetica','normal');doc.setFontSize(6.2);doc.setTextColor(...P.texto3);pdfText(doc,'www.uninorte.edu.co',P.M,h-7.5);
    const pageX=w-P.M;pdfText(doc,'Pag. '+i+' de '+n,pageX,h-7.5,{align:'right'});
    pdfText(doc,'Generado el '+meta.fechaLarga+' - '+meta.hora,pageX-26,h-7.5,{align:'right'});
  }
  doc.setTextColor(0,0,0);
}


function pdfApprovedIcon(doc, type, cx, cy, color=PDF.rojo, size=1){
  // Geometría basada en los iconos Lucide usados por la interfaz (viewBox 0 0 24 24).
  // Se dibuja con primitivas jsPDF para mantener nitidez vectorial en el PDF.
  const aliases={program:'graduation-cap',money:'banknote',bars:'bar-chart'};
  const name=aliases[type]||type;
  const u=(7.2*size)/24;
  const X=n=>cx+(n-12)*u, Y=n=>cy+(n-12)*u;
  const line=(x1,y1,x2,y2)=>doc.line(X(x1),Y(y1),X(x2),Y(y2));
  const circle=(x,y,r,fill=false)=>doc.circle(X(x),Y(y),r*u,fill?'F':'S');
  const rect=(x,y,w,h,r=0)=> r?doc.roundedRect(X(x),Y(y),w*u,h*u,r*u,r*u,'S'):doc.rect(X(x),Y(y),w*u,h*u,'S');
  const poly=pts=>{ for(let i=0;i<pts.length-1;i++) line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]); };
  doc.setDrawColor(...color); doc.setTextColor(...color); doc.setLineWidth(Math.max(.34,.48*size));

  if(name==='graduation-cap'){
    poly([[22,10],[12,5],[2,10],[12,15],[22,10]]);
    line(22,10,22,16);
    poly([[6,12],[6,17],[8,19],[12,20],[16,19],[18,17],[18,12]]);
  }else if(name==='calendar'){
    rect(3,4,18,18,2); line(3,10,21,10); line(8,2,8,6); line(16,2,16,6);
  }else if(name==='banknote'){
    rect(2,6,20,12,2); circle(12,12,2); circle(6,12,.18,true); circle(18,12,.18,true);
  }else if(name==='wallet'){
    rect(3,5,18,16,2); line(3,8,21,8); rect(15,11,7,5,1.2); circle(18,13.5,.22,true);
  }else if(name==='credit-card'){
    rect(2,5,20,14,2); line(2,10,22,10); line(6,15,10,15);
  }else if(name==='shield'){
    poly([[12,2],[18.2,4.8],[20,6],[20,13],[19,16],[16.8,18.8],[12,22],[7.2,18.8],[5,16],[4,13],[4,6],[5.8,4.8],[12,2]]);
  }else if(name==='shield-check'){
    poly([[12,2],[18.2,4.8],[20,6],[20,13],[19,16],[16.8,18.8],[12,22],[7.2,18.8],[5,16],[4,13],[4,6],[5.8,4.8],[12,2]]);
    poly([[8.7,12.1],[11.1,14.4],[15.7,9.6]]);
  }else if(name==='bar-chart'){
    line(6,20,6,16); line(12,20,12,10); line(18,20,18,4);
  }else if(name==='trending-up'){
    poly([[2,17],[8.5,10.5],[13.5,15.5],[22,7]]); poly([[16,7],[22,7],[22,13]]);
  }else if(name==='percent'){
    line(19,5,5,19); circle(6.5,6.5,2.5); circle(17.5,17.5,2.5);
  }else if(name==='info'){
    circle(12,12,10); line(12,11,12,16); circle(12,7.5,.25,true);
  }else if(name==='circle-help'){
    circle(12,12,10);
    // Lucide CircleHelp: upper question curve + stem + dot
    poly([[9.5,9.2],[9.8,7.8],[10.9,6.8],[12.4,6.5],[13.9,6.9],[14.8,7.9],[14.9,9.1],[14.4,10.1],[13.4,10.8],[12.6,11.4],[12.2,12.4],[12.2,13.1]]);
    circle(12.2,16.8,.28,true);
  }else if(name==='circle-alert'){
    circle(12,12,10); line(12,7.2,12,13.5); circle(12,17,.28,true);
  }else if(name==='file-text' || name==='document'){
    rect(4,2,16,20,2); line(14,2,14,7); line(14,7,20,7); line(8,13,16,13); line(8,17,16,17);
  }else if(name==='calculator'){
    rect(4,2,16,20,2); line(8,6,16,6); circle(8,11,.2,true);circle(12,11,.2,true);circle(16,11,.2,true);circle(8,15,.2,true);circle(12,15,.2,true);circle(16,15,.2,true);circle(8,19,.2,true);circle(12,19,.2,true);
  }else{
    circle(12,12,8);
  }
  doc.setLineWidth(.2); doc.setTextColor(0,0,0);
}

function pdfApprovedContext(doc,y,left,right){
  const P=PDF,h=27.8,w=P.CW/2;
  doc.setFillColor(250,250,251); doc.setDrawColor(218,221,226); doc.roundedRect(P.M,y,P.CW,h,2.4,2.4,'FD');
  doc.setDrawColor(205,209,215); doc.line(P.M+w,y+4.5,P.M+w,y+h-4.5);
  const draw=(x,obj)=>{
    const iconX=x+11.6, iconY=y+13.9;
    doc.setFillColor(...P.rojoS); doc.circle(iconX,iconY,5.15,'F');
    pdfApprovedIcon(doc,obj.icon||'graduation-cap',iconX,iconY,P.rojoOsc,.80);
    const tx=x+22.8;
    doc.setFont('helvetica','bold'); doc.setFontSize(6.55); doc.setTextColor(...P.texto3);
    pdfText(doc,(obj.label||'').toUpperCase(),tx,y+6.8);
    doc.setFont('helvetica','bold'); doc.setFontSize(10.15); doc.setTextColor(...P.negro);
    const valueLines=doc.splitTextToSize(safePDF(obj.value||''),w-30); doc.text(valueLines,tx,y+14.2,{lineHeightFactor:1.12});
    if(obj.hint){
      doc.setFont('helvetica','normal'); doc.setFontSize(6.65); doc.setTextColor(...P.texto2);
      const hints=doc.splitTextToSize(safePDF(obj.hint),w-30); doc.text(hints,tx,y+21.6,{lineHeightFactor:1.20});
    }
  };
  draw(P.M,left||{}); draw(P.M+w,right||{});
  doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');
  return y+h+3.2;
}

function pdfApprovedHero(doc,y,cfg){
  const P=PDF,leftW=98,rightW=P.CW-leftW,h=39.2;
  doc.setFillColor(...P.rojo); doc.roundedRect(P.M,y,leftW,h,2.4,2.4,'F');
  doc.setFillColor(...P.rojoS); doc.roundedRect(P.M+leftW,y,rightW,h,2.4,2.4,'F');
  doc.setFillColor(...P.rojoOsc); doc.triangle(P.M+leftW-11.5,y,P.M+leftW,y,P.M+leftW,y+11.5,'F');
  doc.setDrawColor(184,188,194); doc.line(P.M+leftW+4.2,y+7.0,P.M+leftW+4.2,y+h-7.0);

  doc.setFont('helvetica','bold');doc.setFontSize(8.15);doc.setTextColor(255,255,255);pdfText(doc,(cfg.label||'').toUpperCase(),P.M+8,y+9.1);
  doc.setFont('helvetica','bold');doc.setFontSize(24.5);pdfText(doc,cfg.value||'',P.M+8,y+25.0);
  doc.setFont('helvetica','normal');doc.setFontSize(8.1);pdfText(doc,cfg.meta||'',P.M+8,y+34.0);

  const noteX=P.M+leftW+12.4, iconY=y+10.5;
  pdfApprovedIcon(doc,'circle-help',noteX,iconY,P.rojoOsc,.64);
  doc.setFont('helvetica','bold');doc.setFontSize(8.35);doc.setTextColor(...P.rojoOsc);pdfText(doc,cfg.noteTitle||'Que significa este valor?',noteX+5.9,y+11.1);
  doc.setFont('helvetica','normal');doc.setFontSize(7.45);doc.setTextColor(...P.texto2);
  const lines=doc.splitTextToSize(safePDF(cfg.note||''),rightW-22);doc.text(lines,noteX+5.9,y+18.4,{lineHeightFactor:1.24});
  return y+h+4.2;
}

function pdfApprovedSectionTitle(doc,x,y,title){
  doc.setFillColor(...PDF.rojo);doc.rect(x,y,8,1.4,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(10.4);doc.setTextColor(...PDF.negro);pdfText(doc,title,x,y+7.0);
  return y+8.8;
}

function pdfApprovedMetrics(doc,y,items){
  const P=PDF,gap=4,w=(P.CW-gap*3)/4,h=31.2;
  items.forEach((it,i)=>{
    const x=P.M+i*(w+gap);
    doc.setFillColor(249,250,251); doc.setDrawColor(231,234,238); doc.roundedRect(x,y,w,h,2.2,2.2,'FD');
    const iconColor=it.iconColor||((i===1)?P.rojo:P.carbon);
    pdfApprovedIcon(doc,it.icon||'banknote',x+7.5,y+8.25,iconColor,.72);
    doc.setFont('helvetica','normal');doc.setFontSize(6.55);doc.setTextColor(...P.texto2);
    const labelLines=doc.splitTextToSize(safePDF(it.label||''),w-20);
    doc.text(labelLines,x+13.8,y+8.85,{lineHeightFactor:1.05});
    doc.setFont('helvetica','bold');doc.setFontSize(11.95);doc.setTextColor(...P.negro);
    pdfText(doc,it.value,x+5,y+19.2);
    if(it.hint){
      doc.setFont('helvetica','normal');doc.setFontSize(6.05);doc.setTextColor(...P.texto3);
      const lines=doc.splitTextToSize(safePDF(it.hint),w-10);doc.text(lines,x+5,y+25.4,{lineHeightFactor:1.12});
    }
  });
  return y+h+4.0;
}

function pdfApprovedDetailTable(doc,x,y,w,title,rows){
  y=pdfApprovedSectionTitle(doc,x,y,title);
  const clean=(rows||[]).filter(Boolean),headerH=7.7,rowH=6.7;
  doc.setFillColor(...PDF.carbon);doc.rect(x,y,w,headerH,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(7.15);doc.setTextColor(255,255,255);
  pdfText(doc,'Concepto',x+(w*.62)/2,y+5.0,{align:'center'});
  pdfText(doc,'Valor',x+w*.62+(w*.38)/2,y+5.0,{align:'center'});
  doc.setDrawColor(108,116,124);doc.line(x+w*.62,y,x+w*.62,y+headerH);y+=headerH;
  clean.forEach((r,idx)=>{
    const total=r[2]==='total'; if(total){doc.setFillColor(...PDF.suave2);doc.rect(x,y,w,rowH,'F');} else if(idx%2){doc.setFillColor(250,250,251);doc.rect(x,y,w,rowH,'F');}
    doc.setDrawColor(...PDF.linea);doc.line(x,y+rowH,x+w,y+rowH);doc.line(x+w*.62,y,x+w*.62,y+rowH);
    doc.setFont('helvetica',total?'bold':'normal');doc.setFontSize(7.05);doc.setTextColor(...(total?PDF.negro:PDF.texto2));pdfText(doc,r[0],x+5,y+4.55);
    doc.setFont('helvetica','bold');doc.setTextColor(...PDF.negro);pdfText(doc,String(r[1]),x+w-5,y+4.55,{align:'right'});y+=rowH;
  });
  return y+2.2;
}

function pdfApprovedDateForInstallment(index){
  const now=new Date(); const day=now.getDate(); const d=new Date(now.getFullYear(),now.getMonth()+index,1); const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(); d.setDate(Math.min(day,last));
  const dd=String(d.getDate()).padStart(2,'0'),mm=String(d.getMonth()+1).padStart(2,'0'); return `${dd}/${mm}/${d.getFullYear()}`;
}

function pdfApprovedPlanCompact(doc,x,y,w,rows,totCap,totInt,title='Plan de pagos estimado'){
  y=pdfApprovedSectionTitle(doc,x,y,title);
  const cols=[
    {t:'Cuota',w:w*.115,a:'center'},
    {t:'Fecha estimada',w:w*.225,a:'center'},
    {t:'Capital',w:w*.225,a:'right'},
    {t:'Intereses',w:w*.19,a:'right'},
    {t:'Valor cuota',w:w*.245,a:'right'}
  ];
  const xAt=i=>x+cols.slice(0,i).reduce((s,c)=>s+c.w,0); const headerH=7.7,rowH=6.3;
  doc.setFillColor(...PDF.carbon);doc.rect(x,y,w,headerH,'F');doc.setFont('helvetica','bold');doc.setFontSize(6.25);doc.setTextColor(255,255,255);
  cols.forEach((c,i)=>{const xx=xAt(i)+c.w/2;doc.text(c.t,xx,y+5.0,{align:'center'});});
  for(let i=1;i<cols.length;i++){doc.setDrawColor(105,114,122);doc.line(xAt(i),y,xAt(i),y+headerH);} y+=headerH;
  (rows||[]).forEach((r,idx)=>{
    if(idx%2){doc.setFillColor(250,250,251);doc.rect(x,y,w,rowH,'F');}
    doc.setDrawColor(...PDF.linea);doc.line(x,y+rowH,x+w,y+rowH);
    doc.setFont('helvetica','normal');doc.setFontSize(6.3);doc.setTextColor(...PDF.texto2);
    const vals=[String(r.i),pdfApprovedDateForInstallment(r.i),cop(r.capital),cop(r.interes),cop(r.cuota)];
    cols.forEach((c,i)=>{const xx=c.a==='right'?xAt(i)+c.w-2.5:c.a==='center'?xAt(i)+c.w/2:xAt(i)+2.5;pdfText(doc,vals[i],xx,y+4.35,{align:c.a});}); y+=rowH;
  });
  doc.setFillColor(...PDF.suave2);doc.rect(x,y,w,7.4,'F');doc.setFont('helvetica','bold');doc.setFontSize(6.55);doc.setTextColor(...PDF.negro);
  pdfText(doc,'Total',x+3,y+4.95);pdfText(doc,cop(totCap),xAt(3)-2.5,y+4.95,{align:'right'});pdfText(doc,cop(totInt),xAt(4)-2.5,y+4.95,{align:'right'});pdfText(doc,cop((totCap||0)+(totInt||0)),x+w-2.5,y+4.95,{align:'right'});
  return y+9.0;
}

function pdfApprovedConditionsCompact(doc,x,y,w,rows){
  const clean=(rows||[]).filter(Boolean),rowH=5.55,h=10.6+clean.length*rowH;
  doc.setFillColor(249,250,251);doc.setDrawColor(...PDF.linea);doc.roundedRect(x,y,w,h,2.0,2.0,'FD');
  doc.setFont('helvetica','bold');doc.setFontSize(8.2);doc.setTextColor(...PDF.negro);pdfText(doc,'Condiciones del credito',x+5,y+6.7);let yy=y+11.7;
  clean.forEach(([k,v],idx)=>{
    doc.setFont('helvetica','normal');doc.setFontSize(6.1);doc.setTextColor(...PDF.texto3);pdfText(doc,k,x+5,yy);
    doc.setFont('helvetica','bold');doc.setFontSize(6.45);doc.setTextColor(...PDF.texto2);pdfText(doc,String(v),x+w-5,yy,{align:'right'});
    if(idx<clean.length-1){doc.setDrawColor(228,231,235);doc.line(x+5,yy+1.9,x+w-5,yy+1.9);} yy+=rowH;
  });
  return y+h+3;
}

function pdfApprovedNotesCompact(doc,x,y,w,bullets){
  const wrapped=(bullets||[]).map(b=>doc.splitTextToSize(safePDF(b),w-18.5));
  const lineCount=wrapped.reduce((s,a)=>s+a.length,0);
  const h=Math.max(30.8,13.0 + lineCount*2.95 + wrapped.length*1.2);
  doc.setFillColor(249,250,251);doc.setDrawColor(...PDF.linea);doc.roundedRect(x,y,w,h,2.0,2.0,'FD');
  pdfApprovedIcon(doc,'circle-alert',x+6.1,y+6.9,PDF.carbon,.56);
  doc.setFont('helvetica','bold');doc.setFontSize(7.95);doc.setTextColor(...PDF.negro);pdfText(doc,'Ten en cuenta',x+11.4,y+7.5);
  let yy=y+12.8;
  wrapped.forEach(lines=>{
    doc.setFillColor(...PDF.carbon); doc.circle(x+6.0,yy-1.0,.27,'F');
    doc.setFont('helvetica','normal');doc.setFontSize(5.95);doc.setTextColor(...PDF.texto2);
    doc.text(lines,x+9.0,yy,{lineHeightFactor:1.18});
    yy += lines.length*2.95 + 1.2;
  });
  return y+h+2;
}

function pdfApprovedOnePageCredit(doc,cfg){
  let y=pdfHeader(doc,cfg.title,cfg.subtitle||'Resultados de tu simulacion de financiacion.');
  y=pdfApprovedContext(doc,y,
    {label:'Programa academico',value:cfg.program||'Programa',hint:cfg.programHint||'Pregrado',icon:'graduation-cap'},
    {label:cfg.contextLabel||'Periodo financiado',value:cfg.contextValue||'',hint:cfg.contextHint||'Corresponde al valor de la matricula del periodo seleccionado.',icon:cfg.contextIcon||'calendar'}
  );
  y=pdfApprovedHero(doc,y,{label:cfg.heroLabel,value:cfg.heroValue,meta:cfg.heroMeta,noteTitle:cfg.noteTitle||'Que significa este valor?',note:cfg.note});
  y=pdfApprovedSectionTitle(doc,PDF.M,y,'Resumen financiero');
  y=pdfApprovedMetrics(doc,y,cfg.metrics);
  const gap=7,colW=(PDF.CW-gap)/2;
  const ya=pdfApprovedDetailTable(doc,PDF.M,y,colW,cfg.leftTitle,cfg.leftRows);
  const yb=pdfApprovedDetailTable(doc,PDF.M+colW+gap,y,colW,cfg.rightTitle,cfg.rightRows);
  y=Math.max(ya,yb)+1.5;
  if((cfg.rows||[]).length<=8){
    const leftW=104,rightW=72,xR=PDF.M+leftW+6;
    pdfApprovedPlanCompact(doc,PDF.M,y,leftW,cfg.rows,cfg.totCap,cfg.totInt,cfg.planTitle||'Plan de pagos estimado');
    let yr=pdfApprovedConditionsCompact(doc,xR,y,rightW,cfg.conditions||[]);
    pdfApprovedNotesCompact(doc,xR,yr,rightW,cfg.notes||[]);
  }else{
    let yr=pdfApprovedConditionsCompact(doc,PDF.M,y,PDF.CW,cfg.conditions||[]);
    pdfApprovedNotesCompact(doc,PDF.M,yr,PDF.CW,cfg.notes||[]);
    doc.addPage(); let yp=pdfHeader(doc,cfg.planPageTitle||'Plan de pagos',cfg.planPageSubtitle||cfg.title);
    pdfPlanTable(doc,PDF.M,yp,PDF.CW,cfg.rows,cfg.totCap,cfg.totInt,cfg.planTitle||'Plan de pagos estimado');
  }
}

function expPDF1(){
  const d=SimuladorOFE.state.results.shortTerm;
  if(!d) return toast('Primero realiza el calculo','warning');
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  const tea=((Math.pow(1+d.tm,12)-1)*100).toFixed(2)+'%';
  const level=SimuladorOFE.state.ui.levelByTab[1]==='posgrado'?'Posgrado':'Pregrado';
  pdfPremiumCreditReport(doc,{
    type:'Credito a Corto Plazo',program:d.progNombre||'Programa',level,
    heroLabel:'Cuota mensual estimada',heroValue:cop(d.cuota),heroMeta:`${d.n} cuotas | ${(d.tm*100).toFixed(2)}% M.V. | ${tea} E.A.`,
    heroSide:[
      {label:'Monto financiado',value:cop(d.financiado)},
      {label:'Total intereses',value:cop(d.totInt)},
      {label:'Total del credito',value:cop(d.totCap+d.totInt),highlight:true}
    ],
    summary:[
      {label:'Cuota inicial',value:cop(d.cuotaInicial),hint:`${Math.round((d.cuotaInicial/(d.matNeta||d.mat||1))*100)}% del valor del programa`},
      {label:'Plazo del credito',value:`${d.n} meses`},
      {label:'Tasa de interes (EA)',value:tea},
      {label:'Aporte a Garantisa',value:cop(d.garantisa),hint:'4.17% del monto financiado'}
    ],
    conditionsLeft:[
      ['Tipo de credito','Credito a corto plazo'],['Tasa de interes (EA)',tea],['Plazo',`${d.n} meses`],['Cuota inicial',`${cop(d.cuotaInicial)} (${Math.round((d.cuotaInicial/(d.matNeta||d.mat||1))*100)}%)`]
    ],
    conditionsRight:[
      ['Monto financiado',cop(d.financiado)],['Total intereses',cop(d.totInt)],['Total del credito',cop(d.totCap+d.totInt)],['Aporte a Garantisa',`${cop(d.garantisa)} (4.17%)`]
    ],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,firstPageRows:5,
    note:'Esta simulacion es informativa y puede variar segun las condiciones vigentes al momento de la formalizacion del credito.'
  });
  pdfPie(doc); doc.save(safePDF('Credito Corto Plazo - '+(d.progNombre||'Simulacion'))+'.pdf'); toast('PDF descargado','success');
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
  const level=SimuladorOFE.state.ui.levelByTab[2]==='posgrado'?'Posgrado':'Pregrado';
  const totCP=d.CP?(d.CP.totCap+d.CP.totInt):0;
  const garTotal=(d.garCP||0)+(d.garLP||0);
  const totalKnown=(d.pagoInicial||0)+totCP+(d.finLP||0);
  pdfPremiumCreditReport(doc,{
    type:'Credito Corto y Largo Plazo',program:d.progNombre||'Programa',level,
    heroLabel:d.CP?'Cuota mensual estimada CP':'Capital de largo plazo',heroValue:d.CP?cop(d.CP.cuota):cop(d.finLP||0),heroMeta:`CP ${d.pCP||0}% | LP ${d.pLP||0}% | ${tea} E.A.`,
    heroSide:[
      {label:'Financiacion CP',value:cop(d.finCP||0)},
      {label:'Intereses conocidos CP',value:cop(d.CP?d.CP.totInt:0)},
      {label:'Capital LP',value:cop(d.finLP||0),highlight:true}
    ],
    summary:[
      {label:'Pago inicial',value:cop(d.pagoInicial||0),hint:'Contado + Garantisa'},
      {label:'Plazo CP',value:d.CP?`${d.nCP||0} meses`:'Sin tramo CP'},
      {label:'Tasa de interes CP (EA)',value:tea},
      {label:'Aporte total Garantisa',value:cop(garTotal),hint:'CP + LP'}
    ],
    conditionsLeft:[
      ['Tipo de credito','Corto y largo plazo'],['Tasa CP (EA)',tea],['Plazo CP',d.CP?`${d.nCP||0} meses`:'No aplica'],['Pago inicial',cop(d.pagoInicial||0)]
    ],
    conditionsRight:[
      ['Financiacion CP',cop(d.finCP||0)],['Intereses CP',cop(d.CP?d.CP.totInt:0)],['Capital LP',cop(d.finLP||0)],['Aporte Garantisa',cop(garTotal)]
    ],
    rows:d.CP?d.CP.rows:[],totCap:d.CP?d.CP.totCap:0,totInt:d.CP?d.CP.totInt:0,firstPageRows:5,
    planTitle:'Tabla de amortizacion CP',
    note:'La cuota mostrada corresponde al tramo de corto plazo. El capital de largo plazo no incluye intereses futuros, porque su tasa se define al iniciar la amortizacion.'
  });
  if(SimuladorOFE.state.results.projectionLP){doc.addPage();let yp=pdfPremiumHeader(doc,{program:d.progNombre||'Programa',level,type:'Credito Corto y Largo Plazo'});pdfProyeccionLP(doc,yp,SimuladorOFE.state.results.projectionLP,'Matricula');}
  pdfPie(doc); doc.save(safePDF('Credito Mixto - '+(d.progNombre||'Simulacion'))+'.pdf'); toast('PDF descargado','success');
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
  const level=SimuladorOFE.state.ui.levelByTab[3]==='posgrado'?'Posgrado':'Pregrado';
  pdfPremiumCreditReport(doc,{
    type:'Credito Banco Aliado',program:d.progNombre||'Programa',level,
    heroLabel:'Cuota mensual estimada',heroValue:cop(d.cuota),heroMeta:`${d.n} cuotas | ${(d.tm*100).toFixed(2)}% M.V. | ${tea} E.A.`,
    heroSide:[
      {label:'Monto financiado',value:cop(d.financiado)},
      {label:'Total intereses',value:cop(d.totInt)},
      {label:'Total del credito',value:cop(d.totCap+d.totInt),highlight:true}
    ],
    summary:[
      {label:'Pago inicial',value:cop(d.pagoInicial||0)},
      {label:'Plazo del credito',value:`${d.n} meses`},
      {label:'Tasa de interes (EA)',value:tea},
      {label:'Otros cargos',value:cop(d.cargos||0),hint:'Si corresponden'}
    ],
    conditionsLeft:[
      ['Tipo de credito','Credito Banco Aliado'],['Tasa de interes (EA)',tea],['Plazo',`${d.n} meses`],['Pago inicial',cop(d.pagoInicial||0)]
    ],
    conditionsRight:[
      ['Monto financiado',cop(d.financiado)],['Total intereses',cop(d.totInt)],['Total del credito',cop(d.totCap+d.totInt)],['Otros cargos',cop(d.cargos||0)]
    ],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,firstPageRows:5,
    note:'Esta simulacion es informativa y puede variar segun las condiciones vigentes al momento de la formalizacion del credito.'
  });
  pdfPie(doc); doc.save(safePDF('Credito Banco Aliado - '+(d.progNombre||'Simulacion'))+'.pdf'); toast('PDF descargado','success');
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
