import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-shop flex flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-6xl font-black text-primary-100">404</p>
      <h1 className="mt-2 font-display text-xl font-black text-ink">Page not found</h1>
      <Link to="/" className="btn-primary mt-6">
        Home
      </Link>
    </div>
  );
}
