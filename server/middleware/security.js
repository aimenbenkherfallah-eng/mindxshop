const helmet = require('helmet');
const cors = require('cors');

/**
 * Helmet: secure HTTP headers (XSS protection via CSP, no-sniff, HSTS, etc).
 * The CSP allow-list is scoped to what this store actually needs in the
 * browser: itself, the Meta Pixel + TikTok Pixel loader scripts/beacons,
 * and Google Fonts. Extend this list if you add other third-party scripts.
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://connect.facebook.net', 'https://analytics.tiktok.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: [
        "'self'",
        'https://www.facebook.com',
        'https://connect.facebook.net',
        'https://analytics.tiktok.com',
        'https://business-api.tiktok.com',
      ],
      frameSrc: ["'self'", 'https://www.google.com', 'https://challenges.cloudflare.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow /uploads images to be embedded by the frontend origin
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
});

/** CORS: only the configured storefront origin may call the API with credentials. */
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (curl/Postman with no Origin header) and configured origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

module.exports = { helmetMiddleware, corsMiddleware };
