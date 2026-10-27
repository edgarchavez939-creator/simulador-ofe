(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OFETextSchema=api;})(typeof window==='object'?window:this,function(){
 'use strict';
 const definitions={
  "ui_module_1_title": {
    "label": "Título: Crédito a Corto Plazo",
    "group": "ui_modules",
    "default": "Crédito a Corto Plazo",
    "max": 65
  },
  "ui_module_1_description": {
    "label": "Descripción: Crédito a Corto Plazo",
    "group": "ui_modules",
    "default": "Simula las condiciones de financiación para este escenario.",
    "max": 220
  },
  "ui_module_2_title": {
    "label": "Título: Corto y Largo Plazo",
    "group": "ui_modules",
    "default": "Corto y Largo Plazo",
    "max": 65
  },
  "ui_module_2_description": {
    "label": "Descripción: Corto y Largo Plazo",
    "group": "ui_modules",
    "default": "Distribuye la financiación entre corto y largo plazo y revisa su impacto.",
    "max": 220
  },
  "ui_module_3_title": {
    "label": "Título: Crédito Banco Aliado",
    "group": "ui_modules",
    "default": "Crédito Banco Aliado",
    "max": 65
  },
  "ui_module_3_description": {
    "label": "Descripción: Crédito Banco Aliado",
    "group": "ui_modules",
    "default": "Evalúa un escenario de financiación con las condiciones del banco aliado.",
    "max": 220
  },
  "ui_module_5_title": {
    "label": "Título: Reestructuración de Crédito",
    "group": "ui_modules",
    "default": "Reestructuración de Crédito",
    "max": 65
  },
  "ui_module_5_description": {
    "label": "Descripción: Reestructuración de Crédito",
    "group": "ui_modules",
    "default": "Construye escenarios de reestructuración sobre un saldo existente.",
    "max": 220
  },
  "ui_module_7_title": {
    "label": "Título: Cálculo de Cuota Inicial",
    "group": "ui_modules",
    "default": "Cálculo de Cuota Inicial",
    "max": 65
  },
  "ui_module_7_description": {
    "label": "Descripción: Cálculo de Cuota Inicial",
    "group": "ui_modules",
    "default": "Calcula la cuota inicial requerida a partir de la capacidad de pago mensual.",
    "max": 220
  },
  "ui_module_4_title": {
    "label": "Título: Conversor de Tasas",
    "group": "ui_modules",
    "default": "Conversor de Tasas",
    "max": 65
  },
  "ui_module_4_description": {
    "label": "Descripción: Conversor de Tasas",
    "group": "ui_modules",
    "default": "Convierte tasas entre periodicidades para comparar condiciones equivalentes.",
    "max": 220
  },
  "ui_module_8_title": {
    "label": "Título: Comparar escenarios",
    "group": "ui_modules",
    "default": "Comparar escenarios",
    "max": 65
  },
  "ui_module_8_description": {
    "label": "Descripción: Comparar escenarios",
    "group": "ui_modules",
    "default": "Accede a las comparaciones disponibles dentro de cada modalidad de simulación.",
    "max": 220
  },
  "ui_module_9_title": {
    "label": "Título: Mis simulaciones",
    "group": "ui_modules",
    "default": "Mis simulaciones",
    "max": 65
  },
  "ui_module_9_description": {
    "label": "Descripción: Mis simulaciones",
    "group": "ui_modules",
    "default": "Consulta las simulaciones recientes guardadas localmente en este navegador.",
    "max": 220
  },
  "ui_form_title": {
    "label": "Título del formulario",
    "group": "ui_sections",
    "default": "Configura tu simulación",
    "max": 65
  },
  "ui_academic": {
    "label": "Sección de información académica",
    "group": "ui_sections",
    "default": "Información académica",
    "max": 65
  },
  "ui_academic_help": {
    "label": "Ayuda de información académica",
    "group": "ui_help",
    "default": "Selecciona el programa y confirma el valor base de la matrícula.",
    "max": 220
  },
  "ui_benefits": {
    "label": "Sección de beneficios",
    "group": "ui_sections",
    "default": "Beneficios / Descuentos",
    "max": 65
  },
  "ui_initial": {
    "label": "Sección del pago inicial",
    "group": "ui_sections",
    "default": "Pago de Contado / Cuota Inicial",
    "max": 65
  },
  "ui_conditions": {
    "label": "Sección de condiciones",
    "group": "ui_sections",
    "default": "Condiciones del crédito",
    "max": 65
  },
  "ui_conditions_help": {
    "label": "Ayuda de condiciones",
    "group": "ui_help",
    "default": "Define el plazo y la tasa que se aplicarán al monto financiado.",
    "max": 220
  },
  "ui_short_plan": {
    "label": "Título del plan a corto plazo",
    "group": "ui_sections",
    "default": "Plan de pago a corto plazo",
    "max": 65
  },
  "ui_long_plan": {
    "label": "Título del plan a largo plazo",
    "group": "ui_sections",
    "default": "Plan de pago a largo plazo",
    "max": 65
  },
  "ui_help_benefits": {
    "label": "Ayuda sobre beneficios",
    "group": "ui_help",
    "default": "Becas, descuentos por convenio, caja de compensación u otros apoyos que reducen el valor a pagar. Se descuentan antes de calcular el financiamiento.",
    "max": 320
  },
  "ui_help_initial": {
    "label": "Ayuda sobre pago inicial",
    "group": "ui_help",
    "default": "Parte de la matrícula que el estudiante paga de inmediato, sin financiar. Reduce el monto del crédito y por tanto los intereses.",
    "max": 320
  },
  "pdf_header": {
    "label": "Encabezado institucional",
    "group": "pdf_titles",
    "default": "Simulación de Crédito Uninorte",
    "max": 70,
    "pdf": {
      "width": 491.28,
      "lines": 1,
      "size": 15,
      "min": 11,
      "bold": true
    }
  },
  "pdf_scope": {
    "label": "Título del aviso legal",
    "group": "pdf_titles",
    "default": "ALCANCE DE LA SIMULACIÓN",
    "max": 70,
    "pdf": {
      "width": 491.28,
      "lines": 1,
      "size": 8,
      "min": 7.5,
      "bold": true
    }
  },
  "pdf_title_short_pre": {
    "label": "Modalidad: Crédito Pregrado - Corto Plazo",
    "group": "pdf_titles",
    "default": "Crédito Pregrado - Corto Plazo",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_short_post": {
    "label": "Modalidad: Crédito Posgrado - Corto Plazo",
    "group": "pdf_titles",
    "default": "Crédito Posgrado - Corto Plazo",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_mixed_pre": {
    "label": "Modalidad: Crédito Pregrado - Mixto",
    "group": "pdf_titles",
    "default": "Crédito Pregrado - Mixto",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_mixed_post": {
    "label": "Modalidad: Crédito Posgrado - Mixto",
    "group": "pdf_titles",
    "default": "Crédito Posgrado - Mixto",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_long_pre": {
    "label": "Modalidad: Crédito Pregrado - Largo Plazo",
    "group": "pdf_titles",
    "default": "Crédito Pregrado - Largo Plazo",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_long_post": {
    "label": "Modalidad: Crédito Posgrado - Largo Plazo",
    "group": "pdf_titles",
    "default": "Crédito Posgrado - Largo Plazo",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_languages": {
    "label": "Modalidad: Crédito Idiomas - Corto Plazo",
    "group": "pdf_titles",
    "default": "Crédito Idiomas - Corto Plazo",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_languages_mixed": {
    "label": "Modalidad: Crédito Idiomas - Mixto",
    "group": "pdf_titles",
    "default": "Crédito Idiomas - Mixto",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_initial": {
    "label": "Modalidad: Cuota inicial",
    "group": "pdf_titles",
    "default": "Cuota inicial",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_refi": {
    "label": "Modalidad: Reestructuración de crédito",
    "group": "pdf_titles",
    "default": "Reestructuración de crédito",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    }
  },
  "pdf_title_bank": {
    "label": "Modalidad: Crédito Banco Aliado",
    "group": "pdf_titles",
    "default": "Crédito Banco Aliado",
    "max": 90,
    "pdf": {
      "width": 360,
      "lines": 1,
      "size": 10,
      "min": 8.5,
      "bold": true
    },
    "neutral": true
  },
  "pdf_legal_main": {
    "label": "Aviso legal institucional",
    "group": "pdf_legal",
    "default": "Esta es una simulación de crédito con fines informativos. Las condiciones, valores, tasas, plazos, cuotas y demás resultados presentados están sujetos a validación, estudio y aprobación definitiva por parte de la Universidad del Norte y/o las entidades que intervengan en el proceso de financiación.",
    "max": 800,
    "multiline": true,
    "neutral": false,
    "pdf": {
      "width": 491.28,
      "lines": 3,
      "size": 8.1,
      "min": 7.2,
      "bold": false
    }
  },
  "pdf_legal_bank": {
    "label": "Aviso legal de Banco Aliado",
    "group": "pdf_legal",
    "default": "Esta es una simulación de crédito con fines informativos. Las condiciones, valores, tasas, plazos, cuotas y demás resultados presentados están sujetos a validación, estudio y aprobación definitiva por parte de la entidad financiera.",
    "max": 800,
    "multiline": true,
    "neutral": true,
    "pdf": {
      "width": 491.28,
      "lines": 3,
      "size": 8.1,
      "min": 7.2,
      "bold": false
    }
  }
};
 const mandatory='Este documento no constituye aprobación del crédito.';
 const defaults=Object.freeze(Object.fromEntries(Object.entries(definitions).map(([key,d])=>[key,d.default])));
 const fail=(key,message)=>Object.assign(Error(message),{field:key,status:422});
 function validate(values,partial=false){
  if(!values||typeof values!=='object'||Array.isArray(values))throw fail('texts','Envía un objeto de textos.');
  const out={};for(const key of Object.keys(values)){
   const d=definitions[key],value=values[key];if(!Object.hasOwn(definitions,key))throw fail(key,'Texto no configurable.');
   if(typeof value!=='string')throw fail(key,'Escribe un texto válido.');
   const v=value.normalize('NFC').trim();
   if(!v||Array.from(v).length>d.max||/[<>\u0000-\u0008\u000B-\u001F\u007F-\u009F]/.test(v)||(!d.multiline&&/[\r\n\t]/.test(v)))throw fail(key,d.label+': usa entre 1 y '+d.max+' caracteres de texto, sin HTML ni caracteres de control.');
   if(d.pdf&&/[^\u0020-\u024F\u0300-\u036F\u2000-\u206F\u20AC\n\r]/u.test(v))throw fail(key,d.label+': usa caracteres latinos y signos de puntuación compatibles con Public Sans.');
   if(d.neutral&&/uninorte|universidad\s+del\s+norte|vigilado\s+mineducaci[oó]n/i.test(v))throw fail(key,'El documento de Banco Aliado debe conservar su presentación sin marca institucional.');
   out[key]=v;
  }
  if(!partial)for(const key of Object.keys(definitions))if(!Object.hasOwn(out,key))throw fail(key,'Falta el texto '+definitions[key].label+'.');
  return out;
 }
 function fit(doc,key,value,suffix=''){
  const d=definitions[key];if(!d?.pdf)throw fail(key,'Este campo no tiene un espacio PDF.');
  const p=d.pdf,text=key.startsWith('pdf_legal_')?value+' '+mandatory:value+suffix;
  doc.setFont('PublicSans',p.bold?'bold':'normal');
  const font=doc.getFont().metadata;if(Array.from(text).some(char=>!/[\r\n]/.test(char)&&font.characterToGlyph(char.codePointAt(0))===0))throw fail(key,d.label+': contiene un carácter que no puede representarse en la tipografía del PDF.');
  for(let units=Math.round(p.size*10);units>=Math.round(p.min*10);units--){
   const size=units/10;doc.setFontSize(size);const lines=doc.splitTextToSize(text,p.width+(suffix?131.28:0));
   if(lines.length<=p.lines&&lines.every(line=>doc.getTextWidth(line)<=p.width+(suffix?131.28:0)+.01))return {lines,size,lineHeight:key.startsWith('pdf_legal_')?10.8:size*1.3};
  }
  throw fail(key,d.label+': el texto no cabe en el espacio fijo del PDF. Acórtalo; el documento no puede ampliar esta sección.');
 }
 function pdfKey(report){const post=report.level==='posgrado'?'post':'pre';return {'Crédito corto plazo':'pdf_title_short_'+post,'Crédito mixto':'pdf_title_mixed_'+post,'Crédito largo plazo':'pdf_title_long_'+post,'Crédito de idiomas':'pdf_title_languages','Idiomas · Crédito mixto':'pdf_title_languages_mixed','Cuota inicial':'pdf_title_initial','Crédito banco aliado':'pdf_title_bank'}[report.modality]||(/^Reestructuración/.test(report.modality)?'pdf_title_refi':null);}
 function valuesFor(report){try{return validate(report?.textSettings?.values||defaults);}catch{return {...defaults};}}
 for(const d of Object.values(definitions)){if(d.pdf)Object.freeze(d.pdf);Object.freeze(d);}Object.freeze(definitions);
 return Object.freeze({definitions,defaults,mandatory,validate,fit,pdfKey,valuesFor,groups:{ui_modules:'Títulos y descripciones de los módulos',ui_sections:'Secciones de los formularios',ui_help:'Ayudas del simulador',pdf_titles:'Encabezados y modalidades del PDF',pdf_legal:'Avisos legales'}});
});
