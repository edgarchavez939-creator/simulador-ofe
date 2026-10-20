"use strict";
const schema=require('../shared/settings/public-modules.js');
function readPublicModules(db){const row=db.prepare('SELECT * FROM public_module_settings WHERE id=1').get();return {values:schema.validate(JSON.parse(row.data)),version:row.version,updated_at:row.updated_at,updated_by:row.updated_by};}
module.exports={schema,readPublicModules};
