const { hashPhone } = require('./hash');

const META_GRAPH_VERSION = 'v20.0';

/**
 * Send a server-side "Purchase" event to Meta's Conversions API.
 * Uses the same `eventId` as the browser-side Pixel event so Meta
 * deduplicates the two into a single event.
 *
 * @param {object} params
 * @param {object} params.settings - Settings doc (must include pixels.metaPixelId + metaAccessToken)
 * @param {object} params.order - The saved Order document
 * @param {string} params.eventId - Shared dedup id
 * @param {string} params.clientIp
 * @param {string} params.userAgent
 * @param {string} [params.eventSourceUrl]
 */
async function sendMetaPurchaseEvent({ settings, order, eventId, clientIp, userAgent, eventSourceUrl }) {
  const pixelId = settings?.pixels?.metaPixelId;
  const accessToken = settings?.pixels?.metaAccessToken;

  if (!settings?.pixels?.metaEnabled || !pixelId || !accessToken) {
    return { skipped: true, reason: 'Meta CAPI not configured/enabled' };
  }

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: 'website',
        user_data: {
          ph: [hashPhone(order.customer.phone)].filter(Boolean),
          client_ip_address: clientIp,
          client_user_agent: userAgent,
        },
        custom_data: {
          currency: 'DZD',
          value: order.totalPrice,
          content_type: 'product',
          contents: order.items.map((item) => ({
            id: String(item.product),
            quantity: item.quantity,
            item_price: item.price,
          })),
          order_id: order.orderNumber,
        },
      },
    ],
    ...(settings.pixels.metaTestEventCode ? { test_event_code: settings.pixels.metaTestEventCode } : {}),
  };

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!response.ok) {
      console.error('[Meta CAPI] Error response:', json);
      return { skipped: false, success: false, error: json };
    }
    return { skipped: false, success: true, response: json };
  } catch (error) {
    console.error('[Meta CAPI] Request failed:', error.message);
    return { skipped: false, success: false, error: error.message };
  }
}

module.exports = { sendMetaPurchaseEvent };
