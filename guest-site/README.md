# AFTERDARK — Standalone E2EE Guest Connector (`afterdark-guest-connector.onrender.com`)

This directory (`guest-site/`) is a **100% self-contained, standalone GitHub repository & Render Static Site** for AFTERDARK Guest Chat sessions with:

- **🔐 End-to-End Encrypted (E2EE) Guest Chat (`AES-256-GCM` + `PBKDF2-HMAC-SHA256`)**
  - Every message and welcome note is encrypted client-side into `AD_E2EE_V1:<iv>:<ciphertext+tag>` before leaving the device.
  - Guest access links (`?invite=...&k=ad1_...`) use a **non-reversible SHA-256 commitment (`ad1_<32_hex>`)** — possessing the URL link alone **cannot** derive the decryption key or read message history without the verified 6-digit OTP (plus optional second-factor E2EE passphrase).
  - Includes an interactive **🔐 E2EE Security & Lock Vault** allowing users to lock/unlock message history on demand and inspect live `AD_E2EE_V1` wire ciphertexts.
- **🛒 Same-Theme Ads, Flipkart Official Redirect & Built-In Brand Integration**
  - **Flipkart Quick Strip**: Instant 1-tap `🛒 Redirect to Flipkart ↗` (`https://www.flipkart.com/search?q=...`) and `⚡ Flipkart Minutes` express delivery bar directly inside the guest chat.
  - **Contextual Same-Theme In-Chat Brand Cards (`<InChatBrandPromoCard />`)**: Matches conversation keywords (e.g., Flipkart, chocolates, biryani, coffee, outfits, flowers) and renders dark-luxury brand cards with direct Flipkart and partner deep-links.
  - **38+ Built-In Brand Catalog (`<InlineCommerceDrawer />`)**: Flipkart, Flipkart Minutes, Myntra, Nykaa, Zomato, Blinkit, Swiggy Instamart, Zepto, BigBasket, Amazon Fresh, Cadbury, Ferns N Petals, and more.
- **✨ Identical Dark Luxury Theme & 3D Romantic Rooftop Scene**

---

## 🚀 Push as a Separate GitHub Repository (`afterdark-guest-connector`) for Render Auto-Deploy

### Method A: One-Command Git Subtree Push (Recommended)
From the root of the main repository, run:

```bash
./scripts/export-guest-repo.sh https://github.com/<your-username>/afterdark-guest-connector.git
```

Or run the git subtree command directly:

```bash
git subtree split --prefix=guest-site -b guest-repo-main
git remote add guest-origin https://github.com/<your-username>/afterdark-guest-connector.git
git push -u guest-origin guest-repo-main:main --force
```

### Method B: Automatic GitHub Actions Sync + Render Deploy Hook
Whenever changes are pushed to `main` in the parent repo, `.github/workflows/guest-repo-autodeploy.yml`:
1. Builds and verifies `guest-site/`
2. Automatically syncs `guest-site/` to your separate `afterdark-guest-connector` GitHub repository (when `GUEST_REPO_PAT` secret is configured)
3. Triggers `RENDER_GUEST_DEPLOY_HOOK_URL` if configured

### Render Auto-Deploy Blueprint (`render.yaml`)
Connect your separate `afterdark-guest-connector` GitHub repository to Render (**New + → Blueprint** or **Static Site**):
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Auto-Deploy**: `true` (pre-configured in `render.yaml`)

