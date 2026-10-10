const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const baseId = 'posgrado:especializacion:especializacion-en-seguridad-de-la-informacion';
const hashes = {
  programas: '64f05236a5dfcb9eec5d3556ad3f271bbbd82bce07a6ed88c809c8c82a9ce4ff',
  posgrados: '1447d5a1e5263769c98aa93bf45d4dfc4d7966d3eaa6e477a88235672d90deb1',
  '03-finance-core.js': 'e74c1e10f5f3aeb3215d09bd6a14cf1348c167c64f38c24636e3beffbf0ea9f7',
  '07-financing-engine.js': '54d3f4be288bfb28962a4bc01f46cd77d3e5cf7d661fc9ab5bfc5221c6ead098'
};
const plain = value => JSON.parse(JSON.stringify(value));
const hash = value => createHash('sha256').update(value).digest('hex');
const read = relative => readFileSync(path.join(root, relative), 'utf8');

function embeddedElements(html) {
  const elements = {};
  for (const id of ['programas-data', 'posgrados-data']) {
    const match = html.match(new RegExp(`<script[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)</script>`, 'i'));
    assert.ok(match, `Missing embedded block ${id}`);
    elements[id] = { textContent: match[1] };
  }
  return elements;
}

function snapshotFrom(elements) {
  const parse = id => JSON.parse(elements[id].textContent.replace(
    /\/\*%%(?:PROGRAMAS|POSGRADOS)_(?:START|END)%%\*\//g, ''
  ));
  return { programas: parse('programas-data'), posgrados: parse('posgrados-data') };
}

function loadApp(app) {
  const relative = `apps/${app}/index.html`;
  const html = read(relative);
  const elements = embeddedElements(html);
  const context = vm.createContext({ document: { getElementById: id => elements[id] || null } });
  context.window = context;
  // Execute the actual HTML script order through the runtime, without UI modules.
  let reachedRuntime = false;
  for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const src = match[1].split('?')[0];
    if (/^https?:/.test(src)) continue;
    const filename = path.resolve(root, path.dirname(relative), src);
    vm.runInContext(readFileSync(filename, 'utf8'), context, { filename });
    if (src.includes('/00-runtime.js')) {
      reachedRuntime = true;
      break;
    }
  }
  assert.ok(reachedRuntime);
  for (const filename of ['program-catalog-schema.js', 'program-catalog-validator.js']) {
    vm.runInContext(read(`shared/program-catalog/${filename}`), context, { filename });
  }
  return { context, elements, snapshot: snapshotFrom(elements) };
}

for (const app of ['public', 'ofe']) {
  test(`${app}: facade reads 173 unique programs without altering legacy data`, async () => {
    const { context, elements, snapshot } = loadApp(app);
    const catalog = context.ProgramCatalog;
    const before = JSON.stringify(elements);
    const programs = await catalog.list();
    assert.equal(programs.length, 173);
    assert.equal(new Set(programs.map(program => program.id)).size, 173);
    assert.equal((await catalog.list({ nivel: 'pregrado' })).length, 29);
    assert.equal((await catalog.list({ nivel: 'posgrado' })).length, 144);
    assert.deepEqual(plain(context.PROGRAMAS), snapshot.programas);
    assert.deepEqual(plain(context.POSGRADOS), snapshot.posgrados);
    assert.deepEqual(plain(catalog.snapshot()), snapshot);
    assert.equal(context.SimuladorOFE.catalog.provider, catalog);
    assert.equal(catalog.source, 'embedded');
    assert.equal(catalog.capabilities.write, false);
    assert.ok(Object.isFrozen(programs));
    assert.deepEqual(plain(await catalog.list()), plain(programs));

    for (const program of programs) {
      assert.ok(Object.isFrozen(program));
      assert.equal(program.codigo, null);
      assert.deepEqual(plain(context.ProgramCatalogValidator.validate(program)), []);
      const row = snapshot[program.nivel === 'pregrado' ? 'programas' : 'posgrados'][program.sourceIndex];
      assert.equal(program.nombre, row[0]);
      assert.equal(program.valorMatricula, row[program.nivel === 'pregrado' ? 1 : 2]);
      assert.equal(program.valorIdiomas, program.nivel === 'pregrado' ? row[2] || 0 : 0);
      assert.equal(program.semestres, program.nivel === 'pregrado' ? row[3] ?? null : null);
      assert.deepEqual(plain(await catalog.get(program.id)), plain(program));
    }

    const collisions = await catalog.list({ q: 'especializacion en seguridad de la informacion' });
    assert.equal(collisions.length, 2);
    assert.deepEqual(plain(collisions.map(program => [program.id, program.sourceIndex, program.valorMatricula])), [
      [`${baseId}:source-71`, 71, 20495600],
      [`${baseId}:source-72`, 72, 14346600]
    ]);
    assert.equal(await catalog.get('missing'), null);
    for (const operation of ['create', 'update', 'setStatus', 'import']) {
      await assert.rejects(catalog[operation](), /read-only/);
    }
    assert.equal(JSON.stringify(elements), before);
    console.log(`${app}: ProgramCatalog.list()=173; unique IDs=173; pregrado=29; posgrado=144`);
  });
}

test('IDs distinguish identical rows and slug collisions and do not depend on tuition', () => {
  const { context } = loadApp('public');
  const normalize = context.ProgramCatalogNormalizer.fromSnapshot;
  const snapshot = {
    programas: [
      ['Á-B', 100, 20, 8],
      ['A B', 200, 30, 10],
      ['A B source 0', 300, 0, 6]
    ],
    posgrados: [
      ['Á-B', 'Especialización', 100],
      ['Á-B', 'Especialización', 100],
      ['A B', 'Especialización', 200],
      ['A B', 'Maestría', 300]
    ]
  };
  const before = JSON.stringify(snapshot);
  const programs = normalize(snapshot);
  const ids = plain(programs.map(program => program.id));
  assert.equal(new Set(ids).size, 7);
  assert.equal(JSON.stringify(snapshot), before);
  assert.deepEqual(plain(normalize(plain(snapshot))), plain(programs));
  assert.equal(programs[2].id, 'pregrado:a-b-source-0');
  assert.equal(programs[6].id, 'posgrado:maestria:a-b');
  const changed = plain(snapshot);
  changed.programas.forEach(row => { row[1] += 1000; row[2] += 500; row[3] += 1; });
  changed.posgrados.forEach(row => { row[2] += 1000; });
  assert.deepEqual(plain(normalize(changed).map(program => program.id)), ids);
});

test('all embedded catalogs and all six financial files preserve baseline SHA-256', () => {
  for (const prefix of ['', 'apps/public/', 'apps/ofe/']) {
    const snapshot = snapshotFrom(embeddedElements(read(`${prefix}index.html`)));
    assert.equal(snapshot.programas.length, 29);
    assert.equal(snapshot.posgrados.length, 144);
    for (const kind of ['programas', 'posgrados']) {
      assert.equal(hash(JSON.stringify(snapshot[kind])), hashes[kind], `${prefix}${kind} altered`);
    }
    for (const filename of ['03-finance-core.js', '07-financing-engine.js']) {
      assert.equal(hash(readFileSync(path.join(root, prefix, 'simulador-assets/js', filename))), hashes[filename]);
    }
  }
});
