const express = require('express');
const { getPublicSettings } = require('../controllers/settingsController');

const router = express.Router();

router.get('/public', getPublicSettings);

module.exports = router;
