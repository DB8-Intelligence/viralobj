import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the session cookie on every request.
 * Protects routes under /app/* — redirects unauthenticated users to /login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // IMPORTANT: getUser() refreshes the token if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host") ?? "";
  const isAppDomain = host.includes("viralobj.app");

  // viralobj.app → redireciona raiz para /app (dashboard dos clientes)
  if (isAppDomain && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/app" : "/login";
    return NextResponse.redirect(url);
  }

  const isProtectedRoute = pathname.startsWith("/app");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    // Sprint 40 — preserve query string in `next` para que fluxos como
    // /app/generate?blueprint=<id> sobrevivam ao desvio pelo /login.
    // searchParams.set faz encode automático, então o `?` interno vira
    // `%3F` na URL final e a action de login dá redirect("/app/generate?blueprint=…").
    const search = request.nextUrl.search ?? "";
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  return response;
}
