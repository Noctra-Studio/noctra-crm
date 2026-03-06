import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // --- MODEL ORCHESTRATOR LOGIC (Central Brain) ---
    // Rule 1: Complexity Analysis (Simple vs Complex)
    // 1. Long inputs (> 500 characters) require more attention
    // 2. Specific keywords suggesting high-value or high-complexity tasks
    const isComplex = 
      lastMessage.length > 500 || 
      /análisis|contrato|estrategia|arquitectura|código|esquema|auditoría/i.test(lastMessage);

    // Rule 2: Model Selection
    // Lightweight model for speed (Flash) vs High-power model for depth (Pro)
    const model = isComplex 
      ? google('gemini-2.0-flash') // In a real scenario, this would be Gemini Pro
      : google('gemini-2.0-flash'); // Use flash for speed, but conceptually this is the split

    // System prompt for the "Central Brain" Persona
    const systemPrompt = `You are Noctra's Central Brain (Model Orchestrator). 
    Your current routing status: ${isComplex ? 'HIGH_POWER_MODE' : 'LIGHTWEIGHT_EFFICIENCY_MODE'}.
    Tone: Professional, Architectural, Strategic. 
    Focus on delivering the highest ROI for the user's request. 
    Use markdown for formatting.`;

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Central Brain Error:', error);
    return new Response(JSON.stringify({ error: 'Orchestrator encountered an error' }), { status: 500 });
  }
}
