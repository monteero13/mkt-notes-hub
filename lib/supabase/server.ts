import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function createMockServerClient() {
  const noopQuery = (): any => ({
    eq: () => noopQuery(),
    neq: () => noopQuery(),
    in: () => noopQuery(),
    order: () => noopQuery(),
    limit: () => noopQuery(),
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: (v: { data: null; error: null }) => void) =>
      Promise.resolve(resolve({ data: null, error: null })),
    data: null,
    error: null,
  });

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => noopQuery(),
      insert: () => noopQuery(),
      update: () => noopQuery(),
      delete: () => noopQuery(),
      upsert: () => noopQuery(),
    }),
    channel: () => ({ on: () => ({ subscribe: () => null }), subscribe: () => null }),
    removeChannel: async () => {},
  };
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Missing NEXT_PUBLIC_* vars → broken build; mock allows prerender auth-redirect to work
    console.warn("[Supabase] Server client env vars missing — using mock");
    return createMockServerClient() as any;
  }

  try {
    const cookieStore = await cookies();
    return createServerClient(url, key, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components can't set cookies — safe to ignore
          }
        },
      },
    });
  } catch {
    // During static generation cookies() may throw
    return createMockServerClient() as any;
  }
}

export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY — check Vercel env vars");
    }
    console.warn("[Supabase] Admin client env vars missing — using mock");
    return createMockServerClient() as any;
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
