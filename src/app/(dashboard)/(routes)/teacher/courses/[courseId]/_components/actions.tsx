'use client';

import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { useConfettiStore } from '@/hooks/use-confetti-store';
import {
  deleteCourse,
  publishCourse,
  unpublishCourse,
} from '@/actions/course.action';

interface ActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
}

/**
 * Course PUblish or Unpublish or Delete Buttons
 */
export default function Actions({
  disabled,
  courseId,
  isPublished,
}: ActionsProps) {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        // await axios.patch(`/api/courses/${courseId}/unpublish`);
        await unpublishCourse({ courseId });
        toast.success('Course unpublished');
      } else {
        // await axios.patch(`/api/courses/${courseId}/publish`);
        await publishCourse({ courseId });
        toast.success('Course published');
        confetti.onOpen();
      }

      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);

      await deleteCourse({ courseId });
      // await axios.delete(`/api/courses/${courseId}`);

      toast.success('Course deleted');
      router.refresh();
      router.push(`/teacher/courses`);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <TrashIcon className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
}
