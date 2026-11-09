// Real-time 3-Mode Audible Notification & Sound Engine for AFTERDARK
// Automatically unlocks Web Audio + HTML5 WAV Audio on first user interaction so background poll
// notifications are always clearly audible on Desktop, Mobile Web, and Android APK.

let sharedAudioCtx = null;
let audioUnlocked = false;
const APK_SOUND_MODE_KEY = 'afterdark_apk_sound_mode_v2';
const cachedWavDataUris = {};

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
 * Generates an in-memory 16-bit PCM WAV data URI for a chord sequence so that even if
 * Web Audio API is throttled in a background tab or mobile WebView, HTML5 `<audio>` plays audibly.
 */
function buildChordWavDataUri(notes, totalDurationSec = 0.85) {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * totalDurationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    for (const n of notes) {
      if (t >= n.start && t <= n.start + n.duration) {
        const localT = t - n.start;
        const attack = Math.min(1, localT / 0.015);
        const decay = Math.exp((-3.5 * localT) / n.duration);
        const env = attack * decay;
        sample +=
          env *
          n.gain *
          (Math.sin(2 * Math.PI * n.freq * localT) +
            0.35 * Math.sin(2 * Math.PI * (n.subFreq || n.freq * 0.5) * localT));
      }
    }
    const clamped = Math.max(-0.95, Math.min(0.95, sample));
    view.setInt16(44 + i * 2, Math.floor(clamped * 32767), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function playFallbackWavChime(profileKey, notes, durationSec = 0.85) {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
  try {
    if (!cachedWavDataUris[profileKey]) {
      cachedWavDataUris[profileKey] = buildChordWavDataUri(notes, durationSec);
    }
    const audio = new Audio(cachedWavDataUris[profileKey]);
    audio.volume = 0.85;
    audio.play().catch(() => {});
  } catch {
    // ignore fallback audio errors
  }
}

/**
 * Unlocks the shared Web Audio context on the user's very first interaction
 * (click, tap, or keypress) so subsequent incoming partner message polls are 100% audible.
 */
export function unlockAudioOnFirstInteraction() {
  if (typeof window === 'undefined' || audioUnlocked) return;

  const unlockHandler = () => {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const silentBuf = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = silentBuf;
        source.connect(ctx.destination);
        source.start(0);
        if (ctx.state === 'running') {
          audioUnlocked = true;
        }
      }
    } catch {
      // ignore
    }
  };

  ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, unlockHandler, { passive: true });
  });
}

// Automatically attach unlock listeners in browser environments
if (typeof window !== 'undefined') {
  unlockAudioOnFirstInteraction();
}

export function isAndroidApkEnvironment() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  try {
    const savedPref = window.localStorage?.getItem(APK_SOUND_MODE_KEY);
    if (savedPref === 'apk') return true;
    if (savedPref === 'web') return false;
  } catch {
    // ignore storage errors
  }
  const proto = String(window.location?.protocol || '').toLowerCase();
  const host = String(window.location?.hostname || '').toLowerCase();
  const port = String(window.location?.port || '');
  const isCapacitorOrigin =
    proto === 'capacitor:' ||
    proto === 'file:' ||
    (host === 'localhost' && !port && proto === 'https:');

  const ua = String(navigator.userAgent || '');
  const isCapacitor = Boolean(
    isCapacitorOrigin ||
      window.Capacitor ||
      ua.includes('Capacitor') ||
      ua.includes('; wv)') ||
      ua.includes('AfterDarkAPK') ||
      ua.includes('PhonePeIndusStore')
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
    return 'Android App Alert';
  }
  return viewerRole === 'guest' ? 'Partner Chime' : 'Host Chime';
}

const APK_SANTOOR_NOTES = [
  { freq: 528.0, detuneFreq: 530.2, subFreq: 264.0, start: 0.0, duration: 0.28, gain: 0.34 },
  { freq: 660.0, detuneFreq: 662.5, subFreq: 330.0, start: 0.07, duration: 0.3, gain: 0.36 },
  { freq: 792.0, detuneFreq: 795.0, subFreq: 396.0, start: 0.14, duration: 0.34, gain: 0.38 },
  { freq: 1056.0, detuneFreq: 1059.5, subFreq: 528.0, start: 0.22, duration: 0.44, gain: 0.4 },
  { freq: 1320.0, detuneFreq: 1324.0, subFreq: 660.0, start: 0.32, duration: 0.5, gain: 0.32 },
  { freq: 1584.0, detuneFreq: 1588.0, subFreq: 792.0, start: 0.41, duration: 0.64, gain: 0.28 }
];

const GUEST_HARP_NOTES = [
  { freq: 659.25, subFreq: 329.63, start: 0.0, duration: 0.3, gain: 0.34, type: 'sine' },
  { freq: 830.61, subFreq: 415.3, start: 0.09, duration: 0.32, gain: 0.36, type: 'sine' },
  { freq: 987.77, subFreq: 493.88, start: 0.18, duration: 0.36, gain: 0.38, type: 'sine' },
  { freq: 1318.51, subFreq: 659.25, start: 0.27, duration: 0.45, gain: 0.34, type: 'sine' },
  { freq: 1661.22, subFreq: 830.61, start: 0.37, duration: 0.58, gain: 0.28, type: 'triangle' }
];

const HOST_MARIMBA_NOTES = [
  { freq: 587.33, subFreq: 293.66, start: 0.0, duration: 0.28, gain: 0.36, type: 'sine' },
  { freq: 739.99, subFreq: 369.99, start: 0.11, duration: 0.3, gain: 0.38, type: 'sine' },
  { freq: 880.0, subFreq: 440.0, start: 0.22, duration: 0.34, gain: 0.4, type: 'sine' },
  { freq: 1174.66, subFreq: 587.33, start: 0.34, duration: 0.55, gain: 0.34, type: 'triangle' }
];

export function playAndroidApkNotificationSound(enabled = true) {
  if (!enabled || typeof window === 'undefined') return false;
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([90, 45, 140, 40, 90]);
      } catch {
        // ignore vibrate restriction
      }
    }

    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      playFallbackWavChime('apk', APK_SANTOOR_NOTES, 1.1);
      if (!ctx) return true;
    }

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(1.1, now);
    filter.connect(ctx.destination);

    APK_SANTOOR_NOTES.forEach(({ freq, detuneFreq, subFreq, start, duration, gain }) => {
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
      gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.015);
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
    playFallbackWavChime('apk', APK_SANTOOR_NOTES, 1.1);
    return false;
  }
}

export function playIncomingMessageSound(enabled = true, viewerRole = 'creator', forceApk = false) {
  if (!enabled || typeof window === 'undefined') return false;

  const useApk =
    typeof forceApk === 'object'
      ? Boolean(forceApk?.forceApkMode)
      : Boolean(forceApk || viewerRole === 'apk' || isAndroidApkEnvironment());

  if (useApk) {
    return playAndroidApkNotificationSound(true);
  }

  const notes = viewerRole === 'guest' ? GUEST_HARP_NOTES : HOST_MARIMBA_NOTES;
  const profileKey = viewerRole === 'guest' ? 'guest' : 'creator';

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([70, 40, 90]);
      } catch {
        // ignore
      }
    }

    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      playFallbackWavChime(profileKey, notes, 1.0);
      if (!ctx) return true;
    }

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(viewerRole === 'guest' ? 2800 : 2400, now);
    filter.Q.setValueAtTime(0.85, now);
    filter.connect(ctx.destination);

    notes.forEach(({ freq, subFreq, start, duration, gain, type }) => {
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(subFreq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.018);
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
    playFallbackWavChime(profileKey, notes, 1.0);
    return false;
  }
}

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
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.22, now + 0.014);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
    return true;
  } catch {
    return false;
  }
}

export function playMessageSeenSound(enabled = true) {
  if (!enabled || typeof window === 'undefined') return false;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const notes = [
      { freq: 659.25, start: 0, duration: 0.12, gain: 0.16 },
      { freq: 987.77, start: 0.08, duration: 0.22, gain: 0.2 }
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

  const cleanPreview = String(messageText || 'Sent you a private message ♥').slice(0, 110);
  const notifTitle = `💌 ${senderName} texted you ♥`;

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      const notifOptions = {
        body: cleanPreview,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: 'afterdark-partner-msg',
        renotify: true,
        vibrate: [90, 45, 140, 40, 90],
        data: { senderName, viewerRole }
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
