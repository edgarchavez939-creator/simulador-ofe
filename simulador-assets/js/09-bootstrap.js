/* Simulador OFE — único punto de arranque */
(function(global){
  'use strict';
  async function start(){
    const operation=global.OFELoading?.begin('Iniciando el simulador');
    try{await global.SimuladorOFE.init((completed,total)=>operation?.update({completed,total,message:'Preparando los módulos del simulador…'}));}
    catch(error){console.error('[SimuladorOFE] Falló el arranque de la aplicación',error);}
    finally{operation?.end();}
  }
  if(document.readyState === 'loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})(window);
