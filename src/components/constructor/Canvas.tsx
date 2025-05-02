"use client";

import { useRef, useState } from "react";
import * as fabric from "fabric";
import { useCanvasSettingsStore } from "./stores/useCanvasSettingsStore";
import { useCanvasSetup } from "./hooks/useCanvasSetup";
import { useCanvasZoom } from "./hooks/useCanvasZoom";
import { useCanvasPan } from "./hooks/useCanvasPan";
import { useObjectTransform } from "./hooks/useObjectTransform";
import { useCanvasTools } from "./hooks/useCanvasTools";
import { useCanvasGrid } from "./hooks/useCanvasGrid";
import ZoomControls from "./ZoomControls";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2;

  const { gridSize, backgroundColor, canvasWidth, canvasHeight, open } =
    useCanvasSettingsStore();

  const [showGrid, setShowGrid] = useState(true);

  const limitPan = () => {
    if (!fabricCanvas.current) return;

    const canvas = fabricCanvas.current;
    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform!;

    const canvasWidthScaled = canvasWidth * zoom;
    const canvasHeightScaled = canvasHeight * zoom;

    const containerWidth = canvas.getWidth();
    const containerHeight = canvas.getHeight();

    const maxPanX = (canvasWidthScaled - containerWidth) / 2;
    const minPanX = -(canvasWidthScaled - containerWidth) / 2;

    if (vpt[4] > maxPanX) vpt[4] = maxPanX;
    if (vpt[4] < minPanX) vpt[4] = minPanX;

    const maxPanY = (canvasHeightScaled - containerHeight) / 2;
    const minPanY = -(canvasHeightScaled - containerHeight) / 2;

    if (vpt[5] > maxPanY) vpt[5] = maxPanY;
    if (vpt[5] < minPanY) vpt[5] = minPanY;
  };

  useCanvasSetup(canvasRef as React.RefObject<HTMLCanvasElement>, fabricCanvas, backgroundColor, canvasWidth, canvasHeight);
  const { drawGrid } = useCanvasGrid(
    gridRef as React.RefObject<HTMLCanvasElement>,
    fabricCanvas,
    showGrid,
    gridSize,
    canvasWidth,
    canvasHeight
  );
  useCanvasZoom(fabricCanvas, drawGrid, limitPan, zoom, setZoom);
  useCanvasPan(fabricCanvas, drawGrid, limitPan);
  useObjectTransform(fabricCanvas, gridSize);
  useCanvasTools(fabricCanvas, gridSize);

  return (
    <div
      className="relative w-full max-h-[800px] overflow-hidden bg-white rounded-lg shadow border"
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      <canvas
        ref={gridRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{ zIndex: 2 }}
      />

      <div
        className="absolute bottom-4 right-4 flex flex-col items-center gap-2 bg-white p-2 rounded shadow"
        style={{ zIndex: 10 }}
      >
        <ZoomControls
          zoom={zoom}
          setZoom={setZoom}
          fabricCanvas={fabricCanvas.current}
          limitPan={limitPan}
          drawGrid={drawGrid}
        />
      </div>
    </div>
  );
}
