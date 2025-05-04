"use client";

import { useRef, useState, useEffect } from "react";
import * as fabric from "fabric";
import { useCanvasSettingsStore } from "./stores/useCanvasSettingsStore";
import { useCanvasZoom } from "./hooks/useCanvasZoom";
import { useCanvasPan } from "./hooks/useCanvasPan";
import { useObjectTransform } from "./hooks/useObjectTransform";
import { useCanvasTools } from "./hooks/useCanvasTools";
import { useCanvasGrid } from "./hooks/useCanvasGrid";
import { useCanvasStore } from "./stores/useCanvasStore";
import { useFloorStore } from "./stores/useFloorStore";
import { useFloorCanvasManager } from "./hooks/useFloorCanvasManager";
import ZoomControls from "./ZoomControls";
import CanvasSettings from "./CanvasSettings";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const { fabricCanvas } = useFloorCanvasManager(canvasRef);
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2;

  const {
    gridSize,
    backgroundColor,
    canvasWidth,
    canvasHeight,
    backgroundImage,
    backgroundOpacity,
    showGrid,
    open,
  } = useCanvasSettingsStore();
  const { setCanvas } = useCanvasStore();
  const { floors, currentFloorId, saveCurrentFloorJson } = useFloorStore();

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
    
    const maxPanY = (canvasHeightScaled - containerHeight) / 2;
    const minPanY = -(canvasHeightScaled - containerHeight) / 2;

    if (canvasWidthScaled < containerWidth) {
      vpt[4] = (containerWidth - canvasWidthScaled) / 2;
    } else {
      const rightEdgeOffset = 10;
      vpt[4] = Math.min(maxPanX + rightEdgeOffset, Math.max(minPanX, vpt[4]));
    }

    if (canvasHeightScaled < containerHeight) {
      vpt[5] = (containerHeight - canvasHeightScaled) / 2;
    } else {
      vpt[5] = Math.min(maxPanY, Math.max(minPanY, vpt[5]));
    }

    canvas.setViewportTransform(vpt);
  };

  useEffect(() => {
    if (fabricCanvas.current) {
      fabricCanvas.current.setBackgroundColor(backgroundColor, () => {
        fabricCanvas.current?.requestRenderAll();
      });

      if (backgroundImage) {
        fabric.Image.fromURL(backgroundImage, (img) => {
          img.set({
            opacity: backgroundOpacity,
            selectable: false,
            evented: false,
          });
          fabricCanvas.current?.setBackgroundImage(img, () => {
            fabricCanvas.current?.requestRenderAll();
          });
        });
      } else {
        fabricCanvas.current.setBackgroundImage(null, () => {
          fabricCanvas.current?.requestRenderAll();
        });
      }
    }
  }, [backgroundColor, backgroundImage, backgroundOpacity]);

  const { drawGrid } = useCanvasGrid(
    gridRef,
    fabricCanvas,
    showGrid,
    gridSize,
    canvasWidth,
    canvasHeight,
  );
  useCanvasZoom(fabricCanvas, drawGrid, limitPan, zoom, setZoom);
  useCanvasPan(fabricCanvas, drawGrid, limitPan);
  useObjectTransform(fabricCanvas, gridSize);
  useCanvasTools(fabricCanvas, gridSize, limitPan, drawGrid, zoom, setZoom);

  useEffect(() => {
    if (fabricCanvas.current) {
      setCanvas(fabricCanvas.current);
    }
    return () => {
      setCanvas(null);
    };
  }, [fabricCanvas.current]);

  useEffect(() => {
    if (fabricCanvas.current && currentFloorId) {
      const currentFloor = floors.find((f) => f.id === currentFloorId);
      if (currentFloor?.canvasJson) {
        fabricCanvas.current.loadFromJSON(currentFloor.canvasJson, () => {
          fabricCanvas.current?.renderAll();
        });
      }
    }
  }, [currentFloorId, floors, fabricCanvas]);

  useEffect(() => {
    const saveCanvasState = () => {
      if (fabricCanvas.current && currentFloorId) {
        const json = fabricCanvas.current.toJSON();
        saveCurrentFloorJson(json);
      }
    };

    window.addEventListener("beforeunload", saveCanvasState);
    return () => {
      window.removeEventListener("beforeunload", saveCanvasState);
    };
  }, [fabricCanvas, currentFloorId, saveCurrentFloorJson]);

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
      <CanvasSettings />
    </div>
  );
}
