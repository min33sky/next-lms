import React from 'react';
import { DataTable } from './_components/data-table';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { columns } from './_components/columns';

export default async function CoursesPage() {
  const { userId } = auth();

  console.log('[teacher/course] userId: ', userId);

  if (!userId) {
    return redirect('/');
  }

  const courses = await prisma.course.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="p-6">
      <DataTable columns={columns} data={courses} />
    </div>
  );
}
