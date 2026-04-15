import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // 1. Manejar el caso de "code" en la raíz (evitar que el usuario se quede atrapado en /?code=...)
  const { searchParams, pathname, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code && pathname === '/') {
    const callbackUrl = new URL('/auth/callback', origin)
    callbackUrl.searchParams.set('code', code)
    const next = searchParams.get('next')
    if (next) callbackUrl.searchParams.set('next', next)
    
    return NextResponse.redirect(callbackUrl)
  }

  // 2. Actualizar la sesión normal
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
