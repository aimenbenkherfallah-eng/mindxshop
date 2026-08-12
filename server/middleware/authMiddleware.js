const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

/**
 * Verifies the JWT stored in the httpOnly cookie and attaches the
 * authenticated user to req.user. Rejects with 401 if missing/invalid.
 */
const protect = asyncHandler(async (req, res, next) => {
  const cookieName = process.env.COOKIE_NAME || 'sidahmed_admin_token';
  const token = req.cookies?.[cookieName];

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, invalid or expired token');
  }
});

/** Requires req.user (set by `protect`) to have the admin role. */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Not authorized as an admin');
};

module.exports = { protect, adminOnly };
