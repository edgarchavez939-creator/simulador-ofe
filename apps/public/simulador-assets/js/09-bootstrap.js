/* Simulador OFE — único punto de arranque */
(function(global){
  'use strict';
  async function start() {
    const main = document.getElementById('main-content');
    const status = document.getElementById('app-startup-status');
    if (main) {
      main.inert = true;
      main.setAttribute('aria-busy', 'true');
    }
    if (status) {
      status.hidden = false;
      status.textContent = 'Cargando programas…';
    }
    try {
      await global.SimuladorOFE.init();
      if (main) {
        main.inert = false;
        main.removeAttribute('aria-busy');
      }
      if (status) status.hidden = true;
    } catch (error) {
      console.error('[SimuladorOFE] Falló el arranque de la aplicación', error);
      if (main) main.removeAttribute('aria-busy');
      if (status) {
        status.className = 'note note--danger u-mb-4';
        status.setAttribute('role', 'alert');
        status.textContent = 'No fue posible iniciar el simulador. Recarga la página para intentarlo de nuevo.';
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})(window);
