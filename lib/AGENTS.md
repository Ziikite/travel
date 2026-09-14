<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# lib

## Purpose
Shared, non-route application code: the hand-written Supabase database types, the Supabase client factories (server/browser/middleware), the React context that exposes the current trip and the viewer's role to nested client components, and the map-search integration used by the place-search dialog and itinerary map.

## Key Files

| File | Description |
|------|--------------|
| `maps.ts` | Dual-provider map module: tries the 고덕지도(AMap) JS API (via `@amap/amap-jsapi-loader`) first and falls back to 구글맵 (via `@googlemaps/js-api-loader`). Exposes `searchPlaces()` (AMap → Google fallback), `loadMapProvider()` (returns a `MapHandle` discriminated union for the map widget), and `mapUrl()`/`amapUrl()`/`googleMapsUrl()` deep-link helpers. |
| `trip-context.tsx` | `"use client"` React context (`TripProvider`/`useTrip`) exposing `{ tripId, role, trip }` to client components under a trip route. Already documented elsewhere — listed here for completeness only. |
| `types.ts` | Hand-written Supabase `Database` schema types (tables, RPC signatures) plus shared enum-like types (`Role`, `Priority`, etc). Already documented elsewhere — listed here for completeness only. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `supabase/` | Supabase client factories for server, browser, and middleware/proxy contexts (see `supabase/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `lib/maps.ts` wraps both `@amap/amap-jsapi-loader` and `@googlemaps/js-api-loader`, and guards every loader function against SSR (`typeof window === "undefined"` → throws/rejects with a Korean error message) because both JS loaders only work in the browser — always call `searchPlaces`/`loadMapProvider`/etc. from client components, not Server Components/Actions.
- 고덕지도 is the primary provider and 구글맵 is the automatic fallback: `searchPlaces()` tries AMap and falls back to Google on any failure (missing key, script load error, search error), and `loadMapProvider()` does the same for the interactive map widget. The widget deliberately renders a whole trip with the single provider the chain resolved to — never mix providers or convert coordinates there.
- `NEXT_PUBLIC_AMAP_KEY`/`NEXT_PUBLIC_AMAP_SECURITY_CODE` (AMap; the security code is required for keys issued since 2021 and is set on `window._AMapSecurityConfig` before the loader runs) and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Google fallback) are the env vars `maps.ts` reads. Both providers are cached via module-level promises (`amapLoadPromise`, `mapProviderPromise`, `googleOptionsSet`) so each SDK loads at most once per page load.
- The `places.amap_poi_id` column (see `supabase/migrations/0001_init.sql` and `lib/types.ts`) stores the POI id returned by `searchPlaces()` (an AMap POI id or a Google place id depending on which provider answered). `places.coordinate_system` **varies per record** — always persist `PlaceSearchResult.coordinateSystem` (`"GCJ02"` for AMap, `"WGS84"` for Google) from the result that produced the row; never hardcode it, since the same install can produce both. `mapUrl()` reads that column back to pick the right deep-link provider per place (opening a GCJ02 coordinate in Google Maps lands in the wrong spot).

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build`.

### Common Patterns
- `types.ts` is the single source of truth for the DB shape passed as the generic parameter to both `createBrowserClient<Database>` and `createServerClient<Database>` in `lib/supabase/`.
- Files in this directory are framework-agnostic utilities/types, not route handlers — route-level Server Actions and Server Components import from here rather than duplicating client construction or map-loading logic.

## Dependencies

### Internal
- `lib/supabase/` — Supabase client construction consumed by app routes.

### External
- `@amap/amap-jsapi-loader` — 고덕지도(AMap) JS API loading, the primary provider (`maps.ts`).
- `@googlemaps/js-api-loader` (+ `@types/google.maps`) — 구글맵 JS API loading, the automatic fallback provider (`maps.ts`).
- `@supabase/ssr`, `@supabase/supabase-js` — used by `lib/supabase/*` (typed via `types.ts`).
- `react` — `trip-context.tsx`'s Context API usage.

<!-- MANUAL: -->
