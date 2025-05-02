import { useEffect, useState } from "react";
import * as fabric from "fabric";
import { useActiveToolStore } from "../stores/useActiveToolStore";
import { useCanvasStore } from "../stores/useCanvasStore";
import { useHistoryStore } from "../stores/useHistoryStore";
import { useFloorStore } from "../stores/useFloorStore";
import { createWall } from "../factories/createWall";
import { createDoor } from "../factories/createDoor";
import { createRoom } from "../factories/createRoom";
import { createPoint } from "../factories/createPoint";
import { createStairs } from "../factories/createStairs";
import { updateStore } from "../utils/canvasUtils";
import { Room } from "../classes/Room";

type FabricEvent = fabric.TEvent<Event> & {
  e: MouseEvent | TouchEvent;
  target?: fabric.Object;
};

export const useCanvasTools = (
  fabricCanvas: React.RefObject<fabric.Canvas | null>,
  gridSize: number,
  limitPan: () => void,
  drawGrid: () => void,
  zoom: number,
  setZoom: (zoom: number) => void
) => {
  const { activeTool } = useActiveToolStore();
  const { setObjects } = useCanvasStore();
  const { save: saveHistory } = useHistoryStore();
  const { currentFloorId } = useFloorStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentObj, setCurrentObj] = useState<fabric.Object | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  const resetDrawing = () => {
    setIsDrawing(false);
    setCurrentObj(null);
    setStartPos(null);
  };

  const getSnappedPointer = (e: FabricEvent) => {
    const pointer = fabricCanvas.current!.getPointer(e.e);
    return {
      x: snapToGrid(pointer.x),
      y: snapToGrid(pointer.y),
    };
  };

  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawing && currentObj) {
        canvas.remove(currentObj);
        resetDrawing();
        canvas.requestRenderAll();
      }
    };

    const handleMouseDown = (e: FabricEvent) => {
      const canvas = fabricCanvas.current;
      if (!canvas) return;

      if (activeTool === "delete" && e.target) {
        const objectsToRemove =
          canvas.getActiveObjects().length > 0
            ? canvas.getActiveObjects()
            : [e.target];

        objectsToRemove.forEach((obj) => obj && canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        updateStore(canvas, setObjects, saveHistory, currentFloorId);
        return;
      }

      if (activeTool === "none" && e.target) {
        canvas.setActiveObject(e.target);
        return;
      }

      const { x, y } = getSnappedPointer(e);

      if (!isDrawing) {
        setStartPos({ x, y });

        const objectFactories = {
          wall: () => createWall(x, y, x, y),
          door: () => createDoor(x, y, x, y),
          room: () => createRoom(x, y, 0, 0),
          stair: () => createStairs(x, y, 0, 0, 1, 2),
          point: () => createPoint(x, y),
        };

        const factory =
          objectFactories[activeTool as keyof typeof objectFactories];
        const obj = factory?.();

        if (obj) {
          canvas.add(obj);
          canvas.setActiveObject(obj);
          setCurrentObj(obj);
          setIsDrawing(true);
        }
      } else {
        resetDrawing();
      }
    };

    const handleMouseMove = (e: FabricEvent) => {
      const canvas = fabricCanvas.current;
      if (!isDrawing || !currentObj || !startPos || !canvas) return;

      const { x, y } = getSnappedPointer(e);

      if (currentObj.type === "line") {
        (currentObj as fabric.Line).set({ x2: x, y2: y });
      } else if (currentObj.type === "group") {
        const group = currentObj as fabric.Group;
        const rect = group.item(0) as fabric.Rect;
        const text = group.item(1) as fabric.Textbox;

        const width = Math.abs(x - startPos.x);
        const height = Math.abs(y - startPos.y);

        rect.set({ width, height });
        group.set({
          left: Math.min(startPos.x, x),
          top: Math.min(startPos.y, y),
        });

        if (text) {
          text.set({
            left: width / 2,
            top: height / 2,
            width,
            height,
          });
        }
      }

      canvas.requestRenderAll();
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
