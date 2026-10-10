(function initProgramCatalogMockAdapter(global){
  'use strict';

  function withConfig(settings = {}) {
    const url = settings.url ?? '/data/mock-program-catalog.json';
    const timeoutMs = settings.requestTimeoutMs ?? 15000;
    const readonly = operation => {
      throw new Error(`[ProgramCatalog] Mock provider is read-only: ${operation}`);
    };
    return Object.freeze({
      source: 'mock',
      url,
      capabilities: Object.freeze({ read: true, write: false, import: false, history: false }),
      withConfig,
      async list(params = {}) {
        const payload = await global.ProgramCatalogHttp.request(url, { cache: 'no-store' }, { timeoutMs });
        const programs = global.ProgramCatalogValidator.readList(payload);
        return global.ProgramCatalogNormalizer.filter(programs, params);
      },
      async get(id) {
        if (!id) return null;
        return (await this.list()).find(program => program.id === id) || null;
      },
      async create() { return readonly('create'); },
      async update() { return readonly('update'); },
      async setStatus() { return readonly('setStatus'); },
      async import() { return readonly('import'); },
      async history() { return []; }
    });
  }

  global.ProgramCatalogMockAdapter = withConfig();
})(window);
