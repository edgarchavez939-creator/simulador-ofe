(function initEmbeddedCatalogAdapter(global){
  'use strict';

  const MARKERS_RE =
    /\/\*%%(?:PROGRAMAS|POSGRADOS)_(?:START|END)%%\*\//g;

  function readEmbeddedData(id) {
    const element = document.getElementById(id);

    if (!element) {
      throw new Error(
        '[ProgramCatalog] No se encontró el origen embebido #' + id
      );
    }

    const raw = (element.textContent || '')
      .replace(MARKERS_RE, '')
      .trim();

    if (!raw) {
      throw new Error(
        '[ProgramCatalog] El origen embebido #' + id + ' está vacío'
      );
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(
        '[ProgramCatalog] JSON inválido en #' +
        id +
        ': ' +
        error.message
      );
    }
  }

  function freezeRows(rows) {
    return Object.freeze(
      rows.map(row =>
        Array.isArray(row)
          ? Object.freeze(row.slice())
          : Object.freeze({ ...row })
      )
    );
  }

  function snapshot() {
    return Object.freeze({
      programas: freezeRows(
        readEmbeddedData('programas-data')
      ),

      posgrados: freezeRows(
        readEmbeddedData('posgrados-data')
      )
    });
  }

  function normalized() {
    const normalizer = global.ProgramCatalogNormalizer;

    if (
      !normalizer ||
      typeof normalizer.fromSnapshot !== 'function'
    ) {
      throw new Error(
        '[ProgramCatalog] Normalizer not configured'
      );
    }

    return normalizer.fromSnapshot(snapshot());
  }

  function readonly(operation) {
    throw new Error(
      `[ProgramCatalog] Embedded provider is read-only: ${operation}`
    );
  }

  const adapter = Object.freeze({
    source: 'embedded',

    capabilities: Object.freeze({
      read: true,
      write: false,
      import: false,
      history: false
    }),

    snapshot,

    async list(params = {}) {
      const programs = normalized();

      return global.ProgramCatalogNormalizer.filter(
        programs,
        params
      );
    },

    async get(id) {
      if (!id) return null;

      return (
        normalized().find(
          program => program.id === id
        ) || null
      );
    },

    async create() {
      return readonly('create');
    },

    async update() {
      return readonly('update');
    },

    async setStatus() {
      return readonly('setStatus');
    },

    async import() {
      return readonly('import');
    },

    async history() {
      return [];
    }
  });

  global.ProgramCatalogEmbeddedAdapter = adapter;

})(window);
