<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# places

## Purpose
The trip's shared place list: search map POIs for candidate spots (고덕지도(AMap) first, 구글맵 as an automatic fallback), save them into the `places` table, then filter/sort/vote on the saved list. Cards support inline editing of priority/category/stay time/opening hours/memo, upvoting (one vote per user per place), and soft delete/restore. All mutations go straight from client components to Supabase, kept in sync across members via a Realtime channel.

## Key Files

| File | Description |
|------|--------------|
| `page.tsx` | Server Component; loads the trip's `places`, `trip_members` (for nickname lookup), and `place_votes` for those place ids, then renders `PlaceBoard` |
| `PlaceBoard.tsx` | `"use client"` orchestrator: holds `places`/`votes` state, subscribes to Realtime for `places` and `place_votes`, computes filter/sort (priority, category, vote-only, active vs. deleted, votes vs. recent), renders `PlaceSearchDialog` + a grid of `PlaceCard` |
| `PlaceCard.tsx` | `"use client"` card: vote toggle button, priority/category/stay/opening-hours chips, memo, creator attribution, and (for owner/editor) an inline `PlaceEditForm` plus soft-delete (`status: "deleted"`) / restore (`status: "active"`) actions |
| `PlaceSearchDialog.tsx` | `"use client"` `<dialog>`-based modal: searches POIs via `searchPlaces()` (고덕지도 first, 구글맵 fallback) and inserts selected results into `places`, persisting each result's own `coordinateSystem` |

## For AI Agents

### Working In This Directory
- "Delete" is a **soft delete**: `PlaceCard`'s delete button sets `status: "deleted"` (never a real `DELETE`), and `PlaceBoard`'s "삭제된 장소 보기" checkbox toggles between showing only `status === "active"` or only `status === "deleted"` places — `status === "archived"` (a valid `PlaceStatus`) is not surfaced anywhere in this directory's UI.
- Voting is one row per `(place_id, user_id)` in `place_votes`, no `vote_type` distinction is used here (schema has a `vote_type` column but this UI only inserts/deletes, treating it as a plain upvote toggle). `PlaceCard.toggleVote()` does an optimistic-free direct insert/delete — no local state mutation in the card itself; the UI updates only once the Realtime event round-trips back through `PlaceBoard`.
- `amap_poi_id` holds the POI id returned by `searchPlaces()` — an AMap POI id when 고덕지도 answered, a Google place id when the search fell back to 구글맵. `coordinate_system` is **not** hardcoded: insert `PlaceSearchResult.coordinateSystem` (`"GCJ02"` for AMap, `"WGS84"` for Google) so the deep-link helper `mapUrl()` can later pick the matching provider per place. `PlaceEditForm` re-searching a place must update it too.
- Category values can contain a semicolon-delimited AMap POI type path (e.g. `"餐饮服务;中餐厅;中餐厅"`); both the category filter dropdown and the card chip only ever use `category.split(";")[0]` (the first segment).
- `PlaceSearchDialog` search results are session-local (`results`/`savedIds` state reset on dialog close) — saving doesn't remove a place from the results list, it just disables its "저장" button via `savedIds`.
- `role !== "owner"|"editor"` (viewer) hides voting is NOT disabled for viewers — only edit/delete/restore controls are gated by `canEdit`; any authenticated member can vote regardless of role.

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build` and manual testing (search with an AMap key, search without one to exercise the 구글맵 fallback, vote/unvote as different users, soft-delete then restore, filter combinations).

### Common Patterns
- Realtime channel per board instance (`places-board-${tripId}`), two `postgres_changes` listeners on the same channel (`places` filtered by `trip_id`, `place_votes` unfiltered then locally filtered via a ref to the current places list).
- `nicknameByUserId`/`voteCountByPlace`/`votedPlaceIds` are all `useMemo`-derived lookup maps built from flat arrays rather than fetched pre-joined.

## Dependencies

### Internal
- `lib/trip-context.tsx` (`useTrip` for `role`)
- `lib/supabase/client.ts`, `lib/supabase/server.ts`
- `lib/types.ts` (`Place`, `PlaceVote`, `Priority`, `Role`)
- `lib/maps.ts` (`searchPlaces`, `mapUrl`, `PlaceSearchResult`)

### External
- `@supabase/supabase-js` (via `lib/supabase/client.ts`) — Realtime + mutations
- 고덕지도(AMap) JS API PlaceSearch plugin, with the 구글맵 Places API (New) as fallback (both via `lib/maps.ts`)

<!-- MANUAL: -->
