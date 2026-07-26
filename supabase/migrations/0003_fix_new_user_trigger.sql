-- =============================================================================
-- Fix: the auth.users trigger runs with a restricted search_path, so
-- unqualified table names inside it can fail with "relation does not exist",
-- which aborts the entire signup transaction ("Database error saving new
-- user"). This version explicitly schema-qualifies every table reference and
-- pins search_path so it can never depend on the caller's context again.
-- Also adds `on conflict do nothing` so a retried signup can't fail on a
-- duplicate profile row left over from an earlier aborted attempt.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_count int;
begin
  select count(*) into existing_count from public.profiles;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when existing_count = 0 then 'admin' else 'family' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Make sure the roles GoTrue uses to run this trigger can actually reach the
-- public schema and the profiles table (belt-and-suspenders; usually already
-- fine for the postgres-owned function above, but cheap to guarantee).
grant usage on schema public to supabase_auth_admin;
grant select, insert on public.profiles to supabase_auth_admin;
