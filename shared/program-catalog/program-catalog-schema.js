(function initProgramCatalogSchema(global){
  'use strict';

  global.ProgramCatalogSchema = Object.freeze({
    version: 1,

    required: Object.freeze([
      'id',
      'nombre',
      'nivel',
      'valorMatricula',
      'activo'
    ]),

    optional: Object.freeze([
      'codigo',
      'subnivel',
      'valorIdiomas',
      'semestres',
      'sourceIndex'
    ]),

    levels: Object.freeze([
      'pregrado',
      'posgrado'
    ])
  });

})(window);
