const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Aggregate stats for the admin dashboard home
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [statusCounts, totalProducts, lowStockCount, topProvinces, revenueAgg, recentOrders] = await Promise.all([
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: { $lte: 5 } }),
    Order.aggregate([
      { $group: { _id: '$customer.provinceName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $match: { status: { $in: ['Confirmed', 'Shipped', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(8),
  ]);

  const statusMap = statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
  const totalOrders = statusCounts.reduce((sum, s) => sum + s.count, 0);

  res.json({
    success: true,
    stats: {
      totalOrders,
      ordersByStatus: statusMap,
      totalProducts,
      lowStockCount,
      topProvinces: topProvinces.map((p) => ({ province: p._id, count: p.count })),
      confirmedRevenue: revenueAgg[0]?.total || 0,
      recentOrders,
    },
  });
});

module.exports = { getDashboardStats };
