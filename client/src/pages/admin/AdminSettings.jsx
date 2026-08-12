import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios.js';

const TABS = ['General', 'Pixels', 'Shipping Fees', 'Bot Protection', 'Banners'];

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState('General');
  const [saving, setSaving] = useState(false);
  const [secrets, setSecrets] = useState({ metaAccessToken: '', tiktokAccessToken: '', botSecretKey: '' });

  const load = async () => {
    const { data } = await api.get('/admin/settings');
    setSettings(data.settings);
  };

  useEffect(() => {
    load();
  }, []);

  if (!settings) return <p className="text-slate-400">Loading…</p>;

  const update = (path, value) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      let obj = next;
      const keys = path.split('.');
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateFee = (code, fee) => {
    setSettings((prev) => ({
      ...prev,
      shippingFees: prev.shippingFees.map((f) => (f.provinceCode === code ? { ...f, fee: Number(fee) } : f)),
    }));
  };

  const addBanner = () =>
    setSettings((prev) => ({
      ...prev,
      banners: [...prev.banners, { imageUrl: '', link: '', titleAr: '', titleFr: '', active: true, sortOrder: prev.banners.length }],
    }));

  const updateBanner = (idx, field, value) =>
    setSettings((prev) => ({
      ...prev,
      banners: prev.banners.map((b, i) => (i === idx ? { ...b, [field]: value } : b)),
    }));

  const removeBanner = (idx) => setSettings((prev) => ({ ...prev, banners: prev.banners.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        storeName: settings.storeName,
        announcement: settings.announcement,
        pixels: {
          metaPixelId: settings.pixels.metaPixelId,
          metaEnabled: settings.pixels.metaEnabled,
          metaTestEventCode: settings.pixels.metaTestEventCode,
          tiktokPixelId: settings.pixels.tiktokPixelId,
          tiktokEnabled: settings.pixels.tiktokEnabled,
          ...(secrets.metaAccessToken ? { metaAccessToken: secrets.metaAccessToken } : {}),
          ...(secrets.tiktokAccessToken ? { tiktokAccessToken: secrets.tiktokAccessToken } : {}),
        },
        botProtection: {
          provider: settings.botProtection.provider,
          siteKey: settings.botProtection.siteKey,
          ...(secrets.botSecretKey ? { secretKey: secrets.botSecretKey } : {}),
        },
        shippingFees: settings.shippingFees,
        banners: settings.banners,
      };
      await api.put('/admin/settings', payload);
      toast.success('Settings saved');
      setSecrets({ metaAccessToken: '', tiktokAccessToken: '', botSecretKey: '' });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-ink">Store Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary py-2.5">
          <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`border-b-2 px-3 py-2 text-sm font-bold transition-colors ${
              tab === tb ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400 hover:text-ink'
            }`}
          >
            {tb}
          </button>
        ))}
      </div>

      {tab === 'General' && (
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <div>
            <label className="label">Store Name</label>
            <input className="input" value={settings.storeName} onChange={(e) => update('storeName', e.target.value)} />
          </div>
          <div>
            <label className="label">Announcement bar — Arabic</label>
            <input dir="rtl" className="input" value={settings.announcement.ar} onChange={(e) => update('announcement.ar', e.target.value)} />
          </div>
          <div>
            <label className="label">Announcement bar — French</label>
            <input className="input" value={settings.announcement.fr} onChange={(e) => update('announcement.fr', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={settings.announcement.active} onChange={(e) => update('announcement.active', e.target.checked)} />
            Show announcement bar
          </label>
        </div>
      )}

      {tab === 'Pixels' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-bold text-ink">Meta (Facebook) Pixel + Conversions API</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={settings.pixels.metaEnabled} onChange={(e) => update('pixels.metaEnabled', e.target.checked)} />
                Enabled
              </label>
              <div>
                <label className="label">Pixel ID</label>
                <input className="input" value={settings.pixels.metaPixelId} onChange={(e) => update('pixels.metaPixelId', e.target.value)} />
              </div>
              <div>
                <label className="label">Conversions API Access Token {settings.metaAccessTokenSet && <span className="text-emerald-600">(set)</span>}</label>
                <input
                  className="input"
                  type="password"
                  placeholder={settings.metaAccessTokenSet ? '••••••••••• (leave blank to keep)' : 'Paste access token'}
                  value={secrets.metaAccessToken}
                  onChange={(e) => setSecrets((s) => ({ ...s, metaAccessToken: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Test Event Code (optional)</label>
                <input className="input" value={settings.pixels.metaTestEventCode || ''} onChange={(e) => update('pixels.metaTestEventCode', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-bold text-ink">TikTok Pixel + Events API</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={settings.pixels.tiktokEnabled} onChange={(e) => update('pixels.tiktokEnabled', e.target.checked)} />
                Enabled
              </label>
              <div>
                <label className="label">Pixel ID</label>
                <input className="input" value={settings.pixels.tiktokPixelId} onChange={(e) => update('pixels.tiktokPixelId', e.target.value)} />
              </div>
              <div>
                <label className="label">Events API Access Token {settings.tiktokAccessTokenSet && <span className="text-emerald-600">(set)</span>}</label>
                <input
                  className="input"
                  type="password"
                  placeholder={settings.tiktokAccessTokenSet ? '••••••••••• (leave blank to keep)' : 'Paste access token'}
                  value={secrets.tiktokAccessToken}
                  onChange={(e) => setSecrets((s) => ({ ...s, tiktokAccessToken: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Shipping Fees' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <p className="mb-4 text-sm text-slate-500">Shipping fee (DZD) per province, applied at checkout based on the customer's selection.</p>
          <div className="max-h-[560px] overflow-y-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-2 text-start">#</th>
                  <th className="p-2 text-start">Province</th>
                  <th className="p-2 text-start">Fee (DZD)</th>
                </tr>
              </thead>
              <tbody>
                {settings.shippingFees
                  .slice()
                  .sort((a, b) => a.provinceCode - b.provinceCode)
                  .map((f) => (
                    <tr key={f.provinceCode} className="border-t border-slate-50">
                      <td className="p-2 text-slate-400">{f.provinceCode}</td>
                      <td className="p-2 font-bold">{f.provinceName}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          className="input w-28 py-1.5"
                          value={f.fee}
                          onChange={(e) => updateFee(f.provinceCode, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Bot Protection' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="space-y-4">
            <div>
              <label className="label">Provider</label>
              <select className="input" value={settings.botProtection.provider} onChange={(e) => update('botProtection.provider', e.target.value)}>
                <option value="none">None</option>
                <option value="recaptcha">Google reCAPTCHA v3</option>
                <option value="turnstile">Cloudflare Turnstile</option>
              </select>
            </div>
            <div>
              <label className="label">Site Key (public)</label>
              <input className="input" value={settings.botProtection.siteKey} onChange={(e) => update('botProtection.siteKey', e.target.value)} />
            </div>
            <div>
              <label className="label">Secret Key {settings.botSecretKeySet && <span className="text-emerald-600">(set)</span>}</label>
              <input
                className="input"
                type="password"
                placeholder={settings.botSecretKeySet ? '••••••••••• (leave blank to keep)' : 'Paste secret key'}
                value={secrets.botSecretKey}
                onChange={(e) => setSecrets((s) => ({ ...s, botSecretKey: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'Banners' && (
        <div className="space-y-4">
          {settings.banners.map((b, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold text-ink">Banner #{idx + 1}</p>
                <button onClick={() => removeBanner(idx)} className="text-sale hover:underline">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Image URL</label>
                  <input className="input" value={b.imageUrl} onChange={(e) => updateBanner(idx, 'imageUrl', e.target.value)} />
                </div>
                <div>
                  <label className="label">Link (optional)</label>
                  <input className="input" value={b.link} onChange={(e) => updateBanner(idx, 'link', e.target.value)} />
                </div>
                <div>
                  <label className="label">Title (Arabic)</label>
                  <input dir="rtl" className="input" value={b.titleAr} onChange={(e) => updateBanner(idx, 'titleAr', e.target.value)} />
                </div>
                <div>
                  <label className="label">Title (French)</label>
                  <input className="input" value={b.titleFr} onChange={(e) => updateBanner(idx, 'titleFr', e.target.value)} />
                </div>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={b.active} onChange={(e) => updateBanner(idx, 'active', e.target.checked)} />
                Active
              </label>
            </div>
          ))}
          <button onClick={addBanner} className="btn-outline">
            <Plus size={16} /> Add Banner
          </button>
        </div>
      )}
    </div>
  );
}
