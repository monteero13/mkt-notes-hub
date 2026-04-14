import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

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
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_KEY!,
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
          cookiesToSet.forEach(({ name, value, options }) => {
            // Placeholder: Cookie setting in server functions is handled via specific patterns
          })
        },
      },
    }
  )
}

/**
 * Creates a Supabase client with admin privileges (using service_role key).
 * This bypasses RLS and should ONLY be used in secure server contexts
 * like webhooks or background jobs.
 */
export function createSupabaseAdminClient() {
  return createServerClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() { },
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
