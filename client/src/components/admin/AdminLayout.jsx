import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';

export default function AdminLayout() {
  return (
    <div className="flex bg-slate-50 font-body" dir="ltr">
      <AdminSidebar />
      <main className="min-h-screen flex-1 overflow-x-hidden p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
