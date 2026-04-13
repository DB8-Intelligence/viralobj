"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const supabase = createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/app");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(next || "/app");
}

export async function signupAction(formData: FormData) {
  const supabase = createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const planIntent = String(formData.get("plan_intent") ?? "");

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        ...(planIntent ? { plan_intent: planIntent } : {}),
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // If email confirmation is OFF, user is immediately signed in.
  // If ON, user needs to confirm via email before login.
  if (!signUpData.user) {
    return { error: "Falha ao criar conta. Tente novamente." };
  }

  // Auto-create tenant + profile if session is available (email confirmation off)
  if (signUpData.session) {
    const { error: bootstrapError } = await bootstrapTenant(
      supabase,
      signUpData.user.id,
      email,
      fullName
    );
    if (bootstrapError) return { error: bootstrapError };

    revalidatePath("/", "layout");
    redirect("/app");
  }

  return { success: "Verifique seu email para confirmar a conta." };
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Creates a tenant + profile for a newly signed-up user.
 * Called inline when email confirmation is disabled.
 * For production with email confirmation on, this should live in a
 * database trigger or auth webhook.
 */
async function bootstrapTenant(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  email: string,
  fullName: string
): Promise<{ error?: string }> {
  const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + "-" + userId.slice(0, 6);

  // Create tenant (individual/single-user) — trial plan, addon enabled
  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .insert({
      name: fullName || email,
      slug,
      niche: "beleza", // default, user can change later
      plan: "trial",
      addon_talking_objects: true,
      is_active: true,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      email,
    })
    .select("id")
    .single();

  if (tenantErr || !tenant) {
    return { error: `Erro ao criar workspace: ${tenantErr?.message ?? "desconhecido"}` };
  }

  const { error: profileErr } = await supabase.from("profiles").insert({
    id: userId,
    tenant_id: tenant.id,
    full_name: fullName || email,
    email,
    role: "owner",
    is_active: true,
  });

  if (profileErr) {
    return { error: `Erro ao criar perfil: ${profileErr.message}` };
  }

  return {};
}
