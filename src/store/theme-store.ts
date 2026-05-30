import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** localStorage key — kept in sync with the no-flash script in index.html. */
export const THEME_STORAGE_KEY = "bmp-theme";

interface ThemeState {
  /** User's chosen preference. `system` follows the OS. */
  mode: ThemeMode;
  /** Concrete theme currently applied to the DOM (`system` resolved). */
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Internal: written by ThemeProvider after resolving `system`. */
  _setResolved: (resolved: ResolvedTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",
      resolved: "light",
      setMode: (mode) => set({ mode }),
      _setResolved: (resolved) => set({ resolved }),
    }),
    {
      name: THEME_STORAGE_KEY,
      // Only the user's preference is durable; `resolved` is derived at runtime.
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
