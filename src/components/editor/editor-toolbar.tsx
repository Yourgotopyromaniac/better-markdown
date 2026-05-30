import { useEffect, useRef, useState } from "react";
import { Copy, Download, Eraser, FileText, FolderOpen } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShareDialog } from "@/components/editor/share-dialog";
import { RecentsMenu } from "@/components/editor/recents-menu";
import { useEditorStore } from "@/store/editor-store";
import { useRecentsStore } from "@/store/recents-store";
import {
  ACCEPTED_UPLOAD_TYPES,
  downloadMarkdown,
  readFileAsText,
} from "@/lib/file";

function FileNameInput() {
  const fileName = useEditorStore((s) => s.fileName);
  const setFileName = useEditorStore((s) => s.setFileName);
  const [draft, setDraft] = useState(fileName);
  const ref = useRef<HTMLInputElement>(null);

  // Keep the local draft in sync when the document changes externally
  // (share import, recents, upload, etc.).
  useEffect(() => setDraft(fileName), [fileName]);

  const commit = () => setFileName(draft);

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <FileText className="size-4 shrink-0 text-muted-foreground" />
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") ref.current?.blur();
          if (e.key === "Escape") {
            setDraft(fileName);
            ref.current?.blur();
          }
        }}
        spellCheck={false}
        aria-label="Document name"
        className="min-w-0 max-w-[10rem] truncate rounded-md bg-transparent px-1.5 py-1 text-sm font-medium outline-none hover:bg-accent/60 focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[16rem]"
      />
    </div>
  );
}

function Stats() {
  const content = useEditorStore((s) => s.content);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="hidden items-center gap-3 text-xs tabular-nums text-muted-foreground lg:flex">
      <span>{words.toLocaleString()} words</span>
      <span>{chars.toLocaleString()} chars</span>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar() {
  const content = useEditorStore((s) => s.content);
  const fileName = useEditorStore((s) => s.fileName);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const clear = useEditorStore((s) => s.clear);
  const addRecent = useRecentsStore((s) => s.addRecent);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Markdown copied");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const download = () => {
    downloadMarkdown(fileName, content);
    toast.success("Download started");
  };

  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-chrome-border bg-chrome/50 px-2 sm:px-3">
      <FileNameInput />

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_UPLOAD_TYPES}
        onChange={handleUpload}
        className="hidden"
      />

      <div className="ml-auto flex items-center gap-0.5">
        <Stats />
        <Separator orientation="vertical" className="mx-1 hidden h-5 lg:block" />

        <IconAction
          label="Open a Markdown file"
          onClick={() => fileInputRef.current?.click()}
        >
          <FolderOpen className="size-4" />
        </IconAction>
        <IconAction label="Download .md" onClick={download} disabled={!content}>
          <Download className="size-4" />
        </IconAction>
        <RecentsMenu />

        <Separator orientation="vertical" className="mx-1 h-5" />

        <IconAction
          label="Copy raw Markdown"
          onClick={copyMarkdown}
          disabled={!content}
        >
          <Copy className="size-4" />
        </IconAction>
        <ShareDialog />
        <IconAction
          label="Clear the editor"
          onClick={() => {
            clear();
            toast.success("Editor cleared");
          }}
          disabled={!content}
        >
          <Eraser className="size-4" />
        </IconAction>
      </div>
    </div>
  );
}
