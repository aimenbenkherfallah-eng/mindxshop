const asyncHandler = require('../middleware/asyncHandler');

// @desc    Upload one or more product images
// @route   POST /api/admin/uploads
// @access  Private/Admin
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const base = process.env.SERVER_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  const urls = req.files.map((file) => `${base}/uploads/${file.filename}`);

  res.status(201).json({ success: true, urls });
});

module.exports = { uploadImages };
