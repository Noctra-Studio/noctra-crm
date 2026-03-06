import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const { prompt } = await req.json();

    let systemPrompt = "";

    switch (type) {
      case "social":
        systemPrompt =
          "You are Noctra's AI Director of Social Architecture. Tone: Precise, Architectural, High-Status. No generic emojis. Focus on Engineering Authority. Input is raw text. Output is an X Thread (3-5 tweets) and an IG Caption.";
        break;
      case "lead":
        systemPrompt =
          "You are Noctra's AI Sales Engineer. Analyze the lead for Budget Tier (Identity/Growth/System). Draft a reply that sells 'Ownership' and 'Architecture' over generic web design. Focus on value and long-term scalability.";
        break;
      case "scope":
        systemPrompt =
          "You are Noctra's AI Technical Architect. Recommend a tech stack based on the project needs. Always prefer Next.js App Router. If E-comm, suggest Shopify Headless. Focus on performance, security, and scalability.";
        break;
      default:
        systemPrompt = "You are a helpful AI assistant for Noctra Studio.";
    }

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      prompt,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('AI Agent Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
