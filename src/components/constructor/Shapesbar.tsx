"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ToolType,
  useActiveToolStore,
} from "@/components/constructor/stores/useActiveToolStore";
import {
  BrickWall,
  DoorOpen,
  Square,
  ArrowUpDown,
  Dot,
  Clock,
} from "lucide-react";
import { useState } from "react";
import HistoryPanel from "@/components/constructor/HistoryPanel";

export default function Shapesbar() {
  const { activeTool, setActiveTool } = useActiveToolStore();
  const [showHistory, setShowHistory] = useState(false);

  const tools: { tool: ToolType; icon: React.ReactNode; label: string }[] = [
    { tool: "wall", icon: <BrickWall className="h-5 w-5" />, label: "Стена" },
    { tool: "door", icon: <DoorOpen className="h-5 w-5" />, label: "Дверь" },
    { tool: "room", icon: <Square className="h-5 w-5" />, label: "Комната" },
    {
      tool: "stair",
      icon: <ArrowUpDown className="h-5 w-5" />,
      label: "Лестница",
    },
    { tool: "point", icon: <Dot className="h-5 w-5" />, label: "Точка" },
  ];

  return (
    <TooltipProvider>
      <div className="fixed top-[100px] left-4 flex flex-col items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-40 transition-all duration-300">
        {tools.map(({ tool, icon, label }) => (
          <Tooltip key={tool}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={activeTool === tool ? "default" : "ghost"}
                onClick={() => setActiveTool(tool)}
                className="transition-all duration-300"
              >
                {icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowHistory(!showHistory)}
              className="transition-all duration-300"
            >
              <Clock className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            История
          </TooltipContent>
        </Tooltip>

        {showHistory && <HistoryPanel />}
      </div>
    </TooltipProvider>
  );
}
