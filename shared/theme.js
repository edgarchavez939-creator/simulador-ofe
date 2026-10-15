(function(global){
 'use strict';
 try { document.documentElement.setAttribute('data-theme',localStorage.getItem('simulador_tema')==='dark'?'dark':'light'); } catch(_){}
 function charts(){
  const Chart=global.Chart;if(!Chart?.defaults)return;
  const css=getComputedStyle(document.documentElement),color=name=>css.getPropertyValue(name).trim();
  Chart.defaults.color=color('--text-body');Chart.defaults.borderColor=color('--grid-line');
  const update=chart=>{
   const computed=getComputedStyle(document.documentElement),tone=name=>computed.getPropertyValue(name).trim();
   const options=chart.config.options;
   for(const axis of Object.values(options.scales||{})){
    axis.ticks=axis.ticks||{};axis.ticks.color=tone('--text-body');
    axis.grid=axis.grid||{};axis.grid.color=tone('--grid-line');
   }
   if(options.plugins?.legend){options.plugins.legend.labels=options.plugins.legend.labels||{};options.plugins.legend.labels.color=tone('--text-body');}
   if(chart.data.datasets.length===2)chart.data.datasets.forEach((set,index)=>{set.backgroundColor=tone(index?'--chart-interest':'--chart-capital');set.borderColor=set.backgroundColor;});
  };
  if(!global.OFETheme.registered&&Chart.register){Chart.register({id:'ofeTheme',beforeUpdate:update});global.OFETheme.registered=true;}
  document.querySelectorAll('canvas').forEach(canvas=>{const chart=Chart.getChart?.(canvas);if(chart){update(chart);chart.update('none');}});
 }
 global.OFETheme={charts,registered:false};
})(window);
