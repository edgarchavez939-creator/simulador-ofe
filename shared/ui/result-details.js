/* Result presentation only. The financial snapshots and engines remain unchanged. */
(function(global){
 'use strict';
 const money=value=>'$ '+Number(value).toLocaleString('es-CO',{maximumFractionDigits:0});
 const percent=value=>(value*100).toLocaleString('es-CO',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
 function cards(key,data){
  const report=global.OFEReport.normalize(key,data),initial=report.sections.find(s=>s.title==='Aporte inicial');
  if(!initial)return [];
  const total=initial.fields.find(f=>f.label==='Total inicial'),cash=initial.fields.find(f=>/^Cuota inicial/.test(f.label));
  const tuition=report.sections.find(s=>s.title==='Matrícula'||s.title==='Valor de idiomas');
  const net=tuition?.fields.find(f=>f.label==='Valor neto')||tuition?.fields[0];
  const items=[{label:'Pago total de contado',value:total.value,detail:key===3?'Pago inicial al desembolso · contado y otros cargos':'Pago inicial al desembolso · contado y Garantisa',total:true}];
  if(cash)items.push({label:key==='languages'?'Contado de idiomas':'Contado de matrícula',value:cash.value,detail:net?.value>0?percent(cash.value/net.value)+(key==='languages'?' del valor de idiomas':net.label==='Valor neto'?' de la matrícula neta':' de la matrícula'):''});
  for(const field of initial.fields){
   if(field===cash||field===total)continue;
   const metadata=report.sections.find(s=>s.title===(field.label==='Aporte Garantisa'?'Garantisa':field.label));
   const rate=metadata?.fields.find(f=>f.label==='Porcentaje aplicado')?.value,base=metadata?.fields.find(f=>f.label==='Base de cálculo')?.value;
   items.push({label:field.label,value:field.value,detail:Number.isFinite(rate)&&Number.isFinite(base)?percent(rate)+' sobre '+money(base)+' financiados':''});
  }
  return items;
 }
 function render(key,data){
  const root=document.getElementById(key==='languages'?'res-idiomas':'res'+key);if(!root)return;
  const titles=Array.from(root.querySelectorAll('.section__title'));
  let grid=key===7?root.querySelector('.financial-details > .kpi-grid'):titles.find(t=>/^Pago inicial/i.test(t.textContent.trim()))?.nextElementSibling;
  if(grid?.classList.contains('kpi-grid')){
   grid.classList.add('initial-payment-grid');grid.replaceChildren(...cards(key,data).map(item=>{
    const card=document.createElement('div');card.className='kpi'+(item.total?' kpi--accent initial-payment-total':'');
    for(const [tag,className,text] of [['div','kpi__label',item.label],['div','kpi__value kpi__value--md',money(item.value)],['div','kpi__foot',item.detail]]){if(!text)continue;const node=document.createElement(tag);node.className=className;node.textContent=text;card.appendChild(node);}
    return card;
   }));
  }
  for(const title of titles){
   if(!/Crédito a amortizar/i.test(title.textContent))continue;
   for(const label of title.nextElementSibling?.querySelectorAll('.kpi__label')||[]){
    if(label.textContent.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()==='valor matricula')label.closest('.kpi')?.remove();
   }
  }
 }
 global.OFEResultDetails=Object.freeze({cards});
 global.SimuladorOFE.register('result-details-v14',{init(){
  for(const [name,key] of [['calcular1',1],['calcular2',2],['calcular3',3],['calcular7',7],['calcularIdiomas','languages']]){
   const original=global[name];if(typeof original!=='function')continue;
   global[name]=function(...args){const before=global.OFEReport.result(key),value=original.apply(this,args),after=global.OFEReport.result(key);if(after&&after!==before)render(key,after);return value;};
  }
 }});
})(window);
