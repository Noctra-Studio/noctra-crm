import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getWorkspace } from "@/lib/workspace";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await getWorkspace();
    if (!ctx) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 403 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    const { data: project } = await supabase
      .from("projects")
      .select("id, name, status, budget, start_date, launch_date")
      .eq("id", projectId)
      .eq("workspace_id", ctx.workspaceId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 1. Fetch profitability data from RPC
    const { data: profitability, error } = await supabase
      .rpc('calculate_project_profitability', { target_project_id: projectId });

    if (error) {
      console.error("RPC Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profitability) {
      return NextResponse.json({ error: "No profitability data found" }, { status: 404 });
    }

    // 2. AI Analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      Actúa como un analista financiero experto. Analiza la rentabilidad del siguiente proyecto y proporciona recomendaciones de negocio concisas.
      
      Datos del Proyecto:
      - Nombre: ${project?.name}
      - Estado: ${project?.status}
      - Presupuesto Original: $${project?.budget}
      - Ingresos Facturados: $${profitability.total_revenue}
      - Costo de Horas Trabajadas: $${profitability.time_cost}
      - Gastos Directos: $${profitability.direct_expenses}
      - Costo Total: $${profitability.total_cost}
      - Margen Bruto: $${profitability.gross_margin}
      - Porcentaje de Margen: ${profitability.margin_percentage}%
      
      Instrucciones:
      Analiza estos márgenes. Si el margen es < 20%, genera una alerta de alto riesgo. Si la tendencia de costos es excesiva comparada con el presupuesto, adviértelo.
      Devuelve la respuesta en formato JSON estrictamente con la siguiente estructura, sin bloques de código Markdown ni texto adicional fuera del JSON:
      {
        "risk_level": "low" | "medium" | "high",
        "analysis": "Breve explicación del estado financiero del proyecto",
        "action_items": ["Sugerencia 1", "Sugerencia 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean markdown code block formatting if passed
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();

    let analysisData;
    try {
      analysisData = JSON.parse(cleanJson);
    } catch(e) {
      console.error("Failed to parse Gemini JSON:", cleanJson);
      // Fallback
      analysisData = {
        risk_level: profitability.margin_percentage < 20 ? "high" : "low",
        analysis: "Error en el análisis de IA. Mostrando métricas puras.",
        action_items: []
      };
    }

    return NextResponse.json({
      metrics: profitability,
      ai_insights: analysisData
    });

  } catch (err: any) {
    console.error("AI Profitability Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
