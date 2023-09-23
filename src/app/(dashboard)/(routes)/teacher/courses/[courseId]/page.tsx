import { IconBadge } from '@/components/icon-badge';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs';
import {
  CircleDollarSignIcon,
  FileIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react';
import TitleForm from './_components/title-form';
import DescriptionForm from './_components/description-form';
import ImageForm from './_components/image-form';
import { CategoryForm } from './_components/category-form';
import PriceForm from './_components/price-form';
import AttachmentForm from './_components/attachment-form';
import ChaptersForm from './_components/chapters-form';

interface CourseIdPageProps {
  params: {
    courseId: string;
  };
}

export default async function CourseIdPage({ params }: CourseIdPageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const course = await prisma.course.findUnique({
    where: {
      id: params.courseId,
      userId,
    },
    include: {
      chapters: {
        orderBy: {
          position: 'asc',
        },
      },
      attachments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!course) {
    return redirect('/');
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some((chapter) => chapter.isPublished),
  ];

  // 강의 등록에 필요한 속성들을 파악한다.
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-slate-700">
            Complete all fields {completionText}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        {/* column 1 */}
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge
              icon={LayoutDashboardIcon}
              size={'default'}
              variant={'default'}
            />
            <h2 className="text-xl">Customize your course</h2>
          </div>
          <TitleForm initialData={course} courseId={course.id} />
          <DescriptionForm initialData={course} courseId={course.id} />
          <ImageForm initialData={course} courseId={course.id} />
          <CategoryForm
            initialData={course}
            courseId={course.id}
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
          />
        </div>

        {/* column 2 */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecksIcon} />
              <h2 className="text-xl">Course chapters</h2>
            </div>
            <ChaptersForm initialData={course} courseId={course.id} />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={CircleDollarSignIcon} />
              <h2 className="text-xl">Sell your course</h2>
            </div>
            <PriceForm initialData={course} courseId={course.id} />
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={FileIcon} />
              <h2 className="text-xl">Resources & Attachments</h2>
            </div>
            <AttachmentForm initialData={course} courseId={course.id} />
          </div>
        </div>
      </div>
    </div>
  );
}