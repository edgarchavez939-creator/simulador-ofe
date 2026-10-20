(function(global){
 'use strict';
 const definitions=Object.freeze([
  {key:'shortTerm',tab:1,label:'Crédito a Corto Plazo',group:'SIMULAR',icon:'calendar'},
  {key:'mixed',tab:2,label:'Corto y Largo Plazo',group:'SIMULAR',icon:'git-branch'},
  {key:'bank',tab:3,label:'Crédito Banco Aliado',group:'SIMULAR',icon:'building'},
  {key:'initialPayment',tab:7,label:'Cuota Inicial',group:'ANALIZAR',icon:'wallet'},
  {key:'rateConverter',tab:4,label:'Conversor de Tasas',group:'ANALIZAR',icon:'repeat'},
  {key:'comparison',tab:8,label:'Comparar escenarios',group:'ANALIZAR',icon:'scale'},
  {key:'history',tab:9,label:'Mis simulaciones',group:'HISTORIAL',icon:'history'}
 ].map(item=>Object.freeze(item)));
 const defaults=Object.freeze(Object.fromEntries(definitions.map(item=>[item.key,true])));
 function validate(values,partial=false){
  if(!values||typeof values!=='object'||Array.isArray(values)||!Object.keys(values).length)throw Error('Selecciona los módulos públicos que deseas actualizar.');
  for(const [key,value] of Object.entries(values))if(!Object.hasOwn(defaults,key)||typeof value!=='boolean')throw Error('Los módulos públicos solo admiten opciones conocidas con estado visible u oculto.');
  if(!partial&&definitions.some(item=>!Object.hasOwn(values,item.key)))throw Error('La configuración pública está incompleta.');
  return Object.freeze({...values});
 }
 const api=Object.freeze({definitions,defaults,validate});
 if(typeof module==='object'&&module.exports)module.exports=api;else global.OFEPublicModuleDefinitions=api;
})(typeof window==='object'?window:globalThis);
