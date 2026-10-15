"use strict";
const DEFINITIONS=Object.freeze({
 default_interest_rate:{label:'Tasa por defecto (% M.V.)',default:1.53,min:0,max:10},
 default_installments:{label:'Cuotas por defecto',default:6,min:1,max:60,integer:true},
 garantisa_cp_percent:{label:'Garantisa corto plazo (%)',default:4.17,min:0,max:100},
 garantisa_lp_percent:{label:'Garantisa largo plazo (%)',default:2.86,min:0,max:100}
});
function validate(changes){
 if(!changes||typeof changes!=='object'||Array.isArray(changes)||!Object.keys(changes).length)throw Object.assign(Error('Incluye los parámetros que deseas actualizar.'),{status:422});
 for(const [key,value] of Object.entries(changes)){
  const rule=DEFINITIONS[key];
  if(!rule||typeof value!=='number'||!Number.isFinite(value)||value<rule.min||value>rule.max||(rule.integer&&!Number.isInteger(value))||(!rule.integer&&Math.abs(value*100-Math.round(value*100))>1e-8))throw Object.assign(Error('Parámetro inválido: '+(rule?.label||key)+'. Revisa el rango y usa hasta dos decimales.'),{status:422,field:key});
 }
}
function readSettings(db){const row=db.prepare('SELECT * FROM global_settings WHERE id=1').get();return {values:JSON.parse(row.data),version:row.version,updated_at:row.updated_at,updated_by:row.updated_by};}
module.exports={DEFINITIONS,validate,readSettings};
