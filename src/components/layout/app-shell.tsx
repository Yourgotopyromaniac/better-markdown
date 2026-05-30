import type { ReactNode } from "react";
import { NavLink } from "react-router";

import { Routes } from "@/router/routes";
import { AppMenu } from "@/components/layout/app-menu";
import { FileActionsProvider } from "@/components/files/file-actions";
import { ThemePaletteDialog } from "@/components/theme/theme-palette-dialog";

/**
 * Top-level application chrome: a slim, VS Code-flavoured top bar with brand
 * and a single application menu, plus a full-height content region.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <FileActionsProvider>
      <div className="flex h-screen flex-col bg-background text-foreground">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-chrome-border bg-chrome/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-chrome/60 sm:px-4">
          <NavLink
            to={Routes.home}
            className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight"
          >
            <img
              src="/icon.png"
              alt=""
              className="size-7 shrink-0 rounded-md border-2 border-primary object-cover"
            />
            <span>Better Markdown</span>
          </NavLink>

          <div className="ml-auto flex items-center gap-1">
            <AppMenu />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Color Theme modal, openable from the menu or Ctrl+K T. */}
      <ThemePaletteDialog />
    </FileActionsProvider>
  );
}
