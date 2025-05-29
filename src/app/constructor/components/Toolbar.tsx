"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MousePointer,
  Trash2,
  Settings,
  Hand,
} from "lucide-react";

import {
  useActiveToolStore,
} from "@/app/constructor/stores/useActiveToolStore";
import { useCanvasSettingsStore } from "@/app/constructor/stores/useCanvasSettingsStore";

export default function Toolbar() {
  const { activeTool, setActiveTool } = useActiveToolStore();
  const { open: openCanvasSettings } = useCanvasSettingsStore();

  return (
    <TooltipProvider>
      <div className="fixed top-[80px] left-1/2 -translate-x-1/2 flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50 transition-all duration-300">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "none" ? "default" : "ghost"}
              size="icon"
              onClick={() => setActiveTool("none")}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Выделение</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "move" ? "default" : "ghost"}
              size="icon"
              onClick={() => setActiveTool("move")}
            >
              <Hand className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Перемещение</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        <Separator orientation="vertical" className="h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "delete" ? "destructive" : "ghost"}
              size="icon"
              onClick={() => setActiveTool("delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Удаление</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={openCanvasSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Настройки</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
