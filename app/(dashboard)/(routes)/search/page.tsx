import prisma from "@/lib/db";
import React from "react";
import { Categories } from "./_components/categories";
import { SearchInput } from "@/components/ui/search-input";
import { getCourses } from "@/actions/get-courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursesList } from "@/components/courses-list";

interface SearchPageProps {
  searchParams: Promise<{
    title?: string;
    categoryId?: string;
  }>;
}

const Page = async ({ searchParams }: SearchPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  //Used to abstract data from the Params
  const { title, categoryId } = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const courses = await getCourses({
    userId,
    title: title ?? "",
    categoryId: categoryId ?? "",
  });

  return (
    <>
      <div className="block px-6 pt-6 md:mb-0 md:hidden">
        <SearchInput />
      </div>

      <div className="space-y-4 p-6">
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default Page;
