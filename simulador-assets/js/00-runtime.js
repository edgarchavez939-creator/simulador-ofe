/* Simulador OFE — runtime compartido y registro de módulos */
(function bootstrapRuntime(global){
  'use strict';

  const app = global.SimuladorOFE || {};
  const registry = new Map();

  function readEmbeddedData(id){
    const el = document.getElementById(id);
    if(!el) return [];
    const raw = (el.textContent || '').replace(/\/\*%%(?:PROGRAMAS|POSGRADOS)_(?:START|END)%%\*\//g, '').trim();
    if(!raw) return [];
    try { return JSON.parse(raw); }
    catch(error) {
      console.error('[SimuladorOFE] Datos embebidos inválidos en #' + id, error);
      return [];
    }
  }

  // Datos institucionales embebidos como JSON no ejecutable.
  // Se exponen como propiedades globales de solo lectura para conservar
  // compatibilidad con los módulos clásicos sin habilitar scripts inline.
  Object.defineProperty(global, 'PROGRAMAS', {value: Object.freeze(readEmbeddedData('programas-data')), writable:false, configurable:false});
  Object.defineProperty(global, 'POSGRADOS', {value: Object.freeze(readEmbeddedData('posgrados-data')), writable:false, configurable:false});

  app.version = 'UX-P2.3-PDF-UNINORTE';
  app.config = Object.freeze({
    garantisaCP: 0.0417,
    garantisaLP: 0.0286,
    locale: 'es-CO',
    currency: 'COP'
  });
  app.state = app.state || Object.create(null);

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
  app.state.history = app.state.history || { key:'simulador_credito_historial_v1', max:10 };
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

  app.init = async function init(){
    if(app.state.initialized || app.state.initializing) return;
    app.state.initializing = true;
    try {
      for(const [name, mod] of registry) {
        try {
          await mod.init(app);
          mod.initialized = true;
        } catch(error) {
          console.error('[SimuladorOFE] Error inicializando ' + name, error);
          throw error;
        }
      }
      app.state.initialized = true;
      global.dispatchEvent(new CustomEvent('simulador:ready', {detail:{version:app.version}}));
    } finally {
      app.state.initializing = false;
    }
  };

  global.SimuladorOFE = app;
})(window);
