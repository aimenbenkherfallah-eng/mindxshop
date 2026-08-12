const { hashPhone } = require('./hash');

const TIKTOK_API_VERSION = 'v1.3';

/**
 * Send a server-side "CompletePayment" event to TikTok's Events API.
 * Uses the same `eventId` as the browser-side TikTok Pixel event so TikTok
 * deduplicates the two into a single event.
 */
async function sendTikTokPurchaseEvent({ settings, order, eventId, clientIp, userAgent, eventSourceUrl }) {
  const pixelId = settings?.pixels?.tiktokPixelId;
  const accessToken = settings?.pixels?.tiktokAccessToken;

  if (!settings?.pixels?.tiktokEnabled || !pixelId || !accessToken) {
    return { skipped: true, reason: 'TikTok Events API not configured/enabled' };
  }

  const payload = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [
      {
        event: 'CompletePayment',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        user: {
          phone: [hashPhone(order.customer.phone)].filter(Boolean),
          ip: clientIp,
          user_agent: userAgent,
        },
        properties: {
          currency: 'DZD',
          value: order.totalPrice,
          contents: order.items.map((item) => ({
            content_id: String(item.product),
            quantity: item.quantity,
            price: item.price,
          })),
        },
        page: { url: eventSourceUrl },
      },
    ],
  };

  const url = `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/event/track/`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!response.ok || json.code !== 0) {
      console.error('[TikTok Events API] Error response:', json);
      return { skipped: false, success: false, error: json };
    }
    return { skipped: false, success: true, response: json };
  } catch (error) {
    console.error('[TikTok Events API] Request failed:', error.message);
    return { skipped: false, success: false, error: error.message };
  }
}

module.exports = { sendTikTokPurchaseEvent };
