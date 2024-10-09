
"use client";
import { useRef } from "react";
import JoditEditor from "jodit-react";

const Editor = ({ value, onChange, disabled }) => {
  const editor = useRef(null);

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

export default Editor;
