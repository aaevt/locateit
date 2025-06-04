"use client";

import { useRef, useState, useEffect } from "react";
import * as fabric from "fabric";
import { useCanvasSettingsStore } from "@/app/constructor/stores/useCanvasSettingsStore";
import {
  useCanvasZoom,
} from "@/app/constructor/hooks/useCanvasZoom";
import {
  useCanvasPan,
} from "@/app/constructor/hooks/useCanvasPan";
import {
  useCanvasObjectTransform,
} from "@/app/constructor/hooks/useCanvasObjectTransform";
import { useCanvasGrid } from "@/app/constructor/hooks/useCanvasGrid";
import {
  useCanvasTools,
} from "@/app/constructor/hooks/useCanvasTools";
import { useCanvasStore } from "@/app/constructor/stores/useCanvasStore";
import { useFloorStore } from "@/app/constructor/stores/useFloorStore";
import { useFloorCanvasManager } from "@/app/constructor/hooks/useCanvasFloorManager";
import { saveToStorage } from "../libs/localStorage";
import ZoomControls from "@/app/constructor/components/ZoomControls";
import CanvasSettings from "@/app/constructor/components/CanvasSettings";
import { useActiveToolStore } from "../stores/useActiveToolStore";
import { FabricImage } from "fabric";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const { fabricCanvas, canvasReadyTrigger } = useFloorCanvasManager(canvasRef);
  const [zoom, setZoom] = useState(1);

  const {
    gridSize,
    backgroundColor,
    canvasWidth,
    canvasHeight,
    backgroundImage,
    backgroundOpacity,
    showGrid,
  } = useCanvasSettingsStore();

  const { setCanvas, setObjects } = useCanvasStore();
  const { floors, currentFloorId, saveCurrentFloorJson } = useFloorStore();
  const { activeTool } = useActiveToolStore();

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
  const canvas = fabricCanvas.current;
  if (!canvas) return;

  canvas.backgroundColor = backgroundColor;

  if (backgroundImage) {
    FabricImage.fromURL(backgroundImage, (img) => {
      if (!img) {
        console.error("Ошибка загрузки фонового изображения");
        canvas.backgroundImage = undefined;
        canvas.renderAll();
        return;
      }
      img.set({
        opacity: backgroundOpacity,
        selectable: false,
        evented: false,
      });
      canvas.backgroundImage = img;
      console.log("Background image loaded:", img);
      canvas.renderAll();
    });
  } else {
    canvas.backgroundImage = undefined;
    canvas.renderAll();
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

  useCanvasZoom(fabricCanvas.current, drawGrid, limitPan, zoom, setZoom);
  useCanvasPan(fabricCanvas.current, drawGrid, limitPan);
  useCanvasObjectTransform(fabricCanvas.current, gridSize);
  useCanvasTools(fabricCanvas.current, gridSize, limitPan, drawGrid, zoom, setZoom);

  useEffect(() => {
    if (fabricCanvas.current) {
      drawGrid();
    }
  }, [fabricCanvas.current, canvasWidth, canvasHeight, showGrid, gridSize]);

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
          fabricCanvas.current?.requestRenderAll();
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

  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const updateActive = () => {
      const active = canvas.getActiveObject();
      useCanvasStore.getState().setActiveObject(active || null);
    };

    canvas.on("selection:created", updateActive);
    canvas.on("selection:updated", updateActive);
    canvas.on("selection:cleared", updateActive);
    canvas.on("mouse:down", updateActive);

    return () => {
      canvas.off("selection:created", updateActive);
      canvas.off("selection:updated", updateActive);
      canvas.off("selection:cleared", updateActive);
      canvas.off("mouse:down", updateActive);
    };
  }, [fabricCanvas.current]);

  return (
    <div
      className="relative w-full max-h-[800px] overflow-hidden bg-white rounded-lg shadow border"
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        width={canvasWidth}
        height={canvasHeight}
        style={{ zIndex: 1 }}
      />
      <canvas
        ref={gridRef}
        className="absolute top-0 left-0 pointer-events-none"
        width={canvasWidth.current}
        height={canvasHeight}
        style={{ zIndex: 2 }}
      />

      <div
        className="absolute bottom-4 right-4 flex flex-col items-center gap-2 bg-white p-2 rounded shadow"
        style={{ zIndex: 30 }}
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