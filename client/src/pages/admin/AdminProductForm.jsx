import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ImagePlus, X, ArrowLeft } from 'lucide-react';
import api from '../../api/axios.js';

const emptyForm = {
  title: '',
  titleAr: '',
  description: '',
  descriptionAr: '',
  price: '',
  discountedPrice: '',
  category: '',
  stock: '',
  sku: '',
  isTrending: false,
  isActive: true,
  images: [],
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/admin/products/${id}`).then(({ data }) => {
        const p = data.product;
        setForm({
          title: p.title,
          titleAr: p.titleAr || '',
          description: p.description,
          descriptionAr: p.descriptionAr || '',
          price: p.price,
          discountedPrice: p.discountedPrice || '',
          category: p.category,
          stock: p.stock,
          sku: p.sku || '',
          isTrending: p.isTrending,
          isActive: p.isActive,
          images: p.images,
        });
      });
    }
  }, [id, isEdit]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const { data } = await api.post('/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update('images', [...form.images, ...data.urls].slice(0, 8));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => update('images', form.images.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) {
      toast.error('Add at least one image');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
        stock: Number(form.stock),
      };
      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-ink">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="mb-6 text-2xl font-black text-ink">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => update('title', e.target.value)} required maxLength={150} />
          </div>
          <div>
            <label className="label">Title (Arabic)</label>
            <input className="input" dir="rtl" value={form.titleAr} onChange={(e) => update('titleAr', e.target.value)} maxLength={150} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => update('description', e.target.value)} required />
          </div>
          <div>
            <label className="label">Description (Arabic)</label>
            <textarea className="input min-h-[100px]" dir="rtl" value={form.descriptionAr} onChange={(e) => update('descriptionAr', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="label">Price (DZD)</label>
            <input type="number" min="0" className="input" value={form.price} onChange={(e) => update('price', e.target.value)} required />
          </div>
          <div>
            <label className="label">Discounted Price</label>
            <input type="number" min="0" className="input" value={form.discountedPrice} onChange={(e) => update('discountedPrice', e.target.value)} />
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" min="0" className="input" value={form.stock} onChange={(e) => update('stock', e.target.value)} required />
          </div>
          <div>
            <label className="label">SKU</label>
            <input className="input" value={form.sku} onChange={(e) => update('sku', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Category</label>
          <input className="input" value={form.category} onChange={(e) => update('category', e.target.value)} required maxLength={60} />
        </div>

        <div>
          <label className="label">Images</label>
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, idx) => (
              <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200">
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute end-0 top-0 rounded-bl-lg bg-black/60 p-0.5 text-white">
                  <X size={12} />
                </button>
              </div>
            ))}
            {form.images.length < 8 && (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-primary-400 hover:text-primary-500">
                <ImagePlus size={20} />
                <span className="text-[10px]">{uploading ? '...' : 'Upload'}</span>
                <input type="file" accept="image/*" multiple hidden onChange={handleUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={form.isTrending} onChange={(e) => update('isTrending', e.target.checked)} />
            Trending (show on homepage)
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} />
            Active (visible in store)
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
