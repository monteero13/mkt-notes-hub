import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Leer la cookie NEXT_LOCALE para asegurar que la redirección mantenga el idioma activo del usuario
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'es'

  // Si "next" está en los parámetros, lo usamos. Si no, redirigimos al dashboard localizado por defecto.
  let next = searchParams.get('next') ?? `/${locale}/dashboard`

  // Si 'next' es una ruta relativa que no contiene ya un prefijo de idioma válido, se lo anteponemos
  if (next.startsWith('/') && !next.startsWith('/es/') && !next.startsWith('/en/') && next !== '/es' && next !== '/en') {
    next = `/${locale}${next}`
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si algo falla, redirigimos a la página de error de autenticación localizada
  return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error`)
}
