// Real-time Smooth Audio Engine for AFTERDARK (Distinct Host vs. Guest Message Chimes,
// Tactile Outgoing Send Whoosh-Pop, & "Seen" Shimmer)
// Uses Web Audio API with Butterworth low-pass filtering for silky, click-free mobile & desktop sound.

let sharedAudioCtx = null;

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
 * Plays a distinct, ultra-smooth incoming message chime depending on `viewerRole`:
 * - 'creator' (Main Host App): Velvet Rose Marimba & Warm Bell Chord (D5 -> F#5 -> A5 -> D6)
 * - 'guest' (Guest Partner App): Moonlight Celestial Harp Glissando (E5 -> G#5 -> B5 -> E6 -> G#6)
 */
export function playIncomingMessageSound(enabled = true, viewerRole = 'creator') {
  if (!enabled || typeof window === 'undefined') return false;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(viewerRole === 'guest' ? 2400 : 1950, now);
    filter.Q.setValueAtTime(0.8, now);
    filter.connect(ctx.destination);

    // Distinct melodic signatures for Main Host vs. Guest Site
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
 * (slightly warmer pitch on Host, airier pitch on Guest).
 */
export function playOutgoingMessageSound(enabled = true, viewerRole = 'creator') {
  if (!enabled || typeof window === 'undefined') return false;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    const startFreq = viewerRole === 'guest' ? 350 : 295;
    const endFreq = viewerRole === 'guest' ? 720 : 610;

    osc.type = 'sine';
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

/**
 * Funny, romantic Gen-Z Hinglish/Hyderabadi read-receipt lines (instead of boring "Seen" or blue ticks!)
 */
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
 * Triggers a browser system notification (if granted) + flashes the document tab title.
 */
let titleResetTimer = null;
const ORIGINAL_TITLE =
  typeof document !== 'undefined' ? document.title : 'AFTERDARK · Private Couple Chat';

export function triggerIncomingPartnerAlert({
  senderName = 'Your Partner',
  messageText = 'Sent you a private message ♥',
  soundEnabled = true,
  viewerRole = 'creator'
}) {
  if (soundEnabled) {
    playIncomingMessageSound(true, viewerRole);
  }

  if (typeof document !== 'undefined') {
    if (titleResetTimer) clearTimeout(titleResetTimer);
    document.title = `💬 ${senderName} texted you! · AFTERDARK`;
    titleResetTimer = setTimeout(() => {
      document.title = ORIGINAL_TITLE;
    }, 6000);
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted' && document.hidden) {
      try {
        new Notification(`💌 New message from ${senderName}`, {
          body: String(messageText || '').slice(0, 90),
          tag: 'afterdark-partner-msg'
        });
      } catch {
        // Ignore notification errors in restricted iframes
      }
    }
  }
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
