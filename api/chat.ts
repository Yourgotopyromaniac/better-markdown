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
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-3.5-flash"),
      system:
        "You are a helpful assistant embedded in a Markdown editor. " +
        "Answer clearly and concisely.",
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
