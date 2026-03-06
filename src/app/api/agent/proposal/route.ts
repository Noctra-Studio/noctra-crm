import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await streamText({
      model: openai('gpt-4o'),
      system: `Generate a project scope outline based on these requirements: [Client Inputs].
    Structure it into Noctra's 4 Phases: Discovery, Architecture, Build, Launch.
    Include a 'Technical Stack' recommendation based on their needs (e.g., if E-comm -> Recommend Shopify Headless).`,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
