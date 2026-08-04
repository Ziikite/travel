<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# [inviteCode]

## Purpose
Public-facing invite-link landing page. A user who receives a `/trips/join/{inviteCode}` link lands here to preview the trip (title, destination, dates) before joining. If they're not logged in they're sent to `/login` with a `redirect` back to this page; if they are logged in, submitting the form calls the `join_trip` Server Action which adds them as an `editor` member and redirects into the trip.

## Key Files

| File | Description |
|------|--------------|
| `page.tsx` | Server Component. Awaits `props.params`/`props.searchParams`, calls `get_trip_preview` RPC to render trip title/destination/dates (or an "invalid link" state if no row is returned), and checks `auth.getUser()` to decide whether to show a "참여하기" (join) form or a "로그인하고 참여하기" (login then join) link. |
| `actions.ts` | Server Action `joinTrip(formData)`. Reads `invite_code` from the form, requires an authenticated user (redirects to `/login?redirect=...` otherwise), calls the `join_trip` RPC, and redirects to `/trips/{tripId}` on success or back to this page with a Korean error message ("초대 링크가 유효하지 않습니다.") on failure. |

## For AI Agents

### Working In This Directory
- `get_trip_preview` and `join_trip` are `SECURITY DEFINER` Postgres RPC functions (defined in `supabase/migrations/0001_init.sql`) — they intentionally bypass RLS so a non-member can preview/join a trip by invite code alone, without being granted broader `trips`/`trip_members` SELECT access. Do not replace these RPC calls with direct table queries; a direct `select * from trips where invite_code = ...` would be blocked by RLS (`trips_select` requires existing membership).
- `join_trip` always assigns the new member the `editor` role (hardcoded in the SQL) — there is no UI or param to join as `viewer`.
- `join_trip` uses `on conflict (trip_id, user_id) do nothing`, so re-visiting/re-submitting an already-joined invite link is idempotent and just redirects into the trip rather than erroring.
- The RPC call for `get_trip_preview` returns a table (array); `page.tsx` reads `previews?.[0]` — an empty array (invalid code) is treated the same as a null/error case and renders the "유효하지 않은 초대 링크입니다" state.
- `params`/`searchParams` are async in this Next.js 16 App Router — both are awaited before use (`await props.params`, `await props.searchParams`).
- This route is reachable while logged out — `lib/supabase/proxy.ts` explicitly whitelists any path starting with `/trips/join` as public. Do not add a membership check to `page.tsx` itself; the preview must work for non-members by design.

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build`. Manually test: valid code + logged out, valid code + logged in (new member), valid code + logged in (already a member), invalid code.

### Common Patterns
- Server Action lives in a co-located `actions.ts` with `"use server"` and is wired to the form via `<form action={joinTrip}>` (no client-side fetch).
- Errors are surfaced via a redirect with a `?error=` query param rather than component state, since the mutation happens in a full Server Action redirect, not a client transition.

## Dependencies

### Internal
- `lib/supabase/server.ts` — `createClient()` used in both `page.tsx` and `actions.ts` for the cookie-based server Supabase client.
- `supabase/migrations/0001_init.sql` — defines `get_trip_preview` and `join_trip` RPC functions this directory calls.

### External
- `next/navigation` (`redirect`) — used in `actions.ts` for post-action navigation.
- `next/link` — used in `page.tsx` for the "내 여행방으로 이동" and login links.

<!-- MANUAL: -->
