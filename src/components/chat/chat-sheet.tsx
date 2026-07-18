import { useState } from "react";
import {
  ArrowUp,
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
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

const transport = new DefaultChatTransport({
  api: "/api/chat",
  prepareSendMessagesRequest: ({ messages }) => {
    const { content, fileName } = useEditorStore.getState();
    return { body: { messages, documentText: content, fileName } };
  },
});
function messageText(message: UIMessage): string {
  let text = "";
  for (const part of message.parts) {
    if (part.type === "text") text += part.text;
  }
  return text;
}

function friendlyError(error: Error): string {
  const detail = error.message ?? "";
  if (/failed to fetch|network|load failed/i.test(detail)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (/rate.?limit|quota|429|resource_?exhausted/i.test(detail)) {
    return "Rate limit reached — wait a moment and try again.";
  }
  return detail && detail.length < 200
    ? detail
    : "Something went wrong. Please try again.";
}

export function ChatSheet() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop, regenerate, clearError } =
    useChat({ transport });
  const hasContent = useEditorStore((s) => s.content.trim().length > 0);

  const isBusy = status === "submitted" || status === "streaming";

  const submit = () => {
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  };

  const summarize = () => {
    if (isBusy || !hasContent) return;
    sendMessage({ text: "Summarize this document." });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Ask AI">
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

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
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
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isUser ? "justify-end" : "justify-start",
                  )}
                >
                  {isUser ? (
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                      {text}
                    </div>
                  ) : (
                    <div className="max-w-[90%] rounded-2xl bg-muted px-3.5 py-2 text-sm">
                      {text ? (
                        <MarkdownPreview
                          content={text}
                          className="prose-sm max-w-none [&>:first-child]:mt-0 [&>:last-child]:mb-0"
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl bg-muted px-3.5 py-3">
                <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <span className="size-1 animate-bounce rounded-full bg-current" />
              </div>
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
                className="max-h-32 min-h-9 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
