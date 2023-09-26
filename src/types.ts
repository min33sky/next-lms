import { Category, Chapter, Course, UserProgress } from '@prisma/client';

export type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

export type CourseWithChaptersWithUserProgress = Course & {
  chapters: (Chapter & {
    userProgress: UserProgress[] | null;
  })[];
};
