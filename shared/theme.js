(function(global){
 'use strict';
 const modes=['light','dark','system'],listeners=new Set(),media=global.matchMedia?.('(prefers-color-scheme: dark)');
 let preference='system';try{const saved=localStorage.getItem('simulador_tema');if(modes.includes(saved))preference=saved;}catch(_){}
 const resolved=()=>preference==='system'?(media?.matches?'dark':'light'):preference;
 function apply(){document.documentElement?.setAttribute('data-theme',resolved());document.documentElement?.setAttribute('data-theme-preference',preference);charts();listeners.forEach(fn=>fn(preference,resolved()));}
 function setPreference(value){if(!modes.includes(value))throw new TypeError('Apariencia inválida.');preference=value;try{localStorage.setItem('simulador_tema',value);}catch(_){}apply();}
 function subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}
 media?.addEventListener?.('change',()=>{if(preference==='system')apply();});
 global.addEventListener?.('storage',event=>{if(event.key==='simulador_tema'){preference=modes.includes(event.newValue)?event.newValue:'system';apply();}});
 function charts(){
  const Chart=global.Chart;if(!Chart?.defaults)return;
  const css=getComputedStyle(document.documentElement),color=name=>css.getPropertyValue(name).trim();
  Chart.defaults.font=Chart.defaults.font||{};Chart.defaults.font.family=color('--font-sans');Chart.defaults.font.size=parseFloat(color('--fs-sm'))||12;
  Chart.defaults.color=color('--text-body');Chart.defaults.borderColor=color('--grid-line');
  const update=chart=>{
   const computed=getComputedStyle(document.documentElement),tone=name=>computed.getPropertyValue(name).trim();
   const options=chart.config.options;
   for(const axis of Object.values(options.scales||{})){
    axis.ticks=axis.ticks||{};axis.ticks.color=tone('--text-body');axis.ticks.font={...(axis.ticks.font||{}),family:tone('--font-sans'),size:parseFloat(tone('--fs-sm'))||12};
    axis.grid=axis.grid||{};axis.grid.color=tone('--grid-line');
   }
   if(options.plugins?.legend){options.plugins.legend.labels=options.plugins.legend.labels||{};options.plugins.legend.labels.color=tone('--text-body');options.plugins.legend.labels.font={...(options.plugins.legend.labels.font||{}),family:tone('--font-sans'),size:parseFloat(tone('--fs-sm'))||12};}
   if(chart.data.datasets.length===2)chart.data.datasets.forEach((set,index)=>{set.backgroundColor=tone(index?'--chart-interest':'--chart-capital');set.borderColor=set.backgroundColor;});
  };
  if(!global.OFETheme.registered&&Chart.register){Chart.register({id:'ofeTheme',beforeUpdate:update});global.OFETheme.registered=true;}
  document.querySelectorAll('canvas').forEach(canvas=>{const chart=Chart.getChart?.(canvas);if(chart){update(chart);chart.update('none');}});
 }
 global.OFETheme={charts,registered:false,setPreference,getPreference:()=>preference,resolved,subscribe};
 apply();
})(window);
