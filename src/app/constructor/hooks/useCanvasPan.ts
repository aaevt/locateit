import { useEffect, useRef } from "react";
import { Canvas, Point, TEvent } from "fabric";
import { useActiveToolStore } from "../stores/useActiveToolStore";

type FabricEvent = TEvent<Event> & {
  e: MouseEvent | TouchEvent;
};

export const useCanvasPan = (
  canvas: Canvas | null,
  drawGrid: () => void,
  limitPan: () => void,
) => {
  const { activeTool } = useActiveToolStore();

  const isPanning = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (e: FabricEvent) => {
      if (
        activeTool === "move" &&
        e.e instanceof MouseEvent &&
        e.e.button === 0
      ) {
        const pointer = canvas.getPointer(e.e as MouseEvent, false);
        lastPos.current = { x: pointer.x, y: pointer.y };
        isPanning.current = true;
        canvas.setCursor("grabbing");
        canvas.selection = false;
        canvas.discardActiveObject();
      }
    };

    const handleMouseMove = (e: FabricEvent) => {
      if (!isPanning.current || !lastPos.current) return;
      const pointer = canvas.getPointer(e.e as MouseEvent, false);
      const dx = pointer.x - lastPos.current.x;
      const dy = pointer.y - lastPos.current.y;

      if (dx !== 0 || dy !== 0) {
        canvas.relativePan(new Point(dx, dy));
        lastPos.current = { x: pointer.x, y: pointer.y };
        limitPan();
        drawGrid();
      }
    };

    const handleMouseUp = () => {
      if (isPanning.current) {
        isPanning.current = false;
        lastPos.current = null;
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
  }, [canvas, activeTool]);
};
