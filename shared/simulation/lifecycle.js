(function(global){
 'use strict';
 const selected=new Map(),epochs=new Map(),pending=new Map();
 const resultKeys={1:'shortTerm',2:'mixed',3:'bank',7:'initialPayment'};
 function clear(tab){
  const app=global.SimuladorOFE,key=resultKeys[tab];if(!key)return;
  app.state.results[key]=null;
  if(tab===2)app.state.results.projectionLP=null;
  if(tab===7){app.state.results.initialPaymentProgramName='';app.state.ui.initialPaymentCapacity=null;}
  app.state.financing.benefits[tab]=[];global.renderBeneficios(tab);
  for(const id of ['cont'+tab+'-pct','cont'+tab+'-val','finvalCP','finvalLP',...(tab===7?['cap7']:[])]){
   if((id.startsWith('finval')&&tab!==2))continue;
   const field=document.getElementById(id);if(field)field.value='';
  }
  app.state.comparison.scenarios[tab]=[];
  const panel=document.getElementById('esc-panel-'+tab);if(panel){panel.innerHTML='';panel.hidden=true;}
  const target=document.getElementById('res'+tab);
  target?.querySelectorAll('canvas').forEach(canvas=>global.Chart?.getChart?.(canvas)?.destroy());
  if(target)target.innerHTML='<div class="card"><div class="empty"><div class="empty__title">Nueva simulación</div><div class="empty__desc">Confirma los datos y vuelve a calcular para ver los resultados del programa seleccionado.</div></div></div>';
  const alert=document.getElementById('alert'+tab);if(alert){alert.hidden=true;alert.textContent='';}
  global.markViewHasResult(tab,false);
  document.querySelectorAll('#toasts [data-simulation-tab="'+tab+'"]').forEach(message=>message.remove());
  if(app.state.languages.context.tabId===tab){
   app.state.results.languages=null;app.state.results.projectionLanguagesLP=null;
   app.state.languages.context={};app.state.languages.benefits=[];
   const result=document.getElementById('res-idiomas');if(result)result.innerHTML='';
   const modal=document.getElementById('modal-idiomas');if(modal&&!modal.hidden)global.cerrarIdiomas();
  }
 }
 function beforeProgramChange(tab,id){
  const old=selected.get(tab)||'',next=id||'';if(old===next)return;
  selected.set(tab,next);epochs.set(tab,(epochs.get(tab)||0)+1);
  const app=global.SimuladorOFE;
  const dependent=app.state.results[resultKeys[tab]]||(tab===2&&app.state.results.projectionLP)||
   (app.state.languages.context.tabId===tab&&app.state.results.languages)||pending.has(tab);
  if(dependent)clear(tab);
 }
 function begin(tab){const epoch=epochs.get(tab)||0;pending.set(tab,epoch);return epoch;}
 function current(tab,epoch){return (epochs.get(tab)||0)===epoch;}
 function end(tab,epoch){if(pending.get(tab)===epoch)pending.delete(tab);}
 global.SimulationLifecycle=Object.freeze({beforeProgramChange,clear,begin,current,end});
})(window);
