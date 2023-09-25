import prisma from '@/lib/db';
import React from 'react';
import Categories from './_components/categories';
import SearchInput from '@/components/search-input';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import getCourses from '@/lib/get-courses';
import CoursesList from '@/components/courses-list';

interface SearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  const courses = await getCourses({
    userId,
    ...searchParams,
  });

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6">
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  );
}
