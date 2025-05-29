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
} from "@/app/constructor/stores/useActiveToolStore";
import { BrickWall, DoorOpen, Square, ArrowUpDown, Dot } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function Shapesbar() {
  const { activeTool, setActiveTool } = useActiveToolStore();

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
      <div className="h-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-40 transition-all duration-300">
        <Tabs defaultValue="forms" className="w-full h-full flex flex-col">
          <h2 className="text-lg font-semibold">Объекты</h2>
          <TabsContent value="forms" className="mt-4 flex-1">
            <div className="flex flex-col items-start gap-3 h-full">
              {tools.map(({ tool, icon, label }) => (
                <Tooltip key={tool}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === tool ? "default" : "ghost"}
                      onClick={() => setActiveTool(tool)}
                      className="w-full justify-start gap-2"
                    >
                      {icon}
                      <span>{label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="history" className="mt-4"></TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
