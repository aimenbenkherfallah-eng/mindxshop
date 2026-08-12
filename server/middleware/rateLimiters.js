const rateLimit = require('express-rate-limit');

const jsonRateLimitHandler = (message) => (req, res /* , next */) => {
  res.status(429).json({ success: false, message });
};

/**
 * Admin login brute-force protection: max 5 FAILED attempts per IP per
 * 15 minutes. Successful logins don't count against the limit.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: jsonRateLimitHandler('Too many login attempts. Please try again in 15 minutes.'),
});

/**
 * COD order spam protection: max 3 order submissions per IP per 10 minutes.
 */
const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler('Too many orders submitted from this network. Please try again later.'),
});

/**
 * Baseline limiter applied to the whole API as defense in depth against
 * generic abuse/DoS (separate from the stricter, route-specific limiters).
 */
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler('Too many requests. Please slow down.'),
});

module.exports = { loginLimiter, orderLimiter, generalApiLimiter };
