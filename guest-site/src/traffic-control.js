/**
 * AFTERDARK Adaptive Traffic Control, Bot Detection & Flirty Human Verification Engine
 *
 * 1. Priority Lane Classification: 1-on-1 E2EE chat messages, OTP pairing, and Auth
 *    always travel on priority lanes.
 * 2. In-Flight GET Coalescing & Surge Queue: Prevents duplicate concurrent GET floods.
 * 3. Passive Human Telemetry + Cloudflare Turnstile / Flirty Human-Only Verification:
 *    Detects automated bots or sudden traffic surges and triggers a romantic, human-only
 *    vibe verification (never traffic lights or distorted text captchas).
 */

import { APP_VERSION } from './version-manifest.js';

export const TRAFFIC_LANES = {
  CRITICAL_CHAT: 'CRITICAL_CHAT',
  AUTH_SESSION: 'AUTH_SESSION',
  LIVE_SYNC: 'LIVE_SYNC',
  BACKGROUND_AI: 'BACKGROUND_AI'
};

const HUMAN_PASS_STORAGE_KEY = 'afterdark_human_pass_token_v2';

export const FLIRTY_HUMAN_CHALLENGES = [
  {
    id: 'midnight_chai',
    prompt: "It's 1:15 AM and your Jaan texts: 'Neend nahi aa rahi...' — what's the only real human move? ♥",
    options: [
      {
        id: 'human_1',
        text: '☕ Send a warm voice note & order midnight chai + Maggi for two ♥',
        isHuman: true
      },
      {
        id: 'bot_1',
        text: '🤖 EXECUTE CRON_SCRAPER_BATCH --threads=64 --no-sleep',
        isHuman: false
      },
      {
        id: 'bot_2',
        text: '⚙️ 01010011 01011001 01001110 ACK_SYN_FLOOD_PORT_443',
        isHuman: false
      }
    ]
  },
  {
    id: 'rainy_drive',
    prompt: "Sudden evening rain starts in the city! Pick the true romantic vibe to prove you're human:",
    options: [
      {
        id: 'bot_1',
        text: '🤖 SELECT * FROM COUPLE_ROOMS WHERE BOT_INDEX = 9999;',
        isHuman: false
      },
      {
        id: 'human_1',
        text: '🌧️ Long drive, old Bollywood songs & hot samosas together ♥',
        isHuman: true
      },
      {
        id: 'bot_2',
        text: '📟 HEADLESS_WEBDRIVER_AUTO_CLICK(x=0, y=0)',
        isHuman: false
      }
    ]
  },
  {
    id: 'rooftop_date',
    prompt: "Your partner says 'Aaj kuch special plan karein?' — what do you pick? ✨",
    options: [
      {
        id: 'human_1',
        text: '🕯️ Candlelight rooftop dinner + surprise dessert hamper ♥',
        isHuman: true
      },
      {
        id: 'bot_1',
        text: '🕸️ CRAWL_ALL_URLS_USER_AGENT_PYTHON_REQUESTS/2.31',
        isHuman: false
      },
      {
        id: 'bot_2',
        text: '🔌 NULL_POINTER_EXCEPTION_AUTOMATED_SCRIPT_V4',
        isHuman: false
      }
    ]
  },
  {
    id: 'naraz_partner',
    prompt: "Your partner replies with just 'Hmm. K.' — how does a real human save the evening? 😉",
    options: [
      {
        id: 'bot_1',
        text: '🤖 PARSE_JSON_TOKEN_BRUTEFORCE_LOOP(10000)',
        isHuman: false
      },
      {
        id: 'bot_2',
        text: '📡 PING_FLOOD_ICMP_ECHO_REQUEST_TIMEOUT',
        isHuman: false
      },
      {
        id: 'human_1',
        text: '🍫 Send their favorite dark chocolate & a cute selfie immediately ♥',
        isHuman: true
      }
    ]
  }
];

const inFlightGetRequests = new Map();

const humanTelemetry = {
  pointerEvents: 0,
  keyEvents: 0,
  touchEvents: 0,
  scrollEvents: 0,
  firstInteractionAt: 0,
  lastInteractionAt: 0,
  mutationTimestamps: [],
  challengeRequired: false,
  challengeReason: '',
  verifiedPassToken: ''
};

if (typeof window !== 'undefined') {
  try {
    humanTelemetry.verifiedPassToken = localStorage.getItem(HUMAN_PASS_STORAGE_KEY) || '';
  } catch {
    // ignore storage errors
  }

  const markHumanInteraction = (type) => {
    const now = Date.now();
    if (!humanTelemetry.firstInteractionAt) {
      humanTelemetry.firstInteractionAt = now;
    }
    humanTelemetry.lastInteractionAt = now;
    if (type === 'pointer') humanTelemetry.pointerEvents = Math.min(500, humanTelemetry.pointerEvents + 1);
    if (type === 'key') humanTelemetry.keyEvents = Math.min(500, humanTelemetry.keyEvents + 1);
    if (type === 'touch') humanTelemetry.touchEvents = Math.min(500, humanTelemetry.touchEvents + 1);
    if (type === 'scroll') humanTelemetry.scrollEvents = Math.min(500, humanTelemetry.scrollEvents + 1);
  };

  window.addEventListener('pointermove', () => markHumanInteraction('pointer'), { passive: true });
  window.addEventListener('pointerdown', () => markHumanInteraction('pointer'), { passive: true });
  window.addEventListener('keydown', () => markHumanInteraction('key'), { passive: true });
  window.addEventListener('touchstart', () => markHumanInteraction('touch'), { passive: true });
  window.addEventListener('scroll', () => markHumanInteraction('scroll'), { passive: true });
}

export function getHumanTrustScore() {
  if (typeof window === 'undefined') return 85;
  let score = 50;
  if (humanTelemetry.verifiedPassToken) score += 45;
  if (humanTelemetry.pointerEvents >= 3 || humanTelemetry.touchEvents >= 1) score += 20;
  if (humanTelemetry.keyEvents >= 2) score += 15;
  if (humanTelemetry.scrollEvents >= 1) score += 10;

  // Check for automated burst (> 12 non-GET mutations in 3 seconds)
  const now = Date.now();
  humanTelemetry.mutationTimestamps = humanTelemetry.mutationTimestamps.filter(
    (t) => now - t < 3000
  );
  if (humanTelemetry.mutationTimestamps.length > 12 && !humanTelemetry.verifiedPassToken) {
    score -= 45;
  }

  return Math.max(5, Math.min(100, score));
}

export function getStoredHumanPassToken() {
  if (humanTelemetry.verifiedPassToken) return humanTelemetry.verifiedPassToken;
  if (typeof window === 'undefined') return '';
  try {
    const token = localStorage.getItem(HUMAN_PASS_STORAGE_KEY) || '';
    humanTelemetry.verifiedPassToken = token;
    return token;
  } catch {
    return '';
  }
}

export function saveVerifiedHumanPassToken(token) {
  humanTelemetry.verifiedPassToken = String(token || '');
  humanTelemetry.challengeRequired = false;
  humanTelemetry.challengeReason = '';
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        localStorage.setItem(HUMAN_PASS_STORAGE_KEY, String(token));
      } else {
        localStorage.removeItem(HUMAN_PASS_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }
  notifyTrafficListeners();
}

export function triggerFlirtyBotChallenge(reason = 'Sudden traffic surge detected — quick human vibe check ♥') {
  if (getStoredHumanPassToken()) return;
  humanTelemetry.challengeRequired = true;
  humanTelemetry.challengeReason = reason;
  notifyTrafficListeners();
}

const clientTrafficState = {
  mode: 'NORMAL', // 'NORMAL' | 'ELEVATED' | 'SURGE_SHIELD_ACTIVE'
  requestsInWindow: 0,
  coalescedSaves: 0,
  retriedRequests: 0,
  avgLatencyMs: 42,
  recommendedPollMs: 2600,
  serverActiveConnections: 1,
  serverRpm: 12,
  lastUpdatedAt: Date.now()
};

const trafficListeners = new Set();

function notifyTrafficListeners() {
  const snapshot = getClientTrafficSnapshot();
  for (const fn of trafficListeners) {
    try {
      fn(snapshot);
    } catch {
      // ignore listener errors
    }
  }
}

export function classifyEndpointPriority(endpoint = '', method = 'GET') {
  const clean = String(endpoint || '').toLowerCase();
  const upperMethod = String(method || 'GET').toUpperCase();

  if (
    clean.includes('/auth/') ||
    clean.includes('/invites') ||
    clean.includes('/approve') ||
    clean.includes('/security/verify-human')
  ) {
    return TRAFFIC_LANES.AUTH_SESSION;
  }
  if (clean.includes('/messages') && upperMethod === 'POST') {
    return TRAFFIC_LANES.CRITICAL_CHAT;
  }
  if (clean.includes('/ai/')) {
    return TRAFFIC_LANES.BACKGROUND_AI;
  }
  return TRAFFIC_LANES.LIVE_SYNC;
}

export function getDeviceCompatibilityProfile() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      runtime: 'server-node',
      isApkOrStandalone: false,
      networkType: '4g',
      hardwareConcurrency: 4
    };
  }

  const ua = String(navigator.userAgent || '');
  const isCapacitor = Boolean(window.Capacitor || ua.includes('Capacitor') || ua.includes('; wv)'));
  const isStandalonePwa =
    Boolean(window.matchMedia?.('(display-mode: standalone)')?.matches) ||
    Boolean(window.navigator?.standalone);
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  return {
    runtime: isCapacitor
      ? 'android-apk-webview'
      : isStandalonePwa
      ? 'standalone-pwa'
      : /Android/i.test(ua)
      ? 'mobile-android-web'
      : /iPhone|iPad|iPod/i.test(ua)
      ? 'mobile-ios-web'
      : 'desktop-web',
    isApkOrStandalone: isCapacitor || isStandalonePwa,
    networkType: conn?.effectiveType || '4g',
    saveData: Boolean(conn?.saveData),
    hardwareConcurrency: Number(navigator.hardwareConcurrency || 4)
  };
}

export function getAdaptivePollIntervalMs(baseMs = 2600) {
  const profile = getDeviceCompatibilityProfile();
  let interval = Math.max(baseMs, clientTrafficState.recommendedPollMs || baseMs);

  if (clientTrafficState.mode === 'ELEVATED') {
    interval = Math.max(interval, 3600);
  } else if (clientTrafficState.mode === 'SURGE_SHIELD_ACTIVE') {
    interval = Math.max(interval, 4800);
  }

  if (profile.saveData || profile.networkType === '2g' || profile.networkType === 'slow-2g') {
    interval = Math.max(interval, 5000);
  }

  return interval;
}

export function recordServerTrafficHeaders(res, latencyMs = 0) {
  if (!res || !res.headers) return;
  try {
    const mode = res.headers.get('x-afterdark-traffic-mode');
    const pollMs = Number(res.headers.get('x-afterdark-poll-ms') || 0);
    const rpm = Number(res.headers.get('x-afterdark-rpm') || 0);
    const botChallenge = res.headers.get('x-afterdark-bot-challenge');

    if (mode) clientTrafficState.mode = mode;
    if (pollMs >= 1500) clientTrafficState.recommendedPollMs = pollMs;
    if (rpm > 0) clientTrafficState.serverRpm = rpm;
    if (latencyMs > 0) {
      clientTrafficState.avgLatencyMs = Math.round(
        clientTrafficState.avgLatencyMs * 0.7 + latencyMs * 0.3
      );
    }

    if (
      (botChallenge === 'required' || mode === 'SURGE_SHIELD_ACTIVE') &&
      !getStoredHumanPassToken()
    ) {
      humanTelemetry.challengeRequired = true;
      humanTelemetry.challengeReason =
        'High traffic surge detected! Complete a 2-second Flirty Vibe Check so only real humans enter ♥';
    }

    clientTrafficState.lastUpdatedAt = Date.now();
    notifyTrafficListeners();
  } catch {
    // ignore header parse errors
  }
}

export async function executeWithTrafficControl(key, method, priorityLane, requestFn) {
  const upperMethod = String(method || 'GET').toUpperCase();
  const isGet = upperMethod === 'GET';
  const coalesceKey = isGet ? `${upperMethod}:${key}` : null;

  if (!isGet && !String(key).includes('/security/verify-human')) {
    const now = Date.now();
    humanTelemetry.mutationTimestamps.push(now);
    humanTelemetry.mutationTimestamps = humanTelemetry.mutationTimestamps.filter(
      (t) => now - t < 3000
    );
    if (humanTelemetry.mutationTimestamps.length > 14 && !getStoredHumanPassToken()) {
      triggerFlirtyBotChallenge(
        'Rapid activity spike detected! Verify your human vibe in 1 tap ♥'
      );
    }
  }

  if (coalesceKey && inFlightGetRequests.has(coalesceKey)) {
    clientTrafficState.coalescedSaves += 1;
    return inFlightGetRequests.get(coalesceKey);
  }

  const runWithRetry = async () => {
    clientTrafficState.requestsInWindow += 1;
    const maxAttempts = priorityLane === TRAFFIC_LANES.CRITICAL_CHAT ? 3 : 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const startedAt = Date.now();
      try {
        const result = await requestFn();
        const elapsed = Date.now() - startedAt;
        clientTrafficState.avgLatencyMs = Math.round(
          clientTrafficState.avgLatencyMs * 0.75 + elapsed * 0.25
        );
        return result;
      } catch (err) {
        lastError = err;
        const status = Number(err?.status || 0);
        if (err?.requiresFlirtyChallenge && !getStoredHumanPassToken()) {
          triggerFlirtyBotChallenge(err.message || 'Quick Flirty Human Verification required ♥');
        }
        const isTransient = status === 429 || status === 502 || status === 503 || status === 504 || !status;
        if (!isTransient || attempt === maxAttempts) {
          throw err;
        }
        clientTrafficState.retriedRequests += 1;
        const jitterMs = Math.floor(Math.random() * 180);
        const delayMs = attempt * 320 + jitterMs;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw lastError;
  };

  const promise = runWithRetry().finally(() => {
    if (coalesceKey) {
      inFlightGetRequests.delete(coalesceKey);
    }
    notifyTrafficListeners();
  });

  if (coalesceKey) {
    inFlightGetRequests.set(coalesceKey, promise);
  }

  return promise;
}

export function getClientTrafficSnapshot() {
  const profile = getDeviceCompatibilityProfile();
  return {
    version: APP_VERSION,
    ...clientTrafficState,
    adaptivePollMs: getAdaptivePollIntervalMs(),
    inFlightCount: inFlightGetRequests.size,
    deviceProfile: profile,
    humanTrustScore: getHumanTrustScore(),
    humanVerified: Boolean(getStoredHumanPassToken()),
    challengeRequired: Boolean(
      humanTelemetry.challengeRequired && !getStoredHumanPassToken()
    ),
    challengeReason: humanTelemetry.challengeReason
  };
}

export function subscribeTrafficTelemetry(listener) {
  if (typeof listener !== 'function') return () => {};
  trafficListeners.add(listener);
  listener(getClientTrafficSnapshot());
  return () => {
    trafficListeners.delete(listener);
  };
}
