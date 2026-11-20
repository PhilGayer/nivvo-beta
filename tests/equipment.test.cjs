const test=require('node:test');const assert=require('node:assert/strict');
const {loadApp,profile}=require('./helpers/legacy-app.cjs');
const motor=import('../engine/motor.mjs');
test('bodyweight-only fixture excludes cable, machine, barbell, dumbbell and bench requirements',async()=>{
 const {generatePlan,LIB,eligible}=await motor;const p={...profile,place:'predio',equipment:['corpo']};const plan=generatePlan(p);
 for(const day of plan.days){assert.ok(day.exercises.length>0);assert.equal(new Set(day.exercises.map(x=>x.key)).size,day.exercises.length);for(const ex of day.exercises){assert.ok(ex.requires.every(x=>p.equipment.includes(x)),ex.name);assert.ok(eligible(LIB.find(x=>x.name===ex.name),p.equipment));}}
 assert.ok(plan.decisions.find(x=>x.rule==='equipment_required').decision.excluded.includes('Puxada frontal'));
 const app=loadApp();app.run(`state.profile=${JSON.stringify(p)};state.plan=[makeSession(state.profile)]`);assert.ok(app.json('currentSession()').every(x=>!['maquina','cabo','barra','halter'].includes(x.equip)));
});
test('single leg press does not unlock other machines or Smith',async()=>{
 const {generatePlan}=await motor;const plan=generatePlan({...profile,equipment:['corpo','legpress']});const names=plan.days.flatMap(d=>d.exercises.map(e=>e.name));assert.ok(names.includes('Leg press'));assert.ok(!names.includes('Hack squat'));assert.ok(!names.includes('Cadeira extensora'));
});
test('bench and dumbbells both required for dumbbell bench press',async()=>{
 const {eligible,LIB}=await motor;const ex=LIB.find(e=>e.name==='Supino halteres');assert.equal(eligible(ex,['halter']),false);assert.equal(eligible(ex,['halter','banco']),true);
});
test('shared strength motor retains baseline output with complete equipment',async()=>{
 const {makeSession}=await motor;const app=loadApp();assert.deepEqual(makeSession(profile).map(x=>x.name),app.json(`makeSession(${JSON.stringify(profile)}).map(x=>x.name)`));
});
test('shared progression prioritizes discomfort and heavy feedback',async()=>{
 const {decideProgress}=await motor;const ex={name:'Flexão',sets:[{load:0,reps:12}]};assert.equal(decideProgress(ex,'leve','Flexão').label,'Troca');assert.equal(decideProgress(ex,'pesado','').label,'=');
});
test('swaps also enforce equipment eligibility and no duplicates',()=>{
 const p={...profile,equipment:['corpo'],place:'casa'};const app=loadApp();app.run(`state.profile=${JSON.stringify(p)};state.plan=[makeSession(state.profile)]`);app.run('swap(0)');const ex=app.json('state.plan[0]');assert.ok(ex.every(x=>x.equip==='corpo'));assert.equal(ex.length,new Set(ex.map(x=>x.name)).size);
});
test('offline outbox is isolated by user and preserves idempotent write ids',async()=>{
 const {Outbox}=await import('../cloud/outbox.mjs');const m=new Map();const storage={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};const a=new Outbox(storage,'A'),b=new Outbox(storage,'B');a.put({write_id:'1',sets:[{reps:10}]});a.put({write_id:'1',sets:[{reps:12}]});assert.equal(a.read().length,1);assert.equal(a.read()[0].sets[0].reps,12);assert.deepEqual(b.read(),[]);a.drop('1');assert.deepEqual(a.read(),[]);
});
