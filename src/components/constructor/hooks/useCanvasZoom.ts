import { useEffect } from "react";
import * as fabric from "fabric";

export const useCanvasZoom = (
  fabricCanvas: React.RefObject<fabric.Canvas | null>,
  drawGrid: () => void,
  limitPan: () => void,
  zoom: number,
  setZoom: (z: number) => void
) => {
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2;

  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const handleWheel = (opt: WheelEvent) => {
      opt.preventDefault();
      let newZoom = canvas.getZoom() * 0.999 ** opt.deltaY;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

      const point = new fabric.Point(opt.offsetX, opt.offsetY);
      canvas.zoomToPoint(point, newZoom);
      setZoom(newZoom);

      limitPan();
      canvas.requestRenderAll();
      drawGrid();
    };

    canvas.upperCanvasEl.addEventListener("wheel", handleWheel);
    return () => canvas.upperCanvasEl.removeEventListener("wheel", handleWheel);
  }, [zoom]);
};
