import { useEffect, useRef, useState, type ReactNode } from "react";
import { Eye, Maximize2, Minimize2, PenLine } from "lucide-react";
import type { ImperativePanelHandle } from "react-resizable-panels";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { MarkdownPreview } from "@/components/preview/markdown-preview";
import { useEditorStore } from "@/store/editor-store";
import { useIsDesktop } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type PaneId = "editor" | "preview";

function PaneHeader({
  icon,
  label,
  maximized,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  maximized: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-b border-chrome-border bg-chrome px-3 text-[0.7rem] font-semibold uppercase tracking-wider text-chrome-foreground">
      {icon}
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onToggle}
            aria-label={
              maximized ? "Restore split view" : `Expand ${label} to full width`
            }
            className="ml-auto flex size-6 items-center justify-center rounded text-chrome-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {maximized ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {maximized ? "Restore split" : "Expand to full width"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function PreviewSurface({
  scrollRef,
}: {
  scrollRef?: React.Ref<HTMLDivElement>;
}) {
  const content = useEditorStore((s) => s.content);
  return (
    <div
      ref={scrollRef}
      data-tour="markdown-preview"
      className="min-h-0 flex-1 overflow-auto bg-background"
    >
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-8">
        <MarkdownPreview content={content} />
      </div>
    </div>
  );
}

/**
 * Keep two scroll containers in proportional lockstep while `enabled`. A short
 * lock guards against the feedback loop of one programmatic scroll triggering
 * the other's listener.
 */
function useSyncScroll(
  enabled: boolean,
  a: HTMLElement | null,
  b: HTMLElement | null,
) {
  useEffect(() => {
    if (!enabled || !a || !b) return;
    let locked = false;

    const mirror = (src: HTMLElement, dst: HTMLElement) => () => {
      if (locked) return;
      locked = true;
      const srcMax = src.scrollHeight - src.clientHeight;
      const ratio = srcMax > 0 ? src.scrollTop / srcMax : 0;
      dst.scrollTop = ratio * (dst.scrollHeight - dst.clientHeight);
      requestAnimationFrame(() => {
        locked = false;
      });
    };

    const onA = mirror(a, b);
    const onB = mirror(b, a);
    a.addEventListener("scroll", onA, { passive: true });
    b.addEventListener("scroll", onB, { passive: true });
    return () => {
      a.removeEventListener("scroll", onA);
      b.removeEventListener("scroll", onB);
    };
  }, [enabled, a, b]);
}

function DesktopSplit() {
  const [maximized, setMaximized] = useState<PaneId | null>(null);
  const editorRef = useRef<ImperativePanelHandle>(null);
  const previewRef = useRef<ImperativePanelHandle>(null);

  const syncScroll = useEditorStore((s) => s.syncScroll);
  const [editorScroller, setEditorScroller] = useState<HTMLElement | null>(
    null,
  );
  const [previewScroller, setPreviewScroller] = useState<HTMLDivElement | null>(
    null,
  );
  // Disable sync while one pane is maximized (the other isn't visible).
  useSyncScroll(syncScroll && !maximized, editorScroller, previewScroller);

  const toggle = (id: PaneId) =>
    setMaximized((current) => (current === id ? null : id));

  // Collapse the opposite panel to zero width instead of unmounting either one,
  // so the editor keeps its cursor / selection / undo history across toggles.
  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    if (maximized === "editor") {
      preview.collapse();
      editor.expand();
    } else if (maximized === "preview") {
      editor.collapse();
      preview.expand();
    } else {
      editor.expand();
      preview.expand();
    }
  }, [maximized]);

  return (
    <ResizablePanelGroup
      data-tour="workspace"
      direction="horizontal"
      autoSaveId="bmp-split"
    >
      <ResizablePanel
        ref={editorRef}
        order={1}
        collapsible
        collapsedSize={0}
        defaultSize={50}
        minSize={25}
        className="flex flex-col overflow-hidden"
      >
        <PaneHeader
          icon={<PenLine className="size-3.5" />}
          label="Editor"
          maximized={maximized === "editor"}
          onToggle={() => toggle("editor")}
        />
        <div className="min-h-0 flex-1 overflow-hidden">
          <MarkdownEditor onScrollerChange={setEditorScroller} />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className={cn(maximized && "hidden")} />

      <ResizablePanel
        ref={previewRef}
        order={2}
        collapsible
        collapsedSize={0}
        defaultSize={50}
        minSize={25}
        className="flex flex-col overflow-hidden"
      >
        <PaneHeader
          icon={<Eye className="size-3.5" />}
          label="Preview"
          maximized={maximized === "preview"}
          onToggle={() => toggle("preview")}
        />
        <PreviewSurface scrollRef={setPreviewScroller} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

type MobileTab = "write" | "preview";

function MobilePanes() {
  const [tab, setTab] = useState<MobileTab>("write");

  const tabs: { value: MobileTab; label: string; icon: ReactNode }[] = [
    { value: "write", label: "Write", icon: <PenLine className="size-4" /> },
    { value: "preview", label: "Preview", icon: <Eye className="size-4" /> },
  ];

  return (
    <div className="flex h-full flex-col">
      <div
        data-tour="mobile-tabs"
        className="flex shrink-0 items-center gap-1 border-b border-chrome-border bg-chrome p-1.5"
      >
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
              tab === t.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === "write" ? <MarkdownEditor /> : <PreviewSurface />}
      </div>
    </div>
  );
}

export function EditorWorkspace() {
  const isDesktop = useIsDesktop();
  return (
    <div className="min-h-0 flex-1">
      {isDesktop ? <DesktopSplit /> : <MobilePanes />}
    </div>
  );
}
