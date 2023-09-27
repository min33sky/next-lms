'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { LogOutIcon } from 'lucide-react';
import SearchInput from './search-input';
import { isTeacher } from '@/lib/teacher';
import { ThemeToggle } from './theme-toggle';

export const NavbarRoutes = () => {
  const { userId } = useAuth();
  const pathname = usePathname();

  const isTeacherPage = pathname?.includes('/teacher');
  const isCoursePage = pathname?.includes('/courses');
  const isSearchPage = pathname === '/search';

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2 ml-auto">
        {isTeacherPage || isCoursePage ? (
          <Button size={'sm'} variant={'ghost'} asChild>
            <Link href={'/'}>
              <LogOutIcon className="h-4 w-4 mr-2" />
              나가기
            </Link>
          </Button>
        ) : isTeacher(userId) ? (
          <Button size={'sm'} variant={'ghost'} asChild>
            <Link href={'/teacher/courses'}>선생님 모드</Link>
          </Button>
        ) : null}

        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </>
  );
};
