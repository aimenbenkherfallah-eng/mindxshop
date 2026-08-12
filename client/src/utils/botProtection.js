import { useCallback, useEffect, useRef } from 'react';

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Loads the configured bot-protection provider (from Settings) and exposes
 * getToken() to fetch a fresh verification token right before an order is
 * submitted. Attach `containerRef` to a <div> in the form for Turnstile.
 */
export function useBotProtection(botProtection) {
  const provider = botProtection?.provider || 'none';
  const siteKey = botProtection?.siteKey;
  const widgetIdRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (provider === 'recaptcha' && siteKey) {
      loadScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`, 'recaptcha-v3-script').catch(() => {});
    }
    if (provider === 'turnstile' && siteKey) {
      loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js', 'turnstile-script').catch(() => {});
    }
  }, [provider, siteKey]);

  const getToken = useCallback(async () => {
    if (provider === 'none' || !siteKey) return null;

    if (provider === 'recaptcha' && window.grecaptcha) {
      return new Promise((resolve) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action: 'submit_order' })
            .then(resolve)
            .catch(() => resolve(null));
        });
      });
    }

    if (provider === 'turnstile' && window.turnstile && containerRef.current) {
      return new Promise((resolve) => {
        if (widgetIdRef.current !== null) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            /* noop */
          }
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          size: 'invisible',
          callback: (token) => resolve(token),
          'error-callback': () => resolve(null),
        });
        window.turnstile.execute(widgetIdRef.current);
      });
    }

    return null;
  }, [provider, siteKey]);

  return { getToken, containerRef };
}
