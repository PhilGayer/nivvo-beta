// Integration test: the real frontend handlers + a simulated DOM + real Auth/API.
// This is explicitly not a signed-in browser E2E test.
import {JSDOM} from 'jsdom';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../cloud/config.mjs';
const signup=JSON.parse(await readFile('.env.signup.json','utf8'));
const secondary=JSON.parse(await readFile('.env.qa.json','utf8')).users[1];
const html=await readFile('dist/index.html','utf8');const evidence={kind:'Real cloud + frontend handlers, simulated DOM',version:'1.1.0-dev',checks:[],started_at:new Date().toISOString()};
let dom,epoch=0,failNextSave=false;const nativeFetch=globalThis.fetch;
globalThis.fetch=async(...args)=>{if(failNextSave&&typeof args[1]?.body==='string'&&JSON.parse(args[1].body).action==='save'){failNextSave=false;throw new TypeError('Failed to fetch');}return nativeFetch(...args);};
async function report(){evidence.finished_at=new Date().toISOString();evidence.passed=evidence.checks.filter(x=>x.status==='PASS').length;evidence.failed=evidence.checks.filter(x=>x.status==='FAIL').length;await writeFile('evidence/ui-cloud-qa.json',JSON.stringify(evidence,null,2)+'\n');}
async function wait(fn,description){const start=Date.now();while(Date.now()-start<60000){if(fn())return;await new Promise(r=>setTimeout(r,100));}throw new Error('Timeout '+description+'; status='+dom.window.document.getElementById('cloudStatus')?.textContent);}
async function check(name,fn){try{await fn();evidence.checks.push({name,status:'PASS'});console.log('PASS '+name);}catch(e){evidence.checks.push({name,status:'FAIL',error:e.message});await report();throw e;}}
const q=selector=>dom.window.document.querySelector(selector);
const click=selector=>{const el=q(selector);assert.ok(el,selector);el.click();};
function set(id,value){const el=q('#'+id);assert.ok(el,id);el.value=String(value);el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));}
async function boot(saved={}){
 dom=new JSDOM(html,{url:'https://nivvo-ui-qa.test/',pretendToBeVisual:true,runScripts:'outside-only'});dom.window.scrollTo=()=>{};
 for(const [k,v]of Object.entries(saved))dom.window.localStorage.setItem(k,v);
 for(const key of ['window','document','navigator','localStorage','location','history','FormData','HTMLElement'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
 await import('../cloud/app.mjs?qa='+ ++epoch);
}
function storage(){return Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>{const k=localStorage.key(i);return [k,localStorage.getItem(k)];}));}
async function login(credentials){set('email',credentials.email);set('password',credentials.password);click('#loginForm button[type=submit]');await wait(()=>q('#profileForm')||q('[data-action=start]'),'frontend login');}
await check('frontend login uses real Supabase Auth',async()=>{
 await boot();const {createClient}=await import('@supabase/supabase-js');const fixture=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,storageKey:'nivvo-qa-fixture'}});
 const auth=await fixture.auth.signInWithPassword({email:signup.email,password:signup.password});if(auth.error)throw auth.error;
 const call=async body=>{const r=await nativeFetch(`${SUPABASE_URL}/functions/v1/nivvo-api`,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth.data.session.access_token}`},body:JSON.stringify(body)});const j=await r.json();if(!r.ok)throw new Error(j.error);return j;};
 const snap=(await call({action:'snapshot'})).data;for(const session of snap.workout_sessions.filter(s=>s.status==='started')){const ex=snap.session_exercises.find(e=>e.session_id===session.id);await call({action:'save',session_id:session.id,revision:session.revision,write_id:crypto.randomUUID(),sets:[{session_exercise_id:ex.id,set_number:1,load_kg:0,reps:10}],feedback:{difficulty:'adequado',repeat_intent:'sim',pain:false}});}
 await fixture.auth.signOut();await login(signup);if(!q('#profileForm'))click('[data-action=profile]');assert.ok(q('#profileForm'));
});
await check('frontend profile, equipment and plan saved in cloud',async()=>{set('display_name','QA UI');set('age',30);const consent=q('input[name=consent]');consent.checked=true;click('#profileForm button[type=submit]');await wait(()=>q('[data-action=start]'),'profile and plan');assert.match(q('main').textContent,/QA UI/);});
await check('Laboratory shows persisted inputs and real rules',async()=>{click('[data-action=lab]');await wait(()=>q('main').textContent.includes('equipment_required'),'lab');assert.match(q('main').textContent,/Peso corporal/);assert.match(q('main').textContent,/Plano gerado/);click('[data-action=home]');});
await check('session starts, sets and user-scoped offline draft are captured',async()=>{click('[data-action=start]');await wait(()=>q('#setsForm'),'start session');const inputs=[...dom.window.document.querySelectorAll('[data-reps]')];for(const el of inputs){el.value='12';el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));}for(const el of dom.window.document.querySelectorAll('[data-load]')){el.value='0';el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));}assert.ok(Object.keys(storage()).some(k=>k.startsWith('nivvo:draft:'+signup.user_id+':')));});
await check('network failure keeps outbox and idempotent write for retry',async()=>{failNextSave=true;click('#setsForm button[type=submit]');await wait(()=>q('[data-action=retry]'),'offline retry');const key='nivvo:outbox:'+signup.user_id;const pending=JSON.parse(localStorage.getItem(key));assert.equal(pending.length,1);assert.ok(pending[0].write_id);assert.equal(pending[0].sets[0].reps,12);});
await check('reload restores persistent Auth, pending outbox and active session',async()=>{const saved=storage();await boot(saved);await wait(()=>q('[data-action=retry]'),'restore pending outbox');assert.ok(q('[data-action=retry]'));click('[data-action=retry]');await wait(()=>q('#cloudStatus').textContent==='Envios sincronizados com a nuvem.','retry flush');assert.deepEqual(JSON.parse(localStorage.getItem('nivvo:outbox:'+signup.user_id)),[]);click('[data-action=start]');await wait(()=>q('#setsForm'),'resume');assert.equal(q('[data-reps]').value,'12');});
await check('frontend feedback persists completion and history',async()=>{click('[data-action=feedback]');await wait(()=>q('#feedbackForm'),'feedback form');click('#feedbackForm button[type=submit]');await wait(()=>q('#cloudStatus').textContent==='Treino concluído e salvo na nuvem.','finish');click('[data-action=history]');await wait(()=>q('h2')?.textContent==='Seu histórico','history');assert.match(q('main').textContent,/0 kg × 12/);});
await check('logout and a different login do not leak prior account data',async()=>{click('[data-action=logout]');await wait(()=>q('#loginForm'),'logout');await login(secondary);assert.doesNotMatch(q('main').textContent,/QA UI/);assert.match(q('main').textContent,/QA B/);click('[data-action=logout]');await wait(()=>q('#loginForm'),'secondary logout');});
await check('subsequent frontend login fully restores cloud history',async()=>{await login(signup);assert.match(q('main').textContent,/QA UI/);click('[data-action=history]');await wait(()=>q('h2')?.textContent==='Seu histórico'&&q('main').textContent.includes('0 kg × 12'),'restored history');});
await check('direct cloud read proves profile, plan, session, sets and feedback',async()=>{const {createClient}=await import('@supabase/supabase-js');const sb=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,storageKey:'nivvo-qa-verifier'}});const {error}=await sb.auth.signInWithPassword({email:signup.email,password:signup.password});assert.equal(error,null);for(const table of ['profiles','preferences','workout_plans','workout_sessions','exercise_sets','feedback']){const {data,error}=await sb.from(table).select('*');assert.equal(error,null);assert.ok(data.length>0,table);}await sb.auth.signOut();});
click('[data-action=logout]');await wait(()=>q('#loginForm'),'final logout');await report();console.log(JSON.stringify({passed:evidence.passed,failed:evidence.failed}));process.exit(0);
