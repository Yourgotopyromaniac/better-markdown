import { useLocation, useNavigate } from "react-router";
import {
  BookOpen,
  Download,
  FolderOpen,
  History,
  Info,
  Menu,
  Monitor,
  Moon,
  Palette,
  PenLine,
  Sun,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Routes } from "@/router/routes";
import { useFileActions } from "@/components/files/file-actions";
import { useEditorStore } from "@/store/editor-store";
import { useRecentsStore, type RecentFile } from "@/store/recents-store";
import { useThemeStore, type ThemeMode } from "@/store/theme-store";
import { useIsDesktop } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const MODE_ICON: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

// Tint interactive states with the live accent (--primary) instead of the
// neutral hover. Covers both Radix focus and the data-highlighted state.
const ACCENT_STATES =
  "focus:bg-primary/10 focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary";
const SUBTRIGGER_ACCENT = `${ACCENT_STATES} data-[state=open]:bg-primary/10 data-[state=open]:text-primary`;
// Persistent active state for the current page / selected option.
const ACTIVE_STATE = "bg-primary/10 font-medium text-primary";

export function AppMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { openFile, download } = useFileActions();

  const recents = useRecentsStore((s) => s.files);
  const clearRecents = useRecentsStore((s) => s.clearRecents);
  const loadDocument = useEditorStore((s) => s.loadDocument);

  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const setPaletteOpen = useThemeStore((s) => s.setPaletteOpen);

  const openRecent = (file: RecentFile) => {
    loadDocument({ content: file.content, fileName: file.fileName });
    toast.success(`Opened ${file.fileName}`);
  };

  const isDesktop = useIsDesktop();
  const isEditor = pathname === Routes.home;
  const isCheatsheet = pathname === Routes.cheatsheet;
  const isAbout = pathname === Routes.about;

  // Shared recents list, rendered as a side-submenu on desktop and inline on
  // mobile (a side-submenu can't fit beside the menu on a narrow screen).
  const recentItems =
    recents.length === 0 ? (
      <DropdownMenuItem disabled>No recent files</DropdownMenuItem>
    ) : (
      <>
        {recents.map((file) => (
          <DropdownMenuItem
            key={file.id}
            onClick={() => openRecent(file)}
            className={cn("truncate", ACCENT_STATES)}
          >
            <span className="truncate lg:text-xs text-[10px] lg:pl-0 pl-4">{file.fileName}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={clearRecents}
          className={cn("text-muted-foreground", ACCENT_STATES)}
        >
          <Trash2 className="size-4" />
          Clear Recently Opened
        </DropdownMenuItem>
      </>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu className="size-[1.15rem]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Links
        </DropdownMenuLabel>
        <DropdownMenuItem
          aria-current={isEditor ? "page" : undefined}
          onClick={() => navigate(Routes.home)}
          className={cn(ACCENT_STATES, isEditor && ACTIVE_STATE)}
        >
          <PenLine className="size-4" />
          Editor
        </DropdownMenuItem>
        <DropdownMenuItem
          aria-current={isCheatsheet ? "page" : undefined}
          onClick={() => navigate(Routes.cheatsheet)}
          className={cn(ACCENT_STATES, isCheatsheet && ACTIVE_STATE)}
        >
          <BookOpen className="size-4" />
          Cheatsheet
        </DropdownMenuItem>
        <DropdownMenuItem
          aria-current={isAbout ? "page" : undefined}
          onClick={() => navigate(Routes.about)}
          className={cn(ACCENT_STATES, isAbout && ACTIVE_STATE)}
        >
          <Info className="size-4" />
          About
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          File
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={openFile} className={ACCENT_STATES}>
          <FolderOpen className="size-4" />
          Open File…
          <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
        </DropdownMenuItem>

        {isDesktop ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={SUBTRIGGER_ACCENT}>
              <History className="size-4" />
              Open Recent
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-80 w-64 overflow-y-auto">
              {recentItems}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <>
            <DropdownMenuLabel className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <History className="size-3.5" />
              Recent
            </DropdownMenuLabel>
            <div className="max-h-56 overflow-y-auto text-xs">{recentItems}</div>
          </>
        )}

        <DropdownMenuItem onClick={download} className={ACCENT_STATES}>
          <Download className="size-4" />
          Download…
          <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Preferences
        </DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={SUBTRIGGER_ACCENT}>
            {(() => {
              const Icon = MODE_ICON[mode];
              return <Icon className="size-4" />;
            })()}
            Appearance
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(["light", "dark", "system"] as ThemeMode[]).map((value) => {
              const Icon = MODE_ICON[value];
              return (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setMode(value)}
                  aria-current={mode === value ? "true" : undefined}
                  className={cn(ACCENT_STATES, mode === value && ACTIVE_STATE)}
                >
                  <Icon className="size-4" />
                  <span className="capitalize">{value}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          onClick={() => setPaletteOpen(true)}
          className={ACCENT_STATES}
        >
          <Palette className="size-4" />
          Color Theme…
          <DropdownMenuShortcut>Ctrl+K T</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
