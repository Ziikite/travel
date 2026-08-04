<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# china-trip-planner

## Purpose
중국 여행 공동 플래너 (China Trip Co-Planner) — a Next.js 16 App Router web app for planning group trips to China. Users create a trip room, invite others via an invite code, search and save/vote on places, build a shared day-by-day itinerary (drag-to-reorder), and manage a collaborative shopping list. State syncs in real time via Supabase Realtime, and an activity log records member actions.

## Key Files

| File | Description |
|------|--------------|
| `package.json` | Dependencies and npm scripts (`dev`, `build`, `start`, `lint`) |
| `README.md` | Korean-language setup guide: Supabase project + SQL migration, map API key, env vars |
| `.env.local.example` | Template for required env vars (Supabase URL/anon key, map API key/security code) |
| `next.config.ts` | Next.js configuration |
| `proxy.ts` | Root-level proxy helper (see also `lib/supabase/proxy.ts`) |
| `tsconfig.json` | TypeScript configuration |
| `eslint.config.mjs` | ESLint (flat config) rules, extends `eslint-config-next` |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router routes, layouts, and page UI (see `app/AGENTS.md`) |
| `lib/` | Shared types, Supabase client factories, trip context (see `lib/AGENTS.md`) |
| `public/` | Static assets (icons/SVGs) (see `public/AGENTS.md`) |
| `supabase/` | Database schema migrations and Supabase CLI config (see `supabase/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- UI copy is entirely in Korean (한국어) — preserve existing Korean strings and match tone/register when adding new UI text unless the user asks for a different language.
- Server Components fetch data directly via a Supabase server client (`lib/supabase/server.ts`); mutations go through Server Actions (`"use server"` files named `actions.ts`) rather than client-side API calls.
- Never bypass or duplicate authorization logic client-side — trip membership/role (`owner`/`editor`/`viewer`) is enforced via Supabase RLS policies defined in `supabase/migrations/`, and page/layout code re-checks membership server-side (see `app/trips/[tripId]/layout.tsx`).
- `.env.local` holds real Supabase/map credentials for local dev — never commit it or print its contents.

### Testing Requirements
- No automated test suite is configured yet. Validate changes with `npm run lint` and `npm run build`.

### Common Patterns
- Route folders follow Next.js App Router conventions: `page.tsx` (route UI), `layout.tsx` (shared shell), `actions.ts` (co-located Server Actions), bracket folders for dynamic segments (`[tripId]`, `[inviteCode]`).
- Forms submit via the React `action={serverActionFn}` prop, not client-side `fetch`.
- Client-only interactive pieces are split into separate `"use client"` components alongside their server-rendered parent.

## Dependencies

### Internal
- `lib/types.ts` — hand-written Supabase `Database` schema types shared across the app
- `lib/supabase/` — Supabase client factories for server/browser contexts
- `lib/trip-context.tsx` — React context exposing the current trip/role to nested client components

### External
- Next.js 16, React 19 — framework
- `@supabase/supabase-js`, `@supabase/ssr` — database, auth, and realtime sync
- `@dnd-kit/*` — drag-and-drop for the itinerary board
- `nanoid` — invite code generation
- Tailwind CSS 4 — styling
- Map integration — see `lib/AGENTS.md` for details (README references 고덕지도/AMap; `@googlemaps/js-api-loader` is also a dependency)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
