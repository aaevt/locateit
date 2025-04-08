import React from "react";
import { FaFileDownload, FaFileUpload, FaImage } from "react-icons/fa";

interface DownloadbarProps {
  exportCanvasJSON: () => void;
  exportCanvasSVG: () => void;
  importCanvasJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Downloadbar: React.FC<DownloadbarProps> = ({ exportCanvasJSON, exportCanvasSVG, importCanvasJSON }) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <div className="flex flex-row-reverse space-x-2 p-4 w-full bg-gray-100 border rounded-t-lg border-gray-300 shadow-sm">

      {/* Экспорт */}
      <div className="flex-row space-x-2 ml-4">
        <button onClick={exportCanvasSVG} className="p-2 border rounded">
          <FaImage size={24} />
        </button>

        <button
          onClick={() => {
            exportCanvasSVG();
            exportCanvasJSON();
          }}
          className="p-2 border rounded"
        >
          <FaFileDownload size={24} />
        </button>
      </div>

      {/* Импорт */}
      <div className="flex-row space-x-2 ml-4">
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={importCanvasJSON}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 border rounded"
        >
          <FaFileUpload size={24} />
        </button>
      </div>
    </div>
  );
};

export default Downloadbar;
