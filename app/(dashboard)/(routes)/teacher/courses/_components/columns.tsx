"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";

import { type DataTableFeatures } from "./data-table-features";
import { Course } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Course>();

export const columns = columnHelper.columns([
  columnHelper.accessor("title", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  }),
  columnHelper.accessor("price", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price") || "0");

      const formatted = new Intl.NumberFormat("en-Us", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div>{formatted}</div>;
    },
  }),
  columnHelper.accessor("isPublished", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Published
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;

      return (
        <Badge className={cn("bg-slate-500", isPublished && "bg-sky-700")}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  }),
  {
    id: "actions",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Open course actions"
            render={
              <Button variant="ghost" className="h-4 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <Link href={`/teacher/courses/${id}`}>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]);
