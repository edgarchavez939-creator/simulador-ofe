(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OFEInstitutionalSettings=api;})(typeof window==='object'?window:this,function(){
 'use strict';
 const lines=Object.freeze([
  {id:'shortTerm:pregrado',label:'Crédito Pregrado - Corto Plazo',key:1,level:'pregrado'},
  {id:'shortTerm:posgrado',label:'Crédito Posgrado - Corto Plazo',key:1,level:'posgrado'},
  {id:'languages',label:'Crédito Idiomas - Corto Plazo',key:'languages'}
 ].map(Object.freeze));
 const types=Object.freeze({video:'Video',document:'Documento',web:'Página web',tutorial:'Tutorial',presentation:'Presentación',other:'Otro'});
 const maintenance=Object.freeze({enabled:false,title:'Simulador en mantenimiento',message:'Estamos realizando ajustes para brindarte un mejor servicio. Por favor, vuelve a consultar más adelante.'});
 const emptyResource=()=>({enabled:false,url:'',text:'CONSULTAR INSTRUCCIONES DE RADICACIÓN',description:'',type:'other'});
 const resources=Object.freeze(Object.fromEntries(lines.map(line=>[line.id,Object.freeze(emptyResource())])));
 const error=message=>Object.assign(Error(message),{status:422});
 const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
 function safeURL(value){
  if(typeof value!=='string'||value.length>2048||/[\s\\\u0000-\u001F\u007F]/u.test(value))throw error('Usa una URL HTTPS válida, sin espacios ni credenciales.');
  let url;try{url=new URL(value);}catch{throw error('Usa una URL HTTPS válida.');}
  if(url.protocol!=='https:'||!url.hostname||url.username||url.password)throw error('El recurso debe usar HTTPS y no incluir credenciales.');
  return url.href;
 }
 function text(value,label,max,required=true,multiline=false){if(typeof value!=='string'||value.length>max||(multiline?/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u:/[\u0000-\u001F\u007F]/u).test(value)||(required&&!value.trim()))throw error(label+' debe contener '+(required?'entre 1 y ':'hasta ')+max+' caracteres'+(multiline?'.':' en una sola línea.'));return value.trim();}
 function validateMaintenance(values,partial=false){
  if(!object(values)||!Object.keys(values).length||Object.keys(values).some(k=>!Object.hasOwn(maintenance,k))||(!partial&&Object.keys(maintenance).some(k=>!Object.hasOwn(values,k))))throw error('La configuración de mantenimiento no es válida.');
  const out={};for(const [k,v] of Object.entries(values)){if(k==='enabled'){if(typeof v!=='boolean')throw error('Selecciona el estado de mantenimiento.');out[k]=v;}else out[k]=text(v,k==='title'?'El título':'El mensaje',k==='title'?100:500,true,k==='message');}return out;
 }
 function validateResources(values,partial=false){
  if(!object(values)||!Object.keys(values).length||Object.keys(values).some(k=>!Object.hasOwn(resources,k))||(!partial&&lines.some(line=>!Object.hasOwn(values,line.id))))throw error('Selecciona una línea de crédito existente.');
  const out={};for(const [id,value] of Object.entries(values)){
   if(!object(value)||Object.keys(value).length!==5||Object.keys(emptyResource()).some(k=>!Object.hasOwn(value,k))||typeof value.enabled!=='boolean'||!Object.hasOwn(types,value.type))throw error('Completa la configuración del recurso de esa línea.');
   out[id]={enabled:value.enabled,url:value.url===''?'':safeURL(value.url),text:text(value.text,'El texto del enlace',72),description:text(value.description,'La descripción',100,false),type:value.type};
  }return out;
 }
 function creditLine(key,level,mixed=false){if(mixed)return null;return lines.find(line=>line.key===key&&(!line.level||line.level===level))?.id||null;}
 function resourceFor(report,values){
  const id=report.creditLineId;if(!lines.some(line=>line.id===id))return null;
  if(report.modality==='Crédito de idiomas'){if(id!=='languages')return null;}else if(report.modality==='Crédito corto plazo'){if(id==='languages'||lines.find(line=>line.id===id).level!==report.level)return null;}else return null;
  try{const item=validateResources({[id]:values?.[id]},true)[id];return item.enabled&&item.url?item:null;}catch{return null;}
 }
 return Object.freeze({lines,types,maintenance,resources,safeURL,validateMaintenance,validateResources,creditLine,resourceFor});
});
