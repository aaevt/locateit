"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useCanvasStore } from "@/components/constructor/stores/useCanvasStore";
import { useFloorStore } from "@/components/constructor/stores/useFloorStore";
import { useHistoryStore } from "@/components/constructor/stores/useHistoryStore";
import { useActiveToolStore } from "@/components/constructor/stores/useActiveToolStore";
import { useCanvasSettingsStore } from "@/components/constructor/stores/useCanvasSettingsStore";

import {
  loadFromStorage,
  saveToStorage,
} from "@/components/constructor/libs/localStorage";

import { createWall } from "@/components/constructor/objects/Wall";
import { createDoor } from "@/components/constructor/objects/Door";
import { createRoom } from "@/components/constructor/objects/Room";
import { createStairs } from "@/components/constructor/objects/Stairs";
import { createPoint } from "@/components/constructor/objects/Point";
import CanvasSettings from "@/components/constructor/CanvasSettings";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2;

  const { activeTool } = useActiveToolStore();
  const { setObjects } = useCanvasStore();
  const isPanning = useRef(false);
  const { currentFloorId } = useFloorStore();
  const { save: saveHistory } = useHistoryStore();
  const { gridSize, backgroundColor, canvasWidth, canvasHeight, open } =
    useCanvasSettingsStore();

  const [showGrid, setShowGrid] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentObj, setCurrentObj] = useState<fabric.Object | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  const updateStore = () => {
    const json = fabricCanvas.current?.toJSON();
    if (json) {
      setObjects(json.objects || []);
      saveHistory(json);
      saveToStorage({ [currentFloorId]: json });
    }
  };

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

  useEffect(() => {
    if (!fabricCanvas.current) return;

    const canvas = fabricCanvas.current;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (activeTool === "move" && e.e.button === 0) {
        isPanning.current = true;
        canvas.setCursor("grab");
      }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (isPanning.current && e.e instanceof MouseEvent) {
        const delta = new fabric.Point(e.e.movementX, e.e.movementY);
        canvas.relativePan(delta);
        limitPan();
      }
    };

    const handleMouseUp = () => {
      if (isPanning.current) {
        isPanning.current = false;
        canvas.setCursor("default");
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [activeTool]);

  useEffect(() => {
    if (!fabricCanvas.current) return;

    const handleWheel = (opt: WheelEvent) => {
      if (!fabricCanvas.current) return;

      opt.preventDefault();
      const canvas = fabricCanvas.current;

      const delta = opt.deltaY;
      let newZoom = canvas.getZoom();
      newZoom *= 0.999 ** delta;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

      const point = new fabric.Point(opt.offsetX, opt.offsetY);
      canvas.zoomToPoint(point, newZoom);
      setZoom(newZoom);

      limitPan();
      canvas.requestRenderAll();
      drawGrid();
    };

    const canvasEl = fabricCanvas.current.upperCanvasEl;
    canvasEl.addEventListener("wheel", handleWheel);

    return () => {
      canvasEl.removeEventListener("wheel", handleWheel);
    };
  }, [zoom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDrawing && currentObj) {
          fabricCanvas.current?.remove(currentObj);
          setIsDrawing(false);
          setCurrentObj(null);
          setStartPos(null);
          fabricCanvas.current?.discardActiveObject();
          fabricCanvas.current?.requestRenderAll();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawing, currentObj]);

  useEffect(() => {
    let copiedObject: fabric.Object | null = null;
    let offset = 20;

    const cloneFabricObject = (obj: fabric.Object): Promise<fabric.Object> => {
      return new Promise((resolve) => {
        obj.clone((cloned) => resolve(cloned));
      });
    };

    const handleCopyPaste = async (e: KeyboardEvent) => {
      if (!fabricCanvas.current) return;

      const canvas = fabricCanvas.current;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          e.preventDefault();

          if (activeObject.type === "activeSelection") {
            const group = (activeObject as fabric.ActiveSelection).toGroup();
            canvas.discardActiveObject();
            canvas.requestRenderAll();

            copiedObject = await cloneFabricObject(group);
          } else {
            copiedObject = await cloneFabricObject(activeObject);
          }
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (copiedObject) {
          e.preventDefault();

          const cloned = await cloneFabricObject(copiedObject);
          cloned.set({
            left: (copiedObject.left ?? 0) + offset,
            top: (copiedObject.top ?? 0) + offset,
          });

          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          updateStore();
          canvas.requestRenderAll();

          offset += 20;
        }
      }
    };

    window.addEventListener("keydown", handleCopyPaste);
    return () => {
      window.removeEventListener("keydown", handleCopyPaste);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: backgroundColor,
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
    } else {
      open();
    }

    fabricCanvas.current.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;

      obj.left = snapToGrid(obj.left ?? 0);
      obj.top = snapToGrid(obj.top ?? 0);

      updateStore();
    });

    fabricCanvas.current.on("object:scaling", (e) => {
      const obj = e.target;
      if (!obj) return;

      if (obj.type === "group") {
        const group = obj as fabric.Group;
        const rect = group.item(0) as fabric.Rect;
        if (rect) {
          const newWidth = snapToGrid((rect.width ?? 0) * (group.scaleX ?? 1));
          const newHeight = snapToGrid(
            (rect.height ?? 0) * (group.scaleY ?? 1),
          );

          rect.set({
            width: newWidth,
            height: newHeight,
          });

          const text = group.item(1) as fabric.Textbox;
          if (text) {
            text.left = newWidth / 2;
            text.top = newHeight / 2;
          }

          group.scaleX = 1;
          group.scaleY = 1;
          group.setCoords();
        }
      } else {
        obj.scaleX = Math.round((obj.scaleX ?? 1) * 10) / 10;
        obj.scaleY = Math.round((obj.scaleY ?? 1) * 10) / 10;
      }

      updateStore();
      fabricCanvas.current.requestRenderAll();
    });

    fabricCanvas.current.on("object:rotating", (e) => {
      const obj = e.target;
      if (!obj) return;

      obj.angle = Math.round((obj.angle ?? 0) / 45) * 45;

      updateStore();
      fabricCanvas.current.requestRenderAll();
    });

    fabricCanvas.current.on("object:added", () => updateStore());

    const disableContextMenu = (e: MouseEvent) => e.preventDefault();
    fabricCanvas.current.upperCanvasEl.addEventListener(
      "contextmenu",
      disableContextMenu,
    );

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.upperCanvasEl.removeEventListener(
          "contextmenu",
          disableContextMenu,
        );
        fabricCanvas.current.dispose();
        fabricCanvas.current = null;
      }
    };
  }, [currentFloorId, gridSize, backgroundColor, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (!fabricCanvas.current) return;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!fabricCanvas.current) return;

      if (e.e.button === 2 && e.target) {
        fabricCanvas.current.remove(e.target);
        updateStore();
        fabricCanvas.current.discardActiveObject();
        fabricCanvas.current.requestRenderAll();
        return;
      }

      if (activeTool === "delete") {
        if (e.target) {
          fabricCanvas.current.remove(e.target);
          updateStore();
          fabricCanvas.current.discardActiveObject();
          fabricCanvas.current.requestRenderAll();
        }
        return;
      }

      if (activeTool === "none") {
        if (e.target) {
          fabricCanvas.current.setActiveObject(e.target);
        }
        return;
      }

      const pointer = fabricCanvas.current.getPointer(e.e);
      const snappedPointer = {
        x: snapToGrid(pointer.x),
        y: snapToGrid(pointer.y),
      };

      if (!isDrawing) {
        setStartPos(snappedPointer);
        let obj: fabric.Object | null = null;

        if (activeTool === "wall") {
          obj = createWall(
            snappedPointer.x,
            snappedPointer.y,
            snappedPointer.x,
            snappedPointer.y,
          );
        } else if (activeTool === "door") {
          obj = createDoor(
            snappedPointer.x,
            snappedPointer.y,
            snappedPointer.x,
            snappedPointer.y,
          );
        } else if (activeTool === "room") {
          obj = createRoom(snappedPointer.x, snappedPointer.y);
        } else if (activeTool === "stair") {
          obj = createStairs(snappedPointer.x, snappedPointer.y, 1, 1, 1, 2);
        } else if (activeTool === "point") {
          obj = createPoint(snappedPointer.x, snappedPointer.y);
        }

        if (obj) {
          fabricCanvas.current.add(obj);
          fabricCanvas.current.setActiveObject(obj);
          setCurrentObj(obj);
          setIsDrawing(true);
        }
      } else {
        setIsDrawing(false);
        setCurrentObj(null);
        setStartPos(null);
      }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!isDrawing || !currentObj || !startPos) return;
      const pointer = fabricCanvas.current!.getPointer(e.e);
      const snappedPointer = {
        x: snapToGrid(pointer.x),
        y: snapToGrid(pointer.y),
      };

      if (currentObj.type === "line") {
        (currentObj as fabric.Line).set({
          x2: snappedPointer.x,
          y2: snappedPointer.y,
        });
      } else if (currentObj.type === "group") {
        const group = currentObj as fabric.Group;
        const rect = group.item(0) as fabric.Rect;
        rect.set({
          width: Math.abs(snappedPointer.x - startPos.x),
          height: Math.abs(snappedPointer.y - startPos.y),
        });
        group.set({
          left: Math.min(startPos.x, snappedPointer.x),
          top: Math.min(startPos.y, snappedPointer.y),
        });

        const text = group.item(1) as fabric.Textbox;
        text.set({
          left: (rect.width ?? 0) / 2,
          top: (rect.height ?? 0) / 2,
        });
      }

      fabricCanvas.current!.requestRenderAll();
    };

    fabricCanvas.current.on("mouse:down", handleMouseDown);
    fabricCanvas.current.on("mouse:move", handleMouseMove);

    return () => {
      fabricCanvas.current?.off("mouse:down", handleMouseDown);
      fabricCanvas.current?.off("mouse:move", handleMouseMove);
    };
  }, [activeTool, isDrawing, currentObj, startPos]);

  useEffect(() => {
    drawGrid();
  }, [showGrid, canvasWidth, canvasHeight, gridSize]);

  const drawGrid = () => {
    if (!gridRef.current || !fabricCanvas.current) return;
    const ctx = gridRef.current.getContext("2d");
    if (!ctx) return;

    const width = canvasWidth;
    const height = canvasHeight;
    const zoom = fabricCanvas.current.getZoom();
    const vpt = fabricCanvas.current.viewportTransform;

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
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setZoom((prev) => {
              const newZoom = Math.min(prev + 0.1, 3);
              fabricCanvas.current?.setZoom(newZoom);
              fabricCanvas.current?.requestRenderAll();
              return newZoom;
            });
          }}
          className="p-1"
        >
          ➕
        </button>

        <div>{Math.round(zoom * 100)}%</div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setZoom((prev) => {
              const newZoom = Math.max(prev - 0.1, MIN_ZOOM);
              fabricCanvas.current?.setZoom(newZoom);
              limitPan(); // обязательно
              fabricCanvas.current?.requestRenderAll();
              drawGrid();
              return newZoom;
            });
          }}
          className="p-1"
        >
          ➖
        </button>
      </div>
    </div>
  );
}
