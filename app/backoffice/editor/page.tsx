
"use client";
import { Suspense, useRef } from "react";
// import JoditEditor from "jodit-react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";

const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
});

const Editor = ({ value = '', onChange, disabled = false  }) => {
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
          value={value} // Use the passed value
          onChange={handleChange} // Use the new handleChange function
          disabled={disabled} // Handle the disabled state
        />
      </div>
    </div>
  );
};

{/* <Suspense fallback={<div>Loading...</div>}>
  <Editor />
</Suspense> */}


export default Editor;
