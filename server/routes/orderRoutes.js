const express = require('express');
const { createOrder } = require('../controllers/orderController');
const { orderLimiter } = require('../middleware/rateLimiters');
const { orderValidators, validate } = require('../middleware/validators');

const router = express.Router();

router.post('/', orderLimiter, orderValidators, validate, createOrder);

module.exports = router;
