import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const APP_HOST = "www.viralobj.app";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostNoPort = host.split(":")[0];
  const pathname = request.nextUrl.pathname;

  // Sprint 38 — viralobj.app apex (sem www) redireciona TUDO para
  // www.viralobj.app. Apex foi mapeado pro mesmo serviço Cloud Run, mas
  // o cookie de sessão Supabase é setado em www.viralobj.app, então o apex
  // nunca deve servir conteúdo direto — sempre 308 para www.
  //
  // Set hostname (not host) and clear port — Cloud Run's container listens on
  // :8080 internally, and `url.host = "www.viralobj.app"` would carry that
  // port into the Location header, producing https://www.viralobj.app:8080/...
  if (hostNoPort === "viralobj.app") {
    const url = request.nextUrl.clone();
    url.hostname = APP_HOST;
    url.port = "";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  // Sprint 37 — canonicalize dashboard host. Hits to /app/* on the landing
  // domain (viralobj.com / www.viralobj.com) get a 308 to the dashboard host
  // so cookies/session stay scoped to www.viralobj.app and the two domains
  // keep clean responsibilities (landing vs app).
  if (host.includes("viralobj.com") && pathname.startsWith("/app")) {
    const url = request.nextUrl.clone();
    url.hostname = APP_HOST;
    url.port = "";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (image extensions)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
