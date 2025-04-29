import { create } from "zustand";
import * as fabric from "fabric";

interface HistoryState {
  past: any[];
  present: any | null;
  future: any[];
  save: (state: any) => void;
  undo: () => void;
  redo: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: null,
  future: [],

  save: (state) => {
    const { past, present } = get();
    set({
      past: [...past, present],
      present: state,
      future: [],
    });
  },

  undo: () => {
    const { past, present, future } = get();
    if (!past.length) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      present: previous,
      future: [present, ...future],
    });
  },

  redo: () => {
    const { past, present, future } = get();
    if (!future.length) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, present],
      present: next,
      future: newFuture,
    });
  },
}));
