const crypto = require('crypto');

/**
 * Normalize an Algerian phone number to the E.164-ish digit-only form that
 * Meta/TikTok expect before hashing (no spaces, no leading zero ambiguity).
 * Example: "0550 12 34 56" -> "213550123456"
 */
const normalizePhone = (rawPhone) => {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (digits.startsWith('213')) return digits;
  if (digits.startsWith('0')) return `213${digits.slice(1)}`;
  return digits;
};

/** SHA-256 hash a lowercased, trimmed string — required format for CAPI PII fields. */
const sha256 = (value) => {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
};

const hashPhone = (rawPhone) => sha256(normalizePhone(rawPhone));

/** Generate a shared event id so browser Pixel events and server CAPI events dedupe. */
const generateEventId = () => crypto.randomUUID();

module.exports = { normalizePhone, sha256, hashPhone, generateEventId };
