import { useEffect } from "react";
import * as fabric from "fabric";
import { useCanvasStore } from "../stores/useCanvasStore";
import { useHistoryStore } from "../stores/useHistoryStore";
import { useFloorStore } from "../stores/useFloorStore";
import { saveToStorage } from "../libs/localStorage";

type FabricEvent = fabric.TEvent<Event> & {
  target?: fabric.Object;
};

export const useObjectTransform = (
  fabricCanvas: React.MutableRefObject<fabric.Canvas | null>,
  gridSize: number
) => {
  const { setObjects } = useCanvasStore();
  const { save: saveHistory } = useHistoryStore();
  const { currentFloorId } = useFloorStore();

  const snapToGrid = (v: number) => Math.round(v / gridSize) * gridSize;

  const updateStore = () => {
    const json = fabricCanvas.current?.toJSON();
    if (!json) return;
    setObjects(json.objects || []);
    saveHistory(json);
    saveToStorage({ [currentFloorId]: json });
  };

  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const handleObjectMoving = (e: FabricEvent) => {
      const obj = e.target;
      if (!obj) return;
      obj.left = snapToGrid(obj.left ?? 0);
      obj.top = snapToGrid(obj.top ?? 0);
      updateStore();
    };

    const handleObjectScaling = (e: FabricEvent) => {
      const obj = e.target;
      if (!obj) return;

      if (obj.type === "group") {
        const group = obj as fabric.Group;
        const rect = group.item(0) as fabric.Rect;
        const text = group.item(1) as fabric.Textbox;
        if (rect) {
          const newWidth = snapToGrid((rect.width ?? 0) * (group.scaleX ?? 1));
          const newHeight = snapToGrid((rect.height ?? 0) * (group.scaleY ?? 1));
          rect.set({ width: newWidth, height: newHeight });
          text?.set({ left: newWidth / 2, top: newHeight / 2, width: newWidth, height: newHeight });
          group.scaleX = 1;
          group.scaleY = 1;
          group.setCoords();
        }
      } else if (obj.type === "line") {
        const line = obj as fabric.Line;
        line.set({
          x2: snapToGrid((line.x2 ?? 0) * (line.scaleX ?? 1)),
          y2: snapToGrid((line.y2 ?? 0) * (line.scaleY ?? 1)),
        });
        line.scaleX = 1;
        line.scaleY = 1;
        line.setCoords();
      } else {
        const newWidth = snapToGrid((obj.width ?? 0) * (obj.scaleX ?? 1));
        const newHeight = snapToGrid((obj.height ?? 0) * (obj.scaleY ?? 1));
        obj.set({ width: newWidth, height: newHeight });
        obj.scaleX = 1;
        obj.scaleY = 1;
        obj.setCoords();
      }

      updateStore();
      canvas.requestRenderAll();
    };

    const handleObjectRotating = (e: FabricEvent) => {
      const obj = e.target;
      if (!obj) return;
      obj.angle = Math.round((obj.angle ?? 0) / 45) * 45;
      updateStore();
      canvas.requestRenderAll();
    };

    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:scaling", handleObjectScaling);
    canvas.on("object:rotating", handleObjectRotating);
    canvas.on("object:added", updateStore);

    return () => {
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:scaling", handleObjectScaling);
      canvas.off("object:rotating", handleObjectRotating);
      canvas.off("object:added", updateStore);
    };
  }, []);
};
