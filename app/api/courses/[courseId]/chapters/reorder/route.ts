import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();

    const ownCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId: userId,
      },
    });

    if (!ownCourse) {
      return new NextResponse("Invalid Course");
    }

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

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
