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
        '[ProgramCatalog] JSON inválido en #' + id + ': ' + error.message
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

  const adapter = Object.freeze({
    source: 'embedded',

    snapshot() {
      const programas = readEmbeddedData('programas-data');
      const posgrados = readEmbeddedData('posgrados-data');

      return Object.freeze({
        programas: freezeRows(programas),
        posgrados: freezeRows(posgrados)
      });
    }
  });

  global.ProgramCatalogEmbeddedAdapter = adapter;

})(window);
