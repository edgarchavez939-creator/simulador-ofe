(function initCatalogImport(global) {
  'use strict';
  // Solo prepara una propuesta. La persistencia y la auditoría pertenecen a DTIC.
  function checked(value) {
    if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) throw new Error('importe fuera de rango');
    return value;
  }
  function amount(value) {
    if (typeof value === 'number') {
      return checked(value);
    }
    const text = String(value ?? '').trim().replace(/^(?:COP\s*|\$\s*)/i, '').trim();
    if (/^\d+$/.test(text)) return checked(Number(text));
    if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(text)) return checked(Number(text.replace(/\./g, '').replace(',', '.')));
    if (/^\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?$/.test(text)) return checked(Number(text.replace(/,/g, '')));
    if (/^\d+[.,]\d{1,2}$/.test(text)) return checked(Number(text.replace(',', '.')));
    throw new Error('importe vacío, ambiguo o inválido');
  }
  function parse(raw, tipo, mapping) {
    const rows = [], errors = [];
    if (!Array.isArray(raw)) return {tipo, rows, errors:['Hoja inválida.'], valid:false};
    const required = tipo === 'pregrado' ? ['nombre', 'valor'] : ['nombre', 'subnivel', 'valor'];
    if (!['pregrado', 'posgrado'].includes(tipo) || required.some(key => !Number.isInteger(mapping[key]) || mapping[key] < 0)) {
      return { tipo, rows, errors: ['Selecciona las columnas obligatorias.'], valid: false };
    }
    raw.slice(1).forEach((row, index) => {
      if (!Array.isArray(row)) { errors.push('Fila ' + (index + 2) + ': registro inválido'); return; }
      if (row.every(cell => cell === '' || cell === null || cell === undefined)) return;
      try {
        const nombre = String(row[mapping.nombre] ?? '').trim();
        if (!nombre) throw new Error('programa sin nombre');
        const valor = amount(row[mapping.valor]);
        if (!(valor > 0)) throw new Error('la matrícula debe ser mayor que cero');
        if (tipo === 'pregrado') {
          const idiomas = mapping.idiomas === undefined ? 0 : amount(row[mapping.idiomas]);
          const source = mapping.semestres === undefined ? null : row[mapping.semestres];
          const semestres = source === null || source === '' ? null : Number(source);
          if (semestres !== null && (!Number.isInteger(semestres) || semestres <= 0)) throw new Error('semestres debe ser un entero positivo');
          rows.push([nombre, valor, idiomas, semestres]);
        } else {
          const subnivel = String(row[mapping.subnivel] ?? '').trim();
          if (!['Doctorado', 'Maestría', 'Especialización'].includes(subnivel)) throw new Error('subnivel inválido');
          rows.push([nombre, subnivel, valor]);
        }
      } catch (error) { errors.push('Fila ' + (index + 2) + ': ' + error.message); }
    });
    if (!rows.length && !errors.length) errors.push('La hoja no contiene programas.');
    return { tipo, rows, errors, valid: errors.length === 0 };
  }
  function prepare(sheets, baseline) {
    const entries = Object.values(sheets);
    if (!entries.length || entries.some(entry => !entry.valid)) throw new Error('Hay hojas sin validar o con errores.');
    const snapshot = {};
    for (const [tipo, key] of [['pregrado', 'programas'], ['posgrado', 'posgrados']]) {
      const selected = entries.filter(entry => entry.tipo === tipo);
      snapshot[key] = selected.length ? selected.flatMap(entry => entry.rows) : baseline[key];
    }
    const programs = global.ProgramCatalogValidator.readList(global.ProgramCatalogNormalizer.fromSnapshot(snapshot));
    const counts = new Map();
    for (const program of programs) {
      const key = [program.nivel, program.subnivel, program.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()].join('|');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Object.freeze({ snapshot, total: programs.length, uniqueIds: new Set(programs.map(program => program.id)).size,
      duplicateGroups: [...counts.values()].filter(count => count > 1).length,
      changedLevels: ['programas', 'posgrados'].filter(key => JSON.stringify(snapshot[key]) !== JSON.stringify(baseline[key])) });
  }
  global.ProgramCatalogImport = Object.freeze({ amount, parse, prepare });
})(window);
