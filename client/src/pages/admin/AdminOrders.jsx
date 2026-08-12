import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import api from '../../api/axios.js';
import { ALGERIA_PROVINCES } from '../../data/algeriaProvinces.js';
import { formatPrice, formatDate } from '../../utils/format.js';

const STATUSES = ['Pending Confirmation', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  'Pending Confirmation': 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [province, setProvince] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders', {
        params: { status, province, search, page, limit: 20 },
      });
      setOrders(data.orders);
      setPages(data.pages);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, province, page]);

  const handleStatusChange = async (orderId, newStatus) => {
    const prev = orders;
    setOrders((os) => os.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status updated');
    } catch (err) {
      setOrders(prev);
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-ink">Orders</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            load();
          }}
          className="relative"
        >
          <input
            className="input w-56 py-2.5 ps-9"
            placeholder="Search name, phone, order #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </form>

        <select
          className="input w-auto py-2.5"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="input w-auto py-2.5"
          value={province}
          onChange={(e) => {
            setProvince(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All provinces (1–69)</option>
          {ALGERIA_PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.code}. {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3 text-start">Order #</th>
              <th className="p-3 text-start">Date</th>
              <th className="p-3 text-start">Customer</th>
              <th className="p-3 text-start">Phone</th>
              <th className="p-3 text-start">Province</th>
              <th className="p-3 text-start">Total</th>
              <th className="p-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="border-t border-slate-50 align-top">
                  <td className="p-3 font-bold">{o.orderNumber}</td>
                  <td className="p-3 text-slate-500">{formatDate(o.createdAt, 'fr')}</td>
                  <td className="p-3">{o.customer.fullName}</td>
                  <td className="p-3 tnum">{o.customer.phone}</td>
                  <td className="p-3">
                    {o.customer.provinceCode}. {o.customer.provinceName}
                  </td>
                  <td className="p-3 tnum font-bold">{formatPrice(o.totalPrice, 'fr')}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className={`rounded-full border-0 px-2 py-1 text-xs font-bold ${STATUS_COLORS[o.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-bold ${p === page ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
