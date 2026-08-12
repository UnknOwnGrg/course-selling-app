import { IconBadge } from "@/components/ui/icon-badge";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  CircleDollarSign,
  LayoutDashboard,
  ListChecks,
  File,
} from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ChaptersForm } from "./_components/chapter-form";
import { Banner } from "@/components/banner";
import { Actions } from "./_components/actions";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { courseId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        orderBy: {
          position: "asc",
        },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  if (!course) {
    return redirect("/");
  }

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!isComplete && (
        <Banner
          variant="warning"
          label="This course is unpublish. It will not be visible to students."
        />
      )}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:items-center">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-medium sm:text-2xl">Course Setup</h1>
            <span className="block text-xs text-slate-700 sm:text-sm">
              Complete all field {completionText}
            </span>
          </div>
          <div className="shrink-0">
            <Actions
              disabled={!isComplete}
              courseId={courseId}
              isPublished={course.isPublished}
            />
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:mt-16 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-lg sm:text-xl">Customize your course</h2>
            </div>
            <TitleForm intialData={course} courseId={course.id} />
            <DescriptionForm initialData={course} courseId={course.id} />
            <ImageForm initialData={course} courseId={course.id} />
            <CategoryForm
              initialData={course}
              courseId={course.id}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-lg sm:text-xl">Course Chapters</h2>
              </div>
              <ChaptersForm initialData={course} courseId={course.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-lg sm:text-xl">Sell your course</h2>
              </div>
              <PriceForm initialData={course} courseId={course.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-lg sm:text-xl">
                  Resources And Attachments
                </h2>
              </div>
              <AttachmentForm initialData={course} courseId={course.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
