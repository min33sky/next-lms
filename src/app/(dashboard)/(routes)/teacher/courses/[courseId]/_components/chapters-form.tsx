'use client';

import { createChapter, reorderChapter } from '@/actions/course.action';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Chapter, Course } from '@prisma/client';
import { Loader2Icon, PlusCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import ChaptersList from './chapters-list';

interface ChaptersFormProps {
  initialData: Course & {
    chapters: Chapter[];
  };
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1),
});

export default function ChaptersForm({
  initialData,
  courseId,
}: ChaptersFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const router = useRouter();

  const toggleCreating = () => {
    setIsCreating((current) => !current);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createChapter({
        courseId,
        title: values.title,
      });

      toast.success('Chapter updated');
      toggleCreating();
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    }
  };

  /**
   * 챕터 Drag and Drop 시 DB Update Handler
   */
  const handleReorder = async (
    updateData: {
      id: string;
      position: number;
    }[],
  ) => {
    try {
      setIsUpdating(true);

      const response = await reorderChapter({
        courseId,
        list: updateData,
      });

      toast.success('Chapter reordered');
      router.refresh();
    } catch (error: any) {
      toast.error('Something went wrong');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/teacher/courses/${courseId}/chapters/${id}`);
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      {/* DnD시 로딩화면 보여줌 */}
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
          <Loader2Icon className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}

      <div className="font-medium flex items-center justify-between">
        Course Chapter
        <Button onClick={toggleCreating} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Add a chapter
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction to the course'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type="submit">
              Create
            </Button>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div
          className={cn(
            'text-sm mt-2',
            !initialData.chapters.length && 'text-slate-500 italic',
          )}
        >
          {!initialData.chapters.length && 'No chapters'}

          <ChaptersList
            onEdit={handleEdit}
            onReorder={handleReorder}
            items={initialData.chapters || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the chapters
        </p>
      )}
    </div>
  );
}
