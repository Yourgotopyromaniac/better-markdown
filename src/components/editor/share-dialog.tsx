import { useMemo, useState } from "react";
import { Check, Copy, Share2, TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEditorStore } from "@/store/editor-store";
import { buildShareUrl, MAX_SHARE_LENGTH } from "@/lib/share";

export function ShareDialog() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const content = useEditorStore((s) => s.content);
  const fileName = useEditorStore((s) => s.fileName);

  // Only compress while the dialog is open.
  const url = useMemo(
    () => (open ? buildShareUrl({ content, fileName }) : ""),
    [open, content, fileName],
  );
  const tooLong = url.length > MAX_SHARE_LENGTH;
  const empty = !content.trim();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — select and copy manually");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={empty}>
          <Share2 className="size-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share this document</DialogTitle>
          <DialogDescription>
            The entire document is encoded into the link — no account or server
            needed. Anyone with the link can open and edit a copy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="h-9 flex-1 truncate rounded-md border border-input bg-muted px-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Shareable link"
          />
          <Button size="icon" onClick={copy} aria-label="Copy link">
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>

        {tooLong && (
          <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
            <TriangleAlert className="mt-px size-4 shrink-0" />
            <span>
              This document is large ({url.length.toLocaleString()} characters).
              The link should still work in most browsers, but some chat apps and
              email clients may truncate it. Consider downloading the file
              instead for very long documents.
            </span>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
