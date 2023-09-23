'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { LogOutIcon } from 'lucide-react';

export const NavbarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname?.includes('/teacher');
  const isPlayerPage = pathname?.includes('/chapter');

  return (
    <div className="flex gap-x-2 ml-auto">
      {isTeacherPage || isPlayerPage ? (
        <Button size={'sm'} variant={'ghost'} asChild>
          <Link href={'/'}>
            <LogOutIcon className="h-4 w-4 mr-2" />
            Exit
          </Link>
        </Button>
      ) : (
        <Button size={'sm'} variant={'ghost'} asChild>
          <Link href={'/teacher/courses'}>Teacher Mode</Link>
        </Button>
      )}

      <UserButton afterSignOutUrl="/" />
    </div>
  );
};
