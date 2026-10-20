(function(global){
 'use strict';
 const schema=global.OFEPublicModuleDefinitions;
 let values=schema.defaults;
 function allowed(tab){const item=schema.definitions.find(item=>item.tab===Number(tab));return !!item&&values[item.key]===true;}
 function selectFirst(){return schema.definitions.find(item=>values[item.key])?.tab??null;}
 function apply(){
  document.querySelectorAll('.nav__item[data-tab],[data-action="switch-tab"],[data-action="open-compare"]').forEach(button=>{const tab=button.dataset.action==='open-compare'?8:Number(button.dataset.tab);button.hidden=!allowed(tab);});
  document.querySelectorAll('nav.nav .nav__label').forEach(label=>{let button=label.nextElementSibling,visible=false;while(button&&!button.classList.contains('nav__label')){if(button.matches('.nav__item')&&!button.hidden)visible=true;button=button.nextElementSibling;}label.hidden=!visible;});
 }
 global.OFEPublicNavigation=Object.freeze({allowed,first:selectFirst,get values(){return values;}});
 global.SimuladorOFE.register('public-module-navigation',{
  async init(){
   if(global.OFE_SERVER)return;
   if(global.OFE_PUBLIC){const data=await global.ProgramCatalogHttp.request(global.OFE_PUBLIC.apiBaseUrl+'/modules');values=schema.validate(data.values);}
   const original=global.switchTab;
   global.switchTab=function(tab){if(!allowed(tab)){global.toast('Esta opción no está disponible en el simulador público.','info');return;}const result=original.apply(this,arguments);apply();return result;};
   apply();const first=selectFirst();
   if(first!==null){if(first!==1)global.switchTab(first);}
   else{
    document.querySelectorAll('.view[data-view]').forEach(view=>{view.hidden=true;});
    const empty=document.createElement('section');empty.className='card public-modules-empty';empty.setAttribute('role','status');empty.innerHTML='<h2>Sin opciones públicas disponibles</h2><p>En este momento no hay módulos habilitados. Vuelve a consultar más adelante.</p>';document.getElementById('main-content').appendChild(empty);
    document.getElementById('header-title').textContent='Simulador público';document.getElementById('header-desc').textContent='Consulta las opciones habilitadas por la Oficina de Financiamiento Estudiantil.';
   }
   // Result actions and history can create navigation buttons after calculation.
   if(global.MutationObserver){const observer=new global.MutationObserver(apply);observer.observe(document.getElementById('main-content'),{childList:true,subtree:true});}
  }
 });
})(window);
