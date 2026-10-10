(function initProgramCatalogHttp(global){
  'use strict';

  async function request(url, options = {}, settings = {}) {
    const timeoutMs = settings.timeoutMs ?? 15000;
    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
      throw new TypeError('[ProgramCatalog] Tiempo de espera inválido');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let response;
      try {
        response = await fetch(url, {
          ...options,
          credentials: 'same-origin',
          headers: { Accept: 'application/json', ...options.headers },
          signal: controller.signal
        });
      } catch (error) {
        if (controller.signal.aborted) {
          throw new Error('[ProgramCatalog] Tiempo de espera agotado', { cause: error });
        }
        throw new Error('[ProgramCatalog] No fue posible cargar el catálogo', { cause: error });
      }
      if (response.status === 404 && settings.allowNotFound) return null;
      if (!response.ok) {
        throw new Error(`[ProgramCatalog] Error HTTP ${response.status}`);
      }
      if (response.status === 204) return null;
      try {
        return await response.json();
      } catch (error) {
        const message = controller.signal.aborted
          ? '[ProgramCatalog] Tiempo de espera agotado'
          : '[ProgramCatalog] Respuesta JSON inválida';
        throw new Error(message, { cause: error });
      }
    } finally {
      clearTimeout(timer);
    }
  }

  global.ProgramCatalogHttp = Object.freeze({ request });
})(window);
