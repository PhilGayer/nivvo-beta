const { build } = require('esbuild');
const { JSDOM } = require('jsdom');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');

// Real frontend code, isolated DOM and fake Auth/HTTP boundaries. No live accounts,
// credentials, database calls or duplicated training rules enter these tests.
let bundle;
async function source() {
  bundle ??= build({
    entryPoints: [resolve(__dirname, '../../cloud/app.mjs')], bundle: true,
    write: false, format: 'esm', platform: 'browser',
    plugins: [{ name: 'auth-fixture', setup(b) {
      b.onResolve({ filter: /^@supabase\/supabase-js$/ }, () => ({ path: 'auth', namespace: 'fixture' }));
      b.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
        contents: 'export const createClient = () => globalThis.__fixture.client;', loader: 'js'
      }));
    } }]
  }).then(result => result.outputFiles[0].text);
  return bundle;
}
function snapshot(owner) {
  const result = Object.fromEntries(['profiles', 'preferences', 'entitlements',
    'user_modalities', 'user_equipment', 'workout_plans', 'plan_exercises',
    'workout_sessions', 'session_exercises', 'exercise_sets', 'feedback',
    'discomfort_reports', 'progression_state', 'motor_decisions', 'consent_records'
  ].map(table => [table, []]));
  result.profiles = [{ id: owner, display_name: `Sintético ${owner}`, age: 30 }];
  result.preferences = [{ user_id: owner, days: 1, minutes: 15 }];
  result.entitlements = [{ user_id: owner, tier: 'free' }];
  return result;
}
const session = owner => owner ? { user: { id: owner, email: `${owner}@example.invalid` }, access_token: `synthetic-${owner}` } : null;
const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }

async function loadCloud({ owner = 'A', saved = {}, records = {} } = {}) {
  const dom = new JSDOM('<div id="cloudStatus"></div><nav id="cloudNav"></nav><main id="cloudRoot"></main>', {
    url: 'https://nivvo-fixture.invalid/', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  w.scrollTo = () => {};
  let current = session(owner), listener;
  const calls = [], errors = [];
  w.addEventListener('unhandledrejection', event => { errors.push(event.reason); event.preventDefault(); });
  const fixture = {
    signOutError: null, signOutClearsOnError: false, intercept: null, calls, errors,
    client: { auth: {
      getSession: async () => ({ data: { session: current }, error: null }),
      onAuthStateChange: fn => { listener = fn; },
      signOut: async () => {
        if (fixture.signOutError) {
          if (fixture.signOutClearsOnError) fixture.emit('SIGNED_OUT', null);
          return { error: fixture.signOutError };
        }
        fixture.emit('SIGNED_OUT', null); return { error: null };
      }
    } },
    emit(event, nextOwner) { current = session(nextOwner); listener(event, current); },
    expire() { current = null; },
    switchWithoutNotification(nextOwner) { current = session(nextOwner); },
    sessionOwner() { return current?.user.id; }
  };
  w.__fixture = fixture;
  w.fetch = async (url, options) => {
    const call = { owner: options.headers.Authorization.replace('Bearer synthetic-', ''), ...JSON.parse(options.body) };
    calls.push(call);
    const overridden = await fixture.intercept?.(call);
    const data = records[call.owner] ?? snapshot(call.owner);
    return overridden ?? response(call.action === 'start'
      ? { id: data.workout_sessions.find(s => s.status === 'started')?.id }
      : { data });
  };
  for (const [key, value] of Object.entries(saved)) w.localStorage.setItem(key, value);
  await w.eval(`(async () => { ${await source()}\n })()`);
  const q = selector => w.document.querySelector(selector);
  return {
    ...fixture, fixture, window: w, q, calls, close() { dom.window.close(); assert.deepEqual(errors, [], 'no unhandled frontend rejection'); },
    click(action) { const el = q(`[data-action="${action}"]`); assert.ok(el, action); el.click(); },
    text: () => q('#cloudRoot').textContent,
    async wait(check, description = 'UI state') {
      const end = Date.now() + 800;
      do { if (check()) return; await new Promise(r => setTimeout(r, 5)); } while (Date.now() < end);
      assert.fail(`Timeout: ${description}; ${q('#cloudStatus').textContent}`);
    }
  };
}
module.exports = { loadCloud, snapshot, response, deferred };
