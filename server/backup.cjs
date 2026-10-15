'use strict';
const {DatabaseSync,backup}=require('node:sqlite');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const source=process.env.OFE_DATABASE||path.resolve('var/ofe.sqlite'),destination=process.argv[2];
 if(!destination||fs.existsSync(destination))throw Error('Indica un destino nuevo para la copia de respaldo.');
 const db=new DatabaseSync(source,{readOnly:true});try{await backup(db,path.resolve(destination));fs.chmodSync(destination,0o600);console.log('Copia consistente completada. Conserva el archivo fuera del servidor.');}finally{db.close();}
})().catch(error=>{console.error(error.message);process.exit(1);});
