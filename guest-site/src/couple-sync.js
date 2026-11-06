import { brandCatalog, CITY_PROFILES, analyzeChatContextLocally } from './commerce-data.js';
import { APP_VERSION } from './version-manifest.js';
import {
  classifyEndpointPriority,
  executeWithTrafficControl,
  recordServerTrafficHeaders
} from './traffic-control.js';
import {
  encodeOtpSignature,
  verifyOtpSignature,
  deriveE2eeFingerprint,
  isE2eeCiphertext,
  encryptChatMessage,
  decryptChatMessage,
  encryptMessageRecord,
  decryptMessageRecord,
  saveSessionE2eeContext,
  loadSessionE2eeContext,
  setSessionHistoryLocked
} from './e2ee-crypto.js';

export {
  encodeOtpSignature,
  verifyOtpSignature,
  deriveE2eeFingerprint,
  isE2eeCiphertext,
  encryptChatMessage,
  decryptChatMessage,
  encryptMessageRecord,
  decryptMessageRecord,
  saveSessionE2eeContext,
  loadSessionE2eeContext,
  setSessionHistoryLocked
};

const SHARED_STATE_KEY = 'afterdark_shared_couple_state_v3';
const CHANNEL_NAME = 'afterdark_couple_live_channel_v3';
const DEVICE_ID_KEY = 'afterdark_unique_device_id_v1';
const CREATOR_SESSION_KEY = 'afterdark_session_token';
const CREATOR_USER_CACHE_KEY = 'afterdark_user_profile_v1';
const CREATOR_INVITE_CACHE_KEY = 'afterdark_latest_invite_v3';
const TAB_INSTANCE_ID = 'tab_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);

export function getClientDeviceId() {
  if (typeof window === 'undefined') return 'srv_device';
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).slice(2, 12) + '_' + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'dev_fallback';
  }
}

export function isCurrentDeviceTheLinkGenerator(inviteToken = '') {
  if (typeof window === 'undefined') return false;
  try {
    const activeCreatorSession = localStorage.getItem(CREATOR_SESSION_KEY);
    const cachedInviteRaw = localStorage.getItem(CREATOR_INVITE_CACHE_KEY);
    if (cachedInviteRaw) {
      const cachedInvite = JSON.parse(cachedInviteRaw);
      if (
        cachedInvite &&
        cachedInvite.status !== 'revoked' &&
        (!inviteToken || cachedInvite.inviteToken === inviteToken)
      ) {
        return true;
      }
    }
    if (activeCreatorSession) {
      const state = JSON.parse(localStorage.getItem(SHARED_STATE_KEY) || '{}');
      const myDeviceId = getClientDeviceId();
      const foundInvite = (state.invites || []).find(
        (i) =>
          (!inviteToken || i.inviteToken === inviteToken) &&
          (i.creatorDeviceId === myDeviceId || i.status === 'pending' || i.status === 'active')
      );
      if (foundInvite) return true;
    }
  } catch {
    // Ignore storage read errors
  }
  return false;
}

export function purgeStaleServiceWorkers() {
  if (typeof window === 'undefined') return;
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
    }
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
  } catch {
    // Ignore errors in restricted contexts
  }
}

export function decodeOtpSignature(sig) {
  if (!sig) return '';
  if (String(sig).startsWith('ad1_')) return '';
  try {
    const raw = atob(String(sig));
    if (raw.startsWith('ad:')) {
      return raw.slice(3).replace(/\D/g, '').slice(0, 6);
    }
  } catch {
    // ignore
  }
  return String(sig).replace(/\D/g, '').slice(0, 6);
}

export function isInternalPreviewOrigin(origin = '') {
  const check = String(
    origin || (typeof window !== 'undefined' ? window.location?.origin : '') || ''
  ).toLowerCase();
  return check.includes('ais-dev-') || check.includes('ais-pre-');
}

const STABLE_PUBLIC_ORIGIN = 'https://afterdark-social-universe.vercel.app';
const STABLE_GUEST_ORIGIN = 'https://afterdark-guest-connector.onrender.com';

export function getPublicOrigin() {
  if (typeof window === 'undefined' || !window.location?.origin) {
    return STABLE_PUBLIC_ORIGIN;
  }
  const rawOrigin = window.location.origin;
  // AI Studio development containers are private and cannot be opened by invitees.
  if (rawOrigin.includes('://ais-dev-')) {
    return rawOrigin.replace('://ais-dev-', '://ais-pre-');
  }
  // Vercel deployment URLs are immutable per build. Always use the verified
  // project domain for shareable invitations so new deployments do not stale links.
  if (/\.vercel\.app$/i.test(new URL(rawOrigin).hostname)) {
    return STABLE_PUBLIC_ORIGIN;
  }
  // Keep user-configured custom domains and local development origins intact.
  return rawOrigin;
}

export function isGuestInviteLocation() {
  if (typeof window === 'undefined') return false;
  const pathname = String(window.location.pathname || '').toLowerCase();
  if (
    pathname.startsWith('/guest') ||
    pathname.startsWith('/invite/')
  ) {
    return true;
  }
  const params = new URLSearchParams(window.location.search || '');
  if (
    params.get('invite') ||
    params.get('inviteToken') ||
    params.get('token') ||
    params.get('mode') === 'guest'
  ) {
    return true;
  }
  const hash = String(window.location.hash || '').replace(/^#\/?/, '');
  if (hash) {
    const hashParams = new URLSearchParams(hash.replace(/^\?/, ''));
    if (
      hashParams.get('invite') ||
      hashParams.get('inviteToken') ||
      hashParams.get('token') ||
      hashParams.get('mode') === 'guest'
    ) {
      return true;
    }
  }
  return false;
}

export function buildPublicInviteLinks({
  inviteToken,
  creatorDisplayName,
  recipientHint,
  customGuestOrigin
}) {
  if (!inviteToken) {
    return {
      primaryUrl: '',
      guestAppUrl: '',
      rootDirectUrl: '',
      sameOriginUrl: ''
    };
  }
  const cleanedCustom =
    customGuestOrigin && /^https?:\/\//i.test(String(customGuestOrigin).trim())
      ? String(customGuestOrigin).trim().replace(/\/+$/, '')
      : '';
  // Keep the guest experience on its dedicated Render static site; its API is
  // served by the stable AFTERDARK Social Universe Vercel project.
  const targetOrigin = cleanedCustom || STABLE_GUEST_ORIGIN;

  const params = new URLSearchParams();
  params.set('invite', inviteToken);
  if (creatorDisplayName) params.set('creator', String(creatorDisplayName).slice(0, 20));
  if (recipientHint) params.set('hint', String(recipientHint).slice(0, 20));
  const query = params.toString();

  // Clean public URL without exposing internal API origins, device IDs, IPs, or key hashes
  const rootDirectUrl = `${targetOrigin}/?${query}`;
  const guestAppUrl = rootDirectUrl;

  return {
    primaryUrl: rootDirectUrl,
    guestAppUrl,
    rootDirectUrl,
    sameOriginUrl: rootDirectUrl
  };
}

function readSharedState() {
  try {
    const raw = localStorage.getItem(SHARED_STATE_KEY);
    if (!raw) {
      return {
        users: [],
        invites: [],
        connections: [],
        messages: [],
        orders: [],
        dates: [],
        photos: []
      };
    }
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || [],
      invites: parsed.invites || [],
      connections: parsed.connections || [],
      messages: parsed.messages || [],
      orders: parsed.orders || [],
      dates: parsed.dates || [],
      photos: parsed.photos || []
    };
  } catch {
    return {
      users: [],
      invites: [],
      connections: [],
      messages: [],
      orders: [],
      dates: [],
      photos: []
    };
  }
}

function writeSharedState(nextState, { broadcast = true } = {}) {
  try {
    const serialized = JSON.stringify(nextState);
    const existingRaw = localStorage.getItem(SHARED_STATE_KEY);
    if (existingRaw === serialized) {
      return;
    }
    localStorage.setItem(SHARED_STATE_KEY, serialized);
    if (broadcast && typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(CHANNEL_NAME);
      ch.postMessage({
        type: 'STATE_UPDATED',
        senderTabId: TAB_INSTANCE_ID,
        timestamp: Date.now()
      });
      ch.close();
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function subscribeToCoupleSync(callback) {
  if (typeof window === 'undefined') return () => {};
  let debounceTimer = null;
  const triggerDebounced = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      callback();
    }, 320);
  };

  const onStorage = (event) => {
    if (event.key === SHARED_STATE_KEY && event.newValue !== event.oldValue) {
      triggerDebounced();
    }
  };
  window.addEventListener('storage', onStorage);

  let channel = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event?.data?.senderTabId === TAB_INSTANCE_ID) {
          return;
        }
        triggerDebounced();
      };
    } catch {
      channel = null;
    }
  }

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    window.removeEventListener('storage', onStorage);
    if (channel) {
      try {
        channel.close();
      } catch {
        // Ignore
      }
    }
  };
}

export function mirrorUserLocally(userData, sessionToken = '') {
  if (!userData?.email && !userData?.displayName) return;
  try {
    localStorage.setItem(CREATOR_USER_CACHE_KEY, JSON.stringify(userData));
  } catch {
    // ignore
  }
  const state = readSharedState();
  const email = String(userData.email || 'couple@afterdark.local').toLowerCase();
  const existingIdx = state.users.findIndex(
    (u) => u.email === email || (sessionToken && u.sessionToken === sessionToken)
  );
  const existingUser = existingIdx >= 0 ? state.users[existingIdx] : null;
  const record = {
    id: userData.id || existingUser?.id || 'usr_' + Math.random().toString(36).slice(2, 10),
    email,
    displayName: userData.displayName || existingUser?.displayName || email.split('@')[0] || 'Creator',
    sessionToken: sessionToken || userData.sessionToken || existingUser?.sessionToken || ''
  };
  if (existingIdx >= 0) {
    state.users[existingIdx] = { ...existingUser, ...record };
  } else {
    state.users.unshift(record);
  }
  writeSharedState(state, { broadcast: false });
}

export function mirrorInviteLocally(inviteData) {
  if (!inviteData?.inviteToken || !inviteData?.verificationCode) return;
  const state = readSharedState();
  const exists = state.invites.find((i) => i.inviteToken === inviteData.inviteToken);
  if (!exists) {
    state.invites.unshift({
      inviteToken: inviteData.inviteToken,
      verificationCode: String(inviteData.verificationCode),
      creatorId: inviteData.creatorId || null,
      creatorDeviceId: inviteData.creatorDeviceId || getClientDeviceId(),
      creatorIp: '',
      creatorDisplayName: inviteData.creatorDisplayName || 'Your Partner',
      recipientHint: inviteData.recipientHint || 'Meri Jaan',
      creatorCustomName:
        inviteData.creatorCustomName || inviteData.creatorDisplayName || 'Your Partner',
      partnerCustomName:
        inviteData.partnerCustomName || inviteData.recipientHint || 'Meri Jaan',
      themeId: inviteData.themeId || 'charminar',
      emblemStyle: inviteData.emblemStyle || 'dil',
      status: inviteData.status || 'pending',
      createdAt: inviteData.createdAt || new Date().toISOString(),
      expiresAt: inviteData.expiresAt || new Date(Date.now() + 7 * 86400000).toISOString()
    });
    writeSharedState(state, { broadcast: false });
  }
}

export function mirrorConnectionLocally(connData, guestSessionToken = '') {
  if (!connData?.id) return;
  const state = readSharedState();
  const existingIdx = state.connections.findIndex(
    (c) =>
      c.id === connData.id ||
      (connData.inviteToken && c.inviteToken === connData.inviteToken && c.status === 'active')
  );
  const existingConn = existingIdx >= 0 ? state.connections[existingIdx] : null;
  const record = {
    id: connData.id,
    channelId:
      connData.channelId ||
      existingConn?.channelId ||
      `chan_${String(connData.inviteToken || connData.id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 14)}`,
    paired: true,
    status: connData.status || existingConn?.status || 'active',
    creatorId: connData.creatorId || existingConn?.creatorId || null,
    creatorDisplayName:
      connData.creatorDisplayName || existingConn?.creatorDisplayName || 'Your Partner',
    guestDisplayName:
      connData.guestDisplayName ||
      connData.peerDisplayName ||
      existingConn?.guestDisplayName ||
      'Meri Jaan',
    peerDisplayName:
      connData.guestDisplayName ||
      connData.peerDisplayName ||
      existingConn?.peerDisplayName ||
      'Meri Jaan',
    inviteToken: connData.inviteToken || existingConn?.inviteToken || '',
    verificationCode: connData.verificationCode || existingConn?.verificationCode || '',
    guestSessionToken:
      guestSessionToken || existingConn?.guestSessionToken || '',
    createdAt: connData.createdAt || existingConn?.createdAt || '2026-01-01T00:00:00.000Z',
    approvedAt: connData.approvedAt || existingConn?.approvedAt || '2026-01-01T00:00:00.000Z'
  };
  if (existingIdx >= 0) {
    state.connections[existingIdx] = { ...existingConn, ...record };
  } else {
    state.connections.unshift(record);
  }
  for (const inv of state.invites) {
    if (
      (record.inviteToken && inv.inviteToken === record.inviteToken) ||
      (record.verificationCode && inv.verificationCode === record.verificationCode)
    ) {
      inv.status = 'active';
    }
  }
  writeSharedState(state, { broadcast: false });
}

function executeLocalFallback(path, options = {}, token = '', urlContext = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let body = {};
  if (typeof options.body === 'string' && options.body) {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  } else if (options.body && typeof options.body === 'object') {
    body = options.body;
  }

  const state = readSharedState();
  const cleanPath = path.split('?')[0].replace(/^\/+/, '');
  const parts = cleanPath.split('/').filter(Boolean);

  if (cleanPath === 'ai/analyze-chat' && method === 'POST') {
    const messages = Array.isArray(body.messages) ? body.messages : state.messages;
    const draftText = String(body.draftText || '');
    const viewerRole = body.viewerRole === 'guest' ? 'guest' : 'creator';
    return {
      insight: analyzeChatContextLocally(messages, draftText, viewerRole),
      source: 'local-sync'
    };
  }

  if (cleanPath === 'ai/discover-date-spots' && method === 'POST') {
    const requestedCity = String(body.city || 'Hyderabad').trim();
    const cityKey =
      Object.keys(CITY_PROFILES).find(
        (k) => k.toLowerCase() === requestedCity.toLowerCase()
      ) ||
      (requestedCity.toLowerCase().includes('bihar') || requestedCity.toLowerCase().includes('patna')
        ? 'Patna'
        : 'Hyderabad');
    const profile = CITY_PROFILES[cityKey] || CITY_PROFILES.Hyderabad;
    return {
      spots: (profile.cafesAndSpots || []).map((spot) => ({
        name: spot.name,
        vibe: `${spot.tier} · ${spot.area}`,
        highlight: `${spot.cuisine} (${spot.avgForTwo} · ${spot.rating})`,
        mapsUrl: spot.mapsUrl,
        bookingUrl: spot.bookingUrl
      })),
      city: cityKey,
      source: 'curated-city'
    };
  }

  if (
    (cleanPath === 'auth/signup' ||
      cleanPath === 'auth/login' ||
      cleanPath === 'auth/google' ||
      cleanPath === 'register' ||
      cleanPath === 'login') &&
    method === 'POST'
  ) {
    const email = String(body.email || 'couple@afterdark.local').trim().toLowerCase();
    const displayName =
      String(body.displayName || body.handle || '').trim() ||
      email.split('@')[0] ||
      'Hyderabadi Jaan';
    let user = state.users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: 'usr_' + Math.random().toString(36).slice(2, 10),
        email,
        displayName,
        photoURL: body.photoURL || '',
        authProvider: cleanPath === 'auth/google' ? 'google' : 'password',
        sessionToken: 'tok_' + Math.random().toString(36).slice(2, 14)
      };
      state.users.push(user);
      writeSharedState(state);
    }
    return {
      sessionToken: user.sessionToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || '',
        authProvider: user.authProvider || 'password'
      }
    };
  }

  if (cleanPath === 'me' && method === 'GET') {
    let user = state.users.find((u) => u.sessionToken === token);
    if (!user) {
      try {
        const cachedRaw = localStorage.getItem(CREATOR_USER_CACHE_KEY);
        if (cachedRaw) {
          user = JSON.parse(cachedRaw);
        }
      } catch {
        // ignore
      }
    }
    if (!user && state.users.length > 0) {
      user = state.users[0];
    }
    if (!user) throw new Error('Unauthorized session. Please sign in.');
    return { user };
  }

  if (cleanPath === 'invites/current' && method === 'GET') {
    const user = state.users.find((u) => u.sessionToken === token);
    const activeInvite = state.invites.find(
      (i) =>
        (!user || !i.creatorId || i.creatorId === user.id) &&
        (i.status === 'pending' || i.status === 'active')
    );
    return { invite: activeInvite || null };
  }

  if (cleanPath === 'invites/revoke' && method === 'POST') {
    const user = state.users.find((u) => u.sessionToken === token);
    for (const inv of state.invites) {
      if (!user || !inv.creatorId || inv.creatorId === user.id) {
        inv.status = 'revoked';
      }
    }
    for (const conn of state.connections) {
      if (!user || !conn.creatorId || conn.creatorId === user.id) {
        conn.status = 'closed';
      }
    }
    writeSharedState(state);
    return { ok: true };
  }

  if (cleanPath === 'invites/sync' && method === 'POST') {
    mirrorInviteLocally(body);
    return { ok: true };
  }

  if (cleanPath === 'invites' && method === 'POST') {
    const user = state.users.find((u) => u.sessionToken === token);
    const existing = state.invites.find(
      (i) =>
        (!user || !i.creatorId || i.creatorId === user.id) &&
        (i.status === 'pending' || i.status === 'active')
    );
    if (existing) {
      throw new Error(
        'You already have an active Couple Link & QR Code! Revoke access and remove your current QR code first before generating a new one.'
      );
    }

    const inviteToken = 'inv_' + Math.random().toString(36).slice(2, 16);
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    const recipientHint = String(body.recipientHint || body.partnerCustomName || 'Meri Jaan').trim();
    const creatorCustomName = String(
      body.creatorCustomName || user?.displayName || 'Your Partner'
    ).trim();
    const partnerCustomName = String(body.partnerCustomName || recipientHint).trim();
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    const record = {
      inviteToken,
      verificationCode,
      creatorId: user?.id || null,
      creatorDeviceId: body.deviceId || getClientDeviceId(),
      creatorDisplayName: creatorCustomName,
      recipientHint,
      creatorCustomName,
      partnerCustomName,
      themeId: body.themeId || 'charminar',
      emblemStyle: body.emblemStyle || 'dil',
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt
    };
    state.invites.unshift(record);
    writeSharedState(state);
    return record;
  }

  // Strictly match invite preview by exact token and block same-device generator
  if (parts[0] === 'invites' && parts.length === 2 && method === 'GET') {
    const rawToken = decodeURIComponent(parts[1]);
    const found = state.invites.find((i) => i.inviteToken === rawToken);
    if (found?.status === 'revoked') {
      throw new Error('This Couple QR Code & Invite Link has been revoked.');
    }
    const isSameDevice =
      isCurrentDeviceTheLinkGenerator(rawToken) ||
      Boolean(found?.creatorDeviceId && found.creatorDeviceId === getClientDeviceId());
    return {
      invite: {
        status: found?.status === 'active' ? 'active' : 'pending',
        ownInvite: isSameDevice,
        sameDeviceOrIpBlocked: isSameDevice,
        blockReason: isSameDevice
          ? 'One device cannot chat with itself! You generated this Couple Link on this device. Please send the QR code or link to your partner’s separate device.'
          : '',
        creatorDisplayName: found?.creatorDisplayName || urlContext.creator || 'Your Partner',
        recipientHint: found?.recipientHint || urlContext.hint || 'Meri Jaan'
      }
    };
  }

  // Strictly isolated Guest OTP Verification & Host-Guest Channel Pairing
  if (
    (cleanPath === 'guest/verify-otp' ||
      (parts[0] === 'guest' && parts[1] === 'invites' && parts[3] === 'approve') ||
      (parts[0] === 'invites' && parts[2] === 'approve')) &&
    method === 'POST'
  ) {
    const rawToken =
      cleanPath === 'guest/verify-otp'
        ? String(body.inviteToken || body.token || 'otp-direct').trim()
        : decodeURIComponent(parts[0] === 'guest' ? parts[2] : parts[1]);
    if (isCurrentDeviceTheLinkGenerator(rawToken)) {
      throw new Error(
        '🚫 Security Block: One device cannot chat with itself! You generated this Couple Link on this device. Please open the link on your partner’s separate device.'
      );
    }
    const suppliedOtp = String(body.verificationCode || body.code || body.otp || '')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (suppliedOtp.length !== 6) {
      throw new Error('Please enter the 6-digit OTP shared by your partner.');
    }

    const sigFromUrl = String(urlContext?.k || body?.expectedSignature || '').trim();
    const guestDisplayName =
      String(body.guestDisplayName || body.handle || '').trim() ||
      urlContext.hint ||
      'Meri Jaan';
    const creatorDisplayName =
      String(body.creatorDisplayName || '').trim() ||
      urlContext.creator ||
      'Your Partner';

    let invite = null;
    if (rawToken && rawToken !== 'otp-direct') {
      invite = state.invites.find((i) => i.inviteToken === rawToken);
    }
    if (!invite) {
      invite = state.invites.find(
        (i) =>
          i.verificationCode === suppliedOtp &&
          (i.status === 'pending' || i.status === 'active')
      );
    }

    if (invite && invite.status === 'revoked') {
      throw new Error('This QR code / invite link was revoked by your partner.');
    }
    if (invite && invite.verificationCode && invite.verificationCode !== suppliedOtp) {
      throw new Error('Invalid 6-digit OTP! Please enter the exact 6-digit code shown on your partner’s screen.');
    }
    if (!invite) {
      if (!rawToken || rawToken === 'otp-direct') {
        throw new Error(
          'No active host session matches this 6-digit OTP. Please check the 6-digit code on your partner’s screen.'
        );
      }
      if (sigFromUrl && !verifyOtpSignature(suppliedOtp, rawToken, sigFromUrl)) {
        throw new Error('Invalid 6-digit OTP for this invite link. Please check with your partner.');
      }
    }

    const effectiveToken = invite?.inviteToken || rawToken;
    const channelId = `chan_${String(effectiveToken).replace(/[^a-zA-Z0-9]/g, '').slice(0, 14)}`;

    saveSessionE2eeContext(effectiveToken, {
      verificationCode: suppliedOtp,
      locked: false
    });

    let conn = state.connections.find(
      (c) =>
        (c.inviteToken === effectiveToken || c.verificationCode === suppliedOtp) &&
        c.status === 'active'
    );

    if (!conn) {
      const nowIso = new Date().toISOString();
      conn = {
        id: 'conn_' + effectiveToken.slice(-8) + '_' + Date.now().toString(36),
        channelId,
        paired: true,
        status: 'active',
        creatorId: invite?.creatorId || null,
        creatorDisplayName: invite?.creatorDisplayName || creatorDisplayName,
        guestDisplayName,
        peerDisplayName: guestDisplayName,
        inviteToken: effectiveToken,
        verificationCode: suppliedOtp,
        keyFingerprint: deriveE2eeFingerprint(suppliedOtp),
        guestSessionToken: 'gst_' + Math.random().toString(36).slice(2, 14),
        createdAt: nowIso,
        approvedAt: nowIso
      };
      state.connections.unshift(conn);
      if (invite) invite.status = 'active';

      state.messages.push({
        id: 'msg_welcome_' + Date.now(),
        connectionId: conn.id,
        channelId,
        senderRole: 'guest',
        senderName: guestDisplayName,
        body: `Hau miyaan! ${guestDisplayName} connected to our private 1-on-1 room ♥ Ab baatein shuru karein?`,
        createdAt: nowIso
      });
    } else {
      conn.guestDisplayName = guestDisplayName;
      conn.channelId = channelId;
      conn.paired = true;
    }

    saveSessionE2eeContext(conn.id, {
      verificationCode: suppliedOtp,
      locked: false
    });

    writeSharedState(state);
    return {
      status: 'active',
      paired: true,
      channelId,
      guestSessionToken: conn.guestSessionToken,
      connection: {
        ...conn,
        peerDisplayName: conn.creatorDisplayName
      }
    };
  }

  if ((cleanPath === 'guest/me' || cleanPath === 'guest/session') && method === 'GET') {
    const conn = state.connections.find(
      (c) => c.guestSessionToken === token && c.status === 'active'
    );
    if (!conn) throw new Error('Guest session not active or revoked.');
    return {
      connection: {
        ...conn,
        peerDisplayName: conn.creatorDisplayName
      }
    };
  }

  if (cleanPath === 'connections' && method === 'GET') {
    const user = state.users.find((u) => u.sessionToken === token);
    return {
      connections: state.connections
        .filter(
          (c) =>
            c.status === 'active' &&
            (!user || !c.creatorId || c.creatorId === user.id)
        )
        .map((c) => ({
          ...c,
          peerDisplayName: c.guestDisplayName || 'Meri Jaan'
        }))
    };
  }

  const isGuestConn = parts[0] === 'guest' && parts[1] === 'connections';
  const isCreatorConn = parts[0] === 'connections';
  if (isGuestConn || isCreatorConn) {
    const connId = isGuestConn ? parts[2] : parts[1];
    const subRoute = isGuestConn ? parts[3] : parts[2];
    const senderRole = isGuestConn ? 'guest' : 'creator';
    const conn = state.connections.find((c) => c.id === connId);

    if (subRoute === 'close' && method === 'POST') {
      if (conn) conn.status = 'closed';
      for (const inv of state.invites) {
        if (conn && inv.inviteToken === conn.inviteToken) {
          inv.status = 'revoked';
        }
      }
      writeSharedState(state);
      return { ok: true };
    }

    if (subRoute === 'messages') {
      if (method === 'GET') {
        const oppositeRole = senderRole === 'guest' ? 'creator' : 'guest';
        let markedSeen = false;
        const seenNow = new Date().toISOString();
        for (const m of state.messages) {
          if (m.connectionId === connId && m.senderRole === oppositeRole && !m.seenAt) {
            m.seenAt = seenNow;
            markedSeen = true;
          }
        }
        if (markedSeen) {
          writeSharedState(state, { broadcast: false });
        }
        return {
          messages: state.messages.filter((m) => m.connectionId === connId)
        };
      }
      if (method === 'POST') {
        const voiceMeta = body.voiceMeta && body.voiceMeta.dataUrl ? body.voiceMeta : null;
        const photoMeta = body.photoMeta && body.photoMeta.dataUrl ? body.photoMeta : null;
        const rawText = String(body.body || body.text || '').trim();
        const text =
          rawText ||
          (voiceMeta ? '🎤 Sent a voice note ♥' : photoMeta ? '📷 Sent a live camera snap ♥' : '');
        const msg = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          connectionId: connId,
          senderRole,
          senderName:
            senderRole === 'guest'
              ? conn?.guestDisplayName || 'Meri Jaan'
              : conn?.creatorDisplayName || 'You',
          body: text,
          text,
          voiceMeta,
          photoMeta,
          e2ee: Boolean(body.e2ee || isE2eeCiphertext(text)),
          e2eeAlg: body.e2eeAlg || 'AES-256-GCM-PBKDF2',
          keyFingerprint: body.keyFingerprint || '',
          seenAt: null,
          createdAt: new Date().toISOString()
        };
        state.messages.push(msg);
        writeSharedState(state);
        return { message: msg };
      }
    }

    if (subRoute === 'orders') {
      if (method === 'GET') {
        return {
          orders: state.orders.filter(
            (o) => o.connectionId === connId && (!o.orderedByRole || o.orderedByRole === senderRole)
          )
        };
      }
      if (method === 'POST') {
        const brand =
          brandCatalog.find((b) => b.id === body.brandId) || brandCatalog[0];
        const item =
          brand.items.find((i) => i.id === body.itemId) || brand.items[0];
        const note = String(body.note || '').trim();
        const phoneNumber = String(body.phoneNumber || '')
          .replace(/\D/g, '')
          .slice(0, 10);
        const nowIso = new Date().toISOString();
        const orderedByName =
          senderRole === 'guest'
            ? conn?.guestDisplayName || 'Meri Jaan'
            : conn?.creatorDisplayName || 'Partner';

        // Strictly Private Order Record — NEVER push into shared chat messages!
        const order = {
          id: 'ord_' + Date.now(),
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
          orderedByRole: senderRole,
          orderedByName,
          privateOnly: true,
          createdAt: nowIso
        };
        state.orders.unshift(order);
        writeSharedState(state);
        return { order };
      }
    }

    if (subRoute === 'dates') {
      if (method === 'GET') {
        return {
          dates: state.dates.filter((d) => d.connectionId === connId)
        };
      }
      if (method === 'POST') {
        const nowIso = new Date().toISOString();
        const senderName =
          senderRole === 'guest'
            ? conn?.guestDisplayName || 'Meri Jaan'
            : conn?.creatorDisplayName || 'Partner';
        const dateMeta = {
          title: body.title || 'Candlelight Dinner Date ♥',
          location: body.location || 'Olive Bistro, Durgam Cheruvu',
          dateTime: body.dateTime || '',
          description: body.description || 'Just the two of us ♥',
          createdBy: senderName,
          createdAt: nowIso
        };
        state.dates.unshift({ connectionId: connId, ...dateMeta });
        state.messages.push({
          id: 'msg_date_' + Date.now(),
          connectionId: connId,
          senderRole,
          senderName,
          body: `🕯️ ${senderName} planned an upcoming date: "${dateMeta.title}" at ${dateMeta.location}! Tap below to add it directly to Google Calendar ♥`,
          dateMeta,
          createdAt: nowIso
        });
        writeSharedState(state);
        return { date: dateMeta };
      }
    }

    if (subRoute === 'photos') {
      if (method === 'GET') {
        return {
          photos: state.photos.filter((p) => p.connectionId === connId)
        };
      }
      if (method === 'POST') {
        const nowIso = new Date().toISOString();
        const senderName =
          senderRole === 'guest'
            ? conn?.guestDisplayName || 'Meri Jaan'
            : conn?.creatorDisplayName || 'Partner';
        const photo = {
          id: 'pho_' + Date.now(),
          connectionId: connId,
          dataUrl: body.dataUrl,
          caption: body.caption || `Shared by ${senderName}`,
          createdAt: nowIso
        };
        state.photos.unshift(photo);
        state.messages.push({
          id: 'msg_pho_' + Date.now(),
          connectionId: connId,
          senderRole,
          senderName,
          body: body.caption ? `📸 ${body.caption}` : `📸 Shared a private photo`,
          photoMeta: photo,
          createdAt: nowIso
        });
        writeSharedState(state);
        return { photo };
      }
    }
  }

  return { ok: true };
}

export function resolveActiveE2eeKeyContext(inviteToken = '', connectionId = '') {
  const fromConnScope = connectionId ? loadSessionE2eeContext(connectionId) : null;
  const fromInviteScope = inviteToken ? loadSessionE2eeContext(inviteToken) : null;
  const fromDefaultScope = loadSessionE2eeContext('default');
  const activeCtx = fromConnScope || fromInviteScope || fromDefaultScope;

  if (activeCtx?.locked) {
    return {
      verificationCode: activeCtx.verificationCode || '',
      customPassphrase: activeCtx.customPassphrase || '',
      locked: true,
      keyFingerprint: activeCtx.keyFingerprint || 'LOCKED'
    };
  }

  let verificationCode = String(activeCtx?.verificationCode || '')
    .replace(/\D/g, '')
    .slice(0, 6);
  const customPassphrase = String(activeCtx?.customPassphrase || '').trim();

  if (verificationCode.length !== 6 && typeof window !== 'undefined') {
    try {
      const cachedInviteRaw = localStorage.getItem(CREATOR_INVITE_CACHE_KEY);
      if (cachedInviteRaw) {
        const cachedInvite = JSON.parse(cachedInviteRaw);
        if (
          cachedInvite?.verificationCode &&
          (!inviteToken || cachedInvite.inviteToken === inviteToken)
        ) {
          verificationCode = String(cachedInvite.verificationCode)
            .replace(/\D/g, '')
            .slice(0, 6);
        }
      }
    } catch {
      // ignore
    }
  }

  if (verificationCode.length !== 6) {
    const state = readSharedState();
    const matchedConn =
      state.connections.find(
        (c) =>
          (connectionId && c.id === connectionId) ||
          (inviteToken && c.inviteToken === inviteToken)
      ) || state.connections.find((c) => c.status === 'active' && c.verificationCode);
    if (matchedConn?.verificationCode) {
      verificationCode = String(matchedConn.verificationCode)
        .replace(/\D/g, '')
        .slice(0, 6);
    } else {
      const matchedInv =
        (inviteToken && state.invites.find((i) => i.inviteToken === inviteToken)) ||
        state.invites.find((i) => i.status !== 'revoked' && i.verificationCode);
      if (matchedInv?.verificationCode) {
        verificationCode = String(matchedInv.verificationCode)
          .replace(/\D/g, '')
          .slice(0, 6);
      }
    }
  }

  return {
    verificationCode,
    customPassphrase,
    locked: false,
    keyFingerprint:
      verificationCode.length === 6
        ? deriveE2eeFingerprint(verificationCode, customPassphrase)
        : 'UNVERIFIED-KEY'
  };
}

function extractConnectionIdFromPath(cleanPath) {
  const parts = String(cleanPath || '').split('/').filter(Boolean);
  if (parts[0] === 'guest' && parts[1] === 'connections' && parts[2]) {
    return parts[2];
  }
  if (parts[0] === 'connections' && parts[1]) {
    return parts[1];
  }
  return '';
}

async function postProcessE2eeResponse(data, cleanPath, urlContext = {}) {
  if (!data || typeof data !== 'object') return data;
  const connId =
    data?.connection?.id ||
    extractConnectionIdFromPath(cleanPath) ||
    '';
  const invToken =
    data?.inviteToken ||
    data?.invite?.inviteToken ||
    data?.connection?.inviteToken ||
    urlContext?.token ||
    '';

  const saveOtpIfUnlocked = (scope, otp) => {
    if (!scope || !otp) return;
    const existing = loadSessionE2eeContext(scope);
    if (!existing?.locked) {
      saveSessionE2eeContext(scope, {
        verificationCode: otp,
        customPassphrase: existing?.customPassphrase || '',
        locked: false
      });
    }
  };

  if (data?.inviteToken && data?.verificationCode) {
    saveOtpIfUnlocked(data.inviteToken, data.verificationCode);
    saveOtpIfUnlocked('default', data.verificationCode);
  }

  if (data?.invite?.inviteToken && data?.invite?.verificationCode) {
    mirrorInviteLocally(data.invite);
    saveOtpIfUnlocked(data.invite.inviteToken, data.invite.verificationCode);
    saveOtpIfUnlocked('default', data.invite.verificationCode);
  }

  if (data?.connection?.verificationCode) {
    saveOtpIfUnlocked(data.connection.id, data.connection.verificationCode);
    saveOtpIfUnlocked(data.connection.inviteToken, data.connection.verificationCode);
    saveOtpIfUnlocked('default', data.connection.verificationCode);
  }

  if (Array.isArray(data?.connections)) {
    for (const c of data.connections) {
      if (c && c.id) {
        mirrorConnectionLocally(c);
        if (c.verificationCode) {
          saveOtpIfUnlocked(c.id, c.verificationCode);
          saveOtpIfUnlocked(c.inviteToken, c.verificationCode);
          saveOtpIfUnlocked('default', c.verificationCode);
        }
      }
    }
  }

  const keyCtx = resolveActiveE2eeKeyContext(invToken, connId);

  if (Array.isArray(data.messages)) {
    data.messages = await Promise.all(
      data.messages.map((m) => decryptMessageRecord(m, keyCtx))
    );
  }

  if (data.message && typeof data.message === 'object') {
    data.message = await decryptMessageRecord(data.message, keyCtx);
  }

  return data;
}

export async function resilientApiRequest(path, options = {}, token = '', urlContext = {}) {
  const rawStr = String(path || '');
  const qIndex = rawStr.indexOf('?');
  const querySuffix = qIndex >= 0 ? rawStr.slice(qIndex) : '';
  const cleanPath = (qIndex >= 0 ? rawStr.slice(0, qIndex) : rawStr)
    .replace(/^\/+/, '')
    .replace(/^api\/+/, '');
  const normalizedPath = `/${cleanPath}${querySuffix}`;
  const method = (options.method || 'GET').toUpperCase();
  const connId = extractConnectionIdFromPath(cleanPath);
  const requestOptions = { ...options };

  const priorityLane = classifyEndpointPriority(cleanPath, method);
  const headers = { ...(requestOptions.headers || {}) };
  if (!(requestOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  headers['X-Device-Id'] = getClientDeviceId();
  headers['X-AfterDark-Version'] = APP_VERSION;
  headers['X-AfterDark-Priority'] = priorityLane;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const cachedUserRaw =
      typeof window !== 'undefined' ? localStorage.getItem(CREATOR_USER_CACHE_KEY) : null;
    if (cachedUserRaw) {
      const cachedUser = JSON.parse(cachedUserRaw);
      if (cachedUser?.email) headers['X-User-Email'] = String(cachedUser.email);
      if (cachedUser?.displayName) headers['X-User-Name'] = String(cachedUser.displayName);
    }
  } catch {
    // ignore
  }

  const candidateBases = [];
  if (urlContext?.apiOrigin) {
    const cleanOrigin = String(urlContext.apiOrigin).replace(/\/+$/, '');
    if (
      typeof window !== 'undefined' &&
      cleanOrigin &&
      cleanOrigin !== window.location.origin
    ) {
      candidateBases.push(`${cleanOrigin}/api`);
    }
  }
  if (typeof window !== 'undefined' && /(^|\.)afterdark-guest-connector\.onrender\.com$/i.test(window.location.hostname)) {
    candidateBases.push(`${STABLE_PUBLIC_ORIGIN}/api`);
  }
  candidateBases.push('/api');

  let lastHttpError = null;
  let lastStatus = 0;

  for (const base of candidateBases) {
    try {
      const reqStartedAt = Date.now();
      const response = await executeWithTrafficControl(
        `${base}${normalizedPath}`,
        method,
        priorityLane,
        () =>
          fetch(`${base}${normalizedPath}`, {
            ...requestOptions,
            headers
          })
      );
      recordServerTrafficHeaders(response, Date.now() - reqStartedAt);
      const contentType = String(response.headers.get('content-type') || '');
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          if (data?.user && (data?.sessionToken || token)) {
            mirrorUserLocally(data.user, data.sessionToken || token);
          }
          if (data?.inviteToken && data?.verificationCode) {
            mirrorInviteLocally(data);
          }
          if (data?.connection && (data?.guestSessionToken || data?.paired)) {
            mirrorConnectionLocally(data.connection, data.guestSessionToken || '');
          }
          if (data?.message && typeof BroadcastChannel !== 'undefined') {
            try {
              const ch = new BroadcastChannel(CHANNEL_NAME);
              ch.postMessage({
                type: 'STATE_UPDATED',
                senderTabId: TAB_INSTANCE_ID,
                timestamp: Date.now()
              });
              ch.close();
            } catch {
              // ignore
            }
          }
          return await postProcessE2eeResponse(data, cleanPath, urlContext);
        }
        lastStatus = response.status;
        lastHttpError = new Error(data.error || 'Request failed');
      }
    } catch {
      // Network error on candidate base
    }
  }

  const isReadOrSessionCheck =
    method === 'GET' ||
    cleanPath === 'me' ||
    cleanPath === 'invites/current' ||
    cleanPath === 'connections';

  // If the server explicitly returned a 400, 401, 403, 409, or 410 validation/security error on a write/action route, throw it!
  if (lastHttpError && [400, 401, 403, 409, 410].includes(lastStatus) && !isReadOrSessionCheck) {
    throw lastHttpError;
  }

  const fallbackData = executeLocalFallback(path, requestOptions, token, urlContext);
  return await postProcessE2eeResponse(fallbackData, cleanPath, urlContext);
}
