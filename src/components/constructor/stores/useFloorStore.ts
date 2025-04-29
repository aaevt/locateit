import { create } from "zustand";

interface Floor {
  id: number;
  name: string;
}

interface FloorState {
  floors: Floor[];
  currentFloorId: number;
  addFloor: (floor: Floor) => void;
  switchFloor: (id: number) => void;
}

export const useFloorStore = create<FloorState>((set) => ({
  floors: [{ id: 1, name: "Этаж 1" }],
  currentFloorId: 1,

  addFloor: (floor) =>
    set((state) => ({
      floors: [...state.floors, floor],
    })),

  switchFloor: (id) => set({ currentFloorId: id }),
}));
