const assert = require('node:assert/strict');
const vm = require('node:vm');
const { test } = require('node:test');
const { loadApp, read, plain } = require('./test-support/catalog-context.cjs');

function fixture() {
  const { context, snapshot } = loadApp('public');
  return plain(context.ProgramCatalogNormalizer.fromSnapshot(snapshot));
}
function response(payload, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => plain(payload) };
}
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
function mockFetch(programs, calls, envelope = true) {
  return async (url, options) => {
    calls.push({ url, options });
    if (url === '/api/programs') return response(envelope ? { programs } : programs);
    if (url.startsWith('/api/programs/')) {
      const id = decodeURIComponent(url.slice('/api/programs/'.length));
      const program = programs.find(program => program.id === id);
      return response(program || null, program ? 200 : 404);
    }
    if (url === '/fixture.json') return response(envelope ? { programs } : programs);
    throw new Error(`Unexpected request: ${url}`);
  };
}

for (const app of ['public', 'ofe']) {
  for (const provider of ['api', 'mock']) {
    test(`${app}/${provider}: async load preserves 173 records, IDs, values and legacy rows`, async () => {
      const programs = fixture();
      const calls = [];
      const { context, snapshot } = loadApp(app, {
        catalog: { provider, mockUrl: '/fixture.json' }, fetch: mockFetch(programs, calls)
      });
      const runtime = context.SimuladorOFE;
      assert.equal(context.PROGRAMAS, undefined);
      assert.equal(runtime.catalog.programs, null);
      let initialized = 0;
      runtime.register('probe', { init() {
        initialized++;
        assert.equal(context.PROGRAMAS.length, 29);
        assert.equal(context.POSGRADOS.length, 144);
      } });
      await runtime.init();
      assert.equal(initialized, 1);
      assert.equal(runtime.catalog.source, provider);
      assert.equal(context.ProgramCatalog.capabilities.read, true);
      assert.equal(context.ProgramCatalog.capabilities.write, provider === 'api');
      assert.equal(runtime.state.catalog.status, 'ready');
      assert.equal(runtime.state.catalog.error, null);
      assert.equal(runtime.catalog.programs.length, 173);
      assert.deepEqual(plain(runtime.catalog.programs), programs);
      assert.deepEqual(plain(context.PROGRAMAS), snapshot.programas);
      assert.deepEqual(plain(context.POSGRADOS), snapshot.posgrados);
      assert.ok(Object.isFrozen(context.PROGRAMAS));
      assert.ok(context.PROGRAMAS.every(Object.isFrozen));
      assert.equal(new Set(runtime.catalog.programs.map(program => program.id)).size, 173);
      const countBefore = calls.length;
      assert.equal(await runtime.catalog.ready(), runtime.catalog.programs);
      await runtime.init();
      assert.equal(calls.length, countBefore);
      assert.equal(initialized, 1);
      assert.equal(Object.getOwnPropertyDescriptor(context, 'PROGRAMAS').writable, false);
      const catalog = context.ProgramCatalog;
      assert.equal((await catalog.list({ nivel: 'pregrado' })).length, 29);
      const duplicates = await catalog.list({ nivel: 'posgrado', subnivel: 'Especialización', q: 'seguridad de la informacion', activo: true });
      assert.equal(duplicates.length, 2);
      for (const program of duplicates) {
        assert.equal(program.codigo, null);
        assert.deepEqual(plain(await catalog.get(program.id)), plain(program));
      }
      assert.equal(await catalog.get('missing'), null);
      assert.equal(await catalog.get(''), null);
      await assert.rejects(catalog.list({ activo: 'false' }), /booleano/);
      assert.ok(calls.every(call => call.options.credentials === 'same-origin'));
      assert.ok(calls.every(call => call.options.headers.Accept === 'application/json'));
    });
  }
}

test('modules wait for the remote response and concurrent init shares a single load', async () => {
  const gate = deferred();
  let requests = 0;
  const { context, events } = loadApp('ofe', {
    catalog: { provider: 'api' }, fetch: () => { requests++; return gate.promise; }
  });
  const runtime = context.SimuladorOFE;
  let initialized = 0;
  runtime.register('probe', { init() { initialized++; } });
  const first = runtime.init();
  const second = runtime.init();
  assert.equal(first, second);
  assert.equal(runtime.state.catalog.status, 'loading');
  assert.equal(requests, 1);
  assert.equal(initialized, 0);
  assert.equal(context.PROGRAMAS, undefined);
  gate.resolve(response({ programs: fixture() }));
  await Promise.all([first, second]);
  assert.equal(initialized, 1);
  assert.equal(events.filter(event => event.type === 'simulador:ready').length, 1);
});

test('inactive rows remain readable and are excluded from the legacy selection bridge', async () => {
  const programs = fixture();
  programs[0].activo = false;
  const calls = [];
  const { context } = loadApp('public', { catalog: { provider: 'api' }, fetch: mockFetch(programs, calls, false) });
  await context.SimuladorOFE.init();
  assert.equal(context.SimuladorOFE.catalog.programs.length, 173);
  assert.equal(context.PROGRAMAS.length, 28);
  assert.equal((await context.ProgramCatalog.list({ activo: false })).length, 1);
  assert.equal((await context.ProgramCatalog.get(programs[0].id)).activo, false);
});

test('malformed responses and records stop startup before any module or legacy publication', async t => {
  const variants = [
    ['wrong envelope', {}, /lista/],
    ['null row', [null], /nulo/],
    ['duplicate IDs', [fixture()[0], fixture()[0]], /duplicado/],
    ['missing ID', [{ ...fixture()[0], id: undefined }], /ID/],
    ['wrong level', [{ ...fixture()[0], nivel: 'otro' }], /Nivel/],
    ['string tuition', [{ ...fixture()[0], valorMatricula: '100' }], /valorMatricula/],
    ['NaN tuition', [{ ...fixture()[0], valorMatricula: NaN }], /valorMatricula/],
    ['negative tuition', [{ ...fixture()[0], valorMatricula: -1 }], /valorMatricula/],
    ['string status', [{ ...fixture()[0], activo: 'true' }], /booleano/],
    ['missing postgraduate subtype', [{ ...fixture()[29], subnivel: null }], /subnivel/],
    ['empty list', [], /vacío/],
    ['no active rows', [{ ...fixture()[0], activo: false }], /activos/]
  ];
  for (const [name, payload, pattern] of variants) {
    await t.test(name, async () => {
      const { context } = loadApp('public', {
        catalog: { provider: 'api' },
        // Deliberately keep NaN in the fake transport so finite-number validation is exercised.
        fetch: async () => ({ ok: true, status: 200, json: async () => payload })
      });
      let initialized = 0;
      context.SimuladorOFE.register('probe', { init() { initialized++; } });
      await assert.rejects(context.SimuladorOFE.init(), pattern);
      assert.equal(initialized, 0);
      assert.equal(context.PROGRAMAS, undefined);
      assert.equal(context.POSGRADOS, undefined);
      assert.equal(context.SimuladorOFE.state.catalog.status, 'error');
      assert.equal(context.SimuladorOFE.state.initializing, false);
      assert.equal(context.SimuladorOFE.catalog.source, 'api');
    });
  }
});

test('HTTP, network and JSON failures reject without replacing the source; retry can recover', async t => {
  const variants = [
    ['HTTP', async () => response(null, 503), /HTTP 503/],
    ['network', async () => { throw new TypeError('offline'); }, /cargar el catálogo/],
    ['JSON', async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad JSON'); } }), /JSON inválida/],
    ['204 list', async () => response(null, 204), /lista/]
  ];
  for (const [name, fail, pattern] of variants) await t.test(name, async () => {
    let fetchCurrent = fail;
    const { context } = loadApp('ofe', { catalog: { provider: 'api' }, fetch: (...args) => fetchCurrent(...args) });
    await assert.rejects(context.SimuladorOFE.init(), pattern);
    assert.equal(context.PROGRAMAS, undefined);
    assert.equal(context.SimuladorOFE.state.catalog.status, 'error');
    fetchCurrent = async () => response(fixture());
    await context.SimuladorOFE.init();
    assert.equal(context.SimuladorOFE.state.catalog.status, 'ready');
    assert.equal(context.SimuladorOFE.state.catalog.error, null);
    assert.equal(context.PROGRAMAS.length, 29);
  });
});

test('request timeout aborts the transport and frees initialization for retry', async () => {
  const { context } = loadApp('public', {
    catalog: { provider: 'api', requestTimeoutMs: 10 },
    fetch: (url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    })
  });
  await assert.rejects(context.SimuladorOFE.init(), /Tiempo de espera agotado/);
  assert.equal(context.SimuladorOFE.state.initializing, false);
  assert.equal(context.PROGRAMAS, undefined);
});

test('API get encodes IDs, checks response identity and only treats not-found as null', async () => {
  const program = { ...fixture()[0], id: 'provided/id:1', codigo: 'codigo-proporcionado-en-fixture' };
  const calls = [];
  let payload = program;
  let status = 200;
  const { context } = loadApp('public', {
    fetch: async (url, options) => { calls.push({ url, options }); return response(payload, status); }
  });
  const adapter = context.ProgramCatalogApiAdapter.withConfig({ baseUrl: '/institution/api/' });
  context.ProgramCatalog.use(adapter);
  assert.equal((await context.ProgramCatalog.get(program.id)).codigo, program.codigo);
  assert.equal(calls[0].url, '/institution/api/programs/provided%2Fid%3A1');
  payload = { ...program, id: 'wrong' };
  await assert.rejects(context.ProgramCatalog.get(program.id), /ID recibido/);
  status = 404;
  assert.equal(await context.ProgramCatalog.get(program.id), null);
  status = 500;
  await assert.rejects(context.ProgramCatalog.get(program.id), /HTTP 500/);
});

test('mock sample stays isolated from the configured embedded catalog', async () => {
  const { context } = loadApp('public', {
    catalog: { apiBaseUrl: null }, fetch: async () => response(JSON.parse(read('data/mock-program-catalog.json')))
  });
  await context.SimuladorOFE.init();
  assert.equal(context.SimuladorOFE.catalog.source, 'embedded');
  assert.equal(context.PROGRAMAS.length, 29);
  assert.equal((await context.ProgramCatalogMockAdapter.list()).length, 1);
  await assert.rejects(context.ProgramCatalogMockAdapter.update(), /read-only/);
  assert.equal((await context.ProgramCatalog.list()).length, 173);
});

function startupElements() {
  return Object.fromEntries(['main-content', 'app-startup-status'].map(id => [id, {
    attributes: {}, hidden: false, inert: true,
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; }
  }]));
}
for (const app of ['public', 'ofe']) {
  test(`${app}: bootstrap displays loading, enables success and leaves failure visibly blocked`, async () => {
    for (const success of [true, false]) {
      const gate = deferred();
      const elements = startupElements();
      const logs = [];
      const { context, events } = loadApp(app, {
        elements, catalog: { provider: 'api' }, fetch: () => gate.promise,
        console: { error: (...args) => logs.push(args) }
      });
      vm.runInContext(read(`apps/${app}/simulador-assets/js/09-bootstrap.js`), context);
      const start = events.find(event => event.name === 'DOMContentLoaded').handler;
      const started = start();
      assert.equal(elements['app-startup-status'].textContent, 'Cargando programas…');
      assert.equal(elements['main-content'].inert, true);
      gate.resolve(response(success ? fixture() : null, success ? 200 : 503));
      await started;
      assert.equal(elements['main-content'].inert, !success);
      assert.equal(elements['app-startup-status'].hidden, success);
      assert.equal(elements['main-content'].attributes['aria-busy'], undefined);
      assert.equal(logs.length, success ? 0 : 1);
      if (!success) {
        assert.equal(elements['app-startup-status'].attributes.role, 'alert');
        assert.match(elements['app-startup-status'].textContent, /Recarga la página/);
      }
    }
  });
}
