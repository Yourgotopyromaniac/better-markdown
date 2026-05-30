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

/**
 * Selectable accent presets. `name` is the durable key (used for storage and
 * the `[data-accent]` CSS in index.css); `label` is a bespoke display name
 * evoking each shade. Colors live in index.css.
 */
export const ACCENTS: { name: AccentName; label: string }[] = [
  { name: "blue", label: "Sapphire" },
  { name: "red", label: "Ruby" },
  { name: "orange", label: "Amber" },
  { name: "green", label: "Emerald" },
  { name: "purple", label: "Amethyst" },
  { name: "pink", label: "Rose Quartz" },
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
