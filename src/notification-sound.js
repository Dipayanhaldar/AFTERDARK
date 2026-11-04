// Real-time Incoming Message Sound, "Seen" Micro-Chime & Gen-Z Read Status Helper for AFTERDARK
// Uses Web Audio API so it works reliably with zero external audio asset dependencies.

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
 * Plays a pleasant, noticeable 4-note romantic crystal chime when a partner texts.
 */
export function playIncomingMessageSound(enabled = true) {
  if (!enabled || typeof window === 'undefined') return false;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, start: 0, duration: 0.14, gain: 0.18 },
      { freq: 659.25, start: 0.11, duration: 0.16, gain: 0.22 },
      { freq: 783.99, start: 0.22, duration: 0.20, gain: 0.24 },
      { freq: 1046.5, start: 0.34, duration: 0.38, gain: 0.20 }
    ];

    notes.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.025);
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
 * Plays a soft, subtle 2-note "blush pop" shimmer when the partner reads your message.
 */
export function playMessageSeenSound(enabled = true) {
  if (!enabled || typeof window === 'undefined') return false;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const notes = [
      { freq: 659.25, start: 0, duration: 0.09, gain: 0.09 },
      { freq: 880.0, start: 0.08, duration: 0.16, gain: 0.11 }
    ];

    notes.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.015);
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
  soundEnabled = true
}) {
  if (soundEnabled) {
    playIncomingMessageSound(true);
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
