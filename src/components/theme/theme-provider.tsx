import { useEffect, type ReactNode } from "react";

import { useThemeStore, type ResolvedTheme } from "@/store/theme-store";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/**
 * Applies the active theme to <html> and keeps it in sync with both the
 * user's preference and OS changes (when in `system` mode). The matching
 * `.dark` class drives every CSS variable defined in index.css.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const setResolved = useThemeStore((s) => s._setResolved);

  // Accent → data attribute; CSS in index.css maps it to --primary/--ring.
  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const resolved: ResolvedTheme =
        mode === "system" ? systemTheme() : mode;
      root.classList.toggle("dark", resolved === "dark");
      root.style.colorScheme = resolved;
      setResolved(resolved);
    };

    apply();

    if (mode !== "system") return;

    // Follow OS theme changes while in system mode.
    const mq = window.matchMedia(DARK_QUERY);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mode, setResolved]);

  return <>{children}</>;
}
