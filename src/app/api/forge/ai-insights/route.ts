import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// TODO: Introduce ANTHROPIC_API_KEY when available in .env.local
// import Anthropic from '@anthropic-ai/sdk';
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // ----------------------------------------------------------------------
    // THEORETICAL DATA FETCHING FOR CONTEXT
    // ----------------------------------------------------------------------
    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 3)).toISOString();
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
    const twoDaysAgo = new Date(now.setDate(now.getDate() - 2)).toISOString();

    /*
    const [proposalsReq, projectsReq, leadsReq] = await Promise.all([
      // Propuestas sin respuesta hace más de 3 días
      supabase.from("proposals").select("id, title, client_name, updated_at").eq("status", "sent").lt("updated_at", threeDaysAgo),
      // Proyectos sin actualización esta semana
      supabase.from("projects").select("id, name, updated_at").eq("status", "active").lt("updated_at", oneWeekAgo),
      // Leads sin contactar
      supabase.from("prospects").select("id, name, created_at").eq("status", "new").lt("created_at", twoDaysAgo),
    ]);
    */

    // ----------------------------------------------------------------------
    // MOCK RESPONSE (Fallback until API Key is provided)
    // ----------------------------------------------------------------------
    const mockInsights = [
      {
        mensaje: "Tienes 1 propuesta sin respuesta hace 5 días. Te sugiero enviar un follow-up a Manu de Quevedo.",
        accion_label: "✉ Redactar follow-up",
        accion_tipo: "follow_up"
      },
      {
        mensaje: "3 proyectos activos sin actualización esta semana. ¿Quieres generar un reporte de estatus?",
        accion_label: "📄 Generar reporte",
        accion_tipo: "reporte"
      }
    ];

    // Simulate network delay for realistic loading state
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({ insights: mockInsights });

  } catch (error) {
    console.error("[NOCTRA AI] Error generating insights:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
