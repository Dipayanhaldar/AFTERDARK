import { createHash, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getLocalDatabase, ObjectId } from './local-db.js';
import { brandCatalog, CITY_PROFILES, analyzeChatContextLocally } from '../src/commerce-data.js';
import { GoogleGenAI, Type } from '@google/genai';

const scrypt = promisify(scryptCb);

function setCorsHeaders(req, res) {
  const origin = req?.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, X-Device-Id, X-Client-Ip'
  );
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
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

function extractBearerToken(req) {
  const header = String(req.headers?.authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

async function getCreatorFromRequest(req, db) {
  const rawToken = extractBearerToken(req);
  if (!rawToken) return null;
  const session = await db.collection('sessions').findOne({
    tokenHash: hashValue(rawToken)
  });
  if (!session) return null;
  const userId = session.userId instanceof ObjectId ? session.userId : new ObjectId(session.userId);
  const user = await db.collection('users').findOne({ _id: userId });
  if (!user) return null;
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
  const guestSession = await db.collection('guest_sessions').findOne({
    tokenHash: hashValue(rawToken)
  });
  if (!guestSession) return null;
  const connectionId =
    guestSession.connectionId instanceof ObjectId
      ? guestSession.connectionId
      : new ObjectId(guestSession.connectionId);
  const connection = await db.collection('connections').findOne({ _id: connectionId });
  if (!connection || connection.status !== 'active') return null;
  return {
    guestSession,
    connection,
    guestDisplayName: guestSession.guestDisplayName || connection.guestDisplayName || 'Meri Jaan'
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

function formatMessageDoc(m, defaultRole = 'creator') {
  return {
    id: m._id.toString(),
    senderRole: m.senderRole || defaultRole,
    senderName: m.senderName || '',
    body: m.body || m.text || '',
    text: m.body || m.text || '',
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

    if (action === 'health' && req.method === 'GET') {
      return json(res, 200, { ok: true, service: 'afterdark-hyderabad-couples' }, req);
    }

    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
      ? await readBody(req)
      : {};

    // -------------------------------------------------------------------------
    // 0. AI IN-CHAT BRAND & FLIRT LINE ANALYZER
    // -------------------------------------------------------------------------
    if (action === 'ai/analyze-chat' && req.method === 'POST') {
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const draftText = String(body.draftText || '');
      const viewerRole = body.viewerRole === 'guest' ? 'guest' : 'creator';
      const localInsight = analyzeChatContextLocally(messages, draftText, viewerRole);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return json(res, 200, { insight: localInsight, source: 'contextual-engine' }, req);
      }

      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const chatTranscript = messages
          .slice(-6)
          .map((m) => {
            const mediaTag = m.voiceMeta ? '[Voice Note]' : m.photoMeta ? '[Live Photo]' : '';
            return `${m.senderName || m.senderRole || 'Partner'}: ${mediaTag} ${m.body || m.text || ''}`.trim();
          })
          .join('\n');
        const validBrandIds = brandCatalog.map((b) => b.id).join(', ');

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Analyze this couple's private chat (including text, voice note, and live photo mood) for viewerRole="${viewerRole}". Recommend the single best matching Indian brand from Allowed brand IDs and write a witty Gen-Z Hinglish/Hyderabadi couple flirt reply.
Allowed brand IDs: ${validBrandIds}

Recent Chat:
${chatTranscript || 'Couple connected in private chat.'}
Draft: ${draftText || '(none)'}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                notificationTitle: { type: Type.STRING },
                notificationBody: { type: Type.STRING },
                primaryBrandId: { type: Type.STRING },
                recommendedBrandIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                suggestedFlirtReply: { type: Type.STRING }
              },
              required: [
                'notificationTitle',
                'notificationBody',
                'primaryBrandId',
                'recommendedBrandIds',
                'suggestedFlirtReply'
              ]
            }
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        const validSet = new Set(brandCatalog.map((b) => b.id));
        const primaryBrandId = validSet.has(parsed.primaryBrandId)
          ? parsed.primaryBrandId
          : localInsight.primaryBrandId;

        return json(
          res,
          200,
          {
            insight: {
              notificationTitle: parsed.notificationTitle || localInsight.notificationTitle,
              notificationBody: parsed.notificationBody || localInsight.notificationBody,
              primaryBrandId,
              recommendedBrandIds: localInsight.recommendedBrandIds,
              suggestedFlirtReply: parsed.suggestedFlirtReply || localInsight.suggestedFlirtReply
            },
            source: 'gemini'
          },
          req
        );
      } catch {
        return json(res, 200, { insight: localInsight, source: 'fallback' }, req);
      }
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

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return json(res, 200, { spots: fallbackSpots, city: cityKey, source: 'curated-city' }, req);
      }

      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const mood = String(body.mood || 'Romantic Cafe & Candlelight Dinner');
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Recommend 4 real, top-rated romantic couple cafes (both top-tier and mid-tier) or candlelight dinner spots in ${requestedCity} for "${mood}". Return brief descriptions.`,
          config: {
            tools: [{ googleMaps: {} }, { googleSearch: {} }]
          }
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const groundedSpots = [];
        for (const chunk of chunks) {
          if (chunk.maps?.title) {
            groundedSpots.push({
              name: chunk.maps.title,
              vibe: `Verified Google Maps Spot · ${requestedCity}`,
              highlight: `Live grounded couple cafe/dining venue in ${requestedCity}.`,
              mapsUrl: chunk.maps.uri || 'https://www.google.com/maps'
            });
          } else if (chunk.web?.title) {
            groundedSpots.push({
              name: chunk.web.title,
              vibe: `Live Search Recommendation · ${requestedCity}`,
              highlight: `Trending ${requestedCity} couple date spot.`,
              mapsUrl: chunk.web.uri || 'https://www.google.com/maps'
            });
          }
        }
        return json(
          res,
          200,
          {
            spots: groundedSpots.length > 0 ? [...groundedSpots.slice(0, 3), ...fallbackSpots.slice(0, 2)] : fallbackSpots,
            city: cityKey,
            summaryText: response.text || '',
            source: 'gemini-grounding'
          },
          req
        );
      } catch {
        return json(res, 200, { spots: fallbackSpots, city: cityKey, source: 'fallback' }, req);
      }
    }

    // -------------------------------------------------------------------------
    // 1. CREATOR AUTH: /api/auth/signup, /api/auth/login, /api/auth/logout
    // -------------------------------------------------------------------------
    if ((action === 'auth/signup' || action === 'register') && req.method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
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
        const sessionToken = randomToken(32);
        await db.collection('sessions').insertOne({
          tokenHash: hashValue(sessionToken),
          userId: existing._id,
          createdAt: new Date().toISOString()
        });
        const name = existing.displayName || displayName;
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

      const sessionToken = randomToken(32);
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
      const user = await db.collection('users').findOne({ email });

      if (!user || !user.passwordHash) {
        return json(
          res,
          401,
          { error: 'Account not found. Switch to "Create Couple Account" to join!' },
          req
        );
      }

      const [salt, storedHash] = String(user.passwordHash).split(':');
      const derived = (await scrypt(password, salt, 64)).toString('hex');
      if (
        storedHash.length !== derived.length ||
        !timingSafeEqual(Buffer.from(storedHash), Buffer.from(derived))
      ) {
        return json(res, 401, { error: 'Incorrect password. Please try again.' }, req);
      }

      const sessionToken = randomToken(32);
      await db.collection('sessions').insertOne({
        tokenHash: hashValue(sessionToken),
        userId: user._id,
        createdAt: new Date().toISOString()
      });

      const name = user.displayName || user.handle || 'Jaan';
      return json(
        res,
        200,
        {
          sessionToken,
          user: {
            id: user._id.toString(),
            email: user.email,
            displayName: name,
            handle: name
          }
        },
        req
      );
    }

    if ((action === 'auth/logout' || action === 'logout') && req.method === 'POST') {
      const rawToken = extractBearerToken(req);
      if (rawToken) {
        await db.collection('sessions').deleteMany({ tokenHash: hashValue(rawToken) });
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

      const existing = await db.collection('invites').findOne({
        creatorId: creator._id,
        status: { $in: ['pending', 'active'] }
      });

      return json(
        res,
        200,
        {
          invite: existing
            ? {
                inviteToken: existing.inviteToken,
                verificationCode: existing.verificationCode,
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
      const inviteToken = String(body.inviteToken || body.invite || '').trim();
      const verificationCode = String(body.verificationCode || body.inviteCode || '')
        .replace(/\D/g, '')
        .slice(0, 6);
      const recipientHint = String(body.recipientHint || 'Meri Jaan').trim();
      const creatorDisplayName =
        creator?.displayName || String(body.creatorDisplayName || 'Tumhari Jaan').trim();

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
            creatorId: creator?._id || null,
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

    // Public Invite Preview for Guest Site: GET /api/invites/:token
    // Strictly matches ONLY the exact inviteToken and blocks Same-Device or Same-IP self-chat!
    if (parts[0] === 'invites' && parts[1] && parts.length === 2 && req.method === 'GET') {
      const rawToken = parts[1].trim();
      const invite = await db.collection('invites').findOne({
        $or: [{ inviteToken: rawToken }, { tokenHash: hashValue(rawToken) }]
      });

      const guestIp = getClientIp(req);
      const guestDeviceId = getRequestDeviceId(req);
      const urlCreatorIp = String(url.searchParams.get('cip') || '').trim();
      const urlCreatorDev = String(url.searchParams.get('cdev') || '').trim();

      if (!invite) {
        const sameDev = Boolean(guestDeviceId && urlCreatorDev && guestDeviceId === urlCreatorDev);
        const sameIp = Boolean(guestIp && urlCreatorIp && guestIp === urlCreatorIp);
        const blocked = sameDev || sameIp;
        return json(
          res,
          200,
          {
            invite: {
              status: 'pending',
              actualStatus: 'pending',
              ownInvite: blocked,
              sameDeviceOrIpBlocked: blocked,
              blockReason: sameDev
                ? '🚫 Same-Device Blocked: One device cannot chat with itself! You generated this link on this device. Send the QR or link to your partner’s phone.'
                : sameIp
                ? `🚫 Same IP Address Blocked (${guestIp}): The Guest cannot join from the exact same IP address as the Link Generator.`
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
      const effectiveCreatorIp = invite.creatorIp || urlCreatorIp;
      const isSameDevice = Boolean(
        guestDeviceId && effectiveCreatorDev && guestDeviceId === effectiveCreatorDev
      );
      const isSameIp = Boolean(
        guestIp && effectiveCreatorIp && guestIp === effectiveCreatorIp
      );
      const blocked = isSameDevice || isSameIp;

      return json(
        res,
        200,
        {
          invite: {
            status: invite.status === 'active' ? 'active' : 'pending',
            actualStatus: invite.status,
            ownInvite: blocked,
            sameDeviceOrIpBlocked: blocked,
            blockReason: isSameDevice
              ? '🚫 Same-Device Blocked: One device cannot chat with itself! You generated this Couple Link on this device. Send the QR code or link to your partner’s separate device.'
              : isSameIp
              ? `🚫 Same IP Address Blocked (${guestIp}): The Guest cannot join or chat from the same IP address as the Link Generator. Please connect from a separate device/network.`
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
    // 3. GUEST OTP VERIFICATION & HOST-GUEST CHANNEL PAIRING
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
      const suppliedOtp = String(body.verificationCode || body.code || body.otp || '')
        .replace(/\D/g, '')
        .slice(0, 6);
      const guestDisplayName =
        String(body.guestDisplayName || body.handle || '')
          .trim()
          .slice(0, 40) || 'Meri Jaan';
      const hintCreatorName =
        String(body.creatorDisplayName || '').trim().slice(0, 40) || 'Your Partner';

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

      // Step 2: If invite was not found by token (or guest used direct 6-digit OTP entry),
      // look up the Host's active/pending session by the 6-digit verificationCode!
      if (!invite) {
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
        invite =
          otpMatches.find((i) => i.status === 'pending' || i.status === 'active') ||
          otpMatches[0] ||
          null;
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

      // Step 3: Enforce Same-Device & Same-IP Security Block (One device / same IP cannot chat with itself!)
      const guestIp = getClientIp(req, body);
      const guestDeviceId = getRequestDeviceId(req, body);
      const effectiveCreatorDev = invite?.creatorDeviceId || String(body.creatorDeviceId || '').trim();
      const effectiveCreatorIp = invite?.creatorIp || String(body.creatorIp || '').trim();

      if (guestDeviceId && effectiveCreatorDev && guestDeviceId === effectiveCreatorDev) {
        return json(
          res,
          403,
          {
            error:
              '🚫 Security Block: One device cannot chat with itself! You generated this Couple Link on this device. Please send the QR code or link to your partner’s separate phone/device.'
          },
          req
        );
      }

      if (guestIp && effectiveCreatorIp && guestIp === effectiveCreatorIp) {
        return json(
          res,
          403,
          {
            error: `🚫 Security Block: Same IP Address Detected (${guestIp})! The Guest cannot verify or chat from the exact same IP address as the Link Generator. Please connect from your partner’s separate device/network.`
          },
          req
        );
      }

      // Step 4: Validate the Guest's 6-digit entry code against the Host's generated session!
      if (invite && !verifyOtpMatchesInvite(invite, suppliedOtp)) {
        return json(
          res,
          401,
          { error: 'Invalid 6-digit OTP! Please enter the exact 6-digit code shown on your partner’s screen.' },
          req
        );
      }

      // Step 4: If server cold-started and invite wasn't in DB, validate against signed QR OTP signature
      if (!invite) {
        let expectedOtpFromSig = '';
        if (body.expectedSignature) {
          try {
            const decoded = Buffer.from(String(body.expectedSignature), 'base64').toString('utf8');
            if (decoded.startsWith('ad:')) {
              expectedOtpFromSig = decoded.slice(3).replace(/\D/g, '').slice(0, 6);
            }
          } catch {
            expectedOtpFromSig = '';
          }
        }

        if (!rawToken || rawToken === 'otp-direct' || !expectedOtpFromSig) {
          return json(
            res,
            401,
            {
              error:
                'No active host session matches this 6-digit OTP. Please check the 6-digit code on your partner’s screen or scan their QR code.'
            },
            req
          );
        }

        if (expectedOtpFromSig !== suppliedOtp) {
          return json(
            res,
            401,
            { error: 'Invalid 6-digit OTP for this invite link. Please check the OTP with your partner!' },
            req
          );
        }

        const insertedInvite = await db.collection('invites').insertOne({
          inviteToken: rawToken,
          tokenHash: hashValue(rawToken),
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

      // Step 5: Pair Guest & Host into the shared Secure Chat Channel
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
        await db.collection('connections').updateOne(
          { _id: connection._id },
          {
            $set: {
              guestDisplayName: guestDisplayName || connection.guestDisplayName,
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
              approvedAt: nowIso
            }
          }
        );

        await db.collection('messages').insertOne({
          connectionId: createdConn.insertedId,
          channelId,
          senderRole: 'guest',
          senderName: guestDisplayName,
          body: `Hau miyaan! ${guestDisplayName} connected to our private 1-on-1 room ♥ Ab baatein shuru karein?`,
          createdAt: nowIso
        });
      }

      const guestSessionToken = randomToken(32);
      await db.collection('guest_sessions').insertOne({
        tokenHash: hashValue(guestSessionToken),
        connectionId: connection._id,
        inviteToken: effectiveInviteToken,
        verificationCode: suppliedOtp,
        channelId,
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
      const guestCtx = await getGuestFromRequest(req, db);
      let connection = guestCtx?.connection || null;

      if (!connection) {
        try {
          const directConnId = new ObjectId(parts[2]);
          const found = await db.collection('connections').findOne({ _id: directConnId });
          if (found && found.status === 'active') {
            connection = found;
          }
        } catch {
          // ignore
        }
      }

      if (!connection || connection.status !== 'active') {
        return json(res, 401, { error: 'This private room has been closed or revoked.' }, req);
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
          return json(
            res,
            200,
            { messages: list.map((m) => formatMessageDoc(m, 'guest')) },
            req
          );
        }
        if (req.method === 'POST') {
          const voiceMeta = body.voiceMeta && body.voiceMeta.dataUrl ? body.voiceMeta : null;
          const photoMeta = body.photoMeta && body.photoMeta.dataUrl ? body.photoMeta : null;
          const rawText = String(body.body || body.text || '').trim();
          const text =
            rawText ||
            (voiceMeta ? '🎤 Sent a voice note ♥' : photoMeta ? '📷 Sent a live camera snap ♥' : '');
          if (!text && !voiceMeta && !photoMeta) {
            return json(res, 400, { error: 'Write a message or attach a voice/camera note first.' }, req);
          }
          const nowIso = new Date().toISOString();
          const inserted = await db.collection('messages').insertOne({
            connectionId: connId,
            senderRole: 'guest',
            senderName: connection.guestDisplayName || 'Meri Jaan',
            body: text,
            voiceMeta,
            photoMeta,
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
                voiceMeta,
                photoMeta,
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

      // Ensure the Host's active invite is registered in the DB if server cold-started
      if (tokenHint && otpHint.length === 6) {
        const existingInvite = await db.collection('invites').findOne({ inviteToken: tokenHint });
        if (!existingInvite) {
          await db.collection('invites').insertOne({
            inviteToken: tokenHint,
            tokenHash: hashValue(tokenHint),
            verificationCode: otpHint,
            codeHash: hashValue(otpHint),
            creatorId: creator._id,
            creatorDisplayName: creator.displayName,
            recipientHint: url.searchParams.get('hint') || 'Meri Jaan',
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
          });
        } else if (!existingInvite.creatorId || existingInvite.creatorId.toString() !== creator._id.toString()) {
          await db.collection('invites').updateOne(
            { _id: existingInvite._id },
            { $set: { creatorId: creator._id, creatorDisplayName: creator.displayName } }
          );
        }
      }

      // Bind any active connection matching this Host's inviteToken or 6-digit OTP to this Host's session
      if (tokenHint || otpHint.length === 6) {
        const matchOr = [];
        if (tokenHint) matchOr.push({ inviteToken: tokenHint });
        if (otpHint.length === 6) matchOr.push({ verificationCode: otpHint });

        const matchedConn = await db.collection('connections').findOne({
          status: 'active',
          $or: matchOr
        });
        if (
          matchedConn &&
          (!matchedConn.creatorId || matchedConn.creatorId.toString() !== creator._id.toString())
        ) {
          await db.collection('connections').updateOne(
            { _id: matchedConn._id },
            {
              $set: {
                creatorId: creator._id,
                creatorDisplayName: matchedConn.creatorDisplayName || creator.displayName
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
      return json(
        res,
        200,
        { connections: list.map(formatConnectionForCreator) },
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
      if (connection && !connection.creatorId) {
        await db.collection('connections').updateOne(
          { _id: connection._id },
          { $set: { creatorId: creator._id } }
        );
        connection.creatorId = creator._id;
      }

      if (!connection) {
        return json(res, 404, { error: 'Connection not found.' }, req);
      }
      const connId = connection._id;
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
          const list = await db
            .collection('messages')
            .find({ connectionId: connId })
            .sort({ createdAt: 1 })
            .toArray();
          return json(
            res,
            200,
            { messages: list.map((m) => formatMessageDoc(m, 'creator')) },
            req
          );
        }
        if (req.method === 'POST') {
          const voiceMeta = body.voiceMeta && body.voiceMeta.dataUrl ? body.voiceMeta : null;
          const photoMeta = body.photoMeta && body.photoMeta.dataUrl ? body.photoMeta : null;
          const rawText = String(body.body || body.text || '').trim();
          const text =
            rawText ||
            (voiceMeta ? '🎤 Sent a voice note ♥' : photoMeta ? '📷 Sent a live camera snap ♥' : '');
          if (!text && !voiceMeta && !photoMeta) {
            return json(res, 400, { error: 'Write a message or attach a voice/camera note first.' }, req);
          }
          const nowIso = new Date().toISOString();
          const inserted = await db.collection('messages').insertOne({
            connectionId: connId,
            senderRole: 'creator',
            senderName: creator.displayName,
            body: text,
            voiceMeta,
            photoMeta,
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
                voiceMeta,
                photoMeta,
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
