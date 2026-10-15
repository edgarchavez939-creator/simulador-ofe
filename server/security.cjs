'use strict';
const {scrypt, randomBytes, timingSafeEqual, createHash} = require('node:crypto');
const {promisify} = require('node:util');
const derive = promisify(scrypt);
const COST = {N:131072, r:8, p:1, maxmem:256*1024*1024};
const digest = value => createHash('sha256').update(value).digest('hex');
const token = () => randomBytes(32).toString('base64url');
function passwordPolicy(value) {
 if(typeof value!=='string' || value.length<12 || value.length>128) throw Object.assign(new Error('Usa una contraseña de 12 a 128 caracteres.'),{status:422,field:'password'});
}
async function hashPassword(password) {
 passwordPolicy(password);const salt=randomBytes(16).toString('hex');
 const hash=await derive(password,salt,64,COST);
 return `scrypt$131072$8$1$${salt}$${hash.toString('hex')}`;
}
async function verifyPassword(password, encoded) {
 if(typeof password!=='string' || password.length>128) return false;
 const parts=String(encoded).split('$');if(parts.length!==6 || parts[0]!=='scrypt')return false;
 const expected=Buffer.from(parts[5],'hex');
 const actual=await derive(password,parts[4],64,COST);
 return expected.length===actual.length && timingSafeEqual(expected,actual);
}
module.exports={digest,token,hashPassword,verifyPassword,passwordPolicy};
