import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in the browser.
 */
export function createClient() {
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_KEY!
  )
}
