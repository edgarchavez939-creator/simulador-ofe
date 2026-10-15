(function initProgramPicker(global){
  'use strict';
  const pickers = new Map();
  function init(tab) {
    if (pickers.has(tab)) return;
    const input = document.getElementById('program-search'+tab);
    const list = document.getElementById('program-options'+tab);
    const select = document.getElementById('prog'+tab);
    const status = document.getElementById('program-results'+tab);
    if (!input || !list || !select) return;
    const state = { input, list, select, status, query: '', open: false, active: 0, typing: false };
    pickers.set(tab, state);
    const close = () => {
      state.open = false; list.hidden = true; input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    };
    state.close = close;
    function highlight(index) {
      const options = Array.from(list.children);
      state.active = Math.max(0, Math.min(index, options.length - 1));
      options.forEach((option, i) => option.classList.toggle('is-active', i === state.active));
      const option = options[state.active];
      if (option) { input.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' }); }
    }
    function choose(id) {
      select.value = id;
      global.setMat(tab);
      close();
      input.focus({ preventScroll: true });
      // Focusing the input after a pointer selection must not reopen the menu.
      sync(tab);
    }
    function render() {
      const available = new Set(Array.from(select.options).map(option => option.value));
      const matches = global.ProgramCatalogNormalizer.filter(global.SimuladorOFE.catalog.programs, { q: state.query, activo: true })
        .filter(program => available.has(program.id));
      list.replaceChildren();
      const entries = [{ id: '', label: 'Sin programa · Ingresar matrícula manualmente' },
        ...matches.map(program => ({ id: program.id, label: Array.from(select.options).find(option => option.value === program.id).label }))];
      entries.forEach((entry, index) => {
        const option = document.createElement('li');
        option.id = 'program-option-'+tab+'-'+index;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', String(select.value === entry.id));
        option.dataset.programId = entry.id;
        option.textContent = entry.label;
        option.addEventListener('mousedown', event => event.preventDefault());
        option.addEventListener('click', () => choose(entry.id));
        list.appendChild(option);
      });
      if (status) status.textContent = matches.length + ' programas disponibles' + (matches.length ? '.' : '. Puedes ingresar una matrícula manual.');
      list.hidden = false; state.open = true; input.setAttribute('aria-expanded', 'true');
      highlight(state.query && matches.length ? 1 : Math.max(0, entries.findIndex(entry => entry.id === select.value)));
    }
    input.addEventListener('focus', () => { if (!state.open) { state.query = ''; render(); input.select(); } });
    input.addEventListener('click', () => { if (!state.open) { state.query = ''; render(); input.select(); } });
    input.addEventListener('input', () => {
      state.query = input.value;
      state.typing = true; select.value = ''; global.setMat(tab); state.typing = false;
      render();
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!state.open) render(); else highlight(state.active + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key === 'Enter' && state.open) {
        event.preventDefault(); event.stopPropagation(); choose(list.children[state.active]?.dataset.programId || '');
      } else if (event.key === 'Escape' && state.open) {
        event.preventDefault(); event.stopPropagation(); sync(tab);
      } else if (event.key === 'Tab') { sync(tab); }
    });
    document.getElementById('program-toggle'+tab)?.addEventListener('click', () => {
      if (state.open) close(); else { state.query = ''; render(); input.focus({ preventScroll: true }); }
    });
    document.getElementById('program-clear'+tab)?.addEventListener('click', () => choose(''));
    document.addEventListener('pointerdown', event => {
      if (state.open && !document.getElementById('program-picker'+tab).contains(event.target)) sync(tab);
    });
    sync(tab);
  }
  function sync(tab) {
    const state = pickers.get(tab);
    if (!state || state.typing) return;
    const selected = Array.from(state.select.options).find(option => option.value && option.value === state.select.value);
    state.input.value = selected?.label || '';
    state.query = '';
    state.close();
    const clear = document.getElementById('program-clear'+tab);
    if (clear) clear.hidden = !selected;
    if (state.status) state.status.textContent = selected ? 'Programa seleccionado. Matrícula tomada del catálogo.' : 'Sin programa seleccionado. Matrícula editable.';
  }
  global.ProgramPicker = Object.freeze({ init, sync });
})(window);
