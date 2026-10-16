'use strict';
const palette=require('../shared/ui/brand-palette.js');
function readAppearance(db){const row=db.prepare('SELECT * FROM appearance_settings WHERE id=1').get();return {values:JSON.parse(row.data),version:row.version,updated_at:row.updated_at,updated_by:row.updated_by};}
module.exports={palette,readAppearance};
