(function(global){
 'use strict';
 const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 function programs(rows,{query='',levels=[],status=''}={}){const q=normalize(query);return rows.filter(p=>(!levels.length||levels.includes(p.nivel))&&(!status||(status==='active')===p.activo)&&normalize(p.nombre+' '+(p.codigo||'')+' '+(p.subnivel||'')).includes(q));}
 function users(rows,{query='',role='',status=''}={}){const q=normalize(query);return rows.filter(u=>(!role||u.role===role)&&(!status||u.status===status)&&normalize(u.name+' '+u.email).includes(q));}
 const api=Object.freeze({programs,users});if(typeof module==='object')module.exports=api;else global.OFEAdminFilters=api;
})(typeof window==='object'?window:globalThis);
