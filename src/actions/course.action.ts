'use server';

import Mux from '@mux/mux-node';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs';

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!,
);

/**
 * 강의 생성 API
 */
export async function createCourse(title: string) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const course = await prisma.course.create({
      data: {
        title,
        userId,
      },
    });

    return course;
  } catch (error: any) {
    console.log('[COURSES]', error);
    throw new Error(error.message);
  }
}
interface CourseUpdateParams {
  courseId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  categoryId?: string;
}

/**
 * 강의 업데이트 API
 */
export async function updateCourse({ courseId, ...data }: CourseUpdateParams) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const course = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        ...data,
      },
    });

    return course;
  } catch (error: any) {
    console.log('[COURSES Update Failed]', error);
    throw new Error(error.message);
  }
}

/**
 * 강의 첨부자료 추가 API
 */
export async function createAttachment({
  courseId,
  url,
}: {
  courseId: string;
  url: string;
}) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // 해당 강의 선생님만 첨부물을 올릴 수 있다.
    const courseOwner = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!courseOwner) {
      throw new Error('Unauthorized');
    }

    const attachment = await prisma.attachment.create({
      data: {
        url,
        courseId,
        name: url.split('/').pop()!,
      },
    });

    return attachment;
  } catch (error: any) {
    console.log('[ATTACHMENT]', error);
    throw new Error(error.message);
  }
}

/**
 * 강의 첨부자료 삭제 API
 */
export async function deleteAttachment({
  courseId,
  attachmentId,
}: {
  courseId: string;
  attachmentId: string;
}) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const courseOwner = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!courseOwner) {
      throw new Error('Unauthorized');
    }

    const attachment = await prisma.attachment.delete({
      where: {
        id: attachmentId,
        courseId,
      },
    });

    return attachment;
  } catch (error: any) {
    console.log('[ATTACHMENT]', error);
    throw new Error(error.message);
  }
}

interface CreateChapterParams {
  courseId: string;
  title: string;
}

export async function createChapter({ courseId, title }: CreateChapterParams) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const courseOwner = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!courseOwner) {
      throw new Error('Unauthorized');
    }

    //? 챕터를 등록할 때 위치도 지정해줘야함 (Drag And Drop시 위치값 변경됨)

    const lastChapter = await prisma.chapter.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const newChapter = await prisma.chapter.create({
      data: {
        title,
        position: newPosition,
        courseId,
      },
    });

    return newChapter;
  } catch (error: any) {
    console.log('[CHAPTER]', error);
    throw new Error(error.message);
  }
}

interface ReorderChapterParams {
  courseId: string;
  list: { id: string; position: number }[];
}

/**
 * 강의 챕터 순서 재배열 (DnD 위치 수정 반영)
 */
export async function reorderChapter({ courseId, list }: ReorderChapterParams) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const ownCourse = await prisma.course.findMany({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!ownCourse) {
      throw new Error('Unauthorized');
    }

    /**
     *? 서로 순서를 바꾼 시작 위치와 마지막 위치까지의 데이터가 들어오고
     *? 그 데이터로 DB를 업데이트한다.
     */
    for (const item of list) {
      await prisma.chapter.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }

    return 'Reorder Success';
  } catch (error: any) {
    console.log('[CHAPTER REORDER]', error);
    throw new Error(error.message);
  }
}

interface UpdateChapterParams {
  courseId: string;
  chapterId: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  isFree?: boolean;
}

export async function updateChapter({
  courseId,
  chapterId,
  ...data
}: UpdateChapterParams) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const ownCourse = await prisma.course.findMany({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!ownCourse) {
      throw new Error('Unauthorized');
    }

    const chapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        ...data,
      },
    });

    // TODO: Handle Video update

    return chapter;
  } catch (error: any) {
    console.log('[CHAPTER UPDATE]', error);
    throw new Error(error.message);
  }
}
