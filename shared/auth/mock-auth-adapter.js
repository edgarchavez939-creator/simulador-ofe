window.OFEAuthMock = {
  async isAuthenticated() { return true; },
  async getUser() { return { name: "Usuario de desarrollo" }; },
  async getRoles() { return ["OFE_ADMIN"]; },
  async can() { return true; }
};
