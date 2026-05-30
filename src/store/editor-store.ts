import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DEFAULT_FILE_NAME = "untitled.md";

/** Showcase document shown on first visit — demonstrates the renderer. */
export const WELCOME_DOC = `# Better Markdown

A fast, elegant **Markdown editor** with a live preview — inspired by
[markdownlivepreview.dev](https://markdownlivepreview.dev/), with a VS Code feel.

## Why you'll like it

- ⚡ Instant, GitHub-flavored preview as you type
- 🎨 Light / dark / system theme
- 🔗 Share a document as a single link — no account needed
- 📖 A built-in syntax cheatsheet

> Tip: edit this text on the left and watch the preview update live.

## A little of everything

Inline \`code\`, **bold**, _italic_, ~~strikethrough~~ and a [link](https://example.com).

### Task list

- [x] Set up the project
- [x] Build the editor
- [ ] Ship it 🚀

### Table

| Feature   | Status |
| --------- | :----: |
| Editor    |   ✅   |
| Preview   |   ✅   |
| Sharing   |   ✅   |

### Code

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

---

Happy writing! ✍️
`;

interface EditorState {
  /** Current Markdown source. */
  content: string;
  /** Display name for the working document. */
  fileName: string;
  setContent: (content: string) => void;
  setFileName: (fileName: string) => void;
  /** Load a document (from upload, share link or recents). */
  loadDocument: (doc: { content: string; fileName?: string }) => void;
  /** Empty the editor. */
  clear: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      content: WELCOME_DOC,
      fileName: DEFAULT_FILE_NAME,
      setContent: (content) => set({ content }),
      setFileName: (fileName) =>
        set({ fileName: fileName.trim() || DEFAULT_FILE_NAME }),
      loadDocument: ({ content, fileName }) =>
        set({ content, fileName: fileName?.trim() || DEFAULT_FILE_NAME }),
      clear: () => set({ content: "", fileName: DEFAULT_FILE_NAME }),
    }),
    {
      name: "bmp-document",
      // Persist the working document so a refresh never loses work.
      partialize: (s) => ({ content: s.content, fileName: s.fileName }),
    },
  ),
);
