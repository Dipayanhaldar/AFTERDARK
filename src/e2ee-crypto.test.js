import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sha256Hex,
  encodeOtpSignature,
  verifyOtpSignature,
  deriveE2eeFingerprint,
  isE2eeCiphertext,
  encryptChatMessage,
  decryptChatMessage,
  encryptMessageRecord,
  decryptMessageRecord
} from './e2ee-crypto.js';

test('sha256Hex matches standard FIPS 180-4 test vector', () => {
  assert.equal(
    sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
});

test('encodeOtpSignature produces non-reversible commitment and verifyOtpSignature validates accurately', () => {
  const otp = '482910';
  const inviteToken = 'inv_couple_secret_99';
  const sig = encodeOtpSignature(otp, inviteToken);

  assert.equal(sig.startsWith('ad1_'), true);
  // Ensure the plaintext OTP is never present in the signature or base64 decoding
  assert.equal(sig.includes(otp), false);
  assert.equal(verifyOtpSignature(otp, inviteToken, sig), true);
  assert.equal(verifyOtpSignature('999999', inviteToken, sig), false);
  assert.equal(verifyOtpSignature(otp, 'inv_different_token', sig), false);
});

test('AES-256-GCM encryptChatMessage and decryptChatMessage protect message history when only guest link is known', async () => {
  const secretMessage = 'Meet me at Cafe Niloufer at 10 PM! Ordering Flipkart Minutes chocolates ♥';
  const keyContext = { verificationCode: '482910' };

  const ciphertext1 = await encryptChatMessage(secretMessage, keyContext);
  const ciphertext2 = await encryptChatMessage(secretMessage, keyContext);

  assert.equal(isE2eeCiphertext(ciphertext1), true);
  // Random 96-bit IV guarantees semantic security (two encryptions of same text differ)
  assert.notEqual(ciphertext1, ciphertext2);
  // Ciphertext never leaks plaintext substrings
  assert.equal(ciphertext1.includes('Niloufer'), false);
  assert.equal(ciphertext1.includes('Flipkart'), false);

  // 1. Authorized partner with matching 6-digit OTP decrypts accurately
  const decryptedOk = await decryptChatMessage(ciphertext1, { verificationCode: '482910' });
  assert.equal(decryptedOk.verified, true);
  assert.equal(decryptedOk.locked, false);
  assert.equal(decryptedOk.plaintext, secretMessage);

  // 2. Someone with ONLY the guest link (no OTP) cannot read message history
  const withoutOtp = await decryptChatMessage(ciphertext1, { verificationCode: '' });
  assert.equal(withoutOtp.verified, false);
  assert.equal(withoutOtp.locked, true);
  assert.equal(withoutOtp.plaintext.includes('Niloufer'), false);

  // 3. Someone with wrong OTP cannot read message history
  const wrongOtp = await decryptChatMessage(ciphertext1, { verificationCode: '123456' });
  assert.equal(wrongOtp.verified, false);
  assert.equal(wrongOtp.locked, true);
  assert.equal(wrongOtp.plaintext.includes('Niloufer'), false);
});

test('Custom E2EE passphrase adds second encryption layer on message records', async () => {
  const record = {
    id: 'msg_1',
    senderRole: 'guest',
    body: 'Surprise gift ordered on Flipkart!',
    dateMeta: {
      title: 'Candlelight Dinner',
      description: 'Secret rooftop table for two'
    }
  };

  const encryptedRecord = await encryptMessageRecord(record, {
    verificationCode: '654321',
    customPassphrase: 'jaan'
  });

  assert.equal(encryptedRecord.e2ee, true);
  assert.equal(isE2eeCiphertext(encryptedRecord.e2eeCiphertext), true);

  // Without customPassphrase, raw ciphertext stays locked even with OTP
  const rawCipherRecord = {
    ...encryptedRecord,
    body: encryptedRecord.e2eeCiphertext,
    text: encryptedRecord.e2eeCiphertext
  };
  const lockedAttempt = await decryptMessageRecord(rawCipherRecord, {
    verificationCode: '654321',
    customPassphrase: ''
  });
  assert.equal(lockedAttempt.e2eeLocked, true);
  assert.equal(lockedAttempt.body.includes('Flipkart'), false);

  // With both OTP and customPassphrase, decrypts cleanly
  const unlocked = await decryptMessageRecord(rawCipherRecord, {
    verificationCode: '654321',
    customPassphrase: 'jaan'
  });
  assert.equal(unlocked.e2eeVerified, true);
  assert.equal(unlocked.e2eeLocked, false);
  assert.equal(unlocked.body, 'Surprise gift ordered on Flipkart!');
  assert.equal(
    unlocked.keyFingerprint,
    deriveE2eeFingerprint('654321', 'jaan')
  );
});

test('Release v2.0.2.8 manifest provides meaningful 4-segment version breakdown and store matrix including Uptodown', async () => {
  const {
    APP_VERSION,
    VERSION_SEGMENTS,
    VERSION_UPDATE_LOCATIONS,
    STORE_COMPATIBILITY_MATRIX,
    decodeVersionString
  } = await import('./version-manifest.js');

  assert.equal(APP_VERSION, '2.0.2.8');
  assert.equal(VERSION_SEGMENTS.length, 4);
  assert.equal(VERSION_SEGMENTS.map((s) => s.digit).join('.'), '2.0.2.8');
  assert.equal(VERSION_UPDATE_LOCATIONS.length >= 6, true);
  assert.equal(STORE_COMPATIBILITY_MATRIX.length >= 4, true);
  assert.equal(
    STORE_COMPATIBILITY_MATRIX.some((s) => s.storeId === 'uptodown-android'),
    true
  );

  const decoded = decodeVersionString('2.0.2.8');
  assert.equal(decoded.majorGen, 2);
  assert.equal(decoded.platformChannel, 0);
  assert.equal(decoded.featureMilestone, 2);
  assert.equal(decoded.patchScope, 8);
});

test('Top 100 Indian Brands catalog contains exactly 100 unique Indian brands for in-chat advertisements', async () => {
  const { brandCatalog, detectBrandsInMessage } = await import('./commerce-data.js');
  assert.equal(brandCatalog.length, 100);
  const uniqueIds = new Set(brandCatalog.map((b) => b.id));
  assert.equal(uniqueIds.size, 100);

  // Verify newly added Indian brands (e.g. Meesho, Tata CLiQ, Kalyan Jewellers, Haldiram's) are detectable in chat
  const detected = detectBrandsInMessage('Let us order sweets from Haldirams and check Kalyan Jewellers jhumka!');
  assert.equal(detected.some((b) => b.id === 'haldirams' || b.id === 'kalyan_jewellers'), true);
});

test('Adaptive Traffic Control classifies Couple Chat & E2EE Auth into Priority P0/P1 lanes', async () => {
  const { classifyEndpointPriority, TRAFFIC_LANES } = await import('./traffic-control.js');
  assert.equal(
    classifyEndpointPriority('/connections/conn_1/messages', 'POST'),
    TRAFFIC_LANES.CRITICAL_CHAT
  );
  assert.equal(
    classifyEndpointPriority('/auth/google', 'POST'),
    TRAFFIC_LANES.AUTH_SESSION
  );
  assert.equal(
    classifyEndpointPriority('/ai/analyze-chat', 'POST'),
    TRAFFIC_LANES.BACKGROUND_AI
  );
});




