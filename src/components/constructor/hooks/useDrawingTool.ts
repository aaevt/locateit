import { useEffect } from "react";
import * as fabric from "fabric";
import { createWall } from "@/components/constructor/objects/Wall";
import { createDoor } from "@/components/constructor/objects/Door";
import { createRoom } from "@/components/constructor/objects/Room";
import { createStairs } from "@/components/constructor/objects/Stairs";
import { createPoint } from "@/components/constructor/objects/Point";
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
    roomTemp: (x, y) =>
      new fabric.Rect({
        left: x,
        top: y,
        width: 0,
        height: 0,
        fill: "rgba(0, 0, 255, 0.1)",
        stroke: "blue",
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        objectCaching: false,
      }),
    stairTemp: (x, y) =>
      new fabric.Rect({
        left: x,
        top: y,
        width: 0,
        height: 0,
        fill: "rgba(255,165,0,0.2)",
        stroke: "orange",
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        objectCaching: false,
      }),
    point: (x, y) => createPoint(x, y),
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const beginDraw = (e) => {
      const { x, y } = getSnappedPointer(canvas, e);
      setStartPos({ x, y });

      let obj = null;
      if (activeTool === "wall" || activeTool === "door") {
        obj = objectFactories[activeTool](x, y);
      } else if (activeTool === "room") {
        obj = objectFactories.roomTemp(x, y);
      } else if (activeTool === "stair") {
        obj = objectFactories.stairTemp(x, y);
      } else if (activeTool === "point") {
        obj = objectFactories.point(x, y);
      }

      if (obj) {
        canvas.add(obj);
        canvas.setActiveObject(obj);
        setCurrentObj(obj);
        setIsDrawing(true);
      }
    };

    const endDraw = (e) => {
      if (!currentObj || !startPos) return;

      const { x, y } = getSnappedPointer(canvas, e);
      const width = Math.abs(x - startPos.x);
      const height = Math.abs(y - startPos.y);
      canvas.remove(currentObj);

      const left = Math.min(startPos.x, x);
      const top = Math.min(startPos.y, y);

      if (activeTool === "room") {
        canvas.add(createRoom(left, top, width, height));
      } else if (activeTool === "stair") {
        canvas.add(createStairs(left, top, width, height, 1, 2));
      }

      resetDrawing();
      updateStore(canvas, setObjects, saveHistory, currentFloorId);
    };

    const handleMouseDown = (e) => {
      if (!isDrawing) {
        beginDraw(e);
      } else {
        endDraw(e);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || !currentObj || !startPos) return;

      const { x, y } = getSnappedPointer(canvas, e);

      if (currentObj instanceof fabric.Line) {
        currentObj.set({ x2: x, y2: y });
      } else if (currentObj instanceof fabric.Rect) {
        const width = Math.abs(x - startPos.x);
        const height = Math.abs(y - startPos.y);
        currentObj.set({
          width,
          height,
          left: Math.min(startPos.x, x),
          top: Math.min(startPos.y, y),
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
