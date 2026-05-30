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
          gutter={10}
          toastOptions={{
            duration: 2500,
            // Sleek, theme-aware container. Icons resolve --primary live, so
            // they follow the active accent (errors stay destructive-red).
            className:
              "!gap-2.5 !rounded-xl !border !border-border/70 !bg-popover/95 !px-3.5 !py-2.5 !text-[13px] !font-medium !text-popover-foreground !shadow-lg !backdrop-blur [&>div:last-child]:min-w-0 [&>div:last-child]:break-words",
            success: {
              iconTheme: {
                primary: "hsl(var(--primary))",
                secondary: "hsl(var(--primary-foreground))",
              },
            },
            error: {
              iconTheme: {
                primary: "hsl(var(--destructive))",
                secondary: "hsl(var(--destructive-foreground))",
              },
            },
            loading: {
              iconTheme: {
                primary: "hsl(var(--primary))",
                secondary: "hsl(var(--muted))",
              },
            },
          }}
        />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default Providers;
