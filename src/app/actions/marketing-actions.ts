"use server";

import { createClient } from "@/utils/supabase/server";
import { decryptSecret, encryptSecret } from "@/lib/request-security";

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

  if (!data) {
    return null;
  }

  return {
    ...data,
    api_key: "",
    has_api_key: Boolean(data.api_key),
    api_key_last4: data.api_key
      ? decryptSecret(data.api_key).slice(-4)
      : null,
  };
}

export async function saveMailchimpConfig(
  organizationId: string,
  apiKey: string,
  audienceId: string
) {
  const supabase = await createClient();

  const normalizedAudienceId = audienceId.trim();
  const normalizedApiKey = apiKey.trim();

  const { data: existingConfig } = await supabase
    .from("integrations_config")
    .select("api_key")
    .eq("organization_id", organizationId)
    .eq("provider", "mailchimp")
    .eq("is_active", true)
    .maybeSingle();

  const apiKeyToPersist =
    normalizedApiKey || existingConfig?.api_key || "";

  if (!apiKeyToPersist || !normalizedAudienceId) {
    throw new Error("Mailchimp credentials are incomplete");
  }

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
      api_key: normalizedApiKey
        ? encryptSecret(normalizedApiKey)
        : apiKeyToPersist,
      audience_id: normalizedAudienceId,
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
