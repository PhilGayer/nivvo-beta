-- NIVVO 1.1.0-dev; dedicated project alktccwzyyytvrzpwvjj.
create schema if not exists nivvo_private;
revoke all on schema nivvo_private from public,anon,authenticated;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Atleta' check(char_length(display_name) between 1 and 80),
 age int check(age between 18 and 100), created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.preferences (user_id uuid primary key references public.profiles(id) on delete cascade,goal text not null check(goal in ('hipertrofia','forca','condicionamento')),level text not null check(level in ('iniciante','intermediario','avancado')),days int not null check(days between 1 and 7),minutes int not null check(minutes between 15 and 120),priority text not null check(priority in ('equilibrado','inferiores','superiores')),style text not null check(style in ('equilibrado','rapido','intenso')),place text not null check(place in ('academia','predio','casa')),updated_at timestamptz not null default now());
create table public.modalities (code text primary key,name text not null,engine_enabled boolean not null default false);
create table public.equipment (code text primary key,name text not null);
create table public.entitlements (user_id uuid primary key references public.profiles(id) on delete cascade,tier text not null default 'free' check(tier in ('free','plus')),status text not null default 'baseline' check(status in ('baseline','active','expired','cancelled')),provider text,started_at timestamptz not null default now(),expires_at timestamptz);
create table public.user_modalities (user_id uuid not null references public.profiles(id) on delete cascade,modality_code text not null references public.modalities(code),is_primary boolean not null default true,active boolean not null default true,primary key(user_id,modality_code));
create table public.user_equipment (user_id uuid not null references public.profiles(id) on delete cascade,equipment_code text not null references public.equipment(code),primary key(user_id,equipment_code));
create table public.workout_plans (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,request_id uuid not null,modality_code text not null references public.modalities(code),status text not null default 'active' check(status in ('active','archived')),app_version text not null default '1.1.0-dev',input_snapshot jsonb not null,created_at timestamptz not null default now(),unique(id,user_id),unique(user_id,request_id));
create table public.plan_exercises (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,plan_id uuid not null,day_index int not null check(day_index between 0 and 6),position int not null check(position between 0 and 19),exercise_key text not null,exercise_name text not null,muscle_group text not null check(muscle_group in ('inferiores','superiores','core')),required_equipment jsonb not null default '[]',target_sets int not null default 3 check(target_sets between 1 and 10),rep_min int not null default 8,rep_max int not null default 12,unique(id,user_id),unique(plan_id,day_index,position),foreign key(plan_id,user_id) references public.workout_plans(id,user_id) on delete cascade);
create table public.workout_sessions (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,plan_id uuid not null,request_id uuid not null,day_index int not null check(day_index between 0 and 6),status text not null default 'started' check(status in ('started','completed')),revision int not null default 0,last_write_id uuid,started_at timestamptz not null default now(),completed_at timestamptz,unique(id,user_id),unique(user_id,request_id),foreign key(plan_id,user_id) references public.workout_plans(id,user_id) on delete cascade);
create table public.session_exercises (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,session_id uuid not null,plan_exercise_id uuid not null,position int not null,exercise_key text not null,exercise_name text not null,target_sets int not null,rep_min int not null,rep_max int not null,unique(id,user_id),unique(session_id,position),foreign key(session_id,user_id) references public.workout_sessions(id,user_id) on delete cascade,foreign key(plan_exercise_id,user_id) references public.plan_exercises(id,user_id) on delete cascade);
create table public.exercise_sets (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,session_exercise_id uuid not null,set_number int not null check(set_number between 1 and 20),load_kg numeric(8,2) not null default 0 check(load_kg between 0 and 99999),reps int not null default 0 check(reps between 0 and 200),updated_at timestamptz not null default now(),unique(session_exercise_id,set_number),foreign key(session_exercise_id,user_id) references public.session_exercises(id,user_id) on delete cascade);
create table public.feedback (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,session_id uuid not null unique,difficulty text not null check(difficulty in ('leve','adequado','pesado')),repeat_intent text not null check(repeat_intent in ('sim','talvez','nao')),created_at timestamptz not null default now(),foreign key(session_id,user_id) references public.workout_sessions(id,user_id) on delete cascade);
create table public.discomfort_reports (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,session_id uuid not null unique,session_exercise_id uuid,created_at timestamptz not null default now(),foreign key(session_id,user_id) references public.workout_sessions(id,user_id) on delete cascade,foreign key(session_exercise_id,user_id) references public.session_exercises(id,user_id) on delete cascade);
create table public.progression_state (user_id uuid not null references public.profiles(id) on delete cascade,exercise_key text not null,last_session_id uuid not null,next_hint text not null,label text not null,updated_at timestamptz not null default now(),primary key(user_id,exercise_key),foreign key(last_session_id,user_id) references public.workout_sessions(id,user_id) on delete cascade);
create table public.motor_decisions (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,plan_id uuid not null,rule_code text not null,condition jsonb not null,decision jsonb not null,reason text not null,alternative jsonb,source text not null default 'nivvo-api/1.1.0-dev',created_at timestamptz not null default now(),foreign key(plan_id,user_id) references public.workout_plans(id,user_id) on delete cascade);
create table public.consent_records (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,purpose text not null check(purpose in ('staging_training','discomfort_storage')),document_version text not null default 'staging-2026-10-23',granted boolean not null,created_at timestamptz not null default now());
insert into public.modalities values('musculacao','Musculação',true);
insert into public.equipment values('corpo','Peso corporal'),('halter','Halteres'),('barra','Barras e anilhas'),('banco','Banco'),('cabo','Polias / cabos'),('maquina','Conjunto completo de máquinas'),('legpress','Somente Leg press'),('smith','Smith'),('elastico','Elásticos'),('colchonete','Colchonete'),('esteira','Esteira / bicicleta');
create unique index user_modalities_one_primary on public.user_modalities(user_id) where active and is_primary;
create unique index workout_plans_one_active on public.workout_plans(user_id) where status='active';
create unique index workout_sessions_one_started on public.workout_sessions(user_id) where status='started';
create index workout_sessions_history_idx on public.workout_sessions(user_id,started_at desc);
create index consent_records_owner_time_idx on public.consent_records(user_id,purpose,created_at desc);
create index user_modalities_fk0_idx on public.user_modalities(modality_code);
create index user_equipment_fk0_idx on public.user_equipment(equipment_code);
create index workout_plans_fk0_idx on public.workout_plans(modality_code);
create index plan_exercises_fk0_idx on public.plan_exercises(plan_id,user_id);
create index workout_sessions_fk0_idx on public.workout_sessions(plan_id,user_id);
create index session_exercises_fk0_idx on public.session_exercises(session_id,user_id);
create index session_exercises_fk1_idx on public.session_exercises(plan_exercise_id,user_id);
create index exercise_sets_fk0_idx on public.exercise_sets(session_exercise_id,user_id);
create index feedback_fk0_idx on public.feedback(session_id,user_id);
create index discomfort_reports_fk0_idx on public.discomfort_reports(session_id,user_id);
create index discomfort_reports_fk1_idx on public.discomfort_reports(session_exercise_id,user_id);
create index progression_state_fk0_idx on public.progression_state(last_session_id,user_id);
create index motor_decisions_fk0_idx on public.motor_decisions(plan_id,user_id);
create index plan_exercises_owner_idx on public.plan_exercises(user_id);
create index session_exercises_owner_idx on public.session_exercises(user_id);
create index exercise_sets_owner_idx on public.exercise_sets(user_id);
create index feedback_owner_idx on public.feedback(user_id);
create index discomfort_reports_owner_idx on public.discomfort_reports(user_id);
create index motor_decisions_owner_idx on public.motor_decisions(user_id);
alter table public.profiles enable row level security;
revoke all on public.profiles from public,anon,authenticated;
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
create policy profiles_read_own on public.profiles for select to authenticated using((select auth.uid())=id);
alter table public.preferences enable row level security;
revoke all on public.preferences from public,anon,authenticated;
grant select on public.preferences to authenticated;
grant all on public.preferences to service_role;
create policy preferences_read_own on public.preferences for select to authenticated using((select auth.uid())=user_id);
alter table public.entitlements enable row level security;
revoke all on public.entitlements from public,anon,authenticated;
grant select on public.entitlements to authenticated;
grant all on public.entitlements to service_role;
create policy entitlements_read_own on public.entitlements for select to authenticated using((select auth.uid())=user_id);
alter table public.user_modalities enable row level security;
revoke all on public.user_modalities from public,anon,authenticated;
grant select on public.user_modalities to authenticated;
grant all on public.user_modalities to service_role;
create policy user_modalities_read_own on public.user_modalities for select to authenticated using((select auth.uid())=user_id);
alter table public.user_equipment enable row level security;
revoke all on public.user_equipment from public,anon,authenticated;
grant select on public.user_equipment to authenticated;
grant all on public.user_equipment to service_role;
create policy user_equipment_read_own on public.user_equipment for select to authenticated using((select auth.uid())=user_id);
alter table public.workout_plans enable row level security;
revoke all on public.workout_plans from public,anon,authenticated;
grant select on public.workout_plans to authenticated;
grant all on public.workout_plans to service_role;
create policy workout_plans_read_own on public.workout_plans for select to authenticated using((select auth.uid())=user_id);
alter table public.plan_exercises enable row level security;
revoke all on public.plan_exercises from public,anon,authenticated;
grant select on public.plan_exercises to authenticated;
grant all on public.plan_exercises to service_role;
create policy plan_exercises_read_own on public.plan_exercises for select to authenticated using((select auth.uid())=user_id);
alter table public.workout_sessions enable row level security;
revoke all on public.workout_sessions from public,anon,authenticated;
grant select on public.workout_sessions to authenticated;
grant all on public.workout_sessions to service_role;
create policy workout_sessions_read_own on public.workout_sessions for select to authenticated using((select auth.uid())=user_id);
alter table public.session_exercises enable row level security;
revoke all on public.session_exercises from public,anon,authenticated;
grant select on public.session_exercises to authenticated;
grant all on public.session_exercises to service_role;
create policy session_exercises_read_own on public.session_exercises for select to authenticated using((select auth.uid())=user_id);
alter table public.exercise_sets enable row level security;
revoke all on public.exercise_sets from public,anon,authenticated;
grant select on public.exercise_sets to authenticated;
grant all on public.exercise_sets to service_role;
create policy exercise_sets_read_own on public.exercise_sets for select to authenticated using((select auth.uid())=user_id);
alter table public.feedback enable row level security;
revoke all on public.feedback from public,anon,authenticated;
grant select on public.feedback to authenticated;
grant all on public.feedback to service_role;
create policy feedback_read_own on public.feedback for select to authenticated using((select auth.uid())=user_id);
alter table public.discomfort_reports enable row level security;
revoke all on public.discomfort_reports from public,anon,authenticated;
grant select on public.discomfort_reports to authenticated;
grant all on public.discomfort_reports to service_role;
create policy discomfort_reports_read_own on public.discomfort_reports for select to authenticated using((select auth.uid())=user_id);
alter table public.progression_state enable row level security;
revoke all on public.progression_state from public,anon,authenticated;
grant select on public.progression_state to authenticated;
grant all on public.progression_state to service_role;
create policy progression_state_read_own on public.progression_state for select to authenticated using((select auth.uid())=user_id);
alter table public.motor_decisions enable row level security;
revoke all on public.motor_decisions from public,anon,authenticated;
grant select on public.motor_decisions to authenticated;
grant all on public.motor_decisions to service_role;
create policy motor_decisions_read_own on public.motor_decisions for select to authenticated using((select auth.uid())=user_id);
alter table public.consent_records enable row level security;
revoke all on public.consent_records from public,anon,authenticated;
grant select on public.consent_records to authenticated;
grant all on public.consent_records to service_role;
create policy consent_records_read_own on public.consent_records for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on public.profiles to authenticated;
create policy profiles_insert_own on public.profiles for insert to authenticated with check((select auth.uid())=id);
create policy profiles_update_own on public.profiles for update to authenticated using((select auth.uid())=id) with check((select auth.uid())=id);
create policy profiles_delete_own on public.profiles for delete to authenticated using((select auth.uid())=id);
grant insert,update,delete on public.preferences to authenticated;
create policy preferences_insert_own on public.preferences for insert to authenticated with check((select auth.uid())=user_id);
create policy preferences_update_own on public.preferences for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy preferences_delete_own on public.preferences for delete to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on public.user_equipment to authenticated;
create policy user_equipment_insert_own on public.user_equipment for insert to authenticated with check((select auth.uid())=user_id);
create policy user_equipment_update_own on public.user_equipment for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy user_equipment_delete_own on public.user_equipment for delete to authenticated using((select auth.uid())=user_id);
revoke insert,delete on public.profiles from authenticated;
alter table public.modalities enable row level security;
revoke all on public.modalities from public,anon,authenticated;
grant select on public.modalities to authenticated;
grant all on public.modalities to service_role;
create policy modalities_catalogue on public.modalities for select to authenticated using(true);
alter table public.equipment enable row level security;
revoke all on public.equipment from public,anon,authenticated;
grant select on public.equipment to authenticated;
grant all on public.equipment to service_role;
create policy equipment_catalogue on public.equipment for select to authenticated using(true);

create function nivvo_private.on_signup() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,left(coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'Atleta'),80));
 insert into public.entitlements(user_id) values(new.id);
 return new;
end; $$;
revoke all on function nivvo_private.on_signup() from public,anon,authenticated;
create trigger nivvo_on_signup after insert on auth.users for each row execute function nivvo_private.on_signup();
create function nivvo_private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now();return new;end; $$;
revoke all on function nivvo_private.touch_updated_at() from public,anon,authenticated;
create trigger profiles_touch before update on public.profiles for each row execute function nivvo_private.touch_updated_at();
create trigger preferences_touch before update on public.preferences for each row execute function nivvo_private.touch_updated_at();

create function public.nivvo_save_profile(p_user_id uuid,p_profile jsonb,p_preferences jsonb,p_equipment text[],p_consent boolean)
returns void language plpgsql set search_path='' as $$
begin
 if not p_consent then raise exception 'TRAINING_CONSENT_REQUIRED';end if;
 perform 1 from public.profiles where id=p_user_id for update;
 if not found then raise exception 'PROFILE_NOT_FOUND';end if;
 if exists(select 1 from public.workout_sessions where user_id=p_user_id and status='started') then raise exception 'ACTIVE_SESSION';end if;
 if coalesce(cardinality(p_equipment),0)=0 or cardinality(p_equipment)>20 then raise exception 'EQUIPMENT_REQUIRED';end if;
 update public.profiles set display_name=trim(p_profile->>'display_name'),age=(p_profile->>'age')::int where id=p_user_id;
 insert into public.preferences(user_id,goal,level,days,minutes,priority,style,place)
 values(p_user_id,p_preferences->>'goal',p_preferences->>'level',(p_preferences->>'days')::int,(p_preferences->>'minutes')::int,p_preferences->>'priority',p_preferences->>'style',p_preferences->>'place')
 on conflict(user_id) do update set goal=excluded.goal,level=excluded.level,days=excluded.days,minutes=excluded.minutes,priority=excluded.priority,style=excluded.style,place=excluded.place;
 delete from public.user_equipment where user_id=p_user_id;
 insert into public.user_equipment(user_id,equipment_code) select p_user_id,x from(select distinct unnest(p_equipment) x)s;
 insert into public.user_modalities(user_id,modality_code) values(p_user_id,'musculacao') on conflict(user_id,modality_code) do nothing;
 insert into public.consent_records(user_id,purpose,granted) values(p_user_id,'staging_training',true);
 update public.workout_plans set status='archived' where user_id=p_user_id and status='active';
end; $$;
create function public.nivvo_create_plan(p_user_id uuid,p_request_id uuid,p_payload jsonb)
returns uuid language plpgsql set search_path='' as $$
declare plan_id uuid;d jsonb;e jsonb;r jsonb;
begin
 perform 1 from public.profiles where id=p_user_id for update;
 if not found then raise exception 'PROFILE_NOT_FOUND';end if;
 select id into plan_id from public.workout_plans where user_id=p_user_id and request_id=p_request_id;
 if plan_id is not null then return plan_id;end if;
 if exists(select 1 from public.workout_sessions where user_id=p_user_id and status='started') then raise exception 'ACTIVE_SESSION';end if;
 if coalesce(jsonb_array_length(p_payload->'days'),0) not between 1 and 7 then raise exception 'INVALID_PLAN';end if;
 if not exists(select 1 from public.user_modalities where user_id=p_user_id and modality_code='musculacao' and active) then raise exception 'MODALITY_REQUIRED';end if;
 update public.workout_plans set status='archived' where user_id=p_user_id and status='active';
 insert into public.workout_plans(user_id,request_id,modality_code,input_snapshot) values(p_user_id,p_request_id,'musculacao',p_payload->'input') returning id into plan_id;
 for d in select value from jsonb_array_elements(p_payload->'days') loop
  if coalesce(jsonb_array_length(d->'exercises'),0) not between 1 and 20 then raise exception 'NO_ELIGIBLE_EXERCISES';end if;
  for e in select value from jsonb_array_elements(d->'exercises') loop
   insert into public.plan_exercises(user_id,plan_id,day_index,position,exercise_key,exercise_name,muscle_group,required_equipment,target_sets,rep_min,rep_max)
   values(p_user_id,plan_id,(d->>'index')::int,(e->>'position')::int,e->>'key',e->>'name',e->>'g',e->'requires',(e->>'sets')::int,(e->>'repMin')::int,(e->>'repMax')::int);
  end loop;
 end loop;
 for r in select value from jsonb_array_elements(p_payload->'decisions') loop
  insert into public.motor_decisions(user_id,plan_id,rule_code,condition,decision,reason,alternative)
  values(p_user_id,plan_id,r->>'rule',r->'condition',r->'decision',r->>'reason',r->'alternative');
 end loop;
 return plan_id;
end; $$;
create function public.nivvo_start_session(p_user_id uuid,p_plan_id uuid,p_request_id uuid)
returns uuid language plpgsql set search_path='' as $$
declare sid uuid;day_no int;day_count int;
begin
 perform 1 from public.profiles where id=p_user_id for update;
 if not found then raise exception 'PROFILE_NOT_FOUND';end if;
 select id into sid from public.workout_sessions where user_id=p_user_id and(request_id=p_request_id or status='started') order by started_at desc limit 1;
 if sid is not null then return sid;end if;
 if not exists(select 1 from public.workout_plans where id=p_plan_id and user_id=p_user_id and status='active') then raise exception 'PLAN_NOT_FOUND';end if;
 select count(distinct day_index) into day_count from public.plan_exercises where plan_id=p_plan_id and user_id=p_user_id;
 if day_count=0 then raise exception 'EMPTY_PLAN';end if;
 select count(*)::int % day_count into day_no from public.workout_sessions where plan_id=p_plan_id and user_id=p_user_id and status='completed';
 insert into public.workout_sessions(user_id,plan_id,request_id,day_index) values(p_user_id,p_plan_id,p_request_id,day_no) returning id into sid;
 insert into public.session_exercises(user_id,session_id,plan_exercise_id,position,exercise_key,exercise_name,target_sets,rep_min,rep_max)
 select p_user_id,sid,id,position,exercise_key,exercise_name,target_sets,rep_min,rep_max from public.plan_exercises where plan_id=p_plan_id and user_id=p_user_id and day_index=day_no;
 return sid;
end; $$;
create function public.nivvo_save_session(p_user_id uuid,p_session_id uuid,p_revision int,p_write_id uuid,p_sets jsonb,p_feedback jsonb default null,p_progress jsonb default '[]')
returns integer language plpgsql set search_path='' as $$
declare s public.workout_sessions;x jsonb;h jsonb;ex_id uuid;next_revision int;
begin
 select * into s from public.workout_sessions where id=p_session_id and user_id=p_user_id for update;
 if not found then raise exception 'SESSION_NOT_FOUND';end if;
 if s.last_write_id=p_write_id then return s.revision;end if;
 if s.status<>'started' then raise exception 'SESSION_COMPLETED';end if;
 if s.revision<>p_revision then raise exception 'REVISION_CONFLICT';end if;
 if jsonb_typeof(p_sets) is distinct from 'array' or jsonb_array_length(p_sets)>200 then raise exception 'INVALID_SETS';end if;
 for x in select value from jsonb_array_elements(p_sets) loop
  ex_id=(x->>'session_exercise_id')::uuid;
  if not exists(select 1 from public.session_exercises where id=ex_id and session_id=s.id and user_id=p_user_id) then raise exception 'EXERCISE_NOT_OWNED';end if;
  insert into public.exercise_sets(user_id,session_exercise_id,set_number,load_kg,reps)
  values(p_user_id,ex_id,(x->>'set_number')::int,(x->>'load_kg')::numeric,(x->>'reps')::int)
  on conflict(session_exercise_id,set_number) do update set load_kg=excluded.load_kg,reps=excluded.reps,updated_at=now();
 end loop;
 if p_feedback is not null then
  if not exists(select 1 from public.exercise_sets a join public.session_exercises b on b.id=a.session_exercise_id and b.user_id=a.user_id where b.session_id=s.id and a.user_id=p_user_id and a.reps>0) then raise exception 'RECORD_A_SET';end if;
  insert into public.feedback(user_id,session_id,difficulty,repeat_intent) values(p_user_id,s.id,p_feedback->>'difficulty',p_feedback->>'repeat_intent');
  if coalesce((p_feedback->>'pain')::boolean,false) then
   if coalesce((p_feedback->>'consent')::boolean,false) is not true then raise exception 'DISCOMFORT_CONSENT_REQUIRED';end if;
   ex_id=nullif(p_feedback->>'pain_exercise_id','')::uuid;
   if ex_id is not null and not exists(select 1 from public.session_exercises where id=ex_id and session_id=s.id and user_id=p_user_id) then raise exception 'EXERCISE_NOT_OWNED';end if;
   insert into public.consent_records(user_id,purpose,granted) values(p_user_id,'discomfort_storage',true);
   insert into public.discomfort_reports(user_id,session_id,session_exercise_id) values(p_user_id,s.id,ex_id);
  end if;
  for h in select value from jsonb_array_elements(p_progress) loop
   if not exists(select 1 from public.session_exercises where session_id=s.id and user_id=p_user_id and exercise_key=h->>'exercise_key') then raise exception 'EXERCISE_NOT_OWNED';end if;
   insert into public.progression_state(user_id,exercise_key,last_session_id,next_hint,label) values(p_user_id,h->>'exercise_key',s.id,h->>'next_hint',h->>'label')
   on conflict(user_id,exercise_key) do update set last_session_id=excluded.last_session_id,next_hint=excluded.next_hint,label=excluded.label,updated_at=now();
  end loop;
 end if;
 next_revision=s.revision+1;
 update public.workout_sessions set revision=next_revision,last_write_id=p_write_id,status=case when p_feedback is null then 'started' else 'completed' end,completed_at=case when p_feedback is null then null else now() end where id=s.id and user_id=p_user_id;
 return next_revision;
end; $$;
revoke all on function public.nivvo_save_profile(uuid,jsonb,jsonb,text[],boolean) from public,anon,authenticated;
grant execute on function public.nivvo_save_profile(uuid,jsonb,jsonb,text[],boolean) to service_role;
revoke all on function public.nivvo_create_plan(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.nivvo_create_plan(uuid,uuid,jsonb) to service_role;
revoke all on function public.nivvo_start_session(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.nivvo_start_session(uuid,uuid,uuid) to service_role;
revoke all on function public.nivvo_save_session(uuid,uuid,int,uuid,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.nivvo_save_session(uuid,uuid,int,uuid,jsonb,jsonb,jsonb) to service_role;
