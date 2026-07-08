# AvalAgent Sales

A minimal, advanced sales dashboard for tracking customer leads — built with
Next.js 16 (App Router) + Supabase + Tailwind v4.

Track each customer with their Instagram username, phone number, service
interest (`ai`, `website`, `ai+website`), status (`pending`, `accepted`,
`rejected`), and a free-form note. Every status change is captured in an
activity timeline.

## Setup

The dashboard is locked to **two operator accounts**. Sign-up is closed in the
UI and rejected server-side; accounts are provisioned by a seed script.

### 1. Create a Supabase project
It's free at [supabase.com](https://supabase.com/dashboard). Once created,
copy the following from *Project Settings → API*:

| Key                              | Where you'll paste it                  |
| -------------------------------- | -------------------------------------- |
| **Project URL**                  | `NEXT_PUBLIC_SUPABASE_URL`             |
| **anon public key**              | `NEXT_PUBLIC_SUPABASE_ANON_KEY`        |
| **service_role (secret) key**    | `SUPABASE_SERVICE_ROLE_KEY` (server)   |

### 2. Add credentials
Copy `.env.example` to `.env.local` and fill in the three values above.
Remember: the `service_role` key must **never** be committed or shipped to the
client — it's only ever read by `npm run seed`.

### 3. Run the migration
In the Supabase dashboard, open **SQL Editor**, paste the contents of
[`supabase/schema.sql`](./supabase/schema.sql), and click **Run**. This creates
the `customers`, `activities`, and `profiles` tables with indexes, RLS, and
an auto-profile-on-sign-up trigger.

### 4. Provision the two operator accounts
```bash
npm run seed
```
This uses the service-role key to create (or update, on re-runs):

| Email                       | Password        | Display name |
| --------------------------- | --------------- | ------------ |
| `sobhan@avalagent.local`    | `Sobhan123456`  | Sobhan       |
| `milad@avalagent.local`     | `Milad123456`   | Milad        |

The seed script is **idempotent** — re-running rotates the passwords back to
the values above. To change them, edit `scripts/seed-users.mjs` and rerun.

### 5. Start the app
```bash
npm install
npm run dev
```

Open http://localhost:3000 → you'll land on the sign-in screen. Use either
of the two operator accounts from the table above.

> 🛑 Self–sign-up is intentionally disabled. The login UI has no "Create
> account" tab and the `signUp` server action refuses any email that isn't
> one of the two whitelisted addresses. To rotate credentials or add/replace
> operators, edit `scripts/seed-users.mjs` and run `npm run seed` again.

## Features

- **Overview dashboard** with KPI cards (total, pending, accepted,
  conversion rate, realized revenue, pipeline value).
- **Interactive charts** — service breakdown donut, conversion funnel.
- **Recent customers** strip on the dashboard.
- **Full customer list** with search (Instagram, phone, note), filter by
  status/service, and sort by date.
- **Bulk actions** — mark multiple customers as accepted/pending/rejected or
  delete them.
- **Detail slide-over** with edit form + inline status buttons.
- **Activity timeline** — automatically logs every status change and note.
- **Auth** — locked to two seeded operator accounts; row-level security on
  all tables.
- **Responsive** — sidebar collapses to a sheet menu on mobile.
- **URL-driven filters** — share or bookmark any filtered view.

## Project layout

```
app/                    # Next.js App Router pages
  page.tsx              # Dashboard overview
  customers/page.tsx    # Customer list + detail panel
  login/page.tsx        # Sign in
  api/customers/        # JSON endpoint (used by client form)
  globals.css           # Design tokens + Tailwind v4 theme
auth/                   # Auth route handlers
components/
  ui/                   # Button, Input, Card, Dialog, Badge, …
  layout/               # DashboardShell, Sidebar, MobileNav, UserMenu
  dashboard/            # StatCard, ServiceDonut, ConversionFunnel, …
  customers/            # Table, Filters, Form, Detail panel, Timeline
  auth/                 # LoginForm
lib/
  supabase/             # Server + browser Supabase clients, middleware
  actions/              # Server actions (customers, auth)
  queries.ts            # Read-side data helpers
  format.ts             # Date / currency / label formatters
  cn.ts                 # Tailwind class utility
middleware.ts           # Refreshes auth tokens & guards routes
scripts/
  seed-users.mjs        # Provision the two operator accounts
supabase/schema.sql     # One-shot migration
types/database.ts       # Row-level DB types
```

## Conventions

- All mutations go through **Server Actions** (`lib/actions/*`) and trigger
  `revalidatePath` to refresh affected pages.
- All read paths run in **Server Components** with the awaited cookie-based
  Supabase client.
- UI state that's shareable (filters, sort, selected detail, "new customer"
  modal flag) lives in **URL params** so it can be bookmarked.
- Authentication is closed. The only way to add an account is to edit
  `scripts/seed-users.mjs` and run `npm run seed`.

## License
MIT — yours to ship.
