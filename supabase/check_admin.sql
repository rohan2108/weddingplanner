-- 1. See everyone who has signed up and what role they got:
select id, full_name, role, created_at from public.profiles order by created_at;

-- 2. If your account isn't 'admin', promote it (replace the email):
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'anushkaa.mahere@gmail.com');
