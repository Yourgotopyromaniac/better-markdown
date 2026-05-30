import { useEffect, useRef, useState } from "react";
import { Copy, Eraser, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShareDialog } from "@/components/editor/share-dialog";
import { useEditorStore } from "@/store/editor-store";

function FileNameInput() {
  const fileName = useEditorStore((s) => s.fileName);
  const setFileName = useEditorStore((s) => s.setFileName);
  const [draft, setDraft] = useState(fileName);
  const ref = useRef<HTMLInputElement>(null);

  // Keep the local draft in sync when the document changes externally
  // (share import, recents, etc.).
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
        className="min-w-0 max-w-[16rem] truncate rounded-md bg-transparent px-1.5 py-1 text-sm font-medium outline-none hover:bg-accent/60 focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

function Stats() {
  const content = useEditorStore((s) => s.content);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="hidden items-center gap-3 text-xs tabular-nums text-muted-foreground md:flex">
      <span>{words.toLocaleString()} words</span>
      <span>{chars.toLocaleString()} chars</span>
    </div>
  );
}

export function EditorToolbar() {
  const content = useEditorStore((s) => s.content);
  const clear = useEditorStore((s) => s.clear);

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

      <div className="ml-auto flex items-center gap-1">
        <Stats />
        <Separator orientation="vertical" className="mx-1 hidden h-5 md:block" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyMarkdown}
              disabled={!content}
            >
              <Copy className="size-4" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy raw Markdown</TooltipContent>
        </Tooltip>

        <ShareDialog />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                clear();
                toast.success("Editor cleared");
              }}
              disabled={!content}
              aria-label="Clear editor"
            >
              <Eraser className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear the editor</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
