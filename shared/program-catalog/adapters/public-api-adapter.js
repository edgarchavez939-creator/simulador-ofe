(function(global){
 'use strict';
 function withConfig(settings={}){
  const base=(settings.baseUrl||'/api/public').replace(/\/+$/,''),request=(route,notFound=false)=>global.ProgramCatalogHttp.request(base+route,{}, {timeoutMs:settings.requestTimeoutMs||15000,allowNotFound:notFound});
  return Object.freeze({source:'api',capabilities:Object.freeze({read:true,write:false,import:false,history:false}),withConfig,
   async list(params={}){return global.ProgramCatalogNormalizer.filter(global.ProgramCatalogValidator.readList(await request('/programs')),params);},
   async get(id){if(!id)return null;return global.ProgramCatalogValidator.readProgram(await request('/programs/'+encodeURIComponent(id),true),id);}
  });
 }
 global.ProgramCatalogPublicApiAdapter=withConfig();
})(window);
