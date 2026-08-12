const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { productValidators, mongoIdParam, validate } = require('../middleware/validators');

const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/adminProductController');
const { listOrders, getOrder, updateOrderStatus } = require('../controllers/adminOrderController');
const { getAdminSettings, updateSettings } = require('../controllers/settingsController');
const { getDashboardStats } = require('../controllers/dashboardController');
const { uploadImages } = require('../controllers/uploadController');

const router = express.Router();

// Every route below requires a valid admin JWT cookie
router.use(protect, adminOnly);

// Products
router.get('/products', listProducts);
router.post('/products', productValidators, validate, createProduct);
router.get('/products/:id', mongoIdParam('id'), validate, getProduct);
router.put('/products/:id', mongoIdParam('id'), validate, updateProduct);
router.delete('/products/:id', mongoIdParam('id'), validate, deleteProduct);

// Orders
router.get('/orders', listOrders);
router.get('/orders/:id', mongoIdParam('id'), validate, getOrder);
router.put('/orders/:id/status', mongoIdParam('id'), validate, updateOrderStatus);

// Settings
router.get('/settings', getAdminSettings);
router.put('/settings', updateSettings);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Uploads
router.post('/uploads', upload.array('images', 8), uploadImages);

module.exports = router;
