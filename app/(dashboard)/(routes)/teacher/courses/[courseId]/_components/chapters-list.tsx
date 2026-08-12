"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Grip, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Chapter } from "@/lib/generated/prisma/client";

interface ChaptersListProps {
  items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const ChaptersList = ({
  items,
  onReorder,
  onEdit,
}: ChaptersListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState(items);

  // Prevent hydration mismatch with DnD
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync local state when parent updates
  useEffect(() => {
    setChapters(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // Dropped outside the list
    if (!destination) return;

    // Same position
    if (
      destination.index === source.index &&
      destination.droppableId === source.droppableId
    ) {
      return;
    }

    // Copy current chapters
    const reorderedChapters = Array.from(chapters);

    // Remove dragged chapter
    const [movedChapter] = reorderedChapters.splice(source.index, 1);

    // Insert into new position
    reorderedChapters.splice(destination.index, 0, movedChapter);

    // Update positions
    const updatedChapters = reorderedChapters.map((chapter, index) => ({
      ...chapter,
      position: index + 1,
    }));

    // Update UI immediately
    setChapters(updatedChapters);

    // Notify parent component
    onReorder(
      updatedChapters.map((chapter) => ({
        id: chapter.id,
        position: chapter.position,
      })),
    );
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {chapters.map((chapter, index) => (
              <Draggable
                key={chapter.id}
                draggableId={chapter.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "mb-4 flex items-center gap-x-2 rounded-md border border-slate-200 bg-slate-200 text-sm text-slate-700",
                      chapter.isPublished &&
                        "border-sky-200 bg-sky-100 text-sky-700",
                    )}
                  >
                    {/* Drag Handle */}
                    <div
                      {...provided.dragHandleProps}
                      className={cn(
                        "cursor-grab rounded-l-md border-r border-r-slate-200 px-2 py-3 transition hover:bg-slate-300 active:cursor-grabbing",
                        chapter.isPublished && "border-r-sky-200",
                      )}
                    >
                      <Grip className="h-5 w-5" />
                    </div>

                    {/* Chapter Title */}
                    <span>{chapter.title}</span>

                    {/* Actions */}
                    <div className="ml-auto flex items-center gap-x-2 pr-2">
                      {chapter.isFree && (
                        <Badge variant="secondary">Free</Badge>
                      )}

                      <Badge
                        className={cn(
                          "bg-slate-700",
                          chapter.isPublished && "bg-sky-700",
                        )}
                      >
                        {chapter.isPublished ? "Published" : "Draft"}
                      </Badge>

                      <Pencil
                        onClick={() => onEdit(chapter.id)}
                        className="h-4 w-4 cursor-pointer transition hover:opacity-75"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
