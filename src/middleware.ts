import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Define os domínios base que não devem ser tratados como slugs
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  if (!baseDomain) return NextResponse.next();

  const baseDomains = [baseDomain, `www.${baseDomain}`];

  // Verifica se o host atual é um dos domínios base
  const isBaseDomain = baseDomains.includes(host);

  if (!isBaseDomain) {
    // Extrai o subdomínio/slug
    // Ex: barbearia-do-lucas.localhost:3000 -> barbearia-do-lucas
    const slug = host.split(".")[0];

    if (slug && slug !== "www") {
      // Adiciona o slug aos headers para que possa ser lido nos Server Components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-studio-slug", slug);

      // Opcional: Você pode fazer um rewrite se quiser caminhos internos específicos
      // return NextResponse.rewrite(new URL(`/${slug}${url.pathname}`, request.url));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

// Configura em quais caminhos o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
