(function initProgramCatalogValidator(global){
  'use strict';

  const nonempty = value => typeof value === 'string' && value.trim().length > 0;
  const amount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;

  function validate(program) {
    if (!program || typeof program !== 'object' || Array.isArray(program)) {
      return ['Programa inválido'];
    }
    const errors = [];
    for (const field of global.ProgramCatalogSchema.required) {
      if (program[field] === undefined || program[field] === null || program[field] === '') {
        errors.push(`Falta ${field}`);
      }
    }
    if (!nonempty(program.id)) errors.push('ID inválido');
    if (!nonempty(program.nombre)) errors.push('Nombre inválido');
    if (!global.ProgramCatalogSchema.levels.includes(program.nivel)) errors.push('Nivel inválido');
    if (!amount(program.valorMatricula)) errors.push('valorMatricula debe ser un número finito no negativo');
    if (typeof program.activo !== 'boolean') errors.push('activo debe ser booleano');
    if (program.subnivel != null && !nonempty(program.subnivel)) errors.push('Subnivel inválido');
    if (program.nivel === 'posgrado' && !nonempty(program.subnivel)) errors.push('Falta subnivel de posgrado');
    if (program.codigo != null && !nonempty(program.codigo)) errors.push('Código inválido');
    if (program.valorIdiomas !== undefined && !amount(program.valorIdiomas)) errors.push('valorIdiomas inválido');
    if (program.semestres != null && (!Number.isInteger(program.semestres) || program.semestres <= 0)) {
      errors.push('Semestres inválidos');
    }
    if (program.sourceIndex !== undefined && (!Number.isInteger(program.sourceIndex) || program.sourceIndex < 0)) {
      errors.push('sourceIndex inválido');
    }
    return errors;
  }

  function readProgram(program, expectedId) {
    if (program === null) return null;
    const errors = validate(program);
    if (errors.length) throw new TypeError('[ProgramCatalog] Programa inválido: ' + errors.join('; '));
    if (expectedId !== undefined && program.id !== expectedId) {
      throw new Error('[ProgramCatalog] El ID recibido no corresponde al solicitado');
    }
    return Object.freeze({
      ...program,
      codigo: program.codigo ?? null,
      subnivel: program.subnivel ?? null,
      valorIdiomas: program.valorIdiomas ?? 0,
      semestres: program.semestres ?? null
    });
  }

  function readList(payload) {
    const rows = Array.isArray(payload) ? payload : payload?.programs;
    if (!Array.isArray(rows)) throw new TypeError('[ProgramCatalog] Se esperaba una lista de programas');
    const ids = new Set();
    const result = rows.map(row => {
      const program = readProgram(row);
      if (!program) throw new TypeError('[ProgramCatalog] Programa nulo en la lista');
      if (ids.has(program.id)) throw new Error('[ProgramCatalog] ID duplicado: ' + program.id);
      ids.add(program.id);
      return program;
    });
    return Object.freeze(result);
  }

  global.ProgramCatalogValidator = Object.freeze({ validate, readProgram, readList });
})(window);
