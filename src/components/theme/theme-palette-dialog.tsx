import { Check, Monitor, Moon, Sun } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ACCENTS,
  useThemeStore,
  type AccentName,
  type ThemeMode,
} from "@/store/theme-store";
import { cn } from "@/lib/utils";

const MODES: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
  { mode: "system", label: "System", Icon: Monitor },
];

/** A miniature editor preview that renders in the given accent + current mode. */
function AccentMockup({
  accent,
  selected,
  onSelect,
  label,
}: {
  accent: AccentName;
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-accent={accent}
      aria-pressed={selected}
      aria-label={`${label} accent`}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card text-left transition-all",
        "hover:-translate-y-0.5 hover:shadow-md",
        selected
          ? "border-primary ring-2 ring-primary"
          : "border-border hover:border-primary/40",
      )}
    >
      {/* faux title bar */}
      <div className="flex items-center gap-1.5 border-b border-chrome-border bg-chrome px-2 py-1.5">
        <span className="size-2 rounded-full bg-primary" />
        <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        {selected && (
          <span className="ml-auto flex size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-2.5" />
          </span>
        )}
      </div>
      {/* faux editor body */}
      <div className="space-y-1.5 p-2.5">
        <span className="block h-1.5 w-3/4 rounded-full bg-foreground/60" />
        <span className="block h-1.5 w-1/2 rounded-full bg-primary" />
        <span className="block h-1.5 w-2/3 rounded-full bg-muted-foreground/30" />
        <span className="mt-2 block h-4 w-12 rounded bg-primary" />
      </div>
      <span className="block px-2.5 pb-2 text-xs font-medium">{label}</span>
    </button>
  );
}

export function ThemePaletteDialog() {
  const open = useThemeStore((s) => s.paletteOpen);
  const setOpen = useThemeStore((s) => s.setPaletteOpen);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const accent = useThemeStore((s) => s.accent);
  const setAccent = useThemeStore((s) => s.setAccent);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Color Theme</DialogTitle>
          <DialogDescription>
            Pick an appearance and accent. Changes apply instantly.
          </DialogDescription>
        </DialogHeader>

        {/* Appearance (light / dark / system) */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Appearance
          </p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(({ mode: value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  mode === value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent presets */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Accent
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ACCENTS.map(({ name, label }) => (
              <AccentMockup
                key={name}
                accent={name}
                label={label}
                selected={accent === name}
                onSelect={() => setAccent(name)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
