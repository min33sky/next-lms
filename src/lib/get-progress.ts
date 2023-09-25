import prisma from './db';

export default async function getProgress(userId: string, courseId: string) {
  try {
    // 해당 코스의 published chapter의 id갑만 가져온다.
    const publishedChapters = await prisma.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });

    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    // 완료한 챕터의 갯수를 구하기
    const validCompletedChapters = await prisma.userProgress.count({
      where: {
        userId,
        chapterId: {
          in: publishedChapterIds,
        },
        isCompleted: true,
      },
    });

    const progressPercentage =
      (validCompletedChapters / publishedChapterIds.length) * 100;

    return progressPercentage;
  } catch (error) {
    console.log('[GET_PROGRESS]', error);
    return 0;
  }
}
