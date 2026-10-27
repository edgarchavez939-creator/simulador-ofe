(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('../settings/text-settings.js'):root.OFETextSchema);
 if(typeof module==='object'&&module.exports)module.exports=api;else root.OFEAuditPresentation=api;
})(typeof window==='object'?window:this,function(textSchema){
 'use strict';
 const categories=Object.freeze([
  {key:'user',module:'users',label:'Usuarios'},
  {key:'program',module:'programs',label:'Programas académicos'},
  {key:'setting',module:'settings',label:'Parámetros de simulación'},
  {key:'texts',module:'settings',label:'Textos del simulador y PDF'},
  {key:'appearance',module:'settings',label:'Colores de la interfaz'},
  {key:'maintenance',module:'settings',label:'Mantenimiento del simulador'},
  {key:'public_modules',module:'settings',label:'Menú público'},
  {key:'radication_resources',module:'settings',label:'Recursos de radicación'}
 ].map(Object.freeze));
 const modules={users:'Usuarios',programs:'Programas',settings:'Configuración'};
 const actions=Object.freeze({ADMIN_BOOTSTRAP:'Creó el primer administrador',USER_CREATE:'Creó un usuario',USER_UPDATE:'Actualizó un usuario',USER_ROLE_CHANGE:'Cambió un rol',USER_ACTIVATE:'Activó un usuario',USER_DEACTIVATE:'Desactivó un usuario',PROGRAM_UPDATE:'Actualizó un programa',CONFIG_UPDATE:'Actualizó la configuración',CONFIG_MIGRATION:'Migró los recursos a módulos de crédito'});
 const updates={setting:'Actualizó un parámetro',texts:'Actualizó un texto',appearance:'Actualizó un color',maintenance:'Actualizó el mantenimiento',public_modules:'Cambió la visibilidad de un módulo',radication_resources:'Actualizó un recurso de radicación'};
 const fields={profile:'Datos del usuario',name:'Nombre',email:'Correo',role:'Rol',status:'Estado',nombre:'Nombre del programa',valorMatricula:'Matrícula',valorIdiomas:'Idiomas',semestres:'Semestres',activo:'Estado del programa',default_interest_rate:'Tasa de interés por defecto',default_installments:'Cuotas por defecto',garantisa_cp_percent:'Aporte Garantisa a corto plazo',garantisa_lp_percent:'Aporte Garantisa a largo plazo',brand_red:'Rojo principal',brand_gold:'Dorado',brand_yellow:'Amarillo de detalle',brand_sand:'Arena de apoyo',enabled:'Estado',title:'Título del aviso',message:'Mensaje de mantenimiento',url:'Dirección del recurso',text:'Texto del enlace',description:'Descripción',type:'Tipo de recurso',initialPayment:'Cuota Inicial',shortTerm:'Crédito a Corto Plazo',mixed:'Crédito Corto y Largo Plazo',bank:'Crédito Banco Aliado',rateConverter:'Conversor de Tasas',comparison:'Comparar escenarios',history:'Mis simulaciones','shortTerm:pregrado':'Crédito Pregrado - Corto Plazo','shortTerm:posgrado':'Crédito Posgrado - Corto Plazo',languages:'Crédito Idiomas - Corto Plazo'};
 const roles={simulator_user:'Usuario del simulador',program_admin:'Administrador de programas',system_admin:'Administrador del sistema'};
 const resourceTypes={video:'Video',document:'Documento',web:'Página web',tutorial:'Tutorial',presentation:'Presentación',other:'Otro'};
 const results={SUCCESS:'Completado',DENIED:'Denegado',ERROR:'Error'};
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function fieldLabel(field,entityType){
  if(!field)return entityType==='radication_resources'?'Organización de los recursos':'No aplica';
  if(entityType==='texts')return textSchema?.definitions?.[field]?.label||'Texto adicional';
  return fields[field]||'Campo adicional';
 }
 function describe(row){
  const category=categories.find(item=>item.key===row.entity_type);
  const field=fieldLabel(row.field_name,row.entity_type);
  const personOrProgram=['user','program'].includes(row.entity_type);
  return {category:category?.label||'Otros cambios administrativos',module:modules[row.module]||'Administración',field,
   action:row.action==='CONFIG_UPDATE'?(updates[row.entity_type]||actions.CONFIG_UPDATE):(actions[row.action]||'Evento administrativo'),
   element:personOrProgram?(row.entity_name||category.label):field,
   result:results[row.result]||'Resultado no identificado'};
 }
 function scalar(value,field,entityType){
  if(value===null||value===undefined)return 'Sin valor registrado';
  if(field==='role')return roles[value]||'Rol no identificado';
  if(field==='status')return ({active:'Activo',inactive:'Inactivo'})[value]||'Estado no identificado';
  if(field==='type'&&entityType==='radication_resources')return resourceTypes[value]||'Tipo no identificado';
  if(typeof value==='boolean'){
   if(entityType==='public_modules')return value?'Visible':'Oculto';
   if(entityType==='maintenance')return value?'Activado':'Desactivado';
   if(field==='activo')return value?'Activo':'Inactivo';
   return value?'Habilitado':'Deshabilitado';
  }
  if(['valorMatricula','valorIdiomas'].includes(field)&&typeof value==='number')return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
  if((field.endsWith('_percent')||field==='default_interest_rate')&&typeof value==='number')return value.toLocaleString('es-CO')+' %';
  return value===''?'Texto vacío':String(value);
 }
 function renderValue(raw,field,entityType){
  let value;try{value=JSON.parse(raw);}catch{value=raw;}
  function render(item,key){
   if(item&&typeof item==='object'){
    const entries=Object.entries(item);
    if(!entries.length)return '<p class="audit-value">Sin datos registrados</p>';
    return '<dl class="audit-object">'+entries.map(([childKey,child])=>'<div><dt>'+escape(Array.isArray(item)?'Elemento '+(Number(childKey)+1):fieldLabel(childKey,entityType))+'</dt><dd>'+render(child,childKey)+'</dd></div>').join('')+'</dl>';
   }
   return '<p class="audit-value">'+escape(scalar(item,key||'',entityType))+'</p>';
  }
  return render(value,field);
 }
 function rowHTML(row,date,icon){
  const d=describe(row),badge='<span class="admin-badge '+(row.result==='SUCCESS'?'admin-badge--active':'')+'">'+escape(d.result)+'</span>';
  return '<tr><td class="audit-date">'+escape(date)+'</td><td class="audit-person">'+escape(row.actor_name||'Acción del sistema')+'<small>'+escape(row.actor_email||'')+'</small></td><td><span class="audit-category">'+escape(d.category)+'</span>'+(d.category!==d.module?'<small>'+escape(d.module)+'</small>':'')+'</td><td>'+escape(d.action)+'</td><td class="admin-name">'+escape(d.element)+(['user','program'].includes(row.entity_type)?'<small>'+escape(d.field)+'</small>':'')+'</td><td>'+badge+'</td><td><button class="btn btn--ghost btn--sm" type="button" data-audit-detail="'+escape(row.id)+'" aria-label="Ver detalle: '+escape(d.element)+'">'+icon+'<span>Ver detalle</span></button></td></tr>';
 }
 function detailHTML(row,date,icons){
  const d=describe(row),fact=(label,value)=>'<div><dt>'+label+'</dt><dd>'+escape(value)+'</dd></div>';
  return '<dl class="audit-facts">'+fact('Fecha y hora',date)+'<div><dt>Usuario</dt><dd>'+escape(row.actor_name||'Acción del sistema')+'<small>'+escape(row.actor_email||'')+'</small></dd></div>'+fact('Módulo',d.module)+fact('Categoría',d.category)+fact('Acción',d.action)+fact('Elemento',d.element)+(['user','program'].includes(row.entity_type)?fact('Campo',d.field):'')+'</dl><h3 class="audit-change-title">Cambio realizado</h3><div class="audit-change"><section><h4>Anterior</h4>'+renderValue(row.old_value,row.field_name,row.entity_type)+'</section><span aria-hidden="true">'+icons.arrow+'</span><section><h4>Nuevo</h4>'+renderValue(row.new_value,row.field_name,row.entity_type)+'</section></div><p class="audit-outcome">Resultado <span class="admin-badge '+(row.result==='SUCCESS'?'admin-badge--active':'')+'">'+escape(d.result)+'</span></p><details class="audit-technical"><summary>Referencia técnica '+icons.chevron+'</summary><dl>'+fact('Identificador',row.entity_id||'No aplica')+fact('Solicitud',row.request_id||'No registrada')+fact('Evento',row.action)+fact('Tipo de entidad',row.entity_type)+fact('Campo registrado',row.field_name||'No aplica')+'</dl><details><summary>Valores originales del registro</summary><h4>Anterior</h4><pre>'+escape(row.old_value??'null')+'</pre><h4>Nuevo</h4><pre>'+escape(row.new_value??'null')+'</pre></details></details>';
 }
 function availableCategories(role,module){return categories.filter(item=>(role!=='program_admin'||item.module==='programs')&&(!module||item.module===module));}
 function availableActions(role,module,category){
  const scope=role==='program_admin'?'programs':module||categories.find(item=>item.key===category)?.module;
  return Object.entries(actions).filter(([key])=>!scope||(scope==='programs'?key==='PROGRAM_UPDATE':scope==='settings'?key==='CONFIG_UPDATE'||key==='CONFIG_MIGRATION'&&(!category||category==='radication_resources'):key.startsWith('USER_')||key==='ADMIN_BOOTSTRAP')).map(([key,label])=>[key,key==='CONFIG_UPDATE'&&updates[category]?updates[category]:label]);
 }
 return Object.freeze({categories,actions,fieldLabel,describe,renderValue,rowHTML,detailHTML,availableCategories,availableActions});
});
