import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlProxy = createMiddleware({
  locales: ["es", "en"],
  defaultLocale: "es",
});

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

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const segments = pathname.split("/");
  const locale = segments[1] || "es";
  const pathWithoutLocale = "/" + segments.slice(2).join("/");

  let response = intlProxy(request);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
        });

        const existingHeaders = new Headers(response.headers);
        response = NextResponse.next({ request });

        existingHeaders.forEach((value, key) => {
          response.headers.set(key, value);
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
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

  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};