"use client";
import { Layers, LayoutPanelLeftIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FloorSelectorProps {
  floors: { id: string; number: number; name?: string }[];
  currentFloorId: string;
  onChange: (id: string) => void;
}

export function FloorSelector({ floors, currentFloorId, onChange }: FloorSelectorProps) {
  const sortedFloors = [...floors].sort((a, b) => b.number - a.number);
  
  return (
    <div className="min-w-[200px] h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      <div className="p-4 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <Layers className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Этажи</h3>
      </div>
      
      <ScrollArea className="h-[calc(100%-60px)] p-2">
        {sortedFloors.length > 0 ? (
          <div className="flex flex-col space-y-1">
            {sortedFloors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => onChange(floor.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md transition-colors",
                  "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  floor.id === currentFloorId
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                <LayoutPanelLeftIcon className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Этаж {floor.number}</span>
                  {floor.name && <span className="text-xs opacity-70">{floor.name}</span>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 p-4">
            <p>Этажи отсутствуют</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
