\set ON_ERROR_STOP off
insert into auth.users(id,raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000a','{"role":"student","full_name":"Alice"}'),
 ('00000000-0000-0000-0000-00000000000b','{"role":"student","full_name":"Bob"}'),
 ('00000000-0000-0000-0000-0000000000a1','{"role":"teacher","full_name":"Teacher One"}'),
 ('00000000-0000-0000-0000-0000000000a2','{"role":"teacher","full_name":"Teacher Two"}'),
 ('00000000-0000-0000-0000-0000000000ff','{"role":"platform_admin","full_name":"Hacker"}'),
 ('00000000-0000-0000-0000-0000000000c1','{}');
\echo '--- T1 elevated role via signup metadata ignored; no-metadata user not onboarded'
select full_name, role, onboarded from profiles where full_name in ('Hacker','') order by 1;
set role authenticated;
\echo '--- T2 teacher creates class: OK'
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a1';
insert into classes(name) values ('Grade 4') returning name, length(join_code) as code_len;
\echo '--- T3 student creates class: expect RLS ERROR'
set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000a';
insert into classes(name) values ('Evil');
\echo '--- T4 student self-promotes: expect permission denied x2'
update profiles set role='platform_admin' where id=auth.uid();
update profiles set plan='enterprise' where id=auth.uid();
\echo '--- T5 student edits own name: OK'
update profiles set full_name='Alice K' where id=auth.uid();
reset role;
create temp table code as select join_code c from classes limit 1; grant select on code to authenticated;
set role authenticated;
\echo '--- T6 Alice (student) joins by code: OK; wrong code: ERROR; teacher joining: ERROR'
select public.join_class((select c from code)) is not null as joined;
select public.join_class('NOPE1234');
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a1';
select public.join_class((select c from code));
\echo '--- T7 Alice records attempts + passes level'
set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000a';
insert into attempts(level,kind,correct,ms,local_day) values (1,'practice',true,3000,'2026-11-26'),(1,'practice',false,5000,'2026-11-26'),(3,'quiz',true,4000,'2026-11-25');
select public.pass_level(1,5);
select public.pass_level(2,2);
\echo '--- T7b cheating: insert attempt for someone else: expect RLS ERROR; huge ms: expect check ERROR'
insert into attempts(user_id,level,kind,correct,ms) values ('00000000-0000-0000-0000-00000000000b',1,'practice',true,10);
insert into attempts(level,kind,correct,ms) values (1,'practice',true,99999999);
\echo '--- T8 own stats views'
select * from my_level_stats order by level;
select * from my_active_days order by day;
\echo '--- T9 Bob (not in class) cannot see Alice data or the class: expect 0 rows each'
set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000b';
select count(*) as attempts_visible from attempts where user_id='00000000-0000-0000-0000-00000000000a';
select count(*) as classes_visible from classes;
select count(*) as profiles_visible from profiles;
\echo '--- T10 Teacher One sees class overview; Teacher Two is blocked'
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a1';
select * from class_overview((select id from classes limit 1));
select count(*) as t1_sees_alice_attempts from attempts where user_id='00000000-0000-0000-0000-00000000000a';
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a2';
select * from class_overview((select id from classes limit 1));
select count(*) as t2_sees_attempts from attempts;
\echo '--- T11 anon has no access: expect permission denied'
reset role; set role anon; select count(*) from profiles;
\echo '--- T12 export + delete account'
reset role; set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000a';
select jsonb_array_length(public.export_my_data()->'attempts') as exported_attempts;
select public.delete_my_account();
reset role;
select (select count(*) from profiles where full_name='Alice K') as profile_left, (select count(*) from attempts) as attempts_left, (select count(*) from class_members) as members_left;
