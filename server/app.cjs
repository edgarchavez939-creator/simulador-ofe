'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {randomUUID}=require('node:crypto');
const {openStore,publicUser,ROLES}=require('./store.cjs');
const {frameOrigins,publicAssets,publicProgram,publicSettings}=require('./public-access.cjs');
const {DEFINITIONS,validate:validateSettings,readSettings}=require('./settings.cjs');
const {digest,token,hashPassword,verifyPassword,passwordPolicy}=require('./security.cjs');
const fail=(status,message,field)=>Object.assign(new Error(message),{status,field});
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf'};
const SESSION_MS=8*3600000,IDLE_MS=30*60000;
function validatedUser(body){
 if(typeof body.name!=='string'||body.name.trim().length<2||body.name.length>120)throw fail(422,'Escribe un nombre de 2 a 120 caracteres.','name');
 if(typeof body.email!=='string'||body.email.length>200||!/^\S+@\S+\.\S+$/.test(body.email))throw fail(422,'Escribe un correo válido.','email');
 if(!Object.hasOwn(ROLES,body.role))throw fail(422,'Selecciona un rol válido.','role');
 if(!['active','inactive'].includes(body.status))throw fail(422,'Selecciona un estado válido.','status');
 return {name:body.name.trim(),email:body.email.toLowerCase().trim(),role:body.role,status:body.status};
}
async function createApplication(options={}){
 const root=options.root||path.resolve(__dirname,'..'),origin=new URL(options.origin||'http://127.0.0.1:8787');
 if(!['http:','https:'].includes(origin.protocol)||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw Error('APP_ORIGIN debe ser un origen HTTP o HTTPS sin ruta ni credenciales.');
 if(options.production && origin.protocol!=='https:')throw Error('La publicación requiere APP_ORIGIN con HTTPS.');
 const publicEnabled=options.publicEnabled===true,parents=frameOrigins(options.publicFrameOrigins);
 const anonymousAssets=publicEnabled?publicAssets(root):new Set();
 const secure=origin.protocol==='https:',cookieName=secure?'__Host-ofe_session':'ofe_session';
 const store=await openStore(options.database||path.join(root,'var/ofe.sqlite'),root),{db,audit,transaction}=store;
 const dummy=await hashPassword(token());
 let hashing=0;
 async function withHash(fn){if(hashing>=2)throw fail(503,'Servicio ocupado. Inténtalo nuevamente.');hashing++;try{return await fn();}finally{hashing--;}}
 function headers(res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; worker-src 'self' blob:");
  if(secure)res.setHeader('Strict-Transport-Security','max-age=31536000');
 }
 const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
 const redirect=(res,url)=>{res.writeHead(303,{Location:url});res.end();};
 const cookie=(res,value,age)=>res.setHeader('Set-Cookie',`${cookieName}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`);
 function session(req){
  const pair=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='));
  const raw=pair?.slice(cookieName.length+1);if(!raw||!/^[a-zA-Z0-9_-]{43}$/.test(raw))return null;
  const row=db.prepare('SELECT s.*,u.status AS user_status FROM sessions s JOIN users u ON u.id=s.user_id WHERE token_hash=?').get(digest(raw));
  if(!row)return null;
  const now=Date.now();if(row.expires_at<=now||row.last_seen+IDLE_MS<=now||row.user_status!=='active') {db.prepare('DELETE FROM sessions WHERE token_hash=?').run(row.token_hash);return null;}
  if(req.url.split('?')[0]!=='/api/auth/session')db.prepare('UPDATE sessions SET last_seen=? WHERE token_hash=?').run(now,row.token_hash);
  const user=db.prepare('SELECT * FROM users WHERE id=?').get(row.user_id);return {...row,user,permissions:store.permissions(user.role)};
 }
 function requireSession(s,permission){if(!s)throw fail(401,'Inicia sesión para continuar.');if(permission&&!s.permissions.includes(permission))throw fail(403,'No tienes permiso para realizar esta acción.');}
 function live(req,permission){const active=session(req);requireSession(active,permission);if(active.user.must_change_password)throw fail(403,'Cambia tu contraseña inicial para continuar.');return active;}
 function rate(key,max){
  const now=Date.now(),row=db.prepare('SELECT * FROM login_attempts WHERE key=?').get(key);
  if(row&&row.reset_at>now&&row.count>=max)throw fail(429,'Demasiados intentos. Inténtalo más tarde.');
  db.prepare('INSERT INTO login_attempts VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET count=excluded.count,reset_at=excluded.reset_at').run(key,row&&row.reset_at>now?row.count+1:1,row&&row.reset_at>now?row.reset_at:now+15*60000);
  db.prepare('DELETE FROM login_attempts WHERE reset_at<?').run(now);
 }
 async function body(req){
  if(!String(req.headers['content-type']||'').startsWith('application/json'))throw fail(415,'Envía datos JSON.');
  let text='',size=0;for await(const chunk of req){size+=chunk.length;if(size>1024*1024)throw fail(413,'El archivo supera el tamaño permitido.');text+=chunk;}
  try{const value=JSON.parse(text);if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw fail(400,'Los datos no tienen un formato válido.');}
 }
 const entity=u=>({type:'user',id:u.id,name:u.name});
 function checkLastAdmin(old,next){
  if(old.role==='system_admin'&&old.status==='active'&&(next.role!=='system_admin'||next.status!=='active')&&db.prepare("SELECT count(*) AS n FROM users WHERE role='system_admin' AND status='active'").get().n<=1)throw fail(409,'Debe quedar al menos un administrador del sistema activo.');
 }
 const c=require('node:vm').createContext({});c.window=c;
 for(const filename of ['program-catalog-schema.js','program-catalog-validator.js'])require('node:vm').runInContext(fs.readFileSync(path.join(root,'shared/program-catalog',filename),'utf8'),c);
 function changeProgram(actor,id,input,requestId){
  const row=db.prepare('SELECT * FROM programs WHERE id=?').get(id);if(!row)throw fail(404,'Programa no encontrado.');
  if(input.version!==row.version)throw fail(409,'El programa cambió. Recarga antes de guardar.','version');
  const old=JSON.parse(row.data),allowed=['nombre','valorMatricula','valorIdiomas','semestres','activo'];
  if(!input.changes||typeof input.changes!=='object'||Array.isArray(input.changes)||Object.keys(input.changes).some(key=>!allowed.includes(key)))throw fail(422,'Solo se pueden editar los campos autorizados.');
  const next={...old,...input.changes};
  const errors=c.ProgramCatalogValidator.validate(next);if((typeof next.nombre==='string'&&next.nombre.length>200)||next.valorMatricula>Number.MAX_SAFE_INTEGER||next.valorIdiomas>Number.MAX_SAFE_INTEGER)errors.push('Valor fuera de rango');if(errors.length||!(next.valorMatricula>0))throw fail(422,errors.join('; ')||'La matrícula debe ser mayor que cero.');
  if(old.activo&&!next.activo&&db.prepare("SELECT count(*) AS n FROM programs WHERE json_extract(data,'$.activo')=1").get().n<=1)throw fail(409,'Debe quedar al menos un programa activo para iniciar el simulador.');
  let changed=false;
  for(const key of allowed)if(old[key]!==next[key]){changed=true;audit(actor,'PROGRAM_UPDATE','programs',{type:'program',id,name:old.nombre},key,old[key],next[key],requestId);}
  if(changed)db.prepare('UPDATE programs SET data=?,version=version+1,updated_at=?,updated_by=? WHERE id=?').run(JSON.stringify(next),new Date().toISOString(),actor.id,id);
  return {...next,version:row.version+(changed?1:0)};
 }
 async function route(req,res){
  headers(res);const requestId=randomUUID();res.setHeader('X-Request-Id',requestId);
  const url=new URL(req.url,origin),route=url.pathname,method=req.method;
  let s=session(req);
  const mutating=!['GET','HEAD'].includes(method);
  if(mutating){
   if(req.headers.origin!==origin.origin)throw fail(403,'Origen de petición no permitido.');
   if(route!=='/api/auth/login'&&(!s||req.headers['x-csrf-token']!==s.csrf_token))throw fail(s?403:401,s?'La sesión de la página cambió. Recarga e inténtalo nuevamente.':'Inicia sesión para continuar.');
  }
  if(route.startsWith('/api/public/')){
   if(!publicEnabled)throw fail(404,'Ruta no encontrada.');
   if(!['GET','HEAD'].includes(method))throw fail(405,'La API pública solo permite consultas.');
   if(route==='/api/public/programs'||route.startsWith('/api/public/programs/')){
    const programs=db.prepare('SELECT data FROM programs ORDER BY rowid').all().map(row=>JSON.parse(row.data)).filter(p=>p.activo).map(publicProgram);
    if(route==='/api/public/programs')return json(res,200,{programs});
    let id;try{id=decodeURIComponent(route.slice('/api/public/programs/'.length));}catch{throw fail(400,'Identificador inválido.');}
    const program=programs.find(p=>p.id===id);if(!program)throw fail(404,'Programa no encontrado.');return json(res,200,program);
   }
   if(route==='/api/public/simulation-settings')return json(res,200,publicSettings(readSettings(db)));
   throw fail(404,'Ruta no encontrada.');
  }
  if(route==='/api/health'&&method==='GET')return json(res,200,{ok:true});
  if(route==='/api/auth/login'&&method==='POST'){
   rate('ip:'+digest(req.socket.remoteAddress||''),60);
   const data=await body(req),email=typeof data.email==='string'?data.email.trim().toLowerCase():'';
   if(email.length>200)throw fail(401,'Usuario o contraseña incorrectos.');
   const key='account:'+digest(email);rate(key,10);
   let user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
   const checkedHash=user?.password_hash;
   const valid=await withHash(()=>verifyPassword(data.password,user?.password_hash||dummy));
   user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
   if(!valid||!user||user.status!=='active'||user.password_hash!==checkedHash){
    audit(null,'LOGIN_FAILURE','auth',{type:'session'},null,undefined,undefined,requestId,'DENIED');
    throw fail(401,'Usuario o contraseña incorrectos.');
   }
   const raw=token(),now=Date.now(),csrf=token();
   transaction(()=>{
    db.prepare('DELETE FROM sessions WHERE expires_at<? OR last_seen<?').run(now,now-IDLE_MS);
    if(s)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(s.token_hash);
    db.prepare('INSERT INTO sessions VALUES (?,?,?,?,?,?)').run(digest(raw),user.id,csrf,now,now,now+SESSION_MS);
    db.prepare('DELETE FROM login_attempts WHERE key=?').run(key);
    audit(user,'LOGIN_SUCCESS','auth',entity(user),null,undefined,undefined,requestId);
   });cookie(res,raw,SESSION_MS/1000);
   return json(res,200,{user:publicUser(user),permissions:store.permissions(user.role),csrfToken:csrf});
  }
  if(route.startsWith('/api/')){
   requireSession(s);
   if(s.user.must_change_password&&!['/api/auth/session','/api/auth/logout','/api/auth/password'].includes(route))throw fail(403,'Cambia tu contraseña inicial para continuar.');
   if(route==='/api/auth/session'&&method==='GET')return json(res,200,{user:publicUser(s.user),permissions:s.permissions,csrfToken:s.csrf_token});
   if(route==='/api/auth/logout'&&method==='POST'){
    transaction(()=>{db.prepare('DELETE FROM sessions WHERE token_hash=?').run(s.token_hash);audit(s.user,'LOGOUT','auth',entity(s.user),null,undefined,undefined,requestId);});cookie(res,'',0);return json(res,200,{ok:true});
   }
   if(route==='/api/auth/password'&&method==='POST'){
    const data=await body(req);passwordPolicy(data.password);
    if(!await withHash(()=>verifyPassword(data.currentPassword,s.user.password_hash)))throw fail(422,'La contraseña actual no es correcta.','currentPassword');
    const hash=await withHash(()=>hashPassword(data.password));
    requireSession(session(req));
    transaction(()=>{
     db.prepare('UPDATE users SET password_hash=?,must_change_password=0,version=version+1,updated_at=? WHERE id=?').run(hash,new Date().toISOString(),s.user.id);
     db.prepare('DELETE FROM sessions WHERE user_id=?').run(s.user.id);
     audit(s.user,'PASSWORD_CHANGE','users',entity(s.user),null,undefined,undefined,requestId);
    });cookie(res,'',0);return json(res,200,{ok:true,loginRequired:true});
   }
   if(route==='/api/programs'&&method==='GET'){requireSession(s,'programs.view');return json(res,200,{programs:db.prepare('SELECT * FROM programs ORDER BY rowid').all().map(row=>({...JSON.parse(row.data),version:row.version,updated_at:row.updated_at}))});}
   if(route==='/api/simulation-settings'&&method==='GET'){requireSession(s,'simulator.use');return json(res,200,readSettings(db));}
   if(route==='/api/admin/settings'){
    requireSession(s,method==='GET'?'settings.read':'settings.update');
    if(method==='GET')return json(res,200,{...readSettings(db),definitions:DEFINITIONS,fieldUpdates:Object.fromEntries(db.prepare("SELECT field_name,MAX(timestamp) AS timestamp FROM audit_log WHERE module='settings' AND action='CONFIG_UPDATE' AND result='SUCCESS' GROUP BY field_name").all().map(row=>[row.field_name,row.timestamp]))});
    if(method==='PUT'){
     const data=await body(req);validateSettings(data.changes);s=live(req,'settings.update');
     const settings=transaction(()=>{
      const old=readSettings(db);if(data.version!==old.version)throw fail(409,'La configuración cambió. Recarga antes de guardar.','version');
      const next={...old.values,...data.changes},changes=Object.keys(data.changes).filter(key=>old.values[key]!==next[key]);
      for(const key of changes)audit(s.user,'CONFIG_UPDATE','settings',{type:'setting',id:key,name:DEFINITIONS[key].label},key,old.values[key],next[key],requestId);
      if(changes.length)db.prepare('UPDATE global_settings SET data=?,version=version+1,updated_at=?,updated_by=? WHERE id=1').run(JSON.stringify(next),new Date().toISOString(),s.user.id);
      return readSettings(db);
     });return json(res,200,settings);
    }
   }
   if(route.startsWith('/api/admin/users')){
    const needed=method==='GET'?'users.read':method==='POST'&&route==='/api/admin/users'?'users.create':'users.update';requireSession(s,needed);
    if(route==='/api/admin/users'&&method==='GET')return json(res,200,{users:db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(publicUser)});
    if(route==='/api/admin/users'&&method==='POST'){
     const data=await body(req),next=validatedUser(data),hash=await withHash(()=>hashPassword(data.password));
     s=live(req,'users.create');
     const user=transaction(()=>{
      if(db.prepare('SELECT id FROM users WHERE email=?').get(next.email))throw fail(409,'Ya existe un usuario con ese correo.','email');
      const now=new Date().toISOString(),id=randomUUID();
      db.prepare('INSERT INTO users(id,name,email,password_hash,role,status,must_change_password,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?)').run(id,next.name,next.email,hash,next.role,next.status,now,now);
      const user=db.prepare('SELECT * FROM users WHERE id=?').get(id);
      audit(s.user,'USER_CREATE','users',entity(user),'profile',null,{name:next.name,email:next.email,role:next.role,status:next.status},requestId);
      return publicUser(user);
     });return json(res,201,{user});
    }
    const match=route.match(/^\/api\/admin\/users\/([^/]+)(\/password)?$/);
    if(match){
     const old=db.prepare('SELECT * FROM users WHERE id=?').get(match[1]);if(!old)throw fail(404,'Usuario no encontrado.');
     const data=await body(req);
     if(data.version!==old.version)throw fail(409,'El usuario cambió. Recarga antes de guardar.','version');
     if(match[2]&&method==='POST'){
      const hash=await withHash(()=>hashPassword(data.password));
      s=live(req,'users.update');
      transaction(()=>{
       if(db.prepare('SELECT version FROM users WHERE id=?').get(old.id).version!==data.version)throw fail(409,'El usuario cambió. Recarga antes de guardar.');
       audit(s.user,'PASSWORD_RESET_REQUESTED','users',entity(old),null,undefined,undefined,requestId);
       db.prepare('UPDATE users SET password_hash=?,must_change_password=1,version=version+1,updated_at=? WHERE id=?').run(hash,new Date().toISOString(),old.id);
       db.prepare('DELETE FROM sessions WHERE user_id=?').run(old.id);
       audit(s.user,'PASSWORD_RESET_COMPLETED','users',entity(old),null,undefined,undefined,requestId);
      });return json(res,200,{ok:true});
     }
     if(!match[2]&&method==='PATCH'){
      s=live(req,'users.update');
      const next=validatedUser(data);if(next.status!==old.status)requireSession(s,'users.disable');
      transaction(()=>{
       if(db.prepare('SELECT version FROM users WHERE id=?').get(old.id).version!==data.version)throw fail(409,'El usuario cambió. Recarga antes de guardar.');
       checkLastAdmin(old,next);
       const duplicate=db.prepare('SELECT id FROM users WHERE email=? AND id<>?').get(next.email,old.id);if(duplicate)throw fail(409,'Ya existe un usuario con ese correo.','email');
       for(const key of ['name','email','role','status'])if(next[key]!==old[key]){
        const action=key==='role'?'USER_ROLE_CHANGE':key==='status'?(next.status==='active'?'USER_ACTIVATE':'USER_DEACTIVATE'):'USER_UPDATE';
        audit(s.user,action,'users',entity(old),key,old[key],next[key],requestId);
       }
       db.prepare('UPDATE users SET name=?,email=?,role=?,status=?,version=version+1,updated_at=? WHERE id=?').run(next.name,next.email,next.role,next.status,new Date().toISOString(),old.id);
       if(next.role!==old.role||next.status!==old.status)db.prepare('DELETE FROM sessions WHERE user_id=?').run(old.id);
      });return json(res,200,{user:publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(old.id))});
     }
    }
   }
   if(route.startsWith('/api/admin/programs')){
    requireSession(s,'programs.update');
    const match=route.match(/^\/api\/admin\/programs\/(.+)$/);
    if(match&&method==='PUT'){
     const data=await body(req),id=decodeURIComponent(match[1]);s=live(req,'programs.update');const program=transaction(()=>changeProgram(s.user,id,data,requestId));return json(res,200,{program});
    }
    if(route==='/api/admin/programs'&&method==='POST'){
     const data=await body(req);if(!Array.isArray(data.updates)||!data.updates.length||data.updates.length>500)throw fail(422,'Selecciona entre 1 y 500 actualizaciones identificadas.');
     if(data.updates.some(item=>!item||typeof item!=='object'||Array.isArray(item)||typeof item.id!=='string'))throw fail(422,'Cada actualización debe identificar un programa válido.');
     if(new Set(data.updates.map(x=>x.id)).size!==data.updates.length)throw fail(422,'La propuesta contiene programas repetidos.');
     s=live(req,'programs.update');
     const programs=transaction(()=>data.updates.map(item=>changeProgram(s.user,item.id,item,requestId)));return json(res,200,{programs});
    }
   }
   if(route==='/api/admin/audit'&&method==='GET'){
    requireSession(s,'audit.read');const conditions=[],args=[];
    const administrative=url.searchParams.get('category')==='administrative';
    if(administrative)conditions.push("module IN ('users','programs','settings') AND action IN ('ADMIN_BOOTSTRAP','USER_CREATE','USER_UPDATE','USER_ROLE_CHANGE','USER_ACTIVATE','USER_DEACTIVATE','PROGRAM_UPDATE','CONFIG_UPDATE')");
    const localDates=url.searchParams.get('timeZone')==='America/Bogota';
    if(url.searchParams.has('timeZone')&&!localDates)throw fail(422,'Zona de fechas no admitida.');
    if(s.user.role==='program_admin')conditions.push("module='programs'");
    if(url.searchParams.get('actor')){conditions.push("(actor_user_id=? OR instr(lower(coalesce(actor_email,'')),lower(?))>0 OR instr(lower(coalesce(actor_name,'')),lower(?))>0)");args.push(url.searchParams.get('actor'),url.searchParams.get('actor'),url.searchParams.get('actor'));}
    for(const [key,column] of [['action','action'],['module','module'],['result','result']])if(url.searchParams.get(key)){conditions.push(column+'=?');args.push(url.searchParams.get(key));}
    if(url.searchParams.get('entity')){conditions.push("(instr(lower(coalesce(entity_name,'')),lower(?))>0 OR entity_id=?)");args.push(url.searchParams.get('entity'),url.searchParams.get('entity'));}
    for(const [key,operator] of [['from','>='],['to','<=']])if(url.searchParams.get(key)){
     const value=url.searchParams.get(key);if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw fail(422,'Fecha inválida.');conditions.push('timestamp'+operator+'?');args.push(new Date(value+(key==='from'?'T00:00:00.000':'T23:59:59.999')+(localDates?'-05:00':'Z')).toISOString());
    }
    if(url.searchParams.get('from')&&url.searchParams.get('to')&&url.searchParams.get('from')>url.searchParams.get('to'))throw fail(422,'La fecha inicial debe ser anterior o igual a la final.');
    const offset=Number(url.searchParams.get('offset')||0);if(!Number.isSafeInteger(offset)||offset<0)throw fail(422,'Página inválida.');
    const records=db.prepare('SELECT * FROM audit_log'+(conditions.length?' WHERE '+conditions.join(' AND '):'')+' ORDER BY timestamp DESC,id DESC LIMIT 100 OFFSET ?').all(...args,offset);
    return json(res,200,{records,nextOffset:records.length===100?offset+100:null});
   }
   throw fail(404,'Ruta no encontrada.');
  }
  if(!['GET','HEAD'].includes(method))throw fail(405,'Método no permitido.');
  if(publicEnabled){
   if(['/simulador','/simulador/','/apps/public'].includes(route))return redirect(res,'/apps/public/');
   if(route==='/apps/public/'||route==='/apps/public/index.html'){
    res.setHeader('Content-Security-Policy',res.getHeader('Content-Security-Policy').replace("frame-ancestors 'none'","frame-ancestors 'self'"+(parents.length?' '+parents.join(' '):'')));
    if(parents.length)res.removeHeader('X-Frame-Options');else res.setHeader('X-Frame-Options','SAMEORIGIN');
    return serve(res,path.join(root,'apps/public/index.html'),method);
   }
   if(route==='/apps/public/runtime-config.js'){
    res.setHeader('Content-Type',TYPES['.js']);return res.end(method==='HEAD'?'':"window.OFE_PUBLIC = Object.freeze({apiBaseUrl:'/api/public'});");
   }
   if(anonymousAssets.has(route))return serve(res,path.join(root,'.'+route),method);
  }
  if(route==='/')return redirect(res,'/apps/ofe/');
  if(route==='/apps/public/'||route==='/index.html')return redirect(res,'/apps/ofe/');
  if(route==='/login'||route==='/login/')return serve(res,path.join(root,'shared/auth/login.html'),method);
  const assets={'/auth-assets/loading.js':'shared/ui/loading.js','/auth-assets/loading.css':'shared/ui/loading.css','/auth-assets/access.css':'shared/auth/access.css','/auth-assets/fonts.css':'shared/fonts/public-sans.css','/auth-assets/density.css':'shared/ui/density.css','/auth-assets/PublicSans-Variable.ttf':'shared/fonts/PublicSans-Variable.ttf','/auth-assets/styles.css':'apps/ofe/simulador-assets/styles.css','/auth-assets/login.js':'shared/auth/login.js','/auth-assets/theme.js':'shared/theme.js','/auth-assets/icons.js':'shared/ui/icons.js'};
  if(assets[route])return serve(res,path.join(root,assets[route]),method);
  requireSession(s);
  if(route==='/apps/ofe/config.js')return serve(res,path.join(root,'apps/ofe/config.js'),method);
  if(route==='/runtime-config.js'){res.setHeader('Content-Type',TYPES['.js']);return res.end('window.OFE_SERVER = Object.freeze('+JSON.stringify({authProvider:'local',apiBaseUrl:'/api',userId:s.user.id})+');');}
  if(route.startsWith('/admin')){
   const permissions={'/admin':'audit.read','/admin/users':'users.read','/admin/programs':'programs.update','/admin/audit':'audit.read','/admin/settings':'settings.read'};
   if(!permissions[route])throw fail(404,'Ruta no encontrada.');requireSession(s,permissions[route]);
  }
  if(route==='/apps/ofe/'||route==='/apps/ofe/index.html'||route.startsWith('/admin')){
   if(s.user.must_change_password)return redirect(res,'/login?change=1');
   let html=fs.readFileSync(path.join(root,'apps/ofe/index.html'),'utf8').replace('<head>','<head>\n<base href="/apps/ofe/">');
   // No se usa base: la CSP conserva base-uri none. Redirección a la URL real con vista.
   if(route.startsWith('/admin'))return redirect(res,'/apps/ofe/?admin='+encodeURIComponent(route.split('/')[2]||'audit'));
   html=html.replace('<base href="/apps/ofe/">','').replace('<script src="./config.js"','<script src="/runtime-config.js"></script>\n<script src="./config.js"');
   res.setHeader('Content-Type',TYPES['.html']);return res.end(method==='HEAD'?'':html);
  }
  const decoded=decodeURIComponent(route);
  if(decoded.includes('..')||decoded.includes('\\')||!/^\/(apps\/ofe\/simulador-assets\/|shared\/)/.test(decoded))throw fail(404,'Ruta no encontrada.');
  const ext=path.extname(decoded);if(!TYPES[ext]||ext==='.html')throw fail(404,'Archivo no encontrado.');
  const file=path.resolve(root,'.'+decoded);if(!file.startsWith(root+path.sep))throw fail(404,'Archivo no encontrado.');return serve(res,file,method);
 }
 function serve(res,file,method){
  if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw fail(404,'Archivo no encontrado.');
  res.setHeader('Content-Type',TYPES[path.extname(file)]||'application/octet-stream');res.end(method==='HEAD'?'':fs.readFileSync(file));
 }
 const server=http.createServer((req,res)=>route(req,res).catch(error=>{
  if(res.headersSent){res.destroy();return;}
  const status=error.status||500;
  if(req.url.startsWith('/api/admin/')){
   try { const actor=session(req)?.user;const module=req.url.includes('/programs')?'programs':req.url.includes('/users')?'users':req.url.includes('/settings')?'settings':'audit';audit(actor,'ADMIN_REQUEST_FAILURE',module,{type:'request'},null,undefined,undefined,res.getHeader('X-Request-Id'),status===401||status===403?'DENIED':'ERROR'); } catch(_){}
  }
  if(status===401&&!req.url.startsWith('/api/'))return redirect(res,'/login');
  json(res,status,{error:status===500?'No fue posible completar la operación.':error.message,...(error.field?{field:error.field}:{})});
 }));
 server.requestTimeout=15000;server.headersTimeout=10000;
 return {server,store,origin:origin.origin,close:async()=>{await new Promise(resolve=>server.close(resolve));store.close();}};
}
module.exports={createApplication};
