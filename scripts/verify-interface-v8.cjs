'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {read,loadApp}=require('./test-support/catalog-context.cjs');
function loadingFixture(){
 const elements={},doc={};
 const element=id=>({id,hidden:false,inert:false,isConnected:true,disabled:false,attributes:{},style:{setProperty(){}},getClientRects:()=>[{}],setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];},getAttribute(k){return this.attributes[k]??null;},addEventListener(){},focus(){doc.activeElement=this;},matches(){return this.open||false;},showPopover(){this.open=true;},hidePopover(){this.open=false;doc.activeElement=doc.body;}});
 const background=element('background'),alreadyInert=element('already-inert'),button=element('button');alreadyInert.inert=true;
 doc.body=element('body');doc.body.children=[background,alreadyInert];doc.activeElement=button;
 doc.body.insertAdjacentHTML=()=>{for(const id of ['system-loading','loading-ring','loading-percent','loading-title','loading-message','loading-count'])elements[id]=element(id);elements['loading-ring'].dataset={};elements['system-loading'].hidden=true;doc.body.children.push(elements['system-loading']);};doc.getElementById=id=>elements[id];
 const c=vm.createContext({document:doc,setTimeout,requestAnimationFrame:fn=>setTimeout(fn,0)});c.window=c;vm.runInContext(read('shared/ui/loading.js'),c);
 return {c,doc,elements,background,alreadyInert,button,api:c.OFELoading};
}
test('loading preserves nested operations, honest progress, original inert state, aria and focus',()=>{
 const f=loadingFixture(),outer=f.api.begin('Inicializando',{total:3,completed:0});assert.equal(f.background.inert,true);assert.equal(f.doc.body.attributes['aria-busy'],'true');assert.equal(f.elements['loading-ring'].attributes['aria-valuenow'],'0');
 outer.update({completed:1,total:3,message:'Primera etapa completada'});const inner=f.api.begin('Consultando servidor');assert.equal(f.elements['loading-ring'].attributes['aria-valuenow'],'33');inner.end();inner.end();assert.equal(f.api.state().length,1);assert.equal(f.background.inert,true);
 outer.update({completed:0,total:3});assert.equal(f.elements['loading-ring'].attributes['aria-valuenow'],'33');outer.end();assert.equal(f.api.state().length,0);assert.equal(f.background.inert,false);assert.equal(f.alreadyInert.inert,true);assert.equal(f.elements['system-loading'].hidden,true);assert.equal(f.doc.activeElement,f.button);assert.equal(f.doc.body.attributes['aria-busy'],undefined);
 const unknown=f.api.begin('Esperando respuesta');assert.equal(f.elements['loading-ring'].attributes['aria-valuenow'],undefined);assert.equal(f.elements['loading-percent'].textContent,'');unknown.end();
});
test('loading releases UI after task rejection and authentication/network failures',async()=>{
 const f=loadingFixture();await assert.rejects(f.api.run('Validando',async p=>{await p.checkpoint({completed:1,total:2});throw Error('Validation failed');}),/Validation failed/);assert.equal(f.api.state().length,0);assert.equal(f.background.inert,false);
 f.c.OFE_SERVER={};f.c.fetch=async url=>{if(url==='/api/auth/session')return {ok:true,status:200,json:async()=>({user:{id:'test'},permissions:[],csrfToken:'test'})};throw TypeError('Network failed');};vm.runInContext(read('shared/auth/auth-adapter.js'),f.c);
 await assert.rejects(f.c.OFEAuth.request('/api/admin/users'),/Network failed/);assert.equal(f.api.state().length,0);assert.equal(f.background.inert,false);assert.equal(f.elements['system-loading'].hidden,true);
});
for(const app of ['ofe','public'])test(app+': startup counts completed modules, including recovery after partial initialization',async()=>{
 const {context:c}=loadApp(app,{console:{error(){}}});let fail=true,firstRuns=0;const trace=[];
 c.SimuladorOFE.register('first-test-stage',{init(){firstRuns++;}});c.SimuladorOFE.register('second-test-stage',{init(){if(fail){fail=false;throw Error('Retry');}}});
 await assert.rejects(c.SimuladorOFE.init((done,total)=>trace.push([done,total])),/Retry/);assert.deepEqual(trace.at(-1),[2,3]);trace.length=0;
 await c.SimuladorOFE.init((done,total)=>trace.push([done,total]));assert.equal(firstRuns,1);assert.deepEqual(trace,[[0,3],[1,3],[2,3],[3,3]]);assert.equal(c.OFELoading.state().length,0);
});

test('loading reconciles modal opening/closing instead of leaving the application inert',()=>{
 const f=loadingFixture();let modal={id:'original-dialog'};f.doc.querySelector=selector=>selector==='.app'?f.background:selector.startsWith('.scrim')?modal:null;
 f.background.inert=true;f.c.SimuladorOFE={state:{ui:{modalReturnFocus:f.button}}};
 const saving=f.api.begin('Guardando');modal=null;f.background.inert=false;const refresh=f.api.begin('Actualizando vista');assert.equal(f.background.inert,true);refresh.end();assert.equal(f.background.inert,true);saving.end();assert.equal(f.background.inert,false);assert.equal(f.doc.activeElement,f.button);
 const next=f.api.begin('Cargando');modal={id:'new-dialog'};f.background.inert=true;next.end();assert.equal(f.background.inert,true);
});
