import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error(
      "[api/chat] GOOGLE_GENERATIVE_AI_API_KEY is not set in this environment",
    );
    return new Response(
      JSON.stringify({
        error: "Server misconfigured: GOOGLE_GENERATIVE_AI_API_KEY is not set.",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  try {
    const { messages, documentText, fileName } = (await req.json()) as {
      messages: UIMessage[];
      documentText?: string;
      fileName?: string;
    };

    const hasDocument =
      typeof documentText === "string" && documentText.trim().length > 0;

    const system = hasDocument
      ? [
          "You are an assistant embedded in a Markdown editor - Better Markdown Preview By Awoyemi Abiola.",
          "Answer the user's questions about their current Markdown document, and summarize it when asked.",
          "Ground every answer in the document below. If it doesn't cover something, say so rather than inventing details.",
          "Reply in clean, well-structured Markdown.",
          "",
          `Document title: ${fileName?.trim() || "untitled.md"}`,
          "<document>",
          documentText,
          "</document>",
        ].join("\n")
      : "You are a helpful assistant embedded in a Markdown editor - Better Markdown Preview By Awoyemi Abiola. The user's document is empty right now, so tell them there's nothing to summarize yet and invite them to start writing.";

    const result = streamText({
      model: google("gemini-3.5-flash"),
      system,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("[api/chat] stream error:", error);
        return error instanceof Error ? error.message : String(error);
      },
    });
  } catch (error) {
    console.error("[api/chat] error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate a response." }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}
