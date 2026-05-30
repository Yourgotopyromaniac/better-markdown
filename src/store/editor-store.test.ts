import { describe, it, expect, beforeEach } from "vitest";

import { useEditorStore, DEFAULT_FILE_NAME } from "./editor-store";

const get = useEditorStore.getState;

describe("editor-store", () => {
  beforeEach(() => {
    useEditorStore.setState({
      content: "",
      fileName: DEFAULT_FILE_NAME,
      syncScroll: false,
    });
  });

  it("sets content", () => {
    get().setContent("# Hi");
    expect(get().content).toBe("# Hi");
  });

  it("trims the file name and falls back to the default when blank", () => {
    get().setFileName("  my-notes.md  ");
    expect(get().fileName).toBe("my-notes.md");
    get().setFileName("   ");
    expect(get().fileName).toBe(DEFAULT_FILE_NAME);
  });

  it("loads a document, defaulting the name when omitted", () => {
    get().loadDocument({ content: "body", fileName: "doc.md" });
    expect(get().content).toBe("body");
    expect(get().fileName).toBe("doc.md");

    get().loadDocument({ content: "body2" });
    expect(get().fileName).toBe(DEFAULT_FILE_NAME);
  });

  it("clears content and resets the name", () => {
    get().loadDocument({ content: "stuff", fileName: "x.md" });
    get().clear();
    expect(get().content).toBe("");
    expect(get().fileName).toBe(DEFAULT_FILE_NAME);
  });

  it("toggles sync scroll", () => {
    expect(get().syncScroll).toBe(false);
    get().toggleSyncScroll();
    expect(get().syncScroll).toBe(true);
    get().toggleSyncScroll();
    expect(get().syncScroll).toBe(false);
  });
});
