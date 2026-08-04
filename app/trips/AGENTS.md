<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# trips

## Purpose
Authenticated app shell and trip list. `layout.tsx` gates every nested route behind a logged-in Supabase user and renders the shared header; `page.tsx` lists the current user's trips and lets them create a new one. Per-trip feature pages live under the `[tripId]/` dynamic segment, and the invite-join flow lives under `join/`.

## Key Files

| File | Description |
|------|--------------|
| `layout.tsx` | Fetches the current user + profile nickname, renders `AppHeader`, wraps all `/trips/*` routes |
| `page.tsx` | `/trips` — lists the user's trips (ordered by start date), empty state, error banner from query param |
| `AppHeader.tsx` | Top nav bar: app name link + nickname/sign-out form (only when logged in) |
| `CreateTripDialog.tsx` | `"use client"` `<dialog>`-based form to create a trip (title, destination, dates) |
| `actions.ts` | `"use server"` — `createTrip`: generates a unique `nanoid(8)` invite code (retries up to 5x on collision) and inserts the trip |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[tripId]/` | All per-trip feature pages: places, itinerary, shopping, settings (see `[tripId]/AGENTS.md`) |
| `join/` | Invite-code join flow for non-members (see `join/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `layout.tsx` is the auth gate for the whole authenticated app — do not assume `page.tsx` here or in `[tripId]/` needs to re-check for a logged-in user, but `[tripId]/layout.tsx` does still independently re-verify trip membership.
- `createTrip`'s retry loop only retries on Postgres unique-violation (`error.code === "23505"`, the invite_code collision case) — other errors break immediately and surface via the `?error=` query param.

### Testing Requirements
- No automated tests; exercise the create-trip flow manually against Supabase.

### Common Patterns
- List/detail pages read straight from Supabase in the Server Component; only the dialog/form pieces are client components.

## Dependencies

### Internal
- `lib/supabase/server.ts`, `lib/types.ts` (`Trip` type)
- `app/login/actions.ts` (`signOut`, used by `AppHeader`)

### External
- `nanoid` — invite code generation

<!-- MANUAL: -->
