(function(global){
 'use strict';
 global.SimuladorOFE.register('admin-settings',{
  async init(){
   if(!global.OFE_SERVER||!global.OFEPermissions.allowed('settings.read'))return;
   const $=id=>document.getElementById(id),e=global.escHTML;
   const definitions={
    default_interest_rate:{label:'Tasa por defecto',unit:'% M.V.',group:'simulation',min:0,max:10,step:0.01,hint:'Tasa inicial de las nuevas simulaciones. Puede ajustarse en cada escenario. Entre 0 y 10 %.'},
    default_installments:{label:'Cuotas por defecto',unit:'meses',group:'simulation',min:1,max:60,step:1,hint:'Plazo inicial de corto plazo, la porción CP del mixto y cuota inicial. Entre 1 y 60 meses.'},
    garantisa_cp_percent:{label:'Garantisa corto plazo',unit:'%',group:'guarantee',min:0,max:100,step:0.01,hint:'Aporte sobre el monto financiado a corto plazo, sin sumarlo al capital amortizado. Incluye idiomas y cuota inicial.'},
    garantisa_lp_percent:{label:'Garantisa largo plazo',unit:'%',group:'guarantee',min:0,max:100,step:0.01,hint:'Aporte sobre el capital a largo plazo en créditos mixtos, idiomas mixtos y sus proyecciones.'}
   };
   let saved=null,saving=false,editing=false;
   const n=value=>Number(value).toLocaleString('es-CO',{maximumFractionDigits:2});
   const fields=group=>Object.entries(definitions).filter(([,d])=>d.group===group).map(([key,d])=>`<div class="parameter-row"><div class="parameter-copy"><label class="field__label" for="setting-${key}">${e(d.label)}</label><p id="help-${key}" class="field__hint">${e(d.hint)}</p><small class="parameter-updated" id="updated-${key}"></small></div><div class="parameter-value"><strong id="value-${key}"></strong><div class="parameter-input" hidden><input id="setting-${key}" name="${key}" class="input" type="number" min="${d.min}" max="${d.max}" step="${d.step}" required disabled aria-describedby="help-${key}"><span>${e(d.unit)}</span></div></div></div>`).join('');
   $('main-content').insertAdjacentHTML('beforeend',`<section id="tab12" data-view="12" class="view view--admin" hidden><div class="settings-topline"><p id="settings-summary" role="status">Cargando configuración…</p><button id="settings-edit" class="btn" type="button" disabled>${global.icon('pencil')} Editar parámetros</button></div><form id="settings-form"><section class="card parameter-section"><header><h2>Simulación</h2><p>Valores iniciales para construir nuevos escenarios.</p></header>${fields('simulation')}</section><section class="card parameter-section"><header><h2>Garantisa</h2><p>Porcentajes del aporte según la modalidad. No aplica al banco aliado ni a reestructuración.</p></header>${fields('guarantee')}</section><section class="card parameter-section parameter-section--reference"><header><h2>Reestructuración</h2><p>Condiciones de referencia del motor vigente.</p></header><dl class="settings-reference"><div><dt>Plazo inicial</dt><dd>24 meses</dd></div><div><dt>Tasa inicial</dt><dd id="settings-refi-rate"></dd></div></dl><p class="field__hint">El plazo se ajusta en cada escenario; no tiene un parámetro global editable. La tasa utiliza el valor por defecto de Simulación.</p></section><div class="settings-impact">${global.icon('info')}<p>Los cambios se aplican a nuevas simulaciones. Los resultados calculados conservan sus valores.</p></div><div id="settings-actions" class="dialog-actions" hidden><button id="settings-cancel" class="btn" type="button">Cancelar</button><button id="settings-save" class="btn btn--primary" type="submit">Revisar y guardar cambios</button></div><p id="settings-feedback" role="status" hidden></p></form></section>`);
   const nav=document.querySelector('nav.nav'),button=document.createElement('button');button.type='button';button.className='nav__item';button.dataset.tab='12';button.innerHTML=global.icon('settings')+'<span class="nav__item-text">Configuración</span>';nav.appendChild(button);
   function feedback(message,error=false){$('settings-feedback').textContent=message;$('settings-feedback').hidden=!message;$('settings-feedback').className='feedback feedback--'+(error?'danger':'success');}
   function setEditing(value){editing=value;$('settings-actions').hidden=!value;$('settings-edit').hidden=value;for(const key of Object.keys(definitions)){$('value-'+key).hidden=value;$('setting-'+key).parentElement.hidden=!value;$('setting-'+key).disabled=!value;$('setting-'+key).removeAttribute('aria-invalid');}}
   function render(){
    for(const [key,d] of Object.entries(definitions)){$('setting-'+key).value=saved.values[key];$('value-'+key).textContent=n(saved.values[key])+' '+d.unit;const updated=saved.fieldUpdates?.[key];$('updated-'+key).textContent=updated?'Última actualización: '+global.OFEDates.dateTime(updated):'Valor inicial · Sin modificaciones registradas';}
    $('settings-summary').textContent='Versión '+saved.version+' · Actualizada el '+global.OFEDates.dateTime(saved.updated_at);$('settings-refi-rate').textContent=n(saved.values.default_interest_rate)+' % M.V.';$('settings-edit').disabled=!global.OFEPermissions.allowed('settings.update');setEditing(false);
   }
   async function load(){
    $('settings-edit').disabled=true;$('settings-form').inert=true;
    try{saved=await global.OFEAuth.request('/api/admin/settings');render();feedback('');}catch(error){feedback(error.message,true);}finally{$('settings-form').inert=false;}
   }
   button.addEventListener('click',()=>{global.switchTab(12);if(!editing)load();});
   $('settings-edit').addEventListener('click',()=>{if(!saved||saving)return;setEditing(true);feedback('');$('setting-default_interest_rate').focus();});
   $('settings-cancel').addEventListener('click',()=>{render();feedback('');$('settings-edit').focus();});
   $('settings-form').addEventListener('submit',event=>{
    event.preventDefault();if(!saved||saving||!editing)return;
    const version=saved.version,changes={};
    for(const key of Object.keys(definitions)){const value=Number($('setting-'+key).value);if(value!==saved.values[key])changes[key]=value;}
    if(!Object.keys(changes).length){feedback('No hay cambios para guardar.');return;}
    const summary=Object.entries(changes).map(([key,value])=>definitions[key].label+': '+n(saved.values[key])+' '+definitions[key].unit+' → '+n(value)+' '+definitions[key].unit).join('\n');
    global.confirmAction({title:'Actualizar configuración global',message:summary+'\n\nEste cambio se aplicará a nuevas simulaciones.',confirmLabel:'Guardar configuración',tone:'primary',onConfirm:async()=>{
     saving=true;$('settings-save').classList.add('is-busy');$('settings-save').disabled=true;$('settings-cancel').disabled=true;$('settings-form').setAttribute('aria-busy','true');
     try{saved=await global.OFEAuth.request('/api/admin/settings',{method:'PUT',body:JSON.stringify({version,changes})});global.OFEGlobalSettings.adopt(saved);saved=await global.OFEAuth.request('/api/admin/settings');render();feedback('Configuración guardada y auditada.');$('settings-edit').focus();}
     catch(error){feedback(error.message,true);if(error.field&&$('setting-'+error.field)){$('setting-'+error.field).setAttribute('aria-invalid','true');$('setting-'+error.field).focus();}}
     finally{saving=false;$('settings-save').classList.remove('is-busy');$('settings-save').disabled=false;$('settings-cancel').disabled=false;$('settings-form').removeAttribute('aria-busy');}
    }});
   });
   if(new URLSearchParams(location.search).get('admin')==='settings'){global.switchTab(12);await load();}
  }
 });
})(window);
