import { useEffect } from "react";
import * as fabric from "fabric";

import { createWall } from "@/components/constructor/factories/createWall";
import { createDoor } from "@/components/constructor/factories/createDoor";
import { createRoom } from "@/components/constructor/factories/createRoom";
import { createPoint } from "@/components/constructor/factories/createPoint";
import { createStairs } from "@/components/constructor/factories/createStairs";

import { updateStore, snapToGrid } from "../utils/canvasUtils";
import { useCanvasStore } from "../stores/useCanvasStore";
import { useHistoryStore } from "../stores/useHistoryStore";
import { useFloorStore } from "../stores/useFloorStore";

export const useDrawingTool = ({
  fabricCanvasRef,
  activeTool,
  isDrawing,
  setIsDrawing,
  currentObj,
  setCurrentObj,
  startPos,
  setStartPos,
}) => {
  const { setObjects } = useCanvasStore();
  const { save: saveHistory } = useHistoryStore();
  const { currentFloorId } = useFloorStore();

  const resetDrawing = () => {
    setIsDrawing(false);
    setCurrentObj(null);
    setStartPos(null);
  };

  const getSnappedPointer = (canvas, e) => {
    const pointer = canvas.getPointer(e.e);
    return {
      x: snapToGrid(pointer.x, 10),
      y: snapToGrid(pointer.y, 10),
    };
  };

  const objectFactories = {
    wall: (x, y) => createWall(x, y, x, y),
    door: (x, y) => createDoor(x, y, x, y),
    room: (x, y) => createRoom(x, y, 0, 0),
    stair: (x, y) => createStairs(x, y, 0, 0, [1, 2]),
    point: (x, y) => createPoint(x, y),
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const beginDraw = (e) => {
      const { x, y } = getSnappedPointer(canvas, e);
      setStartPos({ x, y });

      const factory = objectFactories[activeTool];
      if (!factory) return;

      const obj = factory(x, y);
      if (obj) {
        canvas.add(obj);
        canvas.setActiveObject(obj);
        setCurrentObj(obj);
        setIsDrawing(true);
      }
    };

    const endDraw = () => {
      resetDrawing();
      updateStore(canvas, setObjects, saveHistory, currentFloorId);
    };

    const handleMouseDown = (e) => {
      if (!isDrawing) {
        beginDraw(e);
      } else {
        endDraw();
      }
    };

    const handleMouseMove = (e) => {
      const canvas = fabricCanvasRef.current;
      if (!isDrawing || !currentObj || !startPos || !canvas) return;

      const { x, y } = getSnappedPointer(canvas, e);

      if (currentObj instanceof fabric.Line) {
        currentObj.set({ x2: x, y2: y });
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

        text.set({
          left: width / 2,
          top: height / 2,
          width,
          height,
        });
      }

      canvas.requestRenderAll();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
    };
  }, [fabricCanvasRef, activeTool, isDrawing, currentObj, startPos]);
};
