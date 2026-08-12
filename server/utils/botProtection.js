/**
 * Verifies a bot-protection token (Google reCAPTCHA v3 or Cloudflare
 * Turnstile) submitted with the COD order form. Provider + secret come
 * from the Settings document so the admin can toggle/rotate them without a
 * redeploy.
 *
 * Returns { ok: boolean, reason?: string }.
 */
async function verifyBotToken({ settings, token, remoteIp }) {
  const provider = settings?.botProtection?.provider || 'none';

  if (provider === 'none') {
    // No bot protection configured — allow through. Rate limiting +
    // duplicate-order throttling still apply as a baseline defense.
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, reason: 'Missing bot-protection token' };
  }

  const secretKey = settings?.botProtection?.secretKey;
  if (!secretKey) {
    console.warn('[BotProtection] Provider configured but secretKey missing — failing open is disabled.');
    return { ok: false, reason: 'Bot protection misconfigured' };
  }

  try {
    if (provider === 'recaptcha') {
      const params = new URLSearchParams({ secret: secretKey, response: token });
      if (remoteIp) params.append('remoteip', remoteIp);

      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const json = await res.json();
      // reCAPTCHA v3 returns a 0.0–1.0 score; 0.5 is Google's suggested default threshold
      const passed = json.success && (json.score === undefined || json.score >= 0.5);
      return { ok: !!passed, reason: passed ? undefined : 'reCAPTCHA verification failed', raw: json };
    }

    if (provider === 'turnstile') {
      const params = new URLSearchParams({ secret: secretKey, response: token });
      if (remoteIp) params.append('remoteip', remoteIp);

      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const json = await res.json();
      return { ok: !!json.success, reason: json.success ? undefined : 'Turnstile verification failed', raw: json };
    }

    return { ok: false, reason: `Unknown bot-protection provider: ${provider}` };
  } catch (error) {
    console.error('[BotProtection] Verification request failed:', error.message);
    // Fail closed: if we can't verify, don't trust the order blindly.
    return { ok: false, reason: 'Bot protection verification request failed' };
  }
}

module.exports = { verifyBotToken };
