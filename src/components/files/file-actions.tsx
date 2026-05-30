import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";

import { useEditorStore } from "@/store/editor-store";
import { useRecentsStore } from "@/store/recents-store";
import { useThemeStore } from "@/store/theme-store";
import {
  ACCEPTED_UPLOAD_TYPES,
  downloadMarkdown,
  readFileAsText,
} from "@/lib/file";

interface FileActionsValue {
  /** Open the OS file picker to upload a Markdown file. */
  openFile: () => void;
  /** Download the current document as a .md file. */
  download: () => void;
}

const FileActionsContext = createContext<FileActionsValue | null>(null);

export function useFileActions(): FileActionsValue {
  const ctx = useContext(FileActionsContext);
  if (!ctx) {
    throw new Error("useFileActions must be used within <FileActionsProvider>");
  }
  return ctx;
}

/**
 * Centralises file open/download so the toolbar, the app menu and keyboard
 * shortcuts all share one implementation and a single hidden file input.
 */
export function FileActionsProvider({ children }: { children: ReactNode }) {
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const addRecent = useRecentsStore((s) => s.addRecent);
  const setPaletteOpen = useThemeStore((s) => s.setPaletteOpen);
  const inputRef = useRef<HTMLInputElement>(null);

  const openFile = useCallback(() => inputRef.current?.click(), []);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-selecting the same file
      if (!file) return;
      try {
        const text = await readFileAsText(file);
        loadDocument({ content: text, fileName: file.name });
        addRecent({ fileName: file.name, content: text, source: "upload" });
        toast.success(`Opened ${file.name}`);
      } catch {
        toast.error("Couldn't read that file");
      }
    },
    [loadDocument, addRecent],
  );

  const download = useCallback(() => {
    // Read fresh state to avoid re-subscribing the provider on every keystroke.
    const { content, fileName } = useEditorStore.getState();
    if (!content.trim()) {
      toast.error("Nothing to download");
      return;
    }
    downloadMarkdown(fileName, content);
    toast.success("Download started");
  }, []);

  // Global keyboard shortcuts: Ctrl/Cmd+O (open), Ctrl/Cmd+S (download),
  // and a VS Code-style chord Ctrl/Cmd+K then T (color theme).
  useEffect(() => {
    let chordActive = false;
    let chordTimer: ReturnType<typeof setTimeout> | undefined;

    const resetChord = () => {
      chordActive = false;
      if (chordTimer) clearTimeout(chordTimer);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      // Second key of the chord: plain "t" (Ctrl+T is reserved by the browser).
      if (chordActive && !mod && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        resetChord();
        setPaletteOpen(true);
        return;
      }

      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        chordActive = true;
        if (chordTimer) clearTimeout(chordTimer);
        chordTimer = setTimeout(() => (chordActive = false), 1500);
        return;
      }

      if (mod && (e.key === "o" || e.key === "O")) {
        e.preventDefault();
        openFile();
        return;
      }

      if (mod && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        download();
        return;
      }

      if (!mod && e.key !== "Control" && e.key !== "Meta") resetChord();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (chordTimer) clearTimeout(chordTimer);
    };
  }, [openFile, download, setPaletteOpen]);

  const value = useMemo(() => ({ openFile, download }), [openFile, download]);

  return (
    <FileActionsContext.Provider value={value}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_UPLOAD_TYPES}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      {children}
    </FileActionsContext.Provider>
  );
}
