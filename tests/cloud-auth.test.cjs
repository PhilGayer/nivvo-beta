const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCloud, snapshot, response, deferred } = require('./helpers/cloud-app.cjs');

test('account change replaces the loaded identity and never shows the preceding account', async t => {
  const app = await loadCloud(); t.after(app.close);
  assert.match(app.text(), /Sintético A/);
  app.fixture.emit('SIGNED_IN', 'B');
  await app.wait(() => app.text().includes('Sintético B'), 'new account B');
  assert.doesNotMatch(app.text(), /Sintético A/);
  app.click('profile');
  await app.wait(() => app.q('#profileForm'));
  assert.equal(app.q('#display_name').value, 'Sintético B');
});

test('same-account sign-in event preserves an unsaved profile', async t => {
  const app = await loadCloud(); t.after(app.close);
  app.click('profile'); await app.wait(() => app.q('#profileForm'));
  app.q('#display_name').value = 'Rascunho sintético';
  app.fixture.emit('SIGNED_IN', 'A');
  app.fixture.emit('TOKEN_REFRESHED', 'A');
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(app.q('#display_name').value, 'Rascunho sintético');
  assert.equal(app.calls.length, 1);
});

test('expired session clears the private screen and preserves the owner-scoped retry queue', async t => {
  const key = 'nivvo:outbox:A';
  const pending = JSON.stringify([{ user_id: 'A', action: 'save', write_id: 'synthetic-write', sets: [] }]);
  const app = await loadCloud({ saved: { [key]: pending } }); t.after(app.close);
  app.fixture.expire(); app.click('history');
  await app.wait(() => app.q('#loginForm'), 'expired session login');
  assert.doesNotMatch(app.text(), /Sintético A/);
  assert.match(app.q('#cloudStatus').textContent, /Entre novamente/);
  assert.equal(app.window.localStorage.getItem(key), pending);
  assert.equal(app.calls.length, 1, 'expired credentials must not reach the training API');
});

test('failed sign-out never reports successful logout while Auth retains the session', async t => {
  const app = await loadCloud(); t.after(app.close);
  app.fixture.signOutError = new Error('Failed to fetch');
  app.click('logout');
  await app.wait(() => /Conexão indisponível/.test(app.q('#cloudStatus').textContent));
  assert.equal(app.fixture.sessionOwner(), 'A');
  assert.doesNotMatch(app.q('#cloudStatus').textContent, /Você saiu/);
  assert.ok(app.q('[data-action="logout"]'));
});

test('late response from A cannot replace B after an account change during a request', async t => {
  const app = await loadCloud(); t.after(app.close);
  const late = deferred();
  app.fixture.intercept = call => call.owner === 'A' ? late.promise : null;
  app.click('history'); await app.wait(() => app.calls.length === 2);
  app.fixture.emit('SIGNED_IN', 'B');
  await app.wait(() => app.text().includes('Sintético B'), 'new account during A request');
  app.click('profile'); await app.wait(() => app.q('#profileForm'), 'B can navigate while A request is pending');
  assert.equal(app.q('#display_name').value, 'Sintético B');
  late.resolve(response({ data: snapshot('A') }));
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(app.q('#display_name').value, 'Sintético B');
  assert.doesNotMatch(app.text(), /Sintético A/);
  assert.doesNotMatch(app.q('#cloudStatus').textContent, /Cannot|TypeError/);
});

test('server rejection of an ended session returns to login without deleting local drafts', async t => {
  const key = 'nivvo:draft:A:synthetic-session';
  const app = await loadCloud({ saved: { [key]: 'private synthetic draft' } }); t.after(app.close);
  app.fixture.intercept = () => response({ message: 'Invalid JWT' }, 401);
  app.click('history');
  await app.wait(() => app.q('#loginForm'), 'server revoked session');
  assert.equal(app.window.localStorage.getItem(key), 'private synthetic draft');
  assert.match(app.q('#cloudStatus').textContent, /Entre novamente/);
});

test('sign-out error is reported even when the SDK has already removed the local session', async t => {
  const app = await loadCloud(); t.after(app.close);
  app.fixture.signOutError = new Error('Failed to fetch');
  app.fixture.signOutClearsOnError = true; // Current pinned auth-js behavior.
  app.click('logout');
  await app.wait(() => app.q('#loginForm') && /Conexão indisponível/.test(app.q('#cloudStatus').textContent));
  assert.equal(app.fixture.sessionOwner(), undefined);
  assert.doesNotMatch(app.q('#cloudStatus').textContent, /Você saiu/);
});

test('late network rejection from A cannot report an error in B', async t => {
  const app = await loadCloud(); t.after(app.close);
  const late = deferred();
  app.fixture.intercept = call => call.owner === 'A' ? late.promise : null;
  app.click('history'); await app.wait(() => app.calls.length === 2);
  app.fixture.emit('SIGNED_IN', 'B');
  await app.wait(() => app.text().includes('Sintético B'));
  late.reject(new TypeError('Failed to fetch'));
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.match(app.text(), /Sintético B/);
  assert.equal(app.q('#cloudStatus').textContent, 'Dados sincronizados com sua conta.');
});

test('a pending sign-in notification cannot resurrect an account after sign-out', async t => {
  const app = await loadCloud(); t.after(app.close);
  app.fixture.emit('SIGNED_IN', 'B');
  app.fixture.emit('SIGNED_OUT', null);
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.ok(app.q('#loginForm'));
  assert.doesNotMatch(app.text(), /Sintético A|Sintético B/);
  assert.equal(app.calls.length, 1);
});

test('a changed Auth identity without its notification cannot authorize A operations with B credentials', async t => {
  const app = await loadCloud(); t.after(app.close);
  app.fixture.switchWithoutNotification('B'); app.click('history');
  await app.wait(() => app.q('#loginForm'));
  assert.equal(app.calls.length, 1, 'no B token sent for an A screen');
  assert.doesNotMatch(app.text(), /Sintético A|Sintético B/);
});

function started(owner) {
  const data = snapshot(owner);
  data.workout_plans = [{ id: `plan-${owner}`, status: 'active' }];
  data.workout_sessions = [{ id: `session-${owner}`, plan_id: `plan-${owner}`, status: 'started', day_index: 0, revision: 0 }];
  data.session_exercises = [{ id: `exercise-${owner}`, session_id: `session-${owner}`, exercise_name: 'Movimento sintético', position: 0, target_sets: 1, rep_min: 8, rep_max: 12 }];
  return data;
}
async function enterSets(app) {
  app.click('start'); await app.wait(() => app.q('#setsForm'));
  for (const [selector, value] of [['[data-load]', '0'], ['[data-reps]', '12']]) {
    app.q(selector).value = value;
    app.q(selector).dispatchEvent(new app.window.Event('input', { bubbles: true }));
  }
}

test('Auth rejection preserves sets, completion feedback and write identity for the same account to retry', async t => {
  const app = await loadCloud({ records: { A: started('A') } }); t.after(app.close);
  await enterSets(app); app.click('feedback'); await app.wait(() => app.q('#feedbackForm'));
  app.fixture.intercept = call => call.action === 'save' ? response({ error: 'AUTH_REQUIRED' }, 401) : null;
  app.q('#feedbackForm button[type="submit"]').click();
  await app.wait(() => app.q('#loginForm'));
  const key = 'nivvo:outbox:A';
  const queued = JSON.parse(app.window.localStorage.getItem(key));
  assert.equal(queued.length, 1); assert.ok(queued[0].write_id);
  assert.equal(queued[0].sets[0].reps, 12);
  assert.equal(queued[0].feedback.difficulty, 'adequado');
  assert.equal(queued[0].feedback.pain, false);
  app.fixture.emit('SIGNED_IN', 'A');
  await app.wait(() => app.q('[data-action="retry"]'));
  assert.deepEqual(JSON.parse(app.window.localStorage.getItem(key)), queued);
});

test('in-flight A write cannot remove the retry queues or display private data after B signs in', async t => {
  const bKey = 'nivvo:outbox:B', aKey = 'nivvo:outbox:A';
  const bQueue = JSON.stringify([{ user_id: 'B', action: 'save', write_id: 'B-pending', sets: [] }]);
  const app = await loadCloud({ records: { A: started('A') }, saved: { [bKey]: bQueue } }); t.after(app.close);
  await enterSets(app);
  const late = deferred();
  app.fixture.intercept = call => call.action === 'save' ? late.promise : null;
  app.q('#setsForm button[type="submit"]').click();
  await app.wait(() => app.calls.some(call => call.action === 'save'));
  const aQueue = app.window.localStorage.getItem(aKey);
  app.fixture.emit('SIGNED_IN', 'B'); await app.wait(() => app.text().includes('Sintético B'));
  late.resolve(response({ revision: 1 })); await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(app.window.localStorage.getItem(aKey), aQueue);
  assert.equal(app.window.localStorage.getItem(bKey), bQueue);
  assert.match(app.text(), /Sintético B/);
  assert.doesNotMatch(app.text(), /Sintético A|Movimento sintético/);
  assert.equal(app.calls.filter(call => call.action === 'save').length, 1);
});

test('successful logout clears the private screen and retains only the owner-scoped retry data', async t => {
  const key = 'nivvo:outbox:A', pending = JSON.stringify([{ user_id: 'A', write_id: 'retry-A' }]);
  const app = await loadCloud({ saved: { [key]: pending } }); t.after(app.close);
  app.click('logout'); await app.wait(() => app.q('#loginForm') && app.q('#cloudStatus').textContent === 'Você saiu da conta.');
  assert.equal(app.fixture.sessionOwner(), undefined);
  assert.equal(app.q('#cloudStatus').textContent, 'Você saiu da conta.');
  assert.equal(app.window.localStorage.getItem(key), pending);
  assert.equal(app.q('#cloudNav').textContent, '');
});

test('password recovery displays its own screen with previous private data cleared', async t => {
  const app = await loadCloud(); t.after(app.close);
  app.fixture.emit('PASSWORD_RECOVERY', 'B');
  await app.wait(() => app.q('#passwordForm'));
  assert.doesNotMatch(app.text(), /Sintético A/);
  assert.equal(app.q('#cloudNav').textContent, '');
  assert.equal(app.q('#newPassword').minLength, 10);
});

test('sign-out cancels a pending password-recovery screen', async t => {
  const app = await loadCloud(); t.after(app.close);
  app.fixture.emit('PASSWORD_RECOVERY', 'A'); app.fixture.emit('SIGNED_OUT', null);
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.ok(app.q('#loginForm')); assert.equal(app.q('#passwordForm'), null);
});

test('an incomplete profile opens onboarding and missing consent cannot submit training data', async t => {
  const data = snapshot('A'); data.preferences = [];
  const app = await loadCloud({ records: { A: data } }); t.after(app.close);
  assert.ok(app.q('#profileForm'));
  assert.equal(app.q('input[name="consent"]').checked, false);
  app.q('#profileForm button[type="submit"]').click();
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(app.calls.length, 1, 'incomplete required fields never reach the API');
  assert.ok(app.q('#profileForm'));
});
