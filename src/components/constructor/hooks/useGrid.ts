import * as fabric from "fabric";

export const drawGrid = (
  gridRef,
  fabricCanvas,
  gridSize,
  showGrid,
  width,
  height,
) => {
  if (!gridRef.current || !fabricCanvas) return;
  const ctx = gridRef.current.getContext("2d");
  if (!ctx) return;

  const zoom = fabricCanvas.getZoom();
  const vpt = fabricCanvas.viewportTransform;
  if (!vpt) return;

  const offsetX = vpt[4];
  const offsetY = vpt[5];

  gridRef.current.width = width;
  gridRef.current.height = height;
  ctx.clearRect(0, 0, width, height);

  if (!showGrid) return;

  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 1;

  const scaledGridSize = gridSize * zoom;
  const startX = offsetX % scaledGridSize;
  const startY = offsetY % scaledGridSize;

  for (let x = startX; x <= width; x += scaledGridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = startY; y <= height; y += scaledGridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};
