# FieldForge — AI Assistant Guide

This document provides a complete reference for AI assistants (Claude, etc.) working in this codebase. Read it before making changes.

---

## Project Overview

**FieldForge** is a Progressive Web App (PWA) for field service management. It helps field service businesses manage proposals, jobs, customers, and photo documentation — including offline support via IndexedDB and a service worker.

- **Production URL**: https://fieldforge-eight.vercel.app
- **Tech Stack**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL)
- **Deployment**: Vercel (serverless)
- **Package Manager**: npm

---

## Repository Structure

```
fieldforge/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── admin/              # Admin features (customer link generation)
│   │   ├── api/
│   │   │   ├── proposals/      # CRUD API for proposals (route.ts)
│   │   │   └── test/           # Diagnostic endpoint
│   │   ├── customer/[customerId]/portal/  # Customer-facing portal
│   │   ├── customers/          # Customer management UI
│   │   ├── jobs/               # Job list and [id] detail view
│   │   ├── offline/            # Offline status page
│   │   ├── proposals/          # Proposal list + /create page
│   │   ├── globals.css         # Global Tailwind CSS
│   │   ├── layout.tsx          # Root layout (PWA setup)
│   │   ├── manifest.ts         # PWA manifest (dynamic)
│   │   └── page.tsx            # Dashboard homepage
│   ├── components/             # Reusable React components (21 total)
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utility libraries
├── db/
│   └── schema.sql              # PostgreSQL schema (source of truth)
├── public/
│   ├── manifest.json           # PWA manifest (static)
│   └── sw.js                   # Service Worker
├── tests/                      # Test scripts and UAT documentation
├── next.config.ts              # Next.js config (headers, rewrites, images)
├── eslint.config.mjs           # ESLint config
├── postcss.config.mjs          # PostCSS (Tailwind)
├── tsconfig.json               # TypeScript (strict mode)
└── package.json
```

---

## Development Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build (runs TypeScript + ESLint checks)
npm run start     # Start production server locally
npm run lint      # Run ESLint
```

**Always run `npm run build` to check for type errors before committing.** There is no separate `npm test` script — see Testing section below.

---

## Environment Variables

Create `.env.local` locally (never commit it). Required variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
```

On Vercel, these are set via the Supabase integration automatically. See `SUPABASE_SETUP.md` and `DATABASE_SETUP.md` for setup instructions.

---

## Architecture & Key Patterns

### App Router Conventions

- **Server Components** are the default — used for layouts and pages that don't need interactivity.
- **Client Components** must have `'use client'` at the top of the file. Use for any component with hooks, event handlers, or browser APIs.
- **API Routes** live under `src/app/api/` and export named async functions (`GET`, `POST`, `PUT`, `DELETE`). Use `NextRequest`/`NextResponse` for type safety.

### Database Access

The database is PostgreSQL hosted on Supabase. Access it via the Supabase client:

```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase.from('proposals').select('*')
```

`@prisma/client` and `@vercel/postgres` are also installed but Supabase is the primary client. Do not mix clients for the same tables without good reason.

### Offline Storage

`src/lib/offlineStorage.ts` manages an IndexedDB database using the `idb` library. All offline data goes through this layer. The `StoredJob` interface is the main offline entity (16 properties). Always maintain sync status: `synced | pending | failed`.

### Styling

- **Tailwind CSS v4** — use utility classes exclusively.
- Use `cn()` from `src/lib/utils.ts` for conditional class merging: `cn('base-class', condition && 'conditional-class')`.
- No CSS Modules. No inline `style` props unless absolutely necessary.

### Component Conventions

- Component files are PascalCase matching their export name (e.g., `ProposalBuilder.tsx`).
- Group components by feature, not by type. All proposal-related components are named `Proposal*`.
- Custom hooks live in `src/hooks/` and are prefixed with `use` (e.g., `useJobsData.ts`).

### Utility Functions

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client + `generateProposalNumber()` (format: `P-YYYYMM-XXXX`) |
| `src/lib/offlineStorage.ts` | IndexedDB read/write for offline PWA functionality |
| `src/lib/cameraService.ts` | Camera access, photo capture, compression |
| `src/lib/seedData.ts` | Mock data for development only |
| `src/lib/utils.ts` | `cn()` classname utility |

---

## Database Schema

Three core tables (see `db/schema.sql` for full definitions):

### `customers`
- `id` (UUID PK), `name`, `contact_person`, `email`, `phone`, `address`
- `created_at`, `updated_at` (auto-updated via trigger)

### `proposals`
- `id` (UUID PK), `proposal_number` (unique, auto-generated), `customer_id` (FK)
- Customer snapshot fields: `customer_name`, `customer_contact`, `customer_email`, `customer_address`
- `project_title`, `project_description`, `project_location`, `project_timeline`
- `status`: `draft | sent | viewed | accepted | declined`
- Financial: `subtotal`, `tax_rate`, `tax_amount`, `total` (DECIMAL)
- Timestamps: `sent_at`, `viewed_at`, `accepted_at`, `declined_at`, `created_at`, `updated_at`

### `proposal_line_items`
- `id` (UUID PK), `proposal_id` (FK, CASCADE DELETE)
- `category`: `Labor | Materials | Equipment | Permits | Other`
- `description`, `quantity`, `unit_price`, `total`, `sort_order`

**When modifying schema**, update `db/schema.sql` AND run the SQL against the Supabase database. There is no migration runner — schema changes are applied manually via the Supabase SQL editor or the `psql` CLI.

---

## Key API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/proposals` | Create a new proposal with line items |
| `GET` | `/api/proposals` | List proposals (supports query params) |
| `PUT` | `/api/proposals` | Update an existing proposal |
| `DELETE` | `/api/proposals` | Delete a proposal |
| `GET` | `/api/test` | Diagnostic: check DB connection and env vars |

Always check `/api/test` when debugging database connectivity issues.

---

## PWA & Service Worker

- `public/sw.js` — the service worker handles offline caching.
- `src/app/layout.tsx` — registers the service worker on mount.
- `src/app/manifest.ts` — dynamic PWA manifest (also `public/manifest.json` as static fallback).
- `next.config.ts` — rewrites `/sw.js` with no-cache headers; sets Content Security Policy for service worker.

Do not break service worker registration when editing the root layout.

---

## Testing

There is no Jest/Vitest setup. Testing is done via:

1. **PowerShell API tests** (`tests/test-proposals-api.ps1`) — automated HTTP calls to test CRUD endpoints. Run manually on Windows.
2. **UAT checklists** (`UAT.md`, `UAT-PLAN.md`) — structured manual testing procedures.
3. **Diagnostic endpoint** — `GET /api/test` to verify DB connectivity.

When verifying changes, run `npm run build` for type/lint errors, then manually test affected routes in the browser or with the PowerShell scripts.

---

## TypeScript

- **Strict mode is enabled.** Fix all type errors — do not use `any` as a shortcut.
- Run `npm run build` to get full type-checking output (Next.js runs `tsc --noEmit` during build).
- `tsconfig.json` paths: `@/*` maps to `src/*`.

---

## ESLint

Config: `eslint.config.mjs` — extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

Ignored directories: `.next`, `out`, `build`.

Run: `npm run lint`

Fix all ESLint errors before committing. Do not add `// eslint-disable` comments without a strong justification.

---

## Security

`next.config.ts` sets HTTP security headers on all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

Do not weaken these headers. If adding new API routes that accept user input, validate at the boundary — do not trust client-supplied data passed directly to database queries.

---

## Common Pitfalls

- **Environment variables**: `NEXT_PUBLIC_*` are exposed to the browser. Never put secrets in `NEXT_PUBLIC_*` variables.
- **Mock data**: `src/lib/seedData.ts` is for development only. Some pages still load from seed data — prefer fetching from the API/Supabase.
- **Offline storage vs. database**: The app has two data layers (IndexedDB for offline, Supabase for server). Be clear which layer a given piece of code targets and keep sync logic explicit.
- **Supabase RLS**: If queries return empty results unexpectedly, check Row Level Security policies in the Supabase dashboard. See `TROUBLESHOOTING.md`.
- **No migration runner**: Schema changes must be applied manually in Supabase SQL editor and reflected in `db/schema.sql`.
- **Proposal numbers**: Always use `generateProposalNumber()` from `src/lib/supabase.ts` — format is `P-YYYYMM-XXXX`.

---

## Deployment

Pushes to `master` auto-deploy to Vercel. Environment variables are managed in the Vercel dashboard (Supabase integration populates them automatically).

To verify a deployment is healthy: visit `https://fieldforge-eight.vercel.app/api/test`.

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Basic Next.js getting started (minimal customization) |
| `DATABASE_SETUP.md` | Vercel Postgres + schema setup guide |
| `SUPABASE_SETUP.md` | Supabase table creation and verification |
| `TROUBLESHOOTING.md` | Debug guide (env vars, CORS, RLS, logs) |
| `TESTING_COMPLETE.md` | Record of resolved issues and test results |
| `UAT.md` | User Acceptance Testing workflow |
| `UAT-PLAN.md` | Structured UAT plan |
