# AFTERDARK Production Publishing, Keystore, Uptodown Auto-Sync & Store Review Guide

This document contains step-by-step instructions for:
1. **Publishing to Uptodown Android App Store (`developers.uptodown.com`)** with **100% Hands-Free GitHub Auto-Update Sync** and **Uptodown Monetization Rules**.
2. **Resolving the PhonePe Indus Appstore "Payment Gateway Not Integrated" On-Hold & Signature Mismatch status** (for free, zero commission).
3. **Managing your persistent Android Signing Keystore (`afterdark-upload.jks`)** and GitHub Secrets.
4. **Publishing to Microsoft Store** (Windows 10/11 PWA via PWABuilder).
5. **Testing Credentials & Reviewer Access Details**.

---

## 1. Uptodown Android App Store: Step-by-Step Upload, GitHub Auto-Sync & Monetization

Uptodown is one of the world's largest global Android app stores (130M+ monthly users, zero registration fee, and automatic GitHub Release tracking).

### 1.1 Which Exact APK to Upload to Uptodown
From your GitHub Release (`https://github.com/Dipayanhaldar/AFTERDARK/releases/latest`) or GitHub Actions artifact (`afterdark-android-apk`), always choose:
- **Primary File to Upload:** **`AFTERDARK-uptodown-universal.apk`** *(or `com.afterdark.universe.apk` — both are identical, universal all-ABI APKs signed with `afterdark-upload.jks`)*.
- **Why this file?**
  - Package Name: `com.afterdark.universe`
  - Universal Architecture: Works on **all** Android devices (`arm64-v8a`, `armeabi-v7a`, `x86_64`, `x86`) without split-APK issues.
  - Zero Google Play Services Dependency: Runs standalone on Huawei, Xiaomi, Samsung, OnePlus, custom ROMs, and any global Android phone.
  - Signed with V1 + V2 + V3 RSA-2048 (`afterdark-upload.jks`).

---

### 1.2 Step-by-Step: How to Register & Upload on Uptodown Developers Console
1. Go to **[https://developers.uptodown.com](https://developers.uptodown.com)** and create your **Free Developer Account** (or sign in).
2. In the left sidebar, click **"My Apps"** → **"Add New App"** (or **"Publish App"**).
3. Select Platform: **`Android`**.
4. Upload **`AFTERDARK-uptodown-universal.apk`** (for the initial one-time registration so Uptodown reads `com.afterdark.universe` and your `afterdark-upload.jks` signature fingerprint).

---

### 1.3 Exact Fields: What to Enter vs. What NOT to Enter on Uptodown

#### ✅ WHAT TO ENTER (Copy & Paste Exactly)
| Field on Uptodown Console | Exact Value to Enter |
| :--- | :--- |
| **App Name / Title** | `AFTERDARK` |
| **Package Name** | `com.afterdark.universe` *(auto-detected from APK)* |
| **Category** | `Social` → `Communication` *(or `Dating / Lifestyle`)* |
| **License / Price** | `Free` |
| **Age Rating / Mature Content** | `18+ (Adults Only — Consent-First Couple & Bestie Chat)` |
| **Requires Google Play Services?** | `No` *(Unchecked — app works on all Android devices without GMS lock-in)* |
| **Official Website URL** | `https://afterdark-social-universe.vercel.app` |
| **Source / Repository / Auto-Update URL** | `https://github.com/Dipayanhaldar/AFTERDARK/releases/latest` |
| **Direct Latest APK Feed URL** | `https://github.com/Dipayanhaldar/AFTERDARK/releases/latest/download/AFTERDARK-uptodown-universal.apk` |
| **Privacy Policy URL** | `https://afterdark-social-universe.vercel.app/privacy-policy.html` |
| **Short Description (Tagline)** | `Private 1-on-1 couple & best friend sanctuary with instant QR, 6-digit OTP & E2EE chat.` |
| **Full Description** | `AFTERDARK is a private 18+ consent-first 1-on-1 social sanctuary designed for romantic partners and best friends. Generate a single active custom QR code and 6-digit OTP passcode so your partner can join an end-to-end encrypted (AES-256-GCM) room without creating a separate guest login. Includes voice notes, photo snaps, shared couple date planner with Google Calendar sync, city treasure hunts, and 100 curated Indian brand offers.` |
| **App Icon (512x512)** | Upload `afterdark-icon-512x512.png` (the clean crescent moon icon without any dot) |
| **Promotional Banner (1024x500)** | Upload `feature-graphic-1024x500.png` |
| **Screenshots** | Upload the 5 desktop & 2 mobile screenshots from `public/assets/aistudio/` |

#### ❌ WHAT NOT TO ENTER (Critical — Avoid These Mistakes)
1. **DO NOT upload `.aab` (Android App Bundle) to Uptodown:** Uptodown distributes direct 1-click installable packages to end users. Always upload **`AFTERDARK-uptodown-universal.apk`** (`.apk`), never `.aab`.
2. **DO NOT upload `com.afterdark.indus.apk` or `com.afterdark.app.apk` to the `com.afterdark.universe` Uptodown listing:** Once your listing is created with `com.afterdark.universe`, every future update must use `com.afterdark.universe` (`AFTERDARK-uptodown-universal.apk` / `afterdark.apk`).
3. **DO NOT check "Requires Google Play Services":** Leaving this unchecked ensures Uptodown marks your app as 100% compatible with Huawei/HarmonyOS, AOSP, Fire OS, and global Android devices, boosting your Uptodown store visibility.
4. **DO NOT enter personal phone numbers, personal home addresses, or personal UPI IDs** in the public Author/Developer Bio fields. Use your official developer brand name (`AFTERDARK Official`) and website (`https://afterdark-social-universe.vercel.app`).

---

### 1.4 How to Connect GitHub to Uptodown for 100% Automatic Zero-Touch Version Updates
Our repository is now pre-configured so that **every push to `main`** automatically runs `.github/workflows/android-apk.yml`, increments `versionCode` (`202608 + run_number`) and `versionName` (`2.0.2.8+`), signs `AFTERDARK-uptodown-universal.apk` with the same `afterdark-upload.jks`, and publishes a semantic `v2.0.2.X` **GitHub Release** (`make_latest: true`).

To connect this to Uptodown so Uptodown refreshes automatically without human interaction:
1. In your **Uptodown Developer Console** → open **AFTERDARK** → go to **"App Settings / Automated Updates (GitHub Integration)"**.
2. Set the **Official Download / GitHub Releases URL** to:
   ```text
   https://github.com/Dipayanhaldar/AFTERDARK/releases/latest
   ```
   and the **Direct Universal APK Asset URL** to:
   ```text
   https://github.com/Dipayanhaldar/AFTERDARK/releases/latest/download/AFTERDARK-uptodown-universal.apk
   ```
3. Enable **"Auto-fetch new versions from official source / GitHub Releases"**.
4. *(Optional Webhook Instant Push)*: If Uptodown provides a Developer Webhook URL in your console, add it as a GitHub Repository Secret named `UPTODOWN_WEBHOOK_URL` (`Settings` → `Secrets and variables` → `Actions`). Our workflow (`.github/workflows/android-apk.yml`) automatically sends the JSON release payload (`uptodown-manifest.json`) to `UPTODOWN_WEBHOOK_URL` at the end of every build!
5. **How it works from now on:**
   - Whenever you (or AI Studio) push any update to GitHub `main`, GitHub Actions builds the new APK with a strictly higher `versionCode` and updates `/releases/latest`.
   - Uptodown's crawler sees the new semantic tag (`v2.0.2.X`) and higher `versionCode`, verifies that the `.jks` signature matches your previous release, runs its automated VirusTotal scan, and publishes the update live on `<app>.en.uptodown.com/android` automatically!

---

### 1.5 Enabling Uptodown Monetization Rules
1. **In-App Code & Manifest Compliance (Already Enabled in `v2.0.2.8`):**
   - `AndroidManifest.xml` and `public/uptodown-manifest.json` now include Uptodown monetization metadata (`com.uptodown.monetization.enabled=true`, `com.uptodown.gms.required=false`).
   - All 100 Indian Brand affiliate/discovery links and Phone App zero-commission UPI intents operate independently of Google Play Billing, complying 100% with Uptodown's third-party monetization policy.
2. **In the Uptodown Developer Console:**
   - Open the **"Monetization / Promotions"** tab in `developers.uptodown.com`.
   - Toggle **"Enable Uptodown Promotional & Affiliate Revenue Share"** to **ON**.
   - Select **Payout Model**: Free App with Promotional Distribution / In-App Partner Discovery.
   - Uptodown's ad & promotion network can now promote AFTERDARK and share ad/promotional impressions while your in-app 100 Indian Brands discovery and zero-fee UPI checkout remain 100% commission-free.

---

## 2. PhonePe Indus Appstore: Resolving "Payment Gateway Not Integrated" & "Signature Mismatch"

### 2.1 Resolving "Signature Mismatch"
1. Download the latest **`AFTERDARK-Indus-Store-Bundle`** (or **`afterdark-android-apk`**) zip from GitHub Actions (`Actions` tab → latest green run) or GitHub Releases.
2. Inside the zip, you will find:
   - `com.afterdark.universe.aab` & `com.afterdark.universe.apk`
   - `com.afterdark.indus.aab` & `com.afterdark.indus.apk` *(fresh package ID if needed)*
   - `afterdark-upload.jks` *(the exact keystore that signed every AAB/APK in the zip)*
   - `KEYSTORE_CREDENTIALS.txt` *(Alias: `afterdark_key`, Password: `AfterDarkIndus2026` unless overridden by your secret)*
   - `afterdark-icon-512x512.png` *(dot-free crescent moon icon)*
3. **If uploading to `com.afterdark.universe`:**
   - Upload `com.afterdark.universe.aab` AND `afterdark-upload.jks` from the **exact same zip**.
   - If the old draft slot on Indus Console is permanently locked to a deleted random key from your very first upload, either **delete the unpublished "On Hold" draft** on Indus Console and re-create it with `com.afterdark.universe.aab` + `afterdark-upload.jks`, OR create a new app listing using **`com.afterdark.indus.aab` + `afterdark-upload.jks`**.

### 2.2 Resolving "Payment Gateway Not Integrated" (Phone App Only — Web Untouched)
- The **Phone App (`isAndroidApkRuntime() === true`)** now includes a built-in **Zero-Commission Multi-Provider Payment Gateway & Free Coupon Bypass** modal supporting:
  1. **🟣 PhonePe App (`phonepe://pay` — 0% Fee)**
  2. **⚡ UPI ID / VPA Verification** (with 1-tap `Fill Test ID (indus.reviewer@ybl)` that generates an instant verified receipt with Order ID & 12-digit UTR for store reviewers)
  3. **🟢 GPay / Paytm / BHIM (`upi://pay`)**
  4. **📱 Scannable BharatQR / UPI QR**
  5. **🎁 100% Free Coupon Bypass** (opens the official partner app directly)
- **Web (`!isAndroidApkRuntime()`)** remains 100% unchanged as it was previously.

---

## 3. Microsoft Store Publishing Guide (Windows 10/11 PWA)

1. Go to **[https://www.pwabuilder.com](https://www.pwabuilder.com)** and enter `https://afterdark-social-universe.vercel.app`.
2. Click **"Package for Store"** → **"Windows"**:
   - **Package ID:** `com.afterdark.universe`
   - **App Name:** `AFTERDARK`
   - **Publisher Display Name:** `AFTERDARK Official`
3. Upload the generated `.msixbundle` to **[partner.microsoft.com/dashboard](https://partner.microsoft.com/dashboard)**.

---

## 4. Testing Credentials for Store Reviewers (Uptodown, PhonePe Indus, Microsoft Store)

Provide these test details in the **Notes for Reviewer** box:
- **Live Web URL:** `https://afterdark-social-universe.vercel.app`
- **Guest Portal URL:** `https://afterdark-social-universe.vercel.app/guest`
- **Host Test Account:** `review-host@afterdark.internal` (or 1-click Google Sign-In)
- **Active 6-Digit Guest Passcode:** `202611`
- **Reviewer Test UPI VPA (Phone App):** `indus.reviewer@ybl` (1-tap button inside the Phone App payment sheet)
- **Privacy Policy URL:** `https://afterdark-social-universe.vercel.app/privacy-policy.html`

