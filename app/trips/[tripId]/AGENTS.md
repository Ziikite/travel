<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# [tripId]

## Purpose
Per-trip workspace, keyed by the trip's UUID in the URL. `layout.tsx` re-verifies the current user is a member of this specific trip (owner/editor/viewer) and provides trip/role context to all nested pages via `TripProvider`; `TripNav` renders the tab bar for the four feature areas.

## Key Files

| File | Description |
|------|--------------|
| `layout.tsx` | Loads the trip and the caller's `trip_members` row; `notFound()` if either is missing; wraps children in `TripProvider` |
| `page.tsx` | `/trips/[tripId]` — redirects immediately to `/trips/[tripId]/places` (places is the default tab) |
| `TripNav.tsx` | `"use client"` tab bar (장소/일정/쇼핑리스트/설정 = places/itinerary/shopping/settings) using `usePathname` for active state |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `places/` | Search AMap for places, save, vote, filter/sort, soft-delete/restore (see `places/AGENTS.md`) |
| `itinerary/` | Day-by-day itinerary board with drag-to-reorder and map view (see `itinerary/AGENTS.md`) |
| `shopping/` | Shared shopping list with assignee/quantity/price/status (see `shopping/AGENTS.md`) |
| `settings/` | Trip settings, invite sharing, activity feed (see `settings/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `layout.tsx` is the authorization boundary for this specific trip: it treats "trip not found" and "user not a member" identically (both `notFound()`) rather than distinguishing 403 vs 404 — preserve that behavior unless the product intentionally wants to reveal trip existence to non-members.
- `useTrip()` (from `lib/trip-context.tsx`) is how nested client components read `tripId`, `role`, and `trip` — it throws if used outside this layout's subtree, so don't call it from components rendered outside `[tripId]/`.
- Role (`owner`/`editor`/`viewer`) gates UI affordances here, but the real enforcement is Supabase RLS — don't rely on `role` checks in client components as the security boundary.

### Testing Requirements
- No automated tests; manually verify by loading `/trips/<id>` as members with each role and as a non-member (should 404).

### Common Patterns
- Every nested feature page can assume `TripProvider` context is available and doesn't need to re-fetch the trip or re-check membership.

## Dependencies

### Internal
- `lib/trip-context.tsx` (`TripProvider`, `useTrip`)
- `lib/supabase/server.ts`, `lib/types.ts`

<!-- MANUAL: -->
