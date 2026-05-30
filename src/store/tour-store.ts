import { create } from "zustand";

interface TourState {
  open: boolean;
  menuOpen: boolean;
  menuLocked: boolean;
  paletteLocked: boolean;
  stepIndex: number;
  start: () => void;
  close: () => void;
  setMenuOpen: (open: boolean) => void;
  setMenuLocked: (locked: boolean) => void;
  setPaletteLocked: (locked: boolean) => void;
  setStepIndex: (stepIndex: number) => void;
}

export const useTourStore = create<TourState>()((set) => ({
  open: false,
  menuOpen: false,
  menuLocked: false,
  paletteLocked: false,
  stepIndex: 0,
  start: () =>
    set({
      open: true,
      menuOpen: false,
      menuLocked: false,
      paletteLocked: false,
      stepIndex: 0,
    }),
  close: () =>
    set({
      open: false,
      menuOpen: false,
      menuLocked: false,
      paletteLocked: false,
    }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setMenuLocked: (menuLocked) => set({ menuLocked }),
  setPaletteLocked: (paletteLocked) => set({ paletteLocked }),
  setStepIndex: (stepIndex) => set({ stepIndex }),
}));
