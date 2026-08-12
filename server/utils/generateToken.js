const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for a user id and attach it to the response as an httpOnly,
 * Secure (in prod), SameSite=Strict cookie. This keeps the token out of
 * reach of client-side JS (mitigating XSS-based token theft) while
 * SameSite=Strict blocks the cookie from being sent on cross-site requests
 * (mitigating CSRF).
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  const cookieName = process.env.COOKIE_NAME || 'sidahmed_admin_token';

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: '/',
  });

  return token;
};

const clearTokenCookie = (res) => {
  const cookieName = process.env.COOKIE_NAME || 'sidahmed_admin_token';
  res.cookie(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    domain: process.env.COOKIE_DOMAIN || undefined,
    expires: new Date(0),
    path: '/',
  });
};

module.exports = { generateToken, clearTokenCookie };
