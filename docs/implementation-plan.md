# AFTERDARK Implementation Plan

Updated: 2026-10-24

## Current state and guardrails

- This repository (`Dipayanhaldar/AFTERDARK`) is a separate Vite + React frontend scaffold. It is not confirmed to be connected to the production Vercel project.
- The scaffold currently has no server/API dependency or backend integration. Invite generation in the UI is client-side preview logic only; it is not a valid server-backed invite.
- Production Vercel project: `afterdark-social-universe`. The latest inspected deployment is marked READY and targets production. This status confirms deployment state, not end-to-end application correctness.
- Vercel project metadata lookup currently returns `Project not found` even though project listing and deployment inspection can see the project. Resolve scope/ownership/config access before any deployment.
- MongoDB Atlas project `AFTERDARK Production` has a non-paused free cluster `afterdark-main`. Read-only inspection found database `afterdark` and collections `users`, `likes`, `matches`, and `messages`. Do not migrate or overwrite production data during the audit.
- GitHub Actions frontend build passed on commit `667fc3404c123495655bd8876c36e16d9b446f63`. This validates the scaffold build only; it does not validate production API flows or deployment.

## P0 — Reconcile production source and deployment ownership

1. Identify the Git repository/commit (if any) attached to the production Vercel deployment.
2. Establish the correct Vercel account/team scope for project metadata and deployment permissions.
3. Inspect production API route source and configuration without printing or exporting secrets.
4. Confirm current API health and critical route behaviour through non-destructive tests.
5. Create a staging/test environment and isolated test database before integration testing.
6. Do not deploy or change production until the source-of-truth and rollback point are known.

**Exit criteria:** production source, deployment commit, build settings, environment variable names (not values), API entry point, database connection path, and rollback method are documented.

## P1 — Invite data model and secure token lifecycle

Implement in a feature branch and test against an isolated database.

- Generate invite tokens server-side using a cryptographically secure random generator; store only a hash of each token.
- Invite fields: inviter user ID, token hash, status, created time, expiry time, optional recipient binding, accepted time, revoked time.
- Status transitions: `pending -> accepted`, `pending -> ignored`, `pending -> expired`, or `pending -> revoked`. Terminal states cannot be reused.
- Add rate limits and abuse controls for invite creation and resolution.
- Provide owner-only list, revoke, and expiry handling.
- Never expose email, account identifiers, or private profile details through an invite preview.

**Acceptance tests:** random tokens cannot be guessed; expired/revoked/ignored invites cannot be accepted; a token is single-use; one user cannot revoke another user's invite; repeated requests are rate-limited.

## P2 — Recipient consent and pair authorization

- Public invite landing page displays only safe preview information and requires authentication plus 18+ confirmation.
- Recipient explicitly accepts or ignores; no action means no connection.
- On acceptance, create a unique connection/pair record and make the transition idempotent.
- Prevent self-acceptance, duplicate pairs, replay, and conflicting concurrent accept/ignore requests.
- Ignoring does not notify the inviter with sensitive information and never opens chat.

**Acceptance tests:** no chat access before acceptance; only the intended recipient can accept when recipient-bound; duplicate requests do not create duplicate connections; ignored invitations remain closed.

## P3 — Private one-to-one chat

- Authorize every message read/write on the server using the approved pair record.
- Verify both participants belong to the pair and neither has blocked the other.
- Enforce message length, rate limits, pagination, and safe text rendering.
- Add block, report, disconnect, and account deletion workflows.
- Keep secrets in hosting environment variables; never in client code or public Git.

**Acceptance tests:** third accounts cannot read or send messages by guessing IDs; blocked pairs cannot message; deletion and disconnection apply consistently.

## P4 — QR, UI, and relationship features

- Generate a QR code from the server-backed invite URL (client-side rendering is fine once URL is valid).
- Add copy/share, expiry, revoke, pending/accepted/ignored states and accessible mobile layouts.
- Add questions, games, dares, memories/archive, boundaries, and date ideas only after the secure connection model is stable.
- Brand links are contextual and clearly disclose sponsorship/affiliate relationships if any.

## P5 — Free-first AI and notifications

- Start with honest template/rule-based suggestions; do not label templates as generative AI.
- Add an optional provider adapter only when a provider's free-tier policy and limits are verified.
- Push notifications require explicit opt-in, permission handling, quiet controls, and abuse prevention.
- Do not promise background push behaviour until tested on supported browsers/devices.

## P6 — Android APK and release readiness

- Keep Android packaging separate from the website build.
- Build, sign, install, and test a real APK; a PWA or web link is not an APK.
- Verify privacy policy, terms, adult-only onboarding, account/data deletion, accessibility, and incident reporting.
- Deploy only from a known commit after automated tests and manual smoke tests pass.

## Required CI and release gates

1. Dependency installation and production build.
2. Unit tests for invite state transitions and token validation.
3. API tests against an isolated database.
4. Authorization tests for invite, pair, chat, block, and deletion.
5. Basic accessibility and mobile layout checks.
6. Preview deployment smoke test.
7. Production promotion only after explicit release approval and rollback confirmation.

## Blockers currently open

- Production Vercel project metadata access is inconsistent: project list/deployment inspection work, but project detail lookup returns 404.
- No confirmed link between the development scaffold repository and production Vercel project.
- The scaffold has no backend integration, invite API, approval API, QR dependency, or tests for real invite flows.
- Production collection names were inspected read-only, but existing schema/indexes and live data behaviour have not yet been audited.
- No end-to-end production health/API test was confirmed during this audit.
