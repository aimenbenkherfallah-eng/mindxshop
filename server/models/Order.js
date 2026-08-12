const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'Pending Confirmation',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 50 },
  },
  { _id: false, strict: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    customer: {
      fullName: { type: String, required: true, trim: true, maxlength: 100 },
      phone: { type: String, required: true, trim: true },
      provinceCode: { type: Number, required: true, min: 1, max: 69 },
      provinceName: { type: String, required: true },
      commune: { type: String, trim: true, maxlength: 150 },
      address: { type: String, trim: true, maxlength: 300 },
    },

    itemsPrice: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    status: { type: String, enum: ORDER_STATUSES, default: 'Pending Confirmation', index: true },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: ORDER_STATUSES },
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    paymentMethod: { type: String, default: 'COD', immutable: true },

    ip: { type: String },
    userAgent: { type: String },

    tracking: {
      eventId: { type: String }, // shared between Pixel client event and CAPI server event (dedup)
      metaCapiSent: { type: Boolean, default: false },
      tiktokCapiSent: { type: Boolean, default: false },
    },

    adminNote: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true, strict: true }
);

orderSchema.index({ 'customer.provinceCode': 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('save', function setStatusHistory(next) {
  if (this.isNew || this.isModified('status')) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
