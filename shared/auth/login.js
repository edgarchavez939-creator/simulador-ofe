(function(){
 'use strict';
 const loading=typeof window==='undefined'?null:window.OFELoading;
 // Authentication providers return the same server-owned user and session contract.
 // Internal roles/permissions are never assigned from browser-side provider data.
 const localProvider=Object.freeze({
  id:'local',
  async session(){const operation=loading?.begin('Comprobando acceso');try{const response=await fetch('/api/auth/session',{credentials:'same-origin'});return response.ok?await response.json():null;}finally{operation?.end();}},
  async submit(activation,data,session){
   const operation=loading?.begin(activation?'Activando acceso':'Iniciando sesión',{message:'Validando tu acceso…'});try{
   const response=await fetch(activation?'/api/auth/password':'/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json',...(activation?{'X-CSRF-Token':session.csrfToken}:{})},body:JSON.stringify(data)});
   const result=await response.json();if(!response.ok)throw Error(result.error||'No fue posible iniciar sesión.');return result;
   }finally{operation?.end();}
  }
 });
 const provider=localProvider,$=id=>document.getElementById(id);let session=null,activation=false;
 function activate(){
  activation=true;$('auth-title').textContent='Activa tu acceso local';$('auth-description').textContent='Completa la activación obligatoria de tu primera sesión.';
  $('email-field').hidden=true;$('email').required=false;$('current-field').hidden=false;$('currentPassword').required=true;
  $('confirm-field').hidden=false;$('confirmation').required=true;$('password-policy').hidden=false;
  $('password-label').textContent='Contraseña personal';$('password').autocomplete='new-password';$('password').minLength=12;$('login-submit-label').textContent='Activar acceso';$('currentPassword').focus();
 }
 function error(message){$('auth-error').textContent=message;$('auth-error').hidden=false;$('auth-error').focus();}
 $('toggle-password').addEventListener('click',()=>{const visible=$('password').type==='password';$('password').type=visible?'text':'password';$('toggle-password').setAttribute('aria-label',visible?'Ocultar contraseña':'Mostrar contraseña');$('toggle-password').setAttribute('aria-pressed',String(visible));});
 $('login-form').addEventListener('submit',async event=>{
  event.preventDefault();$('auth-error').hidden=true;
  if(activation&&$('password').value!==$('confirmation').value)return error('Las contraseñas no coinciden.');
  const button=$('login-submit'),label=$('login-submit-label');if(button.disabled)return;
  button.disabled=true;button.setAttribute('aria-busy','true');label.textContent=activation?'Activando acceso…':'Iniciando sesión…';
  try{
   const data=await provider.submit(activation,activation?{currentPassword:$('currentPassword').value,password:$('password').value}:{email:$('email').value,password:$('password').value},session);
   if(activation){location.replace('/login');return;}
   session=data;if(data.user.must_change_password){$('password').value='';activate();}else location.replace('/apps/ofe/');
  }catch(cause){error(['TypeError','SyntaxError'].includes(cause.name)?'No fue posible conectar con el servicio. Revisa tu conexión e inténtalo nuevamente.':cause.message);}finally{button.disabled=false;button.removeAttribute('aria-busy');label.textContent=activation?'Activar acceso':'Iniciar sesión';}
 });
 provider.session().then(data=>{if(!data)return;session=data;if(session.user.must_change_password)activate();else location.replace('/apps/ofe/');}).catch(()=>{});
})();
