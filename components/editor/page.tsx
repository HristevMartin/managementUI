
"use client";
import { useRef } from "react";
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
});

const Editor = ({ value = '', onChange, disabled = false  }: any) => {
  const editor = useRef(null);

  console.log("Editor received props:", { value, onChange, disabled });
  if (!value || !onChange || !disabled) {
    console.error("Missing props in Editor component");
  }

  const handleChange = (newContent) => {
    onChange(newContent); // Call the passed onChange prop
  };

  return (
    <div className="max-w-2xl mx-auto p-5 border border-gray-300 rounded-lg shadow-lg">
      <div className="text-black">
        <JoditEditor
          ref={editor}
          value={value} 
          onChange={handleChange} 
          disabled={disabled} 
        />
      </div>
    </div>
  );
};


export default Editor;
