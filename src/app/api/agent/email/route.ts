import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await streamText({
      model: openai('gpt-4o'),
      system: `You are the Sales Director at Noctra. Analyze this incoming lead: [Name, Company, Budget, Message].
    1. **Categorize:** (High Value, Standard, Low Budget).
    2. **Analysis:** Identify their pain points based on the text.
    3. **Draft:** Write a personalized, high-status email response.
        * If High Value: Propose a call.
        * If Low Budget: Politely suggest the 'Identity Tier' or 'Mentorship' if applicable.`,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
