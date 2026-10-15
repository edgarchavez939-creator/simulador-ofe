const vm = require('node:vm');
const { loadApp, read } = require('./catalog-context.cjs');

function selectorContext(app, options = {}) {
  const { context, elements, snapshot } = loadApp(app, options);
  const messages = [], scheduled = [], storage = new Map();
  class Element {
    constructor(tag = 'div', attrs = {}) {
      this.tagName = tag.toUpperCase(); this.nodeType = 1;
      this.attributes = { ...attrs }; this.id = attrs.id || '';
      this.dataset = {};
      Object.entries(attrs).filter(([key]) => key.startsWith('data-')).forEach(([key, value]) => {
        this.dataset[key.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = value;
      });
      this.events = {}; this.style = {}; this.hidden = 'hidden' in attrs; this.disabled = false;
      this.textContent = ''; this._value = attrs.value || ''; this.children = []; this.childNodes = [{ nodeValue: '' }]; this.parts = new Map();
      const classes = new Set((attrs.class || '').split(/\s+/));
      this.classList = {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name)),
        contains: name => classes.has(name),
        toggle: (name, force) => force === false || (force === undefined && classes.has(name)) ? classes.delete(name) : classes.add(name)
      };
    }
    get value() { return this._value; }
    set value(value) { this._value = String(value); }
    get label() { return this.attributes.label ?? this.textContent; }
    set label(value) { this.attributes.label = String(value); }
    get innerHTML() { return this._html || ''; }
    set innerHTML(value) {
      this._html = String(value);
      // Financial templates create additional controls and labels dynamically.
      for (const match of this._html.matchAll(/<([\w-]+)\b([^>]*\bid="[^"]+"[^>]*)>/g)) {
        const attrs = attributes(match[2]);
        if (!elements[attrs.id]) elements[attrs.id] = make(match[1], attrs);
      }
    }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name] ?? null; }
    hasAttribute(name) { return name in this.attributes; }
    removeAttribute(name) { delete this.attributes[name]; }
    get firstElementChild() { return this.children[0] || null; }
    appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
    append(...children) { this.children.push(...children); }
    remove() {
      if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    }
    addEventListener(name, handler) { (this.events[name] ||= []).push(handler); }
    fire(name, details = {}) { const event = { target:this, preventDefault(){}, stopPropagation(){}, ...details }; (this.events[name] || []).forEach(handler => handler(event)); }
    replaceChildren(...children) { this.children = []; this.append(...children); }
    select() {}
    querySelector(selector) {
      if (selector === '.idiomas-val' || selector === '.modal') {
        if (!this.parts.has(selector)) this.parts.set(selector, new Element());
        return this.parts.get(selector);
      }
      return null;
    }
    querySelectorAll() { return []; }
    closest() { return null; }
    contains() { return false; }
    focus() {}
    scrollIntoView() {}
    getContext() { return {}; }
  }
  class Input extends Element {
    get value() { return this._value; }
    set value(value) { this._value = String(value); }
  }
  class Select extends Element {
    constructor(tag, attrs) { super(tag, attrs); this.options = []; this.selectedIndex = -1; }
    get value() { return this.options[this.selectedIndex]?.value || ''; }
    set value(value) { this.selectedIndex = this.options.findIndex(option => option.value === String(value)); }
    get innerHTML() { return this._html || ''; }
    set innerHTML(value) {
      this._html = String(value); this.options = [];
      for (const match of this._html.matchAll(/<option\b([^>]*)>(.*?)<\/option>/gs)) {
        const option = new Element('option', attributes(match[1]));
        option.textContent = match[2]; this.options.push(option);
      }
      this.selectedIndex = this.options.length ? 0 : -1;
    }
    appendChild(option) { this.options.push(option); return option; }
  }
  function attributes(markup) {
    return Object.fromEntries(Array.from(markup.matchAll(/([\w-]+)="([^"]*)"/g), match => [match[1], match[2]]));
  }
  function make(tag, attrs = {}) {
    return tag === 'input' ? new Input(tag, attrs) : tag === 'select' ? new Select(tag, attrs) : new Element(tag, attrs);
  }
  const html = read(`apps/${app}/index.html`);
  for (const match of html.matchAll(/<([\w-]+)\b([^>]*\bid="[^"]+"[^>]*)>/g)) {
    if (match[1] === 'script') continue;
    const attrs = attributes(match[2]); const element = make(match[1], attrs);
    if (match[1] === 'select') {
      const body = html.match(new RegExp(`<select[^>]*id="${attrs.id}"[^>]*>([\\s\\S]*?)</select>`));
      element.innerHTML = body?.[1] || '';
    }
    elements[attrs.id] = element;
  }
  Object.assign(context.document, {
    createElement: tag => make(tag), documentElement: new Element('html'), body: new Element('body'),
    querySelectorAll: selector => selector === 'input[data-money-field]'
      ? Object.values(elements).filter(element => element instanceof Input && element.hasAttribute('data-money-field')) : [],
    querySelector: () => null
  });
  Object.assign(context, {
    HTMLElement: Element, HTMLInputElement: Input, Chart: class {},
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)) },
    matchMedia: () => ({ matches: false }), addEventListener() {}, scrollTo() {},
    requestAnimationFrame: callback => setTimeout(callback, 0),
    // Delayed history/chart/toast tasks remain explicit in the fixture.
    setTimeout: (callback, delay = 0) => delay >= 50 ? scheduled.push(callback) : setTimeout(callback, delay),
    console: Object.fromEntries(['info', 'log', 'warn', 'error'].map(level => [level, (...args) => messages.push({ level, args })]))
  });
  if(app==='ofe')vm.runInContext(read('shared/program-catalog/catalog-import.js'),context);
  for (const filename of ['01-core-ui.js', ...(app === 'ofe' ? ['02-reestructuracion.js'] : []), '03-finance-core.js', '04-exports-pdf-excel.js', '05-idiomas-herramientas.js', '06-actions-history.js', '07-financing-engine.js']) {
    vm.runInContext(read(`apps/${app}/simulador-assets/js/${filename}`), context, { filename });
  }
  return { context, elements, snapshot, messages, scheduled, button: () => new Element('button') };
}
module.exports = { selectorContext };
