/* Presentation only: reuse financing bases and configuration; preserve engine outputs. */
(function(global){
 'use strict';
 const money=value=>'$'+Number(value).toLocaleString('es-CO',{maximumFractionDigits:0});
 function format(base,amount,rate,label='Aporte Garantisa'){
  if(!(base>0))return {title:label+': —',detail:'Selecciona un programa y define el valor a financiar.'};
  const percent=(rate*100).toLocaleString('es-CO',{minimumFractionDigits:2,maximumFractionDigits:2});
  return {title:label+': '+money(amount),detail:percent+'% sobre '+money(base)+' financiados'};
 }
 function render(labelId,valueId,base,amount,rate,label){
  const title=document.getElementById(labelId),detail=document.getElementById(valueId);if(!title||!detail)return;
  const text=format(base,amount,rate,label);title.textContent=text.title;detail.textContent=text.detail;
 }
 function inSnapshot(tab,task){const settings=global.OFEGlobalSettings;return settings?settings.withSnapshot(settings.snapshot(tab),task):task();}
 function shortTerm(){inSnapshot(1,()=>{const base=global.getFinanciado(1),rate=global.SimuladorOFE.config.garantisaCP;render('garantisa1-label','garantisa1-val',base,base*rate,rate);});}
 function mixed(){inSnapshot(2,()=>{
  for(const [segment,key] of [['CP','garantisaCP'],['LP','garantisaLP']]){
   // Match the preview's rounded segment base, including while its amount input has focus.
   const percent=parseFloat(document.getElementById('pct'+segment)?.value)||0;
   const base=Math.round(global.getMat(2)*percent/100),rate=global.SimuladorOFE.config[key];
   render('garantisa-'+segment.toLowerCase()+'-label','g'+segment+'-val',base,base*rate,rate,'Aporte Garantisa '+segment);
  }
 });}
 function initialPayment(model){if(model)render('garantisa7-label','gar7-val',model.fin,model.gar,model.fundRate);}
 global.OFEGuaranteeCopy=Object.freeze({format});
 global.SimuladorOFE.register('guarantee-copy',{
  init(){
   for(const [name,after] of [['recalcAll',tab=>{if(Number(tab)===1)shortTerm();if(Number(tab)===2)mixed();}],['updateSplit2',mixed]]){
    const original=global[name];if(typeof original!=='function')continue;
    global[name]=function(...args){const result=original.apply(this,args);after(...args);return result;};
   }
   const recalc=global.recalc7;
   if(typeof recalc==='function')global.recalc7=function(...args){const model=recalc.apply(this,args);initialPayment(model);return model;};
   shortTerm();mixed();global.recalc7?.();
  }
 });
})(window);
