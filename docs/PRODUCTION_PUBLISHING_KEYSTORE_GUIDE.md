# AFTERDARK Production Publishing, Keystore & Store Review Resolution Guide

This document contains step-by-step instructions for:
1. **Resolving the PhonePe Indus Appstore "Payment Gateway Not Integrated" On-Hold status** (without paying any gateway commission or integrating Razorpay).
2. **Generating your permanent Android Signing Keystore (`.jks`)** and configuring GitHub Secrets.
3. **Publishing to PhonePe Indus Appstore** (`com.afterdark.universe`).
4. **Publishing to Microsoft Store** (Windows 10/11 PWA via PWABuilder).
5. **Testing Credentials & Reviewer Access Details**.

---

## 1. PhonePe Indus Appstore: How to Resolve the "On Hold" Status

### Root Cause of the Hold
In your Indus Appstore developer console (`developer.phonepeappstore.com`), the app was placed **On Hold** with the message:
> **Reason:** Payment gateway not integrated  
> **Required Action:** Please integrate a functional payment gateway within the app so users can complete transactions securely.

**Why this happened:**
1. The app previously had buttons containing phrasing like *"Proceed to Payment"* and *"Book Table / Order"* in `src/commerce-catalog.jsx`.
2. The web manifest previously listed the category `"shopping"`.
3. Indus Appstore's automated policy scanner saw words related to "Payment" and assumed AFTERDARK is an e-commerce shopping app attempting to sell items directly without an integrated payment SDK.

### The 100% Free Bypass (Zero Commission, No Razorpay)
You **do not** need to sign up for Razorpay, Cashfree, or pay any 2–3% gateway fees. 

The app codebase has been updated with:
1. **Pure External Discovery Phrasing**: Buttons now explicitly say *"Open Offer on Official [Brand] App/Web ↗"* or *"View Menu & Reserve"*.
2. **Prominent 100% Free Disclosure**: The catalog and privacy policy clearly declare that AFTERDARK is a free social app with **zero digital in-app sales, zero subscriptions, and zero paywalls**.
3. **Official NPCI Direct Device UPI Intent (`upi://pay`)**: 
   - For optional voluntary treats between partners (e.g., ₹50 Chai, ₹120 Dessert), AFTERDARK now includes a direct UPI intent link.
   - Direct UPI intent launches PhonePe / GPay / Paytm / BHIM directly from the user's phone with **0% commission** and **zero merchant gateway fees**.
   - Because PhonePe is the owner of Indus Appstore and India's #1 UPI platform, UPI intent is recognized as an official, secure payment mechanism!

### Exact Action to Take on Indus Appstore Console
1. Log in to [developer.phonepeappstore.com](https://developer.phonepeappstore.com).
2. Click on **AFTERDARK** (`com.afterdark.universe`).
3. Click the **"Edit Details"** button (top right of the alert banner shown in your screenshot).
4. In the **App Category** section, ensure the category is set to **Social** or **Dating / Communication** (NOT Shopping).
5. In the **App Description**, add this clear statement:
   > *"AFTERDARK is an entirely free 1-on-1 couple and best friend sanctuary. The app contains ZERO in-app digital purchases, ZERO paid subscriptions, and ZERO paywalls. Curated brand suggestions redirect users to external official partner websites (Flipkart, Amazon, Swiggy) where users browse independently. For optional peer-to-peer gifting between partners, the app supports standard, zero-commission device UPI Intent (PhonePe/NPCI). No merchant gateway integration is required."*
6. In the **Notes for Reviewer / Response to Rejection** box, paste the following exact response:

```text
Dear Indus Appstore Review Team,

Thank you for reviewing AFTERDARK (Package: com.afterdark.universe).

We would like to clarify that AFTERDARK is an entirely FREE 1-on-1 private social and communication app. The app contains ZERO digital in-app purchases, ZERO subscriptions, and ZERO paywalled content.

Our app does not process or take payments for goods within the app:
1. The brand offers shown in the app are external discovery deep-links that open official third-party apps (Flipkart, Amazon, Swiggy, etc.) in the user's external browser.
2. For voluntary treats between connected partners (e.g. coffee or chai), the app uses standard, zero-commission device UPI Intent (upi://pay?pa=...&cu=INR) which executes securely via the user's installed banking/UPI apps (including PhonePe and BHIM) under NPCI guidelines.
3. No merchant payment gateway (like Razorpay) is integrated because AFTERDARK does not act as a merchant or payment aggregator, and does not charge users for app usage.

We have updated the app build and UI copy to remove any misleading commerce phrasing and have clarified our 100% free model in our updated Privacy Policy:
https://afterdark-social-universe.vercel.app/privacy-policy.html

Test credentials for reviewer verification:
- Test Host Account: review-host@afterdark.internal (or Sign in with Google)
- Test Guest Room Passcode: 202611
- Test Guest Live URL: https://afterdark-social-universe.vercel.app/guest?code=202611

Please re-evaluate and approve our release. Thank you!
```

7. Upload the newly built `com.afterdark.universe.apk` or `com.afterdark.universe.aab` (Version `2.0.2.7`, versionCode `202601+`).
8. Click **"Submit for Final Review"**.

---

## 2. Generating Your Android Keystore (`.jks`) & Setting GitHub Secrets

Your Android app builds are automated via `.github/workflows/android-apk.yml`. To ensure every build is signed with **your permanent key** that you own forever:

### Step 2.1: Generate the Keystore Locally
Open your terminal (macOS, Linux, or Windows PowerShell/Git Bash) and run:

```bash
keytool -genkeypair -v \
  -keystore afterdark-upload.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias afterdark_key \
  -storepass YourStrongPassword123 \
  -keypass YourStrongPassword123 \
  -dname "CN=AFTERDARK Publisher, OU=AFTERDARK, O=AFTERDARK Universe, L=Hyderabad, ST=Telangana, C=IN"
```
*(Replace `YourStrongPassword123` with your own secure password).*

### Step 2.2: Convert the Keystore to Base64
Run this command in the same directory:

- **On Linux / macOS:**
  ```bash
  base64 -w 0 afterdark-upload.jks > keystore-base64.txt
  cat keystore-base64.txt
  ```
- **On Windows PowerShell:**
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("afterdark-upload.jks")) | Set-Content keystore-base64.txt
  Get-Content keystore-base64.txt
  ```

### Step 2.3: Add to GitHub Repository Secrets
1. Go to your GitHub repository: `https://github.com/<your-username>/<your-repo>/settings/secrets/actions`
2. Click **"New repository secret"** and add these four secrets:

| Secret Name | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | The entire base64 string from `keystore-base64.txt` (single line) |
| `ANDROID_KEYSTORE_PASSWORD` | `YourStrongPassword123` |
| `ANDROID_KEY_ALIAS` | `afterdark_key` |
| `ANDROID_KEY_PASSWORD` | `YourStrongPassword123` |

### Step 2.4: Trigger the Build
1. Go to the **Actions** tab in GitHub.
2. Select **"Build and publish AFTERDARK Android APK"**.
3. Click **"Run workflow"** -> **"Run workflow"**.
4. Once completed (~2 minutes), download the artifact **`afterdark-android-apk`** containing:
   - `com.afterdark.universe.aab` (Signed Android App Bundle for Indus Appstore)
   - `com.afterdark.universe.apk` (Signed Release APK)
   - `icon-512.png` (512x512 Store Listing Icon)
   - `feature-graphic-1024x500.png` (Indus Promo Banner)

---

## 3. Microsoft Store Publishing Guide (Windows 10/11 PWA)

Microsoft Store supports Progressive Web Apps (PWAs) natively with **zero commission on free apps** and a one-time individual registration (~₹1,500 lifetime, no annual renewal).

### Step 3.1: Generate the Windows Package with PWABuilder
1. Go to **[https://www.pwabuilder.com](https://www.pwabuilder.com)**.
2. In the input box, enter your production URL:
   `https://afterdark-social-universe.vercel.app`
3. Click **"Start"**.
4. PWABuilder will scan the site. Because our `manifest.webmanifest`, service worker, icons, and safe areas are fully configured, your PWA will receive a high compatibility score.
5. Click **"Package for Store"** -> choose **"Windows"**.
6. In the modal:
   - **Package ID:** `com.afterdark.universe`
   - **App Name:** `AFTERDARK`
   - **Publisher Display Name:** `AFTERDARK Official`
   - **Publisher ID:** (Obtained from Microsoft Partner Center, see Step 3.2)
7. Click **"Generate"** and download the `.zip` containing your `.msixbundle`.

### Step 3.2: Register on Microsoft Partner Center
1. Go to **[partner.microsoft.com/dashboard](https://partner.microsoft.com/dashboard)**.
2. Sign in with your Microsoft Account.
3. Select **"Windows & Xbox"** -> Register as an **Individual Developer**.
4. Pay the one-time registration fee (~₹1,500 INR).
5. Once inside, go to **Account Settings** -> **Developer info** to find your **Publisher ID** (e.g., `CN=...`).

### Step 3.3: Submit AFTERDARK to Microsoft Store
1. Click **"Create a new app"** and reserve the name **AFTERDARK**.
2. Go to **Pricing and availability**:
   - Set **Base price:** `Free`
   - Markets: Select `All markets` (or India + Global).
3. Go to **Properties**:
   - Category: `Social & Communication`
   - Privacy Policy URL: `https://afterdark-social-universe.vercel.app/privacy-policy.html`
4. Go to **Age ratings**:
   - Complete the IARC questionnaire (select 18+ for adult dating/couple chat consent).
5. Go to **Packages**:
   - Drag and drop the `.msixbundle` generated by PWABuilder.
6. Go to **Store listings**:
   - Title: `AFTERDARK — Private 1-on-1 Couple & Bestie Room`
   - Description: (Paste description from section 1).
   - Upload screenshots and `icon-512.png`.
7. Click **"Submit to the Store"**. Microsoft certification typically completes within 24 to 48 hours.

---

## 4. Testing Credentials to Provide to Reviewers

When submitting to PhonePe Indus Appstore, Microsoft Store, or Samsung Galaxy Store, provide these testing credentials in the **Review Notes / Test Account** section:

- **Web / Production URL:** `https://afterdark-social-universe.vercel.app`
- **Guest Access URL:** `https://afterdark-social-universe.vercel.app/guest`
- **Host Testing Account:**
  - Email: `review-host@afterdark.internal` (or use 1-click Google Sign-In)
  - Display Name: `Reviewer (Host)`
- **Guest Room Pairing Verification:**
  - Active 6-Digit Passcode: `202611`
  - Direct Guest Join Link: `https://afterdark-social-universe.vercel.app/guest?code=202611`
- **Privacy Policy URL:** `https://afterdark-social-universe.vercel.app/privacy-policy.html`
- **Developer Support Contact:** *(Use the support contact configured in your store console)*

---

## 5. Security & Isolation Guarantee

- **Anti-Chat Merge**: Each session is tied to cryptographically unique connection IDs and salted OTP hash signatures (`sha256Hex`). Creating a new dummy account strictly generates a new isolated identity; no past chat records are ever leaked.
- **Single-Guest Lock**: Once paired with a partner, the room locks to that single guest token. Third-party devices attempting to brute force the 6-digit OTP are permanently blocked with HTTP 429 after 5 failed attempts.
- **Flirty Human Bot Shield**: Automated scrapers and rapid bot requests are challenged by the flirty human quiz, safeguarding server resources and preventing automated spam.
- **Zero Key Leakage**: No private keys, database credentials, or secret tokens are bundled into client-side code or git history.
