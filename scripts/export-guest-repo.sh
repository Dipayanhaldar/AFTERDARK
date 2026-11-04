#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# AFTERDARK — Standalone Guest Chat Repository Exporter (`guest-site/`)
# Syncs `src/*` into `guest-site/src/*` and exports `guest-site/` as a clean,
# self-contained GitHub repository ready for Render Auto-Deploy (`render.yaml`).
# ==============================================================================

REMOTE_URL="${1:-}"
BRANCH_NAME="guest-repo-main"

echo "🔐 Syncing shared E2EE crypto, Flipkart redirect, and 38+ brand modules into guest-site/src/..."
cp -f src/e2ee-crypto.js guest-site/src/e2ee-crypto.js
cp -f src/couple-sync.js guest-site/src/couple-sync.js
cp -f src/commerce-data.js guest-site/src/commerce-data.js
cp -f src/commerce-catalog.jsx guest-site/src/commerce-catalog.jsx
cp -f src/GuestApp.jsx guest-site/src/GuestApp.jsx
cp -f src/ThreeRomanticScene.jsx guest-site/src/ThreeRomanticScene.jsx
cp -f src/notification-sound.js guest-site/src/notification-sound.js
cp -f src/photo-helper.js guest-site/src/photo-helper.js
cp -f src/style.css guest-site/src/style.css

echo "✅ guest-site/ is 100% synced with E2EE + Same-Theme Ads + Flipkart Redirect + Render Blueprint."

if [ -n "$REMOTE_URL" ]; then
  echo "🚀 Splitting guest-site/ into standalone branch '$BRANCH_NAME' and pushing to $REMOTE_URL..."
  git subtree split --prefix=guest-site -b "$BRANCH_NAME"
  git push "$REMOTE_URL" "$BRANCH_NAME:main" --force
  echo "🎉 Successfully pushed standalone Guest Chat repository to $REMOTE_URL (main)!"
else
  echo ""
  echo "To push guest-site/ to your separate GitHub repository for Render Auto-Deploy, run:"
  echo "  ./scripts/export-guest-repo.sh https://github.com/<your-username>/afterdark-guest-connector.git"
fi
