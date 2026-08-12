import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images = [], alt = '' }) {
  const [active, setActive] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const containerRef = useRef(null);

  const safeImages = images.length ? images : ['https://placehold.co/800x800?text=Sidahmed+Shop'];

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${safeImages[active]})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const next = () => setActive((a) => (a + 1) % safeImages.length);
  const prev = () => setActive((a) => (a - 1 + safeImages.length) % safeImages.length);

  return (
    <div>
      <div
        ref={containerRef}
        className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-sand"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomStyle({ display: 'none' })}
      >
        <img src={safeImages[active]} alt={alt} className="h-full w-full object-cover" />

        {/* Magnifier overlay: visible on hover (desktop), shows a 200% zoomed crop */}
        <div
          className="pointer-events-none absolute inset-0 hidden bg-no-repeat opacity-0 transition-opacity duration-150 group-hover:opacity-100 lg:group-hover:block"
          style={{ ...zoomStyle, backgroundSize: '200%' }}
        />

        {safeImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-card hover:bg-white"
              aria-label="previous image"
            >
              <ChevronLeft size={20} className="flip-rtl" />
            </button>
            <button
              onClick={next}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-card hover:bg-white"
              aria-label="next image"
            >
              <ChevronRight size={20} className="flip-rtl" />
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setActive(idx)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                active === idx ? 'border-primary-600' : 'border-transparent'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
