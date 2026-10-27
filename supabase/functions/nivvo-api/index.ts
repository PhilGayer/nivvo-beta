import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { generatePlan, decideProgress } from './motor.mjs';

const url = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
const uuid = (s:unknown) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const response = (body:unknown,status=200) => new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
function need(condition:unknown,code:string){if(!condition) throw new Error(code);}
function unwrap({data,error}:any){if(error) throw new Error(error.message);return data;}
async function snapshot(client:any,uid:string){
 const tables=['profiles','preferences','entitlements','user_modalities','user_equipment','workout_plans','plan_exercises','workout_sessions','session_exercises','exercise_sets','feedback','discomfort_reports','progression_state','motor_decisions','consent_records'];
 const result:any={};
 await Promise.all(tables.map(async table=>{result[table]=unwrap(await client.from(table).select('*').eq(table==='profiles'?'id':'user_id',uid));}));
 return result;
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS') return new Response(null,{headers:cors});
 if(req.method!=='POST') return response({error:'METHOD_NOT_ALLOWED'},405);
 try{
  const token=(req.headers.get('Authorization')||'').replace(/^Bearer /,'');
  const {data:{user},error}=await admin.auth.getUser(token);
  if(error||!user) return response({error:'AUTH_REQUIRED'},401);
  const uid=user.id;
  const client=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
  const raw=await req.text();need(raw.length<128000,'PAYLOAD_TOO_LARGE');
  const body=JSON.parse(raw);need(!('user_id' in body)&&!('p_user_id' in body),'OWNER_OVERRIDE_FORBIDDEN');
  switch(body.action){
   case 'snapshot':return response({data:await snapshot(client,uid)});
   case 'profile':{
    const p=body.profile||{};const pref=body.preferences||{};
    need(typeof p.display_name==='string'&&p.display_name.trim().length>=1&&p.display_name.length<=80,'INVALID_NAME');
    need(Number.isInteger(p.age)&&p.age>=18&&p.age<=100,'INVALID_AGE');
    need(body.consent===true,'TRAINING_CONSENT_REQUIRED');
    need(Array.isArray(body.equipment)&&body.equipment.length>0,'EQUIPMENT_REQUIRED');
    need(body.modality===undefined||body.modality==='musculacao','MODALITY_NOT_ENABLED');
    unwrap(await admin.rpc('nivvo_save_profile',{p_user_id:uid,p_profile:{display_name:p.display_name.trim(),age:p.age},p_preferences:pref,p_equipment:body.equipment,p_consent:true}));
    return response({ok:true});
   }
   case 'plan':{
    need(uuid(body.request_id),'INVALID_REQUEST_ID');
    const data=await snapshot(client,uid);
    const p=data.profiles[0];const pref=data.preferences[0];need(p&&pref,'PROFILE_REQUIRED');
    const profile={...pref,age:p.age,equipment:data.user_equipment.map((x:any)=>x.equipment_code),plan:data.entitlements[0]?.tier==='plus'?'plus':'base',discomfort:'nenhuma',avoid:''};
    const discomfort=data.discomfort_reports.map((d:any)=>({pain:true,exercise:data.session_exercises.find((e:any)=>e.id===d.session_exercise_id)?.exercise_name}));
    const payload=generatePlan(profile,discomfort,data.workout_sessions.filter((s:any)=>s.status==='completed').length);
    const id=unwrap(await admin.rpc('nivvo_create_plan',{p_user_id:uid,p_request_id:body.request_id,p_payload:payload}));
    return response({id});
   }
   case 'start':{
    need(uuid(body.plan_id)&&uuid(body.request_id),'INVALID_REQUEST_ID');
    // Check ownership BEFORE idempotent/active-session shortcut in the existing RPC.
    const plan=unwrap(await client.from('workout_plans').select('id,status').eq('id',body.plan_id).maybeSingle());
    need(plan&&plan.status==='active','PLAN_NOT_FOUND');
    const id=unwrap(await admin.rpc('nivvo_start_session',{p_user_id:uid,p_plan_id:body.plan_id,p_request_id:body.request_id}));
    return response({id});
   }
   case 'save':{
    need(uuid(body.session_id)&&uuid(body.write_id)&&Number.isInteger(body.revision)&&body.revision>=0,'INVALID_WRITE');
    need(Array.isArray(body.sets)&&body.sets.length<=200,'INVALID_SETS');
    for(const s of body.sets){need(uuid(s.session_exercise_id)&&Number.isInteger(s.set_number)&&s.set_number>=1&&s.set_number<=20&&Number.isFinite(s.load_kg)&&s.load_kg>=0&&s.load_kg<=99999&&Number.isInteger(s.reps)&&s.reps>=0&&s.reps<=200,'INVALID_SET');}
    const data=await snapshot(client,uid);const session=data.workout_sessions.find((s:any)=>s.id===body.session_id);need(session,'SESSION_NOT_FOUND');
    const exercises=data.session_exercises.filter((e:any)=>e.session_id===session.id);
    for(const s of body.sets) need(exercises.some((e:any)=>e.id===s.session_exercise_id),'EXERCISE_NOT_OWNED');
    const feedback=body.feedback??null;
    let progress:any[]=[];
    if(feedback!==null){
     need(['leve','adequado','pesado'].includes(feedback.difficulty)&&['sim','talvez','nao'].includes(feedback.repeat_intent)&&typeof feedback.pain==='boolean','INVALID_FEEDBACK');
     if(feedback.pain){need(feedback.consent===true,'DISCOMFORT_CONSENT_REQUIRED');need(!feedback.pain_exercise_id||exercises.some((e:any)=>e.id===feedback.pain_exercise_id),'EXERCISE_NOT_OWNED');}
     const completed=data.workout_sessions.filter((s:any)=>s.status==='completed'&&s.id!==session.id).sort((a:any,b:any)=>b.completed_at.localeCompare(a.completed_at));
     progress=exercises.map((ex:any)=>{
      const merged=data.exercise_sets.filter((s:any)=>s.session_exercise_id===ex.id).map((s:any)=>({...s}));
      for(const s of body.sets.filter((s:any)=>s.session_exercise_id===ex.id)){const i=merged.findIndex((x:any)=>x.set_number===s.set_number);if(i>=0) merged[i]=s;else merged.push(s);}
      let previous=null;
      for(const prior of completed){const pe=data.session_exercises.find((e:any)=>e.session_id===prior.id&&e.exercise_key===ex.exercise_key);if(!pe)continue;const ps=data.exercise_sets.filter((s:any)=>s.session_exercise_id===pe.id&&s.reps>0);if(ps.length) previous={avgLoad:ps.reduce((a:number,b:any)=>a+Number(b.load_kg),0)/ps.length,avgReps:ps.reduce((a:number,b:any)=>a+b.reps,0)/ps.length};break;}
      // If discomfort is unspecified, do not suggest progression for any exercise.
      const pain=feedback.pain&&(!feedback.pain_exercise_id||feedback.pain_exercise_id===ex.id)?ex.exercise_name:'';
      const d=decideProgress({name:ex.exercise_name,sets:merged.map((s:any)=>({load:Number(s.load_kg),reps:s.reps}))},feedback.difficulty,pain,previous);
      return {exercise_key:ex.exercise_key,next_hint:d.nextHint,label:d.label};
     });
    }
    const revision=unwrap(await admin.rpc('nivvo_save_session',{p_user_id:uid,p_session_id:body.session_id,p_revision:body.revision,p_write_id:body.write_id,p_sets:body.sets,p_feedback:feedback,p_progress:progress}));
    return response({revision});
   }
   case 'delete_account':{
    need(body.confirmation==='EXCLUIR','CONFIRMATION_REQUIRED');
    // Auth Admin deletion cascades to NIVVO tables; no secrets leave this runtime.
    unwrap(await admin.auth.admin.deleteUser(uid));return response({ok:true});
   }
   default:return response({error:'UNKNOWN_ACTION'},400);
  }
 }catch(e){
  const message=e instanceof Error?e.message:'INTERNAL_ERROR';
  const allowed=message.match(/(?:[A-Z][A-Z_]{3,})/)?.[0]||'REQUEST_FAILED';
  const status=allowed==='REVISION_CONFLICT'?409:allowed.endsWith('NOT_FOUND')?404:400;
  return response({error:allowed},status);
 }
});
