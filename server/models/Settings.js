const mongoose = require('mongoose');

const shippingFeeSchema = new mongoose.Schema(
  {
    provinceCode: { type: Number, required: true, min: 1, max: 69 },
    provinceName: { type: String, required: true },
    provinceNameAr: { type: String },
    fee: { type: Number, required: true, min: 0, default: 500 },
  },
  { _id: false, strict: true }
);

const bannerSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    link: { type: String, default: '' },
    titleAr: { type: String, default: '' },
    titleFr: { type: String, default: '' },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, strict: true }
);

const settingsSchema = new mongoose.Schema(
  {
    // Using a fixed key guarantees this is a singleton document
    singletonKey: { type: String, default: 'main', unique: true },

    storeName: { type: String, default: 'Sidahmed Shop' },

    announcement: {
      ar: { type: String, default: 'الدفع عند الاستلام والتوصيل إلى جميع الولايات 🚚' },
      fr: { type: String, default: 'Paiement à la livraison partout en Algérie 🚚' },
      active: { type: Boolean, default: true },
    },

    pixels: {
      metaPixelId: { type: String, default: '' },
      metaAccessToken: { type: String, default: '', select: false },
      metaTestEventCode: { type: String, default: '' },
      metaEnabled: { type: Boolean, default: false },

      tiktokPixelId: { type: String, default: '' },
      tiktokAccessToken: { type: String, default: '', select: false },
      tiktokEnabled: { type: Boolean, default: false },
    },

    botProtection: {
      provider: { type: String, enum: ['none', 'recaptcha', 'turnstile'], default: 'none' },
      siteKey: { type: String, default: '' },
      secretKey: { type: String, default: '', select: false },
    },

    shippingFees: { type: [shippingFeeSchema], default: [] },
    banners: { type: [bannerSchema], default: [] },
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
