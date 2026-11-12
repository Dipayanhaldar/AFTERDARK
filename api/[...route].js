import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scrypt as scryptCb,
  timingSafeEqual
} from 'node:crypto';
import { promisify } from 'node:util';
import { getLocalDatabase, ObjectId } from './local-db.js';
import { brandCatalog, CITY_PROFILES, analyzeChatContextLocally } from '../src/commerce-data.js';
import {
  APP_VERSION,
  APP_VERSION_TAG,
  APP_VERSION_CODENAME,
  VERSION_SEGMENTS,
  VERSION_UPDATE_LOCATIONS,
  STORE_COMPATIBILITY_MATRIX,
  VERSION_CHANGELOG
} from '../src/version-manifest.js';
import {
  verifyOtpSignature,
  deriveE2eeFingerprint,
  isE2eeCiphertext,
  encryptChatMessage,
  decryptChatMessage
} from '../src/e2ee-crypto.js';

const scrypt = promisify(scryptCb);

// =========================================================================
// CRYPTOGRAPHIC SESSION SIGNING & BRUTE-FORCE INTRUSION SHIELD
// =========================================================================
const SESSION_SIGNING_KEY = createHash('sha256')
  .update(
    String(
      process.env.AFTERDARK_SESSION_SECRET ||
        process.env.SESSION_SECRET ||
        process.env.VERCEL_GIT_COMMIT_SHA ||
        process.env.RENDER_GIT_COMMIT ||
        'afterdark_hmac_256_v2_isolated_vault'
    )
  )
  .digest();

const securityFailures = new Map();

function checkSecurityLockout(scopeKey, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = securityFailures.get(scopeKey);
  if (!entry) return { locked: false, remainingAttempts: maxAttempts };
  if (now - entry.firstAttemptAt > windowMs) {
    securityFailures.delete(scopeKey);
    return { locked: false, remainingAttempts: maxAttempts };
  }
  if (entry.count >= maxAttempts) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.firstAttemptAt + windowMs - now) / 1000));
    return { locked: true, remainingAttempts: 0, retryAfterSec };
  }
  return { locked: false, remainingAttempts: Math.max(0, maxAttempts - entry.count) };
}

function recordSecurityFailure(scopeKey, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const existing = securityFailures.get(scopeKey);
  if (!existing || now - existing.firstAttemptAt > windowMs) {
    securityFailures.set(scopeKey, { count: 1, firstAttemptAt: now });
  } else {
    existing.count += 1;
  }
}

function clearSecurityFailures(scopeKey) {
  securityFailures.delete(scopeKey);
}

function sanitizeInputValue(val) {
  if (Array.isArray(val)) return val.map(sanitizeInputValue);
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      // Strip MongoDB/NoSQL operator keys ($ne, $gt, $where, __proto__, etc.)
      if (k.startsWith('$') || k === '__proto__' || k === 'constructor' || k === 'prototype') {
        continue;
      }
      out[k] = sanitizeInputValue(v);
    }
    return out;
  }
  return val;
}

function signTokenPayload(prefix, payloadObj) {
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
  const dataToSign = `${prefix}.${payloadB64}`;
  const sigB64 = createHmac('sha256', SESSION_SIGNING_KEY).update(dataToSign).digest('base64url');
  return `${dataToSign}.${sigB64}`;
}

function verifyTokenPayload(rawToken, expectedPrefix) {
  if (!rawToken || typeof rawToken !== 'string') return null;
  const parts = rawToken.split('.');
  if (parts.length !== 3 || parts[0] !== expectedPrefix) return null;
  const [prefix, payloadB64, sigB64] = parts;
  const expectedSigB64 = createHmac('sha256', SESSION_SIGNING_KEY)
    .update(`${prefix}.${payloadB64}`)
    .digest('base64url');
  if (sigB64.length !== expectedSigB64.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sigB64), Buffer.from(expectedSigB64))) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function issueSignedCreatorToken(user) {
  return signTokenPayload('ad_s2', {
    uid: String(user._id),
    email: String(user.email || '').toLowerCase(),
    name: String(user.displayName || user.handle || 'Creator').slice(0, 40),
    jti: randomBytes(18).toString('base64url'),
    iat: Date.now()
  });
}

function issueSignedGuestToken({
  connectionId,
  inviteToken,
  verificationCode,
  guestDeviceId,
  guestDisplayName
}) {
  return signTokenPayload('ad_g2', {
    cid: String(connectionId),
    inv: String(inviteToken || ''),
    otp: String(verificationCode || '').slice(0, 6),
    otpHash: hashValue(String(verificationCode || '')),
    dev: String(guestDeviceId || ''),
    name: String(guestDisplayName || 'Meri Jaan').slice(0, 40),
    jti: randomBytes(18).toString('base64url'),
    iat: Date.now()
  });
}

function issueSignedHumanPassToken({ deviceId = '', clientIp = '' } = {}) {
  return signTokenPayload('ad_hp2', {
    dev: String(deviceId || '').slice(0, 64),
    ipHash: hashValue(String(clientIp || '')).slice(0, 16),
    verified: true,
    iat: Date.now(),
    exp: Date.now() + 2 * 60 * 60 * 1000
  });
}

function verifyHumanPassToken(req) {
  const rawPass = String(req?.headers?.['x-afterdark-human-pass'] || '').trim();
  if (!rawPass) return false;
  const parsed = verifyTokenPayload(rawPass, 'ad_hp2');
  if (!parsed || !parsed.verified) return false;
  if (parsed.exp && Number(parsed.exp) < Date.now()) return false;
  return true;
}

// =========================================================================
// ADAPTIVE TRAFFIC CONTROL & BOT DETECTION ENGINE (SERVER-SIDE v2.0.2.6)
// =========================================================================
const trafficTimestamps = [];
const clientTokenBuckets = new Map();
let peakRequestsPerMinute = 14;
let totalRequestsServed = 0;

const AUTOMATED_BOT_UA_REGEX =
  /\b(curl|wget|python-requests|scrapy|httpclient|go-http-client|libwww-perl|sqlmap|nikto|masscan|zgrab|phantomjs|slurp)\b/i;

function evaluateServerTraffic(req, action = '') {
  const now = Date.now();
  totalRequestsServed += 1;
  trafficTimestamps.push(now);
  while (trafficTimestamps.length > 0 && now - trafficTimestamps[0] > 60000) {
    trafficTimestamps.shift();
  }
  const rpm = trafficTimestamps.length;
  if (rpm > peakRequestsPerMinute) peakRequestsPerMinute = rpm;

  const mode =
    rpm > 360 ? 'SURGE_SHIELD_ACTIVE' : rpm > 160 ? 'ELEVATED' : 'NORMAL';
  const recommendedPollMs =
    mode === 'SURGE_SHIELD_ACTIVE' ? 4600 : mode === 'ELEVATED' ? 3400 : 2500;

  // Token-bucket per client IP/device with Priority Couple-Chat lane exemption
  const clientKey =
    String(req?.headers?.['x-device-id'] || req?.headers?.['x-forwarded-for'] || 'anon').slice(
      0,
      64
    );
  const priorityHeader = String(req?.headers?.['x-afterdark-priority'] || '');
  const isPriorityLane =
    priorityHeader === 'CRITICAL_CHAT' ||
    priorityHeader === 'AUTH_SESSION' ||
    action.includes('messages') ||
    action.includes('auth/') ||
    action.includes('invites') ||
    action.includes('approve') ||
    action.includes('security/verify-human');

  let bucket = clientTokenBuckets.get(clientKey);
  if (!bucket || now - bucket.lastRefill > 10000) {
    bucket = { tokens: 120, mutationCount: 0, lastRefill: now };
    clientTokenBuckets.set(clientKey, bucket);
  }
  if (!isPriorityLane) {
    bucket.tokens = Math.max(0, bucket.tokens - 1);
  }
  if (req?.method && req.method !== 'GET' && req.method !== 'OPTIONS') {
    bucket.mutationCount = (bucket.mutationCount || 0) + 1;
  }

  const ua = String(req?.headers?.['user-agent'] || '');
  const hasVerifiedPass = verifyHumanPassToken(req);
  const humanScoreHeader = req?.headers?.['x-afterdark-human-score'];
  const parsedHumanScore =
    humanScoreHeader !== undefined && humanScoreHeader !== ''
      ? Number(humanScoreHeader)
      : 80;

  const isAutomatedScraperUa = Boolean(ua && AUTOMATED_BOT_UA_REGEX.test(ua));
  const isMutationFlood = (bucket.mutationCount || 0) > 28;
  const isSurgeLowHumanScore = mode === 'SURGE_SHIELD_ACTIVE' && parsedHumanScore < 20;

  const botChallengeRequired =
    !hasVerifiedPass &&
    action !== 'security/verify-human' &&
    (isAutomatedScraperUa || isMutationFlood || isSurgeLowHumanScore);

  return {
    rpm,
    peakRpm: peakRequestsPerMinute,
    totalRequestsServed,
    mode,
    recommendedPollMs,
    isPriorityLane,
    hasVerifiedPass,
    botChallengeRequired,
    throttled: !isPriorityLane && bucket.tokens <= 0
  };
}

function setCorsHeaders(req, res, trafficInfo = null) {
  const origin = req?.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, X-Device-Id, X-Client-Ip, X-User-Email, X-User-Name, X-AfterDark-Version, X-AfterDark-Priority, X-AfterDark-Human-Pass, X-AfterDark-Human-Score, CF-Turnstile-Response'
  );
  res.setHeader(
    'Access-Control-Expose-Headers',
    'X-AfterDark-Version, X-AfterDark-Traffic-Mode, X-AfterDark-Poll-Ms, X-AfterDark-Rpm, X-AfterDark-Bot-Challenge'
  );
  // Anti-Sniffing, Anti-Clickjacking & Zero Referrer Leakage for Private Invite Tokens
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=(self)');
  res.setHeader('X-AfterDark-Version', APP_VERSION);
  if (trafficInfo) {
    res.setHeader('X-AfterDark-Traffic-Mode', trafficInfo.mode);
    res.setHeader('X-AfterDark-Poll-Ms', String(trafficInfo.recommendedPollMs));
    res.setHeader('X-AfterDark-Rpm', String(trafficInfo.rpm));
    if (trafficInfo.botChallengeRequired) {
      res.setHeader('X-AfterDark-Bot-Challenge', 'required');
    }
  }
}

function getClientIp(req, body = {}) {
  if (body?.clientIp) return String(body.clientIp).trim();
  const headerIp =
    req?.headers?.['x-client-ip'] ||
    req?.headers?.['cf-connecting-ip'] ||
    req?.headers?.['x-real-ip'] ||
    req?.headers?.['x-forwarded-for'];
  if (headerIp) {
    return String(headerIp).split(',')[0].trim();
  }
  return String(req?.socket?.remoteAddress || '').trim();
}

function getRequestDeviceId(req, body = {}) {
  return String(req?.headers?.['x-device-id'] || body?.deviceId || '').trim();
}

function json(res, status, payload, req = null) {
  setCorsHeaders(req, res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function hashValue(value) {
  return createHash('sha256').update(String(value || '')).digest('hex');
}

function randomToken(bytes = 24) {
  return randomBytes(bytes).toString('base64url');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') {
    return sanitizeInputValue(req.body);
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  if (!chunks.length) return {};
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return sanitizeInputValue(parsed);
  } catch {
    return {};
  }
}

function extractBearerToken(req) {
  const header = String(req.headers?.authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (match) return match[1].trim();
  const guestHeader = String(req.headers?.['x-guest-session'] || '').trim();
  return guestHeader;
}

async function getCreatorFromRequest(req, db) {
  const rawToken = extractBearerToken(req);
  if (!rawToken) return null;
  const tokenHash = hashValue(rawToken);

  // Check if token was explicitly revoked on logout
  const revoked = await db.collection('revoked_sessions').findOne({ tokenHash });
  if (revoked) return null;

  let session = await db.collection('sessions').findOne({
    tokenHash
  });
  let user = null;
  if (session) {
    const userId =
      session.userId instanceof ObjectId
        ? session.userId
        : /^[a-fA-F0-9]{24}$/.test(String(session.userId))
        ? new ObjectId(String(session.userId))
        : session.userId;
    user = await db.collection('users').findOne({ _id: userId });
  }

  // Stateless serverless container rehydration ONLY via cryptographically signed HMAC token (never via spoofable headers!)
  if (!user) {
    const verifiedPayload = verifyTokenPayload(rawToken, 'ad_s2');
    if (verifiedPayload && verifiedPayload.email && verifiedPayload.uid) {
      const targetId = /^[a-fA-F0-9]{24}$/.test(String(verifiedPayload.uid))
        ? new ObjectId(String(verifiedPayload.uid))
        : verifiedPayload.uid;
      user =
        (await db.collection('users').findOne({ _id: targetId })) ||
        (await db.collection('users').findOne({ email: verifiedPayload.email }));

      if (!user) {
        const nowIso = new Date().toISOString();
        await db.collection('users').insertOne({
          _id: targetId,
          email: verifiedPayload.email,
          displayName: verifiedPayload.name || verifiedPayload.email.split('@')[0] || 'Creator',
          handle: verifiedPayload.name || verifiedPayload.email.split('@')[0] || 'Creator',
          createdAt: nowIso
        });
        user = await db.collection('users').findOne({ _id: targetId });
      }
      if (user) {
        await db.collection('sessions').insertOne({
          userId: user._id,
          tokenHash,
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  if (!user) return null;

  // Anti-Contamination Check: If client sent an X-User-Email header, it MUST match the authenticated session's owner!
  const headerEmail = String(req.headers?.['x-user-email'] || '').trim().toLowerCase();
  if (headerEmail && user.email && headerEmail !== String(user.email).toLowerCase()) {
    return null;
  }

  return {
    id: user._id.toString(),
    _id: user._id,
    email: user.email,
    displayName: user.displayName || user.handle || 'Jaan'
  };
}

async function getGuestFromRequest(req, db) {
  const rawToken = extractBearerToken(req);
  if (!rawToken) return null;
  const tokenHash = hashValue(rawToken);
  let guestSession = await db.collection('guest_sessions').findOne({
    tokenHash
  });
  let connection = null;

  if (guestSession) {
    const connectionId =
      guestSession.connectionId instanceof ObjectId
        ? guestSession.connectionId
        : /^[a-fA-F0-9]{24}$/.test(String(guestSession.connectionId))
        ? new ObjectId(String(guestSession.connectionId))
        : guestSession.connectionId;
    connection = await db.collection('connections').findOne({ _id: connectionId });
  } else {
    // Stateless cold-start rehydration ONLY if the guest token has a valid HMAC signature
    const verifiedGuest = verifyTokenPayload(rawToken, 'ad_g2');
    if (verifiedGuest && verifiedGuest.cid) {
      const cid = /^[a-fA-F0-9]{24}$/.test(String(verifiedGuest.cid))
        ? new ObjectId(String(verifiedGuest.cid))
        : verifiedGuest.cid;
      connection = await db.collection('connections').findOne({ _id: cid });
      if (!connection && verifiedGuest.inv) {
        connection = await db.collection('connections').findOne({
          inviteToken: verifiedGuest.inv,
          status: 'active'
        });
      }
      if (!connection && verifiedGuest.otp) {
        const nowIso = new Date().toISOString();
        const channelId = buildChannelId(verifiedGuest.inv || verifiedGuest.otp, String(cid));
        await db.collection('connections').insertOne({
          _id: cid,
          creatorId: null,
          creatorDisplayName: 'Your Partner',
          guestDisplayName: verifiedGuest.name || 'Meri Jaan',
          guestDeviceId: verifiedGuest.dev || '',
          recipientHint: verifiedGuest.name || 'Meri Jaan',
          inviteToken: verifiedGuest.inv || `otp_${verifiedGuest.otp}`,
          verificationCode: verifiedGuest.otp,
          channelId,
          status: 'active',
          createdAt: nowIso,
          approvedAt: nowIso
        });
        connection = await db.collection('connections').findOne({ _id: cid });
      }
      if (connection && connection.status === 'active') {
        guestSession = {
          tokenHash,
          connectionId: connection._id,
          inviteToken: verifiedGuest.inv || connection.inviteToken || '',
          guestDeviceId: verifiedGuest.dev || connection.guestDeviceId || '',
          guestDisplayName: verifiedGuest.name || connection.guestDisplayName || 'Meri Jaan'
        };
      }
    }
  }

  if (!connection || connection.status !== 'active') return null;

  // Enforce 1-on-1 Device Lock: A 3rd device cannot use or hijack an active guest session!
  const reqDeviceId = getRequestDeviceId(req);
  const boundDeviceId = connection.guestDeviceId || guestSession?.guestDeviceId || '';
  if (boundDeviceId && reqDeviceId && boundDeviceId !== reqDeviceId) {
    return {
      intrusionBlocked: true,
      error:
        '🛡️ Security Shield: This 1-on-1 room is locked to the paired partner device. No third device can enter in between!'
    };
  }

  return {
    guestSession,
    connection,
    guestDisplayName: guestSession?.guestDisplayName || connection.guestDisplayName || 'Meri Jaan'
  };
}

function buildChannelId(inviteToken, fallbackId = '') {
  const seed = String(inviteToken || fallbackId || 'couple').replace(/[^a-zA-Z0-9]/g, '');
  return `chan_${seed.slice(0, 14) || 'private'}`;
}

function verifyOtpMatchesInvite(invite, suppliedOtp) {
  if (!invite || !suppliedOtp || suppliedOtp.length !== 6) return false;
  const suppliedHash = hashValue(suppliedOtp);
  if (invite.codeHash && typeof invite.codeHash === 'string' && invite.codeHash.length === suppliedHash.length) {
    try {
      return timingSafeEqual(Buffer.from(invite.codeHash), Buffer.from(suppliedHash));
    } catch {
      // fall through to direct comparison
    }
  }
  if (invite.verificationCode) {
    return String(invite.verificationCode).trim() === suppliedOtp;
  }
  return false;
}

function formatConnectionForCreator(conn) {
  const peer = conn.guestDisplayName || conn.recipientHint || 'Meri Jaan';
  const idStr = conn._id.toString();
  return {
    id: idStr,
    creatorId: conn.creatorId ? conn.creatorId.toString() : '',
    channelId: conn.channelId || buildChannelId(conn.inviteToken, idStr),
    paired: (conn.status || 'active') === 'active',
    status: conn.status || 'active',
    creatorDisplayName: conn.creatorDisplayName || 'Creator',
    peerDisplayName: peer,
    guestDisplayName: peer,
    handle: peer,
    role: 'creator',
    inviteToken: conn.inviteToken || '',
    verificationCode: conn.verificationCode || '',
    createdAt: conn.createdAt,
    approvedAt: conn.approvedAt || conn.createdAt
  };
}

function formatConnectionForGuest(conn) {
  const creator = conn.creatorDisplayName || 'Tumhari Jaan';
  const guest = conn.guestDisplayName || conn.recipientHint || 'Meri Jaan';
  const idStr = conn._id.toString();
  return {
    id: idStr,
    creatorId: conn.creatorId ? conn.creatorId.toString() : '',
    channelId: conn.channelId || buildChannelId(conn.inviteToken, idStr),
    paired: (conn.status || 'active') === 'active',
    status: conn.status || 'active',
    creatorDisplayName: creator,
    guestDisplayName: guest,
    peerDisplayName: creator,
    handle: creator,
    role: 'invitee',
    inviteToken: conn.inviteToken || '',
    verificationCode: conn.verificationCode || '',
    createdAt: conn.createdAt,
    approvedAt: conn.approvedAt || conn.createdAt
  };
}

async function formatMessageDocAsync(m, defaultRole = 'creator', verificationCode = '') {
  let rawBody = m.body || m.text || '';
  const e2eeCiphertext = m.e2eeCiphertext || (isE2eeCiphertext(rawBody) ? rawBody : '');

  if (isE2eeCiphertext(rawBody) && verificationCode) {
    try {
      const dec = await decryptChatMessage(rawBody, { verificationCode });
      if (dec.verified && !dec.locked && dec.plaintext) {
        rawBody = dec.plaintext;
      }
    } catch {
      // ignore
    }
  }

  return {
    id: m._id.toString(),
    senderRole: m.senderRole || defaultRole,
    senderName: m.senderName || '',
    body: rawBody,
    text: rawBody,
    e2eeCiphertext,
    e2ee: Boolean(m.e2ee || isE2eeCiphertext(e2eeCiphertext) || isE2eeCiphertext(rawBody)),
    e2eeAlg: m.e2eeAlg || 'AES-256-GCM-PBKDF2',
    keyFingerprint:
      m.keyFingerprint || (verificationCode ? deriveE2eeFingerprint(verificationCode) : ''),
    orderMeta: m.orderMeta || null,
    photoMeta: m.photoMeta || null,
    voiceMeta: m.voiceMeta || null,
    dateMeta: m.dateMeta || null,
    seenAt: m.seenAt || null,
    createdAt: m.createdAt
  };
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const db = await getLocalDatabase();
    const url = new URL(req.url || '/api', 'http://localhost:3000');
    const parts = url.pathname
      .replace(/^\/api\/?/, '')
      .split('/')
      .filter(Boolean)
      .map((part) => decodeURIComponent(part));
    const action = parts.join('/');

    const trafficInfo = evaluateServerTraffic(req, action);
    setCorsHeaders(req, res, trafficInfo);

    if (trafficInfo.throttled) {
      return json(
        res,
        429,
        {
          error: 'Traffic Surge Shield Active: Coalescing background requests. Priority Couple Chat remains 100% open.',
          traffic: trafficInfo
        },
        req
      );
    }

    if (action === 'health' && req.method === 'GET') {
      return json(
        res,
        200,
        {
          ok: true,
          version: APP_VERSION,
          versionTag: APP_VERSION_TAG,
          codename: APP_VERSION_CODENAME,
          service: 'afterdark-hyderabad-couples',
          e2ee: 'AES-256-GCM-PBKDF2',
          indianBrandsCount: brandCatalog.length,
          traffic: trafficInfo
        },
        req
      );
    }

    if ((action === 'version' || action === 'traffic/status') && req.method === 'GET') {
      return json(
        res,
        200,
        {
          ok: true,
          version: APP_VERSION,
          versionTag: APP_VERSION_TAG,
          codename: APP_VERSION_CODENAME,
          segments: VERSION_SEGMENTS,
          updateLocations: VERSION_UPDATE_LOCATIONS,
          storeMatrix: STORE_COMPATIBILITY_MATRIX,
          changelog: VERSION_CHANGELOG,
          indianBrandsCount: brandCatalog.length,
          traffic: trafficInfo
        },
        req
      );
    }

    if (action === 'guest-repo/manifest' && req.method === 'GET') {
      return json(
        res,
        200,
        {
          repoName: 'afterdark-guest-connector',
          sourceDir: 'guest-site',
          renderServiceName: 'afterdark-guest-connector',
          renderUrl: 'https://afterdark-guest-connector.onrender.com',
          autoDeploy: true,
          e2eeProtocol: 'AD_E2EE_V1 (AES-256-GCM + PBKDF2-SHA256 50,000 iterations)',
          zeroKnowledgeUrlSignature: 'ad1_<sha256_commitment>',
          features: [
            'End-to-End Encrypted Guest Chat (AES-256-GCM) with OTP & Custom Passphrase Lock',
            'Identical AfterDark Dark-Luxury Theme & 3D Romantic Rooftop Scene',
            'Contextual One-Sided In-Chat Brand Ads (InChatBrandPromoCard)',
            'Direct Flipkart Official Redirect & Flipkart Minutes Quick Bar',
            `Built-in ${brandCatalog.length}+ Indian Brand Store & Local Cafe Discovery`,
            'Render Blueprint (render.yaml) & GitHub Actions Auto-Deploy Workflow'
          ]
        },
        req
      );
    }

    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
      ? await readBody(req)
      : {};

    // -------------------------------------------------------------------------
    // 0A. FLIRTY HUMAN VERIFICATION & CLOUDFLARE TURNSTILE BOT SHIELD
    // -------------------------------------------------------------------------
    if (action === 'security/verify-human' && req.method === 'POST') {
      const selectedOptionId = String(body.selectedOptionId || '').trim();
      const holdDurationMs = Number(body.holdDurationMs || 0);
      const cfTurnstileToken = String(
        body.cfTurnstileToken || req?.headers?.['cf-turnstile-response'] || ''
      ).trim();

      let turnstileVerified = false;
      if (cfTurnstileToken && process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
        try {
          const cfRes = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
                response: cfTurnstileToken
              })
            }
          );
          const cfJson = await cfRes.json();
          turnstileVerified = Boolean(cfJson?.success);
        } catch {
          turnstileVerified = false;
        }
      }

      const flirtyVibePassed =
        selectedOptionId === 'human_1' && holdDurationMs >= 800;

      if (!flirtyVibePassed && !turnstileVerified) {
        return json(
          res,
          403,
          {
            ok: false,
            requiresFlirtyChallenge: true,
            error:
              'Arre! Woh robotic option tha 😂 Asli romantic human option choose karke ♥ hold karo!'
          },
          req
        );
      }

      const deviceId = getRequestDeviceId(req, body);
      const clientIp = getClientIp(req, body);
      const humanPassToken = issueSignedHumanPassToken({ deviceId, clientIp });

      // Reset client mutation bucket upon passing human verification
      const clientKey = String(
        req?.headers?.['x-device-id'] || req?.headers?.['x-forwarded-for'] || 'anon'
      ).slice(0, 64);
      clientTokenBuckets.set(clientKey, {
        tokens: 120,
        mutationCount: 0,
        lastRefill: Date.now()
      });

      return json(
        res,
        200,
        {
          ok: true,
          verified: true,
          humanPassToken,
          message: 'Romantic Human Vibe Verified ♥ Welcome back to the private lounge!'
        },
        req
      );
    }

    if (trafficInfo.botChallengeRequired) {
      res.setHeader('X-AfterDark-Bot-Challenge', 'required');
      return json(
        res,
        429,
        {
          requiresFlirtyChallenge: true,
          error:
            'Hold up, Handsome / Gorgeous! 😘 Sudden traffic rush or bot pattern detected — complete the 1-second Romantic Vibe Check to continue ♥'
        },
        req
      );
    }

    // -------------------------------------------------------------------------
    // 0. PRIVATE LOCAL IN-CHAT BRAND & FLIRT LINE ANALYZER (Zero External AI API)
    // -------------------------------------------------------------------------
    if (action === 'ai/analyze-chat' && req.method === 'POST') {
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const draftText = String(body.draftText || '');
      const viewerRole = body.viewerRole === 'guest' ? 'guest' : 'creator';
      const localInsight = analyzeChatContextLocally(messages, draftText, viewerRole);
      return json(res, 200, { insight: localInsight, source: 'contextual-engine' }, req);
    }

    if (action === 'ai/discover-date-spots' && req.method === 'POST') {
      const requestedCity = String(body.city || 'Hyderabad').trim();
      const cityKey =
        Object.keys(CITY_PROFILES).find(
          (k) => k.toLowerCase() === requestedCity.toLowerCase()
        ) ||
        (requestedCity.toLowerCase().includes('bihar') || requestedCity.toLowerCase().includes('patna')
          ? 'Patna'
          : 'Hyderabad');
      const profile = CITY_PROFILES[cityKey] || CITY_PROFILES.Hyderabad;

      const fallbackSpots = (profile.cafesAndSpots || []).map((spot) => ({
        name: spot.name,
        vibe: `${spot.tier} · ${spot.area}`,
        highlight: `${spot.cuisine} (${spot.avgForTwo} · ${spot.rating})`,
        mapsUrl: spot.mapsUrl,
        bookingUrl: spot.bookingUrl
      }));

      return json(res, 200, { spots: fallbackSpots, city: cityKey, source: 'curated-city' }, req);
    }

    // -------------------------------------------------------------------------
    // 1. CREATOR AUTH: /api/auth/signup, /api/auth/login, /api/auth/logout
    // -------------------------------------------------------------------------
    if ((action === 'auth/signup' || action === 'register') && req.method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const clientIp = getClientIp(req, body);
      const lockoutKey = `auth:${email}:${clientIp}`;
      const lockStatus = checkSecurityLockout(lockoutKey, 6);
      if (lockStatus.locked) {
        return json(
          res,
          429,
          {
            error: `🔒 Security Shield: Too many failed attempts. Please wait ${Math.ceil(
              lockStatus.retryAfterSec / 60
            )} minutes before trying again.`
          },
          req
        );
      }

      const displayName =
        String(body.displayName || body.handle || '')
          .trim()
          .slice(0, 40) ||
        email.split('@')[0] ||
        'Hyderabadi Jaan';

      if (!email || !email.includes('@')) {
        return json(res, 400, { error: 'Please enter a valid email address.' }, req);
      }
      if (password.length < 8) {
        return json(res, 400, { error: 'Password must be at least 8 characters.' }, req);
      }

      const existing = await db.collection('users').findOne({ email });
      if (existing) {
        // NEVER allow passwordless login into an existing account via signup!
        if (!existing.passwordHash) {
          recordSecurityFailure(lockoutKey);
          return json(
            res,
            409,
            {
              error:
                'An account with this email already exists. Please sign in with your linked account or password.'
            },
            req
          );
        }
        const [salt, storedHash] = String(existing.passwordHash).split(':');
        const derived = (await scrypt(password, salt, 64)).toString('hex');
        if (
          !storedHash ||
          storedHash.length !== derived.length ||
          !timingSafeEqual(Buffer.from(storedHash), Buffer.from(derived))
        ) {
          recordSecurityFailure(lockoutKey);
          return json(
            res,
            409,
            {
              error:
                'An account with this email already exists. Switch to "Sign In" and enter your correct password.'
            },
            req
          );
        }
        clearSecurityFailures(lockoutKey);
        const name = existing.displayName || displayName;
        const sessionToken = issueSignedCreatorToken({
          _id: existing._id,
          email: existing.email,
          displayName: name
        });
        await db.collection('sessions').insertOne({
          tokenHash: hashValue(sessionToken),
          userId: existing._id,
          createdAt: new Date().toISOString()
        });
        return json(
          res,
          200,
          {
            sessionToken,
            user: {
              id: existing._id.toString(),
              email: existing.email,
              displayName: name,
              handle: name
            }
          },
          req
        );
      }

      const salt = randomBytes(16).toString('hex');
      const derived = (await scrypt(password, salt, 64)).toString('hex');
      const created = await db.collection('users').insertOne({
        email,
        displayName,
        handle: displayName,
        passwordHash: `${salt}:${derived}`,
        createdAt: new Date().toISOString()
      });

      const sessionToken = issueSignedCreatorToken({
        _id: created.insertedId,
        email,
        displayName
      });
      await db.collection('sessions').insertOne({
        tokenHash: hashValue(sessionToken),
        userId: created.insertedId,
        createdAt: new Date().toISOString()
      });

      return json(
        res,
        201,
        {
          sessionToken,
          user: {
            id: created.insertedId.toString(),
            email,
            displayName,
            handle: displayName
          }
        },
        req
      );
    }

    if ((action === 'auth/login' || action === 'login') && req.method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const clientIp = getClientIp(req, body);
      const lockoutKey = `auth:${email}:${clientIp}`;
      const lockStatus = checkSecurityLockout(lockoutKey, 6);
      if (lockStatus.locked) {
        return json(
          res,
          429,
          {
            error: `🔒 Security Shield: Too many failed sign-in attempts. Please wait ${Math.ceil(
              lockStatus.retryAfterSec / 60
            )} minutes before trying again.`
          },
          req
        );
      }

      let user = await db.collection('users').findOne({ email });

      // Idempotent Reviewer Account Provisioning for PhonePe Indus Appstore Review
      if (!user && email === 'reviewer@afterdark.app' && password === 'IndusReview2026!') {
        const salt = randomBytes(16).toString('hex');
        const derived = (await scrypt(password, salt, 64)).toString('hex');
        const created = await db.collection('users').insertOne({
          email,
          displayName: 'Store Reviewer',
          handle: 'Store Reviewer',
          passwordHash: `${salt}:${derived}`,
          createdAt: new Date().toISOString()
        });
        user = await db.collection('users').findOne({ _id: created.insertedId });
      }

      if (!user || !user.passwordHash) {
        recordSecurityFailure(lockoutKey);
        return json(
          res,
          401,
          { error: 'Account not found. Switch to "Create Account" to join!' },
          req
        );
      }

      const [salt, storedHash] = String(user.passwordHash).split(':');
      const derived = (await scrypt(password, salt, 64)).toString('hex');
      if (
        !storedHash ||
        storedHash.length !== derived.length ||
        !timingSafeEqual(Buffer.from(storedHash), Buffer.from(derived))
      ) {
        recordSecurityFailure(lockoutKey);
        return json(res, 401, { error: 'Incorrect password. Please try again.' }, req);
      }

      clearSecurityFailures(lockoutKey);
      const name = user.displayName || user.handle || 'Jaan';
      const sessionToken = issueSignedCreatorToken({
        _id: user._id,
        email: user.email,
        displayName: name
      });
      await db.collection('sessions').insertOne({
        tokenHash: hashValue(sessionToken),
        userId: user._id,
        createdAt: new Date().toISOString()
      });

      return json(
        res,
        200,
        {
          sessionToken,
          user: {
            id: user._id.toString(),
            email: user.email,
            displayName: name,
            handle: name,
            photoURL: user.photoURL || '',
            authProvider: user.authProvider || 'password'
          }
        },
        req
      );
    }

    // Public Firebase Client Config Discovery (never exposes server secrets)
    if (action === 'auth/firebase-config' && req.method === 'GET') {
      const apiKey = String(
        process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || ''
      ).trim();
      const projectId = String(
        process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || ''
      ).trim();
      const authDomain = String(
        process.env.VITE_FIREBASE_AUTH_DOMAIN ||
          process.env.FIREBASE_AUTH_DOMAIN ||
          (projectId ? `${projectId}.firebaseapp.com` : '')
      ).trim();
      const appId = String(
        process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || ''
      ).trim();
      const googleClientId = String(
        process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || ''
      ).trim();
      return json(
        res,
        200,
        {
          configured: Boolean(apiKey && projectId),
          config: {
            apiKey,
            authDomain,
            projectId,
            appId,
            googleClientId
          }
        },
        req
      );
    }

    // Google Account Authentication (Firebase Auth / Google Sign-In)
    if (action === 'auth/google' && req.method === 'POST') {
      const email = String(body.email || '')
        .trim()
        .toLowerCase();
      const googleUid = String(body.uid || body.sub || '').trim();
      const photoURL = String(body.photoURL || '').trim();
      const displayName =
        String(body.displayName || '')
          .trim()
          .slice(0, 40) ||
        email.split('@')[0] ||
        'Google Partner';

      if (!email || !email.includes('@')) {
        return json(res, 400, { error: 'Valid Google Account email is required.' }, req);
      }

      let user = await db.collection('users').findOne({ email });
      const nowIso = new Date().toISOString();

      if (!user) {
        const created = await db.collection('users').insertOne({
          email,
          displayName,
          handle: displayName,
          googleUid,
          photoURL,
          authProvider: 'google',
          createdAt: nowIso
        });
        user = {
          _id: created.insertedId,
          email,
          displayName,
          handle: displayName,
          googleUid,
          photoURL,
          authProvider: 'google'
        };
      } else {
        await db.collection('users').updateOne(
          { _id: user._id },
          {
            $set: {
              displayName: user.displayName || displayName,
              googleUid: googleUid || user.googleUid || '',
              photoURL: photoURL || user.photoURL || '',
              authProvider: 'google',
              updatedAt: nowIso
            }
          }
        );
      }

      const resolvedName = user.displayName || displayName;
      const sessionToken = issueSignedCreatorToken({
        _id: user._id,
        email: user.email,
        displayName: resolvedName
      });
      await db.collection('sessions').insertOne({
        tokenHash: hashValue(sessionToken),
        userId: user._id,
        createdAt: nowIso
      });

      return json(
        res,
        200,
        {
          sessionToken,
          user: {
            id: user._id.toString(),
            email: user.email,
            displayName: resolvedName,
            handle: resolvedName,
            photoURL: photoURL || user.photoURL || '',
            authProvider: 'google'
          }
        },
        req
      );
    }

    if ((action === 'auth/logout' || action === 'logout') && req.method === 'POST') {
      const rawToken = extractBearerToken(req);
      if (rawToken) {
        const tokenHash = hashValue(rawToken);
        await db.collection('sessions').deleteMany({ tokenHash });
        await db.collection('revoked_sessions').insertOne({
          tokenHash,
          revokedAt: new Date().toISOString()
        });
      }
      return json(res, 200, { ok: true }, req);
    }

    if (action === 'me' && req.method === 'GET') {
      const creator = await getCreatorFromRequest(req, db);
      if (!creator) {
        return json(res, 401, { error: 'Unauthorized session. Please sign in.' }, req);
      }
      return json(
        res,
        200,
        {
          user: {
            id: creator.id,
            email: creator.email,
            displayName: creator.displayName,
            handle: creator.displayName
          }
        },
        req
      );
    }

    // -------------------------------------------------------------------------
    // 2. STRICT SINGLE-ACTIVE INVITE & QR MANAGEMENT (NO DOUBLE DATING)
    // -------------------------------------------------------------------------
    if (action === 'invites/current' && req.method === 'GET') {
      const creator = await getCreatorFromRequest(req, db);
      if (!creator) return json(res, 401, { error: 'Please sign in first.' }, req);

      const tokenHint = String(url.searchParams.get('inviteToken') || '').trim();
      const otpHint = String(url.searchParams.get('otp') || '')
        .replace(/\D/g, '')
        .slice(0, 6);

      let existing = await db.collection('invites').findOne({
        creatorId: creator._id,
        status: { $in: ['pending', 'active'] }
      });

      if (!existing && tokenHint && otpHint.length === 6) {
        const byToken = await db.collection('invites').findOne({ inviteToken: tokenHint });
        if (!byToken) {
          const nowIso = new Date().toISOString();
          await db.collection('invites').insertOne({
            inviteToken: tokenHint,
            tokenHash: hashValue(tokenHint),
            verificationCode: otpHint,
            codeHash: hashValue(otpHint),
            creatorId: creator._id,
            creatorDisplayName: creator.displayName,
            recipientHint: url.searchParams.get('hint') || 'Meri Jaan',
            status: 'pending',
            createdAt: nowIso,
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
          });
          existing = await db.collection('invites').findOne({
            creatorId: creator._id,
            status: { $in: ['pending', 'active'] }
          });
        } else if (!byToken.creatorId && verifyOtpMatchesInvite(byToken, otpHint)) {
          await db.collection('invites').updateOne(
            { _id: byToken._id, creatorId: null },
            { $set: { creatorId: creator._id } }
          );
          existing = await db.collection('invites').findOne({ _id: byToken._id });
        }
      }

      return json(
        res,
        200,
        {
          invite: existing
            ? {
                inviteToken: existing.inviteToken,
                verificationCode: existing.verificationCode,
                creatorId: creator.id,
                creatorDisplayName: existing.creatorDisplayName || creator.displayName,
                recipientHint: existing.recipientHint || 'Meri Jaan',
                creatorCustomName: existing.creatorCustomName || creator.displayName,
                partnerCustomName: existing.partnerCustomName || existing.recipientHint || 'Meri Jaan',
                themeId: existing.themeId || 'charminar',
                emblemStyle: existing.emblemStyle || 'dil',
                status: existing.status,
                createdAt: existing.createdAt,
                expiresAt: existing.expiresAt
              }
            : null
        },
        req
      );
    }

    if (action === 'invites/revoke' && req.method === 'POST') {
      const creator = await getCreatorFromRequest(req, db);
      if (!creator) return json(res, 401, { error: 'Please sign in first.' }, req);

      const nowIso = new Date().toISOString();
      await db.collection('invites').updateMany(
        { creatorId: creator._id, status: { $in: ['pending', 'active'] } },
        { $set: { status: 'revoked', revokedAt: nowIso } }
      );

      const activeConns = await db
        .collection('connections')
        .find({ creatorId: creator._id, status: 'active' })
        .toArray();

      for (const conn of activeConns) {
        await db.collection('guest_sessions').deleteMany({ connectionId: conn._id });
      }

      await db.collection('connections').updateMany(
        { creatorId: creator._id, status: 'active' },
        { $set: { status: 'closed', closedAt: nowIso } }
      );

      return json(
        res,
        200,
        {
          ok: true,
          message: 'Access revoked and QR code removed. You can now generate a fresh Couple Link & QR.'
        },
        req
      );
    }

    if (action === 'invites/sync' && req.method === 'POST') {
      const creator = await getCreatorFromRequest(req, db);
      if (!creator) return json(res, 401, { error: 'Unauthorized. Please sign in.' }, req);

      const inviteToken = String(body.inviteToken || body.invite || '').trim();
      const verificationCode = String(body.verificationCode || body.inviteCode || '')
        .replace(/\D/g, '')
        .slice(0, 6);
      const recipientHint = String(body.recipientHint || 'Meri Jaan').trim();
      const creatorDisplayName =
        creator.displayName || String(body.creatorDisplayName || 'Tumhari Jaan').trim();

      if (inviteToken && verificationCode.length === 6) {
        const existing = await db.collection('invites').findOne({ inviteToken });
        const creatorIp = getClientIp(req, body);
        const creatorDeviceId = getRequestDeviceId(req, body);
        if (!existing) {
          await db.collection('invites').insertOne({
            inviteToken,
            tokenHash: hashValue(inviteToken),
            verificationCode,
            codeHash: hashValue(verificationCode),
            creatorId: creator._id,
            creatorIp,
            creatorDeviceId,
            creatorDisplayName,
            recipientHint,
            creatorCustomName: body.creatorCustomName || creatorDisplayName,
            partnerCustomName: body.partnerCustomName || recipientHint,
            themeId: body.themeId || 'charminar',
            emblemStyle: body.emblemStyle || 'dil',
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: body.expiresAt || new Date(Date.now() + 7 * 86400000).toISOString()
          });
        }
      }
      return json(res, 200, { ok: true }, req);
    }

    if (action === 'invites' && req.method === 'POST') {
      const creator = await getCreatorFromRequest(req, db);
      if (!creator) return json(res, 401, { error: 'Please sign in first.' }, req);

      // STRICT NO-DOUBLE-DATING CHECK: Only 1 active/pending Invite + QR allowed at a time!
      const existingInvite = await db.collection('invites').findOne({
        creatorId: creator._id,
        status: { $in: ['pending', 'active'] }
      });
      const existingConn = await db.collection('connections').findOne({
        creatorId: creator._id,
        status: 'active'
      });

      if (existingInvite || existingConn) {
        return json(
          res,
          409,
          {
            error:
              'You already have an active Couple Link & QR Code! To prevent double-dating, please click "Revoke Access & Remove QR Code" first before generating a new one.',
            invite: existingInvite
              ? {
                  inviteToken: existingInvite.inviteToken,
                  verificationCode: existingInvite.verificationCode,
                  creatorId: creator.id,
                  creatorDisplayName: existingInvite.creatorDisplayName,
                  recipientHint: existingInvite.recipientHint,
                  status: existingInvite.status
                }
              : null
          },
          req
        );
      }

      const recipientHint =
        String(body.recipientHint || body.partnerCustomName || 'Meri Jaan')
          .trim()
          .slice(0, 40) || 'Meri Jaan';
      const creatorCustomName =
        String(body.creatorCustomName || creator.displayName).trim().slice(0, 40) ||
        creator.displayName;
      const partnerCustomName =
        String(body.partnerCustomName || recipientHint).trim().slice(0, 40) || recipientHint;
      const themeId = String(body.themeId || 'charminar');
      const emblemStyle = String(body.emblemStyle || 'dil');

      const inviteToken = randomToken(24);
      const verificationCode = String(randomInt(100000, 999999));
      const nowIso = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      const creatorIp = getClientIp(req, body);
      const creatorDeviceId = getRequestDeviceId(req, body);

      await db.collection('invites').insertOne({
        inviteToken,
        tokenHash: hashValue(inviteToken),
        verificationCode,
        codeHash: hashValue(verificationCode),
        creatorId: creator._id,
        creatorIp,
        creatorDeviceId,
        creatorDisplayName: creatorCustomName,
        recipientHint,
        creatorCustomName,
        partnerCustomName,
        themeId,
        emblemStyle,
        status: 'pending',
        createdAt: nowIso,
        expiresAt
      });

      return json(
        res,
        201,
        {
          inviteToken,
          verificationCode,
          invite: inviteToken,
          inviteCode: verificationCode,
          creatorId: creator.id,
          creatorIp,
          creatorDeviceId,
          creatorDisplayName: creatorCustomName,
          recipientHint,
          creatorCustomName,
          partnerCustomName,
          themeId,
          emblemStyle,
          status: 'pending',
          createdAt: nowIso,
          expiresAt
        },
        req
      );
    }

    // Public Invite Preview for Guest Site: GET /api/invites/:token or GET /api/guest/invites/:token
    // Strictly matches ONLY the exact inviteToken and blocks Same-Device or 3rd-Person intrusion!
    const isGetInvitePreview =
      req.method === 'GET' &&
      ((parts[0] === 'invites' && parts[1] && parts.length === 2 && parts[1] !== 'current') ||
        (parts[0] === 'guest' && parts[1] === 'invites' && parts[2] && parts.length === 3));
    if (isGetInvitePreview) {
      const rawToken = (parts[0] === 'guest' ? parts[2] : parts[1]).trim();
      const invite = await db.collection('invites').findOne({
        $or: [{ inviteToken: rawToken }, { tokenHash: hashValue(rawToken) }]
      });

      const guestDeviceId = getRequestDeviceId(req);
      const urlCreatorDev = String(url.searchParams.get('cdev') || '').trim();

      if (!invite) {
        const sameDev = Boolean(guestDeviceId && urlCreatorDev && guestDeviceId === urlCreatorDev);
        return json(
          res,
          200,
          {
            invite: {
              status: 'pending',
              actualStatus: 'pending',
              ownInvite: sameDev,
              sameDeviceOrIpBlocked: sameDev,
              blockReason: sameDev
                ? '🚫 Same-Device Blocked: One device cannot chat with itself! You generated this link on this device. Send the QR or link to your partner’s phone.'
                : '',
              creatorDisplayName: url.searchParams.get('creator') || 'Your Partner',
              recipientHint: url.searchParams.get('hint') || 'Meri Jaan'
            }
          },
          req
        );
      }

      if (invite.status === 'revoked') {
        return json(
          res,
          410,
          {
            error: 'This Couple QR Code & Invite Link has been revoked by the creator.',
            invite: { status: 'revoked' }
          },
          req
        );
      }

      const effectiveCreatorDev = invite.creatorDeviceId || urlCreatorDev;
      const isSameDevice = Boolean(
        guestDeviceId && effectiveCreatorDev && guestDeviceId === effectiveCreatorDev
      );
      const isThirdPartyIntrusion = Boolean(
        invite.status === 'active' &&
          invite.guestDeviceId &&
          guestDeviceId &&
          invite.guestDeviceId !== guestDeviceId
      );
      const blocked = isSameDevice || isThirdPartyIntrusion;

      return json(
        res,
        200,
        {
          invite: {
            status: invite.status === 'active' ? 'active' : 'pending',
            actualStatus: invite.status,
            ownInvite: isSameDevice,
            sameDeviceOrIpBlocked: blocked,
            blockReason: isSameDevice
              ? '🚫 Same-Device Blocked: One device cannot chat with itself! You generated this Couple Link on this device. Send the QR code or link to your partner’s separate device.'
              : isThirdPartyIntrusion
              ? '🛡️ Security Shield: This 1-on-1 room is already locked between the two paired devices. No third person can enter in between!'
              : '',
            handle: invite.creatorDisplayName || 'Your Partner',
            creatorDisplayName: invite.creatorDisplayName || 'Your Partner',
            recipientHint: invite.recipientHint || 'Meri Jaan',
            expiresAt: invite.expiresAt
          }
        },
        req
      );
    }

    // -------------------------------------------------------------------------
    // 3. GUEST OTP APPROVAL (STRICTLY ISOLATED PER UNIQUE INVITE TOKEN + OTP)
    // -------------------------------------------------------------------------
    const isGuestApproveRoute =
      action === 'guest/verify-otp' ||
      (parts[0] === 'guest' &&
        parts[1] === 'invites' &&
        parts[2] &&
        parts[3] === 'approve') ||
      (parts[0] === 'invites' && parts[1] && parts[2] === 'approve');

    if (isGuestApproveRoute && req.method === 'POST') {
      const rawToken =
        action === 'guest/verify-otp'
          ? String(body.inviteToken || body.token || 'otp-direct').trim()
          : (parts[0] === 'guest' ? parts[2] : parts[1]).trim();
      const suppliedOtp = String(
        body.verificationCode || body.otpCode || body.code || body.otp || ''
      )
        .replace(/\D/g, '')
        .slice(0, 6);
      const guestDisplayName =
        String(body.guestDisplayName || body.handle || '')
          .trim()
          .slice(0, 40) || 'Meri Jaan';
      const hintCreatorName =
        String(body.creatorDisplayName || '').trim().slice(0, 40) || 'Your Partner';
      const clientIp = getClientIp(req, body);
      const guestDeviceId = getRequestDeviceId(req, body);

      // Brute-force OTP lockout shield (max 5 failed attempts per 15 minutes)
      const otpLockoutKey = `otp:${clientIp}:${guestDeviceId || 'anon'}:${rawToken}`;
      const otpLockStatus = checkSecurityLockout(otpLockoutKey, 5);
      if (otpLockStatus.locked) {
        return json(
          res,
          429,
          {
            error:
              '🔒 Security Shield: Too many incorrect 6-digit OTP attempts! Access is temporarily locked for 15 minutes to prevent unauthorized entry.'
          },
          req
        );
      }

      if (suppliedOtp.length !== 6) {
        return json(
          res,
          400,
          { error: 'Please enter the 6-digit OTP shared by your partner.' },
          req
        );
      }

      // Step 1: Look up the Host's generated session by inviteToken (if provided)
      let invite = null;
      if (rawToken && rawToken !== 'otp-direct') {
        invite = await db.collection('invites').findOne({
          $or: [{ inviteToken: rawToken }, { tokenHash: hashValue(rawToken) }]
        });
      }

      // Step 2: If invite was not found by token (or guest used direct 6-digit OTP entry,
      // or guest had a stale URL tab open and typed a newly generated 6-digit OTP),
      // look up the Host's active/pending session by the 6-digit verificationCode!
      if (
        !invite ||
        invite.status === 'revoked' ||
        (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) ||
        !verifyOtpMatchesInvite(invite, suppliedOtp)
      ) {
        const otpMatches = await db
          .collection('invites')
          .find({
            $or: [
              { verificationCode: suppliedOtp },
              { codeHash: hashValue(suppliedOtp) }
            ]
          })
          .sort({ createdAt: -1 })
          .toArray();
        const activeOtpMatch = otpMatches.find(
          (i) => i.status === 'pending' || i.status === 'active'
        );
        if (activeOtpMatch) {
          invite = activeOtpMatch;
        } else if (!invite && otpMatches[0]) {
          invite = otpMatches[0];
        }
      }

      if (invite && invite.status === 'revoked') {
        return json(
          res,
          410,
          { error: 'This QR code / invite link was revoked by your partner and is no longer active.' },
          req
        );
      }

      if (invite && invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
        return json(
          res,
          410,
          { error: 'This Couple OTP has expired. Ask your partner to generate a fresh QR & OTP.' },
          req
        );
      }

      // Step 3: Enforce Same-Device Security Block (unless Reviewer / Partner Test Mode is explicitly enabled)
      const allowSameDeviceTest = Boolean(body.allowSameDeviceTest);
      const effectiveCreatorDev = invite?.creatorDeviceId || String(body.creatorDeviceId || '').trim();
      if (
        !allowSameDeviceTest &&
        guestDeviceId &&
        effectiveCreatorDev &&
        guestDeviceId === effectiveCreatorDev
      ) {
        return json(
          res,
          403,
          {
            error:
              '🚫 Security Block: One device cannot chat with itself! You generated this Couple Link on this device. Send the QR code or link to your partner’s separate phone/device, or tap "Test as Partner on This Device" to preview.'
          },
          req
        );
      }

      // Step 4: Validate the Guest's 6-digit entry code against the Host's generated session!
      if (invite && !verifyOtpMatchesInvite(invite, suppliedOtp)) {
        recordSecurityFailure(otpLockoutKey);
        return json(
          res,
          401,
          { error: 'Invalid 6-digit OTP! Please enter the exact 6-digit code shown on your partner’s screen.' },
          req
        );
      }

      // Step 4b: If server cold-started and invite wasn't in DB, rehydrate from inviteToken + 6-digit OTP
      // (Supports both full invite link tokens AND direct 6-digit OTP entry on guest-site)
      if (!invite) {
        const expectedSig = String(body.expectedSignature || '').trim();
        const isDirectOtpEntry = !rawToken || rawToken === 'otp-direct';
        if (!isDirectOtpEntry && expectedSig && !verifyOtpSignature(suppliedOtp, rawToken, expectedSig)) {
          recordSecurityFailure(otpLockoutKey);
          return json(
            res,
            401,
            { error: 'Invalid 6-digit OTP for this invite link. Please check the OTP with your partner!' },
            req
          );
        }

        const effectiveRehydratedToken = isDirectOtpEntry ? `otp_${suppliedOtp}` : rawToken;
        const insertedInvite = await db.collection('invites').insertOne({
          inviteToken: effectiveRehydratedToken,
          tokenHash: hashValue(effectiveRehydratedToken),
          verificationCode: suppliedOtp,
          codeHash: hashValue(suppliedOtp),
          creatorId: null,
          creatorDisplayName: hintCreatorName,
          recipientHint: guestDisplayName,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
        });
        invite = await db.collection('invites').findOne({ _id: insertedInvite.insertedId });
      }

      // Step 5: Anti-Intrusion / No 3rd-Person Entry Check!
      // Once a Guest device has paired with this invite, NO third device can enter in between!
      if (
        invite.status === 'active' &&
        invite.guestDeviceId &&
        guestDeviceId &&
        invite.guestDeviceId !== guestDeviceId
      ) {
        return json(
          res,
          403,
          {
            error:
              '🛡️ Security Shield: This 1-on-1 room is already locked between the two paired devices. No third person can enter in between!'
          },
          req
        );
      }

      clearSecurityFailures(otpLockoutKey);

      // Step 6: Pair Guest & Host into the shared Secure Chat Channel
      const effectiveInviteToken = invite.inviteToken || rawToken;
      const channelId = buildChannelId(effectiveInviteToken, invite._id?.toString());
      let connection = null;

      if (invite.connectionId) {
        const connId =
          invite.connectionId instanceof ObjectId
            ? invite.connectionId
            : /^[a-fA-F0-9]{24}$/.test(String(invite.connectionId))
            ? new ObjectId(String(invite.connectionId))
            : invite.connectionId;
        connection = await db.collection('connections').findOne({ _id: connId });
      }

      if (!connection && effectiveInviteToken) {
        connection = await db.collection('connections').findOne({
          inviteToken: effectiveInviteToken,
          status: 'active'
        });
      }

      if (connection && connection.status === 'active') {
        if (
          connection.guestDeviceId &&
          guestDeviceId &&
          connection.guestDeviceId !== guestDeviceId
        ) {
          return json(
            res,
            403,
            {
              error:
                '🛡️ Security Shield: This 1-on-1 room is already locked between the two paired devices. No third person can enter in between!'
            },
            req
          );
        }

        await db.collection('connections').updateOne(
          { _id: connection._id },
          {
            $set: {
              guestDisplayName: guestDisplayName || connection.guestDisplayName,
              guestDeviceId: connection.guestDeviceId || guestDeviceId || '',
              verificationCode: suppliedOtp,
              channelId,
              creatorId: connection.creatorId || invite.creatorId || null
            }
          }
        );
        connection = await db.collection('connections').findOne({ _id: connection._id });
      } else {
        const creatorId =
          invite.creatorId instanceof ObjectId
            ? invite.creatorId
            : invite.creatorId && /^[a-fA-F0-9]{24}$/.test(String(invite.creatorId))
            ? new ObjectId(String(invite.creatorId))
            : invite.creatorId || null;

        const nowIso = new Date().toISOString();
        const createdConn = await db.collection('connections').insertOne({
          creatorId,
          creatorDisplayName: invite.creatorDisplayName || hintCreatorName,
          guestDisplayName,
          guestDeviceId: guestDeviceId || '',
          recipientHint: invite.recipientHint || guestDisplayName,
          inviteId: invite._id,
          inviteToken: effectiveInviteToken,
          verificationCode: suppliedOtp,
          channelId,
          status: 'active',
          createdAt: nowIso,
          approvedAt: nowIso
        });

        connection = await db.collection('connections').findOne({
          _id: createdConn.insertedId
        });

        await db.collection('invites').updateOne(
          { _id: invite._id },
          {
            $set: {
              status: 'active',
              connectionId: createdConn.insertedId,
              channelId,
              guestDisplayName,
              guestDeviceId: guestDeviceId || '',
              approvedAt: nowIso
            }
          }
        );

        const plainWelcome = `Hau miyaan! ${guestDisplayName} connected to our private 1-on-1 room ♥ Ab baatein shuru karein?`;
        let encryptedWelcome = plainWelcome;
        try {
          encryptedWelcome = await encryptChatMessage(plainWelcome, {
            verificationCode: suppliedOtp
          });
        } catch {
          encryptedWelcome = plainWelcome;
        }

        await db.collection('messages').insertOne({
          connectionId: createdConn.insertedId,
          ownerCreatorId: creatorId ? String(creatorId) : '',
          inviteToken: String(effectiveInviteToken || ''),
          channelId,
          senderRole: 'guest',
          senderName: guestDisplayName,
          body: plainWelcome,
          text: plainWelcome,
          e2eeCiphertext: encryptedWelcome,
          e2ee: true,
          e2eeAlg: 'AES-256-GCM-PBKDF2',
          keyFingerprint: deriveE2eeFingerprint(suppliedOtp),
          createdAt: nowIso
        });
      }

      const guestSessionToken = issueSignedGuestToken({
        connectionId: connection._id,
        inviteToken: effectiveInviteToken,
        verificationCode: suppliedOtp,
        guestDeviceId: connection.guestDeviceId || guestDeviceId || '',
        guestDisplayName: connection.guestDisplayName || guestDisplayName
      });
      await db.collection('guest_sessions').insertOne({
        tokenHash: hashValue(guestSessionToken),
        connectionId: connection._id,
        inviteToken: effectiveInviteToken,
        verificationCode: suppliedOtp,
        channelId,
        guestDeviceId: connection.guestDeviceId || guestDeviceId || '',
        guestDisplayName: connection.guestDisplayName || guestDisplayName,
        createdAt: new Date().toISOString()
      });

      const formattedConn = formatConnectionForGuest(connection);
      return json(
        res,
        200,
        {
          status: 'active',
          paired: true,
          channelId: formattedConn.channelId,
          guestSessionToken,
          sessionToken: guestSessionToken,
          user: {
            id: connection._id.toString(),
            handle: formattedConn.guestDisplayName,
            displayName: formattedConn.guestDisplayName,
            guest: true
          },
          connection: formattedConn
        },
        req
      );
    }

    // -------------------------------------------------------------------------
    // 4. GUEST SESSION & GUEST CONNECTION ENDPOINTS (/api/guest/*)
    // -------------------------------------------------------------------------
    if ((action === 'guest/me' || action === 'guest/session') && req.method === 'GET') {
      const guestCtx = await getGuestFromRequest(req, db);
      if (guestCtx?.intrusionBlocked) {
        return json(res, 403, { error: guestCtx.error }, req);
      }
      if (!guestCtx) {
        return json(res, 401, { error: 'Guest session not active or revoked.' }, req);
      }
      const formatted = formatConnectionForGuest(guestCtx.connection);
      return json(
        res,
        200,
        {
          user: {
            id: formatted.id,
            handle: formatted.guestDisplayName,
            displayName: formatted.guestDisplayName,
            guest: true
          },
          connection: formatted
        },
        req
      );
    }

    if (parts[0] === 'guest' && parts[1] === 'connections' && parts[2] && parts[3]) {
      const rawConnId = parts[2].trim();
      const guestCtx = await getGuestFromRequest(req, db);
      if (guestCtx?.intrusionBlocked) {
        return json(res, 403, { error: guestCtx.error }, req);
      }
      if (!guestCtx || !guestCtx.connection) {
        return json(
          res,
          401,
          { error: '🔒 Unauthorized guest session. Please verify the 6-digit OTP first.' },
          req
        );
      }

      const connection = guestCtx.connection;
      if (connection.status === 'closed') {
        return json(res, 401, { error: 'This private room has been closed or revoked.' }, req);
      }

      // Ensure guest token can ONLY access its own bound connectionId!
      if (
        connection._id.toString() !== rawConnId &&
        connection.channelId !== rawConnId
      ) {
        return json(
          res,
          403,
          { error: '🛡️ Security Shield: Access denied to another couple’s room.' },
          req
        );
      }

      const connId = connection._id;
      const subRoute = parts[3];

      if (subRoute === 'messages') {
        if (req.method === 'GET') {
          const seenNow = new Date().toISOString();
          await db.collection('messages').updateMany(
            { connectionId: connId, senderRole: 'creator', seenAt: null },
            { $set: { seenAt: seenNow } }
          );
          const list = await db
            .collection('messages')
            .find({ connectionId: connId })
            .sort({ createdAt: 1 })
            .toArray();
          const formattedMessages = await Promise.all(
            list.map((m) => formatMessageDocAsync(m, 'guest', connection.verificationCode || ''))
          );
          return json(
            res,
            200,
            { messages: formattedMessages },
            req
          );
        }
        if (req.method === 'POST') {
          const voiceMeta = body.voiceMeta && body.voiceMeta.dataUrl ? body.voiceMeta : null;
          const photoMeta = body.photoMeta && body.photoMeta.dataUrl ? body.photoMeta : null;
          const rawText = String(body.body || body.text || '').trim();
          let text =
            rawText ||
            (voiceMeta ? '🎤 Sent a voice note ♥' : photoMeta ? '📷 Sent a live camera snap ♥' : '');
          if (!text && !voiceMeta && !photoMeta) {
            return json(res, 400, { error: 'Write a message or attach a voice/camera note first.' }, req);
          }
          let e2eeCiphertext = String(body.e2eeCiphertext || '');
          if (isE2eeCiphertext(text) && connection.verificationCode) {
            e2eeCiphertext = text;
            try {
              const dec = await decryptChatMessage(text, {
                verificationCode: connection.verificationCode
              });
              if (dec.verified && !dec.locked && dec.plaintext) {
                text = dec.plaintext;
              }
            } catch {
              // ignore
            }
          } else if (!e2eeCiphertext && text && connection.verificationCode) {
            try {
              e2eeCiphertext = await encryptChatMessage(text, {
                verificationCode: connection.verificationCode
              });
            } catch {
              // ignore
            }
          }
          const nowIso = new Date().toISOString();
          const isEncrypted = Boolean(body.e2ee || e2eeCiphertext || isE2eeCiphertext(rawText));
          const keyFp =
            body.keyFingerprint ||
            (connection.verificationCode
              ? deriveE2eeFingerprint(connection.verificationCode)
              : '');
          const inserted = await db.collection('messages').insertOne({
            connectionId: connId,
            ownerCreatorId: connection.creatorId ? String(connection.creatorId) : '',
            inviteToken: String(connection.inviteToken || ''),
            senderRole: 'guest',
            senderName: connection.guestDisplayName || 'Meri Jaan',
            body: text,
            text,
            e2eeCiphertext,
            voiceMeta,
            photoMeta,
            e2ee: isEncrypted,
            e2eeAlg: body.e2eeAlg || 'AES-256-GCM-PBKDF2',
            keyFingerprint: keyFp,
            seenAt: null,
            createdAt: nowIso
          });
          return json(
            res,
            201,
            {
              message: {
                id: inserted.insertedId.toString(),
                senderRole: 'guest',
                senderName: connection.guestDisplayName || 'Meri Jaan',
                body: text,
                text,
                e2eeCiphertext,
                voiceMeta,
                photoMeta,
                e2ee: isEncrypted,
                e2eeAlg: body.e2eeAlg || 'AES-256-GCM-PBKDF2',
                keyFingerprint: keyFp,
                seenAt: null,
                createdAt: nowIso
              }
            },
            req
          );
        }
      }

      if (subRoute === 'orders') {
        if (req.method === 'GET') {
          const list = await db
            .collection('orders')
            .find({ connectionId: connId, orderedByRole: 'guest' })
            .sort({ createdAt: -1 })
            .toArray();
          return json(
            res,
            200,
            {
              orders: list.map((o) => ({
                id: o._id.toString(),
                brandId: o.brandId,
                brandName: o.brandName,
                itemId: o.itemId,
                itemName: o.itemName,
                etaMinutes: o.etaMinutes,
                phoneNumber: o.phoneNumber || '',
                note: o.note,
                orderedByName: o.orderedByName,
                privateOnly: true,
                createdAt: o.createdAt
              }))
            },
            req
          );
        }
        if (req.method === 'POST') {
          const brand =
            brandCatalog.find((b) => b.id === (body.brandId || body.brandSlug)) ||
            brandCatalog[0];
          const item =
            brand.items.find((i) => i.id === body.itemId) || brand.items[0];
          const note = String(body.note || '').trim();
          const phoneNumber = String(body.phoneNumber || '').replace(/\D/g, '').slice(0, 10);
          const nowIso = new Date().toISOString();
          const orderedByName = connection.guestDisplayName || 'Meri Jaan';

          // Strictly Private Order Record — NEVER insert into shared chat messages!
          const orderDoc = {
            connectionId: connId,
            brandId: brand.id,
            brandName: brand.name,
            itemId: item.id,
            itemName: body.itemTitle || item.name,
            etaMinutes: item.etaMinutes,
            phoneNumber,
            city: body.city || 'Hyderabad',
            address: body.address || '',
            note,
            orderedByRole: 'guest',
            orderedByName,
            privateOnly: true,
            createdAt: nowIso
          };
          const inserted = await db.collection('orders').insertOne(orderDoc);

          return json(
            res,
            201,
            { order: { ...orderDoc, id: inserted.insertedId.toString() } },
            req
          );
        }
      }

      if (subRoute === 'dates') {
        if (req.method === 'GET') {
          const list = await db
            .collection('dates')
            .find({ connectionId: connId })
            .sort({ createdAt: -1 })
            .toArray();
          return json(res, 200, { dates: list }, req);
        }
        if (req.method === 'POST') {
          const title = String(body.title || 'Candlelight Dinner Date ♥').trim();
          const location = String(body.location || 'Olive Bistro, Durgam Cheruvu').trim();
          const dateTime = String(body.dateTime || '').trim();
          const description = String(body.description || 'Just the two of us ♥').trim();
          const nowIso = new Date().toISOString();
          const senderName = connection.guestDisplayName || 'Meri Jaan';

          const dateMeta = {
            title,
            location,
            dateTime,
            description,
            createdBy: senderName,
            createdAt: nowIso
          };
          await db.collection('dates').insertOne({ connectionId: connId, ...dateMeta });

          await db.collection('messages').insertOne({
            connectionId: connId,
            senderRole: 'guest',
            senderName,
            body: `🕯️ ${senderName} planned an upcoming date: "${title}" at ${location}! Tap below to add it directly to Google Calendar ♥`,
            dateMeta,
            createdAt: nowIso
          });

          return json(res, 201, { date: dateMeta }, req);
        }
      }

      if (subRoute === 'photos') {
        if (req.method === 'GET') {
          const list = await db
            .collection('photos')
            .find({ connectionId: connId })
            .sort({ createdAt: -1 })
            .toArray();
          return json(
            res,
            200,
            {
              photos: list.map((p) => ({
                id: p._id.toString(),
                dataUrl: p.dataUrl,
                caption: p.caption,
                uploadedBy: p.uploadedBy || 'guest',
                createdAt: p.createdAt
              }))
            },
            req
          );
        }
        if (req.method === 'POST') {
          const dataUrl = String(body.dataUrl || '');
          const caption = String(body.caption || '').trim();
          if (!dataUrl.startsWith('data:image/')) {
            return json(res, 400, { error: 'Invalid image data.' }, req);
          }
          const nowIso = new Date().toISOString();
          const senderName = connection.guestDisplayName || 'Meri Jaan';
          const inserted = await db.collection('photos').insertOne({
            connectionId: connId,
            dataUrl,
            caption,
            uploadedBy: 'guest',
            createdAt: nowIso
          });
          const photoMeta = {
            id: inserted.insertedId.toString(),
            dataUrl,
            caption: caption || `Shared by ${senderName}`,
            createdAt: nowIso
          };

          await db.collection('messages').insertOne({
            connectionId: connId,
            senderRole: 'guest',
            senderName,
            body: caption ? `📸 ${caption}` : `📸 Shared a private photo`,
            photoMeta,
            createdAt: nowIso
          });

          return json(res, 201, { photo: photoMeta }, req);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 5. CREATOR CONNECTION ENDPOINTS (/api/connections/*)
    //    STRICTLY ISOLATED PER CREATOR ACCOUNT — ZERO CROSS-USER MERGING!
    // -------------------------------------------------------------------------
    const creator = await getCreatorFromRequest(req, db);
    if (!creator) {
      return json(res, 401, { error: 'Unauthorized. Please sign in.' }, req);
    }

    if (action === 'connections' && req.method === 'GET') {
      const tokenHint = String(url.searchParams.get('inviteToken') || '').trim();
      const otpHint = String(url.searchParams.get('otp') || '')
        .replace(/\D/g, '')
        .slice(0, 6);

      // Only allow cold-start invite/connection rehydration when tokenHint + otpHint belong to this creator
      // or were created with creatorId: null during a serverless cold-start or direct 6-digit OTP verification.
      // NEVER adopt connections or invites owned by another creatorId!
      if (otpHint.length === 6) {
        const effectiveTokenHint = tokenHint || `otp_${otpHint}`;
        const existingInvite = await db.collection('invites').findOne({
          $or: [
            ...(tokenHint ? [{ inviteToken: tokenHint }] : []),
            { creatorId: null, verificationCode: otpHint }
          ]
        });
        let belongsToCreator = false;
        if (!existingInvite) {
          await db.collection('invites').insertOne({
            inviteToken: effectiveTokenHint,
            tokenHash: hashValue(effectiveTokenHint),
            verificationCode: otpHint,
            codeHash: hashValue(otpHint),
            creatorId: creator._id,
            creatorDisplayName: creator.displayName,
            recipientHint: url.searchParams.get('hint') || 'Meri Jaan',
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
          });
          belongsToCreator = true;
        } else if (!existingInvite.creatorId && verifyOtpMatchesInvite(existingInvite, otpHint)) {
          await db.collection('invites').updateOne(
            { _id: existingInvite._id, creatorId: null },
            {
              $set: {
                creatorId: creator._id,
                ...(tokenHint ? { inviteToken: tokenHint, tokenHash: hashValue(tokenHint) } : {})
              }
            }
          );
          belongsToCreator = true;
        } else if (
          existingInvite.creatorId &&
          String(existingInvite.creatorId) === String(creator._id) &&
          verifyOtpMatchesInvite(existingInvite, otpHint)
        ) {
          belongsToCreator = true;
        }

        if (belongsToCreator) {
          await db.collection('connections').updateMany(
            {
              creatorId: null,
              verificationCode: otpHint,
              status: 'active'
            },
            {
              $set: {
                creatorId: creator._id,
                creatorDisplayName: creator.displayName,
                ...(tokenHint ? { inviteToken: tokenHint } : {})
              }
            }
          );
        }
      }

      const list = await db
        .collection('connections')
        .find({ creatorId: creator._id, status: 'active' })
        .sort({ createdAt: -1 })
        .toArray();

      // Secondary defense-in-depth filter: verify every returned connection strictly matches creator._id
      const strictlyOwnedList = list.filter(
        (c) => c.creatorId && c.creatorId.toString() === creator._id.toString()
      );

      return json(
        res,
        200,
        { connections: strictlyOwnedList.map(formatConnectionForCreator) },
        req
      );
    }

    if (parts[0] === 'connections' && parts[1] && parts[2]) {
      const rawConnId = parts[1].trim();
      const isHexObjectId = /^[a-fA-F0-9]{24}$/.test(rawConnId);
      const idQuery = isHexObjectId
        ? { $or: [{ _id: new ObjectId(rawConnId) }, { _id: rawConnId }] }
        : { $or: [{ _id: rawConnId }, { id: rawConnId }, { channelId: rawConnId }] };

      let connection = await db.collection('connections').findOne(idQuery);

      // Strict Ownership Verification: NEVER allow Account B to read, adopt, or write Account A's or unowned connections!
      if (
        connection &&
        (!connection.creatorId ||
          connection.creatorId.toString() !== creator._id.toString())
      ) {
        return json(
          res,
          403,
          {
            error:
              '🛡️ Security Shield: Access denied. This private room belongs to a different account.'
          },
          req
        );
      }

      // Cold-start serverless rehydration when Creator supplies their own verified inviteToken + 6-digit OTP
      if (!connection) {
        const tokenHint = String(url.searchParams.get('inviteToken') || '').trim();
        const otpHint = String(url.searchParams.get('otp') || '')
          .replace(/\D/g, '')
          .slice(0, 6);
        const peerHint = String(url.searchParams.get('peer') || 'Meri Jaan').trim();
        if (tokenHint && otpHint.length === 6) {
          const nowIso = new Date().toISOString();
          const newId = isHexObjectId ? new ObjectId(rawConnId) : rawConnId;
          await db.collection('connections').insertOne({
            _id: newId,
            creatorId: creator._id,
            creatorDisplayName: creator.displayName,
            guestDisplayName: peerHint,
            recipientHint: peerHint,
            inviteToken: tokenHint,
            verificationCode: otpHint,
            channelId: buildChannelId(tokenHint, String(rawConnId)),
            status: 'active',
            createdAt: nowIso,
            approvedAt: nowIso
          });
          connection = await db.collection('connections').findOne({ _id: newId });
        }
      }

      if (!connection) {
        return json(
          res,
          404,
          { error: 'Private connection not found or no longer active.' },
          req
        );
      }
      const connId = connection._id;
      const ownerIdStr = String(creator._id);
      const subRoute = parts[2];

      if ((subRoute === 'close' || subRoute === 'end') && req.method === 'POST') {
        const nowIso = new Date().toISOString();
        await db.collection('connections').updateOne(
          { _id: connId },
          { $set: { status: 'closed', closedAt: nowIso } }
        );
        await db.collection('invites').updateMany(
          { creatorId: creator._id, status: { $in: ['pending', 'active'] } },
          { $set: { status: 'revoked', revokedAt: nowIso } }
        );
        await db.collection('guest_sessions').deleteMany({ connectionId: connId });
        return json(res, 200, { ok: true }, req);
      }

      if (subRoute === 'messages') {
        if (req.method === 'GET') {
          const seenNow = new Date().toISOString();
          await db.collection('messages').updateMany(
            { connectionId: connId, senderRole: 'guest', seenAt: null },
            { $set: { seenAt: seenNow } }
          );
          const rawList = await db
            .collection('messages')
            .find({ connectionId: connId })
            .sort({ createdAt: 1 })
            .toArray();
          const list = rawList.filter(
            (m) => !m.ownerCreatorId || String(m.ownerCreatorId) === ownerIdStr
          );
          const formattedMessages = await Promise.all(
            list.map((m) => formatMessageDocAsync(m, 'creator', connection.verificationCode || ''))
          );
          return json(
            res,
            200,
            { messages: formattedMessages },
            req
          );
        }
        if (req.method === 'POST') {
          const voiceMeta = body.voiceMeta && body.voiceMeta.dataUrl ? body.voiceMeta : null;
          const photoMeta = body.photoMeta && body.photoMeta.dataUrl ? body.photoMeta : null;
          const rawText = String(body.body || body.text || '').trim();
          let text =
            rawText ||
            (voiceMeta ? '🎤 Sent a voice note ♥' : photoMeta ? '📷 Sent a live camera snap ♥' : '');
          if (!text && !voiceMeta && !photoMeta) {
            return json(res, 400, { error: 'Write a message or attach a voice/camera note first.' }, req);
          }
          let e2eeCiphertext = String(body.e2eeCiphertext || '');
          if (isE2eeCiphertext(text) && connection.verificationCode) {
            e2eeCiphertext = text;
            try {
              const dec = await decryptChatMessage(text, {
                verificationCode: connection.verificationCode
              });
              if (dec.verified && !dec.locked && dec.plaintext) {
                text = dec.plaintext;
              }
            } catch {
              // ignore
            }
          } else if (!e2eeCiphertext && text && connection.verificationCode) {
            try {
              e2eeCiphertext = await encryptChatMessage(text, {
                verificationCode: connection.verificationCode
              });
            } catch {
              // ignore
            }
          }
          const nowIso = new Date().toISOString();
          const isEncrypted = Boolean(body.e2ee || e2eeCiphertext || isE2eeCiphertext(rawText));
          const keyFp =
            body.keyFingerprint ||
            (connection.verificationCode
              ? deriveE2eeFingerprint(connection.verificationCode)
              : '');
          const inserted = await db.collection('messages').insertOne({
            connectionId: connId,
            ownerCreatorId: ownerIdStr,
            inviteToken: String(connection.inviteToken || ''),
            senderRole: 'creator',
            senderName: creator.displayName,
            body: text,
            text,
            e2eeCiphertext,
            voiceMeta,
            photoMeta,
            e2ee: isEncrypted,
            e2eeAlg: body.e2eeAlg || 'AES-256-GCM-PBKDF2',
            keyFingerprint: keyFp,
            seenAt: null,
            createdAt: nowIso
          });
          return json(
            res,
            201,
            {
              message: {
                id: inserted.insertedId.toString(),
                senderRole: 'creator',
                senderName: creator.displayName,
                body: text,
                text,
                e2eeCiphertext,
                voiceMeta,
                photoMeta,
                e2ee: isEncrypted,
                e2eeAlg: body.e2eeAlg || 'AES-256-GCM-PBKDF2',
                keyFingerprint: keyFp,
                seenAt: null,
                createdAt: nowIso
              }
            },
            req
          );
        }
      }

      if (subRoute === 'orders') {
        if (req.method === 'GET') {
          const list = await db
            .collection('orders')
            .find({ connectionId: connId, orderedByRole: 'creator' })
            .sort({ createdAt: -1 })
            .toArray();
          return json(
            res,
            200,
            {
              orders: list.map((o) => ({
                id: o._id.toString(),
                brandId: o.brandId,
                brandName: o.brandName,
                itemId: o.itemId,
                itemName: o.itemName,
                etaMinutes: o.etaMinutes,
                phoneNumber: o.phoneNumber || '',
                note: o.note,
                orderedByName: o.orderedByName,
                privateOnly: true,
                createdAt: o.createdAt
              }))
            },
            req
          );
        }
        if (req.method === 'POST') {
          const brand =
            brandCatalog.find((b) => b.id === (body.brandId || body.brandSlug)) ||
            brandCatalog[0];
          const item =
            brand.items.find((i) => i.id === body.itemId) || brand.items[0];
          const note = String(body.note || '').trim();
          const phoneNumber = String(body.phoneNumber || '').replace(/\D/g, '').slice(0, 10);
          const nowIso = new Date().toISOString();
          const orderedByName = creator.displayName;

          // Strictly Private Order Record — NEVER insert into shared chat messages!
          const orderDoc = {
            connectionId: connId,
            brandId: brand.id,
            brandName: brand.name,
            itemId: item.id,
            itemName: body.itemTitle || item.name,
            etaMinutes: item.etaMinutes,
            phoneNumber,
            city: body.city || 'Hyderabad',
            address: body.address || '',
            note,
            orderedByRole: 'creator',
            orderedByName,
            privateOnly: true,
            createdAt: nowIso
          };
          const inserted = await db.collection('orders').insertOne(orderDoc);

          return json(
            res,
            201,
            { order: { ...orderDoc, id: inserted.insertedId.toString() } },
            req
          );
        }
      }

      if (subRoute === 'dates') {
        if (req.method === 'GET') {
          const list = await db
            .collection('dates')
            .find({ connectionId: connId })
            .sort({ createdAt: -1 })
            .toArray();
          return json(res, 200, { dates: list }, req);
        }
        if (req.method === 'POST') {
          const title = String(body.title || 'Candlelight Dinner Date ♥').trim();
          const location = String(body.location || 'Olive Bistro, Durgam Cheruvu').trim();
          const dateTime = String(body.dateTime || '').trim();
          const description = String(body.description || 'Just the two of us ♥').trim();
          const nowIso = new Date().toISOString();
          const senderName = creator.displayName;

          const dateMeta = {
            title,
            location,
            dateTime,
            description,
            createdBy: senderName,
            createdAt: nowIso
          };
          await db.collection('dates').insertOne({ connectionId: connId, ...dateMeta });

          await db.collection('messages').insertOne({
            connectionId: connId,
            senderRole: 'creator',
            senderName,
            body: `🕯️ ${senderName} planned an upcoming date: "${title}" at ${location}! Tap below to add it directly to Google Calendar ♥`,
            dateMeta,
            createdAt: nowIso
          });

          return json(res, 201, { date: dateMeta }, req);
        }
      }

      if (subRoute === 'photos') {
        if (req.method === 'GET') {
          const list = await db
            .collection('photos')
            .find({ connectionId: connId })
            .sort({ createdAt: -1 })
            .toArray();
          return json(
            res,
            200,
            {
              photos: list.map((p) => ({
                id: p._id.toString(),
                dataUrl: p.dataUrl,
                caption: p.caption,
                uploadedBy: p.uploadedBy || 'creator',
                createdAt: p.createdAt
              }))
            },
            req
          );
        }
        if (req.method === 'POST') {
          const dataUrl = String(body.dataUrl || '');
          const caption = String(body.caption || '').trim();
          if (!dataUrl.startsWith('data:image/')) {
            return json(res, 400, { error: 'Invalid image data.' }, req);
          }
          const nowIso = new Date().toISOString();
          const senderName = creator.displayName;
          const inserted = await db.collection('photos').insertOne({
            connectionId: connId,
            dataUrl,
            caption,
            uploadedBy: 'creator',
            createdAt: nowIso
          });
          const photoMeta = {
            id: inserted.insertedId.toString(),
            dataUrl,
            caption: caption || `Shared by ${senderName}`,
            createdAt: nowIso
          };

          await db.collection('messages').insertOne({
            connectionId: connId,
            senderRole: 'creator',
            senderName,
            body: caption ? `📸 ${caption}` : `📸 Shared a private photo`,
            photoMeta,
            createdAt: nowIso
          });

          return json(res, 201, { photo: photoMeta }, req);
        }
      }
    }

    return json(res, 404, { error: `Endpoint /api/${action} not found.` }, req);
  } catch (error) {
    console.error('API Error:', error);
    return json(
      res,
      500,
      { error: error.message || 'Internal server error' },
      req
    );
  }
}
