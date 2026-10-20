(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OFEBrandPalette=api;})(typeof window==='object'?window:this,function(){
 'use strict';
 const defaults=Object.freeze({brand_red:'#960A11',brand_gold:'#B78B1E',brand_yellow:'#FFCC00',brand_sand:'#CFC493'});
 const labels=Object.freeze({brand_red:'Rojo principal',brand_gold:'Dorado',brand_yellow:'Amarillo de detalle',brand_sand:'Arena de apoyo'});
 function validate(changes){
  if(!changes||typeof changes!=='object'||Array.isArray(changes)||!Object.keys(changes).length)throw Object.assign(Error('Incluye los colores que deseas actualizar.'),{status:422});
  const result={};for(const [key,value] of Object.entries(changes)){
   if(!Object.hasOwn(defaults,key)||typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw Object.assign(Error('Usa un color hexadecimal de seis caracteres, como #960A11.'),{status:422,field:key});
   result[key]=value.toUpperCase();
  }return result;
 }
 const rgb=color=>color.slice(1).match(/../g).map(value=>parseInt(value,16));
 function mix(color,target,ratio){return '#'+rgb(color).map((value,index)=>Math.round(value+(rgb(target)[index]-value)*ratio).toString(16).padStart(2,'0')).join('').toUpperCase();}
 function luminance(color){return rgb(color).map(value=>{value/=255;return value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4);}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);}
 function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 function foreground(color){return contrast(color,'#FFFFFF')>=contrast(color,'#000000')?'#FFFFFF':'#000000';}
 function readable(color,background){for(let step=0;step<=100;step++){const adjusted=mix(color,luminance(background)>.5?'#151515':'#FFFFFF',step/100);if(contrast(adjusted,background)>=4.5)return adjusted;}return foreground(background);}
 function tokens(values,dark){
  const v={...defaults,...validate(values)},out={};
  if(v.brand_red!==defaults.brand_red){
   const accent=readable(v.brand_red,dark?'#20262E':'#FFFFFF'),hover=mix(v.brand_red,'#151515',.18);
   Object.assign(out,{'--uninorte-red':accent,'--uninorte-red-dark':hover,'--brand-600':v.brand_red,'--brand-700':hover,'--brand-500':v.brand_red,'--accent':accent,'--accent-hover':dark?mix(accent,'#FFFFFF',.12):hover,'--accent-soft':`color-mix(in srgb, ${v.brand_red} ${dark?'24':'7'}%, var(--surface-panel))`,'--accent-ring':`color-mix(in srgb, ${accent} 28%, transparent)`,'--focus-ring':'var(--accent-ring)','--action-primary':v.brand_red,'--action-primary-hover':hover,'--chart-capital':accent,'--row-selected':'var(--accent-soft)','--ofe-on-brand':foreground(v.brand_red),'--ofe-on-brand-hover':foreground(hover)});
  }
  if(v.brand_gold!==defaults.brand_gold){out['--brand-gold-ink']=readable(v.brand_gold,dark?'#20262E':'#FFFFFF');out['--uninorte-gold']=dark?readable(v.brand_gold,'#20262E'):v.brand_gold;out['--uninorte-gold-dark']=readable(v.brand_gold,dark?'#20262E':'#FFFFFF');out['--gold-500']=v.brand_gold;out['--chart-interest']='var(--uninorte-gold)';}
  if(v.brand_yellow!==defaults.brand_yellow)out['--uninorte-yellow']=v.brand_yellow;
  if(v.brand_sand!==defaults.brand_sand)out['--uninorte-sand']=v.brand_sand;
  return out;
 }
 function css(values){
  const v={...defaults,...validate(values)},rule=(selector,properties)=>`${selector}{${Object.entries(properties).map(([k,value])=>k+':'+value+';').join('')}}`;
  let result=rule(':root:not([data-theme="dark"])',tokens(v,false))+rule(':root[data-theme="dark"]',tokens(v,true));
  if(v.brand_red!==defaults.brand_red)result+=`:root .btn--primary,:root .brand__mark,:root .access-brand__mark,:root .nav__item[aria-current="page"]{background:var(--action-primary);border-color:var(--action-primary);color:var(--ofe-on-brand)}:root .nav__item[aria-current="page"] .icon{color:var(--ofe-on-brand)}:root .btn--primary:hover{background:var(--action-primary-hover);border-color:var(--action-primary-hover);color:var(--ofe-on-brand-hover)}:root .access-card{border-top-color:var(--action-primary)}`;
  return result;
 }
 return Object.freeze({defaults,labels,validate,mix,contrast,foreground,readable,tokens,css});
});
