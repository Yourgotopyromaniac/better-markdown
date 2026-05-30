export interface CheatItem {
  label: string;
  /** The Markdown source shown as the example. */
  syntax: string;
}

export interface CheatSection {
  id: string;
  title: string;
  items: CheatItem[];
}

/**
 * Representative Markdown reference. Step 4 expands this dataset; the page
 * renders whatever lives here, so growing the reference is data-only.
 */
export const CHEATSHEET: CheatSection[] = [
  {
    id: "headings",
    title: "Headings",
    items: [
      { label: "Heading levels", syntax: "# Heading 1\n## Heading 2\n### Heading 3" },
    ],
  },
  {
    id: "emphasis",
    title: "Emphasis",
    items: [
      { label: "Bold", syntax: "**bold text**" },
      { label: "Italic", syntax: "_italic text_" },
      { label: "Bold + italic", syntax: "***bold and italic***" },
      { label: "Strikethrough", syntax: "~~struck through~~" },
    ],
  },
  {
    id: "lists",
    title: "Lists",
    items: [
      { label: "Unordered", syntax: "- First\n- Second\n  - Nested" },
      { label: "Ordered", syntax: "1. First\n2. Second\n3. Third" },
      { label: "Task list", syntax: "- [x] Done\n- [ ] Todo" },
    ],
  },
  {
    id: "links-images",
    title: "Links & Images",
    items: [
      { label: "Link", syntax: "[Visit example](https://example.com)" },
      {
        label: "Image",
        syntax: "![Alt text](https://placehold.co/80x40/png)",
      },
    ],
  },
  {
    id: "code",
    title: "Code",
    items: [
      { label: "Inline code", syntax: "Use `const x = 1` inline." },
      {
        label: "Fenced block",
        syntax: "```js\nconst x = 1;\nconsole.log(x);\n```",
      },
    ],
  },
  {
    id: "quotes-rules",
    title: "Quotes & Rules",
    items: [
      { label: "Blockquote", syntax: "> A wise quote\n>\n> — Someone" },
      { label: "Horizontal rule", syntax: "Above\n\n---\n\nBelow" },
    ],
  },
  {
    id: "table",
    title: "Table",
    items: [
      {
        label: "Table with alignment",
        syntax:
          "| Left | Center | Right |\n| :--- | :----: | ----: |\n| a    |   b    |     c |",
      },
    ],
  },
];
