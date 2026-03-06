import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await streamText({
      model: openai('gpt-4o'),
      system: `You are the Lead Editor for Noctra Studio, a high-end digital engineering firm.
    **Tone:** Precise, Architectural, Minimalist, Authoritative. No emojis (except structural ones like 🌑 🏗️).
    **Task:** I will give you a raw thought or code snippet. You will turn it into two outputs:
    1. **X (Twitter):** A short, punchy thread hook or post focused on engineering insight.
    2. **Instagram:** A sophisticated caption focusing on the 'Visual' and 'Philosophy' aspect.`,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
