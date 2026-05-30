import { describe, it, expect } from "vitest";

import { ensureMdExtension, isMarkdownUpload } from "./file";

describe("ensureMdExtension", () => {
  it("appends .md when no markdown extension is present", () => {
    expect(ensureMdExtension("readme")).toBe("readme.md");
    expect(ensureMdExtension("archive.zip")).toBe("archive.zip.md");
  });

  it("leaves existing markdown extensions untouched", () => {
    expect(ensureMdExtension("readme.md")).toBe("readme.md");
    expect(ensureMdExtension("notes.markdown")).toBe("notes.markdown");
  });

  it("is case-insensitive about the extension", () => {
    expect(ensureMdExtension("READExME.MD")).toBe("READExME.MD");
  });

  it("falls back to untitled.md for blank names", () => {
    expect(ensureMdExtension("   ")).toBe("untitled.md");
    expect(ensureMdExtension("")).toBe("untitled.md");
  });
});

describe("isMarkdownUpload", () => {
  it("accepts known Markdown extensions", () => {
    expect(isMarkdownUpload(new File(["# Hi"], "readme.md"))).toBe(true);
    expect(isMarkdownUpload(new File(["# Hi"], "notes.markdown"))).toBe(true);
    expect(isMarkdownUpload(new File(["# Hi"], "draft.MDOWN"))).toBe(true);
  });

  it("accepts Markdown MIME types when an extension is unavailable", () => {
    const file = new File(["# Hi"], "download", { type: "text/markdown" });

    expect(isMarkdownUpload(file)).toBe(true);
  });

  it("rejects non-Markdown files even if the picker allows them", () => {
    expect(isMarkdownUpload(new File(["hello"], "notes.txt"))).toBe(false);
    expect(
      isMarkdownUpload(new File(["%PDF-1.7"], "paper.pdf", { type: "application/pdf" })),
    ).toBe(false);
    expect(isMarkdownUpload(new File([""], "readme.md.exe"))).toBe(false);
  });
});
