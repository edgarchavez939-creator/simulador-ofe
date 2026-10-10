window.ProgramCatalogMockAdapter = {
  source: "/data/mock-program-catalog.json",
  async _load() {
    const response = await fetch(this.source, { cache: "no-store" });
    if (!response.ok) throw new Error("No fue posible cargar el catálogo mock");
    return response.json();
  },
  async list() { const data = await this._load(); return data.programs || []; },
  async get(id) { return (await this.list()).find(p => p.id === id) || null; },
  async create() { throw new Error("Mock adapter: escritura no persistente"); },
  async update() { throw new Error("Mock adapter: escritura no persistente"); },
  async setStatus() { throw new Error("Mock adapter: escritura no persistente"); },
  async import() { throw new Error("Mock adapter: escritura no persistente"); },
  async history() { return []; }
};
