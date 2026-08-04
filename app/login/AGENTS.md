<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-04 | Updated: 2026-08-04 -->

# login

## Purpose
Email/password authentication: sign in, sign up, and sign out via Supabase Auth. Renders a single toggleable form and drives navigation/errors entirely through URL query params so the page stays a Server Component.

## Key Files

| File | Description |
|------|--------------|
| `page.tsx` | Reads `mode`/`redirect`/`error`/`notice` from search params and renders `LoginForm` |
| `LoginForm.tsx` | `"use client"` component: toggles sign-in/sign-up forms, submits via Server Actions |
| `actions.ts` | `"use server"` — `signIn`, `signUp`, `signOut` Server Actions calling Supabase Auth |

## For AI Agents

### Working In This Directory
- `safeRedirectPath` in `actions.ts` is a deliberate open-redirect guard: it only allows paths starting with a single `/` (rejects absolute URLs and `//` protocol-relative paths). Preserve this check in any change that touches redirect handling.
- Errors and notices are round-tripped through URL query params (`?error=...`, `?notice=...`), not component state — keep this pattern if adding new feedback messages so it survives the Server Action redirect.
- `signUp` requires email confirmation (Supabase default) — the post-signup redirect shows a "check your email" notice rather than logging the user in immediately.

### Testing Requirements
- No automated tests; verify manually against a real (or local) Supabase project since Auth calls are live.

### Common Patterns
- Forms use the native `<form action={serverActionFn}>` pattern with a hidden `redirect` input rather than client-side fetch/state management.

## Dependencies

### Internal
- `lib/supabase/server.ts` — `createClient()` used in all three Server Actions

### External
- Supabase Auth (`signInWithPassword`, `signUp`, `signOut`)

<!-- MANUAL: -->
