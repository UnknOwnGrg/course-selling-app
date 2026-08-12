"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

interface ChapterActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
}

export const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: ChapterActionsProps) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    try {
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}`);

      toast.success("Chapter Deleted");

      router.push(`/teacher/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/unpublish`,
        );

        toast.success("Chapter unpublished");
      } else {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/publish`,
        );
        toast.success("Chapter publish");
      }

      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading || isDeleting}
        variant="outline"
        size="sm"
      >
        {isLoading ? "Loading..." : isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading || isDeleting}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
