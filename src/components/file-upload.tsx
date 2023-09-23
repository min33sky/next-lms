'use client';

import toast from 'react-hot-toast';

import { UploadDropzone } from '@/lib/uploadthing';
import { ourFileRouter } from '@/app/api/uploadthing/core';
import Image from 'next/image';
import { XIcon } from 'lucide-react';

interface FileUploadProps {
  onChange: (url?: string) => void; //? 이미지 업로드 성공 후 호출할 함수
  previewImage?: string; // Form value (File URL)
  endpoint: keyof typeof ourFileRouter; //? uploadthing endpoint
}

export const FileUpload = ({
  onChange,
  previewImage,
  endpoint,
}: FileUploadProps) => {
  //? TODO: 이미지 업로드 시 미리 보기 화면을 보여준다.
  if (previewImage) {
    return (
      <div className="relative aspect-video mt-2">
        <Image
          alt="Upload"
          fill
          className="object-cover rounded-md"
          src={previewImage}
        />
        <button
          aria-label="remove image"
          type="button"
          onClick={() => onChange('')}
          className="absolute top-0 right-0 bg-rose-500 text-white p-1 rounded-full shadow-sm "
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      content={{
        label({ ready, isUploading }) {
          if (ready) return '업로드 준비됨';
        },
      }}
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`);
      }}
    />
  );
};
