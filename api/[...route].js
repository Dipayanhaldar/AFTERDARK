import { MongoClient } from 'mongodb';
import { randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
let clientPromise;
let emailIndexMigrationPromise;
const COOKIE = 'afterdark_session';
const DAY = 86400;
const json = (res, status, body) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
const GUEST_CHAT_ORIGIN = 'https://afterdark-private-chat.onrender.com';
function setGuestCors(req, res) {
  const origin = req.headers.origin;
  const allowed = origin && (origin === GUEST_CHAT_ORIGIN || origin === process.env.GUEST_CHAT_ORIGIN || origin === 'http://localhost:5173');
  if (!allowed) return;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
}
function hashGuestToken(value) {
  if (!process.env.JWT_SECRET) throw new Error('AUTH_CONFIG');
  return createHmac('sha256', process.env.JWT_SECRET).update(value).digest('hex');
}
const token = (n = 32) => randomBytes(n).toString('base64url');
function cookie(res, value, maxAge = DAY * 14) { res.setHeader('Set-Cookie', `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`); }
function sign(payload) { const secret = process.env.JWT_SECRET; if (!secret) throw new Error('AUTH_CONFIG'); const body = Buffer.from(JSON.stringify(payload)).toString('base64url'); return body + '.' + createHmac('sha256', secret).update(body).digest('base64url'); }
function verify(value) { try { const [body, sig] = value.split('.'); const expected = createHmac('sha256', process.env.JWT_SECRET).update(body).digest(); const actual = Buffer.from(sig, 'base64url'); if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null; const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() / 1000 ? p : null; } catch { return null; } }
function currentUser(req) { const raw = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1); return raw ? verify(decodeURIComponent(raw)) : null; }
async function db() { if (!process.env.MONGODB_URI) throw new Error('DB_CONFIG'); if (!clientPromise) { const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 }); clientPromise = client.connect(); } return (await clientPromise).db(process.env.MONGODB_DB || 'afterdark'); }
async function ensureUserEmailIndex(database) {
  if (!emailIndexMigrationPromise) emailIndexMigrationPromise = (async () => {
    const users = database.collection('users');
    let indexes = [];
    try { indexes = await users.listIndexes().toArray(); }
    catch (error) {
      // A fresh database may not have created the users collection yet.
      if (error.code !== 26 && error.codeName !== 'NamespaceNotFound') throw error;
    }
    // A normal unique index also indexes missing emails as null, which blocks a second guest account.
    const legacy = indexes.find(index => index.name === 'email_1' && index.unique && !index.partialFilterExpression && !index.sparse);
    if (legacy) {
      await users.dropIndex('email_1').catch(error => {
        if (error.code !== 27 && error.codeName !== 'IndexNotFound') throw error;
      });
    }
    indexes = indexes.filter(index => index.name !== 'email_1');
    const desired = indexes.find(index => index.name === 'users_email_unique');
    const desiredFilter = desired?.partialFilterExpression?.email?.$type === 'string';
    if (desired && (!desired.unique || !desiredFilter)) {
      await users.dropIndex('users_email_unique');
    }
    await users.createIndex({ email: 1 }, {
      unique: true,
      partialFilterExpression: { email: { $type: 'string' } },
      name: 'users_email_unique'
    });
  })();
  try { await emailIndexMigrationPromise; }
  catch (error) { emailIndexMigrationPromise = null; throw error; }
}
function cleanUser(u) { return { id: u._id.toString(), email: u.email || null, handle: u.handle || 'your-vibe', guest: Boolean(u.guest), createdAt: u.createdAt }; }
async function readBody(req, maxBytes = 20000) { let data = ''; for await (const chunk of req) { data += chunk; if (data.length > maxBytes) throw new Error('BODY_TOO_LARGE'); } return data ? JSON.parse(data) : {}; }
async function rateLimit(database, key, limit = 20) { const now = new Date(); const bucket = Math.floor(now.getTime() / 60000); const id = key + ':' + bucket; const c = database.collection('rate_limits'); await c.updateOne({ _id: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + 120000) } }, { upsert: true }); const row = await c.findOne({ _id: id }); if (row?.count > limit) return false; return true; }

export default async function handler(req, res) {
  setGuestCors(req, res);
  if (req.method === 'OPTIONS') { res.setHeader('Allow', 'GET,POST,PATCH,DELETE,OPTIONS'); return res.status(204).end(); }
  let database;
  let action = 'initialization';
  const requestId = randomBytes(6).toString('hex');
  try {
    const url = new URL(req.url, 'https://afterdark.invalid');
    const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    action = parts.join('/') || 'root';
    database = await db();

    // Lightweight diagnostic route: verify database connectivity without running
    // schema migrations, rate limits, or other application setup.
    if (action === 'health' && req.method === 'GET') {
      await database.command({ ping: 1 });
      return json(res, 200, { ok: true, service: 'afterdark-api', database: 'connected' });
    }

    // Public invite previews are intentionally served before schema/index maintenance.
    // A guest should not have to wait for unrelated collection migrations to load a shared invite.
    if (parts[0] === 'invites' && parts[1] && parts.length === 2 && req.method === 'GET') {
      const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim().slice(0, 80);
      if (!await rateLimit(database, 'invite-preview:' + ip, 60)) return json(res, 429, { error: 'Too many invite checks. Wait a minute, then try again.' });
      if (!process.env.JWT_SECRET) return json(res, 503, { error: 'Invite service is temporarily unavailable. Please try again shortly.' });
      const raw = parts[1];
      const hash = createHmac('sha256', process.env.JWT_SECRET).update(raw).digest('hex');
      const invite = await database.collection('invites').findOne({ tokenHash: hash, expiresAt: { $gt: new Date() } });
      if (!invite || invite.status === 'ignored' || invite.status === 'revoked') return json(res, 404, { error: 'This invite has expired or is no longer available.' });
      const inviteOwner = await database.collection('users').findOne({ _id: invite.ownerId }, { projection: { handle: 1 } });
      let ownInvite = false;
      const session = currentUser(req);
      if (session?.sub) { try { ownInvite = invite.ownerId.equals(new (await import('mongodb')).ObjectId(session.sub)); } catch {} }
      return json(res, 200, { invite: { status: invite.status, ownInvite, handle: inviteOwner?.handle || 'your person' } });
    }

    // Email-index migration is maintenance, not a prerequisite for reading a public invite.
    // A legacy/conflicting index must not make invite links fail before their lookup runs.
    try { await ensureUserEmailIndex(database); }
    catch (error) {
      console.error('AFTERDARK email index migration failed:', {
        requestId, action, code: error?.code || null,
        codeName: error?.codeName || null, message: error?.message || 'unknown'
      });
    }
    // Index maintenance must not take down every API route when one legacy index has
    // conflicting options. Log each failure and keep serving requests; fix the index
    // separately without turning guest invite loads into a generic 500.
    const indexTasks = [
      ['invites.tokenHash', () => database.collection('invites').createIndex({ tokenHash: 1 }, { unique: true })],
      ['invites.expiresAt', () => database.collection('invites').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })],
      ['connections.pairKey', () => database.collection('connections').createIndex({ pairKey: 1 }, { unique: true })],
      ['messages.connectionId_createdAt', () => database.collection('messages').createIndex({ connectionId: 1, createdAt: 1 })],
      ['messages.createdAt_ttl', () => database.collection('messages').createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * DAY })],
      ['rate_limits.expiresAt', () => database.collection('rate_limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })],
      ['password_resets.expiresAt', () => database.collection('password_resets').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })],
      ['date_plans.connectionId', () => database.collection('date_plans').createIndex({ connectionId: 1 }, { unique: true })],
      ['moments.connectionId_createdAt', () => database.collection('moments').createIndex({ connectionId: 1, createdAt: -1 })],
      ['moments.answer_unique', () => database.collection('moments').createIndex({ connectionId: 1, type: 1, dayKey: 1, userId: 1 }, { unique: true, partialFilterExpression: { type: 'answer' } })],
      ['reports.createdAt', () => database.collection('reports').createIndex({ createdAt: 1 })],
      ['guest_sessions.expiresAt', () => database.collection('guest_sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })]
    ];
    const indexResults = await Promise.allSettled(indexTasks.map(([, create]) => create()));
    indexResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error('AFTERDARK index setup failed:', {
          index: indexTasks[index][0],
          code: result.reason?.code || null,
          codeName: result.reason?.codeName || null,
          message: result.reason?.message || 'unknown'
        });
      }
    });
    const body = ['POST','PATCH','DELETE'].includes(req.method) ? await readBody(req, parts[0] === 'connections' && parts[2] === 'moments' ? 1500000 : 20000) : {};
    const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim().slice(0, 80);
    if (!await rateLimit(database, ip, ['login','register','forgot-password','reset-password'].includes(action) ? 8 : 45)) return json(res, 429, { error: 'Too many tries. Take a breath and try again shortly.' });

    if (action === 'register' && req.method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const handle = String(body.handle || '').trim().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10 || password.length > 128 || body.adult !== true || body.consent !== true) return json(res, 400, { error: 'Check your email, use 10+ password characters, and confirm you are 18+.' });
      const salt = randomBytes(16).toString('hex');
      const hash = (await scrypt(password, salt, 64)).toString('hex');
      const previousSession = currentUser(req);
      if (previousSession?.guest) {
        const { ObjectId } = await import('mongodb');
        const guestId = new ObjectId(previousSession.sub);
        const guestUser = await database.collection('users').findOne({ _id: guestId, guest: true });
        if (guestUser) {
          const chosenHandle = handle || guestUser.handle || 'your-vibe';
          await database.collection('users').updateOne({ _id: guestId }, { $set: { email, passwordHash: salt + ':' + hash, handle: chosenHandle, guest: false, adultConfirmedAt: new Date(), consentAt: new Date() }, $unset: { guestCreatedAt: '' } });
          const upgraded = { ...guestUser, email, handle: chosenHandle, guest: false };
          cookie(res, sign({ sub: guestId.toString(), exp: Math.floor(Date.now()/1000) + DAY*14 }));
          return json(res, 200, { user: cleanUser(upgraded) });
        }
      }
      try { const result = await database.collection('users').insertOne({ email, passwordHash: salt + ':' + hash, handle: handle || 'your-vibe', createdAt: new Date(), adultConfirmedAt: new Date(), blockedUsers: [] }); const user = { _id: result.insertedId, email, handle: handle || 'your-vibe', createdAt: new Date() }; cookie(res, sign({ sub: user._id.toString(), exp: Math.floor(Date.now()/1000) + DAY*14 })); return json(res, 201, { user: cleanUser(user) }); }
      catch (e) { if (e.code === 11000) return json(res, 409, { error: 'That email already has an account. Try signing in instead.' }); throw e; }
    }
    if (action === 'login' && req.method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase(); const password = String(body.password || '');
      const user = await database.collection('users').findOne({ email });
      if (!user?.passwordHash) return json(res, 401, { error: 'Email or password doesn’t match. Check it and try again.' });
      const [salt, stored] = user.passwordHash.split(':'); const actual = (await scrypt(password, salt, 64)).toString('hex');
      if (stored.length !== actual.length || !timingSafeEqual(Buffer.from(stored), Buffer.from(actual))) return json(res, 401, { error: 'Email or password doesn’t match. Check it and try again.' });
      const previousSession = currentUser(req);
      if (previousSession?.guest) {
        const { ObjectId } = await import('mongodb');
        const guestId = new ObjectId(previousSession.sub);
        const connections = database.collection('connections');
        const guestConnections = await connections.find({ memberIds: guestId }).toArray();
        for (const c of guestConnections) {
          const otherId = c.memberIds.find(id => !id.equals(guestId));
          if (!otherId || otherId.equals(user._id)) continue;
          const pairKey = [user._id.toString(), otherId.toString()].sort().join(':');
          const existing = await connections.findOne({ pairKey });
          if (existing) {
            await database.collection('messages').updateMany({ connectionId: c._id }, { $set: { connectionId: existing._id } });
            await database.collection('moments').updateMany({ connectionId: c._id }, { $set: { connectionId: existing._id } });
            await database.collection('date_plans').deleteOne({ connectionId: c._id });
            await connections.deleteOne({ _id: c._id });
          } else {
            const patch = { pairKey, memberIds: [user._id, otherId] };
            if (c.creatorId?.equals(guestId)) patch.creatorId = user._id;
            if (c.recipientId?.equals(guestId)) patch.recipientId = user._id;
            await connections.updateOne({ _id: c._id }, { $set: patch });
            await database.collection('moments').updateMany({ connectionId: c._id, userId: guestId }, { $set: { userId: user._id } });
            const plan = await database.collection('date_plans').findOne({ connectionId: c._id });
            if (plan?.choices?.[guestId.toString()]) {
              const choices = { ...plan.choices, [user._id.toString()]: plan.choices[guestId.toString()] };
              delete choices[guestId.toString()];
              await database.collection('date_plans').updateOne({ _id: plan._id }, { $set: { choices } });
            }
          }
        }
        await database.collection('invites').updateMany({ ownerId: guestId }, { $set: { ownerId: user._id } });
        await database.collection('invites').updateMany({ recipientId: guestId }, { $set: { recipientId: user._id } });
        await database.collection('reports').updateMany({ reporterId: guestId }, { $set: { reporterId: user._id } });
        await database.collection('reports').updateMany({ targetUserId: guestId }, { $set: { targetUserId: user._id } });
        await database.collection('users').deleteOne({ _id: guestId, guest: true });
      }
      cookie(res, sign({ sub: user._id.toString(), exp: Math.floor(Date.now()/1000) + DAY*14 })); return json(res, 200, { user: cleanUser(user) });
    }
    if (action === 'forgot-password' && req.method === 'POST') {
      if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) return json(res, 503, { error: 'Password reset emails aren’t ready yet. Please try again later.' });
      const email = String(body.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Enter a valid email address.' });
      const generic = { message: 'If that email is registered, a reset link will arrive shortly. Check your inbox and spam folder.' };
      const existing = await database.collection('users').findOne({ email }, { projection: { _id: 1 } });
      if (!existing) return json(res, 200, generic);
      const raw = token(32);
      const tokenHash = createHmac('sha256', process.env.JWT_SECRET || '').update(raw).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await database.collection('password_resets').deleteMany({ userId: existing._id });
      await database.collection('password_resets').insertOne({ tokenHash, userId: existing._id, createdAt: new Date(), expiresAt });
      const rawBaseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : '');
      const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
      if (!baseUrl) { await database.collection('password_resets').deleteOne({ tokenHash }); return json(res, 503, { error: 'Password reset emails aren’t ready yet. Please try again later.' }); }
      const resetUrl = baseUrl + '/?token=' + encodeURIComponent(raw);
      const mail = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL,
          to: [email],
          subject: 'Reset your AFTERDARK password 🌙',
          html: '<div style="font-family:Arial,sans-serif;background:#160f1c;color:#f8edf6;padding:32px;border-radius:18px"><h1 style="color:#ff91c4">AFTERDARK 🌙</h1><h2>Password reset requested?</h2><p>Tap below to choose a new password. This link expires in 60 minutes and can only be used once.</p><p><a href="' + resetUrl + '" style="display:inline-block;background:#ff91c4;color:#241126;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Reset my password</a></p><p>If you didn’t request this, ignore this email. Your password won’t change.</p></div>',
          text: 'Reset your AFTERDARK password using this link (expires in 60 minutes): ' + resetUrl + '\\nIf you didn’t request this, ignore this email.'
        })
      });
      if (!mail.ok) { await database.collection('password_resets').deleteOne({ tokenHash }); console.error('AFTERDARK reset email provider failed:', mail.status); return json(res, 503, { error: 'We couldn’t send the reset email just now. Try again shortly.' }); }
      return json(res, 200, generic);
    }
    if (action === 'reset-password' && req.method === 'POST') {
      const raw = String(body.token || '');
      const password = String(body.password || '');
      if (!raw || password.length < 10 || password.length > 128) return json(res, 400, { error: 'Use the reset link and choose a password with at least 10 characters.' });
      const tokenHash = createHmac('sha256', process.env.JWT_SECRET || '').update(raw).digest('hex');
      const resets = database.collection('password_resets');
      const reset = await resets.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
      if (!reset) return json(res, 400, { error: 'This reset link has expired or was already used. Request a fresh one.' });
      const salt = randomBytes(16).toString('hex');
      const hash = (await scrypt(password, salt, 64)).toString('hex');
      await database.collection('users').updateOne({ _id: reset.userId }, { $set: { passwordHash: salt + ':' + hash, passwordChangedAt: new Date() } });
      await resets.deleteMany({ userId: reset.userId });
      cookie(res, '', 0);
      return json(res, 200, { message: 'Password updated. Sign in with your new password.' });
    }
    if (action === 'logout' && req.method === 'POST') { cookie(res, '', 0); return json(res, 200, { ok: true }); }
    const session = currentUser(req);

    // The invite URL alone never authorizes access to a chat after approval.
    if (parts[0] === 'guest' && parts[1] === 'invites' && parts[2] && parts[3] === 'approve' && req.method === 'POST') {
      if (body.adult !== true) return json(res, 400, { error: 'Please confirm you are 18 or older before opening a chat.' });
      if (!process.env.JWT_SECRET) return json(res, 503, { error: 'Invite service is temporarily unavailable.' });
      const rawInvite = parts[2];
      const inviteHash = hashGuestToken(rawInvite);
      const invites = database.collection('invites');
      const invite = await invites.findOne({ tokenHash: inviteHash, expiresAt: { $gt: new Date() }, status: 'pending' });
      if (!invite) return json(res, 409, { error: 'This invite has already been used, expired, or is no longer available. The link alone cannot open a private chat.' });
      if (!await rateLimit(database, 'invite-code:' + invite._id.toString(), 5)) return json(res, 429, { error: 'Too many private-code attempts for this invite. Wait a minute before trying again.' });
      const suppliedCode = String(body.code || '').replace(/\\s/g, '');
      if (!/^\\d{6}$/.test(suppliedCode) || !invite.codeHash) return json(res, 401, { error: 'Enter the six-digit private code provided separately by the sender. The invitation link alone is not enough.' });
      const expectedCodeHash = createHmac('sha256', process.env.JWT_SECRET).update(suppliedCode).digest('hex');
      if (!timingSafeEqual(Buffer.from(expectedCodeHash), Buffer.from(invite.codeHash))) return json(res, 401, { error: 'That private code does not match. Ask the sender for the code again.' });
      const ownerActive = await database.collection('connections').findOne({ memberIds: invite.ownerId, status: 'approved' }, { projection: { _id: 1 } });
      if (ownerActive) return json(res, 409, { error: 'This person already has an active AFTERDARK chat. One connection at a time.' });
      const reserved = await invites.updateOne(
        { _id: invite._id, status: 'pending', expiresAt: { $gt: new Date() } },
        { $set: { status: 'approving', approvalStartedAt: new Date() } }
      );
      if (!reserved.modifiedCount) return json(res, 409, { error: 'This invite has just been accepted or is no longer available.' });
      let guestId = null;
      let connectionId = null;
      let guestSessionToken = null;
      try {
        const { ObjectId } = await import('mongodb');
        const guestHandle = 'guest-' + token(3).slice(0, 5);
        const created = await database.collection('users').insertOne({
          handle: guestHandle, guest: true, createdAt: new Date(), guestCreatedAt: new Date(),
          adultConfirmedAt: new Date(), blockedUsers: []
        });
        guestId = created.insertedId;
        const pair = [invite.ownerId.toString(), guestId.toString()].sort();
        const pairKey = pair.join(':');
        const existing = await database.collection('connections').findOne({ pairKey, status: 'approved' });
        if (existing) throw new Error('ACTIVE_CONNECTION_EXISTS');
        const createdConnection = await database.collection('connections').insertOne({
          pairKey, memberIds: pair.map(id => new ObjectId(id)), creatorId: invite.ownerId,
          recipientId: guestId, status: 'approved', createdAt: new Date()
        });
        connectionId = createdConnection.insertedId;
        guestSessionToken = token(32);
        const expiresAt = new Date(Date.now() + 30 * DAY * 1000);
        await database.collection('guest_sessions').insertOne({
          tokenHash: hashGuestToken(guestSessionToken), userId: guestId, connectionId,
          createdAt: new Date(), expiresAt
        });
        const changed = await invites.updateOne(
          { _id: invite._id, status: 'approving' },
          { $set: { status: 'approved', recipientId: guestId, connectionId, respondedAt: new Date() }, $unset: { approvalStartedAt: '' } }
        );
        if (!changed.modifiedCount) throw new Error('INVITE_RESERVATION_LOST');
        const owner = await database.collection('users').findOne({ _id: invite.ownerId }, { projection: { handle: 1 } });
        return json(res, 200, {
          status: 'approved', guestSessionToken, expiresAt,
          user: { id: guestId.toString(), handle: guestHandle, guest: true },
          connection: { id: connectionId.toString(), handle: owner?.handle || 'your person', role: 'invitee' }
        });
      } catch (error) {
        if (guestSessionToken) await database.collection('guest_sessions').deleteOne({ tokenHash: hashGuestToken(guestSessionToken) }).catch(() => {});
        if (connectionId) await database.collection('connections').deleteOne({ _id: connectionId }).catch(() => {});
        if (guestId) await database.collection('users').deleteOne({ _id: guestId }).catch(() => {});
        await invites.updateOne({ _id: invite._id, status: 'approving' }, { $set: { status: 'pending' }, $unset: { approvalStartedAt: '' } }).catch(() => {});
        if (error?.message === 'ACTIVE_CONNECTION_EXISTS') return json(res, 409, { error: 'This person already has an active AFTERDARK chat. One connection at a time.' });
        throw error;
      }
    }

    if (parts[0] === 'guest' && parts[1] === 'session' && req.method === 'GET') {
      const suppliedToken = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
      if (!suppliedToken) return json(res, 401, { error: 'This private chat session is missing. Reopen your invite on the device where you accepted it.' });
      const guestSession = await database.collection('guest_sessions').findOne({ tokenHash: hashGuestToken(suppliedToken), expiresAt: { $gt: new Date() } });
      if (!guestSession) return json(res, 401, { error: 'This private chat session has expired. Ask the sender for a fresh invite.' });
      const { ObjectId } = await import('mongodb');
      const guestId = guestSession.userId instanceof ObjectId ? guestSession.userId : new ObjectId(guestSession.userId);
      const connectionId = guestSession.connectionId instanceof ObjectId ? guestSession.connectionId : new ObjectId(guestSession.connectionId);
      const connection = await database.collection('connections').findOne({ _id: connectionId, memberIds: guestId, status: 'approved' });
      if (!connection) return json(res, 403, { error: 'This private chat is no longer available.' });
      const guestUser = await database.collection('users').findOne({ _id: guestId });
      const ownerId = connection.memberIds.find(id => !id.equals(guestId));
      const owner = ownerId ? await database.collection('users').findOne({ _id: ownerId }, { projection: { handle: 1 } }) : null;
      return json(res, 200, {
        user: guestUser ? cleanUser(guestUser) : { id: guestId.toString(), handle: 'guest', guest: true },
        connection: { id: connectionId.toString(), handle: owner?.handle || 'your person', role: 'invitee' },
        expiresAt: guestSession.expiresAt
      });
    }

    if (parts[0] === 'guest' && parts[1] === 'connections' && parts[2] && parts[3]) {
      const suppliedToken = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
      if (!suppliedToken) return json(res, 401, { error: 'This private chat session is missing.' });
      const { ObjectId } = await import('mongodb');
      let connectionId;
      try { connectionId = new ObjectId(parts[2]); } catch { return json(res, 400, { error: 'That connection link is not valid.' }); }
      const guestSession = await database.collection('guest_sessions').findOne({
        tokenHash: hashGuestToken(suppliedToken), connectionId, expiresAt: { $gt: new Date() }
      });
      if (!guestSession) return json(res, 403, { error: 'This session cannot access that private chat.' });
      const guestId = guestSession.userId instanceof ObjectId ? guestSession.userId : new ObjectId(guestSession.userId);
      const connection = await database.collection('connections').findOne({ _id: connectionId, memberIds: guestId, status: 'approved' });
      if (!connection) return json(res, 403, { error: 'This chat is not available.' });
      const route = parts[3];
      if (route === 'messages') {
        const messages = database.collection('messages');
        if (req.method === 'GET') {
          const rows = await messages.find({ connectionId }).sort({ createdAt: 1 }).limit(100).toArray();
          return json(res, 200, { messages: rows.map(m => ({ id: m._id.toString(), text: m.text, senderId: m.senderId.toString(), createdAt: m.createdAt })) });
        }
        if (req.method === 'POST') {
          const text = String(body.text || '').trim();
          if (!text || text.length > 2000) return json(res, 400, { error: 'Keep your message between 1 and 2,000 characters.' });
          const result = await messages.insertOne({ connectionId, senderId: guestId, text, createdAt: new Date() });
          return json(res, 201, { message: { id: result.insertedId.toString(), text, senderId: guestId.toString(), createdAt: new Date() } });
        }
        return json(res, 405, { error: 'This action is not available to guest users.' });
      }
      if (route === 'moments' && req.method === 'GET') {
        const rows = await database.collection('moments').find({ connectionId }).sort({ createdAt: -1 }).limit(60).toArray();
        const dayKey = String(url.searchParams.get('dayKey') || '').slice(0, 10);
        const answers = dayKey ? await database.collection('moments').find({ connectionId, type: 'answer', dayKey }).toArray() : [];
        const serialize = row => ({ id: row._id.toString(), type: row.type, text: row.text || '', imageData: row.imageData || null, userId: row.userId.toString(), promptId: row.promptId || null, dayKey: row.dayKey || null, createdAt: row.createdAt, updatedAt: row.updatedAt || null });
        return json(res, 200, { moments: rows.map(serialize), answers: answers.map(serialize), currentUserId: guestId.toString() });
      }
      if (route === 'date-plan' && req.method === 'GET') {
        const plan = await database.collection('date_plans').findOne({ connectionId });
        const otherId = connection.memberIds.find(id => !id.equals(guestId));
        const choices = plan?.choices || {};
        const serialize = row => row ? { choices, lockedPlaceId: row.lockedPlaceId || null, lockedDateTime: row.lockedDateTime || null, myChoice: choices[guestId.toString()] || null, theirChoice: otherId ? choices[otherId.toString()] || null : null } : null;
        return json(res, 200, { plan: serialize(plan) });
      }
      return json(res, 403, { error: 'Guest access is read-only for this section.' });
    }

    if (parts[0] === 'invites' && parts[1] && parts[2] && ['approve','ignore'].includes(parts[2]) && req.method === 'POST') {
      const hash = createHmac('sha256', process.env.JWT_SECRET).update(parts[1]).digest('hex');
      const invites = database.collection('invites');
      const invite = await invites.findOne({ tokenHash: hash, expiresAt: { $gt: new Date() } });
      if (!invite) return json(res, 404, { error: 'This invite has expired or is no longer available.' });
      // Make approval safe to retry when the first response was interrupted.
      // Only the already-approved recipient session can retrieve the existing connection.
      if (invite.status === 'approved' && invite.connectionId && session?.sub && invite.recipientId) {
        let approvedRecipientId = null;
        try { approvedRecipientId = new (await import('mongodb')).ObjectId(session.sub); } catch {}
        if (approvedRecipientId && invite.recipientId.equals(approvedRecipientId)) {
          const existingConnection = await database.collection('connections').findOne({
            _id: invite.connectionId, memberIds: approvedRecipientId, status: 'approved'
          });
          const approvedUser = await database.collection('users').findOne({ _id: approvedRecipientId });
          const owner = await database.collection('users').findOne({ _id: invite.ownerId }, { projection: { handle: 1 } });
          if (existingConnection && approvedUser) return json(res, 200, {
            status: 'approved', user: cleanUser(approvedUser),
            connection: { id: existingConnection._id.toString(), handle: owner?.handle || 'your person', role: 'invitee' },
            recovered: true
          });
        }
      }
      if (invite.status !== 'pending') return json(res, 409, { error: 'This invite has already been answered. Refresh the page to see its current status.' });
      let recipientId = null;
      if (session?.sub) { try { recipientId = new (await import('mongodb')).ObjectId(session.sub); } catch {} }
      if (parts[2] === 'ignore') {
        await invites.updateOne({ _id: invite._id, status: 'pending' }, { $set: { status: 'ignored', ...(recipientId ? { recipientId } : {}), respondedAt: new Date() } });
        return json(res, 200, { status: 'ignored' });
      }
      if (body.adult !== true) return json(res, 400, { error: 'Please confirm you are 18 or older before opening a chat.' });
      const { ObjectId } = await import('mongodb');
      if (!recipientId) {
        const guestHandle = 'guest-' + token(3).slice(0, 5);
        const created = await database.collection('users').insertOne({ handle: guestHandle, guest: true, createdAt: new Date(), guestCreatedAt: new Date(), adultConfirmedAt: new Date(), blockedUsers: [] });
        recipientId = created.insertedId;
        cookie(res, sign({ sub: recipientId.toString(), guest: true, exp: Math.floor(Date.now()/1000) + DAY*14 }));
      }
      if (invite.ownerId.equals(recipientId)) return json(res, 403, { error: 'You can’t approve your own invite. Send it to your person.' });
      const existingActiveConnection = await database.collection('connections').findOne({ memberIds: recipientId, status: 'approved' });
      if (existingActiveConnection && !existingActiveConnection.memberIds.some(id => id.equals(invite.ownerId))) {
        return json(res, 409, { error: 'Plot twist denied: you already have an active AFTERDARK chat. One connection at a time — no double-dating side quests. 😭🔒' });
      }
      const recipient = await database.collection('users').findOne({ _id: recipientId });
      if (!recipient) return json(res, 401, { error: 'This session has expired. Open the invite again.' });
      const pair = [invite.ownerId.toString(), recipientId.toString()].sort();
      const pairKey = pair.join(':');
      const connection = await database.collection('connections').findOneAndUpdate({ pairKey }, { $setOnInsert: { pairKey, memberIds: pair.map(id => new ObjectId(id)), creatorId: invite.ownerId, recipientId, status: 'approved', createdAt: new Date() } }, { upsert: true, returnDocument: 'after' });
      const connectionDoc = connection?._id ? connection : await database.collection('connections').findOne({ pairKey });
      if (connectionDoc?._id) await database.collection('connections').updateOne({ _id: connectionDoc._id, creatorId: { $exists: false } }, { $set: { creatorId: invite.ownerId, recipientId } });
      await invites.updateOne({ _id: invite._id, status: 'pending' }, { $set: { status: 'approved', recipientId, connectionId: connectionDoc?._id, respondedAt: new Date() } });
      const owner = await database.collection('users').findOne({ _id: invite.ownerId }, { projection: { handle: 1 } });
      return json(res, 200, {
        status: 'approved',
        user: cleanUser(recipient),
        connection: connectionDoc?._id ? { id: connectionDoc._id.toString(), handle: owner?.handle || 'your person', role: 'invitee' } : null
      });
    }
    if (action === 'me' && req.method === 'GET') { if (!session) return json(res, 200, { user: null }); const user = await database.collection('users').findOne({ _id: new (await import('mongodb')).ObjectId(session.sub) }); return json(res, 200, { user: user ? cleanUser(user) : null }); }
    if (!session) return json(res, 401, { error: 'Sign in to continue.' });
    const { ObjectId } = await import('mongodb'); const userId = new ObjectId(session.sub);
    const user = await database.collection('users').findOne({ _id: userId });
    if (!user) return json(res, 401, { error: 'Please sign in again.' });

    if (action === 'invites' && req.method === 'POST') {
      const now = new Date();
      const activeConnection = await database.collection('connections').findOne({ memberIds: userId, status: 'approved' }, { projection: { _id: 1 } });
      if (activeConnection) return json(res, 409, { error: 'One situationship at a time, bestie. You already have an active chat — no bonus boo QR codes. 😭🔒' });
      const pendingInvite = await database.collection('invites').findOne({ ownerId: userId, status: 'pending', expiresAt: { $gt: now } }, { projection: { _id: 1 } });
      if (pendingInvite) return json(res, 409, { error: 'Your invite is already out in the wild. No second QR until this plot resolves, bestie. 💌⏳' });
      const raw = token(32); const inviteCode = String(randomInt(100000, 1000000)); const expiresAt = new Date(Date.now() + 7 * DAY * 1000);
      await database.collection('invites').insertOne({ tokenHash: createHmac('sha256', process.env.JWT_SECRET).update(raw).digest('hex'), codeHash: createHmac('sha256', process.env.JWT_SECRET).update(inviteCode).digest('hex'), ownerId: userId, status: 'pending', createdAt: new Date(), expiresAt });
      return json(res, 201, { invite: raw, inviteCode, expiresAt });
    }
    if (action === 'connections' && req.method === 'GET') {
      const connections = await database.collection('connections').find({ memberIds: userId, status: 'approved' }).toArray();
      const rows = await Promise.all(connections.map(async c => {
        const otherId = c.memberIds.find(id => !id.equals(userId));
        const other = otherId ? await database.collection('users').findOne({ _id: otherId }, { projection: { email: 1, handle: 1 } }) : null;
        let role = c.recipientId ? (c.recipientId.equals(userId) ? 'invitee' : 'creator') : 'creator';
        if (!c.recipientId) {
          const originalInvite = await database.collection('invites').findOne({ connectionId: c._id, status: 'approved' }, { sort: { respondedAt: 1 } });
          if (originalInvite?.recipientId?.equals(userId)) role = 'invitee';
        }
        return { id: c._id.toString(), handle: other?.handle || 'your person', role };
      }));
      return json(res, 200, { connections: rows });
    }
    if (parts[0] === 'connections' && parts[1] && parts[2] === 'date-plan') {
      let connectionId;
      try { connectionId = new ObjectId(parts[1]); } catch { return json(res, 400, { error: 'That connection link is not valid.' }); }
      const connection = await database.collection('connections').findOne({ _id: connectionId, memberIds: userId, status: 'approved' });
      if (!connection) return json(res, 403, { error: 'Date planning is only available for an approved connection.' });
      const plans = database.collection('date_plans');
      const otherId = connection.memberIds.find(id => !id.equals(userId));
      const serialize = row => {
        const choices = row?.choices || {};
        return row ? { choices, lockedPlaceId: row.lockedPlaceId || null, lockedDateTime: row.lockedDateTime || null, myChoice: choices[userId.toString()] || null, theirChoice: otherId ? choices[otherId.toString()] || null : null } : null;
      };
      if (req.method === 'GET') return json(res, 200, { plan: serialize(await plans.findOne({ connectionId })) });
      if (req.method === 'POST') {
        const placeId = String(body.placeId || '');
        const dateTime = String(body.dateTime || '');
        const allowed = ['necklace-road','durgam-cheruvu','charminar','golconda','chowmahalla','lumbini-park','paradise-biryani','ramoji-film-city'];
        const parsed = new Date(dateTime);
        if (!allowed.includes(placeId) || !dateTime || Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) return json(res, 400, { error: 'Choose a listed public place and a future date/time.' });
        const current = await plans.findOne({ connectionId });
        if (current?.lockedPlaceId) return json(res, 409, { error: 'This mutual plan is already locked.' });
        const choices = { ...(current?.choices || {}), [userId.toString()]: { placeId, dateTime } };
        const otherChoice = otherId ? choices[otherId.toString()] : null;
        const matches = otherChoice && otherChoice.placeId === placeId && otherChoice.dateTime === dateTime;
        const update = { connectionId, choices, updatedAt: new Date() };
        if (matches) { update.lockedPlaceId = placeId; update.lockedDateTime = dateTime; }
        else { update.lockedPlaceId = null; update.lockedDateTime = null; }
        await plans.updateOne({ connectionId }, { $set: update }, { upsert: true });
        return json(res, 200, { plan: serialize(await plans.findOne({ connectionId })) });
      }
    }
    if (parts[0] === 'connections' && parts[1] && parts[2] === 'block' && req.method === 'POST') {
      let connectionId;
      try { connectionId = new ObjectId(parts[1]); } catch { return json(res, 400, { error: 'That connection link is not valid.' }); }
      const connection = await database.collection('connections').findOne({ _id: connectionId, memberIds: userId, status: 'approved' });
      if (!connection) return json(res, 404, { error: 'This connection is already closed.' });
      const otherId = connection.memberIds.find(id => !id.equals(userId));
      await database.collection('users').updateOne({ _id: userId }, { $addToSet: { blockedUsers: otherId } });
      await database.collection('connections').updateOne({ _id: connectionId, status: 'approved' }, { $set: { status: 'blocked', blockedBy: userId, blockedAt: new Date() } });
      await database.collection('date_plans').deleteOne({ connectionId });
      return json(res, 200, { ok: true });
    }
    if (parts[0] === 'connections' && parts[1] && parts[2] === 'report' && req.method === 'POST') {
      let connectionId;
      try { connectionId = new ObjectId(parts[1]); } catch { return json(res, 400, { error: 'That connection link is not valid.' }); }
      const connection = await database.collection('connections').findOne({ _id: connectionId, memberIds: userId });
      if (!connection) return json(res, 404, { error: 'This connection could not be found.' });
      const reason = String(body.reason || '').trim().slice(0, 1000);
      if (!reason) return json(res, 400, { error: 'Add a short reason for the report.' });
      const targetUserId = connection.memberIds.find(id => !id.equals(userId));
      await database.collection('reports').insertOne({ connectionId, reporterId: userId, targetUserId, reason, createdAt: new Date(), status: 'new' });
      return json(res, 201, { ok: true });
    }
    if (parts[0] === 'connections' && parts[1] && parts[2] === 'moments') {
      let connectionId;
      try { connectionId = new ObjectId(parts[1]); } catch { return json(res, 400, { error: 'That connection link is not valid.' }); }
      const connection = await database.collection('connections').findOne({ _id: connectionId, memberIds: userId, status: 'approved' });
      if (!connection) return json(res, 403, { error: 'Shared moments are only available for an approved connection.' });
      const moments = database.collection('moments');
      if (parts.length === 3 && req.method === 'GET') {
        const dayKey = String(url.searchParams.get('dayKey') || '').slice(0, 10);
        const rows = await moments.find({ connectionId }).sort({ createdAt: -1 }).limit(60).toArray();
        const answers = dayKey ? await moments.find({ connectionId, type: 'answer', dayKey }).toArray() : [];
        const serialize = row => ({ id: row._id.toString(), type: row.type, text: row.text || '', imageData: row.imageData || null, userId: row.userId.toString(), promptId: row.promptId || null, dayKey: row.dayKey || null, createdAt: row.createdAt, updatedAt: row.updatedAt || null });
        return json(res, 200, { moments: rows.map(serialize), answers: answers.map(serialize), currentUserId: userId.toString() });
      }
      if (parts.length === 3 && req.method === 'POST') {
        const type = String(body.type || '');
        const text = String(body.text || '').trim().slice(0, 1000);
        if (!text) return json(res, 400, { error: 'Write a little something first.' });
        if (type === 'answer') {
          const dayKey = String(body.dayKey || '');
          const promptId = String(body.promptId || '');
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey) || !/^[a-z0-9-]{1,64}$/.test(promptId) || text.length > 500) return json(res, 400, { error: 'Check your daily answer and try again.' });
          await moments.updateOne(
            { connectionId, type: 'answer', dayKey, userId },
            { $set: { text, promptId, updatedAt: new Date() }, $setOnInsert: { connectionId, type: 'answer', dayKey, userId, createdAt: new Date() } },
            { upsert: true }
          );
          const answers = await moments.find({ connectionId, type: 'answer', dayKey }).toArray();
          return json(res, 200, { answers: answers.map(row => ({ id: row._id.toString(), type: row.type, text: row.text, userId: row.userId.toString(), promptId: row.promptId, dayKey: row.dayKey, createdAt: row.createdAt, updatedAt: row.updatedAt || null })) });
        }
        if (type === 'photo') {
          const imageData = String(body.imageData || '');
          const caption = String(body.text || '').trim().slice(0, 240);
          if (imageData.length > 1250000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(imageData)) {
            return json(res, 400, { error: 'Choose a JPEG, PNG, or WebP photo under 900 KB after compression.' });
          }
          const [header, encoded] = imageData.split(',');
          const bytes = Buffer.from(encoded, 'base64');
          if (!bytes.length || bytes.length > 900000) return json(res, 400, { error: 'Photos must be 900 KB or smaller after compression.' });
          const validSignature = header.includes('image/jpeg') ? bytes[0] === 0xff && bytes[1] === 0xd8 :
            header.includes('image/png') ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) :
            bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
          if (!validSignature) return json(res, 400, { error: 'That image file could not be verified. Try a JPEG or PNG.' });
          const result = await moments.insertOne({ connectionId, type: 'photo', text: caption, imageData, userId, createdAt: new Date() });
          return json(res, 201, { moment: { id: result.insertedId.toString(), type: 'photo', text: caption, imageData, userId: userId.toString(), createdAt: new Date() } });
        }
        if (type === 'memory') {
          if (text.length > 1000) return json(res, 400, { error: 'Keep a memory under 1,000 characters.' });
          const result = await moments.insertOne({ connectionId, type: 'memory', text, userId, createdAt: new Date() });
          return json(res, 201, { moment: { id: result.insertedId.toString(), type: 'memory', text, userId: userId.toString(), createdAt: new Date() } });
        }
        return json(res, 400, { error: 'Choose a supported shared moment.' });
      }
      if (parts.length === 4 && req.method === 'DELETE') {
        let momentId;
        try { momentId = new ObjectId(parts[3]); } catch { return json(res, 400, { error: 'That memory link is not valid.' }); }
        const result = await moments.deleteOne({ _id: momentId, connectionId, userId, type: { $in: ['memory', 'photo'] } });
        if (!result.deletedCount) return json(res, 404, { error: 'Only your own saved moments or photos can be deleted.' });
        return json(res, 200, { ok: true });
      }
    }
    if (parts[0] === 'connections' && parts[1] && parts[2] === 'messages') {
      const connection = await database.collection('connections').findOne({ _id: new ObjectId(parts[1]), memberIds: userId, status: 'approved' });
      if (!connection) return json(res, 403, { error: 'This chat isn’t available.' });
      const messages = database.collection('messages');
      if (req.method === 'GET') { const rows = await messages.find({ connectionId: connection._id }).sort({ createdAt: 1 }).limit(100).toArray(); return json(res, 200, { messages: rows.map(m => ({ id: m._id.toString(), text: m.text, senderId: m.senderId.toString(), createdAt: m.createdAt })) }); }
      if (req.method === 'POST') { const text = String(body.text || '').trim(); if (!text || text.length > 2000) return json(res, 400, { error: 'Keep your message between 1 and 2,000 characters.' }); const result = await messages.insertOne({ connectionId: connection._id, senderId: userId, text, createdAt: new Date() }); return json(res, 201, { message: { id: result.insertedId.toString(), text, senderId: userId.toString(), createdAt: new Date() } }); }
    }
    if (action === 'revoke-invites' && req.method === 'POST') { await database.collection('invites').updateMany({ ownerId: userId, status: 'pending' }, { $set: { status: 'revoked' } }); return json(res, 200, { ok: true }); }
    if (action === 'delete-account' && req.method === 'DELETE') { const connections = await database.collection('connections').find({ memberIds: userId }).toArray(); await database.collection('messages').deleteMany({ connectionId: { $in: connections.map(c => c._id) } }); await database.collection('date_plans').deleteMany({ connectionId: { $in: connections.map(c => c._id) } }); await database.collection('connections').deleteMany({ memberIds: userId }); await database.collection('invites').deleteMany({ $or: [{ ownerId: userId }, { recipientId: userId }] }); await database.collection('users').deleteOne({ _id: userId }); cookie(res, '', 0); return json(res, 200, { ok: true }); }
    return json(res, 404, { error: 'That page took a wrong turn. Try again.' });
  } catch (error) {
    const code = error?.message === 'DB_CONFIG' || error?.message === 'AUTH_CONFIG' ? 503 : 500;
    console.error('AFTERDARK request failed:', { requestId, action, method: req.method, code: error?.code || null, codeName: error?.codeName || null, message: error?.message || 'unknown' });
    return json(res, code, {
      error: code === 503 ? 'This feature is temporarily unavailable. Check the API health status and try again.' : 'Something glitched. Please retry once. If it continues, share reference ' + requestId + ' with support.',
      requestId
    });
  }
}
