(function(global){
 'use strict';
 // The current server catalog is the only source for this operational template.
 global.descargarPlantilla=function(){
  const programs=global.SimuladorOFE.catalog.programs,XLSX=global.XLSX,book=XLSX.utils.book_new();
  for(const [level,name,headers] of [['pregrado','Pregrado',['Programa','Valor Pregrado','Valor Idiomas','Semestres','ID','Version']],['posgrado','Posgrado',['Programa','Subnivel','Valor','ID','Version']]]){
   const rows=programs.filter(p=>p.nivel===level).map(p=>level==='pregrado'?[p.nombre,p.valorMatricula,p.valorIdiomas,p.semestres,p.id,p.version]:[p.nombre,p.subnivel,p.valorMatricula,p.id,p.version]);
   const sheet=XLSX.utils.aoa_to_sheet([headers,...rows]);sheet['!cols']=headers.map((_,index)=>({wch:index===0?60:index===headers.length-2?65:18}));XLSX.utils.book_append_sheet(book,sheet,name);
  }
  XLSX.writeFile(book,'plantilla-programas.xlsx');global.toast('Plantilla Excel descargada','success');
 };
})(window);
