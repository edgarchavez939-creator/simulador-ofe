const assert = require('node:assert/strict');
const { test } = require('node:test');
const { selectorContext } = require('./test-support/selector-context.cjs');
const { loadApp, plain } = require('./test-support/catalog-context.cjs');

function fixturePrograms() {
  const { context, snapshot } = loadApp('public');
  return plain(context.ProgramCatalogNormalizer.fromSnapshot(snapshot));
}
function remoteOptions(provider, programs = fixturePrograms()) {
  const calls = [];
  return { calls, catalog: { provider, mockUrl: '/fixture.json' }, fetch: async url => {
    calls.push(url); return { ok: true, status: 200, json: async () => ({ programs }) };
  } };
}
function choose(context, elements, tab, program) {
  context.setNivel(tab, program.nivel); elements['prog'+tab].value = program.id; context.setMat(tab);
}

for (const app of ['public', 'ofe']) for (const provider of ['embedded', 'mock', 'api']) {
  test(`${app}/${provider}: selectors use IDs and exact tuition, languages and semesters`, async () => {
    const options = remoteOptions(provider);
    const { context, elements, snapshot, messages } = selectorContext(app, options);
    await context.SimuladorOFE.init();
    const programs = context.SimuladorOFE.catalog.programs, requests = options.calls.length;
    const report = context.runFinancialSelfTests();
    assert.equal(report.ok, true); assert.equal(report.passed, 10);
    for (const tab of [1,2,3,7]) {
      assert.equal(elements['prog'+tab].options.length, 30);
      assert.deepEqual(elements['prog'+tab].options.slice(1).map(option => option.value),
        plain(programs.filter(program => program.nivel === 'pregrado').map(program => program.id)));
      for (const program of programs) {
        choose(context, elements, tab, program);
        assert.equal(elements['prog'+tab].value, program.id);
        assert.equal(context.programaSeleccionado(tab).id, program.id);
        assert.equal(Number(elements['mat'+tab].value), program.valorMatricula);
        if (tab === 2 && program.nivel === 'pregrado') assert.equal(Number(elements.plazoLP.value), program.semestres || 8);
        const button = elements['btn-idiomas-'+tab];
        if (button && program.nivel === 'pregrado' && program.valorIdiomas > 0) {
          assert.equal(button.style.display, 'flex'); assert.equal(Number(button.dataset.idiomas), program.valorIdiomas);
          assert.equal(button.dataset.prog, program.nombre);
        } else if (button) {
          assert.equal(button.style.display, 'none'); assert.equal(button.dataset.idiomas, undefined);
        }
        if (tab === 7) assert.equal(context.SimuladorOFE.state.results.initialPaymentProgramName, program.nombre);
      }
      context.setNivel(tab, 'posgrado'); assert.equal(elements['prog'+tab].options.length, 145);
    }
    assert.equal(options.calls.length, requests, 'selection must not refetch the provider');
    assert.deepEqual(plain(context.PROGRAMAS), snapshot.programas); assert.deepEqual(plain(context.POSGRADOS), snapshot.posgrados);
    assert.equal(programs.length, 173); assert.deepEqual(messages.filter(message => message.level === 'error'), []);
  });
}

test('duplicate options show distinct tuition labels and retain canonical text after filtering', async () => {
  const { context, elements } = selectorContext('public'); await context.SimuladorOFE.init();
  const duplicates = context.SimuladorOFE.catalog.programs.filter(program => program.nombre === 'Especialización En Seguridad De La Información');
  for (const tab of [1,2,3,7]) {
    context.setNivel(tab, 'posgrado');
    const check = () => {
      const options = elements['prog'+tab].options.filter(option => duplicates.some(program => program.id === option.value));
      assert.equal(options.length, 2); assert.notEqual(options[0].value, options[1].value); assert.notEqual(options[0].label, options[1].label);
      assert.match(options[0].label, /20\.495\.600/); assert.match(options[1].label, /14\.346\.600/);
      assert.ok(options.every(option => !option.textContent.includes('Matrícula')));
      for (const program of duplicates) {
        elements['prog'+tab].value = program.id; context.setMat(tab); assert.equal(Number(elements['mat'+tab].value), program.valorMatricula);
      }
    };
    check();
    if (elements['subnivel'+tab]) {
      elements['subnivel'+tab].value = 'Especialización'; context.filtrarProgramas(tab); assert.equal(elements['mat'+tab].value, ''); check();
    }
  }
});

test('empty or invalid selection clears stale tuition and language data', async () => {
  const { context, elements } = selectorContext('ofe'); await context.SimuladorOFE.init();
  const program = context.SimuladorOFE.catalog.programs.find(program => program.valorIdiomas > 0);
  for (const tab of [1,2,3,7]) {
    choose(context, elements, tab, program); elements['prog'+tab].value = ''; context.setMat(tab);
    assert.equal(elements['mat'+tab].value, ''); assert.equal(context.programaSeleccionado(tab), null);
    if (elements['btn-idiomas-'+tab]) assert.equal(elements['btn-idiomas-'+tab].dataset.idiomas, undefined);
    elements['prog'+tab].value = JSON.stringify({ v: 1, nivel: 'pregrado' }); context.setMat(tab); assert.equal(elements['mat'+tab].value, '');
  }
  assert.equal(context.SimuladorOFE.state.results.initialPaymentProgramName, '');
});

test('remote IDs resolve same-name semesters and active subtype choices', async () => {
  const programs = [
    { id: 'remote-one', nombre: 'Programa con nombre repetido', nivel: 'pregrado', activo: true, valorMatricula: 1000000, valorIdiomas: 10000, semestres: 6 },
    { id: 'remote-two', nombre: 'Programa con nombre repetido', nivel: 'pregrado', activo: true, valorMatricula: 2000000, valorIdiomas: 20000, semestres: 12 },
    { id: 'remote-post', nombre: 'Programa remoto', nivel: 'posgrado', subnivel: 'Subnivel proporcionado', activo: true, valorMatricula: 3000000 },
    { id: 'remote-inactive', nombre: 'No activo', nivel: 'posgrado', subnivel: 'Subnivel inactivo', activo: false, valorMatricula: 4000000 }
  ];
  const { context, elements } = selectorContext('public', remoteOptions('api', programs)); await context.SimuladorOFE.init();
  for (const program of programs.slice(0,2)) {
    choose(context, elements, 2, program); assert.equal(Number(elements.plazoLP.value), program.semestres);
    assert.equal(Number(elements['btn-idiomas-2'].dataset.idiomas), program.valorIdiomas);
  }
  assert.deepEqual(elements.subnivel2.options.map(option => option.value), ['', 'Subnivel proporcionado']);
  context.setNivel(2, 'posgrado'); assert.deepEqual(elements.prog2.options.map(option => option.value), ['', 'remote-post']);
});

test('four calculation routes retain identity; languages inherit the selected row', async () => {
  const { context, elements, button } = selectorContext('public'); await context.SimuladorOFE.init();
  const program = context.SimuladorOFE.catalog.programs.find(program => program.nombre === 'Arquitectura');
  for (const tab of [1,2,3,7]) {
    choose(context, elements, tab, program); if (tab === 7) elements.cap7.value = 1000000;
    const task = {1: context.calcular1, 2: context.calcular2, 3: context.calcular3, 7: context.calcular7}[tab];
    await context.runCalculation(button(), tab, task, 'Prueba');
    const result = context.calculationResultForTab(tab); assert.ok(result, `No result for tab ${tab}`);
    assert.equal(result.progId, program.id); assert.equal(result.progNombre, program.nombre);
    assert.equal(result.nivel, program.nivel); assert.equal(result.catalogSource, 'embedded'); assert.equal(result.mat, program.valorMatricula);
    context.registrarHistorial(tab); assert.equal(context.getHistorial()[0].snap.progId, program.id);
  }
  context.abrirIdiomas(1);
  assert.equal(context.SimuladorOFE.state.languages.context.valorIdiomas, program.valorIdiomas);
  assert.equal(context.SimuladorOFE.state.languages.context.progNombre, program.nombre);
  context.calcularIdiomas(); assert.equal(context.SimuladorOFE.state.results.languages.mat, program.valorIdiomas);
  assert.equal(context.SimuladorOFE.state.results.languages.progNombre, program.nombre);
});

test('history restores exact postgraduate IDs; legacy snapshots resolve only unambiguous rows', async () => {
  const { context, elements, button } = selectorContext('ofe'); await context.SimuladorOFE.init();
  const duplicates = context.SimuladorOFE.catalog.programs.filter(program => program.nombre === 'Especialización En Seguridad De La Información');
  choose(context, elements, 1, duplicates[1]); await context.runCalculation(button(), 1, context.calcular1, 'Prueba'); context.registrarHistorial(1);
  const entry = context.getHistorial()[0]; choose(context, elements, 1, duplicates[0]); context.duplicarHistorial(entry.id);
  assert.equal(elements.prog1.value, duplicates[1].id); assert.equal(context.SimuladorOFE.state.ui.levelByTab[1], 'posgrado');
  assert.equal(Number(elements.mat1.value), duplicates[1].valorMatricula);
  assert.equal(context.programaDeHistorial({ progNombre: duplicates[0].nombre, mat: duplicates[0].valorMatricula }).id, duplicates[0].id);
  assert.equal(context.programaDeHistorial({ progNombre: duplicates[0].nombre, mat: 1 }), null);
  assert.equal(context.programaDeHistorial({ ...entry.snap, progId: 'missing' }), null);
  assert.equal(context.programaDeHistorial({ ...entry.snap, catalogSource: 'api' }), null);
});
