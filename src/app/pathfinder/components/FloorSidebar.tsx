"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Building, Layers } from "lucide-react";

interface FloorSidebarProps {
  floors: { id: string; number: number; name?: string }[];
  currentFloorId: string;
  onChange: (id: string) => void;
}

export function FloorSidebar({ floors, currentFloorId, onChange }: FloorSidebarProps) {
  const sortedFloors = [...floors].sort((a, b) => b.number - a.number);
  return (
    <Card className="min-w-[240px] max-w-[320px] h-full rounded-xl border shadow-md bg-white dark:bg-neutral-900 flex flex-col flex-1">
      <CardHeader className="p-4 flex flex-row items-center gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <Building className="h-5 w-5 text-blue-600" />
        <CardTitle className="text-lg font-semibold">Этажи</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 p-2">
        {sortedFloors.length > 0 ? (
          <div className="flex flex-col space-y-1">
            {sortedFloors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => onChange(floor.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors font-medium",
                  "hover:bg-blue-100/60 dark:hover:bg-blue-900/40",
                  floor.id === currentFloorId
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 shadow"
                    : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                <Layers className="h-5 w-5" />
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
    </Card>
  );
}
