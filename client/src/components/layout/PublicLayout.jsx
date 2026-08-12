import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
