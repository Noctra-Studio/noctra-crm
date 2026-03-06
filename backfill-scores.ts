import { createClient } from "@supabase/supabase-js";
import { calculateLeadScore } from "./src/lib/lead-scoring";

// Run this script with environment variables set:
// NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... npx ts-node backfill-scores.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillScores() {
  console.log("Starting lead score backfill...");

  const { data: leads, error } = await supabase
    .from("contact_submissions")
    .select("*");

  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }

  console.log(`Processing ${leads.length} leads...`);

  for (const lead of leads) {
    const { score, ...breakdown } = calculateLeadScore({
      service_type: lead.intent || lead.service_interest,
      message: lead.message,
      phone: lead.phone,
      company: lead.company_name,
      source_cta: lead.source_cta,
      created_at: lead.created_at,
      pipeline_status: lead.pipeline_status
    }, lead.contacted_at ? new Date(lead.contacted_at) : null);
    
    const { error: updateError } = await supabase
      .from("contact_submissions")
      .update({
        lead_score: score,
        lead_score_breakdown: breakdown
      })
      .eq("id", lead.id);

    if (updateError) {
      console.error(`Error updating lead ${lead.id}:`, updateError);
    } else {
      console.log(`Updated lead ${lead.id} with score ${score}`);
    }
  }

  console.log("Backfill complete.");
}

backfillScores();
