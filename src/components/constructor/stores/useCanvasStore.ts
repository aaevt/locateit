import { create } from "zustand";
import * as fabric from "fabric";

interface CanvasStore {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  objects: fabric.Object[];
  setObjects: (objects: fabric.Object[]) => void;
  addObject: (object: fabric.Object) => void;
  removeObject: (object: fabric.Object) => void;
  clearObjects: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  objects: [],
  setObjects: (objects) => set({ objects }),
  addObject: (object) => set((state) => ({ objects: [...state.objects, object] })),
  removeObject: (object) => set((state) => ({ 
    objects: state.objects.filter((obj) => obj !== object) 
  })),
  clearObjects: () => set({ objects: [] }),
}));
