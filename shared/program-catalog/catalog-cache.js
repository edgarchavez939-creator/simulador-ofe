window.ProgramCatalogCache = {
  key: "simulador:program-catalog:v1",
  read() {
    try { return JSON.parse(localStorage.getItem(this.key) || "null"); }
    catch (_) { return null; }
  },
  write(payload) {
    localStorage.setItem(this.key, JSON.stringify(payload));
  },
  clear() { localStorage.removeItem(this.key); }
};
