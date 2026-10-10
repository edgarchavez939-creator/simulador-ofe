window.SIMULADOR_CONFIG = {
  app: "ofe",
  environment: "development",
  features: {
    restructuring: true,
    programAdmin: true,
    tuitionOverride: true
  },
  catalog: {
    provider: "embedded",
    apiBaseUrl: "/api",
    mockUrl: "../../data/mock-program-catalog.json",
    requestTimeoutMs: 15000,
    cache: true
  }
};
