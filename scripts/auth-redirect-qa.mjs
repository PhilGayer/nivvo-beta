// Targeted check after URL configuration. Does not reapply schema or rerun prior QA.
import {createClient} from '@supabase/supabase-js';
import {readFile,writeFile} from 'node:fs/promises';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../cloud/config.mjs';
const staging='https://nivvo-staging.secret-rhea-8953.chatgpt.site/';
const sb=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const existing=JSON.parse(await readFile('.env.signup.json','utf8'));
let callback;
try { callback=JSON.parse(await readFile('.env.callback.json','utf8')); } catch(e) { if(e.code!=='ENOENT')throw e; }
if(callback){
 const resend=await sb.auth.resend({type:'signup',email:callback.email,options:{emailRedirectTo:staging}});if(resend.error)throw resend.error;
}else{
 callback={email:'lippegayer+nivvo-callback-'+Date.now()+'@gmail.com',password:crypto.randomUUID()+'Aa1!'};
 const signup=await sb.auth.signUp({email:callback.email,password:callback.password,options:{emailRedirectTo:staging,data:{display_name:'NIVVO QA Callback'}}});
 if(signup.error)throw signup.error;callback.user_id=signup.data.user.id;
}
await writeFile('.env.callback.json',JSON.stringify(callback),{mode:0o600});
const recovery=await sb.auth.resetPasswordForEmail(existing.email,{redirectTo:staging});if(recovery.error)throw recovery.error;
await writeFile('evidence/auth-redirect-qa.json',JSON.stringify({project:'alktccwzyyytvrzpwvjj',staging,checked_at:new Date().toISOString(),configuration:{site_url:staging,redirect_urls:[staging],source:'Authenticated Supabase dashboard'},checks:[{name:'Targeted signup requested with live staging callback',status:'PASS',user_id:callback.user_id},{name:'Recovery requested for existing QA account with live staging callback',status:'PASS'}],browser_e2e:'PENDING'},null,2)+'\n');
console.log(JSON.stringify({signupRequested:true,recoveryRequested:true,callback_user:callback.user_id}));
