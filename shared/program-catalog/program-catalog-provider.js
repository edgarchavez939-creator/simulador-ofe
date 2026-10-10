(function initProgramCatalogProvider(global){
  'use strict';

  let provider = null;

  function ensureProvider() {
    if (!provider) {
      throw new Error(
        '[ProgramCatalog] Provider not configured'
      );
    }

    return provider;
  }

  function requireMethod(method) {
    const current = ensureProvider();

    if (typeof current[method] !== 'function') {
      throw new Error(
        `[ProgramCatalog] Provider does not support ${method}()`
      );
    }

    return current;
  }

  const catalog = {
    use(nextProvider) {
      if (
        !nextProvider ||
        typeof nextProvider.list !== 'function' ||
        typeof nextProvider.get !== 'function'
      ) {
        throw new TypeError(
          '[ProgramCatalog] Provider must implement list() and get()'
        );
      }

      provider = nextProvider;
      return this;
    },

    get provider() {
      return provider;
    },

    get source() {
      return provider?.source || null;
    },

    get capabilities() {
      return provider?.capabilities || null;
    },

    snapshot() {
      return requireMethod('snapshot').snapshot();
    },

    async list(params = {}) {
      return requireMethod('list').list(params);
    },

    async get(id) {
      return requireMethod('get').get(id);
    },

    async create(data) {
      return requireMethod('create').create(data);
    },

    async update(id, data) {
      return requireMethod('update').update(id, data);
    },

    async setStatus(id, status) {
      return requireMethod('setStatus').setStatus(id, status);
    },

    async import(data) {
      return requireMethod('import').import(data);
    },

    async history(id) {
      return requireMethod('history').history(id);
    }
  };

  global.ProgramCatalog = Object.freeze(catalog);

})(window);
