import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    const body: { url?: string } = await req.json();

    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const fileName = body.url.split("/").pop() ?? "attachment";

    const attachment = await prisma.attachment.create({
      data: {
        url: body.url,
        name: fileName,
        courseId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("COURSE_ID_ATTACHMENTS:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
