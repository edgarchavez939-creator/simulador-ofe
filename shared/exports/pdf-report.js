(function(global){
 'use strict';
 const script=document.currentScript?.src;
 const C={red:'#960A11',gold:'#B78B1E',ink:'#202326',muted:'#626970',line:'#D8D8D5',panel:'#F5F4F1'};
 const W=595.28,H=841.89,L=52,R=W-52,X=L+32,BOTTOM=697;
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const money=v=>'$'+Math.round(v).toLocaleString('es-CO');
 const percent=v=>(v*100).toLocaleString('es-CO',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
 const value=f=>f.format==='money'?money(f.value):f.format==='percent'?percent(f.value):String(f.value);
 const field=(s,label)=>s?.fields.find(f=>f.label===label);
 const section=(r,title)=>r.sections.find(s=>s.title===title);
 const isBankReport=report=>report.modality==='Crédito banco aliado';
 let cached;
 function base64(buffer){let out='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=8192)out+=String.fromCharCode(...bytes.subarray(i,i+8192));return global.btoa(out);}
 async function assets(){
  if(!cached)cached=(async()=>{
   const base=new URL('.',script||new URL('shared/exports/pdf-report.js',document.baseURI).href);
   const fetchAsset=async path=>{const response=await global.fetch(new URL(path,base),{credentials:'same-origin'});if(!response.ok)throw Error('No fue posible cargar la identidad del PDF. Recarga e inténtalo nuevamente.');return response.arrayBuffer();};
   const [regular,bold,logo]=await Promise.all([fetchAsset('../fonts/PublicSans-Regular.ttf'),fetchAsset('../fonts/PublicSans-Bold.ttf'),fetchAsset('../branding/ofe-color.png')]);
   return {regular:base64(regular),bold:base64(bold),logo:new Uint8Array(logo)};
  })().catch(error=>{cached=null;throw error;});return cached;
 }
 function modalityTitle(report){
  const level=report.level==='posgrado'?'Posgrado':'Pregrado';
  const titles={
   'Crédito corto plazo':'Crédito '+level+' - Corto Plazo',
   'Crédito mixto':'Crédito '+level+' - Mixto',
   'Crédito largo plazo':'Crédito '+level+' - Largo Plazo',
   'Crédito de idiomas':'Crédito Idiomas - Corto Plazo',
   'Idiomas · Crédito mixto':'Crédito Idiomas - Mixto'
  };
  return titles[report.modality]||report.modality;
 }
 function dateLabel(report){
  if(!report.occurredAt)return 'Fecha original de simulación no registrada';
  return 'Simulación del '+new Intl.DateTimeFormat('es-CO',{timeZone:'America/Bogota',day:'numeric',month:'long',year:'numeric'}).format(new Date(report.occurredAt));
 }
 class Layout{
  constructor(doc,identity,resources={}){this.resources=resources;this.doc=doc;this.identity=identity;this.pages=[];this.y=0;this.report=null;this.step=0;}
  font(size=9.5,bold=false,color=C.ink){this.doc.setFont('PublicSans',bold?'bold':'normal');this.doc.setFontSize(size);this.doc.setTextColor(color);}
  text(text,x,y,size=9.5,bold=false,color=C.ink,align='left'){this.font(size,bold,color);this.doc.text(String(text),x,y,{align});}
  wrap(text,width,size=9.5,bold=false){this.font(size,bold);return this.doc.splitTextToSize(String(text),width);}
  rule(y,x=X,end=R,color=C.line){this.doc.setDrawColor(color);this.doc.setLineWidth(.6);this.doc.line(x,y,end,y);}
  paragraph(text,{x=X,width=R-X,size=8.5,gap=7}={}){const lines=this.wrap(text,width,size);for(const line of lines){this.ensure(size*1.4);this.text(line,x,this.y+size,size,false,C.muted);this.y+=size*1.4;}this.y+=gap;}
  newPage(report,continuation=false){
   if(this.pages.length)this.doc.addPage();this.report=report;this.pages.push({report,number:this.doc.getNumberOfPages()});
   const bank=isBankReport(report);this.accent=bank?'#374151':C.red;this.trim=bank?'#9CA3AF':C.gold;this.panel=bank?'#F3F4F6':C.panel;
   if(bank){
    this.text('Simulación de crédito',L,49,15,true);
    this.text('Crédito Banco Aliado'+(continuation?' · Continuación':''),L,69,10,true,this.accent);
    this.rule(83,L,R);this.y=105;
   }else{
    this.doc.addImage(this.identity.logo,'PNG',L,28,243,243*59/304,'ofe-logo');
    this.rule(87,L,R,this.accent);this.rule(87,R-54,R,this.trim);
    this.text('Simulación de Crédito Uninorte',L,108,15,true);
    this.text(modalityTitle(report)+(continuation?' · Continuación':''),L,128,10,true,this.accent);
    this.y=148;
   }
   if(report.program){const lines=this.wrap(report.program,R-L,12,true);for(const line of lines){this.text(line,L,this.y,12,true);this.y+=15;}}
   const level=report.level==='pregrado'?'Pregrado':report.level==='posgrado'?'Posgrado':report.level;
   const context=[level,dateLabel(report)].filter(Boolean).join(' / ');
   const lines=this.wrap(context,R-L,8.2);for(const line of lines){this.text(line,L,this.y,8.2,false,C.muted);this.y+=11;}
   this.y+=8;
  }
  ensure(height){if(this.y+height>BOTTOM)this.newPage(this.report,true);}
  stage(title,number){this.ensure(48);this.step=number??this.step+1;const top=this.y;
   this.doc.setFillColor(this.panel);this.doc.rect(X-8,top,R-X+8,24,'F');this.doc.setFillColor(this.accent);this.doc.rect(L,top,18,24,'F');
   this.text(this.step,L+9,top+16,9,true,'#FFFFFF','center');this.text(title,X,top+16,10.5,true);this.y+=33;
  }
  row(label,display,{bold=false,size=11,color=C.ink,hint}={}){
   const lines=this.wrap(label,260,9.2,bold);const h=Math.max(lines.length*12, size)+8+(hint?13:0);this.ensure(h);
   lines.forEach((line,i)=>this.text(line,X,this.y+Math.max(9.5,size*.85)+i*12,9.2,bold,bold?C.ink:C.muted));
   let s=size;this.font(s,bold);while(this.doc.getTextWidth(display)>R-X-275&&s>8.5){s-=.5;this.font(s,bold);}
   this.text(display,R,this.y+Math.max(9.5,s*.85),s,bold,color,'right');
   if(hint)this.text(hint,X,this.y+lines.length*12+11,8,false,C.muted);
   this.y+=h;
  }
  fields(fields,options={}){for(const f of fields)this.row(f.label,value(f),options);}
  component(s,x,width){
   const start=this.y,amount=field(s,'Monto financiado'),rate=field(s,'Tasa'),term=field(s,'Plazo (meses)')||field(s,'Plazo estimado de amortización (meses)'),count=field(s,'Número de cuotas'),payment=field(s,'Cuota mensual estimada');
   this.text(s.title.replace('Componente ','').toUpperCase(),x,start+9,8.5,true,this.accent);
   if(amount)this.text(value(amount),x,start+36,18,true);
   let y=start+57;
   const detail=rate?percent(rate.value)+' efectiva mensual vencida':'Tasa y cuota por definir';
   for(const line of this.wrap(detail,width,8.1)){this.text(line,x,y,8.1,false,C.muted);y+=11;}
   if(term){this.text(term.value+' meses'+(count?' / '+count.value+' cuotas':' estimados'),x,y+6,8.5);y+=25;}
   if(payment){this.text('Cuota mensual',x,y,8.5,false,C.muted);this.text(value(payment),x,y+20,14,true,this.accent);y+=33;}
   return y-start+8;
  }
  plan(plan,inline=false,stageNumber=4){
   const rowH=18,heads=['N.º','Cuota','Capital','Intereses','Saldo'],positions=[X+3,X+(R-X)*.27,X+(R-X)*.52,X+(R-X)*.76,R-3];
   const heading=()=>{this.ensure(44);const lines=inline?[]:this.wrap(plan.name,R-X,9,true);for(const line of lines){this.text(line,X,this.y+9,9,true);this.y+=12;}this.y+=6;heads.forEach((h,i)=>this.text(h,positions[i],this.y,8,true,C.muted,i?'right':'left'));this.rule(this.y+8);this.y+=23;};
   if(!inline){this.newPage(this.report,true);this.stage('Plan de pagos estimado',stageNumber);}heading();
   for(const item of plan.rows){
    if(this.y+rowH>BOTTOM){this.newPage(this.report,true);this.stage('Plan de pagos · Continuación',stageNumber);heading();}
    [item.installment,money(item.payment),money(item.capital),money(item.interest),money(item.balance)].forEach((v,i)=>this.text(v,positions[i],this.y,8,false,C.ink,i?'right':'left'));this.rule(this.y+6);this.y+=rowH;
   }
   this.y+=6;
  }
  projection(p){
   this.newPage(this.report,true);this.stage('Proyección de '+p.label,4);
   const data=p.data,cols=[X+3,X+140,X+245,X+350,R-3],head=['Sem.','Base proyectada','Capital LP','Garantisa LP','LP acumulado'];
   const heading=()=>{head.forEach((v,i)=>this.text(v,cols[i],this.y+9,7.5,true,C.muted,i?'right':'left'));this.rule(this.y+17);this.y+=34;};
   this.fields([{label:'Porcentaje de largo plazo',value:data.pctLP/100,format:'percent'},{label:'IPC utilizado',value:data.ipcPct/100,format:'percent'}].filter(f=>finite(f.value)));
   heading();for(const row of data.filas){if(this.y+22>BOTTOM){this.newPage(this.report,true);heading();} [row.s,money(row.matSem),money(row.capLP),money(row.garLP),money(row.acumCapital)].forEach((v,i)=>this.text(v,cols[i],this.y,7.5,false,C.ink,i?'right':'left'));this.rule(this.y+6);this.y+=22;}
   this.y+=6;this.row('Capital LP acumulado',money(data.acumCapital),{bold:true});
   this.paragraph('Proyección estimada. No incluye intereses futuros del largo plazo.');
  }
  restructuringBody(r){
   this.newPage(r);this.step=0;
   const current=section(r,'Condición actual');this.stage('Situación actual',1);this.fields(current.fields);if(current.note)this.paragraph(current.note);
   const treatment=r.restructuring.treatment;
   if(treatment.initial>0||treatment.forgiven>0){
    this.ensure(152);this.stage('Tratamiento del saldo y los costos',2);
    const positions=[X,X+177,X+264,X+351,R-3];['Concepto','Importe','Pago inicial','Condonación','A financiar'].forEach((label,i)=>this.text(label,positions[i],this.y+8,7.3,true,C.muted,i?'right':'left'));this.rule(this.y+15);this.y+=30;
    for(const row of treatment.rows){[row.label,money(row.amount),money(row.paid),money(row.forgiven),money(row.financed)].forEach((label,i)=>this.text(label,positions[i],this.y,7.3,false,C.ink,i?'right':'left'));this.rule(this.y+7);this.y+=22;}
    this.paragraph('Corte del saldo: '+r.restructuring.cutoff+'. Los pagos y las condonaciones se descuentan por concepto antes de financiar.');
    if(treatment.forgiven>0)this.paragraph('Condonación simulada, sujeta al acuerdo autorizado por OFE. Referencia: '+r.restructuring.reference);
   }
   const financing=section(r,'Financiación de la nueva condición');this.ensure(financing?132:112);this.stage('Nueva propuesta',3);
   if(financing){
    const amount=field(financing,'Monto financiado'),rate=field(financing,'Tasa'),term=field(financing,'Plazo (meses)'),payment=field(financing,'Cuota mensual estimada');
    this.row(amount.label,value(amount),{bold:true});this.text('Tasa: '+value(rate)+' M.V.',X,this.y+10,8.4,false,C.muted);this.text(term.value+' meses / '+term.value+' cuotas',R,this.y+10,8.4,false,C.muted,'right');this.y+=22;this.row(payment.label,value(payment),{bold:true,size:14});
   }else{this.fields(section(r,'Nueva condición').fields);this.paragraph('Sin monto a financiar. No se genera una nueva amortización.');}
   this.row('Pago inicial al formalizar',money(treatment.initial),{bold:true});
   const comparison=section(r,'Comparación con el crédito vigente');if(comparison){this.stage('Comparación con el crédito vigente',4);this.fields(comparison.fields);this.paragraph(comparison.note);}
   const capacity=section(r,'Capacidad de pago');if(capacity){this.stage('Capacidad y plazo',5);this.fields(capacity.fields.filter(f=>f.label!=='Nueva cuota mensual'));if(capacity.note)this.paragraph(capacity.note);}
   const totals=r.sections.find(s=>/^Totales/.test(s.title));this.stage('Total pendiente de la propuesta',6);if(totals){this.fields(totals.fields.filter(f=>f.label!=='Monto financiado'));this.paragraph(totals.note);}
   if(r.plans.length)this.paragraph('El plan de pagos completo se incluye en el anexo, sin fechas de vencimiento pactadas.');for(const plan of r.plans)this.plan(plan,false,7);
  }
  reportBody(r){
   if(r.restructuring)return this.restructuringBody(r);
   this.newPage(r);this.step=0;
   const current=section(r,'Condición actual'),academic=section(r,'Matrícula')||section(r,'Valor de idiomas');
   if(current||academic){this.stage(current?'Situación actual':'El valor académico');this.fields((current||academic).fields,{bold:!current});if(current?.note)this.paragraph(current.note);}
   const initial=section(r,'Aporte inicial'),proposal=section(r,'Nueva condición');
   if(initial){
    const fields=initial.fields.filter(f=>f.format!=='money'||f.value>0);if(fields.length){this.stage('Lo que pagas al inicio');
     for(const f of fields){const isGuarantee=/Garantisa/.test(f.label),total=f.label==='Total inicial';const g=section(r,f.label==='Aporte Garantisa'?'Garantisa':f.label),rate=field(g,'Porcentaje aplicado'),base=field(g,'Base de cálculo');
      this.row(total?'Total inicial a pagar':f.label,value(f),{bold:total,size:total?13:11,hint:isGuarantee&&rate&&base?percent(rate.value)+' sobre '+money(base.value)+' financiados':null});}
    }
   }else if(proposal){const costs=proposal.fields.filter(f=>f.label==='Costos adicionales financiados'&&f.value>0);if(costs.length){this.stage('Nueva propuesta · Costos adicionales');this.fields(costs);}}
   const components=r.sections.filter(s=>/^Componente |^Financiación$|^Financiación de la nueva condición$/.test(s.title));
   if(components.length){
    this.stage(components.length>1?'Cómo se distribuye la financiación':current?'Nueva propuesta · Financiación':'Lo que financias');
    const total=section(r,'Financiación total');if(total)this.fields(total.fields,{bold:true,size:14});
    if(components.length>1){this.ensure(153);const top=this.y;const heights=components.map((s,i)=>{this.y=top;return this.component(s,X+i*(R-X+18)/2,(R-X-18)/2);});this.y=top+Math.max(...heights);}
    else{
     const s=components[0],amount=field(s,'Monto financiado'),rate=field(s,'Tasa'),term=field(s,'Plazo (meses)')||field(s,'Plazo estimado de amortización (meses)'),count=field(s,'Número de cuotas'),payment=field(s,'Cuota mensual estimada');
     if(amount)this.row('Monto financiado',value(amount),{bold:true,size:14});
     if(rate&&term&&count){this.ensure(24);this.text('Tasa efectiva mensual vencida: '+value(rate),X,this.y+10,8.4,false,C.muted);this.text(term.value+' meses / '+count.value+' cuotas',R,this.y+10,8.4,false,C.muted,'right');this.y+=22;}
     else{if(rate)this.row('Tasa efectiva mensual vencida',value(rate));if(term)this.row('Amortización estimada',term.value+' meses');}
     if(payment)this.row('Cuota mensual estimada',value(payment),{bold:true,size:22,color:this.accent});
    }
    if(r.pending)this.paragraph('Largo plazo: tasa, cuota e intereses pendientes hasta iniciar la amortización.');
   }
   const capacity=section(r,'Capacidad de pago');
   const totals=r.sections.find(s=>/^Totales/.test(s.title));
   this.stage(r.pending?'El alcance de la proyección':'Resultado y plan de pagos estimado');
   // An exact, short plan fits inline. Longer plans go complete into annexes, never a partial duplicate.
   const totalFields=(totals?.fields||[]).filter(f=>f.label!=='Monto financiado'&&!/Total de cuotas|Crédito conocido|Capital LP sin/.test(f.label));
   const capacityFields=(capacity?.fields||[]).filter(f=>!['Cuota mensual calculada','Nueva cuota mensual'].includes(f.label));
   const noteHeight=totals?.note?this.wrap(totals.note,R-X,8.5).length*11.9+7:0;
   const totalsHeight=totalFields.reduce((sum,f)=>sum+( /Costo total/.test(f.label)?23:20),0);
   const inline=r.plans.length===1&&r.plans[0].rows.length<=6&&this.y+35+r.plans[0].rows.length*18+totalsHeight+capacityFields.length*20+noteHeight<=BOTTOM;

   if(inline)this.plan(r.plans[0],true);
   for(const f of totalFields){const total=/Costo total/.test(f.label);this.row(total?(r.pending?'Costo total conocido':'Total proyectado'):f.label,value(f),{bold:total,size:total?15:11});}
   if(capacityFields.length)this.fields(capacityFields);
   if(totals?.note)this.paragraph(r.pending&&!components.some(s=>s.title==='Componente corto plazo')?'El total conocido incluye el aporte inicial y el capital de largo plazo. Excluye los intereses futuros.':totals.note);
   if(!inline&&r.plans.length)this.paragraph('El plan de pagos completo continúa en el anexo. No se registraron fechas de vencimiento.');
   if(!inline)for(const plan of r.plans)this.plan(plan);
   for(const p of r.projections||[])if(p.data?.filas?.length)this.projection(p);
  }

 }
 // A separate footer implementation keeps the legally required side legend vertical and ascending.
 Layout.prototype.footer=function(){const total=this.doc.getNumberOfPages();for(const item of this.pages){this.doc.setPage(item.number);this.rule(714,L,R);this.text('ALCANCE DE LA SIMULACIÓN',L,732,8,true,C.muted);
  const disclaimer=isBankReport(item.report)?item.report.disclaimer.replace('la Universidad del Norte y/o las entidades que intervengan en el proceso de financiación','la entidad financiera'):item.report.disclaimer;
  const lines=this.wrap(disclaimer+' Este documento no constituye aprobación del crédito.',R-L,8.1);lines.forEach((line,i)=>this.text(line,L,748+i*10.8,8.1,false,C.muted));
  const first=this.pages.find(page=>page.report===item.report)?.number===item.number,resource=first&&global.OFEInstitutionalSettings?.resourceFor(item.report,this.resources);
  // Fixed free space below the existing legal notice; never move body/footer elements or add pages.
  if(resource&&lines.length<=3){
   this.font(9.5,true,this.accent);let label=resource.text;while(this.doc.getTextWidth(label)>R-L&&label.length>1)label=label.slice(0,-2);if(label!==resource.text)label+='…';
   this.doc.text(label,L,784);const width=this.doc.getTextWidth(label);this.doc.setDrawColor(this.accent);this.doc.setLineWidth(.45);this.doc.line(L,786,L+width,786);this.doc.link(L,774,width,14,{url:resource.url});
   if(resource.description){this.font(7.5,false,C.muted);let description=resource.description;while(this.doc.getTextWidth(description)>R-L&&description.length>1)description=description.slice(0,-2);if(description!==resource.description)description+='…';this.doc.text(description,L,795);}
  }
  this.text('Generado por',L,807,8,false,C.muted);this.text(item.report.signature||'Usuario Público',L+81,807,9,true);this.text('Pág. '+item.number+' de '+total,R,807,8,false,C.muted,'right');if(!isBankReport(item.report)){this.font(7.5,false,C.muted);this.doc.text('Vigilado Mineducación',34,650,{angle:90});}
 }};
 function build(reports,identity,resources={}){
  const Constructor=global.jspdf?.jsPDF;if(!Constructor)throw Error('No fue posible cargar el generador PDF. Recarga la página.');
  const doc=new Constructor({unit:'pt',format:'a4',compress:true,putOnlyUsedFonts:true});doc.addFileToVFS('PublicSans-Regular.ttf',identity.regular);doc.addFont('PublicSans-Regular.ttf','PublicSans','normal');doc.addFileToVFS('PublicSans-Bold.ttf',identity.bold);doc.addFont('PublicSans-Bold.ttf','PublicSans','bold');
  const branded=reports.some(report=>!isBankReport(report));
  doc.setProperties({title:branded?'Simulación de Crédito Uninorte':'Simulación de crédito - Banco Aliado',author:branded?'Universidad del Norte':'',subject:'Simulación informativa de crédito'});
  const layout=new Layout(doc,identity,resources);for(const report of reports)layout.reportBody(report);layout.footer();return doc;
 }
 async function resourcesFor(reports){
  if(!reports.some(report=>global.OFEInstitutionalSettings?.modules.some(item=>item.id===report.creditModuleId)))return {};
  if(global.OFE_SERVER)return (await global.OFEAuth.request('/api/radication-resources')).values;
  if(global.OFE_PUBLIC){await global.OFEPublicAvailability?.check();return (await global.ProgramCatalogHttp.request(global.OFE_PUBLIC.apiBaseUrl+'/radication-resources')).values;}
  return {};
 }
 function filename(report){return ('Simulacion_'+report.modality+'_'+(report.program||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/_+$/,'').slice(0,140)+'.pdf';}
 async function download(reports){
  const operation=global.OFELoading?.begin('Generando PDF',{total:3,message:'Preparando la identidad institucional…'});
  try{await operation?.checkpoint({completed:0});if(global.OFE_PUBLIC&&!global.OFE_SERVER)await global.OFEPublicAvailability?.check();const identity=await assets();await operation?.checkpoint({completed:1,message:'Organizando la simulación…'});const resources=await resourcesFor(reports);const doc=build(reports,identity,resources);await operation?.checkpoint({completed:2,message:'Preparando la descarga…'});doc.save(filename(reports[0]));await operation?.checkpoint({completed:3});global.toast?.('PDF descargado','success');return doc;
  }catch(error){global.toast?.(error.message,'error');throw error;}finally{operation?.end();}
 }
 global.OFEPdf={build,download,assets,filename};
})(window);
