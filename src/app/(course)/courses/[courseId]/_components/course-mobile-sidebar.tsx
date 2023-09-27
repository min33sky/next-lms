import { MenuIcon } from 'lucide-react';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CourseWithChaptersWithUserProgress } from '@/types';
import CourseSidebar from './course-sidebar';

interface CourseMobileSidebarProps {
  course: CourseWithChaptersWithUserProgress;
  progressCount: number;
}

export default function CourseMobileSidebar({
  course,
  progressCount,
}: CourseMobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <CourseSidebar course={course} progressCount={progressCount} />
      </SheetContent>
    </Sheet>
  );
}
