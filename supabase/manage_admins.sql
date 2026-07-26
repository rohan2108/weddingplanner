-- See everyone who has signed up so far, and their current role:
select id, full_name, role, created_at from public.profiles order by created_at;

-- Promote as many people as you want to admin — just repeat this line
-- with a different email for each person:
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'rohan@example.com');

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'someoneelse@example.com');

-- If you ever want to demote someone back to a regular member:
update public.profiles
set role = 'family'
where id = (select id from auth.users where email = 'someone@example.com');
