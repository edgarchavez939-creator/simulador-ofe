/* PDF B + C: one shared renderer for the internal, public and standalone apps. */
(function(global){
 'use strict';
 const single=key=>()=>global.OFEPdf.download([global.OFEReport.pdf(key)]);
 for(const [name,key] of [['expPDF1',1],['expPDF2',2],['expPDF3',3],['expPDF7',7],['expPDFIdiomas','languages'],['expPDFRefi',5]])global[name]=single(key);
 global.expPDFCombinado=()=>{
  const tab=global.SimuladorOFE.state.languages.context.tabId;
  return global.OFEPdf.download([global.OFEReport.pdf(tab),global.OFEReport.pdf('languages')]);
 };
 global.expPDFRefiComp=()=>{
  const scenarios=global.SimuladorOFE.state.restructuring.scenarios;
  if(scenarios.length<2)return global.toast('Guarda al menos 2 escenarios para comparar.','warning');
  return global.OFEPdf.download(scenarios.map((d,i)=>({...global.OFEReport.pdf(5,d),modality:'Reestructuración · Escenario '+(i+1)})));
 };
 global.SimuladorOFE?.register('pdf-bc-v13',{init(app){Object.assign(app.services.exports||= {},Object.fromEntries(['expPDF1','expPDF2','expPDF3','expPDF7','expPDFIdiomas','expPDFRefi','expPDFCombinado','expPDFRefiComp'].map(name=>[name,global[name]])));}});
})(window);
