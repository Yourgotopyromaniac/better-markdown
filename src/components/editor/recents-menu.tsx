import { useState } from "react";
import { Clock, FileUp, History, Link2, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorStore } from "@/store/editor-store";
import { useRecentsStore, type RecentFile } from "@/store/recents-store";
import { formatRelativeTime } from "@/lib/format";

function RecentRow({
  file,
  onOpen,
  onRemove,
}: {
  file: RecentFile;
  onOpen: (file: RecentFile) => void;
  onRemove: (id: string) => void;
}) {
  const SourceIcon = file.source === "shared" ? Link2 : FileUp;
  return (
    <li className="group flex items-stretch gap-1">
      <button
        type="button"
        onClick={() => onOpen(file)}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
      >
        <SourceIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {file.fileName}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {formatRelativeTime(file.savedAt)}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        aria-label={`Remove ${file.fileName} from recents`}
        className="flex w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}

export function RecentsMenu() {
  const [open, setOpen] = useState(false);
  const files = useRecentsStore((s) => s.files);
  const removeRecent = useRecentsStore((s) => s.removeRecent);
  const clearRecents = useRecentsStore((s) => s.clearRecents);
  const loadDocument = useEditorStore((s) => s.loadDocument);

  const openFile = (file: RecentFile) => {
    loadDocument({ content: file.content, fileName: file.fileName });
    setOpen(false);
    toast.success(`Opened ${file.fileName}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Recent files">
              <span className="relative">
                <History className="size-4" />
                {files.length > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold leading-none text-primary-foreground">
                    {files.length}
                  </span>
                )}
              </span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Recent files</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">Recent files</span>
          {files.length > 0 && (
            <button
              type="button"
              onClick={clearRecents}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-3" />
              Clear all
            </button>
          )}
        </div>

        {files.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            Files you upload or open from a share link appear here.
          </p>
        ) : (
          <ul className="max-h-80 space-y-0.5 overflow-y-auto p-1.5">
            {files.map((file) => (
              <RecentRow
                key={file.id}
                file={file}
                onOpen={openFile}
                onRemove={removeRecent}
              />
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
