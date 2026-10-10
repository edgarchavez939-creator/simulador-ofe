window.ProgramCatalog = {
  provider: null,
  use(provider) { this.provider = provider; },
  ensureProvider() {
    if (!this.provider) throw new Error("Program catalog provider not configured");
  },
  async list(params = {}) { this.ensureProvider(); return this.provider.list(params); },
  async get(id) { this.ensureProvider(); return this.provider.get(id); },
  async create(data) { this.ensureProvider(); return this.provider.create(data); },
  async update(id, data) { this.ensureProvider(); return this.provider.update(id, data); },
  async setStatus(id, status) { this.ensureProvider(); return this.provider.setStatus(id, status); },
  async import(data) { this.ensureProvider(); return this.provider.import(data); },
  async history(id) { this.ensureProvider(); return this.provider.history(id); }
};
