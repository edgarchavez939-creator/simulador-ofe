(function(global){
 'use strict';
 // Control workbook: preserve the identified import schema, separate from simulation reports.
 global.descargarPlantilla=async function(){
  const programs=global.SimuladorOFE.catalog.programs,book=new global.ExcelJS.Workbook();
  for(const [level,name,headers] of [['pregrado','Pregrado',['Programa','Valor Pregrado','Valor Idiomas','Semestres','ID','Version']],['posgrado','Posgrado',['Programa','Subnivel','Valor','ID','Version']]]){
   const rows=programs.filter(p=>p.nivel===level).map(p=>level==='pregrado'?[p.nombre,p.valorMatricula,p.valorIdiomas,p.semestres,p.id,p.version]:[p.nombre,p.subnivel,p.valorMatricula,p.id,p.version]);
   const sheet=book.addWorksheet(name);sheet.views=[{state:'frozen',ySplit:1,showGridLines:false}];
   [headers,...rows].forEach((data,index)=>{const row=sheet.getRow(index+1);row.height=index?22:26;data.forEach((value,column)=>{const cell=row.getCell(column+1);cell.value=value;cell.font={name:'Public Sans',size:10,bold:!index,color:{argb:index?'FF151515':'FFFFFFFF'}};cell.alignment={vertical:'middle',horizontal:typeof value==='number'?'right':'left'};if(!index)cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF960A11'}};else if(level==='pregrado'&&[1,2].includes(column)||level==='posgrado'&&column===2)cell.numFmt=global.OFEExcel.formats.money;});});
   headers.forEach((_,index)=>sheet.getColumn(index+1).width=index===0?60:index===headers.length-2?65:18);sheet.autoFilter={from:{row:1,column:1},to:{row:rows.length+1,column:headers.length}};
  }
  await global.OFEExcel.saveWorkbook(book,'plantilla-programas.xlsx');global.toast('Plantilla Excel descargada','success');return book;
 };
})(window);
