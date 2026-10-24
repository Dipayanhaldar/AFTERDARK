# AFTERDARK 🌙

A consent-first relationship and situationship companion for adults (18+), with personal invite links, mutual approval, private chat, shared memories, games, date ideas, and contextual brand experiences.

## Safety and release status

This repository is a **separate development track**. The existing production website is not changed by commits here.

**Current milestone:** initial frontend scaffold only. Invite links, approvals, messaging, QR generation, push notifications, AI, and Android APK must not be treated as production-ready until connected to a backend, tested, and released.

## Product principles

- Every account must be for adults 18+.
- Connection requires explicit recipient approval; ignoring an invite does not unlock chat.
- Private chat must be authorized server-side for the two mutually approved participants only.
- Users need block, report, revoke-invite, account deletion, and data deletion controls.
- Do not represent self-reported gender or a profile image as verified identity.
- Brand placements must be contextual and any sponsorship/affiliate relationship disclosed.
- Never commit API keys, database credentials, JWT secrets, or other secrets to this public repository.

## Roadmap

1. Preserve and recover the existing website's source/design before merging any existing UI into this separate project.
2. Build the consent-first invite flow, unique expiring/revocable invite links, and QR download.
3. Connect registration, login, approvals, chat, block/report, and account deletion to a secure backend.
4. Add games, questions, dares, memories/archive, boundaries, date ideas, and template-based free-first suggestions.
5. Add contextual brand cards for relevant date, food, travel, streaming, and gifting moments.
6. Add opt-in push notifications and test a real Android APK build/signing/release process.
7. Run build, security, API authorization, accessibility, and end-to-end tests before production promotion.

## Local development

```bash
npm install
npm run dev
npm run build
``

See deployment configuration only after the initial build is verified. The existing production project must remain untouched.
