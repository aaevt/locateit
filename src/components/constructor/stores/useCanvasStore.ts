import { create } from "zustand";
import * as fabric from "fabric";

interface CanvasState {
  objects: fabric.Object[];
  setObjects: (objects: fabric.Object[]) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  objects: [],
  setObjects: (objects) => set({ objects }),
}));
