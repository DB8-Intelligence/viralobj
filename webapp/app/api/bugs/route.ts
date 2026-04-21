import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "dmbbonanza@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

async function getAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/** POST /api/bugs — criar bug report (qualquer usuário autenticado) */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const title = (body.title ?? "").trim().slice(0, 200);
  const description = (body.description ?? "").trim().slice(0, 4000);
  const severity = body.severity ?? "bug";
  const context = body.context ?? {};

  if (!title || title.length < 3) {
    return NextResponse.json(
      { error: "Título precisa ter pelo menos 3 caracteres" },
      { status: 400 },
    );
  }

  if (!["blocker", "bug", "suggestion"].includes(severity)) {
    return NextResponse.json({ error: "Severidade inválida" }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("bug_reports")
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      severity,
      context,
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[bugs] insert error:", error);
    return NextResponse.json({ error: "Erro ao salvar report" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id, created_at: data.created_at });
}

/** GET /api/bugs — admin lista todos, ou ?mine=true para próprios reports */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const mine = req.nextUrl.searchParams.get("mine") === "true";

  if (mine) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[bugs] mine error:", error);
      return NextResponse.json({ error: "Erro ao buscar reports" }, { status: 500 });
    }
    return NextResponse.json({ data });
  }

  // Admin: lista todos com join no auth.users para email
  if (!isAdmin(user.email)) {
    return NextResponse.json({ error: "Acesso restrito a admins" }, { status: 403 });
  }

  const svc = createServiceClient();
  const severityFilter = req.nextUrl.searchParams.get("severity");
  const statusFilter = req.nextUrl.searchParams.get("status");

  let query = svc
    .from("bug_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (severityFilter) query = query.eq("severity", severityFilter);
  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: reports, error } = await query;
  if (error) {
    console.error("[bugs] admin list error:", error);
    return NextResponse.json({ error: "Erro ao buscar reports" }, { status: 500 });
  }

  // Enriquecer com email dos usuários
  const userIds = [...new Set((reports ?? []).map((r: { user_id: string }) => r.user_id))];
  let usersMap: Record<string, { email: string; full_name: string }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await svc
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    for (const p of profiles ?? []) {
      usersMap[p.id] = { email: p.email, full_name: p.full_name };
    }
  }

  const enriched = (reports ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    user: usersMap[r.user_id as string] ?? null,
  }));

  return NextResponse.json({ data: enriched });
}

/** PATCH /api/bugs — admin atualiza status/admin_notes */
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isAdmin(user.email)) {
    return NextResponse.json({ error: "Acesso restrito a admins" }, { status: 403 });
  }

  const body = await req.json();
  const { id, status, admin_notes } = body;

  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (status && ["new", "investigating", "fixed", "wont_fix"].includes(status)) {
    updates.status = status;
  }
  if (admin_notes !== undefined) {
    updates.admin_notes = (admin_notes ?? "").slice(0, 4000);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("bug_reports")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[bugs] patch error:", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
