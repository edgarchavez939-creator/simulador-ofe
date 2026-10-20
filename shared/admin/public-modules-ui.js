(function(global){
 'use strict';
 const schema=global.OFEPublicModuleDefinitions;
 global.SimuladorOFE.register('admin-public-modules',{
  init(){
   if(!global.OFE_SERVER||!global.OFEPermissions.allowed('settings.read'))return;
   const $=id=>document.getElementById(id),panel=$('config-panel-public');if(!panel)return;
   const form=document.createElement('form');form.id='public-modules-form';form.className='public-modules-card';
   form.innerHTML='<header class="config-section-heading"><div><h3>Módulos visibles para el público</h3><p>Elige las opciones que aparecerán en el menú del simulador público.</p></div><button class="btn" type="button" id="public-modules-reload">'+global.icon('refresh')+' Recargar</button></header><p id="public-modules-summary" class="field__hint" role="status">Selecciona esta sección para consultar la configuración.</p><div class="public-modules-list">'+schema.definitions.map(item=>'<div class="public-module-row"><div class="public-module-copy"><span class="public-module-icon" aria-hidden="true">'+global.icon(item.icon)+'</span><div><label for="public-module-'+item.key+'">'+global.escHTML(item.label)+'</label><small>'+item.group+'</small></div></div><div class="public-module-state"><span id="public-module-state-'+item.key+'">Sin consultar</span><label class="switch"><input type="checkbox" role="switch" id="public-module-'+item.key+'" aria-label="Mostrar '+global.escAttr(item.label)+' al público" disabled><span class="switch__track" aria-hidden="true"></span><span class="switch__thumb" aria-hidden="true"></span></label></div></div>').join('')+'</div><div class="public-modules-footer"><p>Los cambios se aplican al abrir o recargar la pantalla pública. Las opciones del área interna se conservan.</p><button class="btn btn--primary" type="submit" id="public-modules-save" disabled>'+global.icon('save')+' Revisar y guardar módulos</button></div><p id="public-modules-feedback" role="status" hidden></p>';
   panel.querySelector('.public-preview-panel').before(form);
   let saved=null,loading=false,saving=false;
   const writable=()=>global.OFEPermissions.allowed('settings.update');
   function feedback(text,error=false){const field=$('public-modules-feedback');field.textContent=text;field.hidden=!text;field.className='feedback feedback--'+(error?'danger':'success');}
   function draft(){return Object.fromEntries(schema.definitions.map(item=>[item.key,$('public-module-'+item.key).checked]));}
   function states(){let count=0;for(const item of schema.definitions){const enabled=$('public-module-'+item.key).checked;count+=Number(enabled);$('public-module-state-'+item.key).textContent=enabled?'Visible':'Oculto';}$('public-modules-summary').textContent=count+' de '+schema.definitions.length+' módulos visibles'+(count===0?' · La pantalla pública mostrará un aviso sin opciones.':'.');}
   function fill(data){schema.validate(data.values);saved=data;for(const item of schema.definitions){$('public-module-'+item.key).checked=data.values[item.key];$('public-module-'+item.key).disabled=!writable();}$('public-modules-save').disabled=!writable();states();}
   async function load(){if(loading||saving)return;loading=true;form.inert=true;feedback('');try{fill(await global.OFEAuth.request('/api/admin/public-modules'));}catch(error){feedback(error.message,true);}finally{loading=false;form.inert=false;}}
   $('tab12').addEventListener('ofe:config-section',event=>{if(event.detail.key==='public'&&!saved)load();});
   for(const item of schema.definitions)$('public-module-'+item.key).addEventListener('change',states);
   $('public-modules-reload').addEventListener('click',()=>load());
   form.addEventListener('submit',event=>{
    event.preventDefault();if(!saved||loading||saving||!writable())return;
    const current=draft(),version=saved.version,changes=Object.fromEntries(Object.entries(current).filter(([key,value])=>value!==saved.values[key]));
    if(!Object.keys(changes).length){feedback('No hay cambios para guardar.');return;}
    const summary=schema.definitions.filter(item=>Object.hasOwn(changes,item.key)).map(item=>item.label+': '+(changes[item.key]?'Visible':'Oculto')).join('\n');
    global.confirmAction({title:'Actualizar módulos públicos',message:summary+'\n\nSe aplicará al abrir o recargar el simulador público.',confirmLabel:'Guardar módulos públicos',tone:'primary',onConfirm:()=>global.runButtonTask($('public-modules-save'),async()=>{
     saving=true;form.inert=true;
     try{fill(await global.OFEAuth.request('/api/admin/public-modules',{method:'PUT',body:JSON.stringify({version,changes})}));feedback('Módulos públicos guardados y registrados en auditoría. Actualiza la vista previa para comprobarlos.');}
     catch(error){feedback(error.message,true);}
     finally{saving=false;form.inert=false;}
    },'Guardando módulos públicos')});
   });
   if(new URLSearchParams(location.search).get('admin')==='settings'&&new URLSearchParams(location.search).get('section')==='public')load();
  }
 });
})(window);
