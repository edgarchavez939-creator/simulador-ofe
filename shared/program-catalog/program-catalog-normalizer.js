(function initProgramCatalogNormalizer(global){
  'use strict';

  function slug(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function numeric(value, fallback = 0) {
    const result = Number(value);
    return Number.isFinite(result) ? result : fallback;
  }

  function technicalId(parts) {
    return parts
      .filter(value => value !== null && value !== undefined && value !== '')
      .map(slug)
      .filter(Boolean)
      .join(':');
  }

  function normalizeUndergraduate(row, sourceIndex) {
    if (!Array.isArray(row)) {
      throw new TypeError(
        '[ProgramCatalog] Registro de pregrado inválido'
      );
    }

    const [
      nombre,
      valorMatricula,
      valorIdiomas = 0,
      semestres = null
    ] = row;

    return Object.freeze({
      id: technicalId(['pregrado', nombre]),

      // El catálogo legacy no contiene código institucional.
      // No generar ni inferir uno.
      codigo: null,

      nombre: String(nombre || ''),
      nivel: 'pregrado',
      subnivel: null,

      valorMatricula: numeric(valorMatricula),
      valorIdiomas: numeric(valorIdiomas),

      semestres:
        semestres === null || semestres === ''
          ? null
          : numeric(semestres, null),

      activo: true,
      sourceIndex
    });
  }

  function normalizePostgraduate(row, sourceIndex) {
    if (!Array.isArray(row)) {
      throw new TypeError(
        '[ProgramCatalog] Registro de posgrado inválido'
      );
    }

    const [
      nombre,
      subnivel,
      valorMatricula
    ] = row;

    return Object.freeze({
      id: technicalId([
        'posgrado',
        subnivel,
        nombre
      ]),

      codigo: null,

      nombre: String(nombre || ''),
      nivel: 'posgrado',
      subnivel: String(subnivel || ''),

      valorMatricula: numeric(valorMatricula),
      valorIdiomas: 0,
      semestres: null,

      activo: true,
      sourceIndex
    });
  }

  function fromSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
      throw new TypeError(
        '[ProgramCatalog] Snapshot inválido'
      );
    }

    const programas = Array.isArray(snapshot.programas)
      ? snapshot.programas
      : [];

    const posgrados = Array.isArray(snapshot.posgrados)
      ? snapshot.posgrados
      : [];

    const normalized = [
      ...programas.map(normalizeUndergraduate),
      ...posgrados.map(normalizePostgraduate)
    ];

    const idCounts = new Map();

    for (const program of normalized) {
      idCounts.set(program.id, (idCounts.get(program.id) || 0) + 1);
    }

    // Conservar el ID base cuando es único. En colisiones, el índice
    // de la fila distingue registros del mismo snapshot sin usar precios
    // ni inventar códigos institucionales. El orden del origen forma
    // parte de esta identidad técnica; no es una identidad institucional.
    const uniquePrograms = normalized.map(program =>
      idCounts.get(program.id) === 1
        ? program
        : Object.freeze({
            ...program,
            id: `${program.id}:source-${program.sourceIndex}`
          })
    );

    const ids = new Set();

    for (const program of uniquePrograms) {
      if (ids.has(program.id)) {
        throw new Error(
          '[ProgramCatalog] ID técnico duplicado: ' +
          program.id
        );
      }

      ids.add(program.id);
    }

    return Object.freeze(uniquePrograms);
  }

  function filter(programs, params = {}) {
    let result = Array.from(programs || []);

    if (params.nivel) {
      result = result.filter(
        program => program.nivel === params.nivel
      );
    }

    if (params.subnivel) {
      result = result.filter(
        program => program.subnivel === params.subnivel
      );
    }

    if (params.activo !== undefined) {
      result = result.filter(
        program => program.activo === Boolean(params.activo)
      );
    }

    if (params.q) {
      const query = slug(params.q);

      result = result.filter(program =>
        slug(program.nombre).includes(query) ||
        slug(program.subnivel).includes(query)
      );
    }

    return Object.freeze(result);
  }

  global.ProgramCatalogNormalizer = Object.freeze({
    fromSnapshot,
    filter
  });

})(window);
