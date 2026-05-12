import { createServerClient } from '@supabase/ssr'
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

  const errorResponse = NextResponse.redirect(`${origin}/${locale}/login?error=auth-code-error`)

  if (code) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      console.error("[Auth Callback] Missing Supabase environment variables")
      return errorResponse
    }

    // Creamos la respuesta de redirección exitosa de antemano
    const successResponse = NextResponse.redirect(`${origin}${next}`)

    // Creamos el cliente de Supabase acoplado a la respuesta para poder escribir las cookies directamente en ella
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Escribimos en el almacén de cookies de Next.js (para la petición actual)
              cookieStore.set(name, value, options)
              // Y también explícitamente en la respuesta de redirección para asegurar que viajen al navegador
              successResponse.cookies.set(name, value, options)
            })
          } catch (e) {
            // Ignorar errores en Server Components o entornos estáticos
          }
        },
      },
    })

    try {
      // 1. Verificamos si ya hay una sesión activa para evitar doble intercambio concurrente (race conditions)
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      if (existingSession) {
        return successResponse
      }

      // 2. Intercambiamos el código por una sesión
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return successResponse
      }

      // 3. Si el intercambio da error, verificamos si otra petición concurrente ya inició sesión con éxito
      const { data: { session: fallbackSession } } = await supabase.auth.getSession()
      if (fallbackSession) {
        return successResponse
      }

      console.error("[Auth Callback] Error de intercambio de código:", error)
      return NextResponse.redirect(`${origin}/${locale}/login?error=auth-code-error&message=${encodeURIComponent(error.message)}`)
    } catch (err: any) {
      console.error("[Auth Callback] Error inesperado en callback:", err)
      return NextResponse.redirect(`${origin}/${locale}/login?error=auth-code-error&message=${encodeURIComponent(err?.message || 'Error inesperado')}`)
    }
  }

  return errorResponse
}

