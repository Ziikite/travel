<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# settings

## Purpose
Trip administration page: share the invite link, list members with their roles and let the owner change roles or remove members, and show a live-updating activity feed summarizing recent member actions (place/itinerary/shopping/vote insert-update-delete events) pulled from `activity_logs`.

## Key Files

| File | Description |
|------|--------------|
| `page.tsx` | Server Component; loads `trips.invite_code`, all `trip_members` (joined with `profiles`), and the latest 30 `activity_logs`; builds the invite URL from request `headers()`; renders the member list inline (with `updateMemberRole`/`removeMember` server-action forms for the owner) plus `InviteShareButton` and `ActivityFeed` |
| `actions.ts` | `"use server"` Server Actions: `updateMemberRole` (updates a `trip_members` row's `role`) and `removeMember` (deletes a `trip_members` row); both `revalidatePath` the settings page afterward |
| `ActivityFeed.tsx` | `"use client"` list of recent `activity_logs`, summarized into Korean sentences per `entity_type`/`action_type`, capped at 30 entries, live-updated via Realtime `INSERT` events |
| `InviteShareButton.tsx` | `"use client"` read-only input + "링크 복사" button using `navigator.clipboard.writeText`, with a 1.5s "복사됨!" confirmation state |

## For AI Agents

### Working In This Directory
- This is the only directory of the four using **Server Actions** (`actions.ts` + `<form action={...}>`) instead of direct client-side Supabase calls for mutations — `updateMemberRole` and `removeMember` run server-side and are triggered by `<select onChange>` calling `e.currentTarget.form?.requestSubmit()` (auto-submit on role change) and a plain submit button, respectively.
- `page.tsx` computes `isOwner` from the fetched `members` array, not from `useTrip()`'s `role` (this page is a Server Component, so `useTrip()`/`TripProvider` context isn't used here at all) — role-gated UI (role dropdown + "내보내기") is rendered only `isOwner && member.role !== "owner"` i.e. the owner row itself is never editable/removable through this UI.
- `updateMemberRole`'s `role` `<select>` only offers `editor`/`viewer` as options — there's no UI path to promote another member to `owner` from this page.
- Neither Server Action re-verifies the caller is actually the trip owner before mutating `trip_members` — the "owner-only" gate is UI-only (`isOwner` conditionally rendering the forms); actual enforcement must come from Supabase RLS on `trip_members`, same caveat as elsewhere in this app.
- Invite URL scheme is inferred with `host?.startsWith("localhost") ? "http" : "https"` from request headers, not an env var — this only matters if the app is ever deployed behind a proxy that changes the host header.
- `ActivityFeed.summarize()` has a special case for `entity_type === "place_votes"` (worded as "투표했습니다"/"투표를 취소했습니다") distinct from the generic `ENTITY_LABEL`/`ACTION_LABEL` maps used for `places`/`itinerary_places`/`shopping_items`; any new loggable entity type needs an entry in `ENTITY_LABEL` or it falls back to the raw `entity_type` string.
- `activity_logs` rows are never written from this directory — they're presumably populated by DB triggers (see `supabase/` migrations) since no insert into `activity_logs` appears in any file here.

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build` and manual testing (role change/removal as owner vs. non-owner, invite link copy, activity feed live update via a second session).

### Common Patterns
- `page.tsx` unwraps Supabase's `profiles(...)` embed with `Array.isArray(x.profiles) ? x.profiles[0] : x.profiles`, the same defensive pattern used in `places/page.tsx` and `shopping/page.tsx`.
- Realtime channel `activity-${tripId}` subscribes only to `INSERT` events (not `*`) since activity logs are append-only, and locally caps the list at 30 with `.slice(0, 30)` to match the initial server-side `.limit(30)`.

## Dependencies

### Internal
- `lib/supabase/server.ts` (in `page.tsx` and `actions.ts`), `lib/supabase/client.ts` (in `ActivityFeed.tsx`)
- `lib/types.ts` (`Role`, `ActivityLog`)
- Next.js `headers()` (from `next/headers`) and `revalidatePath` (from `next/cache`)

### External
- `@supabase/supabase-js` (via `lib/supabase/client.ts`) — Realtime subscription for the activity feed

<!-- MANUAL: -->
