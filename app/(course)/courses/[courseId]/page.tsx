import prisma from "@/lib/db";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: Promise<{ courseId: string }> }) => {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  const firstPublishedChapter = course.chapters[0];

  if (!firstPublishedChapter) {
    return redirect("/");
  }

  return redirect(`/courses/${course.id}/chapters/${firstPublishedChapter.id}`);
};

export default page;
