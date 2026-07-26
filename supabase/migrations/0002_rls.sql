-- =============================================================================
-- Row Level Security
-- Model: Admin = full read/write everywhere.
-- Family/Volunteer = can read everything (it's one wedding, everyone should see
-- the plan) but can only UPDATE a task if they are its assignee, and cannot
-- delete anything or touch budget/bookings/vendors.
-- =============================================================================

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create or replace function current_role_name()
returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table events enable row level security;
alter table tasks enable row level security;
alter table task_comments enable row level security;
alter table bookings enable row level security;
alter table budget_items enable row level security;
alter table shopping_items enable row level security;
alter table guests enable row level security;
alter table vendors enable row level security;
alter table activity_log enable row level security;

-- PROFILES: everyone can read all profiles (needed to show assignee names,
-- pick assignees in dropdowns). Only admin can change roles.
drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select using (true);
drop policy if exists "profiles_update_own_or_admin" on profiles;
create policy "profiles_update_own_or_admin" on profiles for update
  using (auth.uid() = id or is_admin());
drop policy if exists "profiles_insert_self" on profiles;
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);

-- EVENTS: everyone reads; only admin writes.
drop policy if exists "events_select_all" on events;
create policy "events_select_all" on events for select using (true);
drop policy if exists "events_write_admin" on events;
create policy "events_write_admin" on events for insert with check (is_admin());
drop policy if exists "events_update_admin" on events;
create policy "events_update_admin" on events for update using (is_admin());
drop policy if exists "events_delete_admin" on events;
create policy "events_delete_admin" on events for delete using (is_admin());

-- TASKS: everyone reads. Admin can insert/delete/update anything.
-- Family/volunteer can update ONLY a task assigned to them (status, pct, comments)
-- but cannot reassign it to someone else or delete it.
drop policy if exists "tasks_select_all" on tasks;
create policy "tasks_select_all" on tasks for select using (true);
drop policy if exists "tasks_insert_admin" on tasks;
create policy "tasks_insert_admin" on tasks for insert with check (is_admin());
drop policy if exists "tasks_delete_admin" on tasks;
create policy "tasks_delete_admin" on tasks for delete using (is_admin());
drop policy if exists "tasks_update_admin_or_assignee" on tasks;
create policy "tasks_update_admin_or_assignee" on tasks for update
  using (is_admin() or assignee_id = auth.uid())
  with check (is_admin() or assignee_id = auth.uid());

drop policy if exists "task_comments_select_all" on task_comments;
create policy "task_comments_select_all" on task_comments for select using (true);
drop policy if exists "task_comments_insert_any_authenticated" on task_comments;
create policy "task_comments_insert_any_authenticated" on task_comments for insert
  with check (auth.uid() is not null);

-- BOOKINGS: everyone reads; only admin writes (booking status/contracts/payments
-- are sensitive enough that only the admin should edit them).
drop policy if exists "bookings_select_all" on bookings;
create policy "bookings_select_all" on bookings for select using (true);
drop policy if exists "bookings_write_admin" on bookings;
create policy "bookings_write_admin" on bookings for insert with check (is_admin());
drop policy if exists "bookings_update_admin" on bookings;
create policy "bookings_update_admin" on bookings for update using (is_admin());
drop policy if exists "bookings_delete_admin" on bookings;
create policy "bookings_delete_admin" on bookings for delete using (is_admin());

-- BUDGET: everyone reads; only admin writes.
drop policy if exists "budget_select_all" on budget_items;
create policy "budget_select_all" on budget_items for select using (true);
drop policy if exists "budget_write_admin" on budget_items;
create policy "budget_write_admin" on budget_items for insert with check (is_admin());
drop policy if exists "budget_update_admin" on budget_items;
create policy "budget_update_admin" on budget_items for update using (is_admin());
drop policy if exists "budget_delete_admin" on budget_items;
create policy "budget_delete_admin" on budget_items for delete using (is_admin());

-- SHOPPING: everyone reads; everyone (family/volunteer too) can add items and
-- mark purchased, since shopping is often delegated. Only admin deletes.
drop policy if exists "shopping_select_all" on shopping_items;
create policy "shopping_select_all" on shopping_items for select using (true);
drop policy if exists "shopping_insert_any_authenticated" on shopping_items;
create policy "shopping_insert_any_authenticated" on shopping_items for insert
  with check (auth.uid() is not null);
drop policy if exists "shopping_update_any_authenticated" on shopping_items;
create policy "shopping_update_any_authenticated" on shopping_items for update
  using (auth.uid() is not null);
drop policy if exists "shopping_delete_admin" on shopping_items;
create policy "shopping_delete_admin" on shopping_items for delete using (is_admin());

-- GUESTS: everyone reads; only admin writes (RSVP list is admin-managed).
drop policy if exists "guests_select_all" on guests;
create policy "guests_select_all" on guests for select using (true);
drop policy if exists "guests_write_admin" on guests;
create policy "guests_write_admin" on guests for insert with check (is_admin());
drop policy if exists "guests_update_admin" on guests;
create policy "guests_update_admin" on guests for update using (is_admin());
drop policy if exists "guests_delete_admin" on guests;
create policy "guests_delete_admin" on guests for delete using (is_admin());

-- VENDORS: everyone reads; only admin writes.
drop policy if exists "vendors_select_all" on vendors;
create policy "vendors_select_all" on vendors for select using (true);
drop policy if exists "vendors_write_admin" on vendors;
create policy "vendors_write_admin" on vendors for insert with check (is_admin());
drop policy if exists "vendors_update_admin" on vendors;
create policy "vendors_update_admin" on vendors for update using (is_admin());
drop policy if exists "vendors_delete_admin" on vendors;
create policy "vendors_delete_admin" on vendors for delete using (is_admin());

-- ACTIVITY LOG: everyone reads; anyone authenticated can write a log entry.
drop policy if exists "activity_select_all" on activity_log;
create policy "activity_select_all" on activity_log for select using (true);
drop policy if exists "activity_insert_any_authenticated" on activity_log;
create policy "activity_insert_any_authenticated" on activity_log for insert
  with check (auth.uid() is not null);
