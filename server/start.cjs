'use strict';
const path=require('node:path');
const {createApplication}=require('./app.cjs');
const {publicOptions}=require('./public-access.cjs');
(async()=>{
 const port=Number(process.env.PORT||8787),host=process.env.HOST||'127.0.0.1';
 const app=await createApplication({database:process.env.OFE_DATABASE||path.resolve('var/ofe.sqlite'),origin:process.env.APP_ORIGIN||process.env.RENDER_EXTERNAL_URL||`http://127.0.0.1:${port}`,production:process.env.NODE_ENV==='production',...publicOptions()});
 app.server.listen(port,host,()=>console.log('Simulador disponible en '+app.origin));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit(0)));
})().catch(()=>{console.error('No se pudo iniciar. Revisa Node >=24, permisos de la base de datos, APP_ORIGIN (HTTPS en producción) y configuración de acceso público.');process.exit(1);});
