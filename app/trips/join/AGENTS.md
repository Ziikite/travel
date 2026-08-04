<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# join

## Purpose
Routing-only directory for the invite-link join flow. It holds no files of its own — its only content is the `[inviteCode]` dynamic segment, which renders the invite preview page and handles the "참여하기" (join) submission. This directory exists purely to give the `/trips/join/[inviteCode]` route a stable, semantically-named parent segment (`/trips/join/...`).

## Key Files

_None — this directory contains no route files (`page.tsx`, `layout.tsx`, `actions.ts`) of its own._

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[inviteCode]/` | Invite-code preview + join page and its Server Action (see `[inviteCode]/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `middleware.ts`-equivalent logic in `lib/supabase/proxy.ts` special-cases `pathname.startsWith("/trips/join")` as a public route, so unauthenticated users can reach the preview page before being redirected to `/login`. If a new file is ever added directly under this directory (e.g. a shared `layout.tsx`), keep that public-route assumption in mind.
- Do not add a `page.tsx` here unless the product intends a route at exactly `/trips/join` (with no code) — currently none exists.

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build`.

### Common Patterns
- N/A — this directory is an empty routing segment; see `[inviteCode]/AGENTS.md` for the actual patterns used in the join flow.

## Dependencies

### Internal
- N/A

### External
- N/A

<!-- MANUAL: -->
