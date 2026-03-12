import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getWorkspace } from '@/lib/workspace';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const ctx = await getWorkspace();
    if (!ctx) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { prompt, system } = await req.json();

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: system || "You are a helpful assistant.",
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
