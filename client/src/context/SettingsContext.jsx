import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { loadMetaPixel, loadTikTokPixel } from '../utils/pixels';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/settings/public');
        if (cancelled) return;
        setSettings(data.settings);

        if (data.settings.pixels?.metaEnabled && data.settings.pixels?.metaPixelId) {
          loadMetaPixel(data.settings.pixels.metaPixelId);
        }
        if (data.settings.pixels?.tiktokEnabled && data.settings.pixels?.tiktokPixelId) {
          loadTikTokPixel(data.settings.pixels.tiktokPixelId);
        }
      } catch (err) {
        console.warn('[Settings] Failed to load public settings:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getShippingFee = (provinceCode) => {
    const entry = settings?.shippingFees?.find((f) => f.provinceCode === Number(provinceCode));
    return entry ? entry.fee : 0;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, getShippingFee }}>{children}</SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
