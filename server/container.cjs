'use strict';
// Prepara el volumen montado y descarta privilegios antes de abrir la base o HTTP.
const fs=require('node:fs'),path=require('node:path');
const database=process.env.OFE_DATABASE||'/app/var/ofe.sqlite',directory=path.dirname(database);
if(process.getuid?.()===0){
 fs.mkdirSync(directory,{recursive:true,mode:0o700});fs.chmodSync(directory,0o700);fs.chownSync(directory,1000,1000);
 for(const file of [database,database+'-wal',database+'-shm'])if(fs.existsSync(file)){
  if(fs.lstatSync(file).isSymbolicLink())throw Error('La base no debe ser un enlace simbólico.');fs.chownSync(file,1000,1000);fs.chmodSync(file,0o600);
 }
 process.setgroups([]);process.setgid(1000);process.setuid(1000);
}
const action=process.argv[2];
if(action==='bootstrap'){require('./bootstrap.cjs');}
else if(action==='backup'){process.argv.splice(2,1);require('./backup.cjs');}
else if(action)throw Error('Acción de contenedor desconocida.');
else require('./start.cjs');
