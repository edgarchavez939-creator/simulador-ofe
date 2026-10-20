(function(global){
 'use strict';
 const C={red:'960A11',gold:'B78B1E',text:'151515',muted:'625D59',line:'E5E1DE',panel:'F5F4F3',white:'FFFFFF'};
 const neutral={...C,red:'374151',gold:'9CA3AF',panel:'F3F4F6'};
 const isBankReport=report=>['Crédito banco aliado','Comparación de crédito banco aliado'].includes(report.modality);
 const formats={money:'[$$-es-CO] #,##0;[Red]([$$-es-CO] #,##0);[$$-es-CO] 0',percent:'0.00%',integer:'0',date:'dd/mm/yyyy',dateTime:'dd/mm/yyyy h:mm AM/PM'};
 // Excel formats use invariant separators. The spreadsheet locale controls their visual representation.
  function localDate(value){const date=new Date(value);if(!Number.isFinite(date.getTime()))return null;const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));return new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second));}
 function filename(report){const date=localDate(report.occurredAt||new Date()).toISOString().slice(0,10);const name=('Simulacion_'+report.modality+'_'+(report.program||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/_+/g,'_').slice(0,120).replace(/_+$/,'');return name+'_'+date+'.xlsx';}
 function font(size=10,bold=false,color=C.text){return {name:'Aptos Narrow',size,bold,color:{argb:'FF'+color}};}
 function fill(color){return {type:'pattern',pattern:'solid',fgColor:{argb:'FF'+color}};}
 function base(wb,name,landscape=false,bank=false){
  const colors=bank?neutral:C;
  const ws=wb.addWorksheet(name,{properties:{defaultRowHeight:20,tabColor:{argb:'FF'+colors.red}},views:[{showGridLines:false}],pageSetup:{paperSize:9,orientation:landscape?'landscape':'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.3,right:.3,top:.4,bottom:.4,header:.15,footer:.15}}});
  ws.headerFooter={oddFooter:'&L&"Aptos Narrow,Regular"&9'+(bank?'Banco Aliado':'Universidad del Norte')+'&C&"Aptos Narrow,Regular"&9Simulación informativa&R&"Aptos Narrow,Regular"&9&P de &N'};
  return ws;
 }
 function mergeText(ws,row,left,right,value,{size=10,bold=false,color=C.text,background,align='left',height=22}={}){
  ws.mergeCells(row,left,row,right);const cell=ws.getCell(row,left);cell.value=value;cell.font=font(size,bold,color);cell.alignment={vertical:'middle',horizontal:align,wrapText:true};if(background)cell.fill=fill(background);ws.getRow(row).height=height;return cell;
 }
 function header(ws,report,logo){
  const bank=isBankReport(report),colors=bank?neutral:C;
  if(bank)mergeText(ws,2,2,9,'Simulación de crédito',{size:14,bold:true});
  else if(logo){const id=ws.workbook.addImage({buffer:logo,extension:'png'});ws.addImage(id,{tl:{col:1,row:1},ext:{width:324,height:324*59/304},editAs:'oneCell'});}
  else mergeText(ws,2,2,5,'Universidad del Norte',{size:13,bold:true});
  if(!bank)mergeText(ws,3,6,9,'Simulación de Crédito Uninorte',{size:12,bold:true,align:'right',height:27});
  for(let col=2;col<=9;col++)ws.getCell(5,col).border={bottom:{style:'thin',color:{argb:'FF'+colors.gold}}};
  mergeText(ws,7,2,9,report.modality,{size:12,bold:true,color:colors.red,height:25});let row=8;
  if(report.program)mergeText(ws,row++,2,9,report.program,{bold:true,height:Math.max(23,Math.ceil(report.program.length/92)*14)});
  const level=report.level==='pregrado'?'Pregrado':report.level==='posgrado'?'Posgrado':report.level;
  mergeText(ws,row,2,6,[level,report.occurredAt?'Fecha de simulación':'Fecha de exportación'].filter(Boolean).join(' · '),{color:C.muted,size:10});
  const date=mergeText(ws,row++,7,9,localDate(report.occurredAt||new Date()),{align:'right',size:10,color:C.muted});date.numFmt=formats.dateTime;
  if(report.generatedBy)mergeText(ws,row++,2,9,'Generado por '+report.generatedBy,{size:10,color:C.muted});
  return row+1;
 }
 // Select existing snapshot fields. No amounts or payment schedules are recalculated here.
 function compactSections(report){
  return report.sections.filter(s=>!/^Garantisa(?: |$)/.test(s.title)).map(section=>{
   let fields=section.fields.slice();
   if(section.title==='Aporte inicial'){
    const total=fields.find(f=>f.label==='Total inicial');
    fields=[...(total?[{...total,label:'Pago total de contado'}]:[]),...fields.filter(f=>f!==total)];
    fields=fields.filter(f=>f.value!==0||!/^Otros cargos/.test(f.label));
   }
   if(section.title==='Nueva condición')fields=fields.filter(f=>f.label!=='Monto reestructurado'&&f.value!==0);
   if(/^(Financiación|Componente)/.test(section.title)){
    fields=fields.filter(f=>!['Tipo de tasa','Periodicidad'].includes(f.label));
    const term=fields.find(f=>f.label==='Plazo (meses)'),count=fields.find(f=>f.label==='Número de cuotas');
    fields=fields.filter(f=>!(f===count&&term?.value===count.value)).map(f=>f.label==='Tasa'?{...f,label:'Tasa efectiva mensual vencida'}:f===term&&count?.value===term.value?{...f,label:'Plazo (meses) / número de cuotas'}:f);
   }
   if(/^Totales/.test(section.title))fields=fields.filter(f=>!['Monto financiado','Total de cuotas proyectadas','Crédito conocido (CP + capital LP)','Capital LP sin intereses futuros'].includes(f.label));
   if(section.title==='Capacidad de pago')fields=fields.filter(f=>!['Cuota mensual calculada','Nueva cuota mensual'].includes(f.label));
   return {...section,fields};
  }).filter(s=>s.fields.length);
 }
 function legend(ws,row,text,bank=false){
  const colors=bank?neutral:C;
  mergeText(ws,row++,2,9,'SIMULACIÓN SUJETA A VALIDACIÓN Y APROBACIÓN',{bold:true,size:9,background:colors.panel,height:23});
  mergeText(ws,row,2,9,text,{size:9,color:C.muted,background:colors.panel,height:Math.max(58,Math.ceil(text.length/112)*12+10)});return row;
 }
 function summary(wb,report,logo){
  const bank=isBankReport(report),colors=bank?neutral:C,ws=base(wb,'Resumen',false,bank);ws.columns=[{width:3},...Array.from({length:8},()=>({width:12})),{width:3}];let row=header(ws,report,logo);
  for(const section of compactSections(report)){
   mergeText(ws,row++,2,9,section.title==='Aporte inicial'?'Pago inicial al desembolso':section.title,{size:10,bold:true,color:colors.red,background:colors.panel,height:23});
   for(const item of section.fields){
    const strong=/^Pago total|^Costo total|^Cuota mensual estimada/.test(item.label);
    const height=Math.max(21,Math.ceil(item.label.length/55)*13+5);
    mergeText(ws,row,2,6,item.label,{size:10,bold:strong,height});
    const cell=mergeText(ws,row,7,9,item.value,{size:strong?11:10,bold:strong,align:typeof item.value==='number'?'right':'left',height});if(formats[item.format])cell.numFmt=formats[item.format];row++;
    if(section.title==='Aporte inicial'&&/Garantisa/.test(item.label)){
     const metadata=report.sections.find(s=>s.title===(item.label==='Aporte Garantisa'?'Garantisa':item.label));
     const rate=metadata?.fields.find(f=>f.label==='Porcentaje aplicado'),base=metadata?.fields.find(f=>f.label==='Base de cálculo');
     if(rate&&base){mergeText(ws,row,2,6,'Porcentaje sobre $ '+Math.round(base.value).toLocaleString('es-CO')+' financiados',{size:9,color:C.muted});const cell=mergeText(ws,row++,7,9,rate.value,{size:9,color:C.muted,align:'right'});cell.numFmt=formats.percent;}
    }
   }
   if(section.note&&(/pendiente|no representa|no se estima|costo total/i.test(section.note)))mergeText(ws,row++,2,9,section.note,{size:9,color:C.muted,height:Math.max(28,Math.ceil(section.note.length/108)*12+6)});
   row++;
  }
  const disclaimer=bank?report.disclaimer.replace('la Universidad del Norte y/o las entidades que intervengan en el proceso de financiación','la entidad financiera'):report.disclaimer;
  row=legend(ws,row,disclaimer,bank);ws.pageSetup.printArea='A1:J'+row;return ws;
 }
 function plans(wb,report){
  if(!report.plans.length)return;
  const bank=isBankReport(report),colors=bank?neutral:C,multi=report.plans.length>1,ws=base(wb,'Plan de pagos',true,bank),offset=multi?1:0;
  ws.columns=[...(multi?[{width:24}]:[]),{width:12},{width:23},{width:23},{width:23},{width:23}];
  ws.mergeCells(1,1,1,5+offset);ws.getCell(1,1).value='PLAN DE PAGOS · '+report.modality;ws.getCell(1,1).font=font(12,true);ws.getRow(1).height=30;
  ws.mergeCells(2,1,2,5+offset);ws.getCell(2,1).value='Cuotas numeradas. No se registraron fechas de vencimiento.';ws.getCell(2,1).font=font(10,false,C.muted);ws.getRow(2).height=23;
  const heads=[...(multi?['Componente']:[]),'Cuota','Pago mensual','Capital','Intereses','Saldo'];ws.addRow([]);const heading=ws.addRow(heads);heading.height=25;
  heading.eachCell(cell=>{cell.font=font(10,true,C.white);cell.fill=fill(colors.red);cell.alignment={vertical:'middle',horizontal:'center'};});
  let start=5,totalCapital=0,totalInterest=0,totalPayments=0;
  for(const plan of report.plans){for(const item of plan.rows){const row=ws.addRow([...(multi?[plan.name]:[]),item.installment,item.payment,item.capital,item.interest,item.balance]);row.height=20;row.eachCell((cell,index)=>{cell.font=font();cell.alignment={vertical:'middle',horizontal:index>1+offset?'right':multi&&index===1?'left':'center'};if(index>1+offset)cell.numFmt=formats.money;if(row.number%2)cell.fill=fill(colors.panel);});}totalCapital+=plan.totalCapital;totalInterest+=plan.totalInterest;totalPayments+=plan.rows.reduce((sum,item)=>sum+item.payment,0);}
  const end=ws.lastRow.number,totals=ws.addRow([]);totals.getCell(1).value='Totales';
  for(const [index,value] of [[3+offset,totalCapital],[4+offset,totalInterest],[2+offset,totalPayments]]){const letter=ws.getColumn(index).letter;const cell=totals.getCell(index);cell.value={formula:`SUM(${letter}${start}:${letter}${end})`,result:value};cell.numFmt=formats.money;}
  for(let col=1;col<=5+offset;col++){const cell=totals.getCell(col);cell.font=font(10,true);cell.alignment={horizontal:col>1?'right':'left',vertical:'middle'};cell.border={top:{style:'thin',color:{argb:'FF'+colors.gold}}};}totals.height=25;
  ws.views=[{state:'frozen',ySplit:4,showGridLines:false}];ws.autoFilter={from:{row:4,column:1},to:{row:end,column:5+offset}};ws.pageSetup.printTitlesRow='1:4';ws.pageSetup.printArea='A1:'+ws.getColumn(5+offset).letter+totals.number;
 }
 function restructuringTreatment(wb,report){
  const treatment=report.restructuring?.treatment;if(!treatment)return;
  const ws=base(wb,'Tratamiento del saldo',true);ws.columns=[{width:28},...Array.from({length:4},()=>({width:23}))];
  ws.addRow(['Concepto','Importe a corte','Pago inicial','Condonación simulada','A financiar']);
  ws.getRow(1).eachCell(cell=>{cell.font=font(10,true,C.white);cell.fill=fill(C.red);});
  for(const item of treatment.rows){const row=ws.addRow([item.label,item.amount,item.paid,item.forgiven,item.financed]);row.eachCell((cell,index)=>{cell.font=font();if(index>1)cell.numFmt=formats.money;});}
  const sums=['Total',treatment.gross,treatment.initial,treatment.forgiven,treatment.financed],total=ws.addRow(sums);total.eachCell((cell,index)=>{cell.font=font(10,true);if(index>1)cell.numFmt=formats.money;});
  ws.mergeCells(8,1,8,5);ws.getCell(8,1).value='Fecha de corte: '+report.restructuring.cutoff;ws.getCell(8,1).font=font(10);
  ws.mergeCells(9,1,10,5);ws.getCell(9,1).value=treatment.forgiven>0?'Condonación simulada, sujeta a validación y aprobación. Referencia: '+report.restructuring.reference:'Sin condonación simulada.';ws.getCell(9,1).font=font(10);ws.getCell(9,1).alignment={wrapText:true,vertical:'top'};ws.getRow(9).height=32;
  ws.views=[{state:'frozen',ySplit:1,showGridLines:false}];ws.pageSetup.printArea='A1:E10';
 }
 function build(report,logo){
  if(!global.ExcelJS)throw Error('No fue posible cargar el generador de Excel. Recarga la página e inténtalo nuevamente.');
  const wb=new global.ExcelJS.Workbook();wb.creator=isBankReport(report)?'Simulador de crédito':'Universidad del Norte';if(isBankReport(report))wb.lastModifiedBy='Simulador de crédito';wb.subject='Simulación informativa de crédito';wb.created=new Date();wb.modified=new Date();wb.views=[{activeTab:0,firstSheet:0}];wb.calcProperties.fullCalcOnLoad=true;summary(wb,report,logo);plans(wb,report);restructuringTreatment(wb,report);return wb;
 }
 async function saveWorkbook(wb,name){const buffer=await wb.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();global.setTimeout(()=>URL.revokeObjectURL(url),1000);return wb;}
 async function download(report){const identity=isBankReport(report)?null:await global.OFEPdf?.assets();const wb=build(report,identity?.logo);await saveWorkbook(wb,filename(report));global.toast?.('Excel descargado','success');return wb;}
 async function exportResult(key){try{const report=global.OFEReport.normalize(key,global.OFEReport.result(key));return await global.OFEExcel.download(report);}catch(error){global.toast?.(error.message,'error');throw error;}}
 async function comparison(tab){
  const rows=global.SimuladorOFE.state.comparison.scenarios[tab];if(!rows||rows.length<2){global.toast?.('Guarda al menos 2 escenarios para comparar.','warning');return;}
  const sections=rows.map((item,index)=>({title:'Escenario '+(index+1),fields:[{label:'Programa',value:item.label,format:'text'},{label:'Monto financiado',value:item.financiado,format:'money'},{label:'Pago inicial',value:item.pagoInicial,format:'money'},{label:item.isMixto?'Cuota mensual CP':'Cuota mensual',value:item.isMixto?item.cuotaCP:item.cuota,format:'money'},{label:item.isMixto?'Intereses conocidos CP':'Total intereses',value:item.isMixto?item.intCP:item.intereses,format:'money'},{label:item.isMixto?'Costo conocido, sin intereses futuros LP':'Costo total estimado',value:item.totalGeneral,format:'money'}].filter(field=>field.value!==undefined&&field.value!==null),note:item.isMixto?'La cuota y los intereses definitivos del largo plazo están pendientes.':null}));
  return global.OFEExcel.download({modality:Number(tab)===3?'Comparación de crédito banco aliado':'Comparación de simulaciones',sections,plans:[],disclaimer:global.OFEReport.disclaimer});
 }
 global.OFEExcel={build,download,saveWorkbook,exportResult,comparison,filename,localDate,formats};
})(window);
