window.SIMULADOR_CONFIG = {
  app: "public",
  environment: "development",
  features: {
    restructuring: false,
    programAdmin: false,
    tuitionOverride: false
  },
  catalog: {
    provider: "embedded",
    apiBaseUrl: "/api",
    mockUrl: "../../data/mock-program-catalog.json",
    requestTimeoutMs: 15000,
    cache: true
  }
};
