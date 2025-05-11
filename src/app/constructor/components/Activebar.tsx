"use client";

import { useCanvasStore } from "@/app/constructor/stores/useCanvasStore";
import { useFloorStore } from "@/app/constructor/stores/useFloorStore";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Room } from "@/app/constructor/classes/Room";
import { Stairs } from "@/app/constructor/classes/Stairs";
import { Line, FabricObject } from "fabric";

export default function Activebar() {
  const { activeObject, canvas } = useCanvasStore();
  const { saveCurrentFloorJson } = useFloorStore();
  const [, forceUpdateComponent] = useState(0);

  const handlePropertyChange = () => {
    canvas?.requestRenderAll();
    if (canvas) {
      const canvasJson = canvas.toJSON();
      saveCurrentFloorJson(canvasJson);
    }
    forceUpdateComponent((c) => c + 1);
  };

  const renderRoomProps = (room: Room) => (
    <>
      <div>
        <Label className="text-sm">Имя комнаты</Label>
        <Input
          value={room.label || ""}
          onChange={(e) => {
            room.label = e.target.value;
            handlePropertyChange();
          }}
        />
      </div>
      <div>
        <Label className="text-sm">Номер комнаты</Label>
        <Input
          type="number"
          value={room.roomNumber || ""}
          onChange={(e) => {
            room.roomNumber = Number(e.target.value);
            handlePropertyChange();
          }}
        />
      </div>
      <div>
        <Label className="text-sm">Цвет комнаты</Label>
        <Input
          type="color"
          value={(room.fill as string) || "#ffffff"}
          onChange={(e) => {
            room.fill = e.target.value;
            handlePropertyChange();
          }}
        />
      </div>
    </>
  );

  const renderStairsProps = (stairs: Stairs) => (
    <>
      <div>
        <Label className="text-sm">Этажи</Label>
        <Input
          value={stairs.floors?.join(", ") || ""}
          onChange={(e) => {
            const newFloors = e.target.value
              .split(",")
              .map((n) => parseInt(n.trim(), 10))
              .filter((n) => !isNaN(n));
            stairs.floors = newFloors;
            handlePropertyChange();
          }}
        />
      </div>
      <div>
        <Label className="text-sm">Цвет лестницы</Label>
        <Input
          type="color"
          value={(stairs.fill as string) || "#ffffff"}
          onChange={(e) => {
            stairs.fill = e.target.value;
            handlePropertyChange();
          }}
        />
      </div>
    </>
  );

  const renderLineProps = (line: Line) => (
    <>
      <div>
        <Label className="text-sm">Толщина линии</Label>
        <Input
          type="number"
          value={line.strokeWidth || 1}
          onChange={(e) => {
            line.set("strokeWidth", Number(e.target.value));
            handlePropertyChange();
          }}
        />
      </div>
      <div>
        <Label className="text-sm">Цвет линии</Label>
        <Input
          type="color"
          value={(line.stroke as string) || "#000000"}
          onChange={(e) => {
            line.set("stroke", e.target.value);
            handlePropertyChange();
          }}
        />
      </div>
    </>
  );

  const renderObjectProps = () => {
    if (!activeObject) return null;

    if (!(activeObject instanceof FabricObject)) {
      return <p className="text-sm text-gray-500">Выбранный элемент не является объектом Fabric</p>;
    }

    if (activeObject instanceof Room) return renderRoomProps(activeObject);
    if (activeObject instanceof Stairs) return renderStairsProps(activeObject);
    if (activeObject.type === "line") return renderLineProps(activeObject as Line);

    return <p className="text-sm text-gray-500">Неизвестный тип объекта</p>;
  };

  return (
    <TooltipProvider>
      <div className="h-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-40">
        <h2 className="text-lg font-semibold mb-4">Свойства</h2>
        {activeObject ? (
          <div className="flex flex-col gap-4">{renderObjectProps()}</div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ничего не выбрано
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}
