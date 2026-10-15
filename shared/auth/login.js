(function(){
 'use strict';
 const $=id=>document.getElementById(id);let session=null,change=false;
 function changeMode(){
  change=true;$('auth-title').textContent='Crea tu contraseña personal';$('email-field').hidden=true;
  $('email').required=false;$('current-field').hidden=false;$('currentPassword').required=true;
  $('confirm-field').hidden=false;$('confirmation').required=true;$('password-policy').hidden=false;
  $('password').autocomplete='new-password';$('password').minLength=12;$('login-submit').textContent='Guardar contraseña';$('currentPassword').focus();
 }
 $('auth-theme').addEventListener('click',()=>{
  const next=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',next);try{localStorage.setItem('simulador_tema',next);}catch(_){}
 });
 $('toggle-password').addEventListener('click',()=>{const visible=$('password').type==='password';$('password').type=visible?'text':'password';$('toggle-password').textContent=visible?'Ocultar':'Mostrar';$('toggle-password').setAttribute('aria-pressed',String(visible));});
 $('login-form').addEventListener('submit',async event=>{
  event.preventDefault();$('auth-error').hidden=true;
  if(change&&$('password').value!==$('confirmation').value){$('auth-error').textContent='Las contraseñas no coinciden.';$('auth-error').hidden=false;return;}
  const button=$('login-submit');button.disabled=true;button.setAttribute('aria-busy','true');
  try{
   const response=await fetch(change?'/api/auth/password':'/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json',...(change?{'X-CSRF-Token':session.csrfToken}:{})},body:JSON.stringify(change?{currentPassword:$('currentPassword').value,password:$('password').value}:{email:$('email').value,password:$('password').value})});
   const data=await response.json();if(!response.ok)throw Error(data.error||'No fue posible iniciar sesión.');
   if(change){location.replace('/login');return;}
   session=data;if(data.user.must_change_password){$('password').value='';changeMode();}else location.replace('/apps/ofe/');
  }catch(error){$('auth-error').textContent=error.message;$('auth-error').hidden=false;}finally{button.disabled=false;button.removeAttribute('aria-busy');}
 });
 fetch('/api/auth/session',{credentials:'same-origin'}).then(async response=>{
  if(!response.ok)return;session=await response.json();if(session.user.must_change_password||new URLSearchParams(location.search).has('change'))changeMode();else location.replace('/apps/ofe/');
 }).catch(()=>{});
})();
