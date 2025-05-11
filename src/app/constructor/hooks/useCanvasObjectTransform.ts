import { useEffect } from "react";
import {
  FabricObject,
  TEvent,
  Canvas,
  Group,
  Rect,
  Textbox,
  Line,
} from "fabric";
import { useCanvasStore } from "../stores/useCanvasStore";
import { useFloorStore } from "../stores/useFloorStore";
import { saveToStorage } from "../libs/localStorage";

type FabricEvent = TEvent<Event> & {
  target?: FabricObject;
};

export const useCanvasObjectTransform = (
  fabricCanvas: Canvas | null,
  gridSize: number,
) => {
  const { setObjects } = useCanvasStore();
  const { currentFloorId } = useFloorStore();
  const snapToGrid = (v: number) => Math.round(v / gridSize) * gridSize;

  const updateStore = () => {
    const json = fabricCanvas?.toJSON();
    if (!json) return;
    setObjects(json.objects || []);
    saveToStorage({ [currentFloorId]: json });
  };

const snapObjectPosition = (obj: FabricObject) => {
  obj.left = snapToGrid(obj.left ?? 0);
  obj.top = snapToGrid(obj.top ?? 0);

  if (obj.type === "group") {
    const group = obj as Group;
    const rect = group.item(0) as Rect;
    const text = group.item(1) as Textbox;

    const newWidth = snapToGrid((rect.width ?? 0) * (group.scaleX ?? 1));
    const newHeight = snapToGrid((rect.height ?? 0) * (group.scaleY ?? 1));

    rect.set({ width: newWidth, height: newHeight });
    text.set({
      width: newWidth,
      height: newHeight,
      left: newWidth / 2,
      top: newHeight / 2,
    });

    group.set({
      scaleX: 1,
      scaleY: 1,
    });
  }

  else if ("width" in obj && "height" in obj) {
    const newWidth = snapToGrid((obj.width ?? 0) * (obj.scaleX ?? 1));
    const newHeight = snapToGrid((obj.height ?? 0) * (obj.scaleY ?? 1));

    obj.set({
      width: newWidth,
      height: newHeight,
      scaleX: 1,
      scaleY: 1,
    });
  }

  obj.setCoords();
};

  const handleGroupScaling = (group: Group) => {
    const rect = group.item(0) as Rect;
    const text = group.item(1) as Textbox;

    const newWidth = snapToGrid((rect.width ?? 0) * (group.scaleX ?? 1));
    const newHeight = snapToGrid((rect.height ?? 0) * (group.scaleY ?? 1));

    rect.set({ width: newWidth, height: newHeight });
    text?.set({
      left: newWidth / 2,
      top: newHeight / 2,
      width: newWidth,
      height: newHeight,
    });

    group.set({
      scaleX: 1,
      scaleY: 1,
      angle: group.angle ?? 0,
    });
    snapObjectPosition(group);
  };

  const handleLineScaling = (line: Line) => {
    const newX2 = snapToGrid((line.x2 ?? 0) * (line.scaleX ?? 1));
    const newY2 = snapToGrid((line.y2 ?? 0) * (line.scaleY ?? 1));

    const newX1 = snapToGrid(line.x1 ?? 0);
    const newY1 = snapToGrid(line.y1 ?? 0);

    line.set({
      x1: newX1,
      y1: newY1,
      x2: newX2,
      y2: newY2,
      scaleX: 1,
      scaleY: 1,
      angle: line.angle ?? 0,
    });

    snapObjectPosition(line);
  };

  const handleGenericScaling = (obj: FabricObject) => {
    const newWidth = snapToGrid((obj.width ?? 0) * (obj.scaleX ?? 1));
    const newHeight = snapToGrid((obj.height ?? 0) * (obj.scaleY ?? 1));

    obj.set({
      width: newWidth,
      height: newHeight,
      scaleX: 1,
      scaleY: 1,
      angle: obj.angle ?? 0,
    });

    snapObjectPosition(obj);
  };

  useEffect(() => {
    const canvas = fabricCanvas;
    if (!canvas) return;

    const handleObjectMoving = (e: FabricEvent) => {
      const obj = e.target;
      if (!obj) return;

      snapObjectPosition(obj);
      updateStore();
      canvas.requestRenderAll();
    };

    const handleObjectScaling = (e: FabricEvent) => {
      const obj = e.target;
      if (!obj) return;

      if (obj.type === "group") {
        handleGroupScaling(obj as Group);
      } else if (obj.type === "line") {
        handleLineScaling(obj as Line);
      } else {
        handleGenericScaling(obj);
      }

      updateStore();
      canvas.requestRenderAll();
    };

    const handleObjectRotating = (e: FabricEvent) => {
      const obj = e.target;
      if (!obj) return;

      const roundedAngle = Math.round((obj.angle ?? 0) / 45) * 45;
      obj.rotate(roundedAngle);

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
  }, [fabricCanvas]);
};
