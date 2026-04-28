import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // 1. Actualizar sesión y obtener datos
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // 2. Redirección Inteligente (Landing -> Dashboard si ya está logueado)
  if (user && (pathname === '/' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Rutas Protegidas (SaaS Completo)
  const protectedRoutes = [
    '/dashboard',
    '/equipo',
    '/perfil',
    '/campanas',
    '/planificador',
    '/objetivos',
    '/contenido',
    '/ideas',
    '/biblioteca'
  ]
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// Compatibilidad total para Next.js 15/16 y convenciones personalizadas
export default proxy;
export { proxy as middleware };

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/stripe/webhook (stripe webhook)
     * - images, logos, flags (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
