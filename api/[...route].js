import { MongoClient } from 'mongodb';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
let clientPromise;
const COOKIE = 'afterdark_session';
const DAY = 86400;
const json = (res, status, body) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
const token = (n = 32) => randomBytes(n).toString('base64url');
function cookie(res, value, maxAge = DAY * 14) { res.setHeader('Set-Cookie', `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`); }
function sign(payload) { const secret = process.env.JWT_SECRET; if (!secret) throw new Error('AUTH_CONFIG'); const body = Buffer.from(JSON.stringify(payload)).toString('base64url'); return body + '.' + createHmac('sha256', secret).update(body).digest('base64url'); }
function verify(value) { try { const [body, sig] = value.split('.'); const expected = createHmac('sha256', process.env.JWT_SECRET).update(body).digest(); const actual = Buffer.from(sig, 'base64url'); if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null; const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() / 1000 ? p : null; } catch { return null; } }
function currentUser(req) { const raw = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1); return raw ? verify(decodeURIComponent(raw)) : null; }
async function db() { if (!process.env.MONGODB_URI) throw new Error('DB_CONFIG'); if (!clientPromise) { const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 }); clientPromise = client.connect(); } return (await clientPromise).db(process.env.MONGODB_DB || 'afterdark'); }
function cleanUser(u) { return { id: u._id.toString(), email: u.email, handle: u.handle || 'your-vibe', createdAt: u.createdAt }; }
async function readBody(req) { let data = ''; for await (const chunk of req) { data += chunk; if (data.length > 20000) throw new Error('BODY_TOO_LARGE'); } return data ? JSON.parse(data) : {}; }
async function rateLimit(database, key, limit = 20) { const now = new Date(); const bucket = Math.floor(now.getTime() / 60000); const id = key + ':' + bucket; const c = database.collection('rate_limits'); await c.updateOne({ _id: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + 120000) } }, { upsert: true }); const row = await c.findOne({ _id: id }); if (row?.count > limit) return false; return true; }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.setHeader('Allow', 'GET,POST,PATCH,DELETE,OPTIONS'); return res.status(204).end(); }
  let database;
  try {
    database = await db();
    await Promise.all([
      database.collection('users').createIndex({ email: 1 }, { unique: true }),
      database.collection('invites').createIndex({ tokenHash: 1 }, { unique: true }),
      database.collection('invites').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      database.collection('connections').createIndex({ pairKey: 1 }, { unique: true }),
      database.collection('messages').createIndex({ connectionId: 1, createdAt: 1 }),
      database.collection('rate_limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      database.collection('password_resets').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      database.collection('date_plans').createIndex({ connectionId: 1 }, { unique: true }),
      database.collection('reports').createIndex({ createdAt: 1 })
    ]);
    const url = new URL(req.url, 'https://afterdark.invalid');
    const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    const action = parts.join('/');
    const body = ['POST','PATCH','DELETE'].includes(req.method) ? await readBody(req) : {};
    const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim().slice(0, 80);
    if (!await rateLimit(database, ip, ['login','register','forgot-password','reset-password'].includes(action) ? 8 : 45)) return json(res, 429, { error: 'Too many tries. Take a breath and try again shortly.' });

    if (action === 'register' && req.method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const handle = String(body.handle || '').trim().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10 || password.length > 128 || body.adult !== true || body.consent !== true) return json(res, 400, { error: 'Check your email, use 10+ password characters, and confirm you are 18+.' });
      const salt = randomBytes(16).toString('hex');
      const hash = (await scrypt(password, salt, 64)).toString('hex');
      try { const result = await database.collection('users').insertOne({ email, passwordHash: salt + ':' + hash, handle: handle || 'your-vibe', createdAt: new Date(), adultConfirmedAt: new Date(), blockedUsers: [] }); const user = { _id: result.insertedId, email, handle: handle || 'your-vibe', createdAt: new Date() }; cookie(res, sign({ sub: user._id.toString(), exp: Math.floor(Date.now()/1000) + DAY*14 })); return json(res, 201, { user: cleanUser(user) }); }
      catch (e) { if (e.code === 11000) return json(res, 409, { error: 'That email already has an account. Try signing in instead.' }); throw e; }
    }
    if (action === 'login' && req.method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase(); const password = String(body.password || '');
      const user = await database.collection('users').findOne({ email });
      if (!user?.passwordHash) return json(res, 401, { error: 'Email or password doesn’t match. Check it and try again.' });
      const [salt, stored] = user.passwordHash.split(':'); const actual = (await scrypt(password, salt, 64)).toString('hex');
      if (stored.length !== actual.length || !timingSafeEqual(Buffer.from(stored), Buffer.from(actual))) return json(res, 401, { error: 'Email or password doesn’t match. Check it and try again.' });
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
    if (action === 'me' && req.method === 'GET') { if (!session) return json(res, 200, { user: null }); const user = await database.collection('users').findOne({ _id: new (await import('mongodb')).ObjectId(session.sub) }); return json(res, 200, { user: user ? cleanUser(user) : null }); }
    if (!session) return json(res, 401, { error: 'Sign in to continue.' });
    const { ObjectId } = await import('mongodb'); const userId = new ObjectId(session.sub);
    const user = await database.collection('users').findOne({ _id: userId });
    if (!user) return json(res, 401, { error: 'Please sign in again.' });

    if (action === 'invites' && req.method === 'POST') {
      const raw = token(32); const expiresAt = new Date(Date.now() + 7 * DAY * 1000);
      await database.collection('invites').insertOne({ tokenHash: createHmac('sha256', process.env.JWT_SECRET).update(raw).digest('hex'), ownerId: userId, status: 'pending', createdAt: new Date(), expiresAt });
      return json(res, 201, { invite: raw, expiresAt });
    }
    if (parts[0] === 'invites' && parts[1] && req.method === 'GET') {
      const raw = parts[1]; const hash = createHmac('sha256', process.env.JWT_SECRET).update(raw).digest('hex');
      const invite = await database.collection('invites').findOne({ tokenHash: hash, expiresAt: { $gt: new Date() } });
      if (!invite || invite.status === 'ignored' || invite.status === 'revoked') return json(res, 404, { error: 'This invite has expired or is no longer available.' });
      if (invite.ownerId.equals(userId)) return json(res, 200, { invite: { status: invite.status, ownInvite: true, handle: user.handle } });
      return json(res, 200, { invite: { status: invite.status, ownInvite: false, handle: user.handle } });
    }
    if (parts[0] === 'invites' && parts[1] && parts[2] && ['approve','ignore'].includes(parts[2]) && req.method === 'POST') {
      const hash = createHmac('sha256', process.env.JWT_SECRET).update(parts[1]).digest('hex');
      const invites = database.collection('invites'); const invite = await invites.findOne({ tokenHash: hash, expiresAt: { $gt: new Date() } });
      if (!invite || invite.status !== 'pending') return json(res, 404, { error: 'This invite is no longer available.' });
      if (invite.ownerId.equals(userId)) return json(res, 403, { error: 'You can’t approve your own invite. Send it to your person.' });
      if (parts[2] === 'ignore') { await invites.updateOne({ _id: invite._id, status: 'pending' }, { $set: { status: 'ignored', recipientId: userId, respondedAt: new Date() } }); return json(res, 200, { status: 'ignored' }); }
      const pair = [invite.ownerId.toString(), userId.toString()].sort(); const pairKey = pair.join(':');
      const connection = await database.collection('connections').findOneAndUpdate({ pairKey }, { $setOnInsert: { pairKey, memberIds: pair.map(id => new ObjectId(id)), status: 'approved', createdAt: new Date() } }, { upsert: true, returnDocument: 'after' });
      await invites.updateOne({ _id: invite._id, status: 'pending' }, { $set: { status: 'approved', recipientId: userId, connectionId: connection?._id, respondedAt: new Date() } });
      return json(res, 200, { status: 'approved' });
    }
    if (action === 'connections' && req.method === 'GET') {
      const connections = await database.collection('connections').find({ memberIds: userId, status: 'approved' }).toArray();
      const rows = await Promise.all(connections.map(async c => { const otherId = c.memberIds.find(id => !id.equals(userId)); const other = otherId ? await database.collection('users').findOne({ _id: otherId }, { projection: { email: 1, handle: 1 } }) : null; return { id: c._id.toString(), handle: other?.handle || 'your person' }; }));
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
    if (parts[0] === 'connections' && parts[1] && parts[2] === 'messages') {
      const connection = await database.collection('connections').findOne({ _id: new ObjectId(parts[1]), memberIds: userId, status: 'approved' });
      if (!connection) return json(res, 403, { error: 'This chat isn’t available.' });
      const messages = database.collection('messages');
      if (req.method === 'GET') { const rows = await messages.find({ connectionId: connection._id }).sort({ createdAt: 1 }).limit(100).toArray(); return json(res, 200, { messages: rows.map(m => ({ id: m._id.toString(), text: m.text, senderId: m.senderId.toString(), createdAt: m.createdAt })) }); }
      if (req.method === 'POST') { const text = String(body.text || '').trim(); if (!text || text.length > 2000) return json(res, 400, { error: 'Keep your message between 1 and 2,000 characters.' }); const result = await messages.insertOne({ connectionId: connection._id, senderId: userId, text, createdAt: new Date() }); return json(res, 201, { message: { id: result.insertedId.toString(), text, senderId: userId.toString(), createdAt: new Date() } }); }
    }
    if (action === 'revoke-invites' && req.method === 'POST') { await database.collection('invites').updateMany({ ownerId: userId, status: 'pending' }, { $set: { status: 'revoked' } }); return json(res, 200, { ok: true }); }
    if (action === 'delete-account' && req.method === 'DELETE') { const connections = await database.collection('connections').find({ memberIds: userId }).toArray(); await database.collection('messages').deleteMany({ connectionId: { $in: connections.map(c => c._id) } }); await database.collection('connections').deleteMany({ memberIds: userId }); await database.collection('invites').deleteMany({ $or: [{ ownerId: userId }, { recipientId: userId }] }); await database.collection('users').deleteOne({ _id: userId }); cookie(res, '', 0); return json(res, 200, { ok: true }); }
    return json(res, 404, { error: 'That page took a wrong turn. Try again.' });
  } catch (error) {
    const code = error?.message === 'DB_CONFIG' || error?.message === 'AUTH_CONFIG' ? 503 : 500;
    console.error('AFTERDARK request failed:', error?.message || 'unknown');
    return json(res, code, { error: code === 503 ? 'This feature is taking a tiny breather. Try again soon.' : 'Something glitched. Give it another try.' });
  }
}
