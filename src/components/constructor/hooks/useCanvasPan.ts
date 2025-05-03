import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useActiveToolStore } from "../stores/useActiveToolStore";

type FabricEvent = fabric.TEvent<Event> & {
  e: MouseEvent | TouchEvent;
  target?: fabric.Object;
};

export const useCanvasPan = (
  fabricCanvas: React.MutableRefObject<fabric.Canvas | null>,
  drawGrid: () => void,
  limitPan: () => void
) => {
  const { activeTool } = useActiveToolStore();
  const isPanning = useRef(false);

  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const handleMouseDown = (e: FabricEvent) => {
      if (activeTool === "move" && e.e.button === 0) {
        isPanning.current = true;
        canvas.setCursor("grab");
        canvas.selection = false;
        canvas.discardActiveObject();
      }
    };

    const handleMouseMove = (e: FabricEvent) => {
      if (isPanning.current) {
        canvas.relativePan(new fabric.Point(e.e.movementX, e.e.movementY));
        limitPan();
        drawGrid();
      }
    };

    const handleMouseUp = () => {
      if (isPanning.current) {
        isPanning.current = false;
        canvas.setCursor("default");
        canvas.selection = true;
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [activeTool]);
};
