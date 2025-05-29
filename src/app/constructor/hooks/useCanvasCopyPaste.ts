import { useEffect } from "react";

export const useCopyPaste = (fabricCanvasRef, updateStore) => {
  useEffect(() => {
    let copiedObject = null;
    let offset = 20;

    const cloneFabricObject = (obj) => {
      return new Promise((resolve) => {
        obj.clone((cloned) => resolve(cloned));
      });
    };

    const handleCopyPaste = async (e) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          e.preventDefault();

          if (activeObject.type === "activeSelection") {
            const group = activeObject.toGroup();
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
          updateStore(canvas);
          canvas.requestRenderAll();

          offset += 20;
        }
      }
    };

    window.addEventListener("keydown", handleCopyPaste);
    return () => {
      window.removeEventListener("keydown", handleCopyPaste);
    };
  }, [fabricCanvasRef]);
};
