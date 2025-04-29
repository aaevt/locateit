import { create } from "zustand";

interface CanvasSettingsState {
  isOpen: boolean;
  gridSize: number;
  backgroundColor: string;
  canvasWidth: number;
  canvasHeight: number;
  open: () => void;
  close: () => void;
  setSettings: (
    settings: Partial<Omit<CanvasSettingsState, "isOpen" | "open" | "close">>,
  ) => void;
}

export const useCanvasSettingsStore = create<CanvasSettingsState>((set) => ({
  isOpen: false,
  gridSize: 50,
  backgroundColor: "#ffffff",
  canvasWidth: 1000,
  canvasHeight: 1000,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setSettings: (settings) => set(settings),
}));
