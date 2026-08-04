<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# migrations

## Purpose
Ordered SQL migration files applied to the Supabase Postgres database. Currently a single file (`0001_init.sql`) that creates the entire schema in one shot: all ten tables, the `profiles`-mirroring trigger, trip-creation side effects, `updated_at` maintenance triggers, an `activity_logs` auto-logging trigger, two invite-flow RPC functions, RLS helper functions, RLS policies for every table, and the Realtime publication list.

## Key Files

| File | Description |
|------|--------------|
| `0001_init.sql` | Full initial schema: `profiles`, `trips`, `trip_members`, `places`, `place_votes`, `itineraries`, `itinerary_places`, `shopping_lists`, `shopping_items`, `activity_logs`; triggers `handle_new_user` (mirrors `auth.users` → `profiles`), `handle_new_trip` (auto-inserts the owner as a `trip_members` row + creates a default `'쇼핑리스트'` shopping list on trip creation), `set_updated_at` (on 6 tables), `log_activity` (on `places`, `place_votes`, `itinerary_places`, `shopping_items`); RPC functions `get_trip_preview` and `join_trip`; RLS helper functions `is_trip_member`/`is_trip_editor`/`is_trip_owner`/`trip_id_of_place`/`trip_id_of_itinerary`/`trip_id_of_shopping_list`; RLS policies on all 10 tables; and `alter publication supabase_realtime add table ...` for 7 tables (`trip_members`, `places`, `place_votes`, `itineraries`, `itinerary_places`, `shopping_items`, `activity_logs` — notably NOT `trips` or `profiles`). |

## For AI Agents

### Working In This Directory
**RLS strategy — role/membership is checked via `SECURITY DEFINER` helper functions, not inline subqueries:**
- Six helper functions (`is_trip_member(p_trip_id)`, `is_trip_editor(p_trip_id)`, `is_trip_owner(p_trip_id)`, plus three `trip_id_of_*(p_id)` lookups for `places`/`itineraries`/`shopping_lists`) are `language sql security definer stable`. Every RLS policy calls one of these rather than embedding a raw `exists(select ... from trip_members ...)` subquery inline — this keeps policies short and centralizes the membership/role logic in one place. If membership semantics ever change (e.g. adding a new role), these six functions are the only place that needs to change; the ~30 policies built on top of them do not.
- Role hierarchy used throughout: `owner` and `editor` both pass `is_trip_editor`; only `owner` passes `is_trip_owner`; any of the three roles passes `is_trip_member`. Write access to `places`/`itineraries`/`itinerary_places`/`shopping_lists`/`shopping_items` requires `is_trip_editor` (i.e. `viewer`s are read-only); deleting a `trip` or updating/deleting `places` requires `is_trip_owner` specifically (an `editor` can insert/update places but not delete them or the trip itself).
- `trip_members` has no direct INSERT policy at all — rows are only ever created via the `handle_new_trip` trigger (owner, on trip creation) or the `join_trip` RPC (editor, on invite acceptance), both `SECURITY DEFINER`. This is a deliberate way to prevent a client from directly inserting arbitrary membership rows through PostgREST.
- `activity_logs` similarly has no INSERT policy — rows are only created by the `log_activity()` trigger (`SECURITY DEFINER`), so clients can only ever read their trip's activity log, never write to it directly.

**What `get_trip_preview` and `join_trip` actually do:**
- `get_trip_preview(p_invite_code text)` — `language sql security definer stable`. Returns a table of `(id, title, destination_city, start_date, end_date)` for the trip matching `invite_code`. Because it's `SECURITY DEFINER`, it bypasses the `trips_select` RLS policy (which normally requires membership), so an anonymous or non-member authenticated user can preview a trip by code alone — but the function is deliberately narrow: it exposes only those 5 columns, never `owner_id`, `invite_code` itself, or anything else on `trips`.
- `join_trip(p_invite_code text)` — `language plpgsql security definer`. Looks up the trip id by invite code; raises an exception `'invalid invite code'` if not found (which the calling Server Action in `app/trips/join/[inviteCode]/actions.ts` treats as an error and redirects back with a Korean error message); otherwise inserts `(trip_id, auth.uid(), 'editor')` into `trip_members` with `on conflict (trip_id, user_id) do nothing` (idempotent — re-joining an already-joined trip is a no-op, not an error) and returns the `trip_id` (`uuid`). Both functions are `grant execute ... to authenticated` only — anonymous (logged-out) users cannot call them directly; the join page's own logged-out gating happens at the Next.js layer (redirect to `/login`) before this RPC is ever reached.

### Testing Requirements
- No automated tests; validate the app with `npm run lint` / `npm run build`. Validate this migration specifically by applying it to a fresh Supabase project (or `supabase db reset` locally) and confirming it runs top-to-bottom with no errors, then exercising the invite flow (`get_trip_preview` with a valid/invalid code, `join_trip` as a new member and as an already-joined member) via the Supabase SQL editor or the app itself.

### Common Patterns
- Every mutable table has a `set_updated_at` trigger rather than relying on the application layer to set `updated_at` — Server Actions should not attempt to set `updated_at` manually on update statements.
- New tables that need Realtime should be added to `supabase_realtime` publication explicitly (as done for 7 of the 10 tables here) — it is not automatic.

## Dependencies

### Internal
- `lib/types.ts` — must mirror any schema change made here (tables, RPC signatures) by hand.
- `app/trips/join/[inviteCode]/actions.ts` and `page.tsx` — call `join_trip` and `get_trip_preview` respectively.

### External
- Supabase/Postgres built-ins: `gen_random_uuid()`, `auth.users`, `auth.uid()`, `pgcrypto`/`pgsql` trigger mechanics, `supabase_realtime` publication.

<!-- MANUAL: -->
