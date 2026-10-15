(function(global){
 'use strict';
 const periods=Object.freeze({d:{label:'Diaria',n:365},s:{label:'Semanal',n:52},q:{label:'Quincenal',n:24},m:{label:'Mensual',n:12},b:{label:'Bimestral',n:6},t:{label:'Trimestral',n:4},c:{label:'Cuatrimestral',n:3},sm:{label:'Semestral',n:2},a:{label:'Anual',n:1}});
 function equivalent({value,sourceType='efectiva',sourcePeriod='m',sourceCapitalization='m',targetType='efectiva',targetPeriod='a',targetCapitalization='m'}){
  if(value===''||value===null||typeof value!=='number'||!Number.isFinite(value)||value<0)throw Error('Ingresa una tasa válida, mayor o igual a cero.');
  if(!['efectiva','nominal'].includes(sourceType)||!['efectiva','nominal'].includes(targetType)||![sourcePeriod,sourceCapitalization,targetPeriod,targetCapitalization].every(key=>Object.hasOwn(periods,key)))throw Error('Selecciona una combinación de tasa y periodicidad válida.');
  const i=value/100,origin=periods[sourcePeriod].n,m=periods[sourceCapitalization].n;
  const annual=sourceType==='efectiva'?Math.pow(1+i,origin)-1:Math.pow(1+i*origin/m,m)-1;
  const dest=periods[targetPeriod].n,cap=periods[targetCapitalization].n;
  const result=targetType==='efectiva'?Math.pow(1+annual,1/dest)-1:cap*(Math.pow(1+annual,1/cap)-1)/dest;
  if(!Number.isFinite(annual)||!Number.isFinite(result))throw Error('Esta combinación excede el rango numérico. Reduce la tasa o la frecuencia.');
  const rows=Object.entries(periods).map(([key,period])=>{const effective=Math.pow(1+annual,1/period.n)-1;return {key,...period,effective,nominalAnnual:period.n*effective};});
  return {annual,result,rows};
 }
 global.OFERateConverter=Object.freeze({periods,equivalent});
})(window);
