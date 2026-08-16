import prisma from "@/lib/db";
import { Category, Course } from "@/lib/generated/prisma/client";
import { getProgress } from "./get-progress";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

type GetCourses = {
  userId: string;
  title: string;
  categoryId: string;
};
export const getCourses = async ({
  userId,
  title,
  categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(title && {
          title: {
            contains: title,
            mode: "insensitive",
          },
        }),
        ...(categoryId && {
          categoryId,
        }),
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          },
        },
        purhcases: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const coursesWithProgress: CourseWithProgressWithCategory[] =
      await Promise.all(
        courses.map(async (course) => {
          if (course.purhcases.length === 0) {
            return {
              ...course,
              progress: null,
            };
          }

          const progressPercentage = await getProgress(userId, course.id);

          return {
            ...course,
            progress: progressPercentage,
          };
        }),
      );

    return coursesWithProgress;
  } catch (error) {
    console.log("[GET_COURSES]", error);
    return [];
  }
};
