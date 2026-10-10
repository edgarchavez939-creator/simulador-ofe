window.OFEAuth = {
  async isAuthenticated() {
    throw new Error("Auth provider not configured");
  },
  async getUser() { return null; },
  async getRoles() { return []; },
  async can() { return false; }
};
