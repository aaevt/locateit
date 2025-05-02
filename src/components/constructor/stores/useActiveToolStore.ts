import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Tool = "none" | "move" | "wall" | "door" | "room" | "stair" | "point" | "delete";

interface ActiveToolState {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

export const useActiveToolStore = create<ActiveToolState>()(
  persist(
    (set) => ({
      activeTool: "none",
      setActiveTool: (tool) => set({ activeTool: tool }),
    }),
    {
      name: "active-tool-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);