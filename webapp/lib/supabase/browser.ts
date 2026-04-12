"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components (browser-side).
 * Persists session in cookies so SSR can read it.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
