// Real-time 3-Mode Smooth Audio & Android APK Notification Engine for AFTERDARK (v2.0.2.3)
// Provides three completely distinct, Butterworth-filtered acoustic signatures:
// 1. Android APK Native Chime ('apk'): Crystal Santoor & Warm Sub-Bass Shimmer (528Hz -> 660Hz -> 792Hz -> 1056Hz + 264Hz Sub-Bass + Haptics)
// 2. Website Main Host Chime ('creator'): Velvet Rose Marimba & Warm Bell Chord (D5 -> F#5 -> A5 -> D6)
// 3. Website Guest Partner Chime ('guest'): Moonlight Celestial Harp Glissando (E5 -> G#5 -> B5 -> E6 -> G#6)

let sharedAudioCtx = null;
const APK_SOUND_MODE_KEY = 'afterdark_apk_sound_mode_v2';

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Detects whether the user is running inside the AFTERDARK Android APK / Capacitor wrapper,
 * Android WebView (`; wv)`), installed standalone APK/PWA, or has enabled APK Sound Mode.
 */
export function isAndroidApkEnvironment() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  try {
    const savedPref = window.localStorage?.getItem(APK_SOUND_MODE_KEY);
    if (savedPref === 'apk') return true;
    if (savedPref === 'web') return false;
  } catch {
    // ignore storage errors
  }
  const ua = String(navigator.userAgent || '');
  const isCapacitor = Boolean(
    window.Capacitor ||
      ua.includes('Capacitor') ||
      ua.includes('; wv)') ||
      ua.includes('AfterDarkAPK')
  );
  const isAndroidStandalone =
    /Android/i.test(ua) &&
    Boolean(window.matchMedia?.('(display-mode: standalone)')?.matches);
  return isCapacitor || isAndroidStandalone;
}

export const isAndroidApkRuntime = isAndroidApkEnvironment;

export function setPreferredSoundProfile(mode = 'auto') {
  if (typeof window === 'undefined') return;
  try {
    if (mode === 'apk' || mode === 'web') {
      window.localStorage?.setItem(APK_SOUND_MODE_KEY, mode);
    } else {
      window.localStorage?.removeItem(APK_SOUND_MODE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function setSimulatedApkNotificationMode(enableApk = true) {
  setPreferredSoundProfile(enableApk ? 'apk' : 'web');
}

export function getActiveSoundProfileLabel(viewerRole = 'creator') {
  if (isAndroidApkEnvironment()) {
    return '📱 Android APK · Crystal Santoor & Sub-Bass Chime';
  }
  return viewerRole === 'guest'
    ? '🌙 Guest Web · Moonlight Celestial Harp'
    : '🌹 Host Web · Velvet Rose Marimba';
}

/**
 * Dedicated Android APK Notification Sound:
 * "Crystal Santoor & Warm Sub-Bass Shimmer" (528Hz Solfeggio C5 -> E5 -> G5 -> C6 -> E6)
 * Distinct from both Website Host and Website Guest chimes, engineered to cut through
 * mobile phone speakers cleanly while feeling warm and luxurious.
 */
export function playAndroidApkNotificationSound(enabled = true) {
  if (!enabled || typeof window === 'undefined') return false;
  try {
    // Trigger Android native haptic pulse rhythm if supported on device
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([90, 45, 140, 40, 90]);
      } catch {
        // ignore vibrate restriction
      }
    }

    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2850, now);
    filter.Q.setValueAtTime(1.15, now);
    filter.connect(ctx.destination);

    // 6-Note Crystal Santoor Double-Strike + Warm Sub-Octave Resonance (Distinct APK Signature)
    const apkSantoorNotes = [
      { freq: 528.0, detuneFreq: 530.2, subFreq: 264.0, start: 0.0, duration: 0.26, gain: 0.19 },
      { freq: 660.0, detuneFreq: 662.5, subFreq: 330.0, start: 0.07, duration: 0.28, gain: 0.20 },
      { freq: 792.0, detuneFreq: 795.0, subFreq: 396.0, start: 0.14, duration: 0.32, gain: 0.21 },
      { freq: 1056.0, detuneFreq: 1059.5, subFreq: 528.0, start: 0.22, duration: 0.42, gain: 0.22 },
      { freq: 1320.0, detuneFreq: 1324.0, subFreq: 660.0, start: 0.32, duration: 0.48, gain: 0.17 },
      { freq: 1584.0, detuneFreq: 1588.0, subFreq: 792.0, start: 0.41, duration: 0.62, gain: 0.14 }
    ];

    apkSantoorNotes.forEach(({ freq, detuneFreq, subFreq, start, duration, gain }) => {
      const mainOsc = ctx.createOscillator();
      const shimmerOsc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      mainOsc.type = 'triangle';
      mainOsc.frequency.setValueAtTime(freq, now + start);

      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(detuneFreq, now + start);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(subFreq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.016);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      mainOsc.connect(gainNode);
      shimmerOsc.connect(gainNode);
      subOsc.connect(gainNode);
      gainNode.connect(filter);

      mainOsc.start(now + start);
      shimmerOsc.start(now + start);
      subOsc.start(now + start);

      mainOsc.stop(now + start + duration + 0.03);
      shimmerOsc.stop(now + start + duration + 0.03);
      subOsc.stop(now + start + duration + 0.03);
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Plays a distinct, ultra-smooth incoming message chime depending on platform & `viewerRole`:
 * - Android APK ('apk' or `isAndroidApkEnvironment()`): Crystal Santoor & Sub-Bass Shimmer
 * - Website 'creator' (Main Host App): Velvet Rose Marimba & Warm Bell Chord (D5 -> F#5 -> A5 -> D6)
 * - Website 'guest' (Guest Partner App): Moonlight Celestial Harp Glissando (E5 -> G#5 -> B5 -> E6 -> G#6)
 */
export function playIncomingMessageSound(enabled = true, viewerRole = 'creator', forceApk = false) {
  if (!enabled || typeof window === 'undefined') return false;

  if (forceApk || viewerRole === 'apk' || isAndroidApkEnvironment()) {
    return playAndroidApkNotificationSound(true);
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(viewerRole === 'guest' ? 2400 : 1950, now);
    filter.Q.setValueAtTime(0.8, now);
    filter.connect(ctx.destination);

    // Distinct melodic signatures for Main Host vs. Guest Site on Website
    const notes =
      viewerRole === 'guest'
        ? [
            // Guest Side: Dreamy 5-note E-major 9th Moonlight Celestial Harp Glissando
            { freq: 659.25, subFreq: 329.63, start: 0.0, duration: 0.28, gain: 0.14, type: 'sine' },
            { freq: 830.61, subFreq: 415.3, start: 0.08, duration: 0.30, gain: 0.16, type: 'sine' },
            { freq: 987.77, subFreq: 493.88, start: 0.16, duration: 0.34, gain: 0.17, type: 'sine' },
            { freq: 1318.51, subFreq: 659.25, start: 0.25, duration: 0.42, gain: 0.15, type: 'sine' },
            { freq: 1661.22, subFreq: 830.61, start: 0.35, duration: 0.55, gain: 0.11, type: 'triangle' }
          ]
        : [
            // Main Host Side: Warm 4-note D-major Velvet Rose Marimba & Soft Bell
            { freq: 587.33, subFreq: 293.66, start: 0.0, duration: 0.24, gain: 0.17, type: 'sine' },
            { freq: 739.99, subFreq: 369.99, start: 0.11, duration: 0.26, gain: 0.19, type: 'sine' },
            { freq: 880.0, subFreq: 440.0, start: 0.22, duration: 0.30, gain: 0.20, type: 'sine' },
            { freq: 1174.66, subFreq: 587.33, start: 0.34, duration: 0.52, gain: 0.16, type: 'triangle' }
          ];

    notes.forEach(({ freq, subFreq, start, duration, gain, type }) => {
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(subFreq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.022);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gainNode);
      subOsc.connect(gainNode);
      gainNode.connect(filter);

      osc.start(now + start);
      subOsc.start(now + start);
      osc.stop(now + start + duration + 0.03);
      subOsc.stop(now + start + duration + 0.03);
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Plays a smooth, tactile acoustic bubble-pop when sending a message
 * (distinct pitch contour for APK vs Host Web vs Guest Web).
 */
export function playOutgoingMessageSound(enabled = true, viewerRole = 'creator') {
  if (!enabled || typeof window === 'undefined') return false;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const isApk = isAndroidApkEnvironment();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    const startFreq = isApk ? 420 : viewerRole === 'guest' ? 350 : 295;
    const endFreq = isApk ? 840 : viewerRole === 'guest' ? 720 : 610;

    osc.type = isApk ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.075);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.014);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
    return true;
  } catch {
    return false;
  }
}

/**
 * Plays a soft, subtle 2-note "blush pop" shimmer when the partner reads your message.
 */
export function playMessageSeenSound(enabled = true) {
  if (!enabled || typeof window === 'undefined') return false;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const notes = [
      { freq: 659.25, start: 0, duration: 0.11, gain: 0.08 },
      { freq: 987.77, start: 0.08, duration: 0.2, gain: 0.1 }
    ];

    notes.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.018);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration + 0.02);
    });

    return true;
  } catch {
    return false;
  }
}

const GENZ_SEEN_SLANG_LINES = [
  '🫣 Caught in 4K blushing · Padh ke smile aa gayi 😏',
  '👀 Ankhiyon se गोली maar di · Chupke se padh liya ♥',
  '🦋 Butterflies delivered · Dil mein उतर gaya, reply pak raha hai ✨',
  '🔥 Lowkey obsessed · Dekh ke sharma rahe hain 😌',
  '😌 Hau miyaan, padh liya chupke se · Full rizz received ♥',
  '💘 Nazrein mil gayi · Screen dekh ke blush on peak 🥰'
];

export function getGenZSeenStatusText(messageId = '') {
  const str = String(messageId || 'default');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return GENZ_SEEN_SLANG_LINES[hash % GENZ_SEEN_SLANG_LINES.length];
}

/**
 * Dispatches a native Android / OS notification via ServiceWorker or Notification API
 * and plays the platform-appropriate incoming sound (APK Santoor vs Web Host vs Web Guest).
 */
let titleResetTimer = null;
const ORIGINAL_TITLE =
  typeof document !== 'undefined' ? document.title : 'AFTERDARK · Private Couple Chat';

export async function triggerIncomingPartnerAlert({
  senderName = 'Your Partner',
  messageText = 'Sent you a private message ♥',
  soundEnabled = true,
  viewerRole = 'creator',
  forceApkMode = false
}) {
  const isApk = forceApkMode || isAndroidApkEnvironment();

  if (soundEnabled) {
    playIncomingMessageSound(true, viewerRole, isApk);
  }

  if (typeof document !== 'undefined') {
    if (titleResetTimer) clearTimeout(titleResetTimer);
    document.title = `💬 ${senderName} texted you! · AFTERDARK`;
    titleResetTimer = setTimeout(() => {
      document.title = ORIGINAL_TITLE;
    }, 6000);
  }

  const cleanPreview = String(messageText || 'Sent you a private E2EE message ♥').slice(0, 110);
  const notifTitle = isApk
    ? `☾ AFTERDARK APK · ${senderName}`
    : `💌 New message from ${senderName}`;

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted' && (document.hidden || isApk)) {
      const notifOptions = {
        body: cleanPreview,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: 'afterdark-partner-msg',
        renotify: true,
        vibrate: [90, 45, 140, 40, 90],
        data: { senderName, viewerRole, version: '2.0.2.3' }
      };

      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && typeof reg.showNotification === 'function') {
            await reg.showNotification(notifTitle, notifOptions);
            return { ok: true, mode: isApk ? 'apk' : 'web' };
          }
        }
        new Notification(notifTitle, notifOptions);
      } catch {
        // Fallback handled by in-app animated heads-up notification banner
      }
    }
  }

  return { ok: true, mode: isApk ? 'apk' : 'web' };
}

export async function requestBrowserNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export const requestNativeNotificationPermission = requestBrowserNotificationPermission;

