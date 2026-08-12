const express = require('express');
const rateLimit = require('express-rate-limit');
const upload = require('../middleware/upload');
const { uploadImages } = require('../controllers/uploadController');

const router = express.Router();

// Customers can attach photos to a product review. Rate-limited separately
// from the order endpoint since it's a different abuse surface.
const reviewPhotoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message: 'Too many uploads, please slow down.' }),
});

router.post('/review-photos', reviewPhotoLimiter, upload.array('photos', 3), uploadImages);

module.exports = router;
