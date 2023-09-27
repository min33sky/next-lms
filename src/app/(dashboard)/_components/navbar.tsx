import React from 'react';
import MobileSidebar from './mobile-sidebar';
import { NavbarRoutes } from '@/components/navbar-routes';

export default function Navbar() {
  return (
    <div className="p-4 border-b h-full flex items-center bg-background shadow-sm">
      <MobileSidebar />
      <NavbarRoutes />
    </div>
  );
}
