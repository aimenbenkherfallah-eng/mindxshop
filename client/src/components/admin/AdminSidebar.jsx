import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ListOrdered, Settings, LogOut, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produits', icon: Package },
  { to: '/admin/orders', label: 'Commandes', icon: ListOrdered },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-e border-slate-800 bg-ink text-white">
      <div className="flex items-center gap-2 border-b border-white/10 p-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 font-black">S</span>
        <div>
          <p className="font-display text-sm font-black">Sidahmed Shop</p>
          <p className="text-xs text-white/50">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <a
          href={import.meta.env.VITE_STOREFRONT_URL || '/'}
          target="_blank"
          rel="noreferrer"
          className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Store size={18} />
          Voir la boutique
        </a>
        <div className="mb-2 px-3 text-xs text-white/40">Connecté: {user?.username}</div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/70 hover:bg-sale/20 hover:text-white"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
