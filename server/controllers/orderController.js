const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const { getProvinceByCode } = require('../data/algeriaProvinces');
const { verifyBotToken } = require('../utils/botProtection');
const { generateEventId } = require('../utils/hash');
const { sendMetaPurchaseEvent } = require('../utils/metaConversionsAPI');
const { sendTikTokPurchaseEvent } = require('../utils/tiktokEventsAPI');
const { getSettingsDoc } = require('./settingsController');

const DUPLICATE_ORDER_WINDOW_MINUTES = 5;

/**
 * Blocks obvious automated flooding: if the same phone number OR the same
 * IP has an order created within the last few minutes, reject the new one.
 * This runs in addition to (not instead of) the express-rate-limit on the route.
 */
async function checkDuplicateOrder({ phone, ip }) {
  const since = new Date(Date.now() - DUPLICATE_ORDER_WINDOW_MINUTES * 60 * 1000);
  const existing = await Order.findOne({
    createdAt: { $gte: since },
    $or: [{ 'customer.phone': phone }, { ip }],
  }).sort({ createdAt: -1 });
  return existing;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip;
}

// @desc    Create a Cash-on-Delivery order
// @route   POST /api/orders
// @access  Public (rate-limited + bot-checked)
const createOrder = asyncHandler(async (req, res) => {
  const { items, customer, botToken, eventId: clientEventId } = req.body;
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'];

  const settings = await getSettingsDoc({ withSecrets: true });

  // 1) Bot protection (reCAPTCHA v3 / Turnstile), provider-driven from Settings
  const botCheck = await verifyBotToken({ settings, token: botToken, remoteIp: clientIp });
  if (!botCheck.ok) {
    res.status(400);
    throw new Error(botCheck.reason || 'Bot verification failed');
  }

  // 2) Province must be one of Algeria's 69 wilayas
  const province = getProvinceByCode(customer.provinceCode);
  if (!province) {
    res.status(400);
    throw new Error('Invalid province selected');
  }

  // 3) Duplicate/flooding throttle (same phone or IP within a short window)
  const duplicate = await checkDuplicateOrder({ phone: customer.phone, ip: clientIp });
  if (duplicate) {
    res.status(429);
    throw new Error(
      'We already received an order from you a moment ago. Our team will call you shortly to confirm it.'
    );
  }

  // 4) Resolve products, lock in price server-side (never trust client-sent prices), check stock
  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  for (const item of items) {
    const product = productMap.get(String(item.product));
    if (!product) {
      res.status(400);
      throw new Error(`Product ${item.product} is unavailable`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${product.title}"`);
    }
    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images?.[0],
      price: product.finalPrice ?? product.discountedPrice ?? product.price,
      quantity: item.quantity,
    });
  }

  const itemsPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const feeEntry = settings.shippingFees.find((f) => f.provinceCode === province.code);
  const shippingFee = feeEntry ? feeEntry.fee : 0;
  const totalPrice = itemsPrice + shippingFee;

  // 5) Human-readable order number
  const count = await Order.countDocuments();
  const orderNumber = `SDS-${String(count + 1).padStart(6, '0')}`;

  const eventId = clientEventId || generateEventId();

  const order = await Order.create({
    orderNumber,
    items: orderItems,
    customer: {
      fullName: customer.fullName,
      phone: customer.phone,
      provinceCode: province.code,
      provinceName: province.name,
      commune: customer.commune,
      address: customer.address,
    },
    itemsPrice,
    shippingFee,
    totalPrice,
    ip: clientIp,
    userAgent,
    tracking: { eventId },
  });

  // 6) Decrement stock (best-effort, non-blocking of the response below is fine since it's fast)
  await Promise.all(
    orderItems.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.quantity } }))
  );

  res.status(201).json({ success: true, order, eventId });

  // 7) Fire server-side Conversions API events AFTER responding to the customer,
  // so pixel/CAPI latency never slows down the checkout experience.
  const eventSourceUrl = req.headers.referer || process.env.CLIENT_URL;
  Promise.allSettled([
    sendMetaPurchaseEvent({ settings, order, eventId, clientIp, userAgent, eventSourceUrl }),
    sendTikTokPurchaseEvent({ settings, order, eventId, clientIp, userAgent, eventSourceUrl }),
  ])
    .then(([metaResult, tiktokResult]) => {
      const update = {};
      if (metaResult.value && !metaResult.value.skipped) update['tracking.metaCapiSent'] = !!metaResult.value.success;
      if (tiktokResult.value && !tiktokResult.value.skipped)
        update['tracking.tiktokCapiSent'] = !!tiktokResult.value.success;
      if (Object.keys(update).length) {
        Order.updateOne({ _id: order._id }, { $set: update }).catch(() => {});
      }
    })
    .catch((err) => console.error('[Order] CAPI dispatch error:', err.message));
});

module.exports = { createOrder };
