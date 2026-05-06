import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

// =====================
// i18n middleware
// =====================
const intlMiddleware = createMiddleware({
  locales: ["es", "en"],
  defaultLocale: "es",
});

// =====================
// routes config
// =====================
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/features",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/invite",
];

// =====================
// MAIN MIDDLEWARE
// =====================
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // =====================
  // 1. i18n handling FIRST
  // =====================
  const intlResponse = intlMiddleware(request);

  // extraer locale real (/es/xxx)
  const segments = pathname.split("/");
  const locale = segments[1] || "es";
  const pathWithoutLocale = "/" + segments.slice(2).join("/");

  // =====================
  // 2. Supabase client
  // =====================
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    return intlResponse;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: any) {
        cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
          request.cookies.set(name, value)
        );

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: any }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // =====================
  // 3. auth routing logic
  // =====================
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  if (user && isAuthRoute) {
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard`, request.url)
    );
  }

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathWithoutLocale) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon");

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?redirectTo=${pathWithoutLocale}`, request.url)
    );
  }

  // =====================
  // 4. response priority
  // =====================
  return intlResponse || supabaseResponse;
}

// =====================
// matcher
// =====================
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};