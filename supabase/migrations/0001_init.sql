-- =============================================================================
-- Anushka & Rohan's Wedding Planner — initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push` with the CLI.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- PROFILES  (one row per auth.users row, holds role + display info)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'volunteer' check (role in ('admin', 'family', 'volunteer')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up.
-- The very first user to sign up becomes admin automatically; everyone after is 'family'.
-- You can promote/demote anyone later with:
--   update profiles set role = 'admin' where id = '<user-uuid>';
create or replace function handle_new_user()
returns trigger as $$
declare
  existing_count int;
begin
  select count(*) into existing_count from profiles;
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when existing_count = 0 then 'admin' else 'family' end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------------
-- EVENTS  (Mehendi, Haldi, Nikah, Reception, or any custom function)
-- ---------------------------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TASKS
-- ---------------------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  description text default '',
  category text default '',
  assignee_name text default '',
  assignee_id uuid references profiles(id) on delete set null,
  priority text not null default 'Medium' check (priority in ('Critical', 'High', 'Medium', 'Low')),
  due_date date,
  status text not null default 'Not Started'
    check (status in ('Not Started', 'In Progress', 'Waiting', 'Blocked', 'Completed', 'Cancelled')),
  completion_pct int not null default 0 check (completion_pct between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- BOOKINGS  (dedicated vendor booking tracker — separate from `vendors` below)
-- ---------------------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  is_custom boolean not null default false,
  lead_months int not null default 3,
  vendor_name text default '',
  event_id uuid references events(id) on delete set null,
  status text not null default 'Not Booked'
    check (status in ('Not Booked', 'Enquired', 'Negotiating', 'Booked', 'Confirmed', 'Cancelled')),
  booking_date date,
  contract_signed boolean not null default false,
  advance_paid numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  final_payment_due date,
  contact_person text default '',
  phone text default '',
  trial_needed boolean not null default false,
  trial_scheduled boolean not null default false,
  trial_date date,
  fitting_needed boolean not null default false,
  fitting_dates text default '',
  contract_file_url text,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- BUDGET
-- ---------------------------------------------------------------------------
create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  category text not null,
  planned numeric(12,2) not null default 0,
  actual numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SHOPPING
-- ---------------------------------------------------------------------------
create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  category text not null,
  name text not null,
  qty int not null default 1,
  budget numeric(12,2) not null default 0,
  actual numeric(12,2) not null default 0,
  store text default '',
  purchased boolean not null default false,
  assignee_name text default '',
  receipt_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- GUESTS
-- ---------------------------------------------------------------------------
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  side text not null default 'Bride' check (side in ('Bride', 'Groom')),
  type text not null default 'Family' check (type in ('Family', 'Friend', 'VIP')),
  rsvp text not null default 'Pending' check (rsvp in ('Pending', 'Confirmed', 'Declined')),
  invited boolean not null default false,
  food_preference text default 'Veg',
  phone text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- VENDORS  (general contact book — distinct from the booking tracker)
-- ---------------------------------------------------------------------------
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text default '',
  phone text default '',
  advance_paid numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  rating numeric(2,1) default 4.0,
  notes text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ACTIVITY LOG  (for the dashboard "recent activity" widget)
-- ---------------------------------------------------------------------------
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_name text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at helper trigger for tasks + bookings
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_at on tasks;
create trigger tasks_set_updated_at before update on tasks
  for each row execute procedure set_updated_at();

drop trigger if exists bookings_set_updated_at on bookings;
create trigger bookings_set_updated_at before update on bookings
  for each row execute procedure set_updated_at();

-- ---------------------------------------------------------------------------
-- Enable Realtime on the tables the dashboard subscribes to.
-- Guarded with a check because Supabase auto-enables Realtime on some newly
-- created tables by default — adding an already-member table throws 42710.
-- ---------------------------------------------------------------------------
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
