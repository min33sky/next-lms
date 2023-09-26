import { NavbarRoutes } from '@/components/navbar-routes';
import { CourseWithChaptersWithUserProgress } from '@/types';
import CourseMobileSidebar from './course-mobile-sidebar';

interface CourseNavbarProps {
  course: CourseWithChaptersWithUserProgress;
  progressCount: number;
}

export default function CourseNavbar({
  course,
  progressCount,
}: CourseNavbarProps) {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <NavbarRoutes />
    </div>
  );
}
