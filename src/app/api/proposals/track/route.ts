import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST /api/proposals/track
// Public endpoint to track proposal engagement
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { proposalId, eventType, metadata, visitorId } = body;

  if (!proposalId) {
    return NextResponse.json({ error: "Proposal ID is required" }, { status: 400 });
  }

  const { error } = await supabase.from("proposal_events").insert({
    proposal_id: proposalId,
    event_type: eventType,
    metadata: metadata || {},
    visitor_id: visitorId,
  });

  if (error) {
    console.error("Proposal tracking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
