import { create } from "zustand";
import { nanoid } from "nanoid";
import { persist } from "zustand/middleware";
import { Canvas } from "fabric";
import { Floor } from "../types/floor";

type FloorStore = {
  floors: Floor[];
  currentFloorId: string | null;
  setCurrentFloor: (id: string) => void;
  saveCurrentFloorJson: (json: Canvas) => void;
  addFloor: () => void;
  removeFloor: (id: string) => void;
  moveFloor: (fromIndex: number, toIndex: number) => void;
  updateFloorName: (id: string, name: string) => void;
  loadFloors: () => void;
};

export const useFloorStore = create<FloorStore>()(
  persist(
    (set, get) => ({
      floors: [],
      currentFloorId: null,
      setCurrentFloor: (id) => set({ currentFloorId: id }),

      saveCurrentFloorJson: (json) => {
        const { currentFloorId, floors } = get();
        if (!currentFloorId) return;
        set({
          floors: floors.map((f) =>
            f.id === currentFloorId ? { ...f, canvasJson: json } : f,
          ),
        });
      },

      addFloor: () => {
        const newId = nanoid();
        const newFloor: Floor = {
          id: newId,
          number: get().floors.length > 0 ? get().floors.length + 1 : 1,
          canvasJson: null,
        };
        set((state) => ({
          floors: [...state.floors, newFloor],
          currentFloorId: state.floors.length === 0 ? newId : state.currentFloorId,
        }));
      },

      removeFloor: (id) => {
        set((state) => {
          const remaining = state.floors.filter((f) => f.id !== id);
          return {
            floors: remaining,
            currentFloorId:
              state.currentFloorId === id
                ? remaining[0]?.id || null
                : state.currentFloorId,
          };
        });
      },

      moveFloor: (fromIndex, toIndex) => {
        set((state) => {
          const updated = [...state.floors];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, moved);
          return { floors: updated };
        });
      },

      updateFloorName: (id, name) => {
        set((state) => ({
          floors: state.floors.map((floor) =>
            floor.id === id ? { ...floor, name } : floor
          ),
        }));
      },

      loadFloors: () => {
        const storedState = JSON.parse(localStorage.getItem("floor-store") || "{}");
        if (storedState?.state?.floors) {
          set({ floors: storedState.state.floors });
        }
      },
    }),
    {
      name: "floor-store",
    },
  ),
);
