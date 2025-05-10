import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CanvasSettingsState {
  isOpen: boolean;
  gridSize: number;
  backgroundColor: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImage: string | null;
  backgroundOpacity: number;
  showGrid: boolean;
  open: () => void;
  close: () => void;
  setSettings: (
    settings: Partial<Omit<CanvasSettingsState, "isOpen" | "open" | "close">>,
  ) => void;
  removeBackgroundImage: () => void;
}

export const useCanvasSettingsStore = create<CanvasSettingsState>()(
  persist(
    (set) => ({
      isOpen: false,
      gridSize: 50,
      backgroundColor: "#ffffff",
      canvasWidth: 1000,
      canvasHeight: 1000,
      backgroundImage: null,
      backgroundOpacity: 1,
      showGrid: true,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setSettings: (settings) => set(settings),
      removeBackgroundImage: () => set({ backgroundImage: null }),
    }),
    {
      name: "canvas-settings",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        gridSize: state.gridSize,
        backgroundColor: state.backgroundColor,
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        backgroundImage: state.backgroundImage,
        backgroundOpacity: state.backgroundOpacity,
        showGrid: state.showGrid,
      }),
    }
  )
);
