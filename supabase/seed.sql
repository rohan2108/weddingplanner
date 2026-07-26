-- =============================================================================
-- Seed data — safe to run once after migrations, on a fresh project.
-- Run in the Supabase SQL editor. Re-running will create duplicate rows,
-- so only run this once (or truncate the tables first).
-- =============================================================================

-- EVENTS -----------------------------------------------------------------
insert into events (name, event_date) values
  ('Mehendi', '2026-12-08'),
  ('Haldi', '2026-12-09'),
  ('Nikah', '2026-12-11'),
  ('Reception', '2026-12-13');

-- TASKS --------------------------------------------------------------------
insert into tasks (event_id, name, category, assignee_name, priority, due_date, status, completion_pct)
select id, 'Finalize Mehendi artist contract', 'Booking', 'Priya', 'High', '2026-08-15', 'In Progress', 40
from events where name = 'Mehendi';

insert into tasks (event_id, name, category, assignee_name, priority, due_date, status, completion_pct)
select id, 'Order marigold decor', 'Decor', 'Aunt Sunita', 'Medium', '2026-10-01', 'Not Started', 0
from events where name = 'Haldi';

insert into tasks (event_id, name, category, assignee_name, priority, due_date, status, completion_pct)
select id, 'Confirm Nikah nama draft with Qazi', 'Ceremony', 'Rohan', 'Critical', '2026-07-25', 'Waiting', 20
from events where name = 'Nikah';

insert into tasks (event_id, name, category, assignee_name, priority, due_date, status, completion_pct)
select id, 'Book reception stage designer', 'Booking', 'Anushka', 'Critical', '2026-07-20', 'Blocked', 10
from events where name = 'Reception';

insert into tasks (event_id, name, category, assignee_name, priority, due_date, status, completion_pct)
select id, 'Trial makeup session', 'Beauty', 'Anushka', 'High', '2026-09-05', 'Not Started', 0
from events where name = 'Nikah';

insert into tasks (event_id, name, category, assignee_name, priority, due_date, status, completion_pct)
select id, 'Send Mehendi invites (family group)', 'Invites', 'Priya', 'Medium', '2026-09-20', 'Completed', 100
from events where name = 'Mehendi';

insert into tasks (event_id, name, category, assignee_name, priority, due_date, status, completion_pct)
select id, 'Finalize catering menu tasting', 'Food', 'Rohan', 'High', '2026-08-30', 'In Progress', 60
from events where name = 'Reception';

insert into tasks (event_id, name, category, assignee_name, priority, due_date, status, completion_pct)
select id, 'Order Haldi outfits (yellow set)', 'Clothes', 'Anushka', 'Medium', '2026-10-10', 'Not Started', 0
from events where name = 'Haldi';

-- BOOKINGS — one row per required category ---------------------------------
insert into bookings (category, lead_months, event_id, status, trial_needed, fitting_needed)
select v.category, v.lead_months, e.id, 'Not Booked', v.trial_needed, v.fitting_needed
from (values
  ('Venue', 9, 'Nikah', false, false),
  ('Food Catering', 9, 'Reception', true, false),
  ('Photographer', 6, 'Nikah', false, false),
  ('Videographer', 6, 'Nikah', false, false),
  ('Decoration', 5, 'Reception', false, false),
  ('DJ / Sound', 4, 'Reception', false, false),
  ('Lighting', 4, 'Reception', false, false),
  ('Makeup Artist', 4, 'Nikah', true, false),
  ('Wedding Clothes / Tailor', 4, 'Nikah', true, true),
  ('Mehendi Artist', 3, 'Mehendi', false, false),
  ('Jeweler', 3, 'Nikah', false, false),
  ('Transportation', 3, 'Reception', false, false),
  ('Invitation Cards Printing', 3, 'Mehendi', false, false),
  ('Accommodation / Guest Hotel', 5, 'Reception', false, false),
  ('Flowers', 2, 'Haldi', false, false)
) as v(category, lead_months, event_name, trial_needed, fitting_needed)
join events e on e.name = v.event_name;

-- Mark a few as already booked, so the tracker isn't 100% empty
update bookings set status = 'Booked', vendor_name = 'Royal Gardens Banquet', advance_paid = 200000,
  balance_due = 200000, contract_signed = true, booking_date = '2026-05-10'
where category = 'Venue';

update bookings set status = 'Confirmed', vendor_name = 'Shutter Tales Studio', advance_paid = 50000,
  balance_due = 70000, contract_signed = true, booking_date = '2026-06-02'
where category = 'Photographer';

update bookings set status = 'Booked', vendor_name = 'Henna Bloom Artists', advance_paid = 15000,
  balance_due = 10000, contract_signed = true, booking_date = '2026-07-01'
where category = 'Mehendi Artist';

-- BUDGET ---------------------------------------------------------------------
insert into budget_items (event_id, category, planned, actual)
select id, 'Decor', 80000, 42000 from events where name = 'Mehendi';
insert into budget_items (event_id, category, planned, actual)
select id, 'Catering', 60000, 0 from events where name = 'Mehendi';
insert into budget_items (event_id, category, planned, actual)
select id, 'Decor', 50000, 20000 from events where name = 'Haldi';
insert into budget_items (event_id, category, planned, actual)
select id, 'Venue', 400000, 150000 from events where name = 'Nikah';
insert into budget_items (event_id, category, planned, actual)
select id, 'Clothes', 250000, 180000 from events where name = 'Nikah';
insert into budget_items (event_id, category, planned, actual)
select id, 'Catering', 500000, 100000 from events where name = 'Reception';
insert into budget_items (event_id, category, planned, actual)
select id, 'Decor', 200000, 0 from events where name = 'Reception';

-- SHOPPING ---------------------------------------------------------------------
insert into shopping_items (event_id, category, name, qty, budget, actual, store, purchased, assignee_name)
select id, 'Decorations', 'Marigold garlands (50m)', 4, 8000, 0, 'Flower Bazaar', false, 'Priya'
from events where name = 'Mehendi';
insert into shopping_items (event_id, category, name, qty, budget, actual, store, purchased, assignee_name)
select id, 'Jewelry', 'Bridal necklace set', 1, 180000, 165000, 'Tanishq', true, 'Anushka'
from events where name = 'Nikah';
insert into shopping_items (event_id, category, name, qty, budget, actual, store, purchased, assignee_name)
select id, 'Wedding Cards', 'Invitation cards (300)', 300, 45000, 45000, 'PrintHaus', true, 'Rohan'
from events where name = 'Reception';
insert into shopping_items (event_id, category, name, qty, budget, actual, store, purchased, assignee_name)
select id, 'Clothes', 'Yellow silk dupattas', 6, 12000, 0, 'FabIndia', false, 'Aunt Sunita'
from events where name = 'Haldi';

-- GUESTS ---------------------------------------------------------------------
insert into guests (name, side, type, rsvp, invited, food_preference, phone) values
  ('Meera Sharma', 'Bride', 'Family', 'Confirmed', true, 'Veg', '+91 9811122233'),
  ('Karan Verma', 'Groom', 'Friend', 'Pending', true, 'Non-Veg', '+91 9822233344'),
  ('Dr. Anil Kapoor', 'Groom', 'VIP', 'Confirmed', true, 'Veg', '+91 9833344455'),
  ('Riya Malhotra', 'Bride', 'Friend', 'Declined', true, 'Veg', '+91 9844455566');

-- VENDORS ---------------------------------------------------------------------
insert into vendors (name, category, phone, advance_paid, balance_due, rating, notes) values
  ('Rangoli Decor Studio', 'Decorator', '+91 9900011122', 60000, 90000, 4.5, 'Preferred for Nikah stage'),
  ('Shutter Tales', 'Photographer', '+91 9900022233', 50000, 70000, 5, 'Also doing videography add-on'),
  ('Spice Route Catering', 'Catering', '+91 9900033344', 100000, 400000, 4, 'Tasting scheduled');
