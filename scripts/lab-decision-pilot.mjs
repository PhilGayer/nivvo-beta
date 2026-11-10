// Local evidence of an existing motor decision. No app/API/database changes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { generatePlan, LIB, eligible, requirements } from '../engine/motor.mjs';

const require = createRequire(import.meta.url);
const { profile: baseline } = require('../tests/helpers/legacy-app.cjs');
const motorSource = await readFile(new URL('../engine/motor.mjs', import.meta.url));
const motorHash = createHash('sha256').update(motorSource).digest('hex');
const subject = {
  ...baseline, days: 1, place: 'casa', equipment: ['corpo'],
  user_id: 'SYNTHETIC_OWNER_CANARY',
  email: 'SYNTHETIC_EMAIL_CANARY',
  discomfort_notes: 'SYNTHETIC_HEALTH_CANARY'
};
const plan = generatePlan(subject);
const repeated = generatePlan(subject);
const changedInput = { ...subject, equipment: ['corpo', 'cabo'] };
const revalidated = generatePlan(changedInput);
const rule = plan.decisions.find(d => d.rule === 'equipment_required');
const catalogueRule = plan.decisions.find(d => d.rule === 'available_catalogue');
const candidate = LIB.find(e => e.name === 'Puxada frontal');
assert.ok(rule && catalogueRule && candidate);

// A local receipt identity; not an Auth identity or a production outbox key.
const identity = p => createHash('sha256').update(JSON.stringify({
  case: 'bodyweight-only', motor_sha256: motorHash,
  input: { ...baseline, days: p.days.length, place: p.input.place,
    equipment: p.input.equipment }
})).digest('hex');
const projectDays = p => p.days.map(d => ({
  day: d.index + 1,
  exercises: d.exercises.map(e => ({
    key: e.key, name: e.name, required_equipment: e.requires
  }))
}));

const report = {
  mission: 'CORE3-QG-NIVVO-20261110-R1',
  version: 'v1.1.0-dev',
  executed_at: new Date().toISOString(),
  implementation_author: 'Sol/Matrix — Work NIVVO; no independent specialist execution',
  status: 'PASS_LOCAL',
  scope: 'One synthetic equipment-eligibility decision using the existing shared motor',
  browser_e2e: 'NOT_TESTED_BY_THIS_SCRIPT',
  operational_lab_integration: 'NOT_DEPLOYED_BY_THIS_SCRIPT',
  sources: {
    motor: { path: 'engine/motor.mjs', sha256: motorHash },
    fixture: 'tests/helpers/legacy-app.cjs#profile',
    qg: { url: 'https://docs.google.com/document/d/1XXsuEYu-8mmndKfCw3GbqklbwOC7Amq07RI1XLmsEfo/edit', section: 24 },
    d2: {
      library_file_id: 'libfile_212a1f7844c88191b294b8f88e926ae4',
      sha256: 'c5a3cf2b6b5bc9e5c8c44c802e37232a333dc7bb4b02c896251dbfac2eb40841',
      reuse: 'Provenance, revision, documented reason and review trigger only',
      compatibility: 'Existing DecisionMemory accepts only plutao/lavanderia; not imported or widened'
    },
    planning: {
      url: 'https://docs.google.com/document/d/1uK3A8CRvNpRUq8LXP_45SAILiceXLQ-mfuTvEoVbmi4/edit',
      source_reply: 'doco.7iuXxlivkiV3SVNFnhE8Pg',
      reuse: 'Situation/objective → alternatives/blockers → decision → result/review'
    }
  },
  input: { synthetic: true, modality: 'musculacao', available_equipment: subject.equipment },
  objective: 'Generate a plan compatible with the equipment declared in this synthetic case',
  decision: {
    rule: rule.rule,
    condition: rule.condition,
    action: 'EXCLUDE_INELIGIBLE_BEFORE_SCORING',
    reason: rule.reason,
    discarded_alternative: {
      exercise: candidate.name,
      required_equipment: requirements(candidate, subject.equipment),
      eligible: eligible(candidate, subject.equipment),
      listed_as_excluded_by_motor: rule.decision.excluded.includes(candidate.name)
    },
    unexecuted_alternative: catalogueRule.alternative,
    probability: { status: 'NOT_ESTIMATED', value: null }
  },
  result: {
    generated_days: projectDays(plan),
    workout_performed: false,
    persisted_to_supabase: false
  },
  review_demonstration: {
    trigger: 'Declared equipment changes; recompute using the same motor',
    changed_equipment: changedInput.equipment,
    candidate_eligible_after_change: eligible(candidate, changedInput.equipment),
    candidate_present_after_regeneration: revalidated.days.some(d => d.exercises.some(e => e.name === candidate.name)),
    new_generated_days: projectDays(revalidated),
    ttl_seconds: null,
    ttl_note: 'D2 pilot TTLs are not adopted as NIVVO product rules'
  },
  local_receipt: {
    decision_id: identity(plan),
    repeated_decision_id: identity(repeated),
    changed_input_decision_id: identity(revalidated),
    identity_scope: 'Synthetic local case only; no cross-account or multiwriter guarantee',
    observed_stage: 'LOCAL_MOTOR_EXECUTION',
    d3_status: 'Receipt method evaluated; D3 runtime not connected',
    operational_actions: [],
    private_user_data_exported: false
  },
  limits: [
    'No live account, session, health report or financial record was read.',
    'This demonstration does not prove browser E2E, RLS or an actual completed workout.',
    'No second motor, decision database, cache, cron or global router was created.',
    'The existing motor_decisions and workout_plans.input_snapshot remain the proposed operational source.'
  ]
};

const checks = [];
const check = (name, fn) => { fn(); checks.push({ name, status: 'PASS' }); };
check('missing cable excludes the candidate in the existing motor', () => {
  assert.equal(report.decision.discarded_alternative.eligible, false);
  assert.equal(report.decision.discarded_alternative.listed_as_excluded_by_motor, true);
  assert.ok(plan.days.every(d => d.exercises.every(e => e.name !== candidate.name)));
});
check('every generated exercise uses declared equipment', () => {
  for (const day of plan.days) for (const exercise of day.exercises) {
    assert.ok(exercise.requires.every(required => subject.equipment.includes(required)));
  }
});
check('explanation is copied from the actual motor decision', () => {
  assert.equal(report.decision.reason, rule.reason);
  assert.deepEqual(report.decision.condition, rule.condition);
});
check('same input yields the same plan and local receipt identity', () => {
  assert.deepEqual(plan, repeated);
  assert.equal(identity(plan), identity(repeated));
});
check('changed equipment changes the receipt and regenerates through the same motor', () => {
  assert.notEqual(identity(plan), identity(revalidated));
  assert.equal(report.review_demonstration.candidate_eligible_after_change, true);
  assert.equal(report.review_demonstration.candidate_present_after_regeneration, true);
});
check('export projection excludes synthetic owner/email/health canaries', () => {
  const serialized = JSON.stringify(report);
  for (const marker of [subject.user_id, subject.email, subject.discomfort_notes]) assert.ok(!serialized.includes(marker));
});
const motorAfter = await readFile(new URL('../engine/motor.mjs', import.meta.url));
check('shared motor source remains unchanged', () => {
  assert.equal(createHash('sha256').update(motorAfter).digest('hex'), motorHash);
});
report.validation = { status: 'PASS_LOCAL', checks };
const output = resolve(process.argv[2] || 'evidence/lab-decision-pilot.json');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  status: report.status, checks: checks.length, output,
  decision: candidate.name + ' excluded: cable absent',
  generated_exercises: plan.days[0].exercises.map(e => e.name),
  browser_e2e: report.browser_e2e
}));
