import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  Copy,
  FileText,
  Sparkles,
  Square,
  TriangleAlert,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownPreview } from "@/components/preview/markdown-preview";
import { ThinkingIndicator } from "@/components/chat/thinking-indicator";
import { useEditorStore } from "@/store/editor-store";

// Attach the *current* document to every request (typed message, Summarize, or
// regenerate), read fresh from the store at send time — so the model always sees
// the file as it stands right now, not a stale snapshot. /api/chat is also
// useChat's default endpoint; we're explicit for clarity.
const transport = new DefaultChatTransport({
  api: "/api/chat",
  prepareSendMessagesRequest: ({ messages }) => {
    const { content, fileName } = useEditorStore.getState();
    return { body: { messages, documentText: content, fileName } };
  },
});

/** Concatenate the text parts of a UI message into a single string. */
function messageText(message: UIMessage): string {
  let text = "";
  for (const part of message.parts) {
    if (part.type === "text") text += part.text;
  }
  return text;
}

/** Map a chat error to a safe, user-facing message. */
function friendlyError(error: Error): string {
  const detail = error.message ?? "";
  if (/failed to fetch|network|load failed/i.test(detail)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (/rate.?limit|quota|429|resource_?exhausted/i.test(detail)) {
    return "Rate limit reached — wait a moment and try again.";
  }
  // The server already returns user-safe text for model failures; show it when
  // it's short and sensible, otherwise fall back to a generic line.
  return detail && detail.length < 200
    ? detail
    : "Something went wrong. Please try again.";
}

/** A rendered assistant reply with a "copy as plain text" action beneath it. */
function AssistantMessage({ text }: { text: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    // Copy the rendered text (no Markdown symbols), not the raw source.
    const plain = contentRef.current?.textContent?.trim() ?? text;
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can reject (permissions / insecure context); fail quietly.
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div
        ref={contentRef}
        className="max-w-[90%] rounded-2xl bg-muted px-4 py-3 text-sm"
      >
        <MarkdownPreview
          content={text}
          className="prose-sm max-w-none [&>:first-child]:mt-0 [&>:last-child]:mb-0"
        />
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy response as text"
        className="ml-1 inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/**
 * Slide-over AI chat scoped to the active Markdown file: ask questions about it
 * or summarize it. The document is sent as context with every message.
 */
export function ChatSheet() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop, regenerate, clearError } =
    useChat({ transport });
  const hasContent = useEditorStore((s) => s.content.trim().length > 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  const isBusy = status === "submitted" || status === "streaming";

  // Grow the input with its content (up to a cap), so multi-line drafts are
  // visible at a glance instead of scrolling inside a one-line box.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // Keep the newest content in view as the conversation grows (including while a
  // reply streams), unless the user has scrolled up to read earlier messages.
  useEffect(() => {
    if (!stickRef.current) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Track whether we're pinned to the bottom, so auto-scroll doesn't fight a
  // user who has scrolled up.
  const onListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const submit = () => {
    const text = input.trim();
    if (!text || isBusy) return;
    stickRef.current = true; // sending: always follow the new response
    sendMessage({ text });
    setInput("");
  };

  const summarize = () => {
    if (isBusy || !hasContent) return;
    stickRef.current = true;
    sendMessage({ text: "Summarize this document." });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button
              data-tour="ask-ai"
              variant="ghost"
              size="icon-sm"
              aria-label="Ask AI"
            >
              <Sparkles className="size-4" />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>Ask AI</TooltipContent>
      </Tooltip>

      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="space-y-1 border-b border-chrome-border px-4 py-3 text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            Ask AI
          </SheetTitle>
          <SheetDescription>
            Ask questions about the current file, or summarize it.
          </SheetDescription>
        </SheetHeader>

        {/* Message list */}
        <div
          ref={listRef}
          onScroll={onListScroll}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Sparkles className="size-6 opacity-40" />
              <p>
                {hasContent
                  ? "Ask about your document, or summarize it."
                  : "Start writing, then ask questions or summarize."}
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const text = messageText(message);
              if (message.role === "user") {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {text}
                    </div>
                  </div>
                );
              }
              return text ? (
                <div key={message.id} className="flex justify-start">
                  <AssistantMessage text={text} />
                </div>
              ) : null;
            })
          )}

          {/* Spinner + verb between send and the first streamed token. */}
          {status === "submitted" && (
            <div className="flex justify-start px-1">
              <ThinkingIndicator />
            </div>
          )}

          {error && (
            <div className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
              <div className="flex items-start gap-2">
                <TriangleAlert className="mt-px size-4 shrink-0" />
                <span>{friendlyError(error)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => regenerate()}
                  disabled={isBusy}
                >
                  Retry
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={clearError}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quick action + composer */}
        <div className="border-t border-chrome-border">
          <div className="px-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={summarize}
              disabled={!hasContent || isBusy}
            >
              <FileText className="size-3.5" />
              Summarize document
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="p-3 pt-2"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder="Ask anything…"
                aria-label="Message"
                className="min-h-9 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {isBusy ? (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={stop}
                  aria-label="Stop generating"
                >
                  <Square className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  aria-label="Send message"
                >
                  <ArrowUp className="size-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
