import { create } from "zustand";
import { Canvas, FabricObject } from "fabric";

interface CanvasStore {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  objects: FabricObject[];
  setObjects: (objects: FabricObject[]) => void;
  addObject: (object: FabricObject) => void;
  removeObject: (object: FabricObject) => void;
  clearObjects: () => void;
  activeObject: FabricObject | null;
  setActiveObject: (obj: FabricObject | null) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  objects: [],
  setObjects: (objects) => set({ objects }),
  addObject: (object) => set((state) => ({ objects: [...state.objects, object] })),
  removeObject: (object) =>
    set((state) => ({ objects: state.objects.filter((obj) => obj !== object) })),
  clearObjects: () => set({ objects: [] }),
  activeObject: null,
  setActiveObject: (obj) => set({ activeObject: obj }),
}));
