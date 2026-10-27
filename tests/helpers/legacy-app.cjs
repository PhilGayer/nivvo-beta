const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

// Executes the real beta script without rewriting or copying its motor rules.
// This DOM double supports unit/control-flow assertions, not visual browser QA.
function loadApp({ source, saved = {}, equipment = ['maquina', 'cabo', 'halter', 'barra', 'banco', 'corpo'] } = {}) {
  const html = source ?? readFileSync(join(__dirname, '../../index.html'), 'utf8');
  const elements = new Map();
  const storage = new Map(Object.entries(saved));
  const alerts = [];
  const listeners = {};
  const makeElement = (id, tag = '', classNames = '') => {
    const classes = new Set(classNames.split(/\s+/).filter(Boolean));
    return { id, tag, value: '', textContent: '', innerHTML: '', style: {},
      classList: {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name)),
        contains: name => classes.has(name),
        toggle(name, force) {
          const enabled = force ?? !classes.has(name);
          if (enabled) classes.add(name); else classes.delete(name);
          return enabled;
        }
      },
      addEventListener() {}
    };
  };
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bid="([^"]+)"[^>]*)>/gi)) {
    const [, tag, attributes, id] = match;
    const element = makeElement(id, tag, attributes.match(/\bclass="([^"]*)"/)?.[1] ?? '');
    element.value = attributes.match(/\bvalue="([^"]*)"/)?.[1] ?? '';
    elements.set(id, element);
  }
  const document = {
    getElementById: id => elements.get(id) ?? null,
    querySelectorAll(selector) {
      if (selector === '#equipmentOptions input:checked') return equipment.map(value => ({ value }));
      if (selector === 'section.card') return [...elements.values()].filter(e => e.tag === 'section' && e.classList.contains('card'));
      if (selector === '#profileCompact .block-step') return [1, 2, 3].map(n => elements.get('compact' + n));
      throw new Error('Unsupported test selector: ' + selector);
    }
  };
  const sandbox = {
    document, console, alert: text => alerts.push(text),
    localStorage: {
      getItem: key => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
    },
    scrollTo() {},
    addEventListener: (event, callback) => { listeners[event] = callback; }
  };
  for (const [id, element] of elements) sandbox[id] = element;
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);
  for (const [, attributes, inline] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src=attributes.match(/src="([^"]+)"/)?.[1];
    const script=src?readFileSync(join(__dirname,'../../',src),'utf8'):inline;
    new vm.Script(script, { filename: 'index.html' }).runInContext(context);
  }
  return {
    elements, storage, alerts, listeners,
    run: expression => vm.runInContext(expression, context),
    json: expression => JSON.parse(vm.runInContext('JSON.stringify(' + expression + ')', context)),
    setInput(id, value) {
      if (!elements.has(id)) elements.set(id, makeElement(id));
      elements.get(id).value = String(value);
    }
  };
}

const profile = {
  age: 30, sex: 'nao_informado', goal: 'hipertrofia', level: 'iniciante',
  days: 3, minutes: 45, priority: 'equilibrado', style: 'equilibrado',
  plan: 'base', place: 'academia', discomfort: 'nenhuma', avoid: '',
  equipment: ['maquina', 'cabo', 'halter', 'barra', 'banco', 'corpo']
};

module.exports = { loadApp, profile };
