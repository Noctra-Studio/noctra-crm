"use server";

import { createClient } from "@/utils/supabase/server";

export async function getMailchimpConfig(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integrations_config")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("provider", "mailchimp")
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") { // Ignore 'Not Found'
    throw new Error(error.message);
  }

  return data;
}

export async function saveMailchimpConfig(
  organizationId: string,
  apiKey: string,
  audienceId: string
) {
  const supabase = await createClient();

  // Deactivate any existing first
  await supabase
    .from("integrations_config")
    .update({ is_active: false })
    .eq("organization_id", organizationId)
    .eq("provider", "mailchimp");

  // Insert the new one
  const { data, error } = await supabase
    .from("integrations_config")
    .insert({
      organization_id: organizationId,
      provider: "mailchimp",
      api_key: apiKey,
      audience_id: audienceId,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function pingMailchimpConnection(
  apiKey: string,
  audienceId: string
) {
  try {
    const dcMatch = apiKey.match(/-(us\d+)$/);
    const datacenter = dcMatch ? dcMatch[1] : "us1";

    const mailchimpUrl = `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}`;

    const response = await fetch(mailchimpUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`any:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.title || "Failed to connect to Mailchimp");
    }

    return { success: true, listName: data.name };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
