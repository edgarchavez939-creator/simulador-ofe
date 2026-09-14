/* Simulador OFE — único punto de arranque */
(function(global){
  'use strict';
  const start = () => global.SimuladorOFE.init().catch(error => {
    console.error('[SimuladorOFE] Falló el arranque de la aplicación', error);
  });
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else {
    start();
  }
})(window);
