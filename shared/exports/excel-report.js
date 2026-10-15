(function(global){
 'use strict';
 const C={red:'960A11',gold:'B78B1E',text:'151515',muted:'625D59',line:'E5E1DE',panel:'F5F4F3',white:'FFFFFF'};
 const formats={money:'[$$-es-CO] #,##0;[Red]([$$-es-CO] #,##0);[$$-es-CO] 0',percent:'0.00%',integer:'0',date:'dd/mm/yyyy',dateTime:'dd/mm/yyyy h:mm AM/PM'};
 // Excel formats use invariant separators. The spreadsheet locale controls their visual representation.
  function localDate(value){const date=new Date(value);if(!Number.isFinite(date.getTime()))return null;const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));return new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second));}
 function filename(report){const date=localDate(report.occurredAt||new Date()).toISOString().slice(0,10);const name=('Simulacion_'+report.modality+'_'+(report.program||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/_+/g,'_').slice(0,120).replace(/_+$/,'');return name+'_'+date+'.xlsx';}
 function font(size=10,bold=false,color=C.text){return {name:'Public Sans',size,bold,color:{argb:'FF'+color}};}
 function fill(color){return {type:'pattern',pattern:'solid',fgColor:{argb:'FF'+color}};}
 function base(wb,name,landscape=false){
  const ws=wb.addWorksheet(name,{properties:{defaultRowHeight:20,tabColor:{argb:'FF'+C.red}},views:[{showGridLines:false}],pageSetup:{paperSize:9,orientation:landscape?'landscape':'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.3,right:.3,top:.4,bottom:.4,header:.15,footer:.15}}});
  ws.headerFooter={oddFooter:'&L&"Public Sans,Regular"&9Universidad del Norte&C&"Public Sans,Regular"&9Simulación informativa&R&"Public Sans,Regular"&9&P de &N'};
  return ws;
 }
 function mergeText(ws,row,left,right,value,{size=10,bold=false,color=C.text,background,align='left',height=22}={}){
  ws.mergeCells(row,left,row,right);const cell=ws.getCell(row,left);cell.value=value;cell.font=font(size,bold,color);cell.alignment={vertical:'middle',horizontal:align,wrapText:true};if(background)cell.fill=fill(background);ws.getRow(row).height=height;return cell;
 }
 function header(ws,report){
  mergeText(ws,2,2,8,'SIMULADOR DE CRÉDITO',{size:16,bold:true});mergeText(ws,3,2,8,'Universidad del Norte · Resumen financiero',{color:C.muted,height:20});
  for(let col=2;col<=8;col++)ws.getCell(4,col).border={bottom:{style:'thin',color:{argb:'FF'+C.gold}}};
  mergeText(ws,6,2,8,report.modality,{size:12,bold:true,color:C.red});let row=7;
  if(report.program){mergeText(ws,row++,2,8,report.program,{bold:true,height:Math.max(25,Math.ceil(report.program.length/82)*16)});}
  if(report.level)mergeText(ws,row++,2,8,report.level==='pregrado'?'Pregrado':report.level==='posgrado'?'Posgrado':report.level,{color:C.muted});
  const date=localDate(report.occurredAt||new Date()),cell=mergeText(ws,row++,2,8,date);cell.numFmt=formats.dateTime;cell.font=font(10,false,C.muted);
  mergeText(ws,row++,2,8,report.occurredAt?'Fecha de simulación':'Fecha de exportación · Fecha original no registrada',{size:10,color:C.muted,height:18});
  if(report.generatedBy)mergeText(ws,row++,2,8,'Generado por '+report.generatedBy,{size:10,color:C.muted});
  return row+1;
 }
 function legend(ws,row,text){mergeText(ws,row++,2,8,'SIMULACIÓN SUJETA A VALIDACIÓN Y APROBACIÓN',{bold:true,size:10,background:C.panel,height:25});mergeText(ws,row,2,8,text,{size:10,color:C.muted,background:C.panel,height:Math.max(58,Math.ceil(text.length/95)*13+10)});return row+2;}
 function summary(wb,report){
  const ws=base(wb,'Resumen');ws.columns=[{width:3},{width:20},{width:12},{width:9},{width:3},{width:20},{width:12},{width:9},{width:3}];let row=header(ws,report),hasLegend=false;
  for(const section of report.sections){
   mergeText(ws,row++,2,8,section.title,{size:10,bold:true,color:C.red,height:24});
   for(let index=0;index<section.fields.length;index+=2){
    for(let side=0;side<2;side++){
     const item=section.fields[index+side];if(!item)continue;const left=side?6:2,right=side?8:4;
     mergeText(ws,row,left,right,item.label,{size:10,color:C.muted,height:Math.max(26,Math.ceil(item.label.length/38)*13)});
     const cell=mergeText(ws,row+1,left,right,item.value,{size:12,bold:true,align:typeof item.value==='number'?'right':'left',height:25});if(formats[item.format])cell.numFmt=formats[item.format];
    }row+=2;
   }
   if(section.note)mergeText(ws,row++,2,8,section.note,{size:10,color:C.muted,height:Math.max(27,Math.ceil(section.note.length/94)*13+4)});
   row++;
   if(/Totales/.test(section.title)){row=legend(ws,row,report.disclaimer);hasLegend=true;}
  }
  if(!hasLegend)row=legend(ws,row,report.disclaimer);
  ws.pageSetup.printArea='A1:I'+row;return ws;
 }
 function plans(wb,report){
  if(!report.plans.length)return;
  const multi=report.plans.length>1,ws=base(wb,'Plan de pagos',true),offset=multi?1:0;
  ws.columns=[...(multi?[{width:24}]:[]),{width:12},{width:21},{width:21},{width:21},{width:21},{width:21}];
  ws.mergeCells(1,1,1,6+offset);ws.getCell(1,1).value='PLAN DE PAGOS · '+report.modality;ws.getCell(1,1).font=font(12,true);ws.getRow(1).height=30;
  ws.mergeCells(2,1,2,6+offset);ws.getCell(2,1).value='Cuotas numeradas. No se registraron fechas de vencimiento.';ws.getCell(2,1).font=font(10,false,C.muted);ws.getRow(2).height=23;
  const heads=[...(multi?['Componente']:[]),'Cuota','Saldo inicial','Capital','Interés','Pago','Saldo final'];ws.addRow([]);const heading=ws.addRow(heads);heading.height=25;
  heading.eachCell(cell=>{cell.font=font(10,true,C.white);cell.fill=fill(C.red);cell.alignment={vertical:'middle',horizontal:'center'};});
  let start=5,totalCapital=0,totalInterest=0,totalPayments=0;
  for(const plan of report.plans){let opening=plan.principal;for(const item of plan.rows){const row=ws.addRow([...(multi?[plan.name]:[]),item.installment,opening,item.capital,item.interest,item.payment,item.balance]);row.height=20;row.eachCell((cell,index)=>{cell.font=font();cell.alignment={vertical:'middle',horizontal:index>1+offset?'right':multi&&index===1?'left':'center'};if(index>1+offset)cell.numFmt=formats.money;if(row.number%2)cell.fill=fill(C.panel);});opening=item.balance;}totalCapital+=plan.totalCapital;totalInterest+=plan.totalInterest;totalPayments+=plan.rows.reduce((sum,item)=>sum+item.payment,0);}
  const end=ws.lastRow.number,totals=ws.addRow([]);totals.getCell(1).value='Totales';
  for(const [index,value] of [[3+offset,totalCapital],[4+offset,totalInterest],[5+offset,totalPayments]]){const letter=ws.getColumn(index).letter;const cell=totals.getCell(index);cell.value={formula:`SUM(${letter}${start}:${letter}${end})`,result:value};cell.numFmt=formats.money;}
  for(let col=1;col<=6+offset;col++){const cell=totals.getCell(col);cell.font=font(10,true);cell.alignment={horizontal:col>1?'right':'left',vertical:'middle'};cell.border={top:{style:'thin',color:{argb:'FF'+C.gold}}};}totals.height=25;
  ws.views=[{state:'frozen',ySplit:4,showGridLines:false}];ws.autoFilter={from:{row:4,column:1},to:{row:end,column:6+offset}};ws.pageSetup.printTitlesRow='1:4';ws.pageSetup.printArea='A1:'+ws.getColumn(6+offset).letter+totals.number;
 }
 function build(report){
  if(!global.ExcelJS)throw Error('No fue posible cargar el generador de Excel. Recarga la página e inténtalo nuevamente.');
  const wb=new global.ExcelJS.Workbook();wb.creator='Universidad del Norte';wb.subject='Simulación informativa de crédito';wb.created=new Date();wb.modified=new Date();wb.views=[{activeTab:0,firstSheet:0}];wb.calcProperties.fullCalcOnLoad=true;summary(wb,report);plans(wb,report);return wb;
 }
 async function saveWorkbook(wb,name){const buffer=await wb.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();global.setTimeout(()=>URL.revokeObjectURL(url),1000);return wb;}
 async function download(report){const wb=build(report);await saveWorkbook(wb,filename(report));global.toast?.('Excel descargado','success');return wb;}
 async function exportResult(key){try{const report=global.OFEReport.normalize(key,global.OFEReport.result(key));return await global.OFEExcel.download(report);}catch(error){global.toast?.(error.message,'error');throw error;}}
 async function comparison(tab){
  const rows=global.SimuladorOFE.state.comparison.scenarios[tab];if(!rows||rows.length<2){global.toast?.('Guarda al menos 2 escenarios para comparar.','warning');return;}
  const sections=rows.map((item,index)=>({title:'Escenario '+(index+1),fields:[{label:'Programa',value:item.label,format:'text'},{label:'Monto financiado',value:item.financiado,format:'money'},{label:'Pago inicial',value:item.pagoInicial,format:'money'},{label:item.isMixto?'Cuota mensual CP':'Cuota mensual',value:item.isMixto?item.cuotaCP:item.cuota,format:'money'},{label:item.isMixto?'Intereses conocidos CP':'Total intereses',value:item.isMixto?item.intCP:item.intereses,format:'money'},{label:item.isMixto?'Costo conocido, sin intereses futuros LP':'Costo total estimado',value:item.totalGeneral,format:'money'}].filter(field=>field.value!==undefined&&field.value!==null),note:item.isMixto?'La cuota y los intereses definitivos del largo plazo están pendientes.':null}));
  return global.OFEExcel.download({modality:'Comparación de simulaciones',sections,plans:[],disclaimer:global.OFEReport.disclaimer});
 }
 global.OFEExcel={build,download,saveWorkbook,exportResult,comparison,filename,localDate,formats};
})(window);
