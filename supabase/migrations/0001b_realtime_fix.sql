-- =============================================================================
-- Safe fix: adds each table to the supabase_realtime publication only if it
-- isn't already a member. Run this instead of the "alter publication ... add
-- table" lines at the end of 0001_init.sql.
-- =============================================================================

do $$
declare
  t text;
begin
  foreach t in array array['events','tasks','bookings','budget_items','shopping_items','guests','vendors','activity_log']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;
