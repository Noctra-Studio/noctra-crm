"use server";

import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getProjectProfitabilityMetrics(projectId: string) {
  const supabase = await createClient();

  // Call the Postgres RPC function
  const { data, error } = await supabase.rpc("calculate_project_profitability", {
    target_project_id: projectId,
  });

  if (error) {
    console.error("Error calculating target project profitability:", error);
    throw new Error("No se pudieron calcular las métricas de rentabilidad.");
  }

  return data;
}

export async function analyzeProjectProfitability(projectId: string) {
  try {
    // 1. Fetch raw financial data from our complex Postgres View/RPC
    const metrics = await getProjectProfitabilityMetrics(projectId);
    
    // 2. Prepare the AI prompt with context
    const prompt = `
      Eres un Analista Financiero Senior (CFO) para una agencia digital (Noctra Studio).
      A continuación, te presento las métricas financieras en tiempo real de un proyecto específico.

      Métricas del Proyecto:
      - Total Facturado (Revenue): $${metrics.total_revenue} MXN
      - Costo Operativo (Horas Equipo): $${metrics.time_cost} MXN
      - Gastos Directos Adicionales: $${metrics.direct_expenses} MXN
      - Costo Total del Proyecto: $${metrics.total_cost} MXN
      - Margen Bruto: $${metrics.gross_margin} MXN
      - Margen Porcentual: ${metrics.margin_percentage}%

      Instrucciones:
      1. Analiza estos márgenes de forma concisa (máximo 3-4 líneas).
      2. Si el margen actual es menor a 20%, DEBES generar una alerta de riesgo inminente sugiriendo medidas correctivas (cobros extra, frenar alcances, etc.).
      3. Si el margen es entre 20% y 40%, indica que está en rango aceptable pero requiere monitoreo de horas.
      4. Si el margen es superior al 40%, clasifícalo como altamente rentable e indica qué prácticas replicar.
      5. Responde estrictamente en formato JSON con la siguiente estructura (NO uses markdown blocks \`\`\`json, SOLO el JSON raw):
      {
        "status": "safe" | "warning" | "danger",
        "analysisMessage": "Texto del análisis aquí",
        "actionableAdvice": "Consejo breve de 1 línea"
      }
    `;

    // 3. Initialize Google Gemini AI Client (using env variable)
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    
    const response = await model.generateContent(prompt);
    const textPayload = response.response.text();
    if (!textPayload) {
      throw new Error("Respuesta vacía de la IA.");
    }
    
    const aiAnalysis = JSON.parse(textPayload);

    return {
      metrics,
      aiAnalysis,
    };

  } catch (error: any) {
    console.error("AI Profitability Error:", error);
    throw new Error(error.message || "Error al analizar la rentabilidad con IA.");
  }
}
