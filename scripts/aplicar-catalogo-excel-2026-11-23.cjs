'use strict';
// Aplicación manual, idempotente y auditada de los importes enviados en plantilla-programas.xlsx.
// No se ejecuta al arrancar: evita sobrescribir actualizaciones posteriores.
const fs=require('node:fs'),path=require('node:path');
const {randomUUID}=require('node:crypto');
const {backup}=require('node:sqlite');
const {openStore}=require('../server/store.cjs');
const root=path.resolve(__dirname,'..');
const source=require('../data/catalogo-excel-2026-11-23.json');
const args=process.argv.slice(2),apply=args.includes('--apply');
function option(name){const i=args.indexOf(name);return i<0?null:args[i+1];}
const provided=option('--db')||process.env.OFE_DATABASE;
if(!provided||provided===':memory:'){
 console.error('Indica una base existente mediante --db /ruta/absoluta/ofe.sqlite o OFE_DATABASE.');
 process.exit(2);
}
if(process.env.OFE_EPHEMERAL_DEMO==='1'){
 console.error('El almacenamiento de demostración es temporal. No se aplica una actualización irreversible a este entorno.');
 process.exit(2);
}
const database=path.resolve(provided);
if(!fs.existsSync(database)||!fs.statSync(database).isFile()){
 console.error('La base de datos no existe. Para instalaciones nuevas, el catálogo embebido ya está actualizado.');
 process.exit(2);
}
async function main(){
 if(source.total!==173||source.programs.length!==173||new Set(source.programs.map(p=>p.id)).size!==173)throw Error('Catálogo Excel incompleto o con ID duplicados.');
 const store=await openStore(database,root);
 try{
  const {db}=store;
  const current=db.prepare('SELECT id,data,version FROM programs').all();
  const byId=new Map(current.map(row=>[row.id,row]));
  const pending=[];
  for(const target of source.programs){
   const stored=byId.get(target.id);
   if(!stored)throw Error('Falta el programa '+target.id+'. No se ha modificado la base.');
   const old=JSON.parse(stored.data);
   if(old.nombre!==target.nombre||old.nivel!==target.nivel||(target.nivel==='posgrado'&&old.subnivel!==target.subnivel))throw Error('Identidad inconsistente: '+target.id);
   const fields=target.nivel==='pregrado'?['valorMatricula','valorIdiomas','semestres']:['valorMatricula'];
   const changes=fields.filter(key=>old[key]!==target[key]).map(key=>({field:key,old:old[key],next:target[key]}));
   if(changes.length)pending.push({stored,old,changes});
  }
  const totalFields=pending.reduce((s,p)=>s+p.changes.length,0);
  console.log(`Catálogo: ${source.total} programas; base: ${current.length}; pendientes: ${pending.length} programas y ${totalFields} campos.`);
  if(!apply){console.log('SIMULACIÓN sin cambios. Para aplicar: --apply. Antes, detén la aplicación y confirma respaldo y persistencia del disco.');return;}
  if(!pending.length){console.log('Sin cambios. No se genera auditoría adicional.');return;}
  const backupPath=database+'.bak-catalogo-'+new Date().toISOString().replace(/[:.]/g,'-');
  await backup(db,backupPath);
  const requestId=randomUUID(),actor={name:'Carga controlada Excel 2026-11-23',id:null,email:null},stamp=new Date().toISOString();
  store.transaction(()=>{
   for(const item of pending){
    const next={...item.old};
    for(const change of item.changes){
     next[change.field]=change.next;
     store.audit(actor,'PROGRAM_UPDATE','programs',{
      type:'program',id:item.stored.id,name:item.old.nombre
     },change.field,change.old,change.next,requestId);
    }
    const updated=db.prepare('UPDATE programs SET data=?,version=version+1,updated_at=?,updated_by=NULL WHERE id=? AND version=?').run(JSON.stringify(next),stamp,item.stored.id,item.stored.version);
    if(updated.changes!==1)throw Error('Conflicto al actualizar '+item.stored.id+'. La transacción se revierte.');
   }
  });
  const verified=db.prepare('SELECT count(*) AS n FROM audit_log WHERE request_id=?').get(requestId).n;
  if(verified!==totalFields)throw Error('Auditoría incompleta: revisar base y respaldo.');
  console.log(`Aplicado: ${pending.length} programas, ${totalFields} cambios auditados. Respaldo SQLite: ${backupPath}`);
 }finally{store.close();}
}
main().catch(error=>{console.error('ERROR:',error.message);process.exitCode=1;});
