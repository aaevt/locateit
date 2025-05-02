"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveToolStore } from "@/components/constructor/stores/useActiveToolStore";

export default function Activebar() {
  const { activeTool } = useActiveToolStore();

  return (
    <TooltipProvider>
      <div className="h-full w-[300px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-40 transition-all duration-300">
        <h2 className="text-lg font-semibold mb-4">Активный элемент</h2>
        <div className="flex flex-col gap-4 h-full">
          {/* Здесь будет меняться содержимое в зависимости от активного элемента */}
          {activeTool && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Выбран инструмент: {activeTool}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
} 