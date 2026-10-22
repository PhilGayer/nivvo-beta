const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, profile } = require('./helpers/legacy-app.cjs');

test('existing strength motor generates six distinct exercises', () => {
  const app = loadApp();
  const session = app.json(`makeSession(${JSON.stringify(profile)})`);
  assert.equal(session.length, 6);
  assert.equal(new Set(session.map(e => e.name)).size, 6);
});

test('compact onboarding generates and persists the selected week', () => {
  const app = loadApp();
  app.run(`compactProfile = ${JSON.stringify({ ...profile, name: 'QA NIVVO' })}`);
  assert.doesNotThrow(() => app.run('finishEquipment()'));
  const plan = JSON.parse(app.storage.get('treino_plan'));
  assert.equal(plan.length, 3);
  assert.ok(plan.every(day => day.length === 6));
  assert.equal(JSON.parse(app.storage.get('treino_profile')).minutes, 45);
  assert.equal(app.elements.get('ready').classList.contains('hidden'), false);
});

test('compact onboarding labels the final action as review', () => {
  const app = loadApp();
  app.run('window.compactStep = 3; renderCompactStep()');
  assert.equal(app.elements.get('compactNext').textContent, 'Revisar');
});

test('sessions retain three recorded sets, feedback and history after reload', () => {
  const app = loadApp();
  app.run(`state.profile = ${JSON.stringify(profile)}; state.plan = [makeSession(state.profile)]`);
  const session = app.json('currentSession()');
  for (let i = 0; i < session.length; i++) for (let s = 1; s <= 3; s++) {
    app.setInput(`load_${i}_${s}`, 12.5);
    app.setInput(`reps_${i}_${s}`, 10);
  }
  app.setInput('v1Difficulty', 'adequado');
  app.setInput('v1Pain', 'nao');
  app.setInput('v1Repeat', 'sim');
  app.run('saveV1Session()');
  const history = app.json('getHistory()');
  assert.equal(history.length, 1);
  assert.equal(history[0].exercises.length, session.length);
  assert.deepEqual(history[0].exercises[0].sets, Array(3).fill({ load: 12.5, reps: 10 }));
  assert.equal(history[0].difficulty, 'adequado');
  const restored = loadApp({ saved: Object.fromEntries(app.storage) });
  assert.deepEqual(restored.json('getHistory()'), history);
  restored.run('showHistory()');
  assert.ok(restored.elements.get('historyList').innerHTML.includes('12.5 kg'));
});

test('heavy session does not advise increasing the load', () => {
  const app = loadApp();
  const decision = app.json('decideProgress({name:"Supino",sets:[{load:20,reps:12}]},"pesado","")');
  assert.equal(decision.label, '=');
  assert.match(decision.nextHint, /Manter ou reduzir/);
});

test('progression compares the same exercise with its previous performance', () => {
  const app = loadApp({ saved: { nivvo_history: JSON.stringify([
    { exercises: [{ name: 'Supino', sets: [{ load: 20, reps: 12 }] }] }
  ]) } });
  const decision = app.json('decideProgress({name:"Supino",sets:[{load:15,reps:8}]},"adequado","")');
  assert.equal(decision.label, '↓');
});

test('reported discomfort takes priority over progression', () => {
  const app = loadApp();
  const decision = app.json('decideProgress({name:"Supino",sets:[{load:20,reps:12}]},"leve","supino")');
  assert.equal(decision.label, 'Troca');
});

test('exercise replacement preserves group and avoids duplicates', () => {
  const app = loadApp();
  app.run(`state.profile = ${JSON.stringify(profile)}; state.plan = [makeSession(state.profile)]`);
  const original = app.json('state.plan[0][0]');
  app.run('swap(0)');
  const replaced = app.json('state.plan[0]');
  assert.notEqual(replaced[0].name, original.name);
  assert.equal(replaced[0].g, original.g);
  assert.equal(new Set(replaced.map(e => e.name)).size, replaced.length);
});

test('corrupt legacy history has a readable empty fallback', () => {
  const app = loadApp({ saved: { nivvo_history: '{invalid' } });
  assert.deepEqual(app.json('getHistory()'), []);
});

test('a reload restores the existing profile, plan and daily home', () => {
  const saved = {
    treino_auth_demo: JSON.stringify({ label: 'QA', persistent: false }),
    treino_onboarding_done: '1',
    treino_profile: JSON.stringify(profile),
    treino_plan: JSON.stringify([[{ name: 'Supino', g: 'superiores' }]])
  };
  const app = loadApp({ saved });
  app.listeners.load();
  assert.equal(app.elements.get('dailyHome').classList.contains('hidden'), false);
  assert.equal(app.json('currentSession()')[0].name, 'Supino');
});
