import { useEffect, useState } from "react";
import { TEvent, Canvas, FabricObject, Line, Rect } from "fabric";
import { useActiveToolStore } from "../stores/useActiveToolStore";
import { useCanvasStore } from "../stores/useCanvasStore";
import { useFloorStore } from "../stores/useFloorStore";
import { createWall } from "../factories/createWall";
import { createDoor } from "../factories/createDoor";
import { createRoom } from "../factories/createRoom";
import { createPoint } from "../factories/createPoint";
import { createStairs } from "../factories/createStairs";
import { updateStore } from "../utils/canvasUtils";

type FabricEvent = TEvent<Event> & {
  e: MouseEvent | TouchEvent;
  target?: FabricObject;
};

export const useCanvasTools = (
  fabricCanvas: Canvas | null,
  gridSize: number,
  limitPan: () => void,
  drawGrid: () => void,
  zoom: number,
  setZoom: (zoom: number) => void,
) => {
  const { activeTool } = useActiveToolStore();
  const { setObjects } = useCanvasStore();
  const { currentFloorId } = useFloorStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentObj, setCurrentObj] = useState<FabricObject | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  const resetDrawing = () => {
    setIsDrawing(false);
    setCurrentObj(null);
    setStartPos(null);
  };

  const getSnappedPointer = (e: FabricEvent) => {
    const pointer = fabricCanvas!.getViewportPoint(e.e);
    return {
      x: snapToGrid(pointer.x),
      y: snapToGrid(pointer.y),
    };
  };

  useEffect(() => {
    const canvas = fabricCanvas;
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawing && currentObj) {
        canvas.remove(currentObj);
        resetDrawing();
        canvas.requestRenderAll();
      }
    };

    const handleMouseDown = (e: FabricEvent) => {
      const canvas = fabricCanvas;
      if (!canvas) return;

      // Удаление
      if (activeTool === "delete" && e.target) {
        const targets =
          canvas.getActiveObjects().length > 0
            ? canvas.getActiveObjects()
            : [e.target];
        targets.forEach((obj) => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        updateStore(canvas, setObjects, currentFloorId);
        return;
      }

      // Выделение
      if (activeTool === "none" && e.target) {
        canvas.setActiveObject(e.target);
        return;
      }

      const { x, y } = getSnappedPointer(e);

      // Однокликовая точка
      if (activeTool === "point") {
        const point = createPoint(x, y);
        canvas.add(point);
        updateStore(canvas, setObjects, currentFloorId);
        return;
      }

      // Первый клик
      if (!isDrawing) {
        setStartPos({ x, y });

        let tempObj: FabricObject | null = null;

        if (activeTool === "wall" || activeTool === "door") {
          tempObj = new Line([x, y, x, y], {
            stroke: "black",
            strokeWidth: 2,
            selectable: false,
            evented: false,
          });
        } else if (activeTool === "room" || activeTool === "stair") {
          tempObj = new Rect({
            left: x,
            top: y,
            width: 0,
            height: 0,
            fill: "rgba(0,0,0,0.05)",
            stroke: "#999",
            strokeDashArray: [4, 4],
            strokeWidth: 1,
            selectable: false,
            evented: false,
          });
        }

        if (tempObj) {
          canvas.add(tempObj);
          setCurrentObj(tempObj);
          setIsDrawing(true);
        }
      } else {
        // Второй клик: финальное создание
        if (!startPos || !currentObj) return;

        const { x: startX, y: startY } = startPos;
        const left = Math.min(startX, x);
        const top = Math.min(startY, y);
        const width = Math.abs(x - startX);
        const height = Math.abs(y - startY);

        canvas.remove(currentObj);

        if (activeTool === "wall") {
          canvas.add(createWall(startX, startY, x, y));
        } else if (activeTool === "door") {
          canvas.add(createDoor(startX, startY, x, y));
        } else if (activeTool === "room") {
          canvas.add(createRoom(left, top, width, height));
        } else if (activeTool === "stair") {
          canvas.add(createStairs(left, top, width, height, [1, 2]));
        }

        resetDrawing();
        updateStore(canvas, setObjects, currentFloorId);
      }
    };

    const handleMouseMove = (e: FabricEvent) => {
      if (!isDrawing || !currentObj || !startPos) return;
      const { x, y } = getSnappedPointer(e);

      if (currentObj.type === "line") {
        (currentObj as Line).set({ x2: x, y2: y });
      } else if (currentObj.type === "rect") {
        const width = Math.abs(x - startPos.x);
        const height = Math.abs(y - startPos.y);
        currentObj.set({
          left: Math.min(startPos.x, x),
          top: Math.min(startPos.y, y),
          width,
          height,
        });
      }

      fabricCanvas?.renderAll();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTool, isDrawing, currentObj, startPos]);
};
