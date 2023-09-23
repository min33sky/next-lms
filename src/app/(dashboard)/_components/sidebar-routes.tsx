'use client';

import { BarChartIcon, CompassIcon, LayoutIcon, ListIcon } from 'lucide-react';
import React from 'react';
import SidebarItem from './sidebar-item';
import { usePathname } from 'next/navigation';

const guestRoutes = [
  {
    icon: LayoutIcon,
    label: 'Dashboard',
    href: '/',
  },
  {
    icon: CompassIcon,
    label: 'Browse',
    href: '/search',
  },
];

const teacherRoutes = [
  {
    icon: ListIcon,
    label: 'Courses',
    href: '/teacher/courses',
  },
  {
    icon: BarChartIcon,
    label: 'Analytics',
    href: '/teacher/analytics',
  },
];

export default function SidebarRoutes() {
  const pathname = usePathname();

  const isTeacherPage = pathname?.includes('/teacher');

  const routes = isTeacherPage ? teacherRoutes : guestRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
}
