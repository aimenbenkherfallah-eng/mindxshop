import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, X, MessageSquareText } from 'lucide-react';
import StarRating from './StarRating.jsx';
import api from '../../api/axios.js';
import { useLang } from '../../context/LangContext.jsx';
import { formatDate } from '../../utils/format.js';

export default function ReviewSection({ product, onReviewAdded }) {
  const { t, lang } = useLang();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 5 - files.length);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);
    try {
      let photos = [];
      if (files.length) {
        const formData = new FormData();
        files.forEach((f) => formData.append('photos', f));
        const { data } = await api.post('/uploads/review-photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        photos = data.urls;
      }

      const { data } = await api.post(`/products/${product._id}/reviews`, { name, rating, comment, photos });
      toast.success(t('product.reviewThanks'));
      setName('');
      setComment('');
      setRating(5);
      setFiles([]);
      onReviewAdded?.(data.product);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const reviews = [...(product.reviews || [])].reverse();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-black text-ink">
          <MessageSquareText size={20} className="text-accent-600" />
          {t('product.reviews')} ({product.numReviews || 0})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-sm text-ink/50">{t('product.noReviews')}</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, idx) => (
              <div key={r._id || idx} className="card p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-bold text-ink">{r.name}</p>
                  <span className="text-xs text-ink/40">{formatDate(r.createdAt, lang)}</span>
                </div>
                <StarRating rating={r.rating} size={14} />
                <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
                {r.photos?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {r.photos.map((p, i) => (
                      <img key={i} src={p} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-display text-lg font-black text-ink">{t('product.writeReview')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t('product.yourRating')}</label>
            <StarRating rating={rating} size={26} interactive onChange={setRating} />
          </div>
          <div>
            <label className="label">{t('product.yourName')}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          </div>
          <div>
            <label className="label">{t('product.yourComment')}</label>
            <textarea
              className="input min-h-[100px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              required
            />
          </div>
          <div>
            <label className="label">{t('product.addPhotos')}</label>
            <div className="flex flex-wrap gap-2">
              {files.map((f, idx) => (
                <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
                  <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute end-0 top-0 rounded-bl-lg bg-black/60 p-0.5 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {files.length < 5 && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-primary-400 hover:text-primary-500">
                  <ImagePlus size={20} />
                  <input type="file" accept="image/*" multiple hidden onChange={handleFiles} />
                </label>
              )}
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? t('product.submitting') : t('product.submitReview')}
          </button>
        </form>
      </div>
    </div>
  );
}
