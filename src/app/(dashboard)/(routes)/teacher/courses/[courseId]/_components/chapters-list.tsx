'use client';

import { Chapter } from '@prisma/client';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { GripIcon, PencilIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ChaptersListProps {
  items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void; //? DnD 이후 호출할 콜백함수
  onEdit: (id: string) => void;
}

export default function ChaptersList({
  items,
  onReorder,
  onEdit,
}: ChaptersListProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setChapters(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    // 기존 데이터 복사
    const items = Array.from(chapters);

    // 이동 시킬 아이템을 가져온다. (원래 위치에서 해당 아이템을 제거)
    const [reorderedItem] = items.splice(result.source.index, 1);

    // 목적지 인덱스에 아이템을 추가시킨다.
    items.splice(result.destination.index, 0, reorderedItem);

    // 화면에 보여줄 상태를 업데이트
    setChapters(items);

    //?  DB를 업데이트 하기 위해서 이동 시작 위치와 목적지 위치를 가져온다.
    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    //? 이동으로 변경된 범위의 데이터들을 가져와서 DB Update를 위해 변형함
    const updateChapters = items.slice(startIndex, endIndex + 1);
    const bulkUpdateData = updateChapters.map((chapter) => ({
      id: chapter.id,
      position: items.findIndex((item) => item.id === chapter.id),
    }));

    onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {chapters.map((chapter, index) => (
              <Draggable
                key={chapter.id}
                draggableId={chapter.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      'flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm',
                      chapter.isPublished &&
                        'bg-sky-100 border-sky-200 text-sky-700',
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        'px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition',
                        chapter.isPublished &&
                          'border-r-sky-200 hover:bg-sky-200',
                      )}
                      {...provided.dragHandleProps}
                    >
                      <GripIcon className="h-5 w-5" />
                    </div>
                    {chapter.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      {chapter.isFree && <Badge>Free</Badge>}
                      <Badge
                        className={cn(
                          'bg-slate-500',
                          chapter.isPublished && 'bg-sky-700',
                        )}
                      >
                        {chapter.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <PencilIcon
                        onClick={() => onEdit(chapter.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
