import React from "react";
import { Fa0, Fa1, Fa2, Fa3, Fa4, Fa5, Fa6, Fa7, Fa8, Fa9 } from "react-icons/fa6";

interface LayersProps {
}

const Layersbar: React.FC<LayersProps> = ({ }) => {
  return (
    <div className="flex flex-col space-x-2 h-full w-full w-1/2 p-5 border rounded-lg border-gray-300 shadow-sm">

      {/* Экспорт */}
      <div className="flex items-center flex-col space-y-2 ml-4]">
        <button
          onClick={() => {
          }}
          className="p-2 border rounded"
        >
          <Fa0 size={24} />
        </button>

        <button
          onClick={() => {
          }}
          className="p-2 border rounded"
        >
          <Fa0 size={24} />
        </button>
      </div>
      
    </div >
  );
};

export default Layersbar;