(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OFERefiMoney=api;})(typeof window==='object'?window:this,function(){
 'use strict';
 function parse(value){
  if(typeof value==='number'){if(Number.isFinite(value)&&value>=0)return value;throw Error('Importe inválido.');}
  const text=String(value??'').trim().replace(/^(?:COP\s*|\$\s*)/i,'').trim();
  let clean;if(/^\d+$/.test(text))clean=text;else if(/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(text))clean=text.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?$/.test(text))clean=text.replace(/,/g,'');else if(/^\d+[.,]\d{1,2}$/.test(text))clean=text.replace(',','.');else throw Error('Importe vacío o inválido.');
  const number=Number(clean);if(!Number.isFinite(number)||number<0)throw Error('Importe inválido.');return number;
 }
 function live(value){const text=String(value);if(!/^[\d.]*?(?:,\d{0,2})?$/.test(text))return text;const [whole,fraction]=text.split(','),digits=whole.replace(/\./g,'').replace(/^0+(?=\d)/,'');return digits.replace(/\B(?=(\d{3})+(?!\d))/g,'.')+(fraction!==undefined?','+fraction:'');}
 function format(value){if(value===''||value===null||value===undefined)return '';try{return new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(parse(value));}catch{return String(value);}}
 function attach(field,prototype){
  if(!field||field.dataset.refiMoney==='1')return;
  const native=Object.getOwnPropertyDescriptor(prototype,'value');if(!native)return;const prior=native.get.call(field);field.dataset.refiMoney='1';field.setAttribute('inputmode','decimal');field.setAttribute('autocomplete','off');
  Object.defineProperty(field,'value',{configurable:true,get(){let raw=native.get.call(this);if(raw==='')return '';if(raw.endsWith(','))raw=raw.slice(0,-1);try{return String(parse(raw));}catch{return 'NaN';}},set(value){native.set.call(this,format(value));}});
  let pastedInvalid=false;
  function input(event){if(event?.isComposing)return;if(pastedInvalid){pastedInvalid=false;return;}const before=native.get.call(field),position=field.selectionStart??before.length,count=(before.slice(0,position).match(/[\d,]/g)||[]).length,after=live(before);if(after!==before){native.set.call(field,after);let digits=0,index=0;while(index<after.length&&digits<count){if(/[\d,]/.test(after[index]))digits++;index++;}try{field.setSelectionRange(index,index);}catch{}}}
  field.addEventListener('input',input);field.addEventListener('compositionend',input);
  field.addEventListener('blur',()=>{const raw=native.get.call(field);if(raw.endsWith(','))native.set.call(field,raw.slice(0,-1));});
  field.addEventListener('paste',event=>{event.preventDefault();const text=(event.clipboardData||window.clipboardData).getData('text')||'';try{native.set.call(field,format(parse(text)));}catch{native.set.call(field,text);pastedInvalid=true;}field.dispatchEvent(new Event('input',{bubbles:true}));});
  native.set.call(field,format(prior));
 }
 return Object.freeze({parse,live,format,attach});
});
