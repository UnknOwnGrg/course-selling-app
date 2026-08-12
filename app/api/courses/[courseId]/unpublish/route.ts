import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId: userId,
      },
    });

    if (!course) {
      return new NextResponse("Not found", {
        status: 404,
      });
    }

    const unPublishedCourse = await prisma.course.update({
      where: {
        id: courseId,
        userId: userId,
      },
      data: {
        isPublished: false,
      },
    });

    return NextResponse.json(unPublishedCourse);
  } catch (error) {
    console.log("[COURSE_ID_UNPUBLISH]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
