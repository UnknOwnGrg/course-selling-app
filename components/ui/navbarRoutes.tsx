"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

const NavbarRoutes = () => {
  const pathname = usePathname();

  //Teacher page
  const isTeacherPage = pathname?.startsWith("/teacher");
  //It is the individual page
  const isPlayerPage = pathname?.includes("/chapter");

  return (
    <div className="ml-auto flex gap-x-2">
      {isTeacherPage || isPlayerPage ? (
        <Link href="/">
          <Button size="lg" variant="ghost">
            <LogOut className="mr-2 h-4 w-4" />
            Exit
          </Button>
        </Link>
      ) : (
        <Link href="/teacher/courses">
          <Button size="lg" variant="ghost">
            Teacher mode
          </Button>
        </Link>
      )}
      <UserButton fallback="/" />
    </div>
  );
};

export default NavbarRoutes;
