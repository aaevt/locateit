"use client";
import React, { useEffect, useRef, useState } from "react";
import { Rect, Circle } from "fabric";

interface ToolbarProps {
  onDelete: () => void;
  onAdd: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAdd, onDelete }) => {
  return (
    <div className="toolbar bg-gray-800 p-4 text-white flex space-x-4">
      <button
        onClick={onDelete}
        className="bg-red-500 hover:bg-red-700 px-4 py-2 rounded"
      >
        Delete Selected
      </button>
      <button
        onClick={onAdd}
        className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
      >
        Add Rectangle
      </button>
    </div>
  );
};

export default Toolbar;