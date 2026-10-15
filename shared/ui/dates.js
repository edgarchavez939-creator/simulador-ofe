(function(global){
 'use strict';
 const timeZone='America/Bogota';
 function format(value,options){if(!value)return 'Sin cambios registrados';const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleString('es-CO',{timeZone,...options}):'Fecha no disponible';}
 global.OFEDates=Object.freeze({short:value=>format(value,{day:'numeric',month:'short',year:'numeric'}),dateTime:value=>format(value,{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true})});
})(window);
