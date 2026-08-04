<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# lib

## Purpose
Shared, non-route application code: the hand-written Supabase database types, the Supabase client factories (server/browser/middleware), the React context that exposes the current trip and the viewer's role to nested client components, and the map-search integration used by the place-search dialog and itinerary map.

## Key Files

| File | Description |
|------|--------------|
| `maps.ts` | Loads the Google Maps JS API (via `@googlemaps/js-api-loader`) and exposes `searchPlaces()`/`googleMapsUrl()` helpers — despite the README describing the long-term map provider as 고덕지도 (AMap), the code currently implemented is Google Maps only (see below). |
| `trip-context.tsx` | `"use client"` React context (`TripProvider`/`useTrip`) exposing `{ tripId, role, trip }` to client components under a trip route. Already documented elsewhere — listed here for completeness only. |
| `types.ts` | Hand-written Supabase `Database` schema types (tables, RPC signatures) plus shared enum-like types (`Role`, `Priority`, etc). Already documented elsewhere — listed here for completeness only. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `supabase/` | Supabase client factories for server, browser, and middleware/proxy contexts (see `supabase/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Map provider mismatch, resolved by reading the code**: `package.json` depends on `@googlemaps/js-api-loader` and `@types/google.maps`, and `lib/maps.ts` imports and uses only that library (`setOptions`, `importLibrary("maps"|"marker"|"places")`, `Place.searchByText`). There is no AMap/JSAPI code anywhere in the repo (`grep -ri amap` outside comments/column names returns nothing executable). The README (`README.md` line 5) is internally consistent with this: it states the app currently uses Google Maps and describes switching `lib/maps.ts` back to a 고덕지도(AMap)-based implementation later, once an AMap key is available, pointing at a past "Add AMap-based MVP" commit in git history. So this is not a stale/incorrect README — it is an accurate description of a deliberate, temporary Google Maps fallback. Do not "fix" this by re-adding AMap code without an explicit product request.
- `lib/maps.ts` guards every loader function against SSR (`typeof window === "undefined"` → rejects with a Korean error message) because the Google Maps JS loader only works in the browser — always call `searchPlaces`/`loadMapsLibrary`/etc. from client components, not Server Components/Actions.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is the env var `maps.ts` reads; it is set once via a module-level `optionsSet` flag so `setOptions` only runs once per page load.
- The `places.amap_poi_id` column (see `supabase/migrations/0001_init.sql` and `lib/types.ts`) is a legacy/generic name kept for forward-compatibility — it currently stores the Google Maps `place.id`, not an AMap POI id (see the Korean comment in `app/trips/[tripId]/places/PlaceSearchDialog.tsx`).

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build`.

### Common Patterns
- `types.ts` is the single source of truth for the DB shape passed as the generic parameter to both `createBrowserClient<Database>` and `createServerClient<Database>` in `lib/supabase/`.
- Files in this directory are framework-agnostic utilities/types, not route handlers — route-level Server Actions and Server Components import from here rather than duplicating client construction or map-loading logic.

## Dependencies

### Internal
- `lib/supabase/` — Supabase client construction consumed by app routes.

### External
- `@googlemaps/js-api-loader`, `@types/google.maps` — Google Maps JS API loading (`maps.ts`).
- `@supabase/ssr`, `@supabase/supabase-js` — used by `lib/supabase/*` (typed via `types.ts`).
- `react` — `trip-context.tsx`'s Context API usage.

<!-- MANUAL: -->
