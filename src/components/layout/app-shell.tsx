import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { BookOpen, FileText, PenLine } from "lucide-react";

import { Routes } from "@/router/routes";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { to: Routes.home, label: "Editor", Icon: PenLine, end: true },
  { to: Routes.cheatsheet, label: "Cheatsheet", Icon: BookOpen, end: false },
];

/**
 * Top-level application chrome: a slim, VS Code-flavoured top bar with brand,
 * primary navigation and theme control, plus a full-height content region.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-chrome-border bg-chrome/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-chrome/60 sm:px-4">
        <NavLink
          to={Routes.home}
          className="flex items-center gap-2 pr-2 font-display text-sm font-semibold tracking-tight"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <FileText className="size-4" />
          </span>
          <span className="hidden sm:inline">Better Markdown</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
