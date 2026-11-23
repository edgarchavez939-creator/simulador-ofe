'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const {openStore}=require('../server/store.cjs');
const root=path.resolve(__dirname,'..'),target=require('../data/catalogo-excel-2026-11-23.json');
test('catálogo del Excel coincide con las tres copias HTML sin perder IDs',()=>{
 assert.equal(target.programs.length,173);
 for(const file of ['index.html','apps/ofe/index.html','apps/public/index.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const get=(name)=>JSON.parse(html.match(new RegExp('/\\*%%'+name+'_START%%\\*/([\\s\\S]*?)/\\*%%'+name+'_END%%\\*/'))[1]);
  const pre=get('PROGRAMAS'),pos=get('POSGRADOS');
  assert.equal(pre.length,29);assert.equal(pos.length,144);
  target.programs.filter(p=>p.nivel==='pregrado').forEach((item,i)=>assert.deepEqual(pre[i],[item.nombre,item.valorMatricula,item.valorIdiomas,item.semestres]));
  target.programs.filter(p=>p.nivel==='posgrado').forEach((item,i)=>assert.deepEqual(pos[i],[item.nombre,item.subnivel,item.valorMatricula]));
 }
});
test('migración es explícita, auditable, idempotente y deja respaldo',async t=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-excel-catalog-'));t.after(()=>fs.rmSync(tmp,{force:true,recursive:true}));
 const filename=path.join(tmp,'ofe.sqlite');let store=await openStore(filename,root),p=target.programs[0];
 // Simular una matrícula modificada y un registro de auditoría anterior.
 const row=store.db.prepare('SELECT data,version FROM programs WHERE id=?').get(p.id),old=JSON.parse(row.data);
 store.db.prepare('UPDATE programs SET data=? WHERE id=?').run(JSON.stringify({...old,valorMatricula:old.valorMatricula-123}),p.id);
 store.audit(null,'PROGRAM_UPDATE','programs',{type:'program',id:p.id,name:old.nombre},'valorMatricula',1,2,'historical-record');
 const originalAudit=store.db.prepare('SELECT count(*) AS n FROM audit_log').get().n;
 store.close();
 const cli=path.join(root,'scripts/aplicar-catalogo-excel-2026-11-23.cjs');
 const run=(args)=>execFileSync(process.execPath,[cli,'--db',filename,...args],{cwd:root,encoding:'utf8'});
 assert.match(run([]),/SIMULACIÓN sin cambios/);
 store=await openStore(filename,root);
 assert.equal(JSON.parse(store.db.prepare('SELECT data FROM programs WHERE id=?').get(p.id).data).valorMatricula,p.valorMatricula-123);
 store.close();
 assert.match(run(['--apply']),/Aplicado: 1 programas, 1 cambios auditados/);
 store=await openStore(filename,root);
 assert.equal(JSON.parse(store.db.prepare('SELECT data FROM programs WHERE id=?').get(p.id).data).valorMatricula,p.valorMatricula);
 assert.equal(store.db.prepare('SELECT count(*) AS n FROM audit_log').get().n,originalAudit+1);
 assert.equal(store.db.prepare("SELECT count(*) AS n FROM audit_log WHERE request_id='historical-record'").get().n,1);
 store.close();
 assert.match(run(['--apply']),/Sin cambios/);
 store=await openStore(filename,root);
 assert.equal(store.db.prepare('SELECT count(*) AS n FROM audit_log').get().n,originalAudit+1);
 store.close();
 assert.equal(fs.readdirSync(tmp).filter(name=>name.includes('.bak-catalogo-')).length,1);
});
