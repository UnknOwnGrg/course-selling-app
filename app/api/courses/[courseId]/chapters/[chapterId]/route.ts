import Mux from "@mux/mux-node";

import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const Video = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> },
) {
  try {
    const { userId } = await auth();
    const { courseId, chapterId } = await params;

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

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    if (!chapter) {
      return new NextResponse("Not Found", { status: 401 });
    }

    if (chapter.videoUrl) {
      const existingMuxData = await prisma.muxData.findFirst({
        where: {
          chapterId: chapterId,
        },
      });

      if (existingMuxData) {
        await Video.video.assets.delete(existingMuxData.assetId);
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

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> },
) {
  try {
    const { userId } = await auth();
    const { courseId, chapterId } = await params;
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId: userId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", {
        status: 404,
      });
    }

    const chapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        ...values,
      },
    });

    if (values.videoUrl) {
      const existingMuxData = await prisma.muxData.findFirst({
        where: {
          chapterId: chapterId,
        },
      });

      if (existingMuxData) {
        await Video.video.assets.delete(existingMuxData.assetId);
        await prisma.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }

      const asset = await Video.video.assets.create({
        inputs: [
          {
            url: values.videoUrl,
          },
        ],
        playback_policy: ["public"],
        test: false,
      });

      await prisma.muxData.create({
        data: {
          chapterId: chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      });
    }
    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
