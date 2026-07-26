-- =============================================================================
-- Adds a "side" (Bride / Groom / Both) tag to the modules that need it, so the
-- app can be filtered to just Anushka's side, just Rohan's side, or everything.
-- Guests already has its own `side` column from day one — untouched here.
-- Also adds `remaining_qty` to shopping_items for the simplified shopping list.
-- =============================================================================

alter table tasks add column if not exists side text not null default 'Both'
  check (side in ('Bride', 'Groom', 'Both'));

alter table budget_items add column if not exists side text not null default 'Both'
  check (side in ('Bride', 'Groom', 'Both'));

alter table shopping_items add column if not exists side text not null default 'Both'
  check (side in ('Bride', 'Groom', 'Both'));

alter table bookings add column if not exists side text not null default 'Both'
  check (side in ('Bride', 'Groom', 'Both'));

alter table vendors add column if not exists side text not null default 'Both'
  check (side in ('Bride', 'Groom', 'Both'));

-- Simplified shopping list: track how many of the needed quantity are still
-- outstanding. Defaults to matching `qty` for any existing rows.
alter table shopping_items add column if not exists remaining_qty int not null default 0;
update shopping_items set remaining_qty = qty where remaining_qty = 0;
