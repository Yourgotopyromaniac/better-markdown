import { useMemo } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import type { PluggableList } from "unified";

import { cn } from "@/lib/utils";

// Sanitisation schema: GitHub-like defaults, extended to keep the `className`
// attribute on code/span so syntax highlighting survives. Because raw HTML in
// shared documents is untrusted, sanitisation runs *before* highlighting and
// strips scripts, event handlers and other dangerous markup.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
    span: [...(defaultSchema.attributes?.span ?? []), "className"],
  },
};

const remarkPlugins: PluggableList = [remarkGfm];
const rehypePlugins: PluggableList = [
  rehypeRaw,
  [rehypeSanitize, schema],
  [rehypeHighlight, { ignoreMissing: true }],
];

const components: Components = {
  // External links open safely in a new tab. Drop react-markdown's `node`
  // prop so it doesn't leak onto the DOM element.
  a({ node, ...props }) {
    void node;
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
  },
};

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

/** Renders Markdown to safe, styled HTML. */
export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  // react-markdown re-parses on every keystroke; memoise the heavy tree by
  // content so unrelated re-renders (e.g. theme) don't re-run the pipeline.
  const rendered = useMemo(
    () => (
      <Markdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </Markdown>
    ),
    [content],
  );

  if (!content.trim()) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Nothing to preview yet — start typing on the left.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        "prose-headings:font-display prose-headings:scroll-mt-4",
        "prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-[hsl(var(--md-code-bg))]",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0",
        "prose-img:rounded-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        className,
      )}
    >
      {rendered}
    </div>
  );
}
