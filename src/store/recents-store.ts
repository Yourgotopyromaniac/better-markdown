import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Max number of remembered files. */
export const MAX_RECENTS = 15;

/**
 * Rough localStorage budget for stored content (characters ≈ bytes for ASCII).
 * Oldest entries are dropped once exceeded, keeping us well under the ~5 MB
 * per-origin limit even with a few large documents.
 */
const MAX_TOTAL_CHARS = 2_000_000;

export type RecentSource = "upload" | "shared";

export interface RecentFile {
  id: string;
  fileName: string;
  content: string;
  savedAt: number;
  source: RecentSource;
}

function genId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface RecentsState {
  files: RecentFile[];
  addRecent: (file: {
    fileName: string;
    content: string;
    source: RecentSource;
  }) => void;
  removeRecent: (id: string) => void;
  clearRecents: () => void;
}

export const useRecentsStore = create<RecentsState>()(
  persist(
    (set) => ({
      files: [],
      addRecent: ({ fileName, content, source }) =>
        set((state) => {
          // De-duplicate by name (case-insensitive): re-adding a file refreshes
          // it and moves it to the top instead of creating a duplicate.
          const deduped = state.files.filter(
            (f) => f.fileName.toLowerCase() !== fileName.toLowerCase(),
          );

          let next: RecentFile[] = [
            { id: genId(), fileName, content, savedAt: Date.now(), source },
            ...deduped,
          ].slice(0, MAX_RECENTS);

          // Trim oldest entries until within the storage budget.
          let total = next.reduce((sum, f) => sum + f.content.length, 0);
          while (next.length > 1 && total > MAX_TOTAL_CHARS) {
            total -= next[next.length - 1].content.length;
            next = next.slice(0, -1);
          }

          return { files: next };
        }),
      removeRecent: (id) =>
        set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
      clearRecents: () => set({ files: [] }),
    }),
    { name: "bmp-recents" },
  ),
);
