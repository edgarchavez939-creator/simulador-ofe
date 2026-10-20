(function(){
 'use strict';
 const button=document.getElementById('maintenance-retry'),feedback=document.getElementById('maintenance-feedback');
 async function check(){if(button.disabled)return;button.disabled=true;try{const response=await fetch('/api/public/status',{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error();const data=await response.json();if(data.maintenance?.enabled===false){location.reload();return;}document.getElementById('maintenance-title').textContent=data.maintenance.title;document.getElementById('maintenance-message').textContent=data.maintenance.message;feedback.textContent='El servicio continúa en mantenimiento. Inténtalo más adelante.';}catch{feedback.textContent='No fue posible comprobar la disponibilidad. Inténtalo nuevamente.';}finally{button.disabled=false;feedback.hidden=false;}}
 button.addEventListener('click',check);
 if(new URLSearchParams(location.search).get('preview')==='1'&&parent!==window)parent.postMessage({type:'ofe:public-maintenance',previewId:new URLSearchParams(location.search).get('reload')},location.origin);
})();
