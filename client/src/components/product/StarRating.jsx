import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, size = 16, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(s)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${s} star`}
        >
          <Star
            size={size}
            className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
          />
        </button>
      ))}
    </div>
  );
}
