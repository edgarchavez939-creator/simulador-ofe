(function initProgramCatalogApiAdapter(global){
  'use strict';

  function withConfig(settings = {}) {
    const baseUrl = (settings.baseUrl ?? '/api').replace(/\/+$/, '');
    const timeoutMs = settings.requestTimeoutMs ?? 15000;
    const request = (path, options = {}, allowNotFound = false) =>
      global.ProgramCatalogHttp.request(baseUrl + path, options, { timeoutMs, allowNotFound });
    const json = data => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

    return Object.freeze({
      source: 'api',
      baseUrl,
      capabilities: Object.freeze({ read: true, write: true, import: true, history: true }),
      withConfig,
      request,
      async list(params = {}) {
        const programs = global.ProgramCatalogValidator.readList(await request('/programs'));
        return global.ProgramCatalogNormalizer.filter(programs, params);
      },
      async get(id) {
        if (!id) return null;
        const result = await request(`/programs/${encodeURIComponent(id)}`, {}, true);
        return global.ProgramCatalogValidator.readProgram(result, id);
      },
      create(data) { return request('/admin/programs', { method: 'POST', ...json(data) }); },
      update(id, data) { return request(`/admin/programs/${encodeURIComponent(id)}`, { method: 'PUT', ...json(data) }); },
      setStatus(id, status) { return request(`/admin/programs/${encodeURIComponent(id)}/status`, { method: 'PATCH', ...json({ status }) }); },
      import(data) { return request('/admin/programs/import', { method: 'POST', ...json(data) }); },
      history(id) { return request(`/admin/programs/${encodeURIComponent(id)}/history`); }
    });
  }

  global.ProgramCatalogApiAdapter = withConfig();
})(window);
