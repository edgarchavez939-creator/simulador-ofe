(function(global){
 'use strict';
 const tasks=new Map();let serial=0,layer=null,saved=[],focus=null,busyBefore=null,modalAtStart=null,returnFocus=null;
 const state=()=>Array.from(tasks.values()).map(task=>({...task}));
 function ensure(){
  if(layer?.isConnected)return layer;
  if(!document.body||typeof document.body.insertAdjacentHTML!=='function')return null;
  document.body.insertAdjacentHTML('beforeend','<div id="system-loading" class="system-loading" popover="manual" hidden tabindex="-1" aria-label="Operación en curso"><section class="system-loading__card"><div id="loading-ring" class="loading-ring" role="progressbar" aria-label="Avance de la operación"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="loading-ring__track" cx="32" cy="32" r="27"/><circle class="loading-ring__value" cx="32" cy="32" r="27"/></svg><span id="loading-percent"></span></div><h2 id="loading-title"></h2><p id="loading-message" role="status" aria-live="polite" aria-atomic="true"></p><small id="loading-count"></small></section></div>');
  layer=document.getElementById('system-loading');
  layer.addEventListener('keydown',event=>{if(tasks.size&&['Tab','Escape'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();}});
  return layer;
 }
 function render(){
  const box=ensure();if(!box)return;
  if(!tasks.size){
   const restoreFocus=document.activeElement===box;if(box.matches(':popover-open'))box.hidePopover();box.hidden=true;
   for(const [element,wasInert] of saved)if(element.isConnected)element.inert=wasInert;saved=[];
   const modalNow=document.querySelector?.('.scrim[data-open="true"]'),application=document.querySelector?.('.app');
   if(application&&modalNow!==modalAtStart)application.inert=!!modalNow;
   if(busyBefore===null)document.body.removeAttribute('aria-busy');else document.body.setAttribute('aria-busy',busyBefore);
   if(restoreFocus){const target=[focus,returnFocus,document.querySelector?.('.nav__item[aria-current="page"]')].find(el=>el?.isConnected&&!el.disabled&&el.getClientRects().length&&!el.closest?.('[aria-hidden="true"]'));target?.focus({preventScroll:true});}focus=null;returnFocus=null;modalAtStart=null;return;
  }
  if(box.hidden){
   global.OFEUI?.closePopover();focus=document.activeElement;modalAtStart=document.querySelector?.('.scrim[data-open="true"]');returnFocus=global.SimuladorOFE?.state?.ui?.modalReturnFocus||null;busyBefore=document.body.getAttribute('aria-busy');
   saved=Array.from(document.body.children).filter(el=>el!==box).map(el=>[el,el.inert]);for(const [element] of saved)element.inert=true;
   box.hidden=false;document.body.setAttribute('aria-busy','true');if(box.showPopover)box.showPopover();box.focus({preventScroll:true});
  }
  for(const element of Array.from(document.body.children)){if(element===box)continue;if(!saved.some(([item])=>item===element))saved.push([element,element.inert]);element.inert=true;}
  if(box.contains&&!box.contains(document.activeElement))box.focus({preventScroll:true});
  const all=state(),primary=all.find(task=>task.total>0)||all[0],latest=all.at(-1),ring=document.getElementById('loading-ring');
  const measured=primary.total>0,percent=measured?Math.floor(primary.completed/primary.total*100):null;
  document.getElementById('loading-title').textContent=primary.title;
  document.getElementById('loading-message').textContent=latest.message||primary.message||'Procesando…';
  document.getElementById('loading-count').textContent=measured?primary.completed+' de '+primary.total+' etapas completadas':'Operación en curso';
  document.getElementById('loading-percent').textContent=measured?percent+'%':'';
  ring.dataset.measured=String(measured);ring.style.setProperty('--loading-progress',measured?String(percent):'25');
  if(measured){ring.setAttribute('aria-valuemin','0');ring.setAttribute('aria-valuemax','100');ring.setAttribute('aria-valuenow',String(percent));}else{for(const name of ['aria-valuemin','aria-valuemax','aria-valuenow'])ring.removeAttribute(name);}
  ring.setAttribute('aria-valuetext',measured?percent+' % · '+primary.completed+' de '+primary.total+' etapas':'En curso: '+(latest.message||primary.title));
 }
 function begin(title,initial={}){
  const id=++serial;tasks.set(id,{id,title,message:initial.message||'Preparando la operación…',completed:0,total:0});
  const handle={update(values={}){const task=tasks.get(id);if(!task)return;const total=Number(values.total??task.total),completed=Number(values.completed??task.completed);if(Number.isSafeInteger(total)&&total>0&&Number.isFinite(completed)){task.total=total;task.completed=Math.max(task.completed,Math.min(total,Math.max(0,completed)));}if(values.message)task.message=values.message;render();},end(){if(tasks.delete(id))render();},async checkpoint(values){handle.update(values);await new Promise(resolve=>global.requestAnimationFrame(()=>global.setTimeout(resolve,0)));}};
  handle.update(initial);return Object.freeze(handle);
 }
 async function run(title,task){const operation=begin(title);try{await operation.checkpoint({});return await task(operation);}finally{operation.end();}}
 global.OFELoading=Object.freeze({begin,run,state});
})(window);
