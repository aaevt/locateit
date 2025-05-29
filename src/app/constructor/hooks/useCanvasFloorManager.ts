import { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";
import { useCanvasSettingsStore } from "../stores/useCanvasSettingsStore";
import { useCanvasStore } from "../stores/useCanvasStore";
import { useFloorStore } from "../stores/useFloorStore";

export function useFloorCanvasManager(
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const fabricCanvas = useRef<Canvas | null>(null);
  const [canvasReadyTrigger, setCanvasReadyTrigger] = useState(0);

  const { canvasWidth, canvasHeight, backgroundColor } =
    useCanvasSettingsStore();
  const { setCanvas } = useCanvasStore();
  const { currentFloorId, floors, saveCurrentFloorJson } = useFloorStore();

  useEffect(() => {
    if (!canvasRef.current || !currentFloorId) return;

    if (fabricCanvas.current) {
      const json = fabricCanvas.current.toJSON();
      saveCurrentFloorJson(json);
      fabricCanvas.current.dispose();
      fabricCanvas.current = null;
    }

    const canvas = new Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor,
    });

    fabricCanvas.current = canvas;
    setCanvas(canvas);

    const floor = floors.find((f) => f.id === currentFloorId);
    if (floor?.canvasJson) {
      canvas.loadFromJSON(floor.canvasJson, () => {
        canvas.renderAll();
        fabricCanvas.current = canvas;
        setCanvasReadyTrigger((n) => n + 1);
      });
    } else {
      canvas.renderAll();
      fabricCanvas.current = canvas;
      setCanvasReadyTrigger((n) => n + 1);
    }

    return () => {
      setCanvas(null);
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
        fabricCanvas.current = null;
      }
    };
  }, [
    currentFloorId,
    canvasWidth,
    canvasHeight,
    backgroundColor,
    floors,
    saveCurrentFloorJson,
    setCanvas,
  ]);

  return { fabricCanvas, canvasReadyTrigger};
}
