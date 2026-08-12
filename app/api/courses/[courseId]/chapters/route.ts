import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const { userId } = await auth();
    const { title } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    if (!title?.trim()) {
      return new NextResponse("Title is required", {
        status: 400,
      });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lastChapter = await prisma.chapter.findFirst({
      where: {
        courseId: courseId,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;
    const chapter = await prisma.chapter.create({
      data: {
        title,
        courseId: courseId,
        position: newPosition,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
