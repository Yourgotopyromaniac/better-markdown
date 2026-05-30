import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type AccentName =
  | "blue"
  | "red"
  | "orange"
  | "green"
  | "purple"
  | "pink";

/** Selectable accent presets. Actual colors live in index.css (`[data-accent]`). */
export const ACCENTS: { name: AccentName; label: string }[] = [
  { name: "blue", label: "Blue" },
  { name: "red", label: "Red" },
  { name: "orange", label: "Orange" },
  { name: "green", label: "Green" },
  { name: "purple", label: "Purple" },
  { name: "pink", label: "Pink" },
];

export const DEFAULT_ACCENT: AccentName = "blue";

/** localStorage key — kept in sync with the no-flash script in index.html. */
export const THEME_STORAGE_KEY = "bmp-theme";

interface ThemeState {
  /** Light/dark preference. `system` follows the OS. */
  mode: ThemeMode;
  /** Accent colour applied app-wide (combines with `mode`). */
  accent: AccentName;
  /** Concrete theme currently applied to the DOM (`system` resolved). */
  resolved: ResolvedTheme;
  /** Whether the Color Theme modal is open. */
  paletteOpen: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentName) => void;
  setPaletteOpen: (open: boolean) => void;
  /** Internal: written by ThemeProvider after resolving `system`. */
  _setResolved: (resolved: ResolvedTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",
      accent: DEFAULT_ACCENT,
      resolved: "light",
      paletteOpen: false,
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      _setResolved: (resolved) => set({ resolved }),
    }),
    {
      name: THEME_STORAGE_KEY,
      // Persist only durable preferences; `resolved`/`paletteOpen` are runtime.
      partialize: (state) => ({ mode: state.mode, accent: state.accent }),
    },
  ),
);
