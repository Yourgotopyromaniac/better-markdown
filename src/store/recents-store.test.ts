import { describe, it, expect, beforeEach } from "vitest";

import { useRecentsStore, MAX_RECENTS } from "./recents-store";

const add = useRecentsStore.getState().addRecent;
const files = () => useRecentsStore.getState().files;

describe("recents-store", () => {
  beforeEach(() => {
    useRecentsStore.setState({ files: [] });
  });

  it("adds new files to the top", () => {
    add({ fileName: "a.md", content: "1", source: "upload" });
    add({ fileName: "b.md", content: "2", source: "upload" });
    expect(files().map((f) => f.fileName)).toEqual(["b.md", "a.md"]);
  });

  it("de-duplicates by name (case-insensitive) and refreshes content", () => {
    add({ fileName: "note.md", content: "old", source: "upload" });
    add({ fileName: "NOTE.MD", content: "new", source: "shared" });
    expect(files()).toHaveLength(1);
    expect(files()[0].content).toBe("new");
    expect(files()[0].source).toBe("shared");
  });

  it("caps the list at MAX_RECENTS, keeping the newest", () => {
    for (let i = 0; i < MAX_RECENTS + 5; i++) {
      add({ fileName: `file-${i}.md`, content: "x", source: "upload" });
    }
    expect(files()).toHaveLength(MAX_RECENTS);
    expect(files()[0].fileName).toBe(`file-${MAX_RECENTS + 4}.md`);
  });

  it("drops oldest entries when the total size budget is exceeded", () => {
    const big = "x".repeat(1_200_000);
    add({ fileName: "first.md", content: big, source: "upload" });
    add({ fileName: "second.md", content: big, source: "upload" });
    // Two ~1.2M docs exceed the ~2M budget, so only the newest survives.
    expect(files()).toHaveLength(1);
    expect(files()[0].fileName).toBe("second.md");
  });

  it("removes a single entry by id and clears all", () => {
    add({ fileName: "a.md", content: "1", source: "upload" });
    add({ fileName: "b.md", content: "2", source: "upload" });
    const id = files()[0].id;
    useRecentsStore.getState().removeRecent(id);
    expect(files().map((f) => f.fileName)).toEqual(["a.md"]);
    useRecentsStore.getState().clearRecents();
    expect(files()).toHaveLength(0);
  });
});
