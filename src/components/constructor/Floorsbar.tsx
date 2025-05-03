"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useFloorStore } from "./stores/useFloorStore";

export default function Floorsbar() {
  const { floors, currentFloorId, addFloor, removeFloor, setCurrentFloor } = useFloorStore();

  return (
    <div className="h-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-40 transition-all duration-300">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Этажи</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => addFloor()}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {floors.map((floor) => (
            <div
              key={floor.id}
              className={`flex items-center justify-between p-2 rounded-md ${
                currentFloorId === floor.id
                  ? "bg-primary/10 dark:bg-primary/20"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Button
                variant="ghost"
                className="flex-1 justify-start"
                onClick={() => setCurrentFloor(floor.id)}
              >
                Этаж {floor.number}
              </Button>
              {floors.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFloor(floor.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 