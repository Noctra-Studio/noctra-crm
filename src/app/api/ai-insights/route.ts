import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/lib/workspace";
import { assertSameOrigin } from "@/lib/request-security";
import {
  buildBrainOverview,
  buildBrainSnapshot,
  generateBrainInsights,
} from "@/lib/ai/central-brain";
import { canAccessCentralBrainRole } from "@/lib/ai/brain-access";
import { logBrainAuditEvent } from "@/lib/ai/brain-audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Block cross-origin reads of authenticated workspace context.
    // Browser requests to the same app keep a valid origin/referer.
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
    }

    const ctx = await getWorkspace();
    if (!ctx) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!canAccessCentralBrainRole(ctx.role)) {
      await logBrainAuditEvent({
        workspaceId: ctx.workspaceId,
        route: "/api/ai-insights",
        mode: "denied-role",
        success: false,
        responseStatus: 403,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const snapshot = await buildBrainSnapshot(supabase, ctx.workspaceId);
    const insights = generateBrainInsights(snapshot);
    const overview = buildBrainOverview(snapshot, insights);

    await logBrainAuditEvent({
      workspaceId: ctx.workspaceId,
      userId: user?.id,
      route: "/api/ai-insights",
      mode: "insights",
      success: true,
      responseStatus: 200,
      workspaceState: snapshot.state,
      metadata: { insightCount: insights.length },
    });

    return NextResponse.json({
      generatedAt: snapshot.generatedAt,
      state: snapshot.state,
      overview,
      counts: snapshot.counts,
      insights,
    });
  } catch (error) {
    console.error("[NOCTRA AI] Failed to generate insights:", error);
    return NextResponse.json(
      { error: "No se pudieron generar insights" },
      { status: 500 },
    );
  }
}
