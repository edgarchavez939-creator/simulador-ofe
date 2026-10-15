(function(global){
 'use strict';
 const defaults=Object.freeze({default_interest_rate:1.53,default_installments:6,garantisa_cp_percent:4.17,garantisa_lp_percent:2.86});
 const immutable=data=>Object.freeze({...data,values:Object.freeze({...data.values})});
 let latest=immutable({values:defaults,version:0,updated_at:null}),context=null;
 const snapshots=new Map(),keys={1:'shortTerm',2:'mixed',3:'bank',7:'initialPayment'},texts=new WeakMap(),attributes=new WeakMap();
 const result=tab=>tab===5?global.SimuladorOFE.state.restructuring.current:global.SimuladorOFE.state.results[keys[tab]];
 const snapshot=tab=>snapshots.get(tab)||latest;
 function current(){return context||latest;}
 async function refresh(){
  if(global.OFE_SERVER){const data=await global.OFEAuth.request('/api/simulation-settings');latest=immutable(data);}
  return latest;
 }
 async function renew(tab){const data=await refresh();snapshots.set(tab,data);return data;}
 async function prepare(tab,isCurrent=()=>true){
  if(result(tab))return;
  const previous=snapshot(tab),before={};
  const ids=tab===5?['refi-tasa-nva']:['tasa'+tab,...(tab===1?['plazo1']:tab===2?['plazoCP']:tab===7?['plazo7']:[])];
  for(const id of ids)before[id]=document.getElementById(id)?.value;
  const data=await refresh();if(!isCurrent())return;snapshots.set(tab,data);
  for(const id of ids){const field=document.getElementById(id),key=id.includes('tasa')?'default_interest_rate':'default_installments';if(field&&field.value===before[id]&&Number(before[id])===previous.values[key])field.value=data.values[key];}
  updateEquivalent(tab);
 }
 function updateEquivalent(tab){if([1,2,3].includes(tab))global.calcTA?.(tab);if(tab===7)global.calcTa7?.();if(tab===5)global.calcTaRefi?.('nva');}
 function applyDefaults(tab){
  const data=snapshot(tab).values;
  const fields=tab===5?{'refi-tasa-nva':data.default_interest_rate}:{['tasa'+tab]:data.default_interest_rate};
  if(tab===1)fields.plazo1=data.default_installments;if(tab===2)fields.plazoCP=data.default_installments;if(tab===7)fields.plazo7=data.default_installments;
  for(const [id,value] of Object.entries(fields)){const field=document.getElementById(id);if(field)field.value=value;}
 }
 function withSnapshot(data,task){const previous=context;context=data;try{return task();}finally{context=previous;}}
 function labels(root,data){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  const cp=data.values.garantisa_cp_percent.toLocaleString('es-CO',{minimumFractionDigits:2,maximumFractionDigits:2});
  const lp=data.values.garantisa_lp_percent.toLocaleString('es-CO',{minimumFractionDigits:2,maximumFractionDigits:2});
  const replace=value=>value.replace(/4[.,]17\s*%/g,cp+'%').replace(/2[.,]86\s*%/g,lp+'%').replace(/\s*(?:=\s*3\.5%\+IVA|\(3\.5% \+ IVA\))/g,data.values.garantisa_cp_percent===4.17?' (3.5% + IVA)':'');
  root.querySelectorAll('.guarantee-info .tip').forEach(element=>{
   const original=attributes.get(element)||{label:element.getAttribute('aria-label'),tip:element.getAttribute('data-tip')};attributes.set(element,original);
   if(original.label)element.setAttribute('aria-label',replace(original.label));if(original.tip)element.setAttribute('data-tip',replace(original.tip));
  });
  while((node=walker.nextNode())){
   if(['SCRIPT','STYLE','OPTION','TEXTAREA'].includes(node.parentElement?.tagName))continue;
   const original=texts.get(node)||node.nodeValue;
   if(!/Garantisa/i.test(original)&&!node.parentElement?.closest('.guarantee-info'))continue;
   if(!/4[.,]17\s*%|2[.,]86\s*%/.test(original))continue;
   texts.set(node,original);
   node.nodeValue=replace(original);
  }
 }
 function adopt(data){
  latest=immutable(data);
  // Existing inputs, results, documents and snapshots stay untouched.
 }
 global.OFEGlobalSettings=Object.freeze({current,snapshot,refresh,renew,prepare,applyDefaults,withSnapshot,adopt});
 global.SimuladorOFE.register('global-simulation-settings',{
  async init(){
   if(!global.OFE_SERVER)return;
   await refresh();
   // The existing financial regression checks use the original reference percentages.
   // Run them in an isolated context, never against an administrator's live defaults.
   const selfTests=global.runFinancialSelfTests;
   if(typeof selfTests==='function')global.runFinancialSelfTests=function(...args){return withSnapshot(immutable({values:defaults,version:0}),()=>selfTests.apply(this,args));};
   for(const tab of [1,2,3,5,7]){snapshots.set(tab,latest);applyDefaults(tab);}
   function wrap(name,tab,output){
    const original=global[name];if(typeof original!=='function')return;
    global[name]=function(...args){
     const actual=typeof tab==='function'?tab(...args):tab;
     const data=snapshot(actual),before=output?result(actual):null;
     return withSnapshot(data,()=>{
      const value=original.apply(this,args);
      const after=output?result(actual):null;
      if(after&&after!==before){after.settingsSnapshot=data;for(const key of actual===2?['projectionLP']:[])if(global.SimuladorOFE.state.results[key])global.SimuladorOFE.state.results[key].settingsSnapshot=data;}
      labels(document.getElementById('tab'+actual),data);return value;
     });
    };
   }
   for(const tab of [1,2,3,7])wrap('calcular'+tab,tab,true);
   wrap('calcularRefi',5,true);wrap('recalcAll',tab=>Number(tab));wrap('recalc7',7);
   const originalOpen=global.abrirIdiomas;
   global.abrirIdiomas=function(tab){return withSnapshot(result(tab)?.settingsSnapshot||snapshot(tab),()=>{const value=originalOpen(tab);global.SimuladorOFE.state.languages.context.settingsSnapshot=result(tab)?.settingsSnapshot||snapshot(tab);return value;});};
   for(const name of ['recalcId','calcularIdiomas']){
    const original=global[name];global[name]=function(...args){const data=global.SimuladorOFE.state.languages.context.settingsSnapshot||latest;return withSnapshot(data,()=>{const value=original.apply(this,args);if(name==='calcularIdiomas'){for(const key of ['languages','projectionLanguagesLP'])if(global.SimuladorOFE.state.results[key])global.SimuladorOFE.state.results[key].settingsSnapshot=data;}labels(document.getElementById('modal-idiomas'),data);return value;});};
   }
   for(const tab of [1,2,3,5,7])labels(document.getElementById('tab'+tab),snapshot(tab));
  }
 });
})(window);
