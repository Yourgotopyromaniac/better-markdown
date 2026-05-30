import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";

import { useEditorStore } from "@/store/editor-store";
import { useThemeStore } from "@/store/theme-store";

// Markdown with embedded-code language detection + soft line wrapping.
const extensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
];

interface MarkdownEditorProps {
  /** Receives the CodeMirror scroll element when the editor mounts. */
  onScrollerChange?: (el: HTMLElement | null) => void;
}

/** CodeMirror-backed Markdown source editor, themed to match the app. */
export function MarkdownEditor({ onScrollerChange }: MarkdownEditorProps = {}) {
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);
  const resolved = useThemeStore((s) => s.resolved);

  return (
    <CodeMirror
      value={content}
      onChange={setContent}
      onCreateEditor={(view) => onScrollerChange?.(view.scrollDOM)}
      theme={resolved === "dark" ? vscodeDark : vscodeLight}
      extensions={extensions}
      height="100%"
      className="h-full text-[0.95rem]"
      placeholder="Start writing Markdown…"
      aria-label="Markdown source editor"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        autocompletion: false,
        bracketMatching: true,
      }}
    />
  );
}
