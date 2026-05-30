import { useEffect, useRef, useState } from "react";
import {
  ArrowDownUp,
  Copy,
  Download,
  Eraser,
  FileText,
  FolderOpen,
} from "lucide-react";
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
import { useFileActions } from "@/components/files/file-actions";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

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
        className="w-40 min-w-0 truncate rounded-md bg-transparent px-1.5 py-1 text-sm font-medium outline-none transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring sm:w-72 lg:w-96"
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
  const clear = useEditorStore((s) => s.clear);
  const syncScroll = useEditorStore((s) => s.syncScroll);
  const toggleSyncScroll = useEditorStore((s) => s.toggleSyncScroll);
  const { openFile, download } = useFileActions();

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Markdown copied");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-chrome-border bg-chrome/50 px-2 sm:px-3">
      <FileNameInput />

      <div className="ml-auto flex items-center gap-0.5">
        <Stats />
        <Separator orientation="vertical" className="mx-1 hidden h-5 lg:block" />

        {/* Sync scroll — only meaningful in the desktop split view. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSyncScroll}
              aria-pressed={syncScroll}
              aria-label="Sync editor and preview scrolling"
              className={cn(
                "hidden lg:inline-flex",
                syncScroll &&
                  "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary",
              )}
            >
              <ArrowDownUp className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {syncScroll ? "Sync scroll: on" : "Sync scroll: off"}
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="mx-1 hidden h-5 lg:block" />

        <IconAction label="Open a Markdown file (Ctrl+O)" onClick={openFile}>
          <FolderOpen className="size-4" />
        </IconAction>
        <IconAction
          label="Download .md (Ctrl+S)"
          onClick={download}
          disabled={!content}
        >
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
