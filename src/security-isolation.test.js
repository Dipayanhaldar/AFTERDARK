import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/[...route].js';
import {
  recordUserAdInteraction,
  getBehaviorRankedBrands,
  getUserAdBehaviorProfile,
  analyzeChatContextLocally
} from './commerce-data.js';

function invokeApi(method, urlPath, { body = null, headers = {}, query = {} } = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlPath, 'http://localhost:3000');
    const mergedQuery = { ... Object.fromEntries(parsedUrl.searchParams.entries()), ...query };

    const req = {
      method,
      url: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'content-type': 'application/json',
        ...Object.fromEntries(
          Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
        )
      },
      query: mergedQuery,
      body: body || {},
      socket: { remoteAddress: headers['x-forwarded-for'] || '127.0.0.1' }
    };

    const resHeaders = {};
    const res = {
      statusCode: 200,
      setHeader(k, v) {
        resHeaders[k.toLowerCase()] = v;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({
          status: this.statusCode,
          headers: resHeaders,
          body: payload
        });
        return this;
      },
      send(payload) {
        resolve({
          status: this.statusCode,
          headers: resHeaders,
          body: payload
        });
        return this;
      },
      end(chunk) {
        let parsed = null;
        if (typeof chunk === 'string' && chunk.trim()) {
          try {
            parsed = JSON.parse(chunk);
          } catch {
            parsed = chunk;
          }
        } else if (chunk) {
          parsed = chunk;
        }
        resolve({
          status: this.statusCode,
          headers: resHeaders,
          body: parsed
        });
        return this;
      }
    };

    Promise.resolve(handler(req, res)).catch(reject);
  });
}

describe('Account Isolation & Anti-Hijack Security Suite', () => {
  const suffix = Date.now().toString(36);
  const userAEmail = `creator_a_${suffix}@afterdark.app`;
  const userBEmail = `dummy_b_${suffix}@afterdark.app`;
  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let inviteTokenA = '';
  let otpA = '';
  let connectionIdA = '';
  let guestTokenA = '';

  it('1. User A signs up, creates a 1-on-1 invite, pairs with Partner Device 1, and exchanges private chat messages', async () => {
    const signupRes = await invokeApi('POST', '/api/auth/signup', {
      body: {
        email: userAEmail,
        password: 'StrongPasswordA!123',
        displayName: 'Aarav',
        ageConfirmed: true
      },
      headers: { 'x-device-id': `creator_dev_a_${suffix}` }
    });
    assert.equal(signupRes.status, 201);
    assert.ok(signupRes.body.sessionToken.startsWith('ad_s2.'));
    userAToken = signupRes.body.sessionToken;
    userAId = signupRes.body.user.id;

    const inviteRes = await invokeApi('POST', '/api/invites', {
      body: {
        creatorCustomName: 'Aarav',
        partnerCustomName: 'Ananya',
        recipientHint: 'Ananya',
        deviceId: `creator_dev_a_${suffix}`
      },
      headers: {
        authorization: `Bearer ${userAToken}`,
        'x-device-id': `creator_dev_a_${suffix}`
      }
    });
    assert.equal(inviteRes.status, 201);
    inviteTokenA = inviteRes.body.inviteToken;
    otpA = inviteRes.body.verificationCode;
    assert.equal(inviteRes.body.creatorId, userAId);

    // Partner Device 1 approves the 1-on-1 invite using the 6-digit OTP
    const approveRes = await invokeApi('POST', `/api/guest/invites/${inviteTokenA}/approve`, {
      body: {
        otpCode: otpA,
        guestDisplayName: 'Ananya',
        ageConfirmed: true,
        deviceId: `partner_dev_1_${suffix}`
      },
      headers: {
        'x-device-id': `partner_dev_1_${suffix}`,
        'x-forwarded-for': '203.0.113.10'
      }
    });
    assert.equal(approveRes.status, 200);
    connectionIdA = approveRes.body.connection.id;
    guestTokenA = approveRes.body.guestSessionToken;
    assert.ok(guestTokenA.startsWith('ad_g2.'));

    // User A sends a private message in the couple chat
    const msgRes = await invokeApi('POST', `/api/connections/${connectionIdA}/messages`, {
      body: { body: 'Secret romantic message only for Aarav & Ananya ♥' },
      headers: {
        authorization: `Bearer ${userAToken}`,
        'x-device-id': `creator_dev_a_${suffix}`
      }
    });
    assert.equal(msgRes.status, 201);
  });

  it('2. Creating a new Dummy Account (User B) NEVER inherits or merges User A chat history or invite', async () => {
    const signupB = await invokeApi('POST', '/api/auth/signup', {
      body: {
        email: userBEmail,
        password: 'DummyPasswordB!456',
        displayName: 'DummyUserB',
        ageConfirmed: true
      },
      headers: { 'x-device-id': `creator_dev_a_${suffix}` }
    });
    assert.equal(signupB.status, 201);
    userBToken = signupB.body.sessionToken;
    assert.notEqual(signupB.body.user.id, userAId);

    // Check /api/invites/current for User B -> must be null
    const currentInviteB = await invokeApi('GET', '/api/invites/current', {
      headers: { authorization: `Bearer ${userBToken}` }
    });
    assert.equal(currentInviteB.status, 200);
    assert.equal(currentInviteB.body.invite, null);

    // Even if a stale browser passes User A's inviteToken, otp, and connId in query params under User B's token,
    // User B MUST receive empty connections and MUST NOT hijack User A's connection!
    const connResB = await invokeApi(
      'GET',
      `/api/connections?inviteToken=${encodeURIComponent(inviteTokenA)}&otp=${encodeURIComponent(otpA)}&connId=${encodeURIComponent(connectionIdA)}`,
      {
        headers: { authorization: `Bearer ${userBToken}` }
      }
    );
    assert.equal(connResB.status, 200);
    assert.deepEqual(connResB.body.connections, []);

    // Direct attempt by User B to read User A's messages by connection ID is strictly blocked with 403
    const hijackMessagesRes = await invokeApi(
      'GET',
      `/api/connections/${connectionIdA}/messages`,
      {
        headers: { authorization: `Bearer ${userBToken}` }
      }
    );
    assert.equal(hijackMessagesRes.status, 403);

    // Verify User A still owns their connection and secret messages intact
    const connResA = await invokeApi('GET', '/api/connections', {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert.equal(connResA.status, 200);
    assert.equal(connResA.body.connections.length, 1);
    assert.equal(connResA.body.connections[0].id, connectionIdA);

    const msgListA = await invokeApi('GET', `/api/connections/${connectionIdA}/messages`, {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert.equal(msgListA.status, 200);
    assert.ok(msgListA.body.messages.length >= 1);
    assert.ok(msgListA.body.messages.some((m) => /Secret romantic message/.test(m.body)));
  });

  it('3. Blocks account takeover via /api/auth/signup with existing email and wrong password', async () => {
    const takeoverAttempt = await invokeApi('POST', '/api/auth/signup', {
      body: {
        email: userAEmail,
        password: 'HackerWrongPassword999!',
        displayName: 'Hacker',
        ageConfirmed: true
      }
    });
    assert.equal(takeoverAttempt.status, 409);
    assert.match(takeoverAttempt.body.error, /already exists/i);
  });

  it('4. Blocks X-User-Email header spoofing with forged or unsigned bearer tokens', async () => {
    const spoofAttempt = await invokeApi('GET', '/api/me', {
      headers: {
        authorization: 'Bearer ses_forged_token_999999',
        'x-user-email': userAEmail
      }
    });
    assert.equal(spoofAttempt.status, 401);
  });

  it('5. Enforces 1-on-1 Single-Guest Device Lock so no 3rd person or hacker can enter in between', async () => {
    // Hacker on a 3rd device tries to preview the active invite link
    const hackerPreview = await invokeApi('GET', `/api/guest/invites/${inviteTokenA}`, {
      headers: {
        'x-device-id': `hacker_third_device_${suffix}`,
        'x-forwarded-for': '198.51.100.77'
      }
    });
    assert.equal(hackerPreview.status, 200);
    assert.equal(hackerPreview.body.invite.sameDeviceOrIpBlocked, true);
    assert.match(hackerPreview.body.invite.blockReason, /No third person can enter in between/i);

    // Hacker on a 3rd device tries to approve with the 6-digit OTP
    const hackerApprove = await invokeApi('POST', `/api/guest/invites/${inviteTokenA}/approve`, {
      body: {
        verificationCode: otpA,
        guestDisplayName: 'Intruder',
        ageConfirmed: true,
        deviceId: `hacker_third_device_${suffix}`
      },
      headers: {
        'x-device-id': `hacker_third_device_${suffix}`,
        'x-forwarded-for': '198.51.100.77'
      }
    });
    assert.equal(hackerApprove.status, 403);
    assert.match(hackerApprove.body.error, /No third person can enter in between/i);

    // Hacker tries to read guest messages without a valid guest token or from a different device
    const hackerReadNoToken = await invokeApi(
      'GET',
      `/api/guest/connections/${connectionIdA}/messages`,
      {
        headers: {
          'x-device-id': `hacker_third_device_${suffix}`
        }
      }
    );
    assert.equal(hackerReadNoToken.status, 401);

    // Even if hacker steals the guestSessionToken, using it from a different device ID is blocked with 403
    const hackerStolenToken = await invokeApi(
      'GET',
      `/api/guest/connections/${connectionIdA}/messages`,
      {
        headers: {
          authorization: `Bearer ${guestTokenA}`,
          'x-device-id': `hacker_third_device_${suffix}`
        }
      }
    );
    assert.equal(hackerStolenToken.status, 403);

    // Legitimate paired Partner Device 1 can still read messages normally
    const partnerRead = await invokeApi(
      'GET',
      `/api/guest/connections/${connectionIdA}/messages`,
      {
        headers: {
          authorization: `Bearer ${guestTokenA}`,
          'x-device-id': `partner_dev_1_${suffix}`
        }
      }
    );
    assert.equal(partnerRead.status, 200);
    assert.ok(partnerRead.body.messages.length >= 1);
  });

  it('6. Brute-force protection locks out repeated wrong 6-digit OTP attempts with 429', async () => {
    // User B generates a fresh pending invite
    const inviteResB = await invokeApi('POST', '/api/invites', {
      body: {
        creatorCustomName: 'DummyUserB',
        partnerCustomName: 'PartnerB',
        deviceId: `creator_dev_b_${suffix}`
      },
      headers: {
        authorization: `Bearer ${userBToken}`,
        'x-device-id': `creator_dev_b_${suffix}`
      }
    });
    assert.equal(inviteResB.status, 201);
    const tokenB = inviteResB.body.inviteToken;

    // Attacker tries 5 wrong OTPs
    for (let i = 0; i < 5; i++) {
      const wrongRes = await invokeApi('POST', `/api/guest/invites/${tokenB}/approve`, {
        body: {
          verificationCode: '000000',
          guestDisplayName: 'BruteForcer',
          ageConfirmed: true,
          deviceId: `brute_dev_${suffix}`
        },
        headers: {
          'x-device-id': `brute_dev_${suffix}`,
          'x-forwarded-for': '192.0.2.99'
        }
      });
      assert.equal(wrongRes.status, 401);
    }

    // 6th attempt is locked out with 429 Too Many Requests
    const lockedRes = await invokeApi('POST', `/api/guest/invites/${tokenB}/approve`, {
      body: {
        verificationCode: inviteResB.body.verificationCode,
        guestDisplayName: 'BruteForcer',
        ageConfirmed: true,
        deviceId: `brute_dev_${suffix}`
      },
      headers: {
        'x-device-id': `brute_dev_${suffix}`,
        'x-forwarded-for': '192.0.2.99'
      }
    });
    assert.equal(lockedRes.status, 429);
    assert.match(lockedRes.body.error, /Too many incorrect 6-digit OTP attempts/i);
  });

  it('7. Bot Detection blocks automated scraper traffic with Flirty Human Challenge and unlocks with signed ad_hp2 pass token', async () => {
    // Automated scraper UA attempting to hit API without human pass token gets 429 with requiresFlirtyChallenge: true
    const botRes = await invokeApi('POST', '/api/ai/analyze-chat', {
      body: { messages: [], draftText: 'hello' },
      headers: {
        'user-agent': 'python-requests/2.31.0',
        'x-device-id': `bot_scraper_${suffix}`
      }
    });
    assert.equal(botRes.status, 429);
    assert.equal(botRes.body.requiresFlirtyChallenge, true);
    assert.equal(botRes.headers['x-afterdark-bot-challenge'], 'required');

    // Selecting a robotic answer on /api/security/verify-human is rejected with 403
    const failChallenge = await invokeApi('POST', '/api/security/verify-human', {
      body: {
        challengeId: 'flirt_chai_1',
        selectedOptionId: 'bot_1',
        holdDurationMs: 1200
      },
      headers: { 'x-device-id': `bot_scraper_${suffix}` }
    });
    assert.equal(failChallenge.status, 403);
    assert.equal(failChallenge.body.requiresFlirtyChallenge, true);

    // Selecting the genuine romantic human option + holding heart >= 800ms issues a signed ad_hp2 token
    const passChallenge = await invokeApi('POST', '/api/security/verify-human', {
      body: {
        challengeId: 'flirt_chai_1',
        selectedOptionId: 'human_1',
        holdDurationMs: 1250
      },
      headers: { 'x-device-id': `bot_scraper_${suffix}` }
    });
    assert.equal(passChallenge.status, 200);
    assert.equal(passChallenge.body.verified, true);
    assert.ok(passChallenge.body.humanPassToken.startsWith('ad_hp2.'));

    // Subsequent request with X-AfterDark-Human-Pass succeeds with 200
    const unlockedRes = await invokeApi('POST', '/api/ai/analyze-chat', {
      body: { messages: [], draftText: 'coffee date' },
      headers: {
        'user-agent': 'python-requests/2.31.0',
        'x-device-id': `bot_scraper_${suffix}`,
        'x-afterdark-human-pass': passChallenge.body.humanPassToken
      }
    });
    assert.equal(unlockedRes.status, 200);
    assert.ok(unlockedRes.body.insight?.primaryBrand);
  });

  it('8. In-Built Invisible Free Behavioral & Ad-History AI Engine ranks brands from user activity with zero external keys', () => {
    // Record user interactions with Nykaa & Tira (beauty category + coupon copy + checkout click)
    recordUserAdInteraction({
      brandId: 'nykaa',
      category: 'beauty',
      action: 'coupon_copy'
    });
    recordUserAdInteraction({
      brandId: 'nykaa',
      category: 'beauty',
      action: 'checkout_click',
      query: 'luxury perfume gift set'
    });
    recordUserAdInteraction({
      brandId: 'zomato',
      category: 'food',
      action: 'dismiss'
    });

    const profile = getUserAdBehaviorProfile();
    assert.ok(profile.brandScores.nykaa >= 14);
    assert.ok(profile.dismissedBrandIds.includes('zomato'));

    const topBrands = getBehaviorRankedBrands(5);
    assert.equal(topBrands[0].id, 'nykaa');

    // Local chat context analyzer uses behavioral affinity when chat has no explicit brand keyword
    const localInsight = analyzeChatContextLocally([], '', 'creator');
    assert.equal(localInsight.primaryBrand.id, 'nykaa');
  });
});

