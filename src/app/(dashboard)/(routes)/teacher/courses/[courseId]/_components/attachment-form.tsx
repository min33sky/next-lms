'use client';

import { createAttachment, deleteAttachment } from '@/actions/course.action';
import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/ui/button';
import { Attachment, Course } from '@prisma/client';
import { FileIcon, Loader2Icon, PlusCircleIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface AttachmentFormProps {
  initialData: Course & {
    attachments: Attachment[];
  };
  courseId: string;
}

export default function AttachmentForm({
  initialData,
  courseId,
}: AttachmentFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (url: string) => {
    try {
      await createAttachment({
        courseId,
        url,
      });

      toast.success('Course updated');
      toggleEdit();
      router.refresh();
    } catch (error: any) {
      toast.error('Something went wrong');
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteAttachment({
        courseId,
        attachmentId: id,
      });
      toast.success('Attachment deleted');
      router.refresh();
    } catch (error: any) {
      toast.error('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Add a file
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.attachments.length === 0 && (
            <p className="text-sm mt-2 text-slate-500 italic">
              No attachments yet
            </p>
          )}

          {/* 첨부파일 목록  */}
          {initialData.attachments.length > 0 && (
            <div className="space-y-2">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                >
                  <FileIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p className="text-xs line-clamp-1">{attachment.name}</p>
                  {deletingId === attachment.id && (
                    <div>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  {deletingId !== attachment.id && (
                    <button
                      onClick={() => onDelete(attachment.id)}
                      className="ml-auto hover:opacity-75 transition"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 업로드 */}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseAttachment"
            onChange={(url) => {
              //? 업로드 완료시 반환되는 URL을 다음 콜백함수 파라미터로 넘겨준다.
              if (url) {
                onSubmit(url);
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Add anything your students might need to complete the course.
          </div>
        </div>
      )}
    </div>
  );
}
