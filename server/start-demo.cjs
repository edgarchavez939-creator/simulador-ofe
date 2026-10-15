'use strict';
// Arranque opcional para demostraciones sin disco persistente ni consola remota.
// El servicio habitual y su bootstrap interactivo no usan estas variables.
const path=require('node:path'),os=require('node:os');
const {openStore}=require('./store.cjs');
const {passwordPolicy}=require('./security.cjs');
async function prepareDemo(env=process.env,root=path.resolve(__dirname,'..')){
 let password=env.OFE_DEMO_ADMIN_PASSWORD;
 delete env.OFE_DEMO_ADMIN_PASSWORD;
 try{
  if(env.OFE_EPHEMERAL_DEMO!=='1')throw Error('El arranque de pruebas requiere OFE_EPHEMERAL_DEMO=1. Usa el arranque habitual para datos persistentes.');
  const name=String(env.OFE_DEMO_ADMIN_NAME||'').trim(),email=String(env.OFE_DEMO_ADMIN_EMAIL||'').trim().toLowerCase();
  if(name.length<2||name.length>120||email.length>200||!/^\S+@\S+\.\S+$/.test(email))throw Error('Configura el nombre y correo del administrador de pruebas en las variables privadas del servicio.');
  passwordPolicy(password);
  const database=env.OFE_DATABASE||path.join(os.tmpdir(),'ofe-demo','ofe.sqlite');
  const store=await openStore(database,root);
  let created=false;
  try{
   if(!store.db.prepare('SELECT count(*) AS n FROM users').get().n){await store.bootstrap(name,email,password);created=true;}
  }finally{store.close();}
  env.OFE_DATABASE=database;
  return {created};
 }finally{password=null;}
}
if(require.main===module){
 prepareDemo().then(()=>{
  console.log('Entorno de pruebas temporal: usuarios, cambios y auditoría se pierden si se borra el almacenamiento.');
  require('./start.cjs');
 }).catch(()=>{
  console.error('No se pudo preparar la demostración. Revisa OFE_EPHEMERAL_DEMO=1, nombre, correo y contraseña privada de 12 a 128 caracteres.');
  process.exit(1);
 });
}
module.exports={prepareDemo};
