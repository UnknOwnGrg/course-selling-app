import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> },
) {
  try {
    const { userId } = await auth();
    const { chapterId, courseId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const unPublishedChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: false,
      },
    });

    const publisedChaptersInCourse = await prisma.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      },
    });

    if (!publisedChaptersInCourse) {
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(unPublishedChapter);
  } catch (error) {
    console.error("[CHAPTER_UNPUBLISHED]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
