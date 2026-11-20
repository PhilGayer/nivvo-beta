// HTTP integration validation; explicitly not a browser E2E substitute.
import {createClient} from '@supabase/supabase-js';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../cloud/config.mjs';
const config=JSON.parse(await readFile('.env.callback-links.json','utf8'));
const staging='https://nivvo-staging.secret-rhea-8953.chatgpt.site/';
const evidence=JSON.parse(await readFile('evidence/auth-redirect-qa.json','utf8'));
evidence.callback_validation=[];
for(const kind of ['callback','recovery']){
 const accountFile=kind==='callback'?'.env.callback.json':'.env.signup.json';const account=JSON.parse(await readFile(accountFile,'utf8'));
 const result=await fetch(config.links[kind],{redirect:'manual'});
 const target=new URL(result.headers.get('location')||staging);
 assert.ok([302,303].includes(result.status));assert.equal(target.origin+target.pathname,staging);
 const hash=new URLSearchParams(target.hash.slice(1));assert.equal(target.searchParams.get('error'),null);assert.equal(hash.get('error'),null);assert.ok(hash.get('access_token'));assert.ok(hash.get('refresh_token'));
 const sb=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await sb.auth.setSession({access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token')});if(error)throw error;assert.equal(data.user.id,account.user_id);
 const profile=await sb.from('profiles').select('id').single();assert.equal(profile.error,null);assert.equal(profile.data.id,account.user_id);
 if(kind==='recovery'){
  const password=crypto.randomUUID()+'Aa1!';const changed=await sb.auth.updateUser({password});if(changed.error)throw changed.error;account.password=password;await writeFile(accountFile,JSON.stringify(account),{mode:0o600});await sb.auth.signOut();const login=await sb.auth.signInWithPassword({email:account.email,password});if(login.error)throw login.error;assert.equal(login.data.user.id,account.user_id);
 }
 await sb.auth.signOut();
 evidence.callback_validation.push({kind,status:'PASS',http_status:result.status,redirect:target.origin+target.pathname,authenticated_user_matches:true,password_changed_and_relogin:kind==='recovery',checked_at:new Date().toISOString()});console.log('PASS '+kind+' callback, authenticated session'+(kind==='recovery'?', password reset and re-login':''));
}
const r=await fetch(staging,{headers:{'OAI-Sites-Authorization':`Bearer ${config.siteAccess}`}});assert.equal(r.status,200);assert.match(await r.text(),/NIVVO.*v1\.1\.0-dev/);
evidence.staging_http={status:'PASS',url:staging,http_status:r.status,method:'Sites supported service access; no browser identity'};
evidence.browser_e2e='PENDING_PRIVATE_SITE_ACCESS';evidence.browser_limit='Supabase dashboard access was reused and URL configuration saved. Browser access to the owner-private Site still reached its ChatGPT sign-in gate. Secure browser request timed out; fresh browser visit remained at that gate. No authenticated browser E2E completion claimed.';
evidence.finished_at=new Date().toISOString();await writeFile('evidence/auth-redirect-qa.json',JSON.stringify(evidence,null,2)+'\n');console.log('PASS published staging HTTP. Browser E2E remains pending.');
