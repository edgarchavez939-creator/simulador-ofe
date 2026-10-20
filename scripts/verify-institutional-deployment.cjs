'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const net=require('node:net');
const {spawn,execFile}=require('node:child_process');
const {promisify}=require('node:util');
const {DatabaseSync}=require('node:sqlite');
const {openStore}=require('../server/store.cjs');
const run=promisify(execFile),root=path.resolve(__dirname,'..');
const origin='https://ofe.example.test',email='deployment@example.test',password='Institutional-QA-only-2026!';
async function availablePort(){
 const server=net.createServer();await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const port=server.address().port;await new Promise(resolve=>server.close(resolve));return port;
}
async function start(envFile){
 const child=spawn(process.execPath,['--env-file='+envFile,'server/start.cjs'],{cwd:root,env:{PATH:process.env.PATH||''},stdio:['ignore','pipe','pipe']});
 let output='';child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
 const exited=new Promise(resolve=>child.once('exit',(code,signal)=>resolve({code,signal})));
 const stop=async()=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM');return exited;};
 try{
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Normal startup did not become ready: '+output)),30000);
   const finish=fn=>value=>{clearTimeout(timer);fn(value);};
   child.on('error',finish(reject));
   child.stdout.on('data',chunk=>{output+=chunk;if(output.includes('Simulador disponible en '+origin))finish(resolve)();});
   child.stderr.on('data',chunk=>{output+=chunk;});
   child.once('exit',code=>finish(reject)(Error('Startup exited '+code+': '+output)));
  });
 }catch(error){await stop();throw error;}
 return {stop};
}
test('institutional CLI loads an external env file, uses secure origin and preserves data across restart and consistent backup', {timeout:60000},async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ofe-institutional-')),database=path.join(dir,'persistent.sqlite'),envFile=path.join(dir,'ofe.env'),port=await availablePort();
 let running;
 t.after(async()=>{if(running)await running.stop();fs.rmSync(dir,{recursive:true,force:true});});
 fs.writeFileSync(envFile,['NODE_ENV=production','APP_ORIGIN='+origin,'HOST=127.0.0.1','PORT='+port,'OFE_DATABASE='+database,'OFE_PUBLIC_ENABLED=1','OFE_PUBLIC_FRAME_ORIGINS="https://www.uninorte.edu.co"',''].join('\n'),{mode:0o600});
 const store=await openStore(database,root);try{await store.bootstrap('Deployment QA',email,password);}finally{store.close();}
 running=await start(envFile);const base='http://127.0.0.1:'+port;
 let response=await fetch(base+'/api/health');assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true});
 response=await fetch(base+'/apps/public/');assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'self' https:\/\/www\.uninorte\.edu\.co/);assert.match(response.headers.get('strict-transport-security'),/max-age=31536000/);assert.equal(response.headers.get('x-content-type-options'),'nosniff');
 response=await fetch(base+'/apps/ofe/',{redirect:'manual'});assert.equal(response.status,303);assert.equal(response.headers.get('location'),'/login');
 response=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 assert.equal(response.status,200);const cookieHeader=response.headers.get('set-cookie');assert.match(cookieHeader,/^__Host-ofe_session=/);assert.match(cookieHeader,/HttpOnly/);assert.match(cookieHeader,/SameSite=Strict/);assert.match(cookieHeader,/; Secure/);
 const cookie=cookieHeader.split(';')[0],session=await response.json(),headers={Cookie:cookie,Origin:origin,'X-CSRF-Token':session.csrfToken,'Content-Type':'application/json'};
 response=await fetch(base+'/api/admin/public-access',{headers});assert.equal(response.status,200);assert.equal((await response.json()).url,origin+'/apps/public/');
 const programs=(await (await fetch(base+'/api/programs',{headers})).json()).programs;assert.equal(programs.length,173);assert.equal(new Set(programs.map(p=>p.id)).size,173);
 const program=programs.find(p=>p.nivel==='pregrado'),updatedValue=program.valorMatricula+1;
 response=await fetch(base+'/api/admin/programs/'+encodeURIComponent(program.id),{method:'PUT',headers,body:JSON.stringify({version:program.version,changes:{valorMatricula:updatedValue,valorIdiomas:175000}})});assert.equal(response.status,200);
 const backup=path.join(dir,'consistent-backup.sqlite');await run(process.execPath,['--env-file='+envFile,'server/backup.cjs',backup],{cwd:root,env:{PATH:process.env.PATH||''},timeout:15000});
 assert.ok(fs.statSync(backup).size>0);await running.stop();running=undefined;
 running=await start(envFile);
 const publicPrograms=(await (await fetch(base+'/api/public/programs')).json()).programs;
 const changed=publicPrograms.find(p=>p.id===program.id);assert.equal(publicPrograms.length,173);assert.equal(changed.valorMatricula,updatedValue);assert.equal(changed.valorIdiomas,175000);
 const restored=path.join(dir,'restored.sqlite');fs.copyFileSync(backup,restored);const db=new DatabaseSync(restored,{readOnly:true});
 try{assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');assert.equal(db.prepare('SELECT count(*) AS n FROM programs').get().n,173);assert.equal(db.prepare('SELECT count(*) AS n FROM users WHERE email=?').get(email).n,1);assert.equal(JSON.parse(db.prepare('SELECT data FROM programs WHERE id=?').get(program.id).data).valorMatricula,updatedValue);assert.equal(db.prepare("SELECT count(*) AS n FROM audit_log WHERE action='PROGRAM_UPDATE' AND entity_id=?").get(program.id).n,2);}finally{db.close();}
});
