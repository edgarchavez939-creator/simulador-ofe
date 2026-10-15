(function(global){
 'use strict';
 const $=id=>document.getElementById(id),periods=global.OFERateConverter.periods;
 const pct=value=>Number(value*100).toLocaleString('es-CO',{minimumFractionDigits:2,maximumFractionDigits:6})+' %';
 function input(){return {value:$('tc-valor').value===''?'':Number($('tc-valor').value),sourceType:$('tc-source-type').value,sourcePeriod:$('tc-periodo').value,sourceCapitalization:$('tc-nom-per').value,targetType:$('tc-target-type').value,targetPeriod:$('tc-target-period').value,targetCapitalization:$('tc-target-cap').value};}
 function render(){
  if(!$('tc-selected-result'))return;
  const options=input();$('tc-nom-per-wrap').hidden=options.sourceType!=='nominal';$('tc-target-cap-wrap').hidden=options.targetType!=='nominal';
  $('tc-error').hidden=true;$('tc-valor').removeAttribute('aria-invalid');
  try{
   const data=global.OFERateConverter.equivalent(options);
   $('tc-selected-result').textContent=pct(data.result);$('tc-result-description').textContent='Tasa '+options.targetType+' '+periods[options.targetPeriod].label.toLocaleLowerCase('es-CO')+(options.targetType==='nominal'?', capitalización '+periods[options.targetCapitalization].label.toLocaleLowerCase('es-CO'):'');
   $('tc-source-summary').textContent='Origen: '+pct(options.value/100)+' · '+options.sourceType+' '+periods[options.sourcePeriod].label.toLocaleLowerCase('es-CO');
   $('tc-formula-example').textContent='Con tus datos: '+periods[options.sourcePeriod].n+' períodos de origen y '+periods[options.targetPeriod].n+' de destino por año. Tasa efectiva anual de referencia: '+pct(data.annual)+'.';
   const same=options.sourceType===options.targetType&&options.sourcePeriod===options.targetPeriod&&(options.sourceType!=='nominal'||options.sourceCapitalization===options.targetCapitalization);
   $('tc-result-note').textContent=same?'Origen y destino son iguales; la tasa conserva su valor.':'';
   $('tc-tabla').innerHTML='<div class="table-wrap"><table class="tbl"><thead><tr><th>Período</th><th>Períodos por año</th><th>Tasa efectiva</th><th>Nominal anual</th></tr></thead><tbody>'+data.rows.map(row=>'<tr><td>'+row.label+'</td><td>'+row.n+'</td><td>'+pct(row.effective)+'</td><td>'+pct(row.nominalAnnual)+'</td></tr>').join('')+'</tbody></table></div>';
   global.enhanceTableAccessibility?.($('tc-tabla'));return data;
  }catch(error){$('tc-error').textContent=error.message;$('tc-error').hidden=false;$('tc-valor').setAttribute('aria-invalid','true');$('tc-selected-result').textContent='Revisa la tasa de origen';$('tc-result-description').textContent='';$('tc-source-summary').textContent='';$('tc-formula-example').textContent='Ingresa una tasa válida para ver la referencia anual de este caso.';$('tc-result-note').textContent='';$('tc-tabla').innerHTML='';return null;}
 }
 global.OFERateUI=Object.freeze({render});
 global.SimuladorOFE.register('rate-converter-ui',{init(){
  $('rate-form').addEventListener('submit',event=>{event.preventDefault();if(!render())$('tc-valor').focus();});
  $('rate-form').querySelectorAll('select').forEach(field=>field.addEventListener('change',render));$('tc-valor').addEventListener('input',render);
  $('rate-swap').addEventListener('click',()=>{const data=render();if(!data){$('tc-valor').focus();return;}const previous=input();$('tc-source-type').value=previous.targetType;$('tc-periodo').value=previous.targetPeriod;$('tc-nom-per').value=previous.targetCapitalization;$('tc-target-type').value=previous.sourceType;$('tc-target-period').value=previous.sourcePeriod;$('tc-target-cap').value=previous.sourceCapitalization;$('tc-valor').value=Number((data.result*100).toPrecision(14));render();});render();
 }});
})(window);
