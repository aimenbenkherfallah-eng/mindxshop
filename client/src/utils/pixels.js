/**
 * Meta Pixel + TikTok Pixel integration.
 *
 * Pixel IDs come from the backend (/api/settings/public) so they can be
 * toggled/rotated from the Admin > Settings screen without a redeploy.
 * Every tracked event that also has a server-side Conversions API
 * counterpart (Purchase) is given a shared `eventId` so Meta/TikTok
 * deduplicate the browser + server events into one.
 */

let metaLoaded = false;
let tiktokLoaded = false;

export function loadMetaPixel(pixelId) {
  if (!pixelId || metaLoaded || typeof window === 'undefined') return;
  metaLoaded = true;

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

export function loadTikTokPixel(pixelId) {
  if (!pixelId || tiktokLoaded || typeof window === 'undefined') return;
  tiktokLoaded = true;

  /* eslint-disable */
  !(function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    (ttq.methods = [
      'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
      'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent',
    ]),
      (ttq.setAndDefer = function (t, e) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      });
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    (ttq.instance = function (t) {
      for (var e = ttq._i[t] || [], n = 0; n < e.methods.length; n++) ttq.setAndDefer(e, e.methods[n]);
      return e;
    }),
      (ttq.load = function (e, n) {
        var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        (ttq._i = ttq._i || {}), (ttq._i[e] = []), (ttq._i[e]._u = i), (ttq._t = ttq._t || {}), (ttq._t[e] = +new Date()),
          (ttq._o = ttq._o || {}), (ttq._o[e] = n || {});
        var o = d.createElement('script');
        (o.type = 'text/javascript'), (o.async = !0), (o.src = i + '?sdkid=' + e + '&lib=' + t);
        var a = d.getElementsByTagName('script')[0];
        a.parentNode.insertBefore(o, a);
      });
    ttq.load(pixelId);
    ttq.page();
  })(window, document, 'ttq');
  /* eslint-enable */
}

const safe = (fn) => {
  try {
    fn();
  } catch (err) {
    console.warn('[Pixels] tracking call failed:', err.message);
  }
};

export function trackPageView() {
  safe(() => window.fbq && window.fbq('track', 'PageView'));
  safe(() => window.ttq && window.ttq.page());
}

export function trackViewContent(product) {
  const payload = {
    content_ids: [product._id],
    content_name: product.title,
    content_type: 'product',
    currency: 'DZD',
    value: product.discountedPrice ?? product.price,
  };
  safe(() => window.fbq && window.fbq('track', 'ViewContent', payload));
  safe(
    () =>
      window.ttq &&
      window.ttq.track('ViewContent', {
        content_id: product._id,
        content_name: product.title,
        content_type: 'product',
        currency: 'DZD',
        value: payload.value,
      })
  );
}

export function trackAddToCart(product, quantity = 1) {
  const value = (product.discountedPrice ?? product.price) * quantity;
  safe(
    () =>
      window.fbq &&
      window.fbq('track', 'AddToCart', {
        content_ids: [product._id],
        content_name: product.title,
        content_type: 'product',
        currency: 'DZD',
        value,
      })
  );
  safe(
    () =>
      window.ttq &&
      window.ttq.track('AddToCart', {
        content_id: product._id,
        content_name: product.title,
        content_type: 'product',
        currency: 'DZD',
        value,
        quantity,
      })
  );
}

export function trackInitiateCheckout(cartItems, total) {
  safe(
    () =>
      window.fbq &&
      window.fbq('track', 'InitiateCheckout', {
        content_ids: cartItems.map((i) => i.productId),
        currency: 'DZD',
        value: total,
        num_items: cartItems.length,
      })
  );
  safe(
    () =>
      window.ttq &&
      window.ttq.track('InitiateCheckout', {
        contents: cartItems.map((i) => ({ content_id: i.productId, quantity: i.quantity })),
        currency: 'DZD',
        value: total,
      })
  );
}

/** Fired once after a successful order — mirrors the server-side CAPI Purchase event via `eventId`. */
export function trackPurchase(order, eventId) {
  safe(
    () =>
      window.fbq &&
      window.fbq(
        'track',
        'Purchase',
        {
          content_ids: order.items.map((i) => i.product),
          content_type: 'product',
          currency: 'DZD',
          value: order.totalPrice,
          num_items: order.items.length,
        },
        { eventID: eventId }
      )
  );
  safe(
    () =>
      window.ttq &&
      window.ttq.track(
        'CompletePayment',
        {
          contents: order.items.map((i) => ({ content_id: i.product, quantity: i.quantity, price: i.price })),
          currency: 'DZD',
          value: order.totalPrice,
        },
        { event_id: eventId }
      )
  );
}
