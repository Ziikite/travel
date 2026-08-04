<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# app

## Purpose
Next.js App Router tree containing every route, layout, and page-level UI component in the trip planner: the marketing landing page, authentication flow, and the authenticated trip workspace (trip list + per-trip feature tabs).

## Key Files

| File | Description |
|------|--------------|
| `layout.tsx` | Root HTML shell — fonts (Geist Sans/Mono), metadata, `<html>`/`<body>` wrapper |
| `page.tsx` | Landing page (`/`) with hero copy and a link into `/login` |
| `globals.css` | Tailwind import + light/dark CSS variables |
| `favicon.ico` | Site favicon |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `login/` | Email/password sign in, sign up, sign out (see `login/AGENTS.md`) |
| `trips/` | Authenticated app: trip list and all per-trip pages (see `trips/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Route structure follows Next.js App Router conventions: folder = URL segment, `page.tsx` = route UI, `layout.tsx` = shared shell wrapping child routes, `actions.ts` = co-located Server Actions.
- Dynamic segments use bracket folders (`[tripId]`, `[inviteCode]`) — params are async (`await props.params`) per this Next.js version's App Router API.

### Testing Requirements
- No route tests exist yet; verify manually via `npm run dev` and check `npm run build` / `npm run lint` pass.

### Common Patterns
- Pages are async Server Components that fetch data directly with the Supabase server client.
- Interactive UI is isolated into small `"use client"` components (e.g. dialogs, nav) rather than making whole pages client components.

## Dependencies

### Internal
- `lib/supabase/server.ts` — server-side Supabase client used by nearly every page/layout
- `lib/types.ts` — row types for Supabase queries

### External
- `next/link`, `next/navigation` (redirect, notFound, usePathname)

<!-- MANUAL: -->
