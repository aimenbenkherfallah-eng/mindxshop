const express = require('express');
const { getProducts, getCategories, getProductById, addReview } = require('../controllers/productController');
const { productQueryValidators, reviewValidators, mongoIdParam, validate } = require('../middleware/validators');

const router = express.Router();

router.get('/', productQueryValidators, validate, getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.post('/:id/reviews', mongoIdParam('id'), reviewValidators, validate, addReview);

module.exports = router;
