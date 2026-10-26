# AFTERDARK 🌙

AFTERDARK is a consent-first relationship and situationship space for adults 18+. The experience is built around personal invite links, QR sharing, an explicit approve/ignore choice, private chat for approved connections, and subtle date-plan suggestions.

## Product principles

- Adults 18+ only. Registration requires explicit age confirmation.
- Only signed-in users can create invites. Invite tokens are random, expire after seven days, and are stored as hashes.
- The recipient must approve before a connection is created. Ignoring an invite never unlocks chat.
- Message reads and sends are authorized on the server for the approved connection members.
- Passwords are salted and hashed; sessions use HTTP-only, Secure, SameSite cookies.
- Contextual brand suggestions use a small local ruleset and curated links. This is not a generative AI model, and brand links do not imply sponsorship.
- Never commit database credentials, session secrets, API keys, or other secrets to this public repository.

## Runtime configuration

The serverless API expects these environment variables in the deployment environment:

- `MONGODB_URI` — MongoDB Atlas connection string for the AFTERDARK database user.
- `MONGODB_DB` — database name; use `afterdark` if that is the intended database.
- `JWT_SECRET` — a long, random secret used to sign sessions and hash invite tokens.
- `RESEND_API_KEY` — API key for sending password-reset emails through Resend.
- `FROM_EMAIL` — a sender address/domain verified with Resend (for example, `AFTERDARK <login@your-verified-domain>`).
- `APP_URL` — canonical public site URL used in reset links (for example, `https://your-site.vercel.app`).

Do not put real values in this repository. Set them in the deployment provider's environment-variable settings, then redeploy. Password recovery will return a clear unavailable message until `RESEND_API_KEY`, `FROM_EMAIL`, and `APP_URL` are configured and the sender is verified. Use `.env.example` only as a placeholder guide. Restrict the MongoDB network access list to the deployment's required network path where feasible; do not leave a broad public allowlist for a public launch.

## Current API routes

- `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/me`
- `POST /api/forgot-password`, `POST /api/reset-password` (one-time reset token, 60-minute expiry)
- `POST /api/invites`, `GET /api/invites/:token`
- `POST /api/invites/:token/approve`, `POST /api/invites/:token/ignore`
- `GET /api/connections`
- `GET /api/connections/:id/messages`, `POST /api/connections/:id/messages`
- `GET /api/connections/:id/moments`, `POST /api/connections/:id/moments`, `DELETE /api/connections/:id/moments/:momentId` (daily answers and shared text memories)
- `POST /api/revoke-invites`, `DELETE /api/delete-account`

## Local development

```bash
npm install
npm run dev
npm run build
node --check 'api/[...route].js'
```

Vite's local development server does not automatically run Vercel serverless functions. To test the complete API locally, use Vercel's local development command with the environment variables configured, or deploy to a protected preview environment first.

## Release checklist

Before inviting real users, configure the runtime variables, test registration and login, test an invite from a separate account/device, verify approve and ignore paths, verify that an unapproved user cannot read or send messages, and verify account deletion, blocking, reporting, date-plan locking, daily answers, and memory deletion. Password-reset email still requires `RESEND_API_KEY` and a verified `FROM_EMAIL`. Push notifications and image uploads are not implemented in this release.


## App install and Android APK

- The website is also configured as an installable PWA. Android/desktop browsers may show the install prompt; on iPhone use Share → Add to Home Screen.
- The Android APK is built by GitHub Actions from `.github/workflows/android-apk.yml` and published as a GitHub Release when the workflow succeeds.
- The APK wrapper loads the live website at `https://afterdark-social-universe.vercel.app`, so it requires an internet connection and the same backend configuration as the website.
- The direct APK download URL is `https://github.com/Dipayanhaldar/AFTERDARK/releases/latest/download/afterdark.apk`. It becomes available after the first successful release workflow.
- Message records are configured for automatic deletion after 30 days using a MongoDB TTL index. Invite links expire after 7 days.
- Date plans lock only after both approved connection members choose the same Hyderabad location and date/time. The chat includes block and report actions.
