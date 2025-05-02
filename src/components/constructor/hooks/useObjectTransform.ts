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

  const snapObjectPosition = (obj: fabric.Object) => {
    obj.left = snapToGrid(obj.left ?? 0);
    obj.top = snapToGrid(obj.top ?? 0);
    obj.setCoords();
  };

  const handleGroupScaling = (group: fabric.Group) => {
    const rect = group.item(0) as fabric.Rect;
    const text = group.item(1) as fabric.Textbox;

    const newWidth = snapToGrid((rect.width ?? 0) * (group.scaleX ?? 1));
    const newHeight = snapToGrid((rect.height ?? 0) * (group.scaleY ?? 1));

    rect.set({ width: newWidth, height: newHeight });
    text?.set({
      left: newWidth / 2,
      top: newHeight / 2,
      width: newWidth,
      height: newHeight,
    });

    group.set({ scaleX: 1, scaleY: 1 });
    snapObjectPosition(group);
  };

  const handleLineScaling = (line: fabric.Line) => {
    const newX2 = snapToGrid((line.x2 ?? 0) * (line.scaleX ?? 1));
    const newY2 = snapToGrid((line.y2 ?? 0) * (line.scaleY ?? 1));

    const newX1 = snapToGrid((line.x1 ?? 0));
    const newY1 = snapToGrid((line.y1 ?? 0));

    line.set({
      x1: newX1,
      y1: newY1,
      x2: newX2,
      y2: newY2,
      scaleX: 1,
      scaleY: 1,
    });

    snapObjectPosition(line);
  };

  const handleGenericScaling = (obj: fabric.Object) => {
    const newWidth = snapToGrid((obj.width ?? 0) * (obj.scaleX ?? 1));
    const newHeight = snapToGrid((obj.height ?? 0) * (obj.scaleY ?? 1));

    obj.set({
      width: newWidth,
      height: newHeight,
      scaleX: 1,
      scaleY: 1,
    });

    snapObjectPosition(obj);
  };

  useEffect(() => {
    const canvas = fabricCanvas.current;
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
        handleGroupScaling(obj as fabric.Group);
      } else if (obj.type === "line") {
        handleLineScaling(obj as fabric.Line);
      } else {
        handleGenericScaling(obj);
      }

      updateStore();
      canvas.requestRenderAll();
    };

    const handleObjectRotating = (e: FabricEvent) => {
      const obj = e.target;
      if (!obj) return;
    
      // Зафиксировать угол на ближайший шаг (например, 45°)
      const originalCenter = obj.getCenterPoint();
    
      const roundedAngle = Math.round((obj.angle ?? 0) / 45) * 45;
      obj.rotate(roundedAngle);
    
      // Возвращаем объект в исходный центр после поворота
      obj.setPositionByOrigin(originalCenter, 'center', 'center');
      obj.setCoords();
    
      updateStore();
      fabricCanvas.current?.requestRenderAll();
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
