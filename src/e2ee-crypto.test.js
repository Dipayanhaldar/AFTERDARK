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
  assert.equal(isE2eeCiphertext(encryptedRecord.body), true);
  assert.equal(isE2eeCiphertext(encryptedRecord.dateMeta.description), true);

  // Without customPassphrase, message stays locked even with OTP
  const lockedAttempt = await decryptMessageRecord(encryptedRecord, {
    verificationCode: '654321',
    customPassphrase: ''
  });
  assert.equal(lockedAttempt.e2eeLocked, true);
  assert.equal(lockedAttempt.body.includes('Flipkart'), false);

  // With both OTP and customPassphrase, decrypts cleanly
  const unlocked = await decryptMessageRecord(encryptedRecord, {
    verificationCode: '654321',
    customPassphrase: 'jaan'
  });
  assert.equal(unlocked.e2eeVerified, true);
  assert.equal(unlocked.e2eeLocked, false);
  assert.equal(unlocked.body, 'Surprise gift ordered on Flipkart!');
  assert.equal(unlocked.dateMeta.description, 'Secret rooftop table for two');
  assert.equal(
    unlocked.keyFingerprint,
    deriveE2eeFingerprint('654321', 'jaan')
  );
});
