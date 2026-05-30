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
 * Comprehensive Markdown reference (CommonMark + GitHub-Flavored Markdown).
 *
 * Every example is rendered live by the app's real pipeline, so only syntax
 * that actually renders is included — i.e. CommonMark, GFM (tables,
 * strikethrough, task lists, autolinks) and the inline HTML tags allowed by the
 * sanitiser. Footnotes and `:emoji:` shortcodes are intentionally omitted
 * because the current pipeline doesn't support them.
 */
export const CHEATSHEET: CheatSection[] = [
  {
    id: "headings",
    title: "Headings",
    items: [
      {
        label: "ATX headings (levels 1–6)",
        syntax: "# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6",
      },
      {
        label: "Setext headings",
        syntax: "Heading 1\n=========\n\nHeading 2\n---------",
      },
    ],
  },
  {
    id: "emphasis",
    title: "Emphasis & Style",
    items: [
      { label: "Bold", syntax: "**bold text**" },
      { label: "Italic", syntax: "_italic text_" },
      { label: "Bold + italic", syntax: "***bold and italic***" },
      { label: "Strikethrough", syntax: "~~struck through~~" },
      { label: "Inline code", syntax: "Use `npm run dev` to start." },
      {
        label: "Escaping characters",
        syntax: "\\*literal asterisks\\* and \\# not a heading",
      },
    ],
  },
  {
    id: "paragraphs",
    title: "Paragraphs & Line Breaks",
    items: [
      {
        label: "Paragraphs",
        syntax: "A blank line separates\n\ntwo paragraphs.",
      },
      {
        label: "Hard line break",
        syntax: "First line\\\nSecond line (backslash forces a break)",
      },
    ],
  },
  {
    id: "lists",
    title: "Lists",
    items: [
      { label: "Unordered", syntax: "- First\n- Second\n- Third" },
      { label: "Ordered", syntax: "1. First\n2. Second\n3. Third" },
      {
        label: "Ordered from a number",
        syntax: "4. Starts at four\n5. Then five",
      },
      {
        label: "Nested list",
        syntax: "- Fruit\n  - Apple\n  - Pear\n- Vegetables\n  1. Carrot\n  2. Pea",
      },
      { label: "Task list", syntax: "- [x] Done\n- [ ] Todo" },
    ],
  },
  {
    id: "links",
    title: "Links",
    items: [
      { label: "Inline link", syntax: "[Visit example](https://example.com)" },
      {
        label: "Link with title",
        syntax: '[Hover me](https://example.com "Tooltip title")',
      },
      {
        label: "Reference-style link",
        syntax: "See the [docs][1] for details.\n\n[1]: https://example.com",
      },
      {
        label: "Autolink",
        syntax: "Bare URL https://example.com or <https://example.com>",
      },
    ],
  },
  {
    id: "images",
    title: "Images",
    items: [
      {
        label: "Inline image",
        syntax: "![Alt text](https://placehold.co/96x48/png)",
      },
      {
        label: "Image with title",
        syntax: '![Alt text](https://placehold.co/96x48/png "Caption")',
      },
      {
        label: "Clickable (linked) image",
        syntax:
          "[![Alt text](https://placehold.co/96x48/png)](https://example.com)",
      },
    ],
  },
  {
    id: "code",
    title: "Code",
    items: [
      { label: "Inline code", syntax: "Render with `react-markdown`." },
      {
        label: "Fenced block",
        syntax: "```\nplain, unhighlighted\ncode block\n```",
      },
      {
        label: "Syntax-highlighted block",
        syntax:
          "```ts\nfunction greet(name: string) {\n  return `Hello, ${name}!`;\n}\n```",
      },
    ],
  },
  {
    id: "blockquotes",
    title: "Blockquotes",
    items: [
      { label: "Simple blockquote", syntax: "> A wise quote.\n>\n> — Someone" },
      {
        label: "Nested blockquote",
        syntax: "> Outer level\n>> Inner level",
      },
      {
        label: "Blockquote with Markdown",
        syntax: "> **Note:** quotes can contain\n> - lists\n> - `code`",
      },
    ],
  },
  {
    id: "tables",
    title: "Tables",
    items: [
      {
        label: "Basic table",
        syntax:
          "| Name  | Role  |\n| ----- | ----- |\n| Ada   | Eng   |\n| Linus | Eng   |",
      },
      {
        label: "Column alignment",
        syntax:
          "| Left | Center | Right |\n| :--- | :----: | ----: |\n| a    |   b    |     c |",
      },
    ],
  },
  {
    id: "rules",
    title: "Horizontal Rule",
    items: [
      { label: "Thematic break", syntax: "Above\n\n---\n\nBelow" },
    ],
  },
  {
    id: "html",
    title: "Inline HTML",
    items: [
      { label: "Line break", syntax: "First line<br>Second line" },
      {
        label: "Keyboard keys",
        syntax: "Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.",
      },
      {
        label: "Subscript & superscript",
        syntax: "H<sub>2</sub>O and E = mc<sup>2</sup>",
      },
      {
        label: "Collapsible section",
        syntax:
          "<details>\n<summary>Click to expand</summary>\n\nHidden content here.\n\n</details>",
      },
    ],
  },
];
