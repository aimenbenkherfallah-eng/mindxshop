const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const { ORDER_STATUSES } = require('../models/Order');

// @desc    List orders with filters (status, province 1-69, search, date range) + pagination
// @route   GET /api/admin/orders?status=&province=&search=&page=&limit=
// @access  Private/Admin
const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.province) filter['customer.provinceCode'] = Number(req.query.province);
  if (req.query.search) {
    filter.$or = [
      { orderNumber: { $regex: req.query.search, $options: 'i' } },
      { 'customer.fullName': { $regex: req.query.search, $options: 'i' } },
      { 'customer.phone': { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.dateFrom || req.query.dateTo) {
    filter.createdAt = {};
    if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
    if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo);
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, page, pages: Math.ceil(total / limit) || 1, total });
});

// @desc    Get a single order
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json({ success: true, order });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (req.body.adminNote !== undefined) order.adminNote = req.body.adminNote;
  await order.save();

  res.json({ success: true, order });
});

module.exports = { listOrders, getOrder, updateOrderStatus, ORDER_STATUSES };
