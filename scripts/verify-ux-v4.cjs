'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
function appearance(saved,systemDark=false){
 const attrs=new Map(),storage=new Map(saved===undefined?[]:[['simulador_tema',saved]]),handlers={},media={matches:systemDark,addEventListener:(name,fn)=>handlers[name]=fn};
 const context=vm.createContext({document:{documentElement:{setAttribute:(key,value)=>attrs.set(key,value)}},localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},matchMedia:()=>media,addEventListener:(name,fn)=>handlers[name]=fn});context.window=context;vm.runInContext(read('shared/theme.js'),context);return {api:context.OFETheme,attrs,storage,media,handlers};
}
test('one appearance preference supports light/dark/system, live OS changes and legacy persistence',()=>{
 const f=appearance();assert.equal(f.api.getPreference(),'system');assert.equal(f.attrs.get('data-theme'),'light');
 f.api.setPreference('system');f.media.matches=true;f.handlers.change();assert.equal(f.attrs.get('data-theme'),'dark');assert.equal(f.storage.get('simulador_tema'),'system');
 f.api.setPreference('light');f.handlers.change();assert.equal(f.attrs.get('data-theme'),'light');f.api.setPreference('dark');f.media.matches=false;f.handlers.change();assert.equal(f.attrs.get('data-theme'),'dark');
 assert.equal(appearance('dark').attrs.get('data-theme'),'dark');assert.equal(appearance('invalid',true).api.getPreference(),'system');assert.throws(()=>f.api.setPreference('invalid'),/inválida/);
 let calls=0;const unsubscribe=f.api.subscribe(()=>calls++);f.api.setPreference('system');unsubscribe();f.api.setPreference('light');assert.equal(calls,1);
 f.handlers.storage({key:'simulador_tema',newValue:'dark'});assert.equal(f.api.getPreference(),'dark');assert.equal(f.attrs.get('data-theme'),'dark');
});
async function loginFixture({session=null,submit}={}){
 const elements=new Map();for(const match of read('shared/auth/login.html').matchAll(/\bid="([^"]+)"/g))elements.set(match[1],{value:'',hidden:false,disabled:false,attributes:{},events:{},addEventListener(name,fn){this.events[name]=fn;},setAttribute(name,value){this.attributes[name]=value;},removeAttribute(name){delete this.attributes[name];},focus(){this.focused=true;}});
 const calls=[],redirects=[];const context=vm.createContext({document:{getElementById:id=>elements.get(id)},location:{search:'?change=1',replace:url=>redirects.push(url)},fetch:async(url,options)=>{calls.push({url,options});if(url==='/api/auth/session')return {ok:!!session,json:async()=>session};return submit(url,options);}});vm.runInContext(read('shared/auth/login.js'),context);await new Promise(setImmediate);
 return {elements,calls,redirects,submit:()=>elements.get('login-form').events.submit({preventDefault(){}})};
}
test('local login exposes errors and loading, then uses the real session response to navigate',async()=>{
 let finish;const f=await loginFixture({submit:()=>new Promise(resolve=>finish=resolve)});f.elements.get('email').value='fictional@example.test';f.elements.get('password').value='Test-only-password';
 const pending=f.submit();assert.equal(f.elements.get('login-submit').disabled,true);assert.equal(f.elements.get('login-submit-label').textContent,'Iniciando sesión…');finish({ok:false,json:async()=>({error:'Usuario o contraseña incorrectos.'})});await pending;
 assert.equal(f.elements.get('auth-error').hidden,false);assert.equal(f.elements.get('auth-error').focused,true);assert.equal(f.elements.get('login-submit').disabled,false);assert.equal(f.redirects.length,0);
 const success=f.submit();finish({ok:true,json:async()=>({user:{must_change_password:0},csrfToken:'test-csrf'})});await success;assert.deepEqual(f.redirects,['/apps/ofe/']);assert.equal(f.calls.at(-1).url,'/api/auth/login');
 const offline=await loginFixture({submit:async()=>{throw new TypeError('Failed to fetch');}});await offline.submit();assert.match(offline.elements.get('auth-error').textContent,/Revisa tu conexión/);
});
test('only mandatory local activation remains; ordinary password-change navigation is retired',async()=>{
 const active=await loginFixture({session:{user:{must_change_password:0}}});assert.deepEqual(active.redirects,['/apps/ofe/']);
 const f=await loginFixture({session:{user:{must_change_password:1},csrfToken:'initial-test-csrf'},submit:async()=>({ok:true,json:async()=>({ok:true})})});assert.equal(f.elements.get('auth-title').textContent,'Activa tu acceso local');assert.equal(f.elements.get('currentPassword').required,true);
 f.elements.get('password').value='Personal-test-password';f.elements.get('confirmation').value='different';await f.submit();assert.match(f.elements.get('auth-error').textContent,/no coinciden/);assert.equal(f.calls.length,1);
 f.elements.get('confirmation').value='Personal-test-password';await f.submit();assert.equal(f.calls.at(-1).url,'/api/auth/password');assert.equal(f.calls.at(-1).options.headers['X-CSRF-Token'],'initial-test-csrf');assert.deepEqual(f.redirects,['/login']);
});
test('authenticated shell has no sidebar appearance/profile controls or active fake institutional login',()=>{
 const html=read('apps/ofe/index.html'),sidebar=html.match(/<aside[^>]*>[\s\S]*?<\/aside>/)[0],login=read('shared/auth/login.html').replace(/<template[\s\S]*?<\/template>/g,'');
 for(const token of ['theme-toggle','nav__foot','account-logout','Cambiar contraseña','Apariencia'])assert.ok(!sidebar.includes(token),token);
 assert.ok(sidebar.includes('sidebar-collapse'));assert.ok(!html.includes('Lineamientos vigentes'));assert.ok(!html.includes('Archivos anteriores'));assert.ok(!html.includes('08-updater.js'));assert.ok(!login.includes('Continuar con Microsoft'));assert.ok(!login.includes('auth-theme'));
 const admin=read('shared/admin/admin-ui.js');assert.ok(!admin.includes('reset-form'));assert.ok(!admin.includes('data-reset-user'));assert.ok(!admin.includes('<details class="audit-detail"'));assert.ok(admin.includes("openDialog('audit-dialog'"));
});
test('operational Excel template preserves all 173 canonical identities, amounts and versions',async()=>{
 const {loadApp}=require('./test-support/catalog-context.cjs'),{context:c}=loadApp('ofe');await c.SimuladorOFE.init();const programs=Array.from(c.SimuladorOFE.catalog.programs,p=>({...p,version:7})),sheets={};c.SimuladorOFE={catalog:{programs}};c.toast=()=>{};
 c.ExcelJS=require('../shared/vendor/exceljs-4.4.0.min.js');c.OFEExcel={formats:{money:'$#,##0'},saveWorkbook:async book=>{for(const sheet of book.worksheets)sheets[sheet.name]={rows:sheet.getSheetValues().slice(1).map(row=>row.slice(1))};}};vm.runInContext(read('shared/admin/program-template.js'),c);await c.descargarPlantilla();
 assert.equal(sheets.Pregrado.rows.length,30);assert.equal(sheets.Posgrado.rows.length,145);const ids=[];for(const p of programs){const row=(p.nivel==='pregrado'?sheets.Pregrado:sheets.Posgrado).rows.find(row=>row[p.nivel==='pregrado'?4:3]===p.id);assert.ok(row);assert.equal(row[p.nivel==='pregrado'?1:2],p.valorMatricula);assert.equal(row.at(-1),7);ids.push(p.id);}assert.equal(new Set(ids).size,173);
});
