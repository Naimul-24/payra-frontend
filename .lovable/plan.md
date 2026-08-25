# Payra UI Audit (read-only)

## Scores

- UI completeness: ~78%
- Code quality: 82/100
- TypeScript: clean (`tsgo --noEmit` passes, no errors)
- Backend readiness: not ready yet — mock-data coupled, no auth state

## What exists and works

13 routes, all reachable and typed: `/`, `/login`, `/signup`, `/dashboard`, `/send` (3-step flow + confirm dialog + success), `/receive`, `/scan`, `/transactions`, `/transactions/$id`, `/sources`, `/profile`, `/settings`, `/notifications`. Shared `AppShell` with desktop sidebar + mobile bottom nav, consistent design tokens, per-route `head()` metadata on every page, sonner toasts mounted in `__root`.

Navigation is sound: every `<Link to>` target resolves to a real route, active states are computed from the router pathname, and dynamic transaction links use typed `params`. `/transactions/$id` has a real not-found branch.

## Major missing items

1. Auth is cosmetic. Login/signup just `navigate({ to: "/dashboard" })` — no validation, no error text, no loading/disabled state, no session. Every "authenticated" route is publicly reachable; there is no `_authenticated` layout.
2. Missing flows the spec implies: forgot password, OTP/phone verification, KYC/verification, add-payment-source (currently a demo toast), request-money follow-through, top-up/withdraw.
3. Unused UI states. `EmptyState`, `ErrorState`, `SuccessState` exist in `ui-kit.tsx` but no route renders them. Notably `/transactions` search has no empty result state, and nothing anywhere has a loading skeleton or error boundary content.
4. Demo stubs. `sources`, `receive` share/download, scan upload, and the header search input are non-functional placeholders wired to toasts or nothing.
5. Thin pages. `profile`, `settings`, `notifications` are single-line JSX bodies with no edit/save behaviour; settings switches are uncontrolled `defaultChecked`.

## Code quality notes

- Several files (`profile`, `settings`, `notifications`, `transactions.$id`) collapse whole components into one very long JSX line — hard to review and diff. Formatting is inconsistent with the well-structured files (`send`, `scan`, `sources`).
- `transactions.$id` builds rows as `string[][]` tuples; a typed object array would be safer.
- Accessibility: good baseline (aria-labels on icon links, `aria-hidden` icons, labelled inputs, `<dl>` semantics). Gaps: no skip link, mobile nav has no `aria-current`, "Forgot password" and several buttons are dead `type="button"` controls with no target, decorative globe/QR SVGs need explicit `role="img"`/title or `aria-hidden`.
- Responsiveness looks correct (sidebar ≥lg, bottom nav <lg, safe-area padding, grid breakpoints). Not verified on a real device matrix; large-amount typography on `/send` is the likeliest overflow risk.

## Backend readiness

Not ready as-is, but structurally close. Blockers, in order:

1. All data comes from `src/lib/payra-data.ts` module constants imported directly into components. Swap to server functions + TanStack Query (`ensureQueryData` in loaders, `useSuspenseQuery` in components) before wiring the database.
2. No auth session or route gate — needs Lovable Cloud enabled, an `_authenticated` layout, and real sign-in/sign-up handlers.
3. No mutation paths: sending money, creating requests, toggling settings and adding sources are all local state or toasts.
4. Schema not modelled: profiles, payment_sources, transactions, notifications, plus RLS + grants scoped to `auth.uid()`.

## Suggested next step (not executed)

Enable Lovable Cloud, add auth + `_authenticated` gate, then migrate one domain at a time (transactions first) from mock module to query-backed server functions, filling in the empty/loading/error states as each moves.
