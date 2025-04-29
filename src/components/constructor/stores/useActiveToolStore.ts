import { create } from "zustand";

export type ToolType =
  | "none"
  | "wall"
  | "door"
  | "room"
  | "stair"
  | "point"
  | "delete"
  | "move";

interface ActiveToolState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export const useActiveToolStore = create<ActiveToolState>((set) => ({
  activeTool: "none",
  setActiveTool: (tool) => set({ activeTool: tool }),
}));
