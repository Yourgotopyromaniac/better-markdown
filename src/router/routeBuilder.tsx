import { lazy, type ComponentType, type ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Routes } from "./routes";

const EditorPage = lazy(() => import("@/pages/editor-page"));
const CheatsheetPage = lazy(() => import("@/pages/cheatsheet-page"));
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));

export interface RouteConfig {
  path: string;
  /** The page component rendered for this route. */
  Element: ComponentType;
  /** Optional shell wrapped around the page (nav, header, etc.). */
  Layout?: ComponentType<{ children: ReactNode }>;
  caseSensitive?: boolean;
}

export const RouteBuilder: RouteConfig[] = [
  { path: Routes.home, Element: EditorPage, Layout: AppShell },
  { path: Routes.cheatsheet, Element: CheatsheetPage, Layout: AppShell },
  { path: "*", Element: NotFoundPage, Layout: AppShell },
];
