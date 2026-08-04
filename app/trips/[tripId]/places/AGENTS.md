<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# places

## Purpose
The trip's shared place list: search Google Places for candidate spots, save them into the `places` table, then filter/sort/vote on the saved list. Cards support inline editing of priority/category/stay time/opening hours/memo, upvoting (one vote per user per place), and soft delete/restore. All mutations go straight from client components to Supabase, kept in sync across members via a Realtime channel.

## Key Files

| File | Description |
|------|--------------|
| `page.tsx` | Server Component; loads the trip's `places`, `trip_members` (for nickname lookup), and `place_votes` for those place ids, then renders `PlaceBoard` |
| `PlaceBoard.tsx` | `"use client"` orchestrator: holds `places`/`votes` state, subscribes to Realtime for `places` and `place_votes`, computes filter/sort (priority, category, vote-only, active vs. deleted, votes vs. recent), renders `PlaceSearchDialog` + a grid of `PlaceCard` |
| `PlaceCard.tsx` | `"use client"` card: vote toggle button, priority/category/stay/opening-hours chips, memo, creator attribution, and (for owner/editor) an inline `PlaceEditForm` plus soft-delete (`status: "deleted"`) / restore (`status: "active"`) actions |
| `PlaceSearchDialog.tsx` | `"use client"` `<dialog>`-based modal: searches Google Places via `searchPlaces()` and inserts selected results into `places` |

## For AI Agents

### Working In This Directory
- "Delete" is a **soft delete**: `PlaceCard`'s delete button sets `status: "deleted"` (never a real `DELETE`), and `PlaceBoard`'s "삭제된 장소 보기" checkbox toggles between showing only `status === "active"` or only `status === "deleted"` places — `status === "archived"` (a valid `PlaceStatus`) is not surfaced anywhere in this directory's UI.
- Voting is one row per `(place_id, user_id)` in `place_votes`, no `vote_type` distinction is used here (schema has a `vote_type` column but this UI only inserts/deletes, treating it as a plain upvote toggle). `PlaceCard.toggleVote()` does an optimistic-free direct insert/delete — no local state mutation in the card itself; the UI updates only once the Realtime event round-trips back through `PlaceBoard`.
- Despite the column being named `amap_poi_id` (and the app README referencing 고덕지도/AMap), `PlaceSearchDialog.handleSave()` actually writes a **Google** Place ID into that column, with a Korean comment explicitly noting it's being repurposed as a "map-provider-agnostic external POI id." Don't assume `amap_poi_id` implies AMap data.
- `coordinate_system` is hardcoded to `"WGS84"` on insert (Google's coordinate system) — if AMap (GCJ-02) search is ever added, this field needs to vary per source.
- Category values can be semicolon-delimited (Google Places `types`, e.g. `"restaurant;food;point_of_interest"`); both the category filter dropdown and the card chip only ever use `category.split(";")[0]` (the first type).
- `PlaceSearchDialog` search results are session-local (`results`/`savedIds` state reset on dialog close) — saving doesn't remove a place from the results list, it just disables its "저장" button via `savedIds`.
- `role !== "owner"|"editor"` (viewer) hides voting is NOT disabled for viewers — only edit/delete/restore controls are gated by `canEdit`; any authenticated member can vote regardless of role.

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build` and manual testing (search without a Maps API key configured, vote/unvote as different users, soft-delete then restore, filter combinations).

### Common Patterns
- Realtime channel per board instance (`places-board-${tripId}`), two `postgres_changes` listeners on the same channel (`places` filtered by `trip_id`, `place_votes` unfiltered then locally filtered via a ref to the current places list).
- `nicknameByUserId`/`voteCountByPlace`/`votedPlaceIds` are all `useMemo`-derived lookup maps built from flat arrays rather than fetched pre-joined.

## Dependencies

### Internal
- `lib/trip-context.tsx` (`useTrip` for `role`)
- `lib/supabase/client.ts`, `lib/supabase/server.ts`
- `lib/types.ts` (`Place`, `PlaceVote`, `Priority`, `Role`)
- `lib/maps.ts` (`searchPlaces`, `PlaceSearchResult`)

### External
- `@supabase/supabase-js` (via `lib/supabase/client.ts`) — Realtime + mutations
- Google Maps JS API Places library (via `lib/maps.ts`)

<!-- MANUAL: -->
