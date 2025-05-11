import { useEffect } from "react";
import { Canvas } from "fabric";

export const useCanvasGrid = (
  gridRef: React.RefObject<HTMLCanvasElement>,
  fabricCanvas: React.RefObject<Canvas>,
  showGrid: boolean,
  gridSize: number,
  canvasWidth: number,
  canvasHeight: number,
) => {
  const drawGrid = () => {
    const gridCanvas = gridRef.current;
    const canvas = fabricCanvas.current;

    if (!gridCanvas || !canvas) return;

    const ctx = gridCanvas?.getContext("2d");
    if (!ctx) return;

    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform;
    if (!vpt) return;

    const offsetX = vpt[4];
    const offsetY = vpt[5];

    gridCanvas.width = canvasWidth;
    gridCanvas.height = canvasHeight;
    if (!showGrid) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const scaledGridSize = gridSize * zoom;
    const startX = offsetX % scaledGridSize;
    const startY = offsetY % scaledGridSize;

    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;

    for (let x = startX; x <= canvasWidth; x += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    for (let y = startY; y <= canvasHeight; y += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    canvas.on("after:render", drawGrid);
    window.addEventListener("resize", drawGrid);

    drawGrid();

    return () => {
      canvas.off("after:render", drawGrid);
      window.removeEventListener("resize", drawGrid);
    };
  }, [fabricCanvas, showGrid, gridSize, canvasWidth, canvasHeight]);

  return { drawGrid };
};
