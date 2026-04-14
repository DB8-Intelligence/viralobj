"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkIpRateLimit } from "@/lib/ip-rate-limit";

export async function loginAction(formData: FormData) {
  // IP rate limit: max 10 login attempts per IP per 15min
  const { allowed } = await checkIpRateLimit("login", 10, 900);
  if (!allowed) {
    return { error: "Muitas tentativas de login. Tente novamente em 15 minutos." };
  }

  const supabase = createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/app");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Normalize to prevent user enumeration (email existence leak)
    console.warn(`[login] failed for ${email}: ${error.message}`);
    return { error: "Credenciais inválidas." };
  }

  revalidatePath("/", "layout");
  redirect(next || "/app");
}

export async function signupAction(formData: FormData) {
  // IP rate limit: max 5 signups per IP per hour
  const { allowed } = await checkIpRateLimit("signup", 5, 3600);
  if (!allowed) {
    return { error: "Muitas tentativas de cadastro deste IP. Tente novamente em 1 hora." };
  }

  const supabase = createClient();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const planIntent = String(formData.get("plan_intent") ?? "");

  if (!fullName || fullName.length < 2) {
    return { error: "Nome completo é obrigatório (mínimo 2 caracteres)." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email inválido." };
  }
  if (password.length < 6) {
    return { error: "Senha deve ter no mínimo 6 caracteres." };
  }

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
    const { error: rpcErr } = await supabase.rpc("bootstrap_tenant_viralobj", {
      p_user_id: signUpData.user.id,
      p_email: email,
      p_full_name: fullName,
    });
    if (rpcErr) {
      return { error: `Erro ao criar workspace: ${rpcErr.message}` };
    }

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

