import { useState, type ReactNode } from "react";
import { Eye, PenLine } from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { MarkdownPreview } from "@/components/preview/markdown-preview";
import { useEditorStore } from "@/store/editor-store";
import { useIsDesktop } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

function PaneHeader({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-b border-chrome-border bg-chrome px-3 text-[0.7rem] font-semibold uppercase tracking-wider text-chrome-foreground">
      {icon}
      {label}
    </div>
  );
}

function PreviewSurface() {
  const content = useEditorStore((s) => s.content);
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-background">
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-8">
        <MarkdownPreview content={content} />
      </div>
    </div>
  );
}

function DesktopSplit() {
  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="bmp-split">
      <ResizablePanel defaultSize={50} minSize={25} className="flex flex-col">
        <PaneHeader icon={<PenLine className="size-3.5" />} label="Editor" />
        <div className="min-h-0 flex-1 overflow-hidden">
          <MarkdownEditor />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={25} className="flex flex-col">
        <PaneHeader icon={<Eye className="size-3.5" />} label="Preview" />
        <PreviewSurface />
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
      <div className="flex shrink-0 items-center gap-1 border-b border-chrome-border bg-chrome p-1.5">
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
      <div className="min-h-0 flex-1 overflow-hidden">
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
