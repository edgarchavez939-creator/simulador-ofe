(function(global){
 'use strict';
 let observer=null,repaint=()=>{};
 function html(...values){
  return global.distribucionHTML(...values)
   .replace('class="stack-bar"','class="stack-bar tuition-composition__bar"')
   .replace(/(<div class="stack-seg[^>]*title="[^"]*?([0-9]+(?:\.[0-9]+)?)%"[^>]*>)(<\/div>)/g,(_,open,pct,close)=>open+'<span class="tuition-composition__percent">'+Number(pct).toLocaleString('es-CO',{minimumFractionDigits:1,maximumFractionDigits:1})+'%</span>'+close);
 }
 function mount(){
  observer?.disconnect();const bar=document.querySelector('#res7 .tuition-composition__bar');if(!bar)return;
  const segments=Array.from(bar.querySelectorAll('.stack-seg'));
  bar.setAttribute('role','img');bar.setAttribute('aria-label','Composición de la matrícula: '+segments.map(segment=>segment.title).join(', '));
  function update(){for(const segment of segments){
   const label=segment.querySelector('.tuition-composition__percent');if(!label)continue;
   segment.dataset.compact=String(segment.clientWidth<label.scrollWidth+14);
   const rgb=global.getComputedStyle(segment).backgroundColor.match(/[0-9]+(?:\.[0-9]+)?/g)?.slice(0,3).map(Number);
   if(rgb?.length===3){const channels=rgb.map(value=>{const n=value/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}),luminance=channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;segment.style.color=(luminance+.05)/.05>=1.05/(luminance+.05)?'#000000':'#FFFFFF';}
  }}
  repaint=update;update();if(global.ResizeObserver){observer=new global.ResizeObserver(update);observer.observe(bar);}
  document.fonts?.ready.then(update);
 }
 global.OFEComposition=Object.freeze({html,mount});
 global.SimuladorOFE.register('initial-payment-composition',{init(){
  global.OFETheme?.subscribe(()=>repaint());
  const original=global.calcular7;global.calcular7=function(...args){const value=original.apply(this,args);mount();return value;};
 }});
})(window);
