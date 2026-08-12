"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.bubble.css";

interface PreviewProps {
  value: string;
}

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

export const Preview = ({ value }: PreviewProps) => {
  return (
    <div className="bg-white">
      <ReactQuill theme="bubble" readOnly value={value} />
    </div>
  );
};
