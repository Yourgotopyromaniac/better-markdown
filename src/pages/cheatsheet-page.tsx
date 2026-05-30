import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { MarkdownPreview } from "@/components/preview/markdown-preview";
import { CHEATSHEET, type CheatSection } from "@/data/cheatsheet";

function filterSections(query: string): CheatSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return CHEATSHEET;
  return CHEATSHEET.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.syntax.toLowerCase().includes(q) ||
        section.title.toLowerCase().includes(q),
    ),
  })).filter((section) => section.items.length > 0);
}

export default function CheatsheetPage() {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => filterSections(query), [query]);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Markdown Cheatsheet
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Common syntax with live-rendered results. Search to filter.
          </p>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search syntax…"
              aria-label="Search the cheatsheet"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
        </header>

        {sections.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No syntax matches “{query}”.
          </p>
        ) : (
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} aria-labelledby={`sec-${section.id}`}>
                <h2
                  id={`sec-${section.id}`}
                  className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {section.title}
                </h2>
                <div className="overflow-hidden rounded-xl border border-border">
                  {section.items.map((item, i) => (
                    <div
                      key={item.label}
                      className={`grid gap-px sm:grid-cols-2 ${
                        i > 0 ? "border-t border-border" : ""
                      }`}
                    >
                      <div className="bg-chrome/40 p-4">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          {item.label}
                        </p>
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                          {item.syntax}
                        </pre>
                      </div>
                      <div className="border-t border-border p-4 sm:border-l sm:border-t-0">
                        <MarkdownPreview content={item.syntax} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
