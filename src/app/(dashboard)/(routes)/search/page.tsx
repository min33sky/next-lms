import prisma from '@/lib/db';
import React from 'react';
import Categories from './_components/categories';

export default async function SearchPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="p-6">
      <Categories items={categories} />
    </div>
  );
}
