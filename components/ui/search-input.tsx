"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

export const SearchInput = () => {
  const [value, setValue] = useState("");
  const debounce = useDebounce(value);

  const searchPrarms = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategoryId = searchPrarms.get("categoryId");

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          categoryId: currentCategoryId,
          title: debounce,
        },
      },
      { skipEmptyString: true, skipNull: true },
    );
    router.push(url);
  }, [debounce, currentCategoryId, router, pathname]);

  return (
    <div className="relative">
      <Search className="absolute top-2 left-3 h-4 w-4 text-slate-600" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Serach for a course"
        className="w-full rounded-full bg-slate-100 pl-9 focus-visible:ring-slate-200 md:w-[300px]"
      />
    </div>
  );
};
