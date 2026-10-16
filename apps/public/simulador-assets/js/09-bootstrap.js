/* Simulador OFE — único punto de arranque */
(function(global){
  'use strict';
  async function start() {
    const operation=global.OFELoading?.begin('Iniciando el simulador');
    const main = document.getElementById('main-content');
    const status = document.getElementById('app-startup-status');
    const previewMessage=type=>{if(global.OFE_PUBLIC&&global.parent&&global.parent!==global&&new URLSearchParams(global.location.search).get('preview')==='1')global.parent.postMessage({type,previewId:new URLSearchParams(global.location.search).get('reload')},global.location.origin);};
    if (main) {
      main.inert = true;
      main.setAttribute('aria-busy', 'true');
    }
    if (status) {
      status.hidden = true;
      status.textContent = '';
    }
    try {
      await global.SimuladorOFE.init((completed,total)=>operation?.update({completed,total,message:completed?'Preparando los módulos del simulador…':'Cargando programas…'}));
      if (main) {
        main.inert = false;
        main.removeAttribute('aria-busy');
      }
      if (status) status.hidden = true;
      previewMessage('ofe:public-ready');
    } catch (error) {
      previewMessage('ofe:public-error');
      console.error('[SimuladorOFE] Falló el arranque de la aplicación', error);
      if (main) main.removeAttribute('aria-busy');
      if (status) {
        status.hidden = false;
        status.className = 'note note--danger u-mb-4';
        status.setAttribute('role', 'alert');
        status.textContent = 'No fue posible iniciar el simulador. Recarga la página para intentarlo de nuevo.';
      }
    } finally { operation?.end(); }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})(window);
