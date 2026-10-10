/*
 * PDF v5 — renderer visual unificado
 * - Tipografía solicitada: Aptos Narrow y sus variables mediante la fuente instalada
 *   en el sistema del usuario. Fallbacks estrechos: Arial Narrow, Roboto Condensed,
 *   Liberation Sans Narrow.
 * - No incorpora ni redistribuye archivos de fuente.
 * - No utiliza logotipos institucionales.
 * - Renderiza cada página sobre canvas para mantener alineación, jerarquía y
 *   consistencia tipográfica en todas las modalidades.
 */

const PDFV5 = (() => {
  const W = 1240;
  const H = 1754;
  const M = 68;
  const CONTENT = W - M * 2;
  const FONT = '"Aptos Narrow", "Arial Narrow", "Roboto Condensed", "Liberation Sans Narrow", sans-serif';
  const C = {
    red: '#960A11',
    redDark: '#72070D',
    redSoft: '#FBF1F2',
    black: '#151515',
    text: '#29323A',
    muted: '#6E7480',
    line: '#D9DDE2',
    panel: '#F6F7F8',
    panel2: '#EEF0F2',
    gold: '#B78B1E',
    white: '#FFFFFF'
  };

  function canvas(){
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = C.white; ctx.fillRect(0,0,W,H);
    ctx.textBaseline = 'alphabetic';
    return {canvas:c,ctx};
  }

  function font(ctx,size,weight=400,style='normal'){
    ctx.font = `${style} ${weight} ${size}px ${FONT}`;
  }

  function rounded(ctx,x,y,w,h,r,fill,stroke,lineWidth=1){
    const rr = Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr); ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr); ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
  }

  function line(ctx,x1,y1,x2,y2,color=C.line,width=1){
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }

  function text(ctx,value,x,y,size=24,weight=400,color=C.text,align='left'){
    font(ctx,size,weight); ctx.fillStyle=color; ctx.textAlign=align;
    ctx.fillText(String(value ?? ''),x,y);
  }

  function fitText(ctx,value,x,y,maxWidth,size=24,minSize=15,weight=700,color=C.black,align='left'){
    let s=size; const str=String(value??'');
    for(;s>minSize;s--){font(ctx,s,weight);if(ctx.measureText(str).width<=maxWidth)break;}
    text(ctx,str,x,y,s,weight,color,align); return s;
  }

  function wrap(ctx,value,maxWidth,size=20,weight=400){
    font(ctx,size,weight);
    const words=String(value??'').split(/\s+/).filter(Boolean); const lines=[]; let current='';
    words.forEach(word=>{
      const test=current?`${current} ${word}`:word;
      if(ctx.measureText(test).width<=maxWidth || !current) current=test;
      else {lines.push(current); current=word;}
    });
    if(current) lines.push(current); return lines;
  }

  function wrappedText(ctx,value,x,y,maxWidth,size=20,weight=400,color=C.text,lineHeight=1.18,align='left',maxLines=99){
    const lines=wrap(ctx,value,maxWidth,size,weight).slice(0,maxLines);
    font(ctx,size,weight);ctx.fillStyle=color;ctx.textAlign=align;
    lines.forEach((l,i)=>ctx.fillText(l,x,y+i*size*lineHeight));
    return y + Math.max(0,lines.length-1)*size*lineHeight;
  }

  function formatMoney(v){
    const n=Math.round(Number(v)||0);
    return '$ ' + n.toLocaleString('es-CO');
  }
  function formatPct(v,d=2){ return `${Number(v||0).toFixed(d).replace('.',',')}%`; }
  function tea(tm){ return (Math.pow(1+(Number(tm)||0),12)-1)*100; }

  function dateLong(date=new Date()){
    try{return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric'}).format(date);}
    catch(_e){return date.toLocaleDateString('es-CO');}
  }
  function timeShort(date=new Date()){
    try{return new Intl.DateTimeFormat('es-CO',{hour:'2-digit',minute:'2-digit'}).format(date);}
    catch(_e){return date.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'});}
  }
  function code(prefix='SIM'){
    const d=new Date(), pad=n=>String(n).padStart(2,'0');
    return `${prefix}-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  }

  function estimatedDate(index){
    const now=new Date(); const target=new Date(now.getFullYear(),now.getMonth()+index,1);
    const last=new Date(target.getFullYear(),target.getMonth()+1,0).getDate();
    target.setDate(Math.min(now.getDate(),last));
    return target.toLocaleDateString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric'});
  }

  function topAccent(ctx){
    ctx.fillStyle=C.red; ctx.beginPath(); ctx.moveTo(W-330,0); ctx.lineTo(W,0); ctx.lineTo(W,108); ctx.lineTo(W-220,108); ctx.closePath(); ctx.fill();
    ctx.fillStyle=C.redDark; ctx.beginPath(); ctx.moveTo(W-150,0); ctx.lineTo(W,0); ctx.lineTo(W,108); ctx.closePath(); ctx.fill();
    line(ctx,W-440,0,W-350,88,C.gold,4); line(ctx,W-350,88,W-325,88,C.gold,4);
  }

  function header(ctx,cfg){
    topAccent(ctx);
    text(ctx,'SIMULACIÓN DE CRÉDITO EDUCATIVO',M,65,20,700,C.muted);
    fitText(ctx,cfg.type||'Simulación',M,132,720,50,30,700,C.black);
    ctx.fillStyle=C.red;ctx.fillRect(M,154,82,5);

    const y=190, h=100;
    line(ctx,M,y-14,W-M,y-14,C.line,2);
    const cols=[.34,.16,.27,.23], labels=['Programa académico','Nivel','Fecha de simulación','Código de simulación'];
    const vals=[cfg.program||'Programa',cfg.level||'Pregrado',cfg.meta?.date||dateLong(),cfg.meta?.code||code(cfg.prefix)];
    let x=M;
    cols.forEach((p,i)=>{
      const w=CONTENT*p;
      if(i>0) line(ctx,x,y,x,y+h-15,C.line,2);
      text(ctx,labels[i],x+(i?28:0),y+29,18,500,C.muted);
      fitText(ctx,vals[i],x+(i?28:0),y+66,w-(i?50:24),25,18,700,C.black);
      x+=w;
    });
    line(ctx,M,y+h,W-M,y+h,C.line,2);
    return y+h+34;
  }

  function hero(ctx,y,cfg){
    const gap=0, leftW=Math.round(CONTENT*.54), rightW=CONTENT-leftW-gap, h=220;
    rounded(ctx,M,y,leftW,h,18,C.red,null);
    // subtle geometry, no logo/icon
    ctx.strokeStyle='rgba(21,21,21,.20)';ctx.lineWidth=2;
    for(let i=0;i<7;i++) line(ctx,M+leftW-225+i*30,y+75,M+leftW-225+i*30,y+h-40,'rgba(21,21,21,.20)',2);
    line(ctx,M+leftW-240,y+h-35,M+leftW-55,y+70,'rgba(21,21,21,.20)',2);
    text(ctx,(cfg.label||'Resultado estimado').toUpperCase(),M+42,y+54,22,700,C.white);
    fitText(ctx,cfg.value||'',M+42,y+137,leftW-84,66,42,700,C.white);
    if(cfg.meta) text(ctx,cfg.meta,M+42,y+190,21,600,C.white);

    rounded(ctx,M+leftW,y,rightW,h,18,C.panel,null);
    const rows=(cfg.side||[]).slice(0,3), rowH=h/Math.max(3,rows.length||3);
    rows.forEach((r,i)=>{
      const yy=y+i*rowH;
      if(i) line(ctx,M+leftW+35,yy,M+CONTENT-35,yy,C.line,2);
      if(r.highlight){ctx.fillStyle=C.redSoft;ctx.fillRect(M+leftW+22,yy+10,rightW-44,rowH-20);}
      text(ctx,r.label,M+leftW+42,yy+42,20,r.highlight?700:500,r.highlight?C.black:C.text);
      fitText(ctx,r.value,M+CONTENT-42,yy+44,rightW*.48,29,21,700,C.black,'right');
    });
    return y+h+34;
  }

  function sectionTitle(ctx,y,title){
    text(ctx,title,M,y+30,29,700,C.black); ctx.fillStyle=C.red;ctx.fillRect(M,y+42,68,4); return y+60;
  }

  function tiles(ctx,y,items,title='Resumen de la financiación'){
    y=sectionTitle(ctx,y,title);
    const gap=14,w=(CONTENT-gap*3)/4,h=110;
    (items||[]).slice(0,4).forEach((it,i)=>{
      const x=M+i*(w+gap); rounded(ctx,x,y,w,h,12,C.panel,null);
      if(i===0){ctx.fillStyle=C.gold;ctx.fillRect(x,y,4,h);}
      text(ctx,it.label,x+24,y+29,17,500,C.muted);
      fitText(ctx,it.value,x+24,y+67,w-48,29,20,700,C.black);
      if(it.hint) wrappedText(ctx,it.hint,x+24,y+92,w-48,15,400,C.muted,1.10,'left',2);
    });
    return y+h+24;
  }

  function conditions(ctx,y,leftRows,rightRows,title='Condiciones del crédito'){
    y=sectionTitle(ctx,y,title);
    const gap=24,w=(CONTENT-gap)/2,rowH=44;
    const draw=(x,rows)=>{
      const clean=(rows||[]).filter(Boolean);
      clean.forEach((r,i)=>{
        const yy=y+i*rowH;
        if(i%2===0){ctx.fillStyle='#FAFAFB';ctx.fillRect(x,yy,w,rowH);}
        line(ctx,x,yy+rowH,x+w,yy+rowH,C.line,1.5);
        text(ctx,r[0],x+20,yy+29,17,500,C.muted);
        fitText(ctx,r[1],x+w-20,yy+30,w*.53,20,15,600,C.black,'right');
      });
      return clean.length;
    };
    const n=Math.max(draw(M,leftRows),draw(M+w+gap,rightRows));
    return y+n*rowH+24;
  }

  function planTable(ctx,y,rows,totCap,totInt,title='Tabla de amortización',maxRows=5){
    const subset=(rows||[]).slice(0,maxRows);
    y=sectionTitle(ctx,y,subset.length<(rows||[]).length?`${title} (primeras ${subset.length} cuotas)`:title);
    const x=M,w=CONTENT,headerH=50,rowH=44;
    const cols=[.075,.18,.185,.17,.22,.17];
    const heads=['No.','Fecha de pago','Cuota','Intereses','Abono a capital','Saldo'];
    let xx=x;
    ctx.fillStyle=C.red;ctx.fillRect(x,y,w,headerH);
    heads.forEach((h,i)=>{
      const cw=w*cols[i]; text(ctx,h,xx+cw/2,y+32,17,700,C.white,'center'); if(i)line(ctx,xx,y,xx,y+headerH,'rgba(255,255,255,.28)',1); xx+=cw;
    });
    y+=headerH;
    subset.forEach((r,idx)=>{
      if(idx%2){ctx.fillStyle='#FAFAFB';ctx.fillRect(x,y,w,rowH);}
      line(ctx,x,y+rowH,x+w,y+rowH,C.line,1.3);
      xx=x; const vals=[r.i,estimatedDate(r.i),formatMoney(r.cuota),formatMoney(r.interes),formatMoney(r.capital),formatMoney(r.saldo)];
      vals.forEach((v,i)=>{
        const cw=w*cols[i], align=i<2?'center':'right', tx=align==='center'?xx+cw/2:xx+cw-18;
        text(ctx,v,tx,y+28,16,500,C.text,align); if(i)line(ctx,xx,y,xx,y+rowH,C.line,1); xx+=cw;
      });
      y+=rowH;
    });
    if(subset.length){
      ctx.fillStyle=C.panel2;ctx.fillRect(x,y,w,46);
      text(ctx,'Total crédito',x+w*(cols[0]+cols[1]),y+29,17,700,C.black,'center');
      const total=(Number(totCap)||0)+(Number(totInt)||0);
      text(ctx,formatMoney(totInt),x+w*(cols[0]+cols[1]+cols[2]+cols[3])-18,y+29,16,700,C.black,'right');
      text(ctx,formatMoney(totCap),x+w*(cols[0]+cols[1]+cols[2]+cols[3]+cols[4])-18,y+29,16,700,C.black,'right');
      text(ctx,formatMoney(total),x+w-18,y+29,16,700,C.black,'right');
      y+=46;
    }
    return y+20;
  }

  function note(ctx,y,message){
    rounded(ctx,M,y,CONTENT,70,12,C.panel,null);
    ctx.fillStyle=C.red;ctx.fillRect(M,y,4,70);
    text(ctx,'Nota',M+24,y+29,17,700,C.black);
    wrappedText(ctx,message,M+78,y+29,CONTENT-106,16,400,C.muted,1.15,'left',2);
    return y+82;
  }

  function footer(ctx,page,total,meta){
    const y=H-82; line(ctx,M,y,W-M,y,C.line,2); ctx.fillStyle=C.gold;ctx.fillRect(M,y-2,125,3);
    text(ctx,'Simulador de Crédito Educativo',M,y+36,16,500,C.muted);
    text(ctx,`Generado el ${meta.date} - ${meta.time}`,W-M-155,y+36,16,500,C.muted,'right');
    text(ctx,`Pág. ${page} de ${total}`,W-M,y+36,16,600,C.muted,'right');
  }

  function executivePage(cfg){
    const {canvas:c,ctx}=canvas(); const meta=cfg.meta;
    let y=header(ctx,cfg);
    y=hero(ctx,y,cfg.hero);
    y=tiles(ctx,y,cfg.summary,cfg.summaryTitle||'Resumen de la financiación');
    y=conditions(ctx,y,cfg.conditionsLeft,cfg.conditionsRight,cfg.conditionsTitle||'Condiciones del crédito');
    if(cfg.rows?.length && y<1230){
      const available=H-210-y; const rowsFit=Math.max(0,Math.min(cfg.rows.length,Math.floor((available-132)/44)));
      const maxRows=cfg.rows.length<=8?Math.min(cfg.rows.length,rowsFit):Math.min(5,rowsFit);
      if(maxRows>0) y=planTable(ctx,y,cfg.rows,cfg.totCap,cfg.totInt,cfg.planTitle||'Tabla de amortización',maxRows);
    }
    if(y<1535) note(ctx,Math.min(y+5,1540),cfg.note||'Esta simulación es informativa y puede variar según las condiciones vigentes al momento de la formalización del crédito.');
    return c;
  }

  function schedulePages(cfg){
    const rows=cfg.rows||[]; if(!rows.length) return [];
    const pages=[], perPage=20;
    for(let start=0;start<rows.length;start+=perPage){
      const {canvas:c,ctx}=canvas(); topAccent(ctx);
      text(ctx,'SIMULACIÓN DE CRÉDITO EDUCATIVO',M,66,20,700,C.muted);
      fitText(ctx,cfg.title||'Plan de pagos',M,126,780,44,28,700,C.black); ctx.fillStyle=C.red;ctx.fillRect(M,147,76,5);
      text(ctx,cfg.program||'',M,198,21,700,C.black); text(ctx,cfg.level||'',M,228,18,500,C.muted);
      line(ctx,M,258,W-M,258,C.line,2);
      let y=300;
      const x=M,w=CONTENT,headerH=56,rowH=54,cols=[.075,.18,.185,.17,.22,.17],heads=['No.','Fecha de pago','Cuota','Intereses','Abono a capital','Saldo'];
      ctx.fillStyle=C.red;ctx.fillRect(x,y,w,headerH);let xx=x;
      heads.forEach((h,i)=>{const cw=w*cols[i];text(ctx,h,xx+cw/2,y+36,18,700,C.white,'center');if(i)line(ctx,xx,y,xx,y+headerH,'rgba(255,255,255,.28)',1);xx+=cw;});y+=headerH;
      rows.slice(start,start+perPage).forEach((r,idx)=>{
        if(idx%2){ctx.fillStyle='#FAFAFB';ctx.fillRect(x,y,w,rowH);}line(ctx,x,y+rowH,x+w,y+rowH,C.line,1.3);xx=x;
        const vals=[r.i,estimatedDate(r.i),formatMoney(r.cuota),formatMoney(r.interes),formatMoney(r.capital),formatMoney(r.saldo)];
        vals.forEach((v,i)=>{const cw=w*cols[i],align=i<2?'center':'right',tx=align==='center'?xx+cw/2:xx+cw-18;text(ctx,v,tx,y+34,17,500,C.text,align);if(i)line(ctx,xx,y,xx,y+rowH,C.line,1);xx+=cw;});y+=rowH;
      });
      if(start+perPage>=rows.length){ctx.fillStyle=C.panel2;ctx.fillRect(x,y,w,54);text(ctx,'Totales',x+20,y+35,18,700,C.black);text(ctx,formatMoney(cfg.totInt),x+w*(.075+.18+.185+.17)-18,y+35,17,700,C.black,'right');text(ctx,formatMoney(cfg.totCap),x+w*(.075+.18+.185+.17+.22)-18,y+35,17,700,C.black,'right');text(ctx,formatMoney((cfg.totCap||0)+(cfg.totInt||0)),x+w-18,y+35,17,700,C.black,'right');}
      pages.push(c);
    }
    return pages;
  }

  function projectionPage(pr,label,program,level){
    if(!pr?.filas?.length) return [];
    const {canvas:c,ctx}=canvas();topAccent(ctx);
    text(ctx,'SIMULACIÓN DE CRÉDITO EDUCATIVO',M,66,20,700,C.muted);fitText(ctx,`Proyección - ${label}`,M,126,760,44,28,700,C.black);ctx.fillStyle=C.red;ctx.fillRect(M,147,76,5);
    text(ctx,program||'',M,196,21,700,C.black);text(ctx,level||'',M,226,18,500,C.muted);
    const y0=285;rounded(ctx,M,y0,CONTENT,95,12,C.panel,null);text(ctx,'Porcentaje LP',M+30,y0+38,18,500,C.muted);text(ctx,`${pr.pctLP||0}%`,M+30,y0+72,28,700,C.black);text(ctx,'IPC utilizado',M+320,y0+38,18,500,C.muted);text(ctx,`${pr.ipcPct||0}%`,M+320,y0+72,28,700,C.black);text(ctx,'Capital LP acumulado',M+620,y0+38,18,500,C.muted);text(ctx,formatMoney(pr.acumCapital),M+620,y0+72,28,700,C.black);
    let y=425;const x=M,w=CONTENT,cols=[.14,.22,.20,.20,.24],heads=['Semestre','Base proyectada','Capital LP','Garantisa LP','LP acumulado'];ctx.fillStyle=C.red;ctx.fillRect(x,y,w,54);let xx=x;
    heads.forEach((h,i)=>{const cw=w*cols[i];text(ctx,h,xx+cw/2,y+35,17,700,C.white,'center');if(i)line(ctx,xx,y,xx,y+54,'rgba(255,255,255,.28)',1);xx+=cw;});y+=54;
    pr.filas.slice(0,16).forEach((f,idx)=>{if(idx%2){ctx.fillStyle='#FAFAFB';ctx.fillRect(x,y,w,52);}line(ctx,x,y+52,x+w,y+52,C.line,1.2);xx=x;const vals=[`${f.s}`,formatMoney(f.matSem),formatMoney(f.capLP),formatMoney(f.garLP),formatMoney(f.acumCapital)];vals.forEach((v,i)=>{const cw=w*cols[i],align=i===0?'center':'right',tx=align==='center'?xx+cw/2:xx+cw-16;text(ctx,v,tx,y+33,16,500,C.text,align);if(i)line(ctx,xx,y,xx,y+52,C.line,1);xx+=cw;});y+=52;});
    return [c];
  }

  async function save(pages,filename){
    if(!pages?.length) return;
    try{if(document.fonts?.ready) await document.fonts.ready;}catch(_e){}
    try{
      const aptos = !!document.fonts?.check?.('16px "Aptos Narrow"');
      console.info(`[PDF] Aptos Narrow ${aptos?'disponible':'no disponible; usando fallback estrecho'}.`);
    }catch(_e){}
    const meta=pages.__meta||{date:dateLong(),time:timeShort()};
    pages.forEach((p,i)=>footer(p.getContext('2d'),i+1,pages.length,meta));
    const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4',compress:true});
    pages.forEach((p,i)=>{if(i)doc.addPage();const img=p.toDataURL('image/jpeg',0.95);doc.addImage(img,'JPEG',0,0,210,297,undefined,'FAST');});
    doc.save(filename); toast('PDF descargado','success');
  }

  function meta(prefix){const now=new Date();return{date:dateLong(now),time:timeShort(now),code:code(prefix)};}

  async function report(cfg,filename){
    const pages=[executivePage(cfg)];
    if((cfg.rows||[]).length>8) pages.push(...schedulePages({rows:cfg.rows,totCap:cfg.totCap,totInt:cfg.totInt,title:cfg.planTitle||'Plan de pagos completo',program:cfg.program,level:cfg.level}));
    (cfg.projections||[]).forEach(p=>pages.push(...projectionPage(p.data,p.label,cfg.program,cfg.level)));
    pages.__meta=cfg.meta; await save(pages,filename);
  }

  function comparisonPage(scenarios,meta){
    const {canvas:c,ctx}=canvas();topAccent(ctx);text(ctx,'SIMULACIÓN DE CRÉDITO EDUCATIVO',M,66,20,700,C.muted);fitText(ctx,'Comparativa de Reestructuración',M,126,850,46,28,700,C.black);ctx.fillStyle=C.red;ctx.fillRect(M,148,78,5);
    let y=210;const n=Math.min(scenarios.length,3),gap=18,w=(CONTENT-gap*(n-1))/n;
    scenarios.slice(0,3).forEach((e,i)=>{const x=M+i*(w+gap);rounded(ctx,x,y,w,230,14,C.panel,null);text(ctx,`Escenario ${i+1}`,x+24,y+42,22,700,C.black);wrappedText(ctx,e.label||'',x+24,y+75,w-48,17,400,C.muted,1.15,'left',2);text(ctx,'Nueva cuota',x+24,y+122,18,500,C.muted);fitText(ctx,formatMoney(e.cuota),x+24,y+168,w-48,38,26,700,C.red);text(ctx,`${e.n} meses · ${formatPct(e.tm*100)} M.V.`,x+24,y+205,18,600,C.text);});
    y+=280;y=sectionTitle(ctx,y,'Comparación financiera');
    const labels=['Nueva cuota','Nuevo plazo','Tasa M.V.','Total intereses','Total a pagar'];const rowH=65;const conceptW=230,colW=(CONTENT-conceptW)/n;
    ctx.fillStyle=C.red;ctx.fillRect(M,y,CONTENT,56);text(ctx,'Concepto',M+conceptW/2,y+36,18,700,C.white,'center');for(let i=0;i<n;i++)text(ctx,`Escenario ${i+1}`,M+conceptW+colW*i+colW/2,y+36,18,700,C.white,'center');y+=56;
    labels.forEach((label,ri)=>{if(ri%2){ctx.fillStyle='#FAFAFB';ctx.fillRect(M,y,CONTENT,rowH);}line(ctx,M,y+rowH,W-M,y+rowH,C.line,1.3);text(ctx,label,M+22,y+41,18,500,C.muted);scenarios.slice(0,n).forEach((e,i)=>{const vals=[formatMoney(e.cuota),`${e.n} meses`,formatPct(e.tm*100),formatMoney(e.totInt),formatMoney(e.totalGeneral)];text(ctx,vals[ri],M+conceptW+colW*(i+1)-18,y+41,18,700,C.black,'right');});y+=rowH;});
    c.__meta=meta;return c;
  }

  return {meta,report,save,executivePage,schedulePages,projectionPage,comparisonPage,formatMoney,formatPct,tea};
})();

function pdfV5Level(tab){ return SimuladorOFE.state.ui.levelByTab[tab]==='posgrado'?'Posgrado':'Pregrado'; }
function pdfV5FileName(name){ return String(name||'Simulacion').replace(/[\\/:*?"<>|]/g,'').trim()+'.pdf'; }

window.expPDF1 = async function(){
  const d=SimuladorOFE.state.results.shortTerm;if(!d)return toast('Primero realiza el cálculo','warning');
  const tEA=PDFV5.tea(d.tm),meta=PDFV5.meta('CP');
  await PDFV5.report({prefix:'CP',meta,type:'Crédito a Corto Plazo',program:d.progNombre||'Programa',level:pdfV5Level(1),
    hero:{label:'Cuota mensual estimada',value:PDFV5.formatMoney(d.cuota),meta:`${d.n} cuotas · ${PDFV5.formatPct(d.tm*100)} M.V. · ${PDFV5.formatPct(tEA)} E.A.`,side:[
      {label:'Monto financiado',value:PDFV5.formatMoney(d.financiado)},{label:'Total intereses',value:PDFV5.formatMoney(d.totInt)},{label:'Total del crédito',value:PDFV5.formatMoney(d.totCap+d.totInt),highlight:true}]},
    summary:[{label:'Cuota inicial',value:PDFV5.formatMoney(d.cuotaInicial),hint:`${Math.round((d.cuotaInicial/(d.matNeta||d.mat||1))*100)}% del valor neto`},{label:'Plazo',value:`${d.n} meses`},{label:'Tasa de interés (E.A.)',value:PDFV5.formatPct(tEA)},{label:'Aporte Garantisa',value:PDFV5.formatMoney(d.garantisa),hint:'4,17% del financiado'}],
    conditionsLeft:[['Tipo de crédito','Corto plazo'],['Tasa M.V.',PDFV5.formatPct(d.tm*100)],['Tasa E.A.',PDFV5.formatPct(tEA)],['Plazo',`${d.n} meses`]],
    conditionsRight:[['Cuota inicial',PDFV5.formatMoney(d.cuotaInicial)],['Monto financiado',PDFV5.formatMoney(d.financiado)],['Total intereses',PDFV5.formatMoney(d.totInt)],['Aporte Garantisa',`${PDFV5.formatMoney(d.garantisa)} · 4,17%`]],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,note:'Esta simulación es informativa y puede variar según las condiciones vigentes al momento de la formalización del crédito.'
  },pdfV5FileName(`Credito Corto Plazo - ${d.progNombre||'Simulacion'}`));
};

window.expPDF2 = async function(){
  const d=SimuladorOFE.state.results.mixed;if(!d)return toast('Primero realiza el cálculo','warning');
  const tEA=PDFV5.tea(d.tm),meta=PDFV5.meta('MX'),cp=d.CP,gar=(d.garCP||0)+(d.garLP||0);
  await PDFV5.report({prefix:'MX',meta,type:'Crédito Corto y Largo Plazo',program:d.progNombre||'Programa',level:pdfV5Level(2),
    hero:{label:cp?'Cuota mensual conocida (CP)':'Capital de largo plazo',value:PDFV5.formatMoney(cp?cp.cuota:d.finLP||0),meta:`CP ${d.pCP||0}% · LP ${d.pLP||0}% · ${PDFV5.formatPct(tEA)} E.A.`,side:[
      {label:'Financiación CP',value:PDFV5.formatMoney(d.finCP||0)},{label:'Intereses conocidos CP',value:PDFV5.formatMoney(cp?cp.totInt:0)},{label:'Capital LP',value:PDFV5.formatMoney(d.finLP||0),highlight:true}]},
    summary:[{label:'Pago inicial',value:PDFV5.formatMoney(d.pagoInicial||0),hint:'Contado + Garantisa'},{label:'Plazo CP',value:cp?`${d.nCP||0} meses`:'No aplica'},{label:'Tasa CP (E.A.)',value:PDFV5.formatPct(tEA)},{label:'Garantisa total',value:PDFV5.formatMoney(gar),hint:'CP + LP'}],
    conditionsLeft:[['Tipo de crédito','Corto y largo plazo'],['Distribución CP',`${d.pCP||0}%`],['Distribución LP',`${d.pLP||0}%`],['Plazo CP',cp?`${d.nCP||0} meses`:'No aplica']],
    conditionsRight:[['Financiación CP',PDFV5.formatMoney(d.finCP||0)],['Intereses CP',PDFV5.formatMoney(cp?cp.totInt:0)],['Capital LP',PDFV5.formatMoney(d.finLP||0)],['Aporte Garantisa',PDFV5.formatMoney(gar)]],
    rows:cp?cp.rows:[],totCap:cp?cp.totCap:0,totInt:cp?cp.totInt:0,planTitle:'Tabla de amortización - Corto Plazo',
    note:'La cuota corresponde al tramo de corto plazo. El capital LP no incorpora intereses futuros porque su tasa se define al iniciar la amortización.',
    projections:SimuladorOFE.state.results.projectionLP?[{data:SimuladorOFE.state.results.projectionLP,label:'Matrícula'}]:[]
  },pdfV5FileName(`Credito Mixto - ${d.progNombre||'Simulacion'}`));
};

window.expPDF3 = async function(){
  const d=SimuladorOFE.state.results.bank;if(!d)return toast('Primero realiza el cálculo','warning');
  const tEA=PDFV5.tea(d.tm),meta=PDFV5.meta('BA');
  await PDFV5.report({prefix:'BA',meta,type:'Crédito Banco Aliado',program:d.progNombre||'Programa',level:pdfV5Level(3),
    hero:{label:'Cuota mensual estimada',value:PDFV5.formatMoney(d.cuota),meta:`${d.n} cuotas · ${PDFV5.formatPct(d.tm*100)} M.V. · ${PDFV5.formatPct(tEA)} E.A.`,side:[
      {label:'Monto financiado',value:PDFV5.formatMoney(d.financiado)},{label:'Total intereses',value:PDFV5.formatMoney(d.totInt)},{label:'Total del crédito',value:PDFV5.formatMoney(d.totCap+d.totInt),highlight:true}]},
    summary:[{label:'Pago inicial',value:PDFV5.formatMoney(d.pagoInicial||0)},{label:'Plazo',value:`${d.n} meses`},{label:'Tasa de interés (E.A.)',value:PDFV5.formatPct(tEA)},{label:'Otros cargos',value:PDFV5.formatMoney(d.cargos||0),hint:'Si corresponden'}],
    conditionsLeft:[['Tipo de crédito','Banco Aliado'],['Tasa M.V.',PDFV5.formatPct(d.tm*100)],['Tasa E.A.',PDFV5.formatPct(tEA)],['Plazo',`${d.n} meses`]],
    conditionsRight:[['Pago inicial',PDFV5.formatMoney(d.pagoInicial||0)],['Monto financiado',PDFV5.formatMoney(d.financiado)],['Total intereses',PDFV5.formatMoney(d.totInt)],['Otros cargos',PDFV5.formatMoney(d.cargos||0)]],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,note:'Esta simulación es informativa y puede variar según las condiciones vigentes al momento de la formalización del crédito.'
  },pdfV5FileName(`Credito Banco Aliado - ${d.progNombre||'Simulacion'}`));
};

window.expPDF7 = async function(){
  const d=SimuladorOFE.state.results.initialPayment;if(!d)return toast('Primero realiza el cálculo','warning');
  const tEA=PDFV5.tea(d.tm),meta=PDFV5.meta('CI');
  await PDFV5.report({prefix:'CI',meta,type:'Cálculo de Cuota Inicial',program:d.progNombre||'Programa',level:pdfV5Level(7),
    hero:{label:'Cuota inicial requerida',value:PDFV5.formatMoney(d.cuotaInicial),meta:`${d.n} cuotas · ${PDFV5.formatPct(d.tm*100)} M.V. · ${PDFV5.formatPct(tEA)} E.A.`,side:[
      {label:'Monto financiable',value:PDFV5.formatMoney(d.fin)},{label:'Total intereses',value:PDFV5.formatMoney(d.totInt)},{label:'Costo total estimado',value:PDFV5.formatMoney(d.costoTotal),highlight:true}]},
    summary:[{label:'Capacidad mensual',value:PDFV5.formatMoney(d.cap)},{label:'Plazo',value:`${d.n} meses`},{label:'Tasa de interés (E.A.)',value:PDFV5.formatPct(tEA)},{label:'Aporte Garantisa',value:PDFV5.formatMoney(d.gar),hint:'4,17% del financiado'}],
    conditionsLeft:[['Tipo de cálculo','Cuota inicial requerida'],['Tasa M.V.',PDFV5.formatPct(d.tm*100)],['Tasa E.A.',PDFV5.formatPct(tEA)],['Plazo',`${d.n} meses`]],
    conditionsRight:[['Capacidad mensual',PDFV5.formatMoney(d.cap)],['Monto financiable',PDFV5.formatMoney(d.fin)],['Cuota resultante',PDFV5.formatMoney(d.cuota)],['Aporte Garantisa',`${PDFV5.formatMoney(d.gar)} · 4,17%`]],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,note:'La cuota inicial se calcula para que la cuota mensual resultante se ajuste a la capacidad de pago declarada.'
  },pdfV5FileName(`Calculo Cuota Inicial - ${d.progNombre||'Simulacion'}`));
};

window.expPDFIdiomas = async function(){
  const d=SimuladorOFE.state.results.languages;if(!d)return toast('Primero calcula el crédito de idiomas','warning');
  const tab=SimuladorOFE.state.languages.context.tabId,tEA=PDFV5.tea(d.tm),meta=PDFV5.meta('ID'),level=pdfV5Level(tab);
  const rows=d.isMixto&&d.idCP?d.idCP.rows:d.rows,tc=d.isMixto&&d.idCP?d.idCP.totCap:d.totCap,ti=d.isMixto&&d.idCP?d.idCP.totInt:d.totInt;
  const gar=d.isMixto?(d.garCP||0)+(d.garLP||0):(d.garantisa||0);
  await PDFV5.report({prefix:'ID',meta,type:d.isMixto?'Crédito de Idiomas - Corto y Largo Plazo':'Crédito de Idiomas',program:d.progNombre||'Programa',level,
    hero:{label:d.isMixto?'Cuota mensual conocida (CP)':'Cuota mensual estimada',value:PDFV5.formatMoney(d.isMixto&&d.idCP?d.idCP.cuota:d.cuota),meta:`${d.n} cuotas · ${PDFV5.formatPct(d.tm*100)} M.V. · ${PDFV5.formatPct(tEA)} E.A.`,side:d.isMixto?[
      {label:'Financiación CP',value:PDFV5.formatMoney(d.finCP||0)},{label:'Intereses conocidos CP',value:PDFV5.formatMoney(d.idCP?d.idCP.totInt:0)},{label:'Capital LP',value:PDFV5.formatMoney(d.finLP||0),highlight:true}]:[
      {label:'Monto financiado',value:PDFV5.formatMoney(d.financiado)},{label:'Total intereses',value:PDFV5.formatMoney(d.totInt)},{label:'Total del crédito',value:PDFV5.formatMoney(d.totalCredito),highlight:true}]},
    summary:[{label:'Pago inicial',value:PDFV5.formatMoney(d.pagoInicial||0)},{label:'Plazo CP',value:`${d.n} meses`},{label:'Tasa de interés (E.A.)',value:PDFV5.formatPct(tEA)},{label:'Aporte Garantisa',value:PDFV5.formatMoney(gar)}],
    conditionsLeft:d.isMixto?[['Tipo de crédito','Idiomas CP + LP'],['Tasa CP M.V.',PDFV5.formatPct(d.tm*100)],['Tasa CP E.A.',PDFV5.formatPct(tEA)],['Plazo CP',`${d.n} meses`]]:[['Tipo de crédito','Crédito de idiomas'],['Tasa M.V.',PDFV5.formatPct(d.tm*100)],['Tasa E.A.',PDFV5.formatPct(tEA)],['Plazo',`${d.n} meses`]],
    conditionsRight:d.isMixto?[['Financiación CP',PDFV5.formatMoney(d.finCP||0)],['Intereses CP',PDFV5.formatMoney(d.idCP?d.idCP.totInt:0)],['Capital LP',PDFV5.formatMoney(d.finLP||0)],['Aporte Garantisa',PDFV5.formatMoney(gar)]]:[['Pago inicial',PDFV5.formatMoney(d.pagoInicial||0)],['Monto financiado',PDFV5.formatMoney(d.financiado)],['Total intereses',PDFV5.formatMoney(d.totInt)],['Aporte Garantisa',`${PDFV5.formatMoney(d.garantisa)} · 4,17%`]],
    rows,totCap:tc,totInt:ti,planTitle:d.isMixto?'Tabla de amortización - CP Idiomas':'Tabla de amortización - Idiomas',
    note:d.isMixto?'La cuota corresponde al tramo CP de idiomas. El capital LP no incluye intereses futuros porque su tasa se define al iniciar la amortización.':'Esta simulación corresponde al crédito de idiomas y es informativa.',
    projections:SimuladorOFE.state.results.projectionLanguagesLP?[{data:SimuladorOFE.state.results.projectionLanguagesLP,label:'Idiomas'}]:[]
  },pdfV5FileName(`${d.progNombre||'Programa'} - Idiomas`));
};

window.expPDFRefi = async function(){
  const d=SimuladorOFE.state.restructuring.current;if(!d)return toast('Primero calcula un escenario','warning');
  const tEA=PDFV5.tea(d.tm),meta=PDFV5.meta('RC');
  await PDFV5.report({prefix:'RC',meta,type:'Reestructuración de Crédito',program:d.label||'Escenario simulado',level:'Escenario',
    hero:{label:'Nueva cuota mensual estimada',value:PDFV5.formatMoney(d.cuota),meta:`${d.n} cuotas · ${PDFV5.formatPct(d.tm*100)} M.V. · ${PDFV5.formatPct(tEA)} E.A.`,side:[
      {label:'Monto reestructurado',value:PDFV5.formatMoney(d.principal)},{label:'Total intereses',value:PDFV5.formatMoney(d.totInt)},{label:'Total a pagar',value:PDFV5.formatMoney(d.totalGeneral),highlight:true}]},
    summary:[{label:'Saldo actual',value:PDFV5.formatMoney(d.saldo)},{label:'Nuevo plazo',value:`${d.n} meses`},{label:'Tasa de interés (E.A.)',value:PDFV5.formatPct(tEA)},{label:'Costos aplicables',value:PDFV5.formatMoney(d.costos||0)}],
    conditionsLeft:[['Tipo de operación','Reestructuración'],['Tasa M.V.',PDFV5.formatPct(d.tm*100)],['Tasa E.A.',PDFV5.formatPct(tEA)],['Nuevo plazo',`${d.n} meses`]],
    conditionsRight:[['Saldo actual',PDFV5.formatMoney(d.saldo)],['Monto reestructurado',PDFV5.formatMoney(d.principal)],['Total intereses',PDFV5.formatMoney(d.totInt)],['Costos aplicables',PDFV5.formatMoney(d.costos||0)]],
    rows:d.rows,totCap:d.totCap,totInt:d.totInt,note:'El resultado parte del saldo y de los conceptos ingresados. La simulación es informativa.'
  },pdfV5FileName(`Reestructuracion de Credito - ${d.label||'Escenario'}`));
};

window.expPDFRefiComp = async function(){
  if(typeof reestructState==='undefined'||reestructState.scenarios.length<2)return toast('Guarda al menos 2 escenarios para comparar','warning');
  const meta=PDFV5.meta('RC-COMP'),page=PDFV5.comparisonPage(reestructState.scenarios,meta),pages=[page];pages.__meta=meta;
  await PDFV5.save(pages,'Comparativa Reestructuracion.pdf');
};

window.expPDFCombinado = async function(){
  const dp=SimuladorOFE.state.results.languages,tab=SimuladorOFE.state.languages.context.tabId;let dm=null,tipo='';
  if(tab===1&&SimuladorOFE.state.results.shortTerm){dm=SimuladorOFE.state.results.shortTerm;tipo='Crédito a Corto Plazo';}
  if(tab===2&&SimuladorOFE.state.results.mixed){dm=SimuladorOFE.state.results.mixed;tipo='Crédito Mixto';}
  if(tab===3&&SimuladorOFE.state.results.bank){dm=SimuladorOFE.state.results.bank;tipo='Crédito Banco Aliado';}
  if(!dp||!dm)return toast('Primero calcula ambos créditos','warning');
  const level=pdfV5Level(tab),meta=PDFV5.meta('CB');
  const cuotaPre=tab===2?(dm.CP?dm.CP.cuota:0):(dm.cuota||0),cuotaIdi=dp.isMixto&&dp.idCP?dp.idCP.cuota:(dp.cuota||0);
  const pagoPre=dm.pagoInicial||0,pagoIdi=dp.pagoInicial||0;
  const credPre=tab===2?((dm.CP?dm.CP.totCap+dm.CP.totInt:0)+(dm.finLP||0)):((dm.totCap||0)+(dm.totInt||0));
  const credIdi=dp.isMixto&&dp.idCP?((dp.idCP.totCap+dp.idCP.totInt)+(dp.finLP||0)):(dp.totalCredito||0);
  const cfg={prefix:'CB',meta,type:'Reporte Combinado - Pregrado + Idiomas',program:dp.progNombre||'Programa',level,
    hero:{label:'Cuota mensual combinada conocida',value:PDFV5.formatMoney(cuotaPre+cuotaIdi),meta:`${tipo} + Crédito de Idiomas`,side:[{label:'Pago inicial combinado',value:PDFV5.formatMoney(pagoPre+pagoIdi)},{label:'Crédito conocido total',value:PDFV5.formatMoney(credPre+credIdi)},{label:'Costo conocido',value:PDFV5.formatMoney(pagoPre+pagoIdi+credPre+credIdi),highlight:true}]},
    summary:[{label:'Pago inicial pregrado',value:PDFV5.formatMoney(pagoPre)},{label:'Pago inicial idiomas',value:PDFV5.formatMoney(pagoIdi)},{label:'Cuota pregrado',value:PDFV5.formatMoney(cuotaPre)},{label:'Cuota idiomas',value:PDFV5.formatMoney(cuotaIdi)}],
    conditionsTitle:'Detalle de las simulaciones',conditionsLeft:[['Modalidad pregrado',tipo],['Pago inicial',PDFV5.formatMoney(pagoPre)],['Cuota estimada',PDFV5.formatMoney(cuotaPre)],['Crédito conocido',PDFV5.formatMoney(credPre)]],conditionsRight:[['Crédito idiomas',dp.isMixto?'Corto y largo plazo':'Corto plazo'],['Pago inicial',PDFV5.formatMoney(pagoIdi)],['Cuota estimada',PDFV5.formatMoney(cuotaIdi)],['Crédito conocido',PDFV5.formatMoney(credIdi)]],rows:[],totCap:0,totInt:0,note:'Este reporte consolida dos simulaciones independientes. Los valores LP sujetos a tasa futura se presentan como capital conocido.'};
  const pages=[PDFV5.executivePage(cfg)];
  const preRows=tab===2?(dm.CP?dm.CP.rows:[]):dm.rows,preCap=tab===2?(dm.CP?dm.CP.totCap:0):dm.totCap,preInt=tab===2?(dm.CP?dm.CP.totInt:0):dm.totInt;
  if(preRows?.length)pages.push(...PDFV5.schedulePages({rows:preRows,totCap:preCap,totInt:preInt,title:`Plan de pagos - ${tipo}`,program:dp.progNombre||'Programa',level}));
  const rows=dp.isMixto&&dp.idCP?dp.idCP.rows:dp.rows,tc=dp.isMixto&&dp.idCP?dp.idCP.totCap:dp.totCap,ti=dp.isMixto&&dp.idCP?dp.idCP.totInt:dp.totInt;
  if(rows?.length)pages.push(...PDFV5.schedulePages({rows,totCap:tc,totInt:ti,title:'Plan de pagos - Idiomas',program:dp.progNombre||'Programa',level}));
  if(SimuladorOFE.state.results.projectionLP)pages.push(...PDFV5.projectionPage(SimuladorOFE.state.results.projectionLP,'Matrícula',dp.progNombre||'Programa',level));
  if(SimuladorOFE.state.results.projectionLanguagesLP)pages.push(...PDFV5.projectionPage(SimuladorOFE.state.results.projectionLanguagesLP,'Idiomas',dp.progNombre||'Programa',level));
  pages.__meta=meta;await PDFV5.save(pages,pdfV5FileName(`${dp.progNombre||'Programa'} - Combinado`));
};


// Sincroniza el servicio de exportación con los overrides v5 antes del arranque.
if (window.SimuladorOFE && typeof SimuladorOFE.register === 'function') {
  SimuladorOFE.register('pdf-aptos-v5', {
    init(app){
      const svc = app.services['exports'] || (app.services['exports'] = {});
      Object.assign(svc, {
        expPDF1: window.expPDF1,
        expPDF2: window.expPDF2,
        expPDF3: window.expPDF3,
        expPDF7: window.expPDF7,
        expPDFIdiomas: window.expPDFIdiomas,
        expPDFRefi: window.expPDFRefi,
        expPDFRefiComp: window.expPDFRefiComp,
        expPDFCombinado: window.expPDFCombinado
      });
    }
  });
}
