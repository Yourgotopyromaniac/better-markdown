/** File helpers for importing/exporting Markdown documents (client-side only). */

const MD_EXTENSION = /\.(md|markdown|mdown)$/i;
const MARKDOWN_MIME_TYPES = new Set(["text/markdown", "text/x-markdown"]);

/** Ensure a download has a sensible Markdown extension. */
export function ensureMdExtension(name: string): string {
  const trimmed = name.trim() || "untitled.md";
  return MD_EXTENSION.test(trimmed) ? trimmed : `${trimmed}.md`;
}

/** Check the selected file itself; mobile pickers may ignore the accept hint. */
export function isMarkdownUpload(file: Pick<File, "name" | "type">): boolean {
  const name = file.name.trim();
  const type = file.type.toLowerCase();

  return MD_EXTENSION.test(name) || MARKDOWN_MIME_TYPES.has(type);
}

/** Trigger a browser download of `content` as a Markdown file. */
export function downloadMarkdown(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = ensureMdExtension(fileName);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** File types accepted by the upload control. */
export const ACCEPTED_UPLOAD_TYPES =
  ".md,.markdown,.mdown,text/markdown,text/x-markdown";

/** Read an uploaded file's text content. */
export function readFileAsText(file: File): Promise<string> {
  return file.text();
}
