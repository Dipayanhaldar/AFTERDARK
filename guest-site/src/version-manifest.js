/**
 * AFTERDARK Semantic 4-Segment Version & Update Location Manifest
 *
 * Format: MAJOR_GEN . PLATFORM_CHANNEL . FEATURE_MILESTONE . PATCH_SCOPE
 * Current Release: 2.0.2.3
 *
 * Segment Meaning:
 * - [2] Major Generation 2: Dual-Site Host + Guest AES-256-GCM E2EE Architecture (AD_E2EE_V1)
 * - [0] Platform Channel 0: Universal Cross-Device & Multi-Store Production Channel
 *       (Web, PWA, Android APK, Amazon Appstore, PhonePe Indus, Samsung Galaxy Store, GitHub Releases)
 * - [2] Feature Milestone 2: 100 Top Indian Brands In-Chat Catalog + Google Account Auth + Adaptive Traffic Control
 * - [3] Patch & Scope 3: Native Android APK Animated Notification & Distinct Santoor Audio + Camera Notch Safe-Area
 */

export const APP_VERSION = '2.0.2.5';
export const APP_VERSION_TAG = 'v2.0.2.5';
export const APP_VERSION_CODENAME = 'Moonlight Santoor · Zero-Blink Chat & Privacy Hardening';
export const APP_RELEASE_DATE = '2026-11-06';

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
    title: 'Universal Multi-Store & Cross-Runtime Build',
    meaning:
      'Unified compatibility across Desktop/Mobile Web, PWA, Android APK, Amazon Appstore, PhonePe Indus Appstore, Samsung Galaxy Store & GitHub Releases.',
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
    digit: '5',
    code: 'UPDATE_PATCH_LOC',
    title: 'Zero-Blink Chat Typing + Public API/App ID Privacy Hardening',
    meaning:
      'Eliminated BroadcastChannel self-echo loop and poll re-render blinking during chat typing, and removed all exposed API/App/Device IDs from public links and bundles.',
    hintLocation: 'src/couple-sync.js · src/main.jsx · src/GuestApp.jsx · src/google-auth.js · api/[...route].js'
  }
];

export const VERSION_UPDATE_LOCATIONS = [
  {
    id: 'loc-version-core',
    version: '2.0.2.5',
    area: 'Version & Telemetry Engine',
    file: 'src/version-manifest.js',
    status: 'UPDATED',
    summary: '4-segment semantic version decoder (2.0.2.5), update-location map, and multi-store readiness matrix.'
  },
  {
    id: 'loc-apk-notif-audio',
    version: '2.0.2.5',
    area: 'Android APK Notification & 3-Way Sound Synthesizer',
    file: 'src/notification-sound.js · scripts/configure-android-apk.mjs',
    status: 'UPDATED',
    summary:
      'Added distinct Android APK Crystal Santoor & Sub-Bass chime + POST_NOTIFICATIONS permission + animated APK heads-up notification banner.'
  },
  {
    id: 'loc-100-indian-brands',
    version: '2.0.2.5',
    area: '100 Top Indian Brands In-Chat Ad Engine',
    file: 'src/indian-brands-100.js · src/commerce-data.js',
    status: 'UPDATED',
    summary:
      'Expanded in-chat commerce catalog to 100 Top Indian Brands across Quick Commerce, Food, Fashion, Jewellery, Beauty, Gadgets, Stays & OTT.'
  },
  {
    id: 'loc-traffic-control',
    version: '2.0.2.5',
    area: 'Adaptive Traffic Control & Surge Protection',
    file: 'src/traffic-control.js · api/[...route].js',
    status: 'UPDATED',
    summary:
      'Token-bucket rate limiter, priority couple-chat lane, request coalescing, automatic exponential backoff retry, and live load telemetry.'
  },
  {
    id: 'loc-google-auth',
    version: '2.0.2.5',
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
    storeId: 'amazon-appstore',
    name: 'Amazon Appstore',
    packageId: 'com.afterdark.social',
    status: 'READY',
    features: 'Fire OS / Android 9–15 compatible · Adaptive Icon · Hardware Accelerated WebView'
  },
  {
    storeId: 'phonepe-indus',
    name: 'PhonePe Developer (Indus Appstore)',
    packageId: 'com.afterdark.social',
    status: 'READY',
    features: '100 Indian Brands · Hinglish/Regional UI · UPI & Indian Commerce Deep-Links'
  },
  {
    storeId: 'samsung-galaxy-store',
    name: 'Samsung Galaxy Store',
    packageId: 'com.afterdark.social',
    status: 'READY',
    features: 'One UI DeX & Foldable Multi-Window (`resizeableActivity="true"`) · Infinity-O Punch-Hole Safe-Area'
  },
  {
    storeId: 'github-releases-pwa',
    name: 'GitHub Releases APK & Universal PWA',
    packageId: 'com.afterdark.social',
    status: 'READY',
    features: 'Automated CI/CD signed debug/release APK + standalone installable Web App Manifest'
  }
];

export const VERSION_CHANGELOG = [
  {
    version: '2.0.2.3',
    date: '2026-11-05',
    badge: 'CURRENT RELEASE',
    highlights: [
      '4-Segment Semantic Version System (2.0.2.3) with live Update Location Inspector',
      'Android APK Native Notification Banner with smooth spring animation & dedicated Santoor chime distinct from Web Host/Guest sounds',
      '100 Top Indian Brands integrated into the In-Chat Contextual Ad & Surprise Drop Engine',
      'Adaptive Traffic Control & Surge Protection System (Priority Chat Lane + Request Coalescing + Auto-Backoff)',
      '1-Click Google Account Authentication via Firebase Auth for Web & Android APK',
      'Universal compatibility for Amazon Appstore, PhonePe Indus Appstore, Samsung Galaxy Store (Foldables/One UI), and all browsers'
    ]
  },
  {
    version: '2.0.1.2',
    date: '2026-11-05',
    badge: 'PREVIOUS',
    highlights: [
      'Fixed raw AD_E2EE_V1 ciphertext display on Main Host chat when Guest sends messages',
      'Added mobile camera notch safe-area padding and animated Crescent Moon brand logo',
      'Added custom Android APK launcher icon generator in CI workflow'
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
    raw: `${parts[0] || '2'}.${parts[1] || '0'}.${parts[2] || '2'}.${parts[3] || '3'}`,
    majorGen: Number(parts[0] || 2),
    platformChannel: Number(parts[1] || 0),
    featureMilestone: Number(parts[2] || 2),
    patchScope: Number(parts[3] || 3),
    segments: VERSION_SEGMENTS,
    updateLocations: VERSION_UPDATE_LOCATIONS,
    storeMatrix: STORE_COMPATIBILITY_MATRIX
  };
}
