import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadRecord {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  status: string;
  [key: string]: any;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: LeadRecord;
  schema: string;
  old_record: LeadRecord | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();

    // 1. Process only lead updates where status became 'won'
    if (payload.table !== "leads" || !payload.record || payload.record.status !== "won") {
      return new Response(JSON.stringify({ message: "Ignored: Not a won lead." }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      });
    }

    const lead = payload.record;

    // 2. Initialize Supabase Admin Client
    // We need service_role to read integrations_config bypassing RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Fetch Mailchimp Configuration for the organization
    const { data: config, error: configError } = await supabase
      .from("integrations_config")
      .select("api_key, audience_id")
      .eq("organization_id", lead.organization_id)
      .eq("provider", "mailchimp")
      .eq("is_active", true)
      .single();

    if (configError || !config || !config.api_key || !config.audience_id) {
      console.log(`No active Mailchimp config found for org: ${lead.organization_id}`);
      return new Response(
        JSON.stringify({ message: "No active Mailchimp integration found." }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
      );
    }

    // 4. Extract Mailchimp Datacenter from API Key (e.g., "key-us14" -> "us14")
    const dcMatch = config.api_key.match(/-(us\d+)$/);
    const datacenter = dcMatch ? dcMatch[1] : "us1";
    
    // Split name into first and last
    const nameParts = lead.name ? lead.name.split(" ") : [""];
    const FNAME = nameParts[0] || "";
    const LNAME = nameParts.slice(1).join(" ") || "";

    // 5. Send to Mailchimp (Add or Update Subscriber)
    // We use PUT /lists/{list_id}/members/{subscriber_hash} to upsert
    // generating an MD5 hash of the lowercase email is usually required, 
    // but Mailchimp's POST /lists/{list_id}/members works for inserts.
    // To handle upserts without the crypto library here, we'll try POST first,
    // and if it exists (Title: "Member Exists"), we can ignore or update.
    
    const mailchimpUrl = `https://${datacenter}.api.mailchimp.com/3.0/lists/${config.audience_id}/members`;
    
    const mailchimpPayload = {
      email_address: lead.email,
      status: "subscribed",
      merge_fields: {
        FNAME,
        LNAME,
      },
      tags: ["Noctra CRM", "Won Lead"],
    };

    const mcResponse = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`anystring:${config.api_key}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailchimpPayload),
    });

    const mcData = await mcResponse.json();

    if (!mcResponse.ok && mcData.title !== "Member Exists") {
      console.error("Mailchimp API Error:", mcData);
      throw new Error(`Mailchimp error: ${mcData.detail || mcData.title}`);
    }

    return new Response(
      JSON.stringify({ 
        message: "Successfully synced to Mailchimp", 
        detail: mcData.title === "Member Exists" ? "Already existed" : "Created new" 
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
    );

  } catch (error) {
    console.error("Error in sync-contact:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
