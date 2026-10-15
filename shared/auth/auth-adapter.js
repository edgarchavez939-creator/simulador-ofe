(function(global){
 'use strict';let current=null;
 async function refresh(){
  if(!global.OFE_SERVER){current=null;return null;}
  const response=await fetch('/api/auth/session',{credentials:'same-origin',cache:'no-store'});
  if(response.status===401){current=null;return null;}
  if(!response.ok)throw Error('No fue posible validar la sesión.');current=await response.json();return current;
 }
 function requestTitle(url,options){if(url.includes('/logout'))return 'Cerrando sesión';const saving=options.method&&options.method!=='GET';if(saving)return 'Guardando cambios';if(url.includes('/admin/users'))return 'Cargando usuarios';if(url.includes('/admin/audit'))return 'Cargando auditoría';if(url.includes('settings'))return 'Cargando configuración';return 'Cargando información';}
 async function request(url,options={}){
  const operation=global.OFELoading?.begin(requestTitle(url,options),{message:'Conectando con el servidor…'});
  try{
   if(!current)await refresh();
   const response=await fetch(url,{...options,credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{}),'X-CSRF-Token':current?.csrfToken||'',...options.headers}});
   if(response.status===401){current=null;global.location?.replace('/login');throw Error('La sesión terminó. Inicia sesión nuevamente.');}
   operation?.update({message:'Procesando la respuesta del servidor…'});
   const data=await response.json();if(!response.ok)throw Object.assign(Error(data.error||'No fue posible completar la acción.'),{status:response.status,field:data.field});return data;
  }finally{operation?.end();}
 }

 global.OFEAuth={refresh,request,async isAuthenticated(){return !!await refresh();},async getUser(){return current?.user||null;},async getRoles(){return current?[current.user.role]:[];},async can(permission){return !!current?.permissions.includes(permission==='audit.view'?'audit.read':permission);},async logout(){await request('/api/auth/logout',{method:'POST',body:'{}'});current=null;global.location.replace('/login');}};
})(window);
