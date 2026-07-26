# Anushka & Rohan's Wedding Planner

A full wedding planning dashboard: events, tasks (Kanban), vendor booking tracker,
budget, shopping list, guests, and vendor contacts — built on Next.js + Supabase
(Postgres, Auth, Realtime).

---

## 0. What you need first

- **Node.js 18.18 or newer** installed on your computer. Check with:
  ```
  node -v
  ```
  If that command fails, install Node from https://nodejs.org (choose the LTS version).
- A Supabase project (you already have one — you shared its URL and anon key earlier).
- The three SQL files already run in your Supabase SQL editor: `0001_init.sql`,
  `0002_rls.sql`, `seed.sql`. (You've done this — skip to step 2.)

---

## 1. Create the project folder and add the files

1. Create a new folder anywhere on your computer, e.g. on your Desktop:
   ```
   mkdir wedding-planner-app
   cd wedding-planner-app
   ```
2. Download the `wedding-planner-app.zip` file I've attached and unzip its
   **contents** directly into this folder (not into a subfolder — the
   `package.json` file should sit directly inside `wedding-planner-app/`).
3. Also place the `.env.local` file (sent earlier) into this same folder,
   at the same level as `package.json`.

Your folder should now look like this:

```
wedding-planner-app/
  app/
  components/
  lib/
  supabase/
  .env.local          <- your real Supabase credentials
  .gitignore
  package.json
  tailwind.config.ts
  tsconfig.json
  ...
```

---

## 2. Install dependencies

Inside the folder, run:

```
npm install
```

This downloads React, Next.js, Supabase's client libraries, Tailwind, Recharts,
etc. It only needs to be run once (and again later if I send you new files that
add a new dependency).

---

## 3. Run it

```
npm run dev
```

Leave that command running — it starts a local server. Then open your browser to:

```
http://localhost:3000
```

You should land on a login screen. **Sign up first** (there's a link on the
login page) — the very first account created automatically becomes Admin.
Everyone who signs up after that joins as Family by default; you can promote
anyone to Admin later by running this in the Supabase SQL editor:

```sql
update profiles set role = 'admin' where id = '<their-user-uuid>';
```
(Find their uuid in Supabase → Authentication → Users.)

---

## 4. Stopping / restarting later

- To stop the server: click into the terminal running `npm run dev` and press `Ctrl + C`.
- To start it again later: `cd` back into the folder and run `npm run dev` again.
- You do **not** need to run `npm install` again unless I send you new files
  that change `package.json`.

---

## 5. Deploying it for real (so it's on the internet, not just your laptop)

1. Push this folder to a GitHub repository (or ask me for help with this when you're ready).
2. Go to https://vercel.com, sign in, and "Import" that GitHub repo.
3. In Vercel's project settings, add the same environment variables from your
   `.env.local` file (Project Settings → Environment Variables).
4. Deploy. Vercel gives you a public URL your whole family can use.

---

## 6. Known gaps / things to wire up later

- **File uploads** (booking contracts, shopping receipts) currently show a file
  picker in the UI but aren't yet wired to Supabase Storage — say the word and
  I'll add a storage bucket + upload wiring.
- **Task assignment to specific accounts** (`assignee_id`) exists in the schema
  and RLS policies but the Tasks UI currently only stores a free-text assignee
  name — I can wire it to real user accounts so "my tasks only" filtering works
  properly for Family/Volunteer logins.
- **Email confirmations**: by default Supabase requires confirming email before
  first login. You can turn this off for testing in Supabase → Authentication →
  Providers → Email → "Confirm email" toggle.

## 7. New: Bride/Groom side switch

There's now a three-way switch (Anushka / Both / Rohan) in the top bar. It
filters Tasks, Budget, Shopping, Bookings, and Vendors (and the Dashboard's
stats) down to just one side, or shows everything. Every new item you add
picks up whichever side is currently selected — you can always change an
individual item's side afterward from its detail view.

Run `supabase/migrations/0004_side_and_shopping.sql` in the SQL editor if you
haven't already — it adds the `side` column everywhere, plus a
`remaining_qty` column for the simplified shopping list.
