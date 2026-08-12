import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/admin'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4" dir="ltr">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 font-display text-xl font-black text-white">
            S
          </span>
          <h1 className="font-display text-lg font-black text-ink">Sidahmed Shop Admin</h1>
          <p className="text-sm text-ink/50">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <div className="relative">
              <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input ps-9"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="input ps-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-sale">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
