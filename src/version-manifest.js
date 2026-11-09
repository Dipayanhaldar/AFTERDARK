/**
 * AFTERDARK Semantic 4-Segment Version & Update Location Manifest
 *
 * Format: MAJOR_GEN . PLATFORM_CHANNEL . FEATURE_MILESTONE . PATCH_SCOPE
 * Current Release: 2.0.2.8
 *
 * Segment Meaning:
 * - [2] Major Generation 2: Dual-Site Host + Guest AES-256-GCM E2EE Architecture (AD_E2EE_V1)
 * - [0] Platform Channel 0: Universal Cross-Device & Multi-Store Production Channel
 *       (Web, PWA, Uptodown Android Store, PhonePe Indus Appstore, Microsoft Store PWA, GitHub Releases)
 * - [2] Feature Milestone 2: 100 Top Indian Brands In-Chat Catalog + Google Account Auth + Adaptive Traffic Control
 * - [8] Patch & Scope 8: Uptodown Universal APK Auto-Sync & Monetization Compliance + PhonePe Indus Keystore (.jks) Bundle
 */

export const APP_VERSION = '2.0.2.8';
export const APP_VERSION_TAG = 'v2.0.2.8';
export const APP_VERSION_CODENAME = 'Uptodown Auto-Sync & Monetization · Indus Store Keystore Bundle · Zero-Fee UPI Intent';
export const APP_RELEASE_DATE = '2026-11-09';

export const VERSION_SEGMENTS = [
  {
    index: 1,
    digit: '2',
    code: 'MAJOR_GEN',
    title: 'Gen-2 Dual-Site Host + Guest Core',
    meaning:
      'Dual-site Host & Guest 1-on-1 private room architecture with 6-digit passcode pairing.',
    hintLocation: 'src/main.jsx · src/GuestApp.jsx · src/couple-sync.js'
  },
  {
    index: 2,
    digit: '0',
    code: 'STORE_CHANNEL',
    title: 'Uptodown, PhonePe Indus Appstore & Microsoft Store PWA Build',
    meaning:
      'Unified compatibility across Desktop/Mobile Web, PWA, Uptodown Universal APK, PhonePe Indus Appstore, Microsoft Store (PWA) & GitHub Releases.',
    hintLocation: 'manifest.webmanifest · capacitor.config.json · scripts/configure-android-apk.mjs'
  },
  {
    index: 3,
    digit: '2',
    code: 'FEATURE_MILESTONE',
    title: '100 Top Indian Brands + Google Auth + Traffic Shield',
    meaning:
      '100 curated Indian brands for in-chat contextual ads & Flipkart redirects, 1-click Google Account Sign-In, and Adaptive Surge Traffic Control.',
    hintLocation: 'src/indian-brands-100.js · src/google-auth.js · src/traffic-control.js'
  },
  {
    index: 4,
    digit: '8',
    code: 'UPDATE_PATCH_LOC',
    title: 'Uptodown GitHub Auto-Sync & Monetization + Indus .jks Keystore & Dot-Free Icon Bundle',
    meaning:
      'Automated GitHub Release-to-Uptodown crawler sync, Uptodown monetization & Play-Services-free compliance, persistent .jks keystore bundling, and Phone App zero-fee UPI checkout.',
    hintLocation: '.github/workflows/android-apk.yml · scripts/configure-android-apk.mjs · README.md'
  }
];

export const VERSION_UPDATE_LOCATIONS = [
  {
    id: 'loc-uptodown-autosync',
    version: '2.0.2.8',
    area: 'Uptodown Universal APK, Monetization & GitHub Release Auto-Sync',
    file: '.github/workflows/android-apk.yml · scripts/configure-android-apk.mjs · public/uptodown-manifest.json',
    status: 'UPDATED',
    summary:
      'Automated universal APK release pipeline with semantic tags, Uptodown crawler feed (uptodown-manifest.json), Play-Services-free standalone execution, and Uptodown monetization metadata.'
  },
  {
    id: 'loc-indus-jks-payment',
    version: '2.0.2.7',
    area: 'PhonePe Indus Appstore Zero-Fee UPI Gateway & Persistent .jks Keystore Bundle',
    file: 'src/commerce-catalog.jsx · scripts/configure-android-apk.mjs · .github/workflows/galaxy-store-aab.yml',
    status: 'UPDATED',
    summary:
      'Scoped zero-commission PhonePe/UPI checkout and free coupon bypass strictly to the Android APK while keeping Web untouched; bundled matching afterdark-upload.jks and dot-free icons.'
  },
  {
    id: 'loc-version-core',
    version: '2.0.2.8',
    area: 'Version & Telemetry Engine',
    file: 'src/version-manifest.js · README.md',
    status: 'UPDATED',
    summary: '4-segment semantic version decoder (2.0.2.8), update-location map, and Uptodown + PhonePe Indus + Microsoft Store readiness matrix.'
  },
  {
    id: 'loc-apk-notif-audio',
    version: '2.0.2.6',
    area: 'Android APK Notification & 3-Way Sound Synthesizer',
    file: 'src/notification-sound.js · scripts/configure-android-apk.mjs',
    status: 'UPDATED',
    summary:
      'Added distinct Android APK Crystal Santoor & Sub-Bass chime + POST_NOTIFICATIONS permission + animated APK heads-up notification banner.'
  },
  {
    id: 'loc-100-indian-brands',
    version: '2.0.2.6',
    area: '100 Top Indian Brands In-Chat Ad Engine',
    file: 'src/indian-brands-100.js · src/commerce-data.js',
    status: 'UPDATED',
    summary:
      'Expanded in-chat commerce catalog to 100 Top Indian Brands across Quick Commerce, Food, Fashion, Jewellery, Beauty, Gadgets, Stays & OTT.'
  },
  {
    id: 'loc-traffic-control',
    version: '2.0.2.6',
    area: 'Adaptive Traffic Control & Surge Protection',
    file: 'src/traffic-control.js · api/[...route].js',
    status: 'UPDATED',
    summary:
      'Token-bucket rate limiter, priority couple-chat lane, request coalescing, automatic exponential backoff retry, and live load telemetry.'
  },
  {
    id: 'loc-google-auth',
    version: '2.0.2.6',
    area: 'Google Account Authentication (Web & APK)',
    file: 'src/google-auth.js · api/[...route].js',
    status: 'UPDATED',
    summary:
      'Environment-variable-backed Google Sign-In with official Google button, in-memory token management, and instant backend session issuing.'
  },
  {
    id: 'loc-e2ee-notch',
    version: '2.0.2.2',
    area: 'E2EE Plaintext Unlock & Mobile Notch Safe-Area',
    file: 'src/e2ee-crypto.js · src/style.css',
    status: 'VERIFIED',
    summary:
      'Eliminated raw AD_E2EE_V1 ciphertext display in unlocked rooms and enforced viewport-fit=cover + safe-area top padding across all mobile screens.'
  }
];

export const STORE_COMPATIBILITY_MATRIX = [
  {
    storeId: 'uptodown-android',
    name: 'Uptodown Android App Store (Global Auto-Sync)',
    packageId: 'com.afterdark.universe',
    status: 'READY',
    features: 'Universal APK (All ABIs) · GitHub Release Auto-Crawler Sync · Play-Services-Free · Uptodown Monetization Ready'
  },
  {
    storeId: 'phonepe-indus',
    name: 'PhonePe Developer (Indus Appstore)',
    packageId: 'com.afterdark.universe',
    status: 'READY',
    features: 'Signed AAB & APK + Matching .jks · 100 Indian Brands · PhonePe/UPI Zero-Fee Checkout & Free Bypass'
  },
  {
    storeId: 'microsoft-store-pwa',
    name: 'Microsoft Store (Windows 10/11 Free PWA)',
    packageId: 'com.afterdark.universe',
    status: 'READY',
    features: '100% Free Individual Account · Auto-Updating Hosted Web/PWA via PWABuilder'
  },
  {
    storeId: 'github-releases-pwa',
    name: 'GitHub Releases APK & Universal PWA',
    packageId: 'com.afterdark.universe',
    status: 'READY',
    features: 'Automated CI/CD signed release APK + standalone installable Web App Manifest'
  }
];

export const VERSION_CHANGELOG = [
  {
    version: '2.0.2.8',
    date: '2026-11-09',
    badge: 'CURRENT RELEASE',
    highlights: [
      'Uptodown Universal Android APK (`AFTERDARK-uptodown-universal.apk`) with automated GitHub Releases crawler sync and Uptodown monetization compliance',
      'Automated CI/CD trigger on repository updates so every new push to `main` builds and publishes the latest APK to GitHub Releases for hands-free Uptodown refresh',
      'Developer-grade GitHub README with live website & APK download buttons, sequential screenshot showcase, and full release manifest'
    ]
  },
  {
    version: '2.0.2.7',
    date: '2026-11-09',
    badge: 'PREVIOUS',
    highlights: [
      'Resolved PhonePe Indus Appstore On-Hold status with Phone App-only Zero-Commission UPI & PhonePe Intent Gateway + 100% Free Coupon Bypass (Web kept 100% untouched)',
      'Fixed Signature Mismatch by persisting and bundling `afterdark-upload.jks` + `KEYSTORE_CREDENTIALS.txt` and dot-free crescent moon icons across all builds'
    ]
  },
  {
    version: '2.0.2.6',
    date: '2026-11-08',
    badge: 'MILESTONE',
    highlights: [
      'Auto-incrementing Android `versionCode` (`202600 + run_number`), Flirty Human Surge Bot Shield, and cryptographic Single-Guest Room Lock'
    ]
  },
  {
    version: '2.0.2.3',
    date: '2026-11-05',
    badge: 'CORE 2.0',
    highlights: [
      '4-Segment Semantic Version System with live Update Location Inspector',
      'Android APK Native Notification Banner with smooth spring animation & dedicated Santoor chime distinct from Web Host/Guest sounds',
      '100 Top Indian Brands integrated into the In-Chat Contextual Ad & Surprise Drop Engine',
      '1-Click Google Account Authentication and Adaptive Surge Traffic Control'
    ]
  },
  {
    version: '2.0.1.2',
    date: '2026-11-05',
    badge: 'SECURITY PATCH',
    highlights: [
      'Fixed raw AD_E2EE_V1 ciphertext display on Main Host chat when Guest sends messages',
      'Added mobile camera notch safe-area padding and animated Crescent Moon brand logo'
    ]
  },
  {
    version: '2.0.0.1',
    date: '2026-11-04',
    badge: 'FOUNDATION',
    highlights: [
      'Initial Gen-2 AES-256-GCM E2EE Guest + Host pairing with 6-digit OTP and QR code'
    ]
  }
];

export function decodeVersionString(versionStr = APP_VERSION) {
  const parts = String(versionStr || APP_VERSION)
    .trim()
    .replace(/^v/i, '')
    .split('.');
  return {
    raw: `${parts[0] || '2'}.${parts[1] || '0'}.${parts[2] || '2'}.${parts[3] || '8'}`,
    majorGen: Number(parts[0] || 2),
    platformChannel: Number(parts[1] || 0),
    featureMilestone: Number(parts[2] || 2),
    patchScope: Number(parts[3] || 8),
    segments: VERSION_SEGMENTS,
    updateLocations: VERSION_UPDATE_LOCATIONS,
    storeMatrix: STORE_COMPATIBILITY_MATRIX
  };
}
