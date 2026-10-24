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

Do not put real values in this repository. Set them in the deployment provider's environment-variable settings, then redeploy. Use `.env.example` only as a placeholder guide. Restrict the MongoDB network access list to the deployment's required network path where feasible; do not leave a broad public allowlist for a public launch.

## Current API routes

- `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/me`
- `POST /api/invites`, `GET /api/invites/:token`
- `POST /api/invites/:token/approve`, `POST /api/invites/:token/ignore`
- `GET /api/connections`
- `GET /api/connections/:id/messages`, `POST /api/connections/:id/messages`
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

Before inviting real users, configure the runtime variables, test registration and login, test an invite from a separate account/device, verify approve and ignore paths, verify that an unapproved user cannot read or send messages, and verify account deletion. The Android APK, push notifications, block/report workflows, and deeper relationship features remain separate release work.
