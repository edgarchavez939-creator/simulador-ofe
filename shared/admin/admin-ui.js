(function(global){
 'use strict';
 if(!global.SimuladorOFE)return;
 const $=id=>document.getElementById(id),api=(url,options)=>global.OFEAuth.request('/api'+url,options),send=(method,data)=>({method,body:JSON.stringify(data)});
 const e=value=>global.escHTML(value),allowed=permission=>global.OFEPermissions.allowed(permission);
 let users=[],programs=[],currentUser=null,program=null,nextOffset=null,batch=[],auditCount=0;
 const pages={users:1,programs:1};const pageSize=20;
 const shortDate=value=>value?new Date(value).toLocaleDateString('es-CO'):'Sin cambios';
 const date=value=>value?new Date(value).toLocaleString('es-CO'):'Sin cambios registrados';
 const badge=active=>`<span class="admin-badge ${active?'admin-badge--active':''}">${active?'Activo':'Inactivo'}</span>`;
 function paginate(rows,type){const total=Math.max(1,Math.ceil(rows.length/pageSize));pages[type]=Math.min(pages[type],total);$(type+'-page').textContent=`Página ${pages[type]} de ${total}`;$(type+'-prev').disabled=pages[type]===1;$(type+'-next').disabled=pages[type]===total;return rows.slice((pages[type]-1)*pageSize,pages[type]*pageSize);}
 const pagination=type=>`<div class="admin-pagination"><button id="${type}-prev" type="button" class="btn btn--sm">Anterior</button><span id="${type}-page" role="status"></span><button id="${type}-next" type="button" class="btn btn--sm">Siguiente</button></div>`;
 const fieldLabels={name:'Nombre',email:'Correo',role:'Rol',status:'Estado',nombre:'Nombre',valorMatricula:'Matrícula',valorIdiomas:'Idiomas',semestres:'Semestres',activo:'Estado',default_interest_rate:'Tasa por defecto',default_installments:'Cuotas por defecto',garantisa_cp_percent:'Garantisa CP',garantisa_lp_percent:'Garantisa LP'};
 const moduleLabels={users:'Usuarios',programs:'Programas',settings:'Configuración',auth:'Autenticación'};
 const actionLabels={USER_CREATE:'Creó un usuario',USER_UPDATE:'Actualizó un usuario',USER_ROLE_CHANGE:'Cambió un rol',USER_ACTIVATE:'Activó un usuario',USER_DEACTIVATE:'Desactivó un usuario',PROGRAM_UPDATE:'Actualizó un programa',CONFIG_UPDATE:'Actualizó la configuración',LOGIN_SUCCESS:'Inició sesión',LOGIN_FAILURE:'Acceso rechazado',LOGOUT:'Cerró sesión',ADMIN_BOOTSTRAP:'Creó el primer administrador',PASSWORD_CHANGE:'Cambió su contraseña',PASSWORD_RESET_REQUESTED:'Solicitó restablecer contraseña',PASSWORD_RESET_COMPLETED:'Restableció una contraseña',ADMIN_REQUEST_FAILURE:'Solicitud administrativa rechazada'};
 const resultLabels={SUCCESS:'Completado',DENIED:'Denegado',ERROR:'Error'};
 function valueLabel(raw,field){if(raw===null||raw===undefined)return '—';let value;try{value=JSON.parse(raw);}catch{value=raw;}if(value===null)return '—';if(field==='role')return roleLabels[value]||value;if(field==='status'||field==='activo')return value==='active'||value===true?'Activo':'Inactivo';if(['valorMatricula','valorIdiomas'].includes(field))return cop(value);if(field?.includes('percent')||field==='default_interest_rate')return Number(value).toLocaleString('es-CO')+' %';if(typeof value==='object')return Object.entries(value).map(([key,v])=>(fieldLabels[key]||key)+': '+(roleLabels[v]||v)).join(' · ');return String(value);}
 const roleLabels={simulator_user:'Usuario del simulador',program_admin:'Administrador de programas',system_admin:'Administrador del sistema'};
 function notice(id,message,error=false){const box=$(id);box.textContent=message;box.hidden=!message;box.className='feedback feedback--'+(error?'danger':'success');}
 async function busy(button,task,errorId){
  if(button.disabled)return;button.disabled=true;button.setAttribute('aria-busy','true');
  try{await task();}catch(error){notice(errorId,error.message,true);if(error.field){const field=document.querySelector('#'+errorId.split('-')[0]+'-form [name="'+error.field+'"]');if(field){field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',errorId);field.focus();}}}
  finally{button.disabled=false;button.removeAttribute('aria-busy');}
 }
 async function refreshCatalog(){
  await global.SimuladorOFE.catalog.refresh();programs=Array.from(global.SimuladorOFE.catalog.programs);
  for(const tab of [1,2,3,7]){
   const previous=$('prog'+tab).value;global.SimulationLifecycle.clear(tab);global.poblarSubniveles(tab);global.poblarProgramas(tab);
   if(programs.some(p=>p.activo&&p.id===previous))$('prog'+tab).value=previous;
   global.setMat(tab);
  }
 }
 function selectProgram(id){
  program=programs.find(item=>item.id===id);if(!program)return;
  $('program-name').value=program.nombre;$('program-tuition').value=program.valorMatricula;
  $('program-languages').value=program.valorIdiomas;$('program-semesters').value=program.semestres??'';
  $('program-languages').disabled=program.nivel!=='pregrado';$('program-semesters').disabled=program.nivel!=='pregrado';
  $('program-active').checked=program.activo;$('program-identity').textContent='ID técnico: '+program.id+' · Versión '+program.version+' · '+(program.codigo||'Sin código institucional');
  $('program-current').textContent=program.nombre+' · '+(program.nivel==='pregrado'?'Pregrado':'Posgrado')+' · Matrícula actual: '+cop(program.valorMatricula);
  $('program-form').hidden=false;notice('program-feedback','');$('program-name').focus();
 }
 function renderPrograms(){
  const levels=Array.from(document.querySelectorAll('[name="program-level"]:checked')).map(el=>el.value);
  const found=global.OFEAdminFilters.programs(programs,{query:$('program-query').value,levels,status:$('program-status').value});
  $('program-list').innerHTML=paginate(found,'programs').map(p=>`<tr><td class="admin-name">${e(p.nombre)}${p.codigo?'<small>'+e(p.codigo)+'</small>':''}</td><td>${p.nivel==='pregrado'?'Pregrado':'Posgrado'}<small>${e(p.subnivel||'')}</small></td><td class="admin-money">${e(cop(p.valorMatricula))}</td><td>${badge(p.activo)}</td><td>${e(shortDate(p.updated_at))}</td><td><button type="button" class="btn btn--sm" data-edit-program="${e(p.id)}" aria-label="Editar ${e(p.nombre)}">Editar</button></td></tr>`).join('')||'<tr><td colspan="6" class="admin-empty">No se encontraron programas. Prueba otros filtros.</td></tr>';
  $('program-count').textContent=found.length+(found.length===1?' programa encontrado':' programas encontrados');$('program-level-summary').textContent=levels.length===1?(levels[0]==='pregrado'?'Pregrado':'Posgrado'):'Todos los niveles';
 }
 async function loadUsers(){$('user-count').textContent='Cargando usuarios…';$('user-list').setAttribute('aria-busy','true');try{const data=await api('/admin/users');users=data.users;renderUsers();}finally{$('user-list').removeAttribute('aria-busy');}}
 function renderUsers(){
  const found=global.OFEAdminFilters.users(users,{query:$('user-query').value,role:$('user-filter-role').value,status:$('user-filter-status').value});
  $('user-count').textContent=found.length+(found.length===1?' usuario encontrado':' usuarios encontrados');
  $('user-list').innerHTML=paginate(found,'users').map(user=>`<tr><td class="admin-name">${e(user.name)}<small>${e(user.email)}</small></td><td>${e(roleLabels[user.role])}</td><td>${badge(user.status==='active')}</td><td>${e(shortDate(user.created_at))}</td><td>${e(shortDate(user.updated_at))}</td><td><details class="admin-actions"><summary aria-label="Acciones de ${e(user.name)}">Acciones ▾</summary><div><button class="btn btn--sm" type="button" data-edit-user="${e(user.id)}">Editar / cambiar rol</button><button class="btn btn--sm" type="button" data-reset-user="${e(user.id)}">Restablecer contraseña</button><button class="btn btn--sm" type="button" data-status-user="${e(user.id)}">${user.status==='active'?'Desactivar':'Activar'}</button></div></details></td></tr>`).join('')||'<tr><td colspan="6" class="admin-empty">No se encontraron usuarios. Prueba otros filtros.</td></tr>';
 }
 function editUser(id){
  currentUser=users.find(user=>user.id===id)||null;$('reset-form').reset();$('reset-form').hidden=true;$('user-form').reset();
  $('user-form-title').textContent=currentUser?'Editar usuario':'Crear usuario';
  $('user-name').value=currentUser?.name||'';$('user-email').value=currentUser?.email||'';$('user-role').value=currentUser?.role||'simulator_user';$('user-status').value=currentUser?.status||'active';
  $('user-password-field').hidden=!!currentUser;$('user-confirm-field').hidden=!!currentUser;$('user-password').required=!currentUser;$('user-confirm').required=!currentUser;
  $('user-form').hidden=false;notice('user-feedback','');$('user-name').focus();
 }
 async function loadAudit(offset=0){
  $('audit-count').textContent='Cargando registros…';
  const form=$('audit-filters'),params=new URLSearchParams(new FormData(form));params.set('offset',offset);
  const data=await api('/admin/audit?'+params);nextOffset=data.nextOffset;
  const html=data.records.map(row=>`<tr><td>${e(date(row.timestamp))}</td><td>${e(row.actor_name||'Acceso sin sesión')}<small>${e(row.actor_email||'')}</small></td><td>${e(actionLabels[row.action]||row.action)}<small>${e(moduleLabels[row.module]||row.module)}</small></td><td class="admin-name">${e(row.entity_name||row.entity_type)}<small>${e(fieldLabels[row.field_name]||row.field_name||'')}</small><details class="audit-detail"><summary>Ver detalle del cambio</summary><dl class="audit-metadata"><dt>Fecha y hora</dt><dd>${e(date(row.timestamp))}</dd><dt>Usuario</dt><dd>${e(row.actor_name||'Sin sesión')} · ${e(row.actor_email||'')}</dd><dt>Acción</dt><dd>${e(actionLabels[row.action]||row.action)}</dd><dt>Módulo</dt><dd>${e(moduleLabels[row.module]||row.module)}</dd><dt>Entidad</dt><dd>${e(row.entity_name||row.entity_type)}</dd><dt>Identificador</dt><dd>${e(row.entity_id||'—')}</dd><dt>Campo</dt><dd>${e(fieldLabels[row.field_name]||row.field_name||'—')}</dd><dt>Resultado</dt><dd>${e(resultLabels[row.result]||row.result)}</dd></dl><div class="audit-change"><div><small>Anterior</small><strong>${e(valueLabel(row.old_value,row.field_name))}</strong></div><span aria-hidden="true">→</span><div><small>Nuevo</small><strong>${e(valueLabel(row.new_value,row.field_name))}</strong></div></div><small>Referencia de soporte: ${e(row.request_id)}</small></details></td><td><span class="admin-badge ${row.result==='SUCCESS'?'admin-badge--active':''}">${e(resultLabels[row.result]||row.result)}</span></td></tr>`).join('');
  if(offset)$('audit-list').insertAdjacentHTML('beforeend',html);else $('audit-list').innerHTML=html||'<tr><td colspan="5">No hay registros con estos filtros.</td></tr>';
  $('audit-more').hidden=nextOffset===null;auditCount=offset?auditCount+data.records.length:data.records.length;$('audit-count').textContent=auditCount+(auditCount===1?' registro mostrado':' registros mostrados')+(nextOffset!==null?' · Hay más resultados':'');
 }
 async function show(view){
  const permission={users:'users.read',audit:'audit.read',programs:'programs.update'}[view];if(!allowed(permission))return;
  global.switchTab(view==='programs'?6:view==='users'?10:11);
  if(view==='users')await loadUsers();if(view==='audit')await loadAudit();if(view==='programs')renderPrograms();
 }
 function adminMarkup(){return `
 <section id="tab10" class="view view--admin" data-view="10" hidden><div class="admin-heading"><div><h2>Usuarios</h2><p>Administra el acceso, roles y estado de los usuarios del simulador.</p></div><button id="user-new" class="btn btn--primary" type="button">+ Crear usuario</button></div>
 <form id="user-form" class="card admin-form" hidden><h3 id="user-form-title">Crear usuario</h3><div class="tool-grid-2">
 <div class="field"><label class="field__label" for="user-name">Nombre</label><input class="input" id="user-name" name="name" required minlength="2" maxlength="120"></div>
 <div class="field"><label class="field__label" for="user-email">Correo</label><input class="input" id="user-email" name="email" type="email" autocomplete="off" required maxlength="200"></div>
 <div class="field"><label class="field__label" for="user-role">Rol</label><select class="select" id="user-role" name="role">${Object.entries(roleLabels).map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></div>
 <div class="field"><label class="field__label" for="user-status">Estado</label><select class="select" id="user-status" name="status"><option value="active">Activo</option><option value="inactive">Inactivo</option></select></div>
 <div class="field" id="user-password-field"><label class="field__label" for="user-password">Contraseña inicial</label><input class="input" id="user-password" name="password" type="password" autocomplete="new-password" minlength="12" maxlength="128"></div>
 <div class="field" id="user-confirm-field"><label class="field__label" for="user-confirm">Confirmar contraseña inicial</label><input class="input" id="user-confirm" type="password" autocomplete="new-password" minlength="12" maxlength="128"></div></div>
 <p class="field__hint">La persona deberá elegir su contraseña personal al iniciar sesión.</p><div id="user-feedback" role="alert" hidden></div><button class="btn btn--primary" type="submit">Guardar usuario</button><button id="user-cancel" class="btn" type="button">Cancelar</button></form>
 <form id="user-filters" class="card admin-filter"><div class="field"><label for="user-query">Nombre o correo</label><input id="user-query" class="input" type="search" placeholder="Buscar una persona"></div><div class="field"><label for="user-filter-role">Rol</label><select id="user-filter-role" class="select"><option value="">Todos los roles</option>${Object.entries(roleLabels).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></div><div class="field"><label for="user-filter-status">Estado</label><select id="user-filter-status" class="select"><option value="">Todos</option><option value="active">Activo</option><option value="inactive">Inactivo</option></select></div><button id="user-clear" type="button" class="btn">Limpiar filtros</button></form><p id="user-count" class="admin-count" role="status"></p>
 <div class="card"><div class="table-wrap"><table class="tbl"><thead><tr><th>Persona</th><th>Rol</th><th>Estado</th><th>Creación</th><th>Actualización</th><th>Acciones</th></tr></thead><tbody id="user-list"></tbody></table></div>${pagination('users')}<div id="users-feedback" role="status" hidden></div></div>
 <form id="reset-form" class="card admin-form" hidden><h3>Restablecer contraseña</h3><p id="reset-person"></p><p>Se cerrarán las sesiones de esta persona. Deberá cambiar la nueva contraseña al ingresar.</p><div class="tool-grid-2"><div class="field"><label class="field__label" for="reset-password">Nueva contraseña inicial</label><input class="input" id="reset-password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required></div><div class="field"><label class="field__label" for="reset-confirm">Confirmar contraseña</label><input class="input" id="reset-confirm" type="password" autocomplete="new-password" required></div></div><div id="reset-feedback" role="alert" hidden></div><button class="btn btn--primary" type="submit">Restablecer contraseña</button><button id="reset-cancel" class="btn" type="button">Cancelar</button></form></section>
 <section id="tab11" class="view view--admin" data-view="11" hidden><div class="admin-heading"><div><h2>Auditoría</h2><p>Consulta quién cambió cada dato y revisa sus valores anteriores y nuevos.</p></div></div><p class="field__hint">Los registros se muestran en tu zona horaria. El rango de búsqueda usa días UTC.</p><form id="audit-filters" class="card admin-filter"><div class="field"><label for="audit-from">Desde (UTC)</label><input id="audit-from" class="input" type="date" name="from"></div><div class="field"><label for="audit-to">Hasta (UTC)</label><input id="audit-to" class="input" type="date" name="to"></div><div class="field"><label for="audit-actor">Usuario: nombre, correo o ID</label><input id="audit-actor" class="input" name="actor"></div><div class="field"><label for="audit-action">Acción</label><select id="audit-action" class="select" name="action"><option value="">Todas las acciones</option>${Object.entries(actionLabels).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></div><div class="field"><label for="audit-module">Módulo</label><select id="audit-module" class="select" name="module"><option value="">Todos los autorizados</option><option value="programs">Programas</option><option value="users">Usuarios</option><option value="auth">Autenticación</option><option value="settings">Configuración</option></select></div><div class="field"><label for="audit-entity">Entidad</label><input id="audit-entity" class="input" name="entity" placeholder="Nombre o ID exacto"></div><div class="field"><label for="audit-result">Resultado</label><select id="audit-result" name="result" class="select"><option value="">Todos</option><option value="SUCCESS">Completado</option><option value="DENIED">Denegado</option><option value="ERROR">Error</option></select></div><button class="btn btn--primary" type="submit">Filtrar</button><button id="audit-clear" type="button" class="btn">Limpiar filtros</button></form><p id="audit-count" class="admin-count" role="status"></p><div id="audit-feedback" role="alert" hidden></div><div class="card table-wrap"><table class="tbl"><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad / campo</th><th>Resultado</th></tr></thead><tbody id="audit-list"></tbody></table></div><button id="audit-more" class="btn" type="button" hidden>Mostrar más</button></section>`;}
 function programMarkup(){return `<div class="admin-heading"><div><h2>Programas y matrículas</h2><p>Encuentra un programa, revisa sus datos y confirma cada actualización.</p></div></div><div class="card"><div id="program-filters" class="admin-filter"><div class="field"><label for="program-query">Buscar programa</label><input id="program-query" class="input" type="search" placeholder="Nombre del programa"></div><div class="field"><label id="program-level-label">Nivel académico</label><details class="admin-multiselect"><summary id="program-level-summary" aria-labelledby="program-level-label program-level-summary">Todos los niveles</summary><div><label><input aria-label="Pregrado" name="program-level" type="checkbox" value="pregrado" checked> Pregrado</label><label><input aria-label="Posgrado" name="program-level" type="checkbox" value="posgrado" checked> Posgrado</label><small>Sin selección se muestran todos.</small></div></details></div><div class="field"><label for="program-status">Estado</label><select id="program-status" class="select"><option value="">Todos</option><option value="active">Activo</option><option value="inactive">Inactivo</option></select></div><button id="program-clear" type="button" class="btn">Limpiar filtros</button></div><p id="program-count" class="admin-count" role="status"></p><div class="table-wrap"><table class="tbl"><thead><tr><th>Programa</th><th>Nivel</th><th>Matrícula</th><th>Estado</th><th>Actualización</th><th>Acciones</th></tr></thead><tbody id="program-list"></tbody></table></div>${pagination('programs')}</div>
 <form class="card admin-form" id="program-form" hidden><h3>Editar programa</h3><p id="program-current" class="note"></p><p id="program-identity" class="field__hint"></p><div class="tool-grid-2"><div class="field"><label for="program-name">Nombre</label><input id="program-name" name="nombre" class="input" required maxlength="200"></div><div class="field"><label for="program-tuition">Nueva matrícula (COP)</label><input id="program-tuition" name="valorMatricula" class="input" type="number" min="0.01" step="0.01" required></div><div class="field"><label for="program-languages">Idiomas (COP)</label><input id="program-languages" name="valorIdiomas" class="input" type="number" min="0" step="0.01"></div><div class="field"><label for="program-semesters">Semestres</label><input id="program-semesters" name="semestres" class="input" type="number" min="1" step="1"></div></div><label class="inline-control-label"><input id="program-active" type="checkbox"> Programa activo</label><p id="program-feedback" role="alert" hidden></p><button type="submit" class="btn btn--primary">Guardar cambio auditado</button><button type="button" class="btn" id="program-cancel">Cancelar</button></form>
 <div class="card"><h3>Actualizar desde Excel</h3><p>Descarga la plantilla actual, modifica los datos y conserva las columnas ID y Versión. Revisarás cada cambio antes de guardarlo.</p><button id="program-template" class="btn" type="button">Descargar plantilla actual</button><div class="field"><label for="program-file" class="field__label">Plantilla con cambios</label><input id="program-file" class="input" type="file" accept=".xlsx,.xls"></div><div id="program-batch-preview"></div><button id="program-batch-submit" class="btn btn--primary" type="button" disabled>Guardar cambios revisados</button><div id="batch-feedback" role="alert" hidden></div></div>
 <div class="card"><h3>Archivos anteriores</h3><p>El validador anterior se conserva para revisar formatos sin modificar el catálogo.</p><button id="legacy-import-toggle" class="btn" type="button">Abrir validador de archivos anteriores</button></div>`;}
 global.SimuladorOFE.register('autonomous-admin',{
  async init(app){
   if(!global.OFE_SERVER)return;
   const user=await global.OFEAuth.getUser();if(!user){location.replace('/login');return;}
   const foot=document.querySelector('.nav__foot');
   const account=document.createElement('div');account.className='account-panel';account.innerHTML=`<span>${e(user.name)}</span><small>${e(roleLabels[user.role])}</small><a class="btn btn--ghost btn--sm" href="/login?change=1">Cambiar contraseña</a><button id="account-logout" class="btn btn--sm" type="button">Cerrar sesión</button>`;foot.prepend(account);
   $('account-logout').addEventListener('click',()=>global.runButtonTask($('account-logout'),()=>global.OFEAuth.logout()));
   const main=$('main-content');main.insertAdjacentHTML('beforeend',adminMarkup());
   const nav=document.querySelector('nav.nav');
   for(const [view,label,permission] of [['users','Usuarios','users.read'],['audit','Auditoría','audit.read']]){
    if(!allowed(permission))continue;const button=document.createElement('button');button.type='button';button.className='nav__item';button.dataset.tab=view==='users'?'10':'11';button.innerHTML=global.icon(view==='users'?'lock':'clipboard')+'<span class="nav__item-text">'+e(label)+'</span>';button.addEventListener('click',()=>show(view).catch(error=>global.toast(error.message,'error')));nav.appendChild(button);
   }
   if(allowed('programs.update')){
    const legacy=document.createElement('div');legacy.id='legacy-import';legacy.hidden=true;
    while($('tab6').firstChild)legacy.appendChild($('tab6').firstChild);$('tab6').appendChild(legacy);
    const area=document.createElement('div');area.innerHTML=programMarkup();$('tab6').prepend(area);$('tab6').classList.add('view--admin');programs=Array.from(app.catalog.programs);renderPrograms();
    const programFilter=()=>{pages.programs=1;renderPrograms();};
    $('program-query').addEventListener('input',programFilter);$('program-status').addEventListener('change',programFilter);document.querySelectorAll('[name="program-level"]').forEach(field=>field.addEventListener('change',programFilter));
    $('program-clear').addEventListener('click',()=>{$('program-query').value='';$('program-status').value='';document.querySelectorAll('[name="program-level"]').forEach(field=>field.checked=true);programFilter();});
    for(const [direction,delta] of [['prev',-1],['next',1]])$('programs-'+direction).addEventListener('click',()=>{pages.programs+=delta;renderPrograms();});
    $('program-list').addEventListener('click',event=>{const button=event.target.closest('[data-edit-program]');if(button)selectProgram(button.dataset.editProgram);});
    $('program-cancel').addEventListener('click',()=>{$('program-form').hidden=true;});
    $('legacy-import-toggle').addEventListener('click',()=>{legacy.hidden=!legacy.hidden;});
    $('program-form').addEventListener('submit',event=>{event.preventDefault();
     const selected=program,changes={nombre:$('program-name').value,valorMatricula:Number($('program-tuition').value),activo:$('program-active').checked};
     if(selected.nivel==='pregrado'){changes.valorIdiomas=Number($('program-languages').value);changes.semestres=$('program-semesters').value?Number($('program-semesters').value):null;}
     const changed=Object.entries(changes).filter(([key,value])=>selected[key]!==value);if(!changed.length){notice('program-feedback','No hay cambios para guardar.');return;}
     global.confirmAction({title:'Confirmar actualización del programa',message:selected.nombre+'\n'+changed.map(([key,value])=>(fieldLabels[key]||key)+': '+valueLabel(JSON.stringify(selected[key]),key)+' → '+valueLabel(JSON.stringify(value),key)).join('\n'),confirmLabel:'Guardar cambios',tone:'primary',onConfirm:()=>busy(event.submitter,async()=>{
      const data=await api('/admin/programs/'+encodeURIComponent(selected.id),send('PUT',{version:selected.version,changes}));await refreshCatalog();renderPrograms();selectProgram(data.program.id);notice('program-feedback','Cambio guardado y auditado.');
     },'program-feedback')});
    });
    $('program-template').addEventListener('click',()=>global.runButtonTask($('program-template'),()=>global.descargarPlantilla()));
    $('program-file').addEventListener('change',async()=>{
     batch=[];$('program-batch-submit').disabled=true;$('program-batch-preview').innerHTML='';notice('batch-feedback','');
     const file=$('program-file').files[0];if(!file)return;
     try{
      if(file.size>5*1024*1024)throw Error('La plantilla debe pesar menos de 5 MB.');
      const workbook=global.XLSX.read(await file.arrayBuffer(),{type:'array'}),errors=[],identified=[];
      for(const [name,tipo] of [['Pregrado','pregrado'],['Posgrado','posgrado']]){
       const sheet=workbook.Sheets[name];if(!sheet)continue;
       const result=global.ProgramCatalogImport.identified(global.XLSX.utils.sheet_to_json(sheet,{header:1,defval:''}),tipo,programs);
       errors.push(...result.errors.map(error=>name+': '+error));identified.push(...result.updates);
      }
      if(!identified.length&&!errors.length)throw Error('Usa las hojas Pregrado y Posgrado de la plantilla descargada.');
      if(new Set(identified.map(row=>row.id)).size!==identified.length)errors.push('La plantilla repite un ID de programa.');
      if(errors.length)throw Error(errors.slice(0,5).join(' | '));
      batch=identified.filter(row=>Object.keys(row.changes).length);
      const labels={nombre:'Nombre',valorMatricula:'Matrícula',valorIdiomas:'Idiomas',semestres:'Semestres'};
      const rows=batch.flatMap(item=>Object.entries(item.changes).map(([field,value])=>{
       const old=programs.find(program=>program.id===item.id);return `<tr><td>${e(old.nombre)}</td><td>${e(labels[field])}</td><td>${e(old[field]??'—')}</td><td>${e(value??'—')}</td></tr>`;
      })).join('');
      $('program-batch-preview').innerHTML=rows?`<div class="table-wrap"><table class="tbl"><thead><tr><th>Programa</th><th>Campo</th><th>Anterior</th><th>Nuevo</th></tr></thead><tbody>${rows}</tbody></table></div>`:'';
      notice('batch-feedback',batch.length?batch.length+' programas con cambios listos para revisar.':'No hay cambios frente al catálogo actual.');$('program-batch-submit').disabled=!batch.length;
     }catch(error){batch=[];notice('batch-feedback',error.message,true);}
    });
    $('program-batch-submit').addEventListener('click',()=>{
     if(!batch.length)return;const reviewed=batch;
     global.confirmAction({title:'Confirmar cambios desde Excel',message:reviewed.length+' programas se actualizarán con los cambios de la vista previa. Cada campo quedará registrado en auditoría.',confirmLabel:'Guardar cambios revisados',tone:'primary',onConfirm:()=>busy($('program-batch-submit'),async()=>{
      await api('/admin/programs',send('POST',{updates:reviewed}));await refreshCatalog();renderPrograms();batch=[];$('program-file').value='';$('program-batch-preview').innerHTML='';notice('batch-feedback','Cambios guardados y auditados en una misma transacción.');
      global.setTimeout(()=>{$('program-batch-submit').disabled=true;},0);
     },'batch-feedback')});
    });
   }
   $('user-filters').addEventListener('submit',event=>event.preventDefault());
   const userFilter=()=>{pages.users=1;renderUsers();};for(const id of ['user-query','user-filter-role','user-filter-status'])$(id).addEventListener(id==='user-query'?'input':'change',userFilter);
   $('user-clear').addEventListener('click',()=>{$('user-filters').reset();userFilter();});
   for(const [direction,delta] of [['prev',-1],['next',1]])$('users-'+direction).addEventListener('click',()=>{pages.users+=delta;renderUsers();});
   document.addEventListener('click',event=>document.querySelectorAll('.admin-actions[open],.admin-multiselect[open]').forEach(menu=>{if(!menu.contains(event.target))menu.open=false;}));
   document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.admin-actions[open],.admin-multiselect[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});});
   $('audit-clear').addEventListener('click',()=>{$('audit-filters').reset();if(user.role==='program_admin')$('audit-module').value='programs';busy($('audit-clear'),()=>loadAudit(),'audit-feedback');});
   $('user-new').addEventListener('click',()=>editUser(null));$('user-cancel').addEventListener('click',()=>{$('user-form').reset();$('user-form').hidden=true;});
   $('user-list').addEventListener('click',event=>{
    const status=event.target.closest('[data-status-user]');if(status){const selected=users.find(person=>person.id===status.dataset.statusUser);global.confirmAction({title:selected.status==='active'?'Desactivar usuario':'Activar usuario',message:selected.name+' · '+selected.email,confirmLabel:'Confirmar cambio',onConfirm:()=>busy(status,async()=>{await api('/admin/users/'+selected.id,send('PATCH',{...selected,status:selected.status==='active'?'inactive':'active'}));if(selected.id===user.id){location.replace('/login');return;}await loadUsers();},'users-feedback')});}
    const edit=event.target.closest('[data-edit-user]');if(edit)editUser(edit.dataset.editUser);
    const reset=event.target.closest('[data-reset-user]');if(reset){$('user-form').reset();$('user-form').hidden=true;currentUser=users.find(user=>user.id===reset.dataset.resetUser);$('reset-form').reset();$('reset-person').textContent=currentUser.name+' · '+currentUser.email;$('reset-form').hidden=false;$('reset-password').focus();}
   });
   $('user-form').addEventListener('submit',event=>{event.preventDefault();busy(event.submitter,async()=>{
    if(!currentUser&&$('user-password').value!==$('user-confirm').value)throw Error('Las contraseñas no coinciden.');
    const body={name:$('user-name').value,email:$('user-email').value,role:$('user-role').value,status:$('user-status').value,...(currentUser?{version:currentUser.version}:{password:$('user-password').value})};
    const self=currentUser?.id===user.id;await api('/admin/users'+(currentUser?'/'+currentUser.id:''),send(currentUser?'PATCH':'POST',body));
    $('user-password').value='';$('user-confirm').value='';$('user-form').hidden=true;
    if(self&&(body.role!==user.role||body.status!==user.status)){location.replace('/login');return;}
    await loadUsers();notice('users-feedback','Usuario guardado y auditado.');
   },'user-feedback');});
   $('reset-cancel').addEventListener('click',()=>{$('reset-form').reset();$('reset-form').hidden=true;});
   $('reset-form').addEventListener('submit',event=>{event.preventDefault();busy(event.submitter,async()=>{
    if($('reset-password').value!==$('reset-confirm').value)throw Error('Las contraseñas no coinciden.');
    await api('/admin/users/'+currentUser.id+'/password',send('POST',{version:currentUser.version,password:$('reset-password').value}));$('reset-form').reset();$('reset-form').hidden=true;
    if(currentUser.id===user.id){location.replace('/login');return;}await loadUsers();notice('users-feedback','Contraseña restablecida. Las sesiones anteriores se cerraron.');
   },'reset-feedback');});
   $('audit-filters').addEventListener('submit',event=>{event.preventDefault();busy(event.submitter,()=>loadAudit(),'audit-feedback');});
   $('audit-more').addEventListener('click',()=>busy($('audit-more'),()=>loadAudit(nextOffset),'audit-feedback'));
   if(user.role==='program_admin'){$('audit-module').value='programs';$('audit-module').disabled=true;}
   const requested=new URLSearchParams(location.search).get('admin');if(requested)await show(requested);
   let checking=false;
   async function checkSession(){if(checking)return;checking=true;try{const active=await global.OFEAuth.refresh();if(!active||active.user.id!==user.id||active.user.role!==user.role||active.user.must_change_password){location.replace('/login');return;}document.body.hidden=false;}catch(_){if(document.body.hidden){location.replace('/login');return;}global.toast('No fue posible validar la sesión. Revisa la conexión.','warning');}finally{checking=false;}}
   global.addEventListener('pagehide',()=>{document.body.hidden=true;});global.addEventListener('pageshow',()=>{checking=false;checkSession();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkSession();});global.setInterval(checkSession,60000);
   global.enhanceTableAccessibility(main);
  }
 });
})(window);
