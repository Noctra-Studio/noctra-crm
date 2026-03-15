import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/tasks?entityType=lead&entityId=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  let query = supabase
    .from("crm_tasks")
    .select("*")
    .order("completed", { ascending: true })
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (entityType && entityId) {
    query = query.eq("entity_type", entityType).eq("entity_id", entityId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, due_date, entity_type, entity_id } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Get workspace ID for this user
  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .single();

  const { data, error } = await supabase
    .from("crm_tasks")
    .insert({
      title: title.trim(),
      due_date: due_date || null,
      entity_type: entity_type || null,
      entity_id: entity_id || null,
      workspace_id: member?.workspace_id || null,
      assigned_user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
