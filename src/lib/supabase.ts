import { createBrowserClient, createServerClient, parseCookieHeader } from '@supabase/ssr'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

/**
 * Creates a Supabase client for use in the browser.
 */
export function createClient() {
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )
}

/**
 * Creates a Supabase client for use on the server.
 * This is used within TanStack Start server functions.
 */
export function createSupabaseServerClient() {
  const request = getRequest()

  if (!request) {
    throw new Error('createSupabaseServerClient must be called within a server request context')
  }

  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '').map(({ name, value }) => ({
            name,
            value: value ?? '',
          }))
        },
        setAll(cookiesToSet) {
          // TanStack Start handles headers via response modification.
          // In a server function, you might need to handle this differently
          // if you're setting cookies during a data fetch.
          // For now, we'll provide the basic structure.
          cookiesToSet.forEach(({ name, value, options }) => {
            // This is a placeholder as TanStack Start's cookie handling
            // is usually done via redirections or specific header helpers.
          })
        },
      },
    }
  )
}

/**
 * Server function to get the current user session.
 */
export const getUserSession = createServerFn({ method: 'GET' })
  .handler(async () => {
    const supabase = createSupabaseServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error fetching session:', error)
      return null
    }

    return session
  })
