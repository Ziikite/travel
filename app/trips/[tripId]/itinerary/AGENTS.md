<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# itinerary

## Purpose
Day-by-day itinerary board for a trip: a date-tab picker (auto-derived from the trip's start/end dates plus any dates that already have an itinerary or were manually added), a drag-to-reorder list of places assigned to the selected date, and a map view (고덕지도(AMap) first, 구글맵 as an automatic fallback) plotting that day's places as numbered markers. Reordering, adding, removing, and per-item time/flag edits all write straight to Supabase from the client and sync to other viewers via Realtime.

## Key Files

| File | Description |
|------|--------------|
| `page.tsx` | Server Component; loads trip dates, all `itineraries` rows, active `places`, and `itinerary_places` (joined with `places(*)`) for the trip, then renders `ItineraryBoard` |
| `ItineraryBoard.tsx` | `"use client"` orchestrator: builds the date-tab list, holds `itineraries`/`itineraryPlaces` state, subscribes to Realtime, drives add/remove/drag-reorder, renders `ItineraryItemRow` list + `TripMap` |
| `ItineraryItemRow.tsx` | `"use client"` sortable row (`@dnd-kit/sortable`) for one itinerary place: drag handle, arrival/departure time inputs, "시간 고정"/"식사" checkboxes, a `mapUrl()` deep link labelled per the place's own `coordinate_system` (고덕지도/구글맵), copy-address button |
| `TripMap.tsx` | `"use client"` map wrapper; lazy-loads a provider via `loadMapProvider()` (고덕지도 first, 구글맵 fallback), branches on the returned `MapHandle`, and plots numbered markers for the current day's places — `setFitView()` (AMap) / `fitBounds()` (Google) when there are 2+ points |

## For AI Agents

### Working In This Directory
- Dates shown as tabs are a **union**, not just persisted itinerary rows: `buildDateRange(tripStartDate, tripEndDate)` ∪ existing `itineraries[].itinerary_date` ∪ locally-added `extraDates` (client-only state, added via the date `<input>`, lost on refresh until a place is actually added). An `itineraries` row for a date is only created lazily in `handleAddPlace()` via an `upsert` on `(trip_id, itinerary_date)` — picking a bare date tab with no items yet does not write anything.
- Drag reorder (`handleDragEnd`) recomputes `visit_order` as the item's new array index (0-based, contiguous) for the whole day and persists every row with `Promise.all` of individual `.update()` calls — no batch/transactional RPC, so a failure partway through can leave `visit_order` inconsistent with local state (local state is optimistically updated first either way).
- `RawItineraryPlace` / `stripEmbed()` in `ItineraryBoard.tsx` exists because `page.tsx` fetches `itinerary_places` with an embedded `places(*)`, but client state only tracks the flat `ItineraryPlace` rows (place lookup instead goes through the separately-fetched `allPlaces` → `placesById` map).
- Realtime for `itinerary_places` subscribes to the whole table (no `filter`) and then discards updates for itineraries not in `itinerariesRef.current` — a ref is used specifically so the callback (registered once in a `useEffect` keyed on `tripId`) always sees the latest itinerary id set without resubscribing.
- `role !== "owner" | "editor"` (i.e. `viewer`) disables the drag handle, remove button, add-place controls, and the date-add input, but nothing server-side in this directory blocks a viewer's Supabase client from calling `.update()`/`.insert()` directly — enforcement is RLS, not this UI.
- `TripMap` calls `loadMapProvider()` (not a single provider's loader) and branches on the `MapHandle` discriminated union — `provider: "amap"` uses `handle.AMap`, `provider: "google"` uses `handle.maps`/`handle.marker`. Each branch builds its own cleanup closure (markers + map) that the effect's return invokes. The whole trip renders with the one provider the fallback chain resolved to; deliberately no provider mixing or coordinate conversion here.
- `TripMap` still swallows load/init errors silently (empty `.catch`) — that outer catch now only fires when **both** providers fail to load, so the app keeps working with no map key at all; don't add error surfacing here without also handling the "no key configured" case gracefully.
- Map integration is dual-provider via `lib/maps.ts`: 고덕지도(AMap, `@amap/amap-jsapi-loader`) primary, 구글맵 (`@googlemaps/js-api-loader`) automatic fallback. `place.amap_poi_id` holds whichever provider's POI/place id produced the row (see `places/AGENTS.md`), and the row's deep link uses `mapUrl()` — which picks 고덕지도 vs 구글맵 **per place** from `place.coordinate_system` — rather than `amapUrl()` unconditionally. This per-place choice is independent of whichever provider `TripMap` happens to be using this session.

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build` and manual testing (drag-reorder across a day, switching date tabs, add/remove, viewer-role read-only behavior).

### Common Patterns
- Optimistic local `setState` update immediately, followed by a fire-and-forget Supabase mutation (no rollback on error) — consistent across add/remove/reorder/per-field edits.
- One Supabase Realtime channel per board instance (`itinerary-${tripId}`), subscribed in a `useEffect` on mount, torn down via `removeChannel` on unmount.

## Dependencies

### Internal
- `lib/trip-context.tsx` (`useTrip` for `role`)
- `lib/supabase/client.ts` (`createClient` for browser-side Realtime + mutations), `lib/supabase/server.ts` (server fetch in `page.tsx`)
- `lib/types.ts` (`Itinerary`, `ItineraryPlace`, `Place`, `Role`)
- `lib/maps.ts` (`loadMapProvider`, `MapHandle`, `mapUrl`)

### External
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — drag-and-drop reordering
- `@supabase/supabase-js` (via `lib/supabase/client.ts`) — Realtime subscriptions and mutations
- 고덕지도(AMap) JS API (`@amap/amap-jsapi-loader`) — primary map provider, loaded through `lib/maps.ts`
- 구글맵 JS API (`@googlemaps/js-api-loader`, typed by `@types/google.maps`) — automatic fallback provider, loaded through `lib/maps.ts`

<!-- MANUAL: -->
