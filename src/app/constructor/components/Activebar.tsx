"use client";

import { useCanvasStore } from "@/app/constructor/stores/useCanvasStore";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Room } from "@/app/constructor/classes/Room";
import { Stairs } from "@/app/constructor/classes/Stairs";
import { Line } from "fabric";

export default function Activebar() {
  const { activeObject, canvas } = useCanvasStore();

  const forceRender = () => {
    activeObject?.setCoords?.();
    canvas?.requestRenderAll();
  };

  const renderRoomProps = (room: Room) => (
    <>
      <div>
        <Label className="text-sm">Имя комнаты</Label>
        <Input
          value={room.label || ""}
          onChange={(e) => {
            room.label = e.target.value;
            forceRender();
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
            forceRender();
          }}
        />
      </div>
    </>
  );

  const renderStairsProps = (stairs: Stairs) => (
    <div>
      <Label className="text-sm">Этажи</Label>
      <Input
        value={stairs.floors?.join(", ") || ""}
        onChange={(e) => {
          stairs.floors = e.target.value
            .split(",")
            .map((n) => parseInt(n.trim(), 10))
            .filter((n) => !isNaN(n));
          forceRender();
        }}
      />
    </div>
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
            forceRender();
          }}
        />
      </div>
      <div>
        <Label className="text-sm">Цвет линии</Label>
        <Input
          value={line.stroke as string}
          onChange={(e) => {
            line.set("stroke", e.target.value);
            forceRender();
          }}
        />
      </div>
    </>
  );

  const renderObjectProps = () => {
    if (!activeObject) return null;

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
