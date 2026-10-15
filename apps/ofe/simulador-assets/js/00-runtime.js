/* Simulador OFE — runtime compartido y registro de módulos */
(function bootstrapRuntime(global){
  'use strict';

  const app = global.SimuladorOFE || {};
  const registry = new Map();

  // La carga del catálogo precede a la inicialización de módulos.
  // PROGRAMAS/POSGRADOS siguen siendo el puente temporal de los simuladores.
  const catalogOptions = global.SIMULADOR_CONFIG?.catalog || {};
  const configuredCatalogProvider = catalogOptions.provider || 'embedded';
  const catalogFacade = global.ProgramCatalog;
  if (!catalogFacade || typeof catalogFacade.use !== 'function') {
    throw new Error('[SimuladorOFE] ProgramCatalog facade not configured');
  }
  const availableCatalogAdapters = {
    embedded: global.ProgramCatalogEmbeddedAdapter,
    mock: global.ProgramCatalogMockAdapter,
    api: global.ProgramCatalogApiAdapter
  };
  let catalogAdapter = availableCatalogAdapters[configuredCatalogProvider];
  if (!catalogAdapter) {
    throw new Error('[SimuladorOFE] Catalog provider not available: ' + configuredCatalogProvider);
  }
  if (configuredCatalogProvider === 'mock') {
    catalogAdapter = catalogAdapter.withConfig({
      url: catalogOptions.mockUrl,
      requestTimeoutMs: catalogOptions.requestTimeoutMs
    });
  } else if (configuredCatalogProvider === 'api') {
    catalogAdapter = catalogAdapter.withConfig({
      baseUrl: catalogOptions.apiBaseUrl,
      requestTimeoutMs: catalogOptions.requestTimeoutMs
    });
  }
  catalogFacade.use(catalogAdapter);

  let catalogLoad = null;
  let catalogPrograms = null;
  function loadCatalog() {
    if (!catalogLoad) {
      app.state.catalog.status = 'loading';
      app.state.catalog.error = null;
      catalogLoad = (async () => {
        const programs = await catalogFacade.list();
        if (!programs.length) throw new Error('[ProgramCatalog] El catálogo está vacío');
        const snapshot = typeof catalogAdapter.snapshot === 'function'
          ? await catalogFacade.snapshot()
          : global.ProgramCatalogNormalizer.toSnapshot(programs);
        if (!snapshot.programas.length && !snapshot.posgrados.length) {
          throw new Error('[ProgramCatalog] No hay programas activos');
        }
        // Publicar los arrays solo después de validar el catálogo completo.
        Object.defineProperties(global, {
          PROGRAMAS: { value: snapshot.programas, writable: false, configurable: false },
          POSGRADOS: { value: snapshot.posgrados, writable: false, configurable: false }
        });
        catalogPrograms = programs;
        app.state.catalog.status = 'ready';
        return programs;
      })().catch(error => {
        app.state.catalog.status = 'error';
        app.state.catalog.error = error.message;
        catalogLoad = null;
        throw error;
      });
    }
    return catalogLoad;
  }
  app.catalog = Object.freeze({
    source: catalogFacade.source,
    provider: catalogFacade,
    get programs() { return catalogPrograms; },
    ready: loadCatalog,
    async refresh() {
      const programs = await catalogFacade.list();
      if(!programs.length) throw new Error('El catálogo está vacío');
      catalogPrograms = programs;
      return programs;
    }
  });

  app.version = 'UNINORTE-V3.12-PDF-APTOS';
  app.config = Object.freeze({
    get garantisaCP(){return global.OFEGlobalSettings ? global.OFEGlobalSettings.current().values.garantisa_cp_percent/100 : 0.0417;},
    get garantisaLP(){return global.OFEGlobalSettings ? global.OFEGlobalSettings.current().values.garantisa_lp_percent/100 : 0.0286;},
    locale: 'es-CO',
    currency: 'COP'
  });
  app.state = app.state || Object.create(null);
  app.state.catalog = { status: 'idle', error: null };

  // Estado por dominio. Ningún módulo debe usar window._* como fuente de verdad.
  app.state.access = app.state.access || {
    restructuringUnlocked: false,
    updaterUnlocked: false,
    pinTarget: 5,
    pinBusy: false
  };
  app.state.ui = app.state.ui || {
    levelByTab: {1:'pregrado', 2:'pregrado', 3:'pregrado', 7:'pregrado'},
    termUnits: {1:'m', '2cp':'m', '2lp':'m'},
    activeModalId: null,
    modalReturnFocus: null
  };
  app.state.results = app.state.results || {
    shortTerm: null,
    mixed: null,
    bank: null,
    initialPayment: null,
    languages: null,
    projectionLP: null,
    projectionLanguagesLP: null,
    initialPaymentProgramName: ''
  };
  app.state.restructuring = app.state.restructuring || { current: null, scenarios: [] };
  app.state.languages = app.state.languages || { context: {}, benefits: [], equivalentRateType: 'efectiva' };
  app.state.financing = app.state.financing || {
    benefits: {1:[], 2:[], 3:[], 7:[]},
    redistributing: false
  };
  app.state.comparison = app.state.comparison || { scenarios: {1:[], 2:[], 3:[]} };
  app.state.history = app.state.history || { key: global.OFE_SERVER?.userId ? 'simulador_credito_historial_v1:'+global.OFE_SERVER.userId : 'simulador_credito_historial_v1', max:10 };
  app.state.updater = app.state.updater || {
    htmlContent: null,
    workbook: null,
    activeSheet: null,
    sheetType: {},
    parsedData: {},
    currentUndergrad: null,
    currentPostgrad: null
  };
  app.services = app.services || Object.create(null);
  app.modules = app.modules || Object.create(null);

  app.register = function register(name, definition){
    if(!name || !definition || typeof definition.init !== 'function') {
      throw new TypeError('SimuladorOFE.register requiere nombre e init().');
    }
    if(registry.has(name)) throw new Error('Módulo duplicado: ' + name);
    registry.set(name, definition);
    app.modules[name] = definition;
    return definition;
  };

  let initialization = null;
  app.init = function init(){
    if (app.state.initialized) return Promise.resolve();
    if (initialization) return initialization;
    initialization = (async () => {
      app.state.initializing = true;
      try {
        await loadCatalog();
        for (const [name, mod] of registry) {
          if (mod.initialized) continue;
          try {
            await mod.init(app);
            mod.initialized = true;
          } catch (error) {
            console.error('[SimuladorOFE] Error inicializando ' + name, error);
            throw error;
          }
        }
        app.state.initialized = true;
        global.dispatchEvent(new CustomEvent('simulador:ready', { detail: { version: app.version } }));
      } finally {
        app.state.initializing = false;
        initialization = null;
      }
    })();
    return initialization;
  };

  global.SimuladorOFE = app;
})(window);
