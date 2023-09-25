'use server';

import Mux from '@mux/mux-node';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs';

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID,
  process.env.MUX_TOKEN_SECRET,
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
    if (data.videoUrl) {
      const existingMuxData = await prisma.muxData.findFirst({
        where: {
          chapterId,
        },
      });

      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await prisma.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }

      const asset = await Video.Assets.create({
        input: data.videoUrl,
        playback_policy: 'public',
        test: false,
      });

      await prisma.muxData.create({
        data: {
          chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      });
    }

    return chapter;
  } catch (error: any) {
    console.log('[CHAPTER UPDATE]', error);
    throw new Error(error.message);
  }
}

export async function publishChapter({
  courseId,
  chapterId,
}: {
  courseId: string;
  chapterId: string;
}) {
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

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      },
    });

    const muxData = await prisma.muxData.findUnique({
      where: {
        chapterId,
      },
    });

    if (
      !chapter ||
      !muxData ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    ) {
      throw new Error('Missing required fields');
    }

    const updateChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: true,
      },
    });

    return updateChapter;
  } catch (error: any) {
    console.log('[CHAPTER PUBLISH]', error);
    throw new Error(error.message);
  }
}

export async function unpublishChapter({
  courseId,
  chapterId,
}: {
  courseId: string;
  chapterId: string;
}) {
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

    // 1. 해당 chapter를 unpublished로 변경
    const unpublishedChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: false,
      },
    });

    // ! chapter를 unpublish하면 course가 unpublished가 되는게 맞지;;
    // 2. 해당 강의의 모든 chapter가 published가 되지 않았다면 해당 강의는 unpublished로 변경
    // const publishedChaptersInCourse = await prisma.chapter.findMany({
    //   where: {
    //     courseId,
    //     isPublished: true,
    //   },
    // });

    // if (!publishedChaptersInCourse.length) {
    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        isPublished: false,
      },
    });
    // }

    return unpublishedChapter;
  } catch (error: any) {
    console.log('[CHAPTER UNPUBLISH]', error);
    throw new Error(error.message);
  }
}

export async function deleteChapter({
  courseId,
  chapterId,
}: {
  courseId: string;
  chapterId: string;
}) {
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

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      },
    });

    if (!chapter) {
      throw new Error('Not Found');
    }

    //? 비디오 관련 데이터도 함게 제거해준다.
    if (chapter.videoUrl) {
      const existingMuxData = await prisma.muxData.findFirst({
        where: {
          chapterId,
        },
      });

      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await prisma.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }
    }

    const deletedChapter = await prisma.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    const publishedChaptersInCourse = await prisma.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      },
    });

    if (!publishedChaptersInCourse.length) {
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return deletedChapter;
  } catch (error: any) {
    console.log('[CHAPTER DELETE]', error);
    throw new Error(error.message);
  }
}

export async function publishCourse({ courseId }: { courseId: string }) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error('Not Found');
    }

    const hasPublishedChapter = course.chapters.every(
      (chapter) => chapter.isPublished,
    );

    if (
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.categoryId ||
      !hasPublishedChapter
    ) {
      throw new Error('Missing required fields');
    }

    const publishedCourse = await prisma.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        isPublished: true,
      },
    });

    return publishedCourse;
  } catch (error: any) {
    console.log('[COURSES PUBLISH]', error);
    throw new Error(error.message);
  }
}

export async function unpublishCourse({ courseId }: { courseId: string }) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!course) {
      throw new Error('Not Found');
    }

    const unpublishedCourse = await prisma.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        isPublished: false,
      },
    });

    return unpublishedCourse;
  } catch (error: any) {
    console.log('[COURSES UNPUBLISH]', error);
    throw new Error(error.message);
  }
}

export async function deleteCourse({ courseId }: { courseId: string }) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error('Not Found');
    }

    //? 강의의 모든 챕터를 대상으로 비디오 관련 데이터도 함게 제거해준다.
    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        await Video.Assets.del(chapter.muxData.assetId);
      }
    }

    const deletedCourse = await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    return deletedCourse;
  } catch (error: any) {
    console.log('[COURSES DELETE]', error);
    throw new Error(error.message);
  }
}
