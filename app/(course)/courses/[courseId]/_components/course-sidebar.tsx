import prisma from "@/lib/db";
import { Chapter, Course, UserProgress } from "@/lib/generated/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseSidebarItem } from "./course-sidebar-item";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progresCount: number;
}

export const CourseSidebar = async ({
  course,
  progresCount,
}: CourseSidebarProps) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r shadow-sm">
      <div className="flex flex-col border-b p-8">
        <h1 className="font-semibold">{course.title}</h1>
        {/* Check purchase and add progress */}
      </div>
      <div className="flex w-full flex-col">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  );
};
