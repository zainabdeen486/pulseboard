# PulseBoard — Real-Time Admin Dashboard

A production-style admin dashboard built with **React 19, TypeScript, Vite, Tailwind CSS v4,
TanStack Table v8, TanStack Virtual, Recharts, React Router,** and **Lucide icons**.

It demonstrates the patterns used in real enterprise admin panels — plus the engineering
depth that separates senior work from tutorial work: a **simulated real-time data stream**,
a **virtualized 50,000-row table**, a **⌘K command palette**, **dark mode**, a
**notification center**, and an **audit trail** for privileged actions.

## Demo credentials

No backend — sign in with one of the demo roles on the login screen:

| Role | Permissions |
|---|---|
| **Administrator** | Full access: manage orders, team roles, audit log, everything |
| **Manager** | Approve / refund orders. Team section is hidden |
| **Viewer** | Read-only: dashboards and reports only |

Session is kept in `sessionStorage`, so a refresh keeps you signed in.

## Features

- **Live data stream** — orders land every ~2.5s: KPIs tick up, the revenue chart grows a
  live tail, the recent-orders feed highlights new rows, and notifications fire. Pausable
  from the dashboard or orders page (`src/live/`)
- **Orders** — 50,000 seeded rows in a **virtualized** TanStack Table (only viewport rows
  render — the footer shows the live rendered/total count) with global search, status
  filter, column sorting, and column visibility; new live orders stream in on top;
  managers/admins can approve or refund inline (each action is audit-logged and raises
  a notification)
- **⌘K command palette** — fuzzy-ish search across pages, actions (toggle live stream,
  toggle theme, sign out), and all 50,000 orders with deep links (`/orders?q=ORD-…`)
- **Notifications center** — header bell with unread badge, fed by the live stream and
  by your own approve/refund actions
- **Audit log** — every privileged action (sign in/out, approve, refund, role change,
  suspend/reactivate) recorded with actor + timestamp, persisted to `localStorage`
- **Dark mode** — class-based Tailwind v4 theme, persisted, respects OS preference,
  charts re-theme too
- **Dashboard** — KPI cards with sparklines and period deltas, revenue trend (area chart),
  orders by category (donut), revenue by region (bar), live recent-orders feed
- **Team** — admin-only route: change member roles, suspend/reactivate members
- **Role-based UI** — navigation, routes, and row actions all gated by a central
  permission system (`src/auth/AuthContext.tsx`)
- **Route-based code splitting** — pages lazy-load via `React.lazy`, keeping the
  initial bundle lean
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
  App.tsx            # router + auth guard + route-level code splitting
  main.tsx           # entry (ThemeProvider → AuthProvider → LiveProvider)
  index.css          # Tailwind v4 theme + dark variant
  theme.tsx          # dark-mode provider + toggle
  auth/AuthContext.tsx   # demo auth + role/permission system
  data/mock.ts           # types + seeded mock data (incl. 50k-row dataset)
  live/
    engine.ts        # framework-free live data generators
    LiveContext.tsx  # real-time stream: orders, KPIs, notifications
    audit.ts         # audit-trail external store (useSyncExternalStore)
  components/
    Layout.tsx       # sidebar + header shell (⌘K listener, bell, theme toggle)
    DataTable.tsx    # reusable TanStack Table (search/sort/paginate)
    VirtualDataTable.tsx # virtualized table for 50k+ rows
    CommandPalette.tsx   # ⌘K palette
    NotificationsBell.tsx
    ui.tsx           # Card, Badge, KpiCard, PageHeader, …
  pages/
    Login.tsx Dashboard.tsx Orders.tsx Team.tsx AuditLog.tsx
```

## Deploy

Any static host works (`dist/` after `npm run build`): Vercel, Netlify, Cloudflare Pages,
or GitHub Pages. No environment variables or backend required.

---
Built as a portfolio project. All data is fictional and generated locally.
