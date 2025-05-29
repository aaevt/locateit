import { useEffect } from "react";
import { Canvas, Point } from "fabric";
import { useFloorStore } from "../stores/useFloorStore";

export const useCanvasZoom = (
  fabricCanvas: Canvas | null,
  drawGrid: () => void,
  limitPan: () => void,
  zoom: number,
  setZoom: (z: number) => void,
) => {
  const { currentFloorId } = useFloorStore();

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2;

  useEffect(() => {
    const canvas = fabricCanvas;
    if (!canvas || !canvas.upperCanvasEl) return;

    const el = canvas.upperCanvasEl;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      let newZoom = canvas.getZoom() * 0.999 ** e.deltaY;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

      const point = new Point(e.offsetX, e.offsetY);
      canvas.zoomToPoint(point, newZoom);
      setZoom(newZoom);

      limitPan();
      canvas.requestRenderAll();
      drawGrid();
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      if (el) {
        el.removeEventListener("wheel", handleWheel);
      }
    };
  }, [fabricCanvas, currentFloorId]);
};
