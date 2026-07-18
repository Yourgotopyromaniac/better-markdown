import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Routes } from "@/router/routes";
import { useThemeStore } from "@/store/theme-store";
import { useTourStore } from "@/store/tour-store";
import { cn } from "@/lib/utils";

type Placement = "top" | "right" | "bottom" | "left";

interface TourStep {
  id: string;
  title: string;
  body: string;
  target?: string | string[];
  placement: Placement;
  menuOpen?: boolean;
  paletteOpen?: boolean;
}

const TOUR_STORAGE_KEY = "bmp-guided-tour-seen";
const PANEL_GAP = 16;
const VIEWPORT_PADDING = 12;

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Better Markdown",
    body: "A fully local Markdown workspace for writing, previewing, opening, downloading, and sharing documents.",
    target: "[data-tour='app-brand']",
    placement: "bottom",
  },
  {
    id: "menu",
    title: "Hamburger menu",
    body: "The menu keeps navigation, files, preferences, and this tour in one compact place.",
    target: "[data-tour='app-menu-content']",
    placement: "left",
    menuOpen: true,
  },
  {
    id: "menu-links",
    title: "Links",
    body: "Jump between the editor, the Markdown cheatsheet, and the About page. The active page is highlighted with the current accent.",
    target: "[data-tour='menu-links']",
    placement: "left",
    menuOpen: true,
  },
  {
    id: "menu-files",
    title: "File actions",
    body: "Open local Markdown files, reopen recent documents, or download the current document from the File section.",
    target: "[data-tour='menu-file-actions']",
    placement: "left",
    menuOpen: true,
  },
  {
    id: "theme-palette",
    title: "Color Theme",
    body: "The Color Theme modal lets you choose light, dark, or system mode and switch the app accent instantly.",
    target: "[data-tour='theme-palette']",
    placement: "right",
    paletteOpen: true,
  },
  {
    id: "name",
    title: "Document name",
    body: "Rename the current document here. The name is used for downloads and recent-file entries.",
    target: "[data-tour='document-name']",
    placement: "bottom",
  },
  {
    id: "actions",
    title: "Document actions",
    body: "Open a Markdown file, download your work, reopen recents, copy raw Markdown, create a share link, or clear the editor.",
    target: "[data-tour='toolbar-actions']",
    placement: "bottom",
  },
  {
    id: "ask-ai",
    title: "Ask AI",
    body: "New — open the AI panel to summarize the current file or ask questions about it. Answers stream in and stay grounded in what you've written.",
    target: "[data-tour='ask-ai']",
    placement: "bottom",
  },
  {
    id: "editor",
    title: "Write Markdown",
    body: "The CodeMirror editor gives you line numbers, wrapping, and Markdown-aware highlighting while you type.",
    target: "[data-tour='markdown-editor']",
    placement: "right",
  },
  {
    id: "preview",
    title: "Live preview",
    body: "The preview updates instantly with GitHub-flavored Markdown and sanitised inline HTML.",
    target: ["[data-tour='markdown-preview']", "[data-tour='mobile-tabs']"],
    placement: "left",
  },
  {
    id: "workspace",
    title: "Responsive workspace",
    body: "On desktop, drag the divider or expand a pane. On small screens, switch between Write and Preview tabs.",
    target: ["[data-tour='workspace']", "[data-tour='mobile-tabs']"],
    placement: "top",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function hasSeenTour() {
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markTourSeen() {
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
  } catch {
    // localStorage can be unavailable in hardened browser modes.
  }
}

function getTarget(selectors?: string | string[]) {
  if (!selectors) return null;
  const selectorList = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of selectorList) {
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) continue;
    const rect = target.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return target;
  }

  return null;
}

function getPanelPosition(
  rect: DOMRect | null,
  placement: Placement,
  viewport: { width: number; height: number },
  panel: { width: number; height: number },
): CSSProperties {
  const centered = {
    left: clamp(
      (viewport.width - panel.width) / 2,
      VIEWPORT_PADDING,
      viewport.width - panel.width - VIEWPORT_PADDING,
    ),
    top: clamp(
      (viewport.height - panel.height) / 2,
      VIEWPORT_PADDING,
      viewport.height - panel.height - VIEWPORT_PADDING,
    ),
  };

  if (!rect) return centered;

  let left = rect.left + rect.width / 2 - panel.width / 2;
  let top = rect.top + rect.height / 2 - panel.height / 2;

  if (placement === "right") {
    left = rect.right + PANEL_GAP;
    if (left + panel.width > viewport.width - VIEWPORT_PADDING) {
      left = rect.left - panel.width - PANEL_GAP;
    }
  }

  if (placement === "left") {
    left = rect.left - panel.width - PANEL_GAP;
    if (left < VIEWPORT_PADDING) left = rect.right + PANEL_GAP;
  }

  if (placement === "bottom") {
    top = rect.bottom + PANEL_GAP;
    if (top + panel.height > viewport.height - VIEWPORT_PADDING) {
      top = rect.top - panel.height - PANEL_GAP;
    }
  }

  if (placement === "top") {
    top = rect.top - panel.height - PANEL_GAP;
    if (top < VIEWPORT_PADDING) top = rect.bottom + PANEL_GAP;
  }

  return {
    left: clamp(left, VIEWPORT_PADDING, viewport.width - panel.width - VIEWPORT_PADDING),
    top: clamp(top, VIEWPORT_PADDING, viewport.height - panel.height - VIEWPORT_PADDING),
  };
}

export function GuidedTour() {
  const open = useTourStore((s) => s.open);
  const stepIndex = useTourStore((s) => s.stepIndex);
  const start = useTourStore((s) => s.start);
  const close = useTourStore((s) => s.close);
  const setMenuLocked = useTourStore((s) => s.setMenuLocked);
  const setMenuOpen = useTourStore((s) => s.setMenuOpen);
  const setPaletteLocked = useTourStore((s) => s.setPaletteLocked);
  const setStepIndex = useTourStore((s) => s.setStepIndex);
  const setPaletteOpen = useThemeStore((s) => s.setPaletteOpen);

  const location = useLocation();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const [panelSize, setPanelSize] = useState({ width: 352, height: 240 });

  const boundedStepIndex = clamp(stepIndex, 0, TOUR_STEPS.length - 1);
  const step = TOUR_STEPS[boundedStepIndex];
  const isFirst = boundedStepIndex === 0;
  const isLast = boundedStepIndex === TOUR_STEPS.length - 1;
  const isMobile = viewport.width < 640;

  useEffect(() => {
    if (hasSeenTour()) return;
    const timer = window.setTimeout(() => start(), 700);
    return () => window.clearTimeout(timer);
  }, [start]);

  useEffect(() => {
    if (open && location.pathname !== Routes.home) navigate(Routes.home);
  }, [location.pathname, navigate, open]);

  useEffect(() => {
    if (!open || boundedStepIndex === stepIndex) return;
    setStepIndex(boundedStepIndex);
  }, [boundedStepIndex, open, setStepIndex, stepIndex]);

  useLayoutEffect(() => {
    const shouldOpenMenu = open && step.menuOpen === true;
    const shouldOpenPalette = open && step.paletteOpen === true;

    setMenuLocked(shouldOpenMenu);
    setMenuOpen(shouldOpenMenu);
    setPaletteLocked(shouldOpenPalette);
    setPaletteOpen(shouldOpenPalette);
  }, [
    boundedStepIndex,
    open,
    setMenuLocked,
    setMenuOpen,
    setPaletteLocked,
    setPaletteOpen,
    step.menuOpen,
    step.paletteOpen,
  ]);

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      const target = getTarget(step.target);

      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      setTargetRect(rect.width > 0 && rect.height > 0 ? rect : null);
    };

    getTarget(step.target)?.scrollIntoView({
      block: "center",
      inline: "center",
      behavior: "smooth",
    });

    update();
    const frame = window.requestAnimationFrame(update);
    const lateUpdate = window.setTimeout(update, 280);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(lateUpdate);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [location.pathname, open, step.target]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setPanelSize((current) => {
      if (
        Math.abs(current.width - rect.width) < 1 &&
        Math.abs(current.height - rect.height) < 1
      ) {
        return current;
      }

      return { width: rect.width, height: rect.height };
    });
  }, [boundedStepIndex, open, targetRect, viewport.width]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [boundedStepIndex, open]);

  const finish = useCallback(() => {
    markTourSeen();
    close();
  }, [close]);

  const next = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    setStepIndex(boundedStepIndex + 1);
  }, [boundedStepIndex, finish, isLast, setStepIndex]);

  const previous = useCallback(() => {
    if (isFirst) return;
    setStepIndex(boundedStepIndex - 1);
  }, [boundedStepIndex, isFirst, setStepIndex]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finish, next, open, previous]);

  const panelStyle = useMemo(
    () =>
      getPanelPosition(targetRect, step.placement, viewport, {
        width: panelSize.width,
        height: panelSize.height,
      }),
    [panelSize.height, panelSize.width, step.placement, targetRect, viewport],
  );

  const spotlightStyle = useMemo<CSSProperties | null>(() => {
    if (!targetRect) return null;
    const inset = 6;

    return {
      left: Math.max(VIEWPORT_PADDING, targetRect.left - inset),
      top: Math.max(VIEWPORT_PADDING, targetRect.top - inset),
      width: Math.min(
        viewport.width - VIEWPORT_PADDING * 2,
        targetRect.width + inset * 2,
      ),
      height: Math.min(
        viewport.height - VIEWPORT_PADDING * 2,
        targetRect.height + inset * 2,
      ),
      boxShadow:
        "0 0 0 9999px hsl(0 0% 0% / 0.56), 0 16px 48px hsl(var(--primary) / 0.24)",
    };
  }, [targetRect, viewport.height, viewport.width]);

  if (!open) return null;

  return createPortal(
    <>
      {spotlightStyle ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[70] rounded-lg ring-2 ring-primary transition-all duration-200"
          style={spotlightStyle}
        />
      ) : (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[1px]"
        />
      )}

      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`tour-title-${step.id}`}
        aria-describedby={`tour-body-${step.id}`}
        tabIndex={-1}
        className={cn(
          "fixed z-[72] max-h-[calc(100dvh-1.5rem)] overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl outline-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          isMobile ? "bottom-3 left-3 right-3" : "w-[22rem]",
        )}
        data-state="open"
        style={isMobile ? undefined : panelStyle}
      >
        <div className="h-1 rounded-t-lg bg-primary" />
        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step {boundedStepIndex + 1} of {TOUR_STEPS.length}
              </p>
              <h2
                id={`tour-title-${step.id}`}
                className="mt-1 text-base font-semibold leading-tight tracking-tight"
              >
                {step.title}
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={finish}
              aria-label="Close tour"
              className="-mr-1 -mt-1"
            >
              <X className="size-4" />
            </Button>
          </div>

          <p
            id={`tour-body-${step.id}`}
            className="text-sm leading-6 text-muted-foreground"
          >
            {step.body}
          </p>

          <div className="flex items-center gap-1.5" aria-hidden="true">
            {TOUR_STEPS.map((item, index) => (
              <span
                key={item.id}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === boundedStepIndex
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" onClick={finish}>
              Skip tour
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={previous}
                disabled={isFirst}
                aria-label="Previous tour step"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button type="button" onClick={next}>
                {isLast ? (
                  <>
                    <Check className="size-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>,
    document.body,
  );
}
