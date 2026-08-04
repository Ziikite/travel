<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# public

## Purpose
Static assets served from the site root. Currently contains only the five default SVG icons that ship with `create-next-app`'s starter template (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`). A repo-wide search (`grep -rln "\.svg"` across `app/`, `lib/`, and all `.ts`/`.tsx`/`.css` files) found zero references to any of these five filenames anywhere in the source — confirming they are unused boilerplate left over from project scaffolding, not assets the app actually renders (no `<Image>`/`<img>`, no CSS `url()`, no favicon wiring).

## Key Files

| File | Description |
|------|--------------|
| `file.svg` | Unused Next.js starter icon (generic file glyph). Not referenced anywhere in `app/` or `lib/`. |
| `globe.svg` | Unused Next.js starter icon (globe glyph). Not referenced anywhere in `app/` or `lib/`. |
| `next.svg` | Unused Next.js starter icon (Next.js wordmark). Not referenced anywhere in `app/` or `lib/`. |
| `vercel.svg` | Unused Next.js starter icon (Vercel triangle logo). Not referenced anywhere in `app/` or `lib/`. |
| `window.svg` | Unused Next.js starter icon (window glyph). Not referenced anywhere in `app/` or `lib/`. |

## For AI Agents

### Working In This Directory
- All five files are dead boilerplate from `create-next-app` — they are safe to delete if cleaning up the repo, but no other AGENTS.md or source file currently depends on them, so leaving them in place is also harmless.
- If the app later needs a real favicon/app icon or logo assets, this is the correct directory for them (files here are served at the site root, e.g. `/favicon.ico`, `/logo.png`), but none of the current app UI (all in Korean) references any static image asset yet.
- Do not assume any of these SVGs is wired up as the site favicon — there is no `app/favicon.ico` or `<link rel="icon">` referencing them found in this codebase pass.

### Testing Requirements
- No automated tests; validate with `npm run lint` / `npm run build`. A build failure would not currently reference these files since nothing imports them.

### Common Patterns
- N/A — no code in this directory; it's static-asset storage only.

## Dependencies

### Internal
- None — nothing in `app/` or `lib/` imports or references these files.

### External
- None.

<!-- MANUAL: -->
