import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { MarkdownPreview } from "./markdown-preview";

const renderMd = (content: string) =>
  render(<MarkdownPreview content={content} />);

describe("MarkdownPreview", () => {
  it("renders headings", () => {
    const { container } = renderMd("# Hello world");
    expect(container.querySelector("h1")?.textContent).toBe("Hello world");
  });

  it("renders GFM tables", () => {
    const { container } = renderMd("| a | b |\n| - | - |\n| 1 | 2 |");
    expect(container.querySelector("table")).toBeTruthy();
    expect(container.querySelectorAll("td")).toHaveLength(2);
  });

  it("renders task-list checkboxes with checked state", () => {
    const { container } = renderMd("- [x] done\n- [ ] todo");
    const boxes = container.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(boxes).toHaveLength(2);
    expect(boxes[0].checked).toBe(true);
    expect(boxes[1].checked).toBe(false);
  });

  it("renders strikethrough", () => {
    const { container } = renderMd("~~gone~~");
    expect(container.querySelector("del")?.textContent).toBe("gone");
  });

  it("strips <script> tags from raw HTML", () => {
    const { container } = renderMd("<script>alert(1)</script>safe text");
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("safe text");
  });

  it("strips event-handler attributes from raw HTML", () => {
    const { container } = renderMd('<img src="x" onerror="alert(1)">');
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("onerror")).toBeNull();
  });

  it("keeps sanitiser-allowed inline HTML (kbd)", () => {
    const { container } = renderMd("Press <kbd>Ctrl</kbd>");
    expect(container.querySelector("kbd")?.textContent).toBe("Ctrl");
  });

  it("opens external links in a new tab with safe rel", () => {
    const { container } = renderMd("[site](https://example.com)");
    const a = container.querySelector("a");
    expect(a?.getAttribute("target")).toBe("_blank");
    expect(a?.getAttribute("rel")).toContain("noopener");
  });

  it("adds highlight classes to fenced code with a language", () => {
    const { container } = renderMd("```js\nconst x = 1;\n```");
    const code = container.querySelector("pre code");
    expect(code).toBeTruthy();
    expect(code?.className).toContain("hljs");
  });

  it("shows a placeholder when there is nothing to preview", () => {
    const { getByText } = renderMd("   ");
    expect(getByText(/nothing to preview/i)).toBeTruthy();
  });
});
