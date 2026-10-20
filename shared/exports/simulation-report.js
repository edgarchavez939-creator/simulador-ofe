(function(global){
 'use strict';
 const keys={1:'shortTerm',2:'mixed',3:'bank',7:'initialPayment',languages:'languages'};
 const disclaimer='Esta es una simulación de crédito con fines informativos. Las condiciones, valores, tasas, plazos, cuotas y demás resultados presentados están sujetos a validación, estudio y aprobación definitiva por parte de la Universidad del Norte y/o las entidades que intervengan en el proceso de financiación.';
 const number=value=>typeof value==='number'&&Number.isFinite(value);
 const field=(label,value,format='money')=>({label,value,format});
 const difference=(capacity,payment)=>Math.abs(capacity-payment)<1e-6?0:capacity-payment;
 const result=key=>key===5?global.SimuladorOFE.state.restructuring.current:global.SimuladorOFE.state.results[keys[key]];
 function normalize(key,d){
  if(!d)throw Error('Primero realiza la simulación.');
  const metadata=d.reportSnapshot||{},mixed=key===2||(key==='languages'&&d.isMixto),cp=mixed?(d.CP||d.idCP):d,lp=mixed?(d.LP||d.idLP):null;
  const pending=!!(lp?.noAmortize||(mixed&&d.finLP>0&&!lp?.rows?.length));
  const modality=key===5?'Reestructuración de crédito':key===7?'Cuota inicial':key===3?'Crédito banco aliado':key==='languages'?(mixed?'Idiomas · Crédito mixto':'Crédito de idiomas'):key===2?(d.finCP>0&&d.finLP>0?'Crédito mixto':d.finLP>0?'Crédito largo plazo':'Crédito corto plazo'):'Crédito corto plazo';
  const enhancedRefi=key===5&&!!(d.treatment&&(d.treatment.initial>0||d.treatment.forgiven>0||d.comparison||d.termMode==='capacity'||d.principal===0));
  const sections=[],plans=[],add=(title,fields,note)=>{const clean=fields.filter(x=>x.value!==null&&x.value!==undefined&&x.value!==''&&(!['money','percent','integer'].includes(x.format)||number(x.value)));if(clean.length)sections.push({title,fields:clean,note});};
  const amount=key===5?d.principal:key===7?d.fin:mixed?d.finCP+d.finLP:d.financiado;
  const initial=key===7?d.desembolso:d.pagoInicial;
  const guarantee=key===7?d.gar:mixed?(d.garCP||0)+(d.garLP||0):d.garantisa;
  const benefits=number(d.benefTotal)?d.benefTotal:(number(d.beneficios)?d.beneficios:0);
  if(key!==5)add(key==='languages'?'Valor de idiomas':'Matrícula',[
   field(key==='languages'?'Valor de idiomas':'Valor de matrícula',d.mat),...(benefits>0?[field('Becas y descuentos',benefits),field('Valor neto',number(d.matNeta)?d.matNeta:d.mat-benefits)]:[])]);
  if(key===5){
   const comparison=d.comparison,current=comparison?.current;
   add('Condición actual',[field('Capital pendiente',d.capital),field('Intereses corrientes causados',d.intCorr),field('Intereses de mora',d.mora),field('Saldo actual',d.saldo),...(current?[field('Cuota mensual vigente',current.payment),field('Tasa vigente M.V.',current.rate,'percent'),field('Cuotas mensuales pendientes',current.term,'integer'),field('Total pendiente vigente informado',current.total),field('Fecha de corte',current.cutoff,'text')]:[])],(d.cutoff?'Saldo con corte al '+d.cutoff+'. ':'')+(current?'Importes pendientes del plan vigente informados a la misma fecha de corte. No incluyen pagos anteriores.':'Cuota vigente, tasa y plazo restante no registrados. No se estima ahorro frente al crédito anterior.'));
   add('Nueva condición',[field('Costos adicionales financiados',d.treatment?.rows.find(row=>row.key==='costos')?.financed??d.costos),field('Monto reestructurado',d.principal)]);
   if(enhancedRefi&&(d.treatment.initial>0||d.treatment.forgiven>0))add('Tratamiento del saldo',[field('Pago inicial al formalizar',d.treatment.initial),field('Condonación simulada',d.treatment.forgiven),field('Monto a financiar',d.treatment.financed)],d.treatment.forgiven>0?'Supuesto de simulación; no constituye aprobación. Referencia: '+d.treatmentNote:undefined);
   if(comparison)add('Comparación con el crédito vigente',[field(comparison.paymentRelief>=0?'Reducción mensual':'Aumento mensual',Math.abs(comparison.paymentRelief)),field('Variación de la cuota',-comparison.reliefPercent,'percent'),field('Diferencia de plazo (meses)',comparison.additionalMonths,'integer'),field(comparison.totalDifference<=0?'Reducción del total pendiente':'Aumento del total pendiente',Math.abs(comparison.totalDifference))],'La propuesta incluye el pago inicial y las cuotas futuras. Una cuota menor puede aumentar el total pendiente.');
  }else add('Aporte inicial',[field(key===7?'Cuota inicial requerida (sin Garantisa)':'Cuota inicial',d.cuotaInicial),...(mixed?[...(d.finCP>0?[field('Garantisa corto plazo',d.garCP)]:[]),...(d.finLP>0?[field('Garantisa largo plazo',d.garLP)]:[])]:number(guarantee)?[field('Aporte Garantisa',guarantee)]:[]),...(key===3&&number(d.cargos)?[field('Otros cargos iniciales',d.cargos)]:[]),field('Total inicial',initial)],key===7?'La cuota inicial requerida no incluye Garantisa. Total inicial = cuota inicial + aporte Garantisa.':key===3?'Total inicial = cuota inicial + otros cargos. No aplica Garantisa.':'Total inicial = cuota inicial + Garantisa, cuando aplica.');
  function guaranteeFields(label,value,base,kind){
   const stored=d.settingsSnapshot?.values?.[kind==='lp'?'garantisa_lp_percent':'garantisa_cp_percent'];
   const rate=number(stored)?stored/100:key===7&&number(d.fundRate)?d.fundRate:number(base)&&base>0&&number(value)?value/base:null;
   if(number(value))add(label,[field('Porcentaje aplicado',rate,'percent'),field('Base de cálculo',base)],'El aporte se muestra en Aporte inicial; no se añade a cada cuota.');
  }
  if(key!==5&&key!==3){if(mixed){if(d.finCP>0)guaranteeFields('Garantisa corto plazo',d.garCP,d.finCP,'cp');if(d.finLP>0)guaranteeFields('Garantisa largo plazo',d.garLP,d.finLP,'lp');}else guaranteeFields('Garantisa',guarantee,amount,'cp');}
  function component(title,data,principal,term,rate,pendingRate=false){
   if(!number(principal)||principal<=0)return;
   add(title,[field('Monto financiado',principal),...(!pendingRate?[field('Tasa',rate,'percent'),field('Tipo de tasa','Efectiva','text'),field('Periodicidad','Mensual vencida','text')]:[]),field(pendingRate?'Plazo estimado de amortización (meses)':'Plazo (meses)',term,'integer'),...(!pendingRate?[field('Número de cuotas',data?.rows?.length||term,'integer'),field('Cuota mensual estimada',data?.cuota)]:[])],pendingRate?'La tasa se definirá al iniciar la amortización. Cuota, intereses y plan de pagos definitivos pendientes.':null);
   if(data?.rows?.length)plans.push({name:title,principal,rows:data.rows.map(row=>({installment:row.i,payment:row.cuota,capital:row.capital,interest:row.interes,balance:row.saldo})),totalCapital:data.totCap,totalInterest:data.totInt});
  }
  if(mixed){add('Financiación total',[field('Monto financiado total',amount)]);if(d.finCP>0)component('Componente corto plazo',cp,d.finCP,d.nCP||d.n,d.tm);if(d.finLP>0)component('Componente largo plazo',lp,d.finLP,lp?.nPago||d.mesesLP||d.nLP,lp?.tm??d.tm,pending);}
  else component(key===5?'Financiación de la nueva condición':'Financiación',d,amount,d.n,d.tm);
  const interest=mixed?(cp?.totInt||0)+(pending?0:lp?.totInt||0):d.totInt;
  const totalPayments=mixed?(cp?cp.totCap+cp.totInt:0)+(lp?(pending?lp.capital:lp.totCap+lp.totInt):d.finLP||0):number(d.totalCredito)?d.totalCredito:d.totCap+d.totInt;
  const total=key===7?d.costoTotal:number(d.totalGeneral)?d.totalGeneral:(initial||0)+totalPayments;
  add(pending?'Totales conocidos':'Totales proyectados',[field('Monto financiado',amount),...(!pending||cp?[field(pending?'Intereses conocidos (corto plazo)':'Total intereses',interest)]:[]),field(pending?(cp?'Crédito conocido (CP + capital LP)':'Capital LP sin intereses futuros'):'Total de cuotas proyectadas',totalPayments),field(pending?'Costo total conocido, sin intereses futuros LP':'Costo total estimado',total)],pending?'El total conocido incluye el aporte inicial, el crédito CP y el capital LP. No representa el costo final del largo plazo.':key===5?(enhancedRefi?'Incluye pago inicial al formalizar y todas las cuotas futuras. Las condonaciones simuladas se excluyen del monto a financiar.':'Incluye capital reestructurado, costos financiados e intereses de la nueva condición.'):key===3?'El costo total estimado incluye la cuota inicial, los otros cargos y las cuotas proyectadas.':'El costo total estimado incluye el total inicial y las cuotas proyectadas.');
  if(key===7)add('Capacidad de pago',[field('Capacidad mensual indicada',number(d.capIngresada)?d.capIngresada:d.cap),field('Cuota mensual calculada',d.cuota),field('Diferencia disponible',difference((number(d.capIngresada)?d.capIngresada:d.cap)||0,d.cuota))],'La capacidad es una referencia de simulación, no una evaluación formal de riesgo crediticio.');
  if(key===5&&d.capacidad>0)add('Capacidad de pago',[field('Capacidad mensual indicada',d.capacidad),field('Nueva cuota mensual',d.cuota),field('Diferencia disponible',difference(d.capacidad,d.cuota)),...(enhancedRefi?[field('Definición del plazo',d.termMode==='capacity'?'Mínimo calculado según capacidad':'Ingresado manualmente','text')]:[])],d.termMode==='capacity'?'Menor plazo viable dentro del límite técnico de 600 meses, sin aprobación automática.':undefined);
  const fallbackName=String(d.progNombre||'');
  const program=Object.hasOwn(metadata,'program')?metadata.program:!(/^(Programa|Sin programa.*|.*Ingresar matrícula manualmente)$/i.test(fallbackName))?fallbackName:null;
  const creditModuleId=global.OFEInstitutionalSettings?.creditModule(key,metadata.moduleId)||null;
  return {...(enhancedRefi?{restructuring:{treatment:JSON.parse(JSON.stringify(d.treatment)),reference:d.treatmentNote,cutoff:d.cutoff,termMode:d.termMode,comparison:d.comparison?JSON.parse(JSON.stringify(d.comparison)):null}}:{}),creditModuleId,modality,program:key===5?null:program,level:metadata.level||d.nivel||null,occurredAt:metadata.occurredAt||null,generatedBy:metadata.generatedBy||null,sections,plans,pending,disclaimer};
 }
 const pdfModels=new WeakMap();let sessionSignature='Usuario Público';
 const copy=value=>JSON.parse(JSON.stringify(value));
 function capturePdf(key,d){
  const model=normalize(key,d);model.signature=sessionSignature;model.projections=[];
  const projectionKey=key===2?'projectionLP':key==='languages'?'projectionLanguagesLP':null;
  const projection=projectionKey&&global.SimuladorOFE.state.results[projectionKey];
  if(projection)model.projections.push({label:key==='languages'?'Idiomas':'Matrícula',data:copy(projection)});
  pdfModels.set(d,copy(model));return model;
 }
 function pdf(key,d=result(key)){
  if(!d)throw Error('Primero realiza la simulación.');
  return copy(pdfModels.get(d)||capturePdf(key,d));
 }
 global.OFEReport=Object.freeze({normalize,result,disclaimer,pdf});
 if(global.SimuladorOFE)global.SimuladorOFE.register('report-snapshots',{async init(app){
  const user=global.OFE_SERVER&&!global.OFE_PUBLIC?await global.OFEAuth.getUser():null;
  const email=user?.email;sessionSignature=typeof email==='string'&&email.includes('@')?email.slice(0,email.indexOf('@')):'Usuario Público';
  for(const [name,key] of [['calcular1',1],['calcular2',2],['calcular3',3],['calcular7',7],['calcularRefi',5],['calcularIdiomas','languages']]){
   const original=global[name];if(typeof original!=='function')continue;
   global[name]=function(...args){const before=result(key),value=original.apply(this,args),after=result(key);if(after&&after!==before){const tab=key==='languages'?app.state.languages.context.tabId:key;const selected=(tab===5?null:global.programaSeleccionado?.(tab));after.reportSnapshot=Object.freeze({occurredAt:new Date().toISOString(),moduleId:keys[tab]||null,program:selected?.nombre||null,level:selected?.nivel||app.state.ui.levelByTab[tab]||null,generatedBy:user?.name||null});capturePdf(key,after);}return value;};
  }
 }});
})(window);
