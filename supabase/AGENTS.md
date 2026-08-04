<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# supabase

## Purpose
Supabase CLI project configuration and the SQL migration(s) that define the entire database schema, row-level security policies, and RPC functions consumed by the app (`lib/supabase/*`, `lib/types.ts`, and every Server Component/Action that queries the database).

## Key Files

| File | Description |
|------|--------------|
| `config.toml` | Supabase CLI local-dev config: project id `china-trip-planner`, local Postgres port `54322`, API port `54321`, auth enabled with `site_url = "http://localhost:3000"`. Used by `supabase start`/`supabase db reset` for local development, not read by the Next.js app at runtime. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `migrations/` | Ordered SQL migration files defining tables, triggers, RLS policies, and RPC functions (see `migrations/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- This directory is the source of truth for the database schema — `lib/types.ts`'s hand-written `Database` type must be kept manually in sync with any migration change; there is no `supabase gen types` step wired into a build/CI script in this repo, so schema and TS types can drift silently if not updated together.
- `config.toml` only affects local Supabase CLI runs; production project settings (URL, anon key) come from `.env.local` / `.env.local.example`, not from this file.

### Testing Requirements
- No automated tests; validate the app with `npm run lint` / `npm run build`. Validate the schema itself by running `supabase db reset` (or applying migrations to a fresh Supabase project) and confirming it applies cleanly with no errors.

### Common Patterns
- New schema changes should be added as new, additively-numbered files under `migrations/` (e.g. `0002_*.sql`) rather than editing `0001_init.sql` in place, once that migration has been applied anywhere.

## Dependencies

### Internal
- `lib/types.ts` — TypeScript mirror of the schema defined here; must be updated by hand alongside migration changes.
- `lib/supabase/*` — client factories that connect to the database/RPCs this directory defines.

### External
- Supabase CLI / Supabase Postgres (`gen_random_uuid()`, `auth.users`, `auth.uid()`, Realtime publications) — this directory defines the schema and policies consumed at runtime by `@supabase/supabase-js` / `@supabase/ssr`.

<!-- MANUAL: -->
