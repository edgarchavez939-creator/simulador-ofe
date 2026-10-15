(function(global){
 'use strict';
 global.SimuladorOFE.register('admin-settings',{
  async init(){
   if(!global.OFE_SERVER||!global.OFEPermissions.allowed('settings.read'))return;
   const $=id=>document.getElementById(id),e=global.escHTML;
   const definitions={
    default_interest_rate:{label:'Tasa por defecto (% M.V.)',group:'simulation',min:0,max:10,step:0.01,hint:'Valor inicial para corto plazo, mixto, banco aliado, cuota inicial y reestructuración. Puedes ajustar la tasa en cada escenario. Rango compatible con las modalidades actuales: 0–10 %.'},
    default_installments:{label:'Cuotas por defecto',group:'simulation',min:1,max:60,step:1,hint:'Meses iniciales para corto plazo, la porción CP del mixto y cuota inicial. Se conservan 12 meses de Banco Aliado y 24 de Reestructuración. Rango común compatible: 1–60.'},
    garantisa_cp_percent:{label:'Garantisa corto plazo (%)',group:'guarantee',min:0,max:100,step:0.01,hint:'Aporte total sobre el monto financiado CP, sin incluirlo en el capital amortizado. Aplica a corto plazo, porción CP del mixto, idiomas y cuota inicial. No aplica al banco ni a reestructuración.'},
    garantisa_lp_percent:{label:'Garantisa largo plazo (%)',group:'guarantee',min:0,max:100,step:0.01,hint:'Aporte total sobre el capital LP en mixto, idiomas mixtos y sus proyecciones. No cambia la regla del plazo de pago al graduarse.'}
   };
   let saved=null,saving=false;
   const fields=group=>Object.entries(definitions).filter(([,d])=>d.group===group).map(([key,d])=>`<div class="field"><label class="field__label" for="setting-${key}">${e(d.label)}</label><input id="setting-${key}" name="${key}" class="input" type="number" min="${d.min}" max="${d.max}" step="${d.step}" required aria-describedby="help-${key}"><p id="help-${key}" class="field__hint">${e(d.hint)}</p></div>`).join('');
   $('main-content').insertAdjacentHTML('beforeend',`<section id="tab12" data-view="12" class="view view--admin" hidden><div class="admin-heading"><div><h2>Configuración</h2><p>Administra los parámetros que se usarán en nuevas simulaciones.</p></div><button id="settings-reload" class="btn" type="button">Recargar valores</button></div><div id="settings-summary" class="settings-summary" role="status"></div><p class="note">Los resultados calculados conservan sus valores. Usa «Nueva simulación» para aplicar una configuración actualizada.</p><form id="settings-form"><div class="card"><h3>Simulación</h3><p class="text-muted-md">Valores iniciales para facilitar la captura de cada escenario.</p><div class="tool-grid-2">${fields('simulation')}</div></div><div class="card"><h3>Garantisa</h3><p class="text-muted-md">Porcentajes totales del aporte. Se conserva la base de cálculo de cada modalidad.</p><div class="tool-grid-2">${fields('guarantee')}</div></div><div class="admin-toolbar"><button id="settings-save" class="btn btn--primary" type="submit">Revisar y guardar cambios</button><span id="settings-version" class="field__hint"></span></div><p id="settings-feedback" role="status" hidden></p></form></section>`);
   const nav=document.querySelector('nav.nav'),button=document.createElement('button');button.type='button';button.className='nav__item';button.dataset.tab='12';button.innerHTML=global.icon('settings')+'<span class="nav__item-text">Configuración</span>';nav.appendChild(button);
   function feedback(message,error=false){$('settings-feedback').textContent=message;$('settings-feedback').hidden=!message;$('settings-feedback').className='feedback feedback--'+(error?'danger':'success');}
   function render(){
    for(const key of Object.keys(definitions))$('setting-'+key).value=saved.values[key];
    const n=value=>Number(value).toLocaleString('es-CO',{maximumFractionDigits:2});
    $('settings-summary').innerHTML=[['Tasa por defecto',n(saved.values.default_interest_rate)+' % M.V.'],['Cuotas por defecto',n(saved.values.default_installments)],['Garantisa CP / LP',n(saved.values.garantisa_cp_percent)+' % / '+n(saved.values.garantisa_lp_percent)+' %'],['Actualización',new Date(saved.updated_at).toLocaleString('es-CO')]].map(([label,value])=>`<div><small>${e(label)}</small><strong>${e(value)}</strong></div>`).join('');
    $('settings-version').textContent='Versión '+saved.version;$('settings-save').disabled=!global.OFEPermissions.allowed('settings.update');
   }
   async function load(){
    $('settings-reload').disabled=true;$('settings-form').inert=true;if(!saved)$('settings-summary').textContent='Cargando configuración…';
    try{saved=await global.OFEAuth.request('/api/admin/settings');render();feedback('');}catch(error){feedback(error.message,true);}finally{$('settings-reload').disabled=false;$('settings-form').inert=false;}
   }
   button.addEventListener('click',()=>{global.switchTab(12);load();});$('settings-reload').addEventListener('click',load);
   $('settings-form').addEventListener('submit',event=>{
    event.preventDefault();if(!saved||saving)return;
    const version=saved.version,changes={};
    for(const key of Object.keys(definitions)){const value=Number($('setting-'+key).value);if(value!==saved.values[key])changes[key]=value;}
    if(!Object.keys(changes).length){feedback('No hay cambios para guardar.');return;}
    const summary=Object.entries(changes).map(([key,value])=>definitions[key].label+': '+saved.values[key].toLocaleString('es-CO')+' → '+value.toLocaleString('es-CO')).join('\n');
    global.confirmAction({title:'Actualizar configuración global',message:summary+'\n\nEste cambio afectará las nuevas simulaciones que utilicen estos parámetros.',confirmLabel:'Guardar configuración',tone:'primary',onConfirm:async()=>{
     saving=true;$('settings-save').disabled=true;$('settings-form').setAttribute('aria-busy','true');
     try{saved=await global.OFEAuth.request('/api/admin/settings',{method:'PUT',body:JSON.stringify({version,changes})});global.OFEGlobalSettings.adopt(saved);render();feedback('Configuración guardada y auditada. Inicia una nueva simulación para usarla.');}
     catch(error){feedback(error.message,true);if(error.field&&$('setting-'+error.field)){$('setting-'+error.field).setAttribute('aria-invalid','true');$('setting-'+error.field).focus();}}
     finally{saving=false;$('settings-save').disabled=false;$('settings-form').removeAttribute('aria-busy');}
    }});
   });
   if(new URLSearchParams(location.search).get('admin')==='settings'){global.switchTab(12);await load();}
  }
 });
})(window);
