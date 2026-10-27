(function(global){
 'use strict';
 const S=global.OFETextSchema,keys={1:'shortTerm',2:'mixed',3:'bank',7:'initialPayment'};
 const freeze=data=>Object.freeze({version:data.version||0,values:Object.freeze({...data.values})});
 let latest=freeze({values:S.defaults}),inflight=null;
 const navOriginal=new WeakMap();
 function view(tab,meta){if(!meta)return meta;return {...meta,title:latest.values['ui_module_'+tab+'_title']||meta.title,desc:latest.values['ui_module_'+tab+'_description']||meta.desc};}
 function apply(){
  document.querySelectorAll('[data-text-key]').forEach(el=>{const value=latest.values[el.dataset.textKey];if(value!==undefined)el.textContent=value;});
  document.querySelectorAll('[data-text-tip]').forEach(el=>{const value=latest.values[el.dataset.textTip];if(value!==undefined){el.setAttribute('data-tip',value);el.setAttribute('aria-label','Ayuda: '+value);}});
  document.querySelectorAll('.nav__item[data-tab]').forEach(button=>{const key='ui_module_'+button.dataset.tab+'_title',span=button.querySelector('.nav__item-text');if(!span||!S.definitions[key])return;if(!navOriginal.has(span))navOriginal.set(span,span.textContent);span.textContent=latest.values[key]===S.defaults[key]?navOriginal.get(span):latest.values[key];button.setAttribute('aria-label',span.textContent);button.dataset.tooltip=span.textContent;});
  const active=document.querySelector('.view[data-view]:not([hidden])'),tab=active?.dataset.view,title=latest.values['ui_module_'+tab+'_title'];if(title){const el=document.getElementById('header-title'),desc=document.getElementById('header-desc');if(el)el.textContent=title;if(desc)desc.textContent=latest.values['ui_module_'+tab+'_description'];document.title=title+' · Simulador OFE';}
 }
 function adopt(data){latest=freeze({values:S.validate(data.values),version:data.version});apply();return latest;}
 async function refresh(){
  if(!global.OFE_SERVER&&!global.OFE_PUBLIC)return latest;
  if(!inflight)inflight=(async()=>{const data=global.OFE_SERVER?await global.OFEAuth.request('/api/text-settings'):await global.ProgramCatalogHttp.request(global.OFE_PUBLIC.apiBaseUrl+'/text-settings');return adopt(data);})().finally(()=>{inflight=null;});return inflight;
 }
 const result=tab=>tab===5?global.SimuladorOFE.state.restructuring.current:global.SimuladorOFE.state.results[keys[tab]];
 global.OFETextSettings=Object.freeze({current:()=>latest,refresh,adopt,apply,view});
 global.SimuladorOFE.register('text-content',{
  async init(){
   await refresh();apply();
   for(const [name,tab] of [['calcular1',1],['calcular2',2],['calcular3',3],['calcular7',7],['calcularRefi',5],['calcularIdiomas','languages']]){
    const original=global[name];if(typeof original!=='function')continue;
    global[name]=function(...args){const prior=tab==='languages'?global.SimuladorOFE.state.results.languages:result(tab),value=original.apply(this,args),after=tab==='languages'?global.SimuladorOFE.state.results.languages:result(tab);if(after&&after!==prior)after.textSettingsSnapshot=tab==='languages'?(result(global.SimuladorOFE.state.languages.context.tabId)?.textSettingsSnapshot||latest):latest;return value;};
   }
  }
 });
})(window);
