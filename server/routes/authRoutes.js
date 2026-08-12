const express = require('express');
const { loginAdmin, logoutAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiters');
const { loginValidators, validate } = require('../middleware/validators');

const router = express.Router();

router.post('/admin/login', loginLimiter, loginValidators, validate, loginAdmin);
router.post('/admin/logout', protect, logoutAdmin);
router.get('/admin/me', protect, getMe);

module.exports = router;
