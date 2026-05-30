import { type ReactNode } from "react";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * App-wide context: theme application, routing, tooltips and toasts.
 * This is a fully client-side SPA — no data-fetching layer is needed.
 */
const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>{children}</BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "!bg-card !text-card-foreground !border !border-border !shadow-md !text-sm !rounded-md",
            duration: 2500,
          }}
        />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default Providers;
