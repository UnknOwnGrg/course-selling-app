"use client";

import * as z from "zod";
import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Chapter, MuxData } from "@/lib/generated/prisma/client";
import { FileUpload } from "@/components/ui/file-upload";

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        values,
      );
      toast.success("Chapter Updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between font-medium">
        Chapter Video
        <Button onClick={toggleEdit} variant={"ghost"}>
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add an Video
            </>
          )}

          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Video
            </>
          )}
        </Button>
      </div>
      {/* Video Preview */}
      {!isEditing && (
        <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-md bg-slate-200">
          {!initialData.videoUrl ? (
            <div className="flex h-full w-full items-center justify-center">
              <Video className="h-10 w-10 text-slate-500" />
            </div>
          ) : initialData.muxData?.playbackId ? (
            <MuxPlayer
              playbackId={initialData.muxData.playbackId}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <Video className="h-10 w-10 text-slate-500" />
              <p className="mt-2 text-sm text-slate-500">
                Video is processing...
              </p>
            </div>
          )}
        </div>
      )}
      {/* Upload */}
      {isEditing && (
        <div className="mt-4 rounded-md border border-dashed bg-white p-4">
          <FileUpload
            endpoint="chapterVideo"
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url });
              }
            }}
          />
          {/* Processing messages */}
          <div className="text-muted-foreground mt-4 text-xs">
            Upload this chapter&apos;s video
          </div>
        </div>
      )}
      {initialData.videoUrl && !isEditing && (
        <div className="text-muted-foreground mt-2 text-xs">
          Video can take a few minutes to process. Referesh the page if video
          does not appear.
        </div>
      )}
    </div>
  );
};
