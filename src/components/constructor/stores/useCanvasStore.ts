import { create } from "zustand";
import { CanvasObject } from "@/components/constructor/types/canvas";

interface useCanvasState {
  objects: CanvasObject[];
  setObjects: (objects: CanvasObject[]) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  objects: [],
  setObjects: (objects) => set({ objects }),
}));
