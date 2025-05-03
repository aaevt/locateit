"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GripVertical } from "lucide-react";

export default function Layersbar() {
  return (
    <div className="h-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-40 transition-all duration-300">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Слои</h2>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {/* Здесь будет список слоев */}
          <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <Button variant="ghost" size="icon" className="h-6 w-6 cursor-move">
              <GripVertical className="h-4 w-4" />
            </Button>
            <span className="flex-1 text-sm">Слой 1</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 