window.ProgramCatalogApiAdapter = {
  baseUrl: "/api",
  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    if (!response.ok) throw new Error(`Program catalog API error: ${response.status}`);
    if (response.status === 204) return null;
    return response.json();
  },
  list() { return this.request("/programs"); },
  get(id) { return this.request(`/programs/${encodeURIComponent(id)}`); },
  create(data) { return this.request("/admin/programs", { method: "POST", body: JSON.stringify(data) }); },
  update(id, data) { return this.request(`/admin/programs/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) }); },
  setStatus(id, status) { return this.request(`/admin/programs/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); },
  import(data) { return this.request("/admin/programs/import", { method: "POST", body: JSON.stringify(data) }); },
  history(id) { return this.request(`/admin/programs/${encodeURIComponent(id)}/history`); }
};
