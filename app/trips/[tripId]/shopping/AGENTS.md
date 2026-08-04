<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# shopping

## Purpose
Collaborative shopping list for the trip: add items (with quantity, expected CNY price, assignee, optional linked place, reference URL, group-vs-personal purchase type), track their status through the buying process, and record the actual CNY price once purchased. Every trip has (at most) one `shopping_lists` row fetched here; items live in `shopping_items` scoped to that list.

## Key Files

| File | Description |
|------|--------------|
| `page.tsx` | Server Component; loads (at most one) `shopping_lists` row for the trip via `.maybeSingle()`, its `shopping_items`, `trip_members` (nicknames), and active `places`, then renders `ShoppingBoard` |
| `ShoppingBoard.tsx` | `"use client"` orchestrator: holds `items` state, subscribes to Realtime on `shopping_items`, filters by status/purchase type, renders `AddShoppingItemDialog` + a list of `ShoppingItemRow`; renders a fallback message if no `shoppingListId` exists |
| `ShoppingItemRow.tsx` | `"use client"` row: status badge/select, purchase-type badge, expected vs. actual price display, assignee/creator/place/reference-link display, and (owner/editor only) actual-price input + delete |
| `AddShoppingItemDialog.tsx` | `"use client"` `<dialog>`-based modal form (uncontrolled, `FormData`-driven) that inserts a new `shopping_items` row |

## For AI Agents

### Working In This Directory
- `page.tsx` assumes a `shopping_lists` row already exists for the trip (fetched with `.maybeSingle()`, not created here) — if none exists, `ShoppingBoard` renders "쇼핑리스트를 불러올 수 없어요." and the add-item dialog is never reachable, since `shoppingListId` is required by `AddShoppingItemDialog`. List creation logic is not in this directory (likely trip-creation flow) — don't assume a list always exists when reading this code in isolation.
- Prices (`expected_price_cny`, `actual_price_cny`) are plain `number | null` in CNY with no currency conversion anywhere in this directory; `ShoppingItemRow`'s actual-price input only renders when `canEdit && item.status === "purchased"`, and saving happens on blur (`saveActualPrice`), not on every keystroke.
- Status transitions (`pending → purchased/out_of_stock/cancelled`, etc.) are unrestricted in the UI — the `<select>` in `ShoppingItemRow` allows jumping to any of the four `ShoppingStatus` values in any order; there's no state-machine guard client-side.
- Delete in this directory is a **hard delete** (`ShoppingItemRow.remove()` calls `.delete()`), unlike `places/`'s soft-delete pattern — don't assume the two features share delete semantics.
- `ShoppingBoard` receives `tripId` as a prop but marks it unused (`void tripId;`) — the Realtime channel name and filtering are keyed off `shoppingListId` instead, since `shopping_items` doesn't carry `trip_id` directly (it's scoped via `shopping_list_id`).
- `AddShoppingItemDialog` reads `purchase_type` from a required radio group defaulting to `"group"` — there's no way to submit without one selected, so no null-check is needed for that field, unlike the other optional fields which are coerced from empty string to `null`.

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build` and manual testing (add item with each purchase type, status transitions, actual-price entry after marking purchased, viewer-role read-only behavior).

### Common Patterns
- Realtime channel keyed on `shopping-${shoppingListId}` (only subscribed when `shoppingListId` is truthy), single unfiltered `postgres_changes` listener on `shopping_items` that manually checks `row.shopping_list_id !== shoppingListId` to discard cross-list events.
- `AddShoppingItemDialog` uses an uncontrolled form (`FormData` read in `handleSubmit`) rather than per-field `useState`, unlike `PlaceCard`'s edit form in `places/`.

## Dependencies

### Internal
- `lib/trip-context.tsx` (`useTrip` for `role`)
- `lib/supabase/client.ts`, `lib/supabase/server.ts`
- `lib/types.ts` (`ShoppingItem`, `PurchaseType`, `ShoppingStatus`)

### External
- `@supabase/supabase-js` (via `lib/supabase/client.ts`) — Realtime + mutations

<!-- MANUAL: -->
