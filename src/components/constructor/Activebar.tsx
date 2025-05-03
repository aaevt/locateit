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
      <div className="h-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-40 transition-all duration-300">
        <div className="flex flex-col gap-4 h-full">
          <h2 className="text-lg font-semibold">Свойства</h2>
          <div className="flex flex-col gap-4">
            {activeTool && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Выбран инструмент: {activeTool}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 