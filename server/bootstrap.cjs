'use strict';
const readline=require('node:readline/promises'),path=require('node:path');
const {openStore}=require('./store.cjs');
async function main(){
 if(!process.stdin.isTTY)throw Error('Ejecuta este comando en una terminal interactiva.');
 const rl=readline.createInterface({input:process.stdin,output:process.stdout});
 const name=(await rl.question('Nombre del primer administrador: ')).trim();
 const email=(await rl.question('Correo: ')).trim().toLowerCase();rl.close();
 if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>200)throw Error('Nombre o correo inválido.');
 const hidden=prompt=>new Promise(resolve=>{
  process.stdout.write(prompt);let value='';process.stdin.setRawMode(true);process.stdin.resume();
  const handler=chunk=>{for(const char of chunk.toString()){
   if(char==='\u0003'){process.stdin.setRawMode(false);process.exit(130);}
   if(char==='\r'||char==='\n'){process.stdin.off('data',handler);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');resolve(value);return;}
   if(char==='\u007f')value=value.slice(0,-1);else if(char>=' ')value+=char;
  }};process.stdin.on('data',handler);
 });
 const password=await hidden('Contraseña (mínimo 12 caracteres; no se muestra): ');
 if(password!==await hidden('Confirmar contraseña: '))throw Error('Las contraseñas no coinciden.');
 const store=await openStore(process.env.OFE_DATABASE||path.resolve('var/ofe.sqlite'),path.resolve(__dirname,'..'));
 try{await store.bootstrap(name,email,password);console.log('Administrador creado. Ya puedes iniciar sesión.');}finally{store.close();}
}
main().catch(error=>{console.error(error.message);process.exit(1);});
