import React, { useEffect, useState } from "react";
import { Canvas, Object as FabricObject } from "fabric";

interface LayersbarProps {
  canvas: Canvas | null;
}

const Layersbar: React.FC<LayersbarProps> = ({ canvas }) => {
  const [objects, setObjects] = useState<FabricObject[]>([]);

  useEffect(() => {
    if (!canvas) return;

    const update = () => {
      const objs = canvas.getObjects().filter(o => o.selectable !== false);
      setObjects(objs.reverse());
    };

    canvas.on("object:added", update);
    canvas.on("object:removed", update);
    canvas.on("object:modified", update);

    update();

    return () => {
      canvas.off("object:added", update);
      canvas.off("object:removed", update);
      canvas.off("object:modified", update);
    };
  }, [canvas]);

  const toggleVisibility = (obj: FabricObject) => {
    obj.visible = !obj.visible;
    obj.canvas?.renderAll();
  };

  const selectObject = (obj: FabricObject) => {
    canvas?.setActiveObject(obj);
  };

  return (
    <div className="w-60 p-3 border-l bg-gray-50 h-full overflow-auto">
      <h3 className="text-lg font-bold mb-2">Layers</h3>
      <ul className="space-y-1">
        {objects.map((obj, idx) => (
          <li key={idx} className="flex justify-between items-center">
            <button onClick={() => selectObject(obj)} className="flex-1 text-left">
              {obj.type}
            </button>
            <button onClick={() => toggleVisibility(obj)}>
              {obj.visible ? "👁" : "🚫"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Layersbar;
