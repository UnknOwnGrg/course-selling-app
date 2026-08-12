import { IconBadge } from "@/components/ui/icon-badge";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ArrowBigLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterVideoForm } from "./_components/chapter-video-form";
import { Banner } from "@/components/banner";
import { ChapterActions } from "./_components/chapter-actions";

const ChapterIdPage = async ({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const { courseId, chapterId } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
      courseId: courseId,
    },
    include: {
      muxData: true,
    },
  });

  if (!chapter) {
    return redirect("/");
  }

  const requireFields = [chapter.title, chapter.description, chapter.videoUrl];
  const totalFields = requireFields.length;
  const completedFields = requireFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requireFields.every(Boolean);
  return (
    <>
      {!chapter.isPublished && (
        <Banner
          variant={"warning"}
          label="This chapter is unpublished. It will not be visible in the course"
        />
      )}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${courseId}`}
              className="mb-6 flex items-center text-sm transition hover:opacity-75"
            >
              <ArrowBigLeft className="mr-2 h-4 w-4" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-medium sm:text-2xl">
                  Chapter Creation
                </h1>
                <span className="block text-xs text-slate-700 sm:text-sm">
                  Complete all fields {completionText}
                </span>
              </div>
              <div className="flex shrink-0 items-center self-center">
                <ChapterActions
                  isPublished={chapter.isPublished}
                  disabled={!isComplete}
                  courseId={courseId}
                  chapterId={chapterId}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:mt-16 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-lg sm:text-xl">Customize your chapter</h2>
              </div>
              <ChapterTitleForm
                intialData={{ title: chapter.title }}
                courseId={courseId}
                chapterId={chapterId}
              />
              <ChapterDescriptionForm
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-lg sm:text-xl">Access Settings</h2>
              </div>
              <ChapterAccessForm
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-lg sm:text-xl">Add a Video</h2>
            </div>
            <ChapterVideoForm
              initialData={chapter}
              chapterId={chapterId}
              courseId={courseId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
