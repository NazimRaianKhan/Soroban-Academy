-- Soroban Academy: Stage 1 schema (accounts, roles, progress, classes).
-- Run in the Supabase SQL editor (or `supabase db push`). Safe defaults: RLS on everywhere.

create type public.app_role as enum ('student','parent','teacher','school_admin','platform_admin');

-- ───────────── profiles ─────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.app_role not null default 'student',
  full_name   text not null default '' check (char_length(full_name) <= 100),
  lang        text not null default 'en' check (lang in ('en','bn')),
  plan        text not null default 'free',          -- room for future business tiers
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Self-service roles only. Elevated roles are granted manually by a platform admin.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r text := new.raw_user_meta_data->>'role';
begin
  insert into public.profiles (id, role, full_name, onboarded)
  values (
    new.id,
    case when r in ('student','parent','teacher') then r::public.app_role else 'student' end,
    left(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), 100),
    coalesce(r in ('student','parent','teacher'), false)
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────── classes ─────────────
create table public.classes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  join_code   text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  created_at  timestamptz not null default now()
);
create table public.class_members (
  class_id    uuid not null references public.classes(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (class_id, student_id)
);
create index on public.class_members (student_id);

-- ───────────── learning data ─────────────
create table public.attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  level       smallint not null check (level between 1 and 30),
  kind        text not null check (kind in ('practice','quiz')),
  correct     boolean not null,
  ms          integer not null check (ms between 0 and 600000),
  local_day   date not null default (now() at time zone 'utc')::date,  -- the user's own calendar day (streaks)
  created_at  timestamptz not null default now()
);
create index on public.attempts (user_id, created_at desc);

create table public.level_progress (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  level       smallint not null check (level between 1 and 30),
  best_score  smallint not null check (best_score between 0 and 5),
  passed_at   timestamptz not null default now(),
  primary key (user_id, level)
);

-- ───────────── helper functions (SECURITY DEFINER avoids RLS recursion) ─────────────
create function public.my_role() returns public.app_role
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create function public.is_platform_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce(public.my_role() = 'platform_admin', false) $$;

create function public.is_class_teacher(cid uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.classes where id = cid and teacher_id = auth.uid()) $$;

create function public.is_class_member(cid uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.class_members where class_id = cid and student_id = auth.uid()) $$;

create function public.is_teacher_of(student uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (
     select 1 from public.class_members cm join public.classes c on c.id = cm.class_id
     where cm.student_id = student and c.teacher_id = auth.uid()) $$;

-- ───────────── row level security ─────────────
alter table public.profiles       enable row level security;
alter table public.classes        enable row level security;
alter table public.class_members  enable row level security;
alter table public.attempts       enable row level security;
alter table public.level_progress enable row level security;

create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_teacher_of(id) or public.is_platform_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy classes_select on public.classes for select to authenticated
  using (teacher_id = auth.uid() or public.is_class_member(id) or public.is_platform_admin());
create policy classes_insert on public.classes for insert to authenticated
  with check (teacher_id = auth.uid() and public.my_role() in ('teacher','school_admin'));
create policy classes_update on public.classes for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy classes_delete on public.classes for delete to authenticated
  using (teacher_id = auth.uid());

create policy members_select on public.class_members for select to authenticated
  using (student_id = auth.uid() or public.is_class_teacher(class_id) or public.is_platform_admin());
create policy members_delete on public.class_members for delete to authenticated
  using (student_id = auth.uid() or public.is_class_teacher(class_id));

create policy attempts_select on public.attempts for select to authenticated
  using (user_id = auth.uid() or public.is_teacher_of(user_id) or public.is_platform_admin());
create policy attempts_insert on public.attempts for insert to authenticated
  with check (user_id = auth.uid());

create policy progress_select on public.level_progress for select to authenticated
  using (user_id = auth.uid() or public.is_teacher_of(user_id) or public.is_platform_admin());

-- ───────────── table privileges (least privilege) ─────────────
revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.classes, public.class_members, public.attempts, public.level_progress to authenticated;
grant update (full_name, lang) on public.profiles to authenticated;     -- role/plan/onboarded can NOT be self-edited
grant insert (name) on public.classes to authenticated;
grant update (name) on public.classes to authenticated;
grant delete on public.classes, public.class_members to authenticated;
grant insert (level, kind, correct, ms, local_day) on public.attempts to authenticated;

-- ───────────── RPC functions the app calls ─────────────
create function public.complete_onboarding(p_role text, p_name text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_role not in ('student','parent','teacher') then raise exception 'invalid role'; end if;
  update public.profiles
     set role = p_role::public.app_role, full_name = left(trim(p_name), 100), onboarded = true
   where id = auth.uid() and role in ('student','parent','teacher');
end $$;

create function public.join_class(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if public.my_role() <> 'student' then raise exception 'only students can join a class'; end if;
  select id into cid from public.classes where join_code = upper(trim(p_code));
  if cid is null then raise exception 'class code not found'; end if;
  insert into public.class_members (class_id, student_id) values (cid, auth.uid()) on conflict do nothing;
  return cid;
end $$;

create function public.pass_level(p_level int, p_score int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_score < 4 or p_score > 5 then raise exception 'score does not pass'; end if;
  insert into public.level_progress (user_id, level, best_score) values (auth.uid(), p_level, p_score)
  on conflict (user_id, level) do update set best_score = greatest(public.level_progress.best_score, excluded.best_score);
end $$;

create function public.class_overview(p_class uuid)
returns table (student_id uuid, full_name text, attempts int, correct int, avg_ms int, levels_passed int, last_active timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (public.is_class_teacher(p_class) or public.is_platform_admin()) then raise exception 'not allowed'; end if;
  return query
    select cm.student_id, p.full_name,
           (select count(*)::int from public.attempts a where a.user_id = cm.student_id),
           (select count(*)::int from public.attempts a where a.user_id = cm.student_id and a.correct),
           (select coalesce(avg(a.ms) filter (where a.correct), 0)::int from public.attempts a where a.user_id = cm.student_id),
           (select count(*)::int from public.level_progress l where l.user_id = cm.student_id),
           (select max(a.created_at) from public.attempts a where a.user_id = cm.student_id)
      from public.class_members cm join public.profiles p on p.id = cm.student_id
     where cm.class_id = p_class
     order by p.full_name;
end $$;

create function public.export_my_data() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'profile',  (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'attempts', coalesce((select jsonb_agg(to_jsonb(a)) from public.attempts a where a.user_id = auth.uid()), '[]'::jsonb),
    'levels',   coalesce((select jsonb_agg(to_jsonb(l)) from public.level_progress l where l.user_id = auth.uid()), '[]'::jsonb),
    'classes',  coalesce((select jsonb_agg(to_jsonb(m)) from public.class_members m where m.student_id = auth.uid()), '[]'::jsonb)
  ) $$;

create function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();   -- cascades to profiles and all learning data
end $$;

-- Per-user stats for the Progress screen (views run with the caller's RLS)
create view public.my_level_stats with (security_invoker = true) as
  select level::int, count(*)::int as attempts, count(*) filter (where correct)::int as correct,
         coalesce(sum(ms) filter (where correct), 0)::bigint as correct_ms
    from public.attempts where user_id = auth.uid() group by level;
create view public.my_active_days with (security_invoker = true) as
  select distinct local_day as day from public.attempts where user_id = auth.uid();
grant select on public.my_level_stats, public.my_active_days to authenticated;

-- Only signed-in users may call RPCs and helpers
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
revoke execute on function public.handle_new_user() from authenticated;
