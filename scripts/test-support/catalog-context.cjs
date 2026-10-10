const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const plain = value => JSON.parse(JSON.stringify(value));
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

function loadApp(app, options = {}) {
  const relative = `apps/${app}/index.html`;
  const html = read(relative);
  const elements = { ...embeddedElements(html), ...options.elements };
  const events = [];
  const context = vm.createContext({
    document: {
      readyState: 'loading',
      getElementById: id => elements[id] || null,
      addEventListener: (name, handler) => events.push({ name, handler })
    },
    fetch: options.fetch || (() => { throw new Error('Unexpected network request'); }),
    setTimeout, clearTimeout, AbortController,
    console: options.console || console,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    dispatchEvent: event => events.push(event)
  });
  context.window = context;
  let reachedRuntime = false;
  for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const src = match[1].split('?')[0];
    if (/^https?:/.test(src)) continue;
    const filename = path.resolve(root, path.dirname(relative), src);
    vm.runInContext(readFileSync(filename, 'utf8'), context, { filename });
    if (src === './config.js') Object.assign(context.SIMULADOR_CONFIG.catalog, options.catalog);
    if (src.includes('/00-runtime.js')) {
      reachedRuntime = true;
      break;
    }
  }
  assert.ok(reachedRuntime);
  return { context, elements, events, snapshot: snapshotFrom(elements) };
}

module.exports = { root, plain, read, embeddedElements, snapshotFrom, loadApp };
