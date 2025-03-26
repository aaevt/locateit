import React from "react";
import { FaMousePointer, FaPencilAlt, FaSquare, FaCircle, FaTrash, FaRulerCombined} from "react-icons/fa";

interface ToolbarProps {
  activeTool: string | null;
  setActiveTool: (tool: string) => void;
  addText: () => void;
  addRectangle: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, addText, addRectangle, addCircle }) => {
  return (
    <div className="flex flex-col space-y-2 p-4 border-r">
      <button
        onClick={() => {
          setActiveTool("text");
          addText();
        }}
        className={`p-2 border rounded ${activeTool === "text" ? "bg-gray-300" : ""}`}
      >
        <FaPencilAlt size={24} />
      </button>
      <button
        onClick={() => {
          setActiveTool("rect");
          addRectangle();
        }}
        className={`p-2 border rounded ${activeTool === "rect" ? "bg-gray-300" : ""}`}
      >
        <FaSquare size={24} />
      </button>
      <button
        onClick={() => {
          setActiveTool("circle");
          addCircle();
        }}
        className={`p-2 border rounded ${activeTool === "circle" ? "bg-gray-300" : ""}`}
      >
        <FaCircle size={24} />
      </button>
      <button
        onClick={() => {
          setActiveTool("select");
        }}
        className={`p-2 border rounded ${activeTool === "select" ? "bg-gray-300" : ""}`}
      >
        <FaMousePointer size={24} />
      </button>
      <button
        onClick={() => {
          const canvas = document.getElementById("canvas");
        }}
        className="p-2 border rounded"
      >
        <FaTrash size={24} />
      </button>
      <button
        onClick={() => {
        }}
        className="p-2 border rounded"
      >
        <FaRulerCombined size={24} />
      </button>
    </div>
  );
};

export default Toolbar;
