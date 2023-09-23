import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function CoursesPage() {
  return (
    <div className="p-6">
      <Button asChild>
        <Link href="/teacher/create">New Course</Link>
      </Button>
    </div>
  );
}
