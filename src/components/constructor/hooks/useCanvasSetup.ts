import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useCanvasStore } from "../stores/useCanvasStore";
import { useFloorStore } from "../stores/useFloorStore";
import { loadFromStorage } from "../libs/localStorage";

export const useCanvasSetup = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  fabricCanvas: React.MutableRefObject<fabric.Canvas | null>,
  backgroundColor: string,
  canvasWidth: number,
  canvasHeight: number
) => {
  const { setObjects } = useCanvasStore();
  const { currentFloorId } = useFloorStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor,
      width: canvasWidth,
      height: canvasHeight,
      selection: true,
    });

    fabricCanvas.current = canvas;

    const savedData = loadFromStorage();
    if (savedData && savedData[currentFloorId]) {
      fabricCanvas.current.loadFromJSON(savedData[currentFloorId], () => {
        fabricCanvas.current?.discardActiveObject();
        fabricCanvas.current?.requestRenderAll();
      });
    }

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
        fabricCanvas.current = null;
      }
    };
  }, [currentFloorId, backgroundColor, canvasWidth, canvasHeight]);
}; 