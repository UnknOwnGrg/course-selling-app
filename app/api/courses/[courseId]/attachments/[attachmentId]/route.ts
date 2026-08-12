import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; attachmentId: string }> },
) {
  try {
    const { userId } = await auth();
    const { courseId, attachmentId } = await params;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await prisma.course.findFirst({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        courseId,
      },
    });

    if (!attachment) {
      return new NextResponse("Attachment not found", {
        status: 404,
      });
    }

    const del = await prisma.attachment.delete({
      where: {
        id: attachmentId,
      },
    });

    return NextResponse.json(del);
  } catch (error) {
    console.error("ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
