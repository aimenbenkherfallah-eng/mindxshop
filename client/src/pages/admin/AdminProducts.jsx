import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import api from '../../api/axios.js';
import { formatPrice } from '../../utils/format.js';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (searchTerm = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/products', { params: { search: searchTerm, limit: 100 } });
      setProducts(data.products);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-ink">Products</h1>
        <Link to="/admin/products/new" className="btn-primary py-2.5">
          <Plus size={16} /> New Product
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
        className="mb-4 max-w-sm"
      >
        <div className="relative">
          <input className="input py-2.5 ps-9" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-start text-slate-500">
            <tr>
              <th className="p-3 text-start">Image</th>
              <th className="p-3 text-start">Title</th>
              <th className="p-3 text-start">Category</th>
              <th className="p-3 text-start">Price</th>
              <th className="p-3 text-start">Stock</th>
              <th className="p-3 text-start">Status</th>
              <th className="p-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-t border-slate-50">
                  <td className="p-3">
                    <img src={p.images?.[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  </td>
                  <td className="max-w-[220px] truncate p-3 font-bold">{p.title}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3 tnum">
                    {formatPrice(p.discountedPrice ?? p.price, 'fr')}
                    {p.discountedPrice && <span className="ms-1 text-xs text-slate-400 line-through">{formatPrice(p.price, 'fr')}</span>}
                  </td>
                  <td className="p-3">
                    <span className={p.stock <= 5 ? 'font-bold text-amber-600' : ''}>{p.stock}</span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/products/${p._id}`} className="rounded-lg p-1.5 text-primary-600 hover:bg-primary-50">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="rounded-lg p-1.5 text-sale hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
