<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# supabase

## Purpose
Three thin Supabase client factories, one per execution context: a cookie-based server client for Server Components/Actions, a browser client for Client Components, and a request/response-based client used by the top-level proxy (middleware-equivalent) to refresh auth sessions and gate routes. All three are typed with the shared `Database` type from `lib/types.ts`.

## Key Files

| File | Description |
|------|--------------|
| `client.ts` | `createClient()` — browser Supabase client via `createBrowserClient<Database>`, reading `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Use only in `"use client"` components. |
| `server.ts` | `async createClient()` — server Supabase client via `createServerClient<Database>`, wired to Next.js's `cookies()` (awaited, per Next 16 async APIs). Cookie writes are wrapped in try/catch because Server Components can't set cookies — the comment notes the proxy handles session refresh instead. Use in Server Components and Server Actions. |
| `proxy.ts` | `async updateSession(request)` — builds a request-scoped Supabase client (get/set cookies against the `NextRequest`/`NextResponse` pair), calls `supabase.auth.getUser()` to refresh the session, then applies route gating: unauthenticated users are redirected to `/login?redirect=...` unless the path is `/login`, `/`, or starts with `/trips/join`; authenticated users hitting `/login` are redirected to `/trips`. This is invoked from the root-level `proxy.ts` (Next.js 16's replacement entry point for what was previously `middleware.ts`). |

## For AI Agents

### Working In This Directory
- **Pick the right client for the context**: `server.ts`'s `createClient()` for Server Components/Server Actions (has access to Next's cookie store), `client.ts`'s `createClient()` for Client Components (browser cookies via `document.cookie` under the hood), and `proxy.ts`'s `updateSession()` only from the root `proxy.ts` request pipeline. Do not use the browser client in a Server Component or vice versa — both export a same-named `createClient` but have different signatures (`server.ts`'s is `async`, `client.ts`'s is sync).
- `proxy.ts` is the only server-side authorization gate for whole-route access (logged-in vs not); it does **not** check trip membership or role — that's enforced separately by RLS policies (`supabase/migrations/0001_init.sql`) and by page/layout-level checks (see `app/trips/[tripId]/layout.tsx`). Do not assume passing through `proxy.ts` means the user has access to a specific trip.
- `proxy.ts`'s public-route allowlist (`/login`, `/`, and anything starting with `/trips/join`) must stay in sync with which routes actually need to work while logged out — currently only the invite preview/join flow.
- None of these files perform their own authorization logic beyond "is there a user" — role/ownership checks are always delegated to Postgres RLS via the `is_trip_member`/`is_trip_editor`/`is_trip_owner` SQL functions.

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build`. Session/redirect behavior in `proxy.ts` is best checked manually (logged out access to a protected route, logged in access to `/login`).

### Common Patterns
- All three clients are generic over `Database` from `lib/types.ts`, so any schema change there should be checked against `npm run build` for type errors surfaced through these clients.
- Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are read with non-null assertions (`!`) in all three files — they're expected to always be set via `.env.local`.

## Dependencies

### Internal
- `lib/types.ts` — the `Database` type parameter for `createServerClient`/`createBrowserClient`.

### External
- `@supabase/ssr` — `createServerClient`, `createBrowserClient`.
- `next/headers` (`cookies`) — used in `server.ts`.
- `next/server` (`NextResponse`, `NextRequest`) — used in `proxy.ts`.

<!-- MANUAL: -->
