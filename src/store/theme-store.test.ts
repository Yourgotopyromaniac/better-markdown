import { describe, it, expect, beforeEach } from "vitest";

import { useThemeStore, DEFAULT_ACCENT } from "./theme-store";

const get = useThemeStore.getState;

describe("theme-store", () => {
  beforeEach(() => {
    useThemeStore.setState({
      mode: "system",
      accent: DEFAULT_ACCENT,
      resolved: "light",
      paletteOpen: false,
    });
  });

  it("defaults to system mode and the blue accent", () => {
    expect(get().mode).toBe("system");
    expect(get().accent).toBe("blue");
  });

  it("updates mode and accent", () => {
    get().setMode("dark");
    expect(get().mode).toBe("dark");
    get().setAccent("green");
    expect(get().accent).toBe("green");
  });

  it("controls the palette dialog flag", () => {
    expect(get().paletteOpen).toBe(false);
    get().setPaletteOpen(true);
    expect(get().paletteOpen).toBe(true);
  });
});
