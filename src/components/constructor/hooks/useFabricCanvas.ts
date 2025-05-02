import { useEffect, useRef } from "react";
import { useCanvasSettingsStore } from "@/components/constructor/stores/useCanvasSettingsStore";
import { useFloorStore } from "@/components/constructor/stores/useFloorStore";
import { loadFromStorage } from "@/components/constructor/libs/localStorage";
import * as fabric from "fabric";

export const useFabricCanvas = (canvasRef, setFabricCanvas) => {
  const { backgroundColor, canvasWidth, canvasHeight, open } =
    useCanvasSettingsStore();
  const { currentFloorId } = useFloorStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor,
      width: canvasWidth,
      height: canvasHeight,
      selection: true,
    });

    setFabricCanvas(canvas);

    const savedData = loadFromStorage();
    if (savedData && savedData[currentFloorId]) {
      canvas.loadFromJSON(savedData[currentFloorId], () => {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      });
    } else {
      open();
    }

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, [canvasRef, currentFloorId, backgroundColor, canvasWidth, canvasHeight]);
};
