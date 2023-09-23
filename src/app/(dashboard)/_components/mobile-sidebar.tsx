import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import React from 'react';
import Sidebar from './sidebar';

export default function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <MenuIcon className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side={'left'} className="p-0 bg-white">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
