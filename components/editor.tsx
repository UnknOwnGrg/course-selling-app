"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

export const Editor = ({ onChange, value }: EditorProps) => {
  return (
    <div className="bg-white">
      <ReactQuill theme="snow" value={value} onChange={onChange} />
    </div>
  );
};
