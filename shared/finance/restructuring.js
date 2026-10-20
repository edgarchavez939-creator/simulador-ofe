(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OFERestructuring=api;})(typeof window==='object'?window:this,function(){
 'use strict';
 const concepts=Object.freeze([{key:'capital',label:'Capital pendiente'},{key:'intCorr',label:'Intereses corrientes'},{key:'mora',label:'Intereses de mora'},{key:'costos',label:'Costos adicionales'}].map(Object.freeze));
 const fail=(message,field,code)=>Object.assign(Error(message),{field,code});
 function cents(value,field){if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1e12)throw fail('Ingresa un importe entre cero y un billón.',field);return Math.round(value*100);}
 function allocate(amounts,payments={},forgiveness={}){
  let gross=0,initial=0,forgiven=0,financed=0;
  const rows=concepts.map(item=>{const total=cents(amounts[item.key],item.key),paid=cents(payments[item.key]??0,item.key+'-paid'),waived=cents(forgiveness[item.key]??0,item.key+'-forgiven');if(paid+waived>total)throw fail('El pago inicial y la condonación de '+item.label.toLowerCase()+' no pueden superar su importe.',item.key+'-paid','allocation');gross+=total;initial+=paid;forgiven+=waived;financed+=total-paid-waived;return {...item,amount:total/100,paid:paid/100,forgiven:waived/100,financed:(total-paid-waived)/100};});
  return {rows,gross:gross/100,initial:initial/100,forgiven:forgiven/100,financed:financed/100};
 }
 const payment=(principal,rate,term)=>rate===0?principal/term:principal*rate/-Math.expm1(-term*Math.log1p(rate));
 function minimumTerm(principal,rate,capacity,max=600,paymentAt=payment){
  if(!Number.isFinite(principal)||principal<0||!Number.isFinite(rate)||rate<0||!Number.isFinite(capacity)||capacity<=0||!Number.isInteger(max)||max<1)throw fail('Ingresa una capacidad mensual mayor que cero.','capacity','capacity');
  if(principal===0)return {term:0,payment:0};
  if(capacity<=principal*rate)throw fail('La capacidad mensual no supera los intereses del primer mes. Aumenta la capacidad o revisa el monto y la tasa; ampliar el plazo no resuelve este caso.','capacity','interest');
  const at=term=>{const value=paymentAt(principal,rate,term);if(!Number.isFinite(value)||value<=0)throw fail('La tasa no permite calcular una cuota válida. Revísala o utiliza cero si no se pactaron intereses.','rate','numeric');return value;};
  if(at(max)>capacity+1e-7)throw fail('No se encuentra un plazo viable de hasta '+max+' meses. Revisa la capacidad, el monto o la tasa.','capacity','limit');
  let low=1,high=max;while(low<high){const mid=Math.floor((low+high)/2);if(at(mid)<=capacity+1e-7)high=mid;else low=mid+1;}
  return {term:low,payment:at(low)};
 }
 function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
 function compare(current,proposal,saldo){
  if(!validDate(current.cutoff))throw fail('Selecciona una fecha de corte válida.','cutoff');
  if(!Number.isFinite(current.payment)||current.payment<=0||!Number.isFinite(current.rate)||current.rate<0||current.rate>1||!Number.isInteger(current.term)||current.term<1||current.term>600||!Number.isFinite(current.total)||current.total<saldo)throw fail('Completa cuota, tasa, plazo y total pendiente del crédito vigente. El total pendiente debe incluir el saldo a la fecha de corte.','current','current');
  return {current:{...current},paymentRelief:current.payment-proposal.payment,reliefPercent:(current.payment-proposal.payment)/current.payment,additionalMonths:proposal.term-current.term,totalDifference:proposal.total-current.total};
 }
 return Object.freeze({concepts,allocate,payment,minimumTerm,compare,validDate});
});
