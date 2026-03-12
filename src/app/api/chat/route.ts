import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/lib/workspace";
import { assertSameOrigin } from "@/lib/request-security";
import {
  buildBrainSnapshot,
  buildBrainSystemPrompt,
  buildClarificationResponse,
  generateBrainInsights,
  getProviderModel,
  routeBrainRequest,
} from "@/lib/ai/central-brain";
import { canAccessCentralBrainRole } from "@/lib/ai/brain-access";
import { logBrainAuditEvent } from "@/lib/ai/brain-audit";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

function createNoctraStreamResponse(
  text: string,
  headers: Record<string, string> = {},
) {
  const encoder = new TextEncoder();
  const payload = `0:${JSON.stringify(text)}\n`;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...headers,
    },
  });
}

function isProviderConfigured(provider: "anthropic" | "gemini" | "openai") {
  if (provider === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY);
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY);
  return Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  );
}

async function generateAnthropicText({
  model,
  system,
  messages,
}: {
  model: string;
  system: string;
  messages: ChatMessage[];
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system,
      messages: messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: [{ type: "text", text: message.content }],
        })),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic request failed: ${errorText}`);
  }

  const data = await response.json();
  return (data.content || [])
    .filter((item: any) => item.type === "text")
    .map((item: any) => item.text)
    .join("\n")
    .trim();
}

export async function POST(req: Request) {
  try {
    if (!assertSameOrigin(req)) {
      return new Response(JSON.stringify({ error: "invalid_origin" }), {
        status: 403,
      });
    }

    const ctx = await getWorkspace();
    if (!ctx) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
      });
    }

    if (!canAccessCentralBrainRole(ctx.role)) {
      await logBrainAuditEvent({
        workspaceId: ctx.workspaceId,
        route: "/api/chat",
        mode: "denied-role",
        success: false,
        responseStatus: 403,
      });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    const sanitizedMessages = (messages || []).filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    );
    const lastMessage = sanitizedMessages.at(-1)?.content?.trim() || "";

    if (!lastMessage) {
      return createNoctraStreamResponse(
        "Necesito una instrucción concreta para poder ayudarte dentro del CRM.",
        {
          "x-noctra-mode": "clarification",
        },
      );
    }

    const snapshot = await buildBrainSnapshot(supabase, ctx.workspaceId);
    const insights = generateBrainInsights(snapshot);
    const route = routeBrainRequest(lastMessage);

    const baseHeaders = {
      "x-noctra-provider": route.provider,
      "x-noctra-model": route.model,
      "x-noctra-complexity": route.complexity,
    };

    if (route.requiresClarification) {
      await logBrainAuditEvent({
        workspaceId: ctx.workspaceId,
        userId: user?.id,
        route: "/api/chat",
        provider: route.provider,
        model: route.model,
        complexity: route.complexity,
        mode: "clarification",
        success: true,
        responseStatus: 200,
        inputChars: lastMessage.length,
        messageCount: sanitizedMessages.length,
      });
      return createNoctraStreamResponse(
        buildClarificationResponse(route.clarificationQuestions),
        {
          ...baseHeaders,
          "x-noctra-mode": "clarification",
        },
      );
    }

    if (!isProviderConfigured(route.provider)) {
      await logBrainAuditEvent({
        workspaceId: ctx.workspaceId,
        userId: user?.id,
        route: "/api/chat",
        provider: route.provider,
        model: route.model,
        complexity: route.complexity,
        mode: "configuration-error",
        success: false,
        responseStatus: 503,
        inputChars: lastMessage.length,
        messageCount: sanitizedMessages.length,
      });
      return createNoctraStreamResponse(
        `El enrutador seleccionó ${route.provider}, pero falta su API key en el entorno. Configura el proveedor o ajusta el fallback del orquestador.`,
        {
          ...baseHeaders,
          "x-noctra-mode": "configuration-error",
        },
      );
    }

    const system = buildBrainSystemPrompt(snapshot, route, insights);

    if (route.provider === "anthropic") {
      const text = await generateAnthropicText({
        model: getProviderModel("anthropic"),
        system,
        messages: sanitizedMessages,
      });

      await logBrainAuditEvent({
        workspaceId: ctx.workspaceId,
        userId: user?.id,
        route: "/api/chat",
        provider: route.provider,
        model: route.model,
        complexity: route.complexity,
        mode: "answer",
        success: true,
        responseStatus: 200,
        workspaceState: snapshot.state,
        inputChars: lastMessage.length,
        messageCount: sanitizedMessages.length,
      });

      return createNoctraStreamResponse(text, {
        ...baseHeaders,
        "x-noctra-mode": "answer",
      });
    }

    const model =
      route.provider === "openai"
        ? openai(getProviderModel("openai"))
        : google(getProviderModel("gemini"));

    const result = await streamText({
      model,
      system,
      messages: sanitizedMessages,
    });

    const response = result.toTextStreamResponse();
    response.headers.set("x-noctra-provider", route.provider);
    response.headers.set("x-noctra-model", route.model);
    response.headers.set("x-noctra-complexity", route.complexity);
    response.headers.set("x-noctra-mode", "answer");

    await logBrainAuditEvent({
      workspaceId: ctx.workspaceId,
      userId: user?.id,
      route: "/api/chat",
      provider: route.provider,
      model: route.model,
      complexity: route.complexity,
      mode: "answer",
      success: true,
      responseStatus: 200,
      workspaceState: snapshot.state,
      inputChars: lastMessage.length,
      messageCount: sanitizedMessages.length,
    });

    return response;
  } catch (error) {
    console.error("Central Brain Error:", error);
    return new Response(
      JSON.stringify({ error: "Orchestrator encountered an error" }),
      { status: 500 },
    );
  }
}
