'use strict';
const fs=require('node:fs'),path=require('node:path');
const schema=require('../shared/settings/text-settings.js');
let metrics;
function documentMetrics(){
 if(!metrics){const {jsPDF}=require('../shared/vendor/jspdf-4.2.1.umd.min.js');metrics=new jsPDF({unit:'pt',format:'a4',putOnlyUsedFonts:true});for(const [style,file] of [['normal','Regular'],['bold','Bold']]){const name='PublicSans-'+file+'.ttf';metrics.addFileToVFS(name,fs.readFileSync(path.join(__dirname,'../shared/fonts',name)).toString('base64'));metrics.addFont(name,'PublicSans',style);}}
 return metrics;
}
function validate(values,partial=false){const clean=schema.validate(values,partial);for(const [key,value] of Object.entries(clean))if(schema.definitions[key].pdf)schema.fit(documentMetrics(),key,value);return clean;}
module.exports={schema,validate,documentMetrics};
