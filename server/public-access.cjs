'use strict';
const fs=require('node:fs'),path=require('node:path');
function publicOptions(env=process.env){
 if(env.OFE_PUBLIC_ENABLED!==undefined&&!['0','1'].includes(env.OFE_PUBLIC_ENABLED))throw Error('OFE_PUBLIC_ENABLED debe ser 0 o 1.');
 return {publicEnabled:env.OFE_PUBLIC_ENABLED==='1',publicFrameOrigins:(env.OFE_PUBLIC_FRAME_ORIGINS||'').split(/\s+/).filter(Boolean)};
}
function frameOrigins(values=[]){
 if(!Array.isArray(values))throw Error('Los orígenes del iframe deben ser una lista.');
 return [...new Set(values.map(value=>{
  let url;try{url=new URL(value);}catch{throw Error('Origen de iframe inválido.');}
  if(typeof value!=='string'||/[\s;,"'\\*]/.test(value)||url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('Usa un origen HTTPS exacto, sin ruta, para autorizar el iframe.');
  return url.origin;
 }))];
}
// Only assets referenced by the public document (and its CSS) become anonymous.
function publicAssets(root){
 const assets=new Set(),html=fs.readFileSync(path.join(root,'apps/public/index.html'),'utf8');
 function add(reference,base){
  if(/^(?:https?:|data:|blob:|#)/i.test(reference))return;
  const url=new URL(reference,'https://assets.invalid'+base),route=url.pathname;
  if(route==='/apps/public/runtime-config.js')return;
  if(!route.startsWith('/apps/public/')&&!route.startsWith('/shared/'))throw Error('Recurso fuera de la aplicación pública.');
  if(assets.has(route))return;
  const file=path.resolve(root,'.'+route);if(!file.startsWith(root+path.sep)||!fs.existsSync(file))throw Error('Recurso público inexistente: '+route);
  assets.add(route);
  if(path.extname(file)==='.css')for(const match of fs.readFileSync(file,'utf8').matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g))add(match[1],route);
 }
 for(const match of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["']/g))add(match[1],'/apps/public/index.html');
 return assets;
}
function publicProgram(data){
 return Object.fromEntries(['id','codigo','nombre','nivel','subnivel','valorMatricula','valorIdiomas','semestres','activo'].filter(key=>Object.hasOwn(data,key)).map(key=>[key,data[key]]));
}
function publicSettings(data){return {values:Object.fromEntries(['default_interest_rate','default_installments','garantisa_cp_percent','garantisa_lp_percent'].map(key=>[key,data.values[key]]))};}
module.exports={publicOptions,frameOrigins,publicAssets,publicProgram,publicSettings};
