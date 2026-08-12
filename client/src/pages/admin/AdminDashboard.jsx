import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ListOrdered, AlertTriangle, Wallet, MapPin } from 'lucide-react';
import api from '../../api/axios.js';
import { formatPrice } from '../../utils/format.js';

const STATUS_COLORS = {
  'Pending Confirmation': 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard/stats').then(({ data }) => setStats(data.stats));
  }, []);

  if (!stats) return <p className="text-slate-400">Loading…</p>;

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ListOrdered, color: 'bg-primary-50 text-primary-600' },
    { label: 'Active Products', value: stats.totalProducts, icon: Package, color: 'bg-accent-50 text-accent-600' },
    { label: 'Low Stock (≤5)', value: stats.lowStockCount, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
    {
      label: 'Confirmed Revenue',
      value: formatPrice(stats.confirmedRevenue, 'fr'),
      icon: Wallet,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-ink">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-ink">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start text-slate-400">
                  <th className="pb-2 text-start">Order #</th>
                  <th className="pb-2 text-start">Customer</th>
                  <th className="pb-2 text-start">Province</th>
                  <th className="pb-2 text-start">Total</th>
                  <th className="pb-2 text-start">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id} className="border-t border-slate-50">
                    <td className="py-2 font-bold">{o.orderNumber}</td>
                    <td className="py-2">{o.customer.fullName}</td>
                    <td className="py-2">{o.customer.provinceName}</td>
                    <td className="py-2 tnum">{formatPrice(o.totalPrice, 'fr')}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/admin/orders" className="mt-4 inline-block text-sm font-bold text-primary-600 hover:underline">
            View all orders →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-ink">
            <MapPin size={16} /> Top Provinces
          </h2>
          <ul className="space-y-3">
            {stats.topProvinces.map((p) => (
              <li key={p.province} className="flex items-center justify-between text-sm">
                <span>{p.province}</span>
                <span className="font-bold text-primary-600">{p.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
