const asyncHandler = require('../middleware/asyncHandler');
const Settings = require('../models/Settings');
const { ALGERIA_PROVINCES } = require('../data/algeriaProvinces');

/**
 * Fetch the singleton Settings doc, creating it (with default shipping fees
 * for all 69 provinces) on first run. Shared by controllers across the app.
 */
async function getSettingsDoc({ withSecrets = false } = {}) {
  let query = Settings.findOne({ singletonKey: 'main' });
  if (withSecrets) {
    query = query.select('+pixels.metaAccessToken +pixels.tiktokAccessToken +botProtection.secretKey');
  }
  let settings = await query;

  if (!settings) {
    settings = await Settings.create({
      singletonKey: 'main',
      shippingFees: ALGERIA_PROVINCES.map((p) => ({
        provinceCode: p.code,
        provinceName: p.name,
        provinceNameAr: p.nameAr,
        fee: 500,
      })),
    });
  }

  return settings;
}

// @desc    Public store settings needed by the storefront
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsDoc();

  res.json({
    success: true,
    settings: {
      storeName: settings.storeName,
      announcement: settings.announcement,
      pixels: {
        metaPixelId: settings.pixels.metaEnabled ? settings.pixels.metaPixelId : '',
        metaEnabled: settings.pixels.metaEnabled,
        tiktokPixelId: settings.pixels.tiktokEnabled ? settings.pixels.tiktokPixelId : '',
        tiktokEnabled: settings.pixels.tiktokEnabled,
      },
      botProtection: {
        provider: settings.botProtection.provider,
        siteKey: settings.botProtection.siteKey, // site keys are public by design
      },
      shippingFees: settings.shippingFees,
      banners: settings.banners.filter((b) => b.active).sort((a, b) => a.sortOrder - b.sortOrder),
    },
  });
});

// @desc    Full settings for the admin settings page (secrets masked)
// @route   GET /api/admin/settings
// @access  Private/Admin
const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsDoc({ withSecrets: true });
  const obj = settings.toObject();

  // Never send raw secrets back to the browser; tell the UI whether one is set instead.
  const metaAccessTokenSet = !!obj.pixels.metaAccessToken;
  const tiktokAccessTokenSet = !!obj.pixels.tiktokAccessToken;
  const botSecretKeySet = !!obj.botProtection.secretKey;
  delete obj.pixels.metaAccessToken;
  delete obj.pixels.tiktokAccessToken;
  delete obj.botProtection.secretKey;

  res.json({
    success: true,
    settings: { ...obj, metaAccessTokenSet, tiktokAccessTokenSet, botSecretKeySet },
  });
});

// @desc    Update store settings (partial update / deep-merge)
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsDoc({ withSecrets: true });
  const body = req.body || {};

  if (body.storeName !== undefined) settings.storeName = body.storeName;

  if (body.announcement) {
    const a = body.announcement;
    if (a.ar !== undefined) settings.announcement.ar = a.ar;
    if (a.fr !== undefined) settings.announcement.fr = a.fr;
    if (a.active !== undefined) settings.announcement.active = a.active;
  }

  if (body.pixels) {
    const p = body.pixels;
    if (p.metaPixelId !== undefined) settings.pixels.metaPixelId = p.metaPixelId;
    if (p.metaEnabled !== undefined) settings.pixels.metaEnabled = p.metaEnabled;
    if (p.metaTestEventCode !== undefined) settings.pixels.metaTestEventCode = p.metaTestEventCode;
    if (p.tiktokPixelId !== undefined) settings.pixels.tiktokPixelId = p.tiktokPixelId;
    if (p.tiktokEnabled !== undefined) settings.pixels.tiktokEnabled = p.tiktokEnabled;
    // Only overwrite a secret if a non-empty replacement was actually sent
    if (p.metaAccessToken) settings.pixels.metaAccessToken = p.metaAccessToken;
    if (p.tiktokAccessToken) settings.pixels.tiktokAccessToken = p.tiktokAccessToken;
  }

  if (body.botProtection) {
    const b = body.botProtection;
    if (b.provider !== undefined) settings.botProtection.provider = b.provider;
    if (b.siteKey !== undefined) settings.botProtection.siteKey = b.siteKey;
    if (b.secretKey) settings.botProtection.secretKey = b.secretKey;
  }

  if (Array.isArray(body.shippingFees)) {
    settings.shippingFees = body.shippingFees.map((f) => ({
      provinceCode: Number(f.provinceCode),
      provinceName: f.provinceName,
      provinceNameAr: f.provinceNameAr,
      fee: Number(f.fee) || 0,
    }));
  }

  if (Array.isArray(body.banners)) {
    settings.banners = body.banners;
  }

  await settings.save();
  res.json({ success: true, message: 'Settings updated' });
});

module.exports = { getSettingsDoc, getPublicSettings, getAdminSettings, updateSettings };
