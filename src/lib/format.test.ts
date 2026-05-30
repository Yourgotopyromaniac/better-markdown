import { describe, it, expect } from "vitest";

import { formatRelativeTime } from "./format";

describe("formatRelativeTime", () => {
  const now = new Date("2026-05-30T12:00:00Z").getTime();
  const ago = (ms: number) => now - ms;
  const SEC = 1000;
  const MIN = 60 * SEC;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  it("shows 'just now' for very recent timestamps", () => {
    expect(formatRelativeTime(ago(5 * SEC), now)).toBe("just now");
  });

  it("shows minutes, hours and days", () => {
    expect(formatRelativeTime(ago(5 * MIN), now)).toBe("5m ago");
    expect(formatRelativeTime(ago(2 * HOUR), now)).toBe("2h ago");
    expect(formatRelativeTime(ago(3 * DAY), now)).toBe("3d ago");
  });

  it("falls back to a date for anything a week or older", () => {
    const ts = ago(10 * DAY);
    expect(formatRelativeTime(ts, now)).toBe(new Date(ts).toLocaleDateString());
  });
});
