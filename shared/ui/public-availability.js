(function(global){
 'use strict';
 if(!global.OFE_PUBLIC||global.OFE_SERVER)return;
 let checking=null;
 async function check(){
  if(checking)return checking;
  checking=(async()=>{const response=await fetch(global.OFE_PUBLIC.apiBaseUrl+'/status',{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('No fue posible comprobar la disponibilidad pública.');const data=await response.json();if(typeof data.maintenance?.enabled!=='boolean')throw Error('El estado público no es válido.');if(data.maintenance.enabled){document.getElementById('main-content').inert=true;global.location.reload();throw Error('El simulador está en mantenimiento.');}return true;})().finally(()=>{checking=null;});return checking;
 }
 global.OFEPublicAvailability=Object.freeze({check});
 global.SimuladorOFE.register('public-availability',{async init(){await check();
  const permitted=new WeakSet();let pending=false;
  document.addEventListener('click',event=>{
   const button=event.target.closest('[data-action]'),action=button?.dataset.action||'';
   if(!button||!(/^(?:calcular|pdf|xls)(?:-|$)/.test(action))||permitted.has(button))return;
   event.preventDefault();event.stopImmediatePropagation();if(pending)return;pending=true;
   const operation=global.OFELoading?.begin('Comprobando disponibilidad pública');
   check().then(()=>{operation?.end();permitted.add(button);try{button.click();}finally{permitted.delete(button);}}).catch(()=>{document.getElementById('main-content').inert=true;global.location.reload();}).finally(()=>{pending=false;operation?.end();});
  },true);
 const refresh=()=>check().catch(()=>{document.getElementById('main-content').inert=true;global.location.reload();});global.setInterval(refresh,15000);global.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});}});
})(window);
