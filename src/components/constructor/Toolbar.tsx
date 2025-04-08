import React from "react";
import { FaMousePointer, FaPencilAlt, FaSquare, FaCircle, FaTrash, FaRulerCombined, FaTextHeight } from "react-icons/fa";

interface ToolbarProps {
  activeTool: string | null;
  setActiveTool: (tool: string) => void;
  addText: () => void;
  addRoom: () => void; 
  addWall: () => void;
  addStairs: () => void;
  deleteSelected: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, addText, addRoom, addWall, addStairs, deleteSelected }) => {
  return (
    <div className="flex flex-row items-center space-x-2 p-4 w-full bg-gray-100 border rounded-b-lg border-gray-300 shadow-sm">

      {/* Группа: Выбор и удаление */}
      <div className="flex space-x-2 ml-4">
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
            setActiveTool("delete");
            deleteSelected();
          }}
          onDoubleClick={() => {
            localStorage.clear();
            alert("localStorage очищен!");
          }}
          className="p-2 border rounded"
        >
          <FaTrash size={24} />
        </button>
      </div>

      {/* Группа: Инструменты рисования */}
      <div className="flex space-x-2 ml-4">
        <button
          onClick={() => {
            setActiveTool("text");
            addText();
          }}
          className={`p-2 border rounded ${activeTool === "text" ? "bg-gray-300" : ""}`}
        >
          <FaTextHeight size={24} />
        </button>

        <button
          onClick={() => {
            setActiveTool("rect");
            addRoom();
          }}
          className={`p-2 border rounded ${activeTool === "rect" ? "bg-gray-300" : ""}`}
        >
          <FaSquare size={24} />
        </button>

        {/* <button
          onClick={() => {
            setActiveTool("circle");
          }}
          className={`p-2 border rounded ${activeTool === "circle" ? "bg-gray-300" : ""}`}
        >
          <FaCircle size={24} />
        </button> */}
      </div>

      {/* Прочее */}
      <div className="flex space-x-2 ml-4">
        <button
          onClick={() => {
            toggleGrid();
          }}
          className="p-2 border rounded"
        >
          <FaRulerCombined size={24} />
        </button>
      </div>

      {/* Экспорт */}
      <div className="flex space-x-2 ml-4">
        <button
          onClick={() => {

          }}
          className="p-2 border rounded"
        >
          <FaRulerCombined size={24} />
        </button>
      </div>
      
    </div >
  );
};

export default Toolbar;
