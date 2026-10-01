# PulseBoard — Admin Dashboard

A production-style admin dashboard built with **React 19, TypeScript, Vite, Tailwind CSS v4,
TanStack Table v8, Recharts, React Router,** and **Lucide icons**.

It demonstrates the patterns used in real enterprise admin panels: KPI dashboards, data-dense
tables with sorting/filtering/pagination, charting, and **role-based access control**.

## Demo credentials

No backend — sign in with one of the demo roles on the login screen:

| Role | Permissions |
|---|---|
| **Administrator** | Full access: manage orders, team roles, everything |
| **Manager** | Approve / refund orders. Team section is hidden |
| **Viewer** | Read-only: dashboards and reports only |

Session is kept in `sessionStorage`, so a refresh keeps you signed in.

## Features

- **Dashboard** — KPI cards with sparklines and period deltas, revenue trend (area chart),
  orders by category (donut), revenue by region (bar), recent orders table
- **Orders** — 128 seeded orders in a TanStack Table with global search, status filter,
  column sorting, column visibility toggle, and pagination; managers/admins can
  approve or refund orders inline
- **Team** — admin-only route: change member roles, suspend/reactivate members
- **Role-based UI** — navigation, routes, and row actions all gated by a central
  permission system (`src/auth/AuthContext.tsx`)
- **Deterministic mock data** — seeded RNG in `src/data/mock.ts`, stable across reloads

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build
```

## Project structure

```
src/
  App.tsx            # router + auth guard
  main.tsx           # entry
  index.css          # Tailwind v4 theme
  auth/AuthContext.tsx   # demo auth + role/permission system
  data/mock.ts           # types + seeded mock data
  components/
    Layout.tsx       # sidebar + header shell
    DataTable.tsx    # reusable TanStack Table (search/sort/paginate)
    ui.tsx           # Card, Badge, KpiCard, PageHeader, …
  pages/
    Login.tsx Dashboard.tsx Orders.tsx Team.tsx
```

## Deploy

Any static host works (`dist/` after `npm run build`): Vercel, Netlify, Cloudflare Pages,
or GitHub Pages. No environment variables or backend required.

---
Built as a portfolio project. All data is fictional and generated locally.
