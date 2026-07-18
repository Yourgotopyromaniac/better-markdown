import { useEffect, useState } from "react";

import { MarkSpinner } from "@/components/ui/mark-spinner";

const VERBS = [
  "Pondering",
  "Musing",
  "Cogitating",
  "Ruminating",
  "Percolating",
  "Deliberating",
  "Mulling",
  "Noodling",
  "Contemplating",
];

export function ThinkingIndicator() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * VERBS.length),
  );
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = VERBS[index];

    if (!deleting && text === full) {
      const t = setTimeout(() => setDeleting(true), 1100);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % VERBS.length);
      return;
    }
    const t = setTimeout(
      () =>
        setText((prev) =>
          deleting
            ? full.slice(0, prev.length - 1)
            : full.slice(0, prev.length + 1),
        ),
      deleting ? 35 : 65,
    );
    return () => clearTimeout(t);
  }, [text, deleting, index]);

  return (
    <div
      role="status"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <span className="sr-only">Generating response…</span>
      <MarkSpinner className="size-6 text-primary" />
      <span aria-hidden="true" className="inline-flex items-center">
        {text}
        <span className="ml-0.5 h-[1.1em] w-0.5 bg-current animate-caret-blink" />
      </span>
    </div>
  );
}
