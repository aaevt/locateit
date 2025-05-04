"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useFloorStore } from "@/components/constructor/stores/useFloorStore";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableFloorItem({ floor, currentFloorId }: any) {
  const { setCurrentFloor, removeFloor, updateFloorName } = useFloorStore();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: floor.id });

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(floor.name || `Этаж ${floor.number}`);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleNameChange = () => {
    updateFloorName(floor.id, newName);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 rounded-md gap-2 ${
        currentFloorId === floor.id
          ? "bg-primary/10 dark:bg-primary/20"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <span {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 opacity-60" />
      </span>
      {isEditing ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleNameChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleNameChange();
          }}
          className="flex-1 px-2 py-1 border rounded-md"
          autoFocus
        />
      ) : (
        <Button
          variant="ghost"
          className="flex-1 justify-start"
          onClick={() => setCurrentFloor(floor.id)}
          onDoubleClick={() => setIsEditing(true)}
        >
          {newName}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeFloor(floor.id)}
        className="h-8 w-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function Floorsbar() {
  const { floors, currentFloorId, addFloor, moveFloor, setCurrentFloor, loadFloors } =
    useFloorStore();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = floors.findIndex((f) => f.id === active.id);
      const newIndex = floors.findIndex((f) => f.id === over.id);
      const reordered = arrayMove(floors, oldIndex, newIndex);
      reordered.forEach((f, idx) => (f.number = idx + 1));
      moveFloor(oldIndex, newIndex);
    }
  };

  useEffect(() => {
    loadFloors();
  }, [loadFloors]);

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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={floors.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 overflow-y-auto">
              {floors.map((floor) => (
                <SortableFloorItem
                  key={floor.id}
                  floor={floor}
                  currentFloorId={currentFloorId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
