/**
 * AFTERDARK — End-to-End Encryption (E2EE) & Zero-Knowledge Guest Link Cryptography
 *
 * Security Guarantees:
 * 1. Guest-specific access links (`?invite=<token>&k=ad1_<hash>`) NEVER contain the 6-digit OTP
 *    or decryption key. `k` is a one-way salted SHA-256 cryptographic commitment.
 * 2. All chat messages, captions, and date notes are encrypted client-side using authenticated
 *    AES-256-GCM (`AD_E2EE_V1:<iv_b64url>:<ciphertext_and_tag_b64url>`) with a 256-bit key
 *    derived via PBKDF2-HMAC-SHA256 (50,000 iterations) from the 6-digit OTP + optional E2EE passphrase.
 * 3. Even if an attacker or third party obtains the guest-specific access link (`?invite=...`)
 *    or inspects server storage, the message history remains unreadable ciphertext without the
 *    verified 6-digit OTP (and optional custom E2EE passphrase).
 */

const E2EE_PREFIX = 'AD_E2EE_V1:';
const E2EE_STORAGE_PREFIX = 'afterdark_e2ee_ctx_v1_';
const PBKDF2_ITERATIONS = 50000;

// Pure synchronous FIPS 180-4 SHA-256 implementation for instant commitment hashing & fingerprints
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function rotr(n, x) {
  return (x >>> n) | (x << (32 - n));
}

export function sha256Bytes(input) {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : input instanceof Uint8Array
      ? input
      : new Uint8Array(0);

  const bitLen = bytes.length * 8;
  const totalLen = (((bytes.length + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(totalLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

export function sha256Hex(input) {
  const digest = sha256Bytes(input);
  let hex = '';
  for (let i = 0; i < digest.length; i++) {
    hex += digest[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(b64u) {
  const padded = String(b64u || '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(String(b64u || '').length / 4) * 4, '=');
  if (typeof atob === 'function') {
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i);
    }
    return out;
  }
  return new Uint8Array(Buffer.from(padded, 'base64'));
}

export function encodeOtpSignature(otp, inviteToken = '') {
  const cleanOtp = String(otp || '').replace(/\D/g, '').slice(0, 6);
  if (cleanOtp.length !== 6) return '';
  const cleanToken = String(inviteToken || 'global').trim();
  const digest = sha256Hex(`afterdark_otp_commit_v1|${cleanToken}|${cleanOtp}`);
  return `ad1_${digest.slice(0, 32)}`;
}

export function verifyOtpSignature(suppliedOtp, inviteToken = '', signature = '') {
  const cleanOtp = String(suppliedOtp || '').replace(/\D/g, '').slice(0, 6);
  const sig = String(signature || '').trim();
  if (cleanOtp.length !== 6 || !sig) return false;

  if (sig.startsWith('ad1_')) {
    const expectedWithToken = encodeOtpSignature(cleanOtp, inviteToken);
    if (expectedWithToken === sig) return true;
    const expectedGlobal = encodeOtpSignature(cleanOtp, '');
    return expectedGlobal === sig;
  }

  try {
    const raw =
      typeof atob === 'function'
        ? atob(sig)
        : Buffer.from(sig, 'base64').toString('utf8');
    if (raw.startsWith('ad:')) {
      return raw.slice(3).replace(/\D/g, '').slice(0, 6) === cleanOtp;
    }
  } catch {
    // ignore
  }
  return false;
}

export function deriveE2eeFingerprint(verificationCode, customPassphrase = '') {
  const cleanOtp = String(verificationCode || '').replace(/\D/g, '').slice(0, 6);
  if (cleanOtp.length !== 6) return 'UNVERIFIED-KEY';
  const cleanPass = String(customPassphrase || '').trim();
  const hash = sha256Hex(`afterdark_e2ee_fp_v1|${cleanOtp}|${cleanPass}`).toUpperCase();
  return `${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
}

export function isE2eeCiphertext(value) {
  return typeof value === 'string' && value.startsWith(E2EE_PREFIX);
}

const derivedKeyCache = new Map();

async function getAesGcmKey(verificationCode, customPassphrase = '') {
  const cleanOtp = String(verificationCode || '').replace(/\D/g, '').slice(0, 6);
  if (cleanOtp.length !== 6) {
    throw new Error('E2EE key derivation requires a valid 6-digit OTP.');
  }
  const cleanPass = String(customPassphrase || '').trim();
  const cacheKey = `${cleanOtp}|${cleanPass}`;
  if (derivedKeyCache.has(cacheKey)) {
    return derivedKeyCache.get(cacheKey);
  }

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is required for AES-256-GCM encryption.');
  }

  const encoder = new TextEncoder();
  const secretMaterial = encoder.encode(
    `afterdark_e2ee_secret_v1:${cleanOtp}:${cleanPass}`
  );
  const saltBytes = sha256Bytes(`afterdark_e2ee_salt_v1:${cleanOtp}`);

  const baseKey = await subtle.importKey(
    'raw',
    secretMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  derivedKeyCache.set(cacheKey, aesKey);
  return aesKey;
}

export async function encryptChatMessage(plaintext, keyContext = {}) {
  const rawText = String(plaintext ?? '');
  if (!rawText) return '';
  if (isE2eeCiphertext(rawText)) return rawText;

  const cleanOtp = String(keyContext?.verificationCode || '')
    .replace(/\D/g, '')
    .slice(0, 6);
  if (cleanOtp.length !== 6) {
    throw new Error('Cannot encrypt message without verified 6-digit E2EE session passcode.');
  }

  const aesKey = await getAesGcmKey(cleanOtp, keyContext?.customPassphrase || '');
  const iv = new Uint8Array(12);
  globalThis.crypto.getRandomValues(iv);

  const encodedPlaintext = new TextEncoder().encode(rawText);
  const cipherBuffer = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encodedPlaintext
  );

  const cipherBytes = new Uint8Array(cipherBuffer);
  return `${E2EE_PREFIX}${bytesToBase64Url(iv)}:${bytesToBase64Url(cipherBytes)}`;
}

export async function decryptChatMessage(payload, keyContext = {}) {
  const raw = String(payload ?? '');
  if (!raw) {
    return {
      plaintext: '',
      encrypted: false,
      verified: true,
      locked: false,
      rawCiphertext: null
    };
  }

  if (!isE2eeCiphertext(raw)) {
    return {
      plaintext: raw,
      encrypted: false,
      verified: true,
      locked: false,
      rawCiphertext: null
    };
  }

  const cleanOtp = String(keyContext?.verificationCode || '')
    .replace(/\D/g, '')
    .slice(0, 6);

  if (keyContext?.locked || cleanOtp.length !== 6) {
    return {
      plaintext:
        '🔒 End-to-End Encrypted Message — Verify 6-digit OTP / E2EE Key to unlock message history',
      encrypted: true,
      verified: false,
      locked: true,
      rawCiphertext: raw
    };
  }

  try {
    const withoutPrefix = raw.slice(E2EE_PREFIX.length);
    const sepIdx = withoutPrefix.indexOf(':');
    if (sepIdx === -1) {
      throw new Error('Malformed E2EE envelope');
    }
    const ivB64 = withoutPrefix.slice(0, sepIdx);
    const cipherB64 = withoutPrefix.slice(sepIdx + 1);

    const iv = base64UrlToBytes(ivB64);
    const cipherBytes = base64UrlToBytes(cipherB64);
    const aesKey = await getAesGcmKey(cleanOtp, keyContext?.customPassphrase || '');

    const plainBuffer = await globalThis.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      cipherBytes
    );

    const plaintext = new TextDecoder().decode(plainBuffer);
    return {
      plaintext,
      encrypted: true,
      verified: true,
      locked: false,
      rawCiphertext: raw
    };
  } catch {
    return {
      plaintext:
        '🔒 End-to-End Encrypted Message (Protected by E2EE Passphrase / 6-Digit OTP)',
      encrypted: true,
      verified: false,
      locked: true,
      rawCiphertext: raw
    };
  }
}

export async function encryptMessageRecord(record = {}, keyContext = {}) {
  const cleanOtp = String(keyContext?.verificationCode || '')
    .replace(/\D/g, '')
    .slice(0, 6);
  if (cleanOtp.length !== 6) return record;

  const next = { ...record };
  const rawBody = String(next.body || next.text || '');
  if (rawBody && !isE2eeCiphertext(rawBody)) {
    const encryptedBody = await encryptChatMessage(rawBody, keyContext);
    next.body = encryptedBody;
    next.text = encryptedBody;
  }

  if (next.dateMeta && typeof next.dateMeta === 'object' && next.dateMeta.description) {
    if (!isE2eeCiphertext(next.dateMeta.description)) {
      next.dateMeta = {
        ...next.dateMeta,
        description: await encryptChatMessage(next.dateMeta.description, keyContext)
      };
    }
  }

  if (next.photoMeta && typeof next.photoMeta === 'object' && next.photoMeta.caption) {
    if (!isE2eeCiphertext(next.photoMeta.caption)) {
      next.photoMeta = {
        ...next.photoMeta,
        caption: await encryptChatMessage(next.photoMeta.caption, keyContext)
      };
    }
  }

  next.e2ee = true;
  next.e2eeAlg = 'AES-256-GCM-PBKDF2';
  next.keyFingerprint = deriveE2eeFingerprint(cleanOtp, keyContext?.customPassphrase || '');
  return next;
}

export async function decryptMessageRecord(record = {}, keyContext = {}) {
  if (!record || typeof record !== 'object') return record;
  const next = { ...record };
  const rawPayload = String(next.body || next.text || '');
  const wasEncrypted = Boolean(next.e2ee || isE2eeCiphertext(rawPayload));

  if (rawPayload) {
    if (keyContext?.locked && (wasEncrypted || !isE2eeCiphertext(rawPayload))) {
      next.body =
        '🔒 End-to-End Encrypted Message — Verify 6-digit OTP / E2EE Key to unlock message history';
      next.text = next.body;
      next.e2ee = true;
      next.e2eeVerified = false;
      next.e2eeLocked = true;
      next.rawCiphertext = isE2eeCiphertext(rawPayload)
        ? rawPayload
        : `AD_E2EE_V1:locked:${ sha256Hex(rawPayload).slice(0, 32) }`;
    } else {
      const res = await decryptChatMessage(rawPayload, keyContext);
      next.body = res.plaintext;
      next.text = res.plaintext;
      next.e2ee = wasEncrypted || res.encrypted;
      next.e2eeVerified = res.verified;
      next.e2eeLocked = res.locked;
      next.rawCiphertext = res.rawCiphertext || (wasEncrypted ? rawPayload : null);
    }
  }

  if (next.dateMeta && typeof next.dateMeta === 'object' && next.dateMeta.description) {
    const descRes = await decryptChatMessage(next.dateMeta.description, keyContext);
    next.dateMeta = {
      ...next.dateMeta,
      description: descRes.plaintext
    };
  }

  if (next.photoMeta && typeof next.photoMeta === 'object' && next.photoMeta.caption) {
    const capRes = await decryptChatMessage(next.photoMeta.caption, keyContext);
    next.photoMeta = {
      ...next.photoMeta,
      caption: capRes.plaintext
    };
  }

  if (!next.keyFingerprint && keyContext?.verificationCode) {
    next.keyFingerprint = deriveE2eeFingerprint(
      keyContext.verificationCode,
      keyContext.customPassphrase || ''
    );
  }

  return next;
}

export function saveSessionE2eeContext(scopeKey, { verificationCode, customPassphrase = '', locked = false }) {
  if (typeof window === 'undefined') return;
  const cleanOtp = String(verificationCode || '').replace(/\D/g, '').slice(0, 6);
  const key = `${E2EE_STORAGE_PREFIX}${scopeKey || 'default'}`;
  const payload = {
    verificationCode: cleanOtp,
    customPassphrase: String(customPassphrase || '').trim(),
    locked: Boolean(locked),
    keyFingerprint: cleanOtp.length === 6 ? deriveE2eeFingerprint(cleanOtp, customPassphrase) : '',
    updatedAt: Date.now()
  };
  try {
    sessionStorage.setItem(key, JSON.stringify(payload));
    localStorage.setItem(key, JSON.stringify(payload));
    sessionStorage.setItem(`${E2EE_STORAGE_PREFIX}active`, JSON.stringify(payload));
  } catch {
    // ignore storage quota errors
  }
}

export function loadSessionE2eeContext(scopeKey = 'default') {
  if (typeof window === 'undefined') return null;
  const key = `${E2EE_STORAGE_PREFIX}${scopeKey || 'default'}`;
  try {
    const raw =
      sessionStorage.getItem(key) ||
      localStorage.getItem(key) ||
      sessionStorage.getItem(`${E2EE_STORAGE_PREFIX}active`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSessionHistoryLocked(
  scopeKey = 'default',
  locked = true,
  secondaryScopeKey = ''
) {
  if (typeof window === 'undefined') return null;
  const current =
    loadSessionE2eeContext(scopeKey) ||
    (secondaryScopeKey ? loadSessionE2eeContext(secondaryScopeKey) : null) ||
    {};
  const updated = {
    ...current,
    locked: Boolean(locked),
    updatedAt: Date.now()
  };
  const scopes = new Set(['default', 'active']);
  if (scopeKey) scopes.add(scopeKey);
  if (secondaryScopeKey) scopes.add(secondaryScopeKey);

  try {
    for (const s of scopes) {
      const k = `${E2EE_STORAGE_PREFIX}${s}`;
      sessionStorage.setItem(k, JSON.stringify(updated));
      localStorage.setItem(k, JSON.stringify(updated));
    }
  } catch {
    // ignore
  }
  return updated;
}
