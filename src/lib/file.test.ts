import { describe, it, expect } from "vitest";

import { ensureMdExtension } from "./file";

describe("ensureMdExtension", () => {
  it("appends .md when no markdown extension is present", () => {
    expect(ensureMdExtension("readme")).toBe("readme.md");
    expect(ensureMdExtension("archive.zip")).toBe("archive.zip.md");
  });

  it("leaves existing markdown/text extensions untouched", () => {
    expect(ensureMdExtension("readme.md")).toBe("readme.md");
    expect(ensureMdExtension("notes.markdown")).toBe("notes.markdown");
    expect(ensureMdExtension("log.txt")).toBe("log.txt");
  });

  it("is case-insensitive about the extension", () => {
    expect(ensureMdExtension("READExME.MD")).toBe("READExME.MD");
  });

  it("falls back to untitled.md for blank names", () => {
    expect(ensureMdExtension("   ")).toBe("untitled.md");
    expect(ensureMdExtension("")).toBe("untitled.md");
  });
});
