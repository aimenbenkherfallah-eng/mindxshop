const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const { generateToken, clearTokenCookie } = require('../utils/generateToken');

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public (rate-limited)
const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username.toLowerCase().trim() }).select('+password');

  // Use the same generic error for "no such user" and "wrong password" so
  // the response never confirms whether a username exists.
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid username or password');
  }

  generateToken(res, user._id);
  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    user: { id: user._id, username: user.username, role: user.role },
  });
});

// @desc    Admin logout
// @route   POST /api/auth/admin/logout
// @access  Private
const logoutAdmin = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out' });
});

// @desc    Get current admin session
// @route   GET /api/auth/admin/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, username: req.user.username, role: req.user.role },
  });
});

module.exports = { loginAdmin, logoutAdmin, getMe };
