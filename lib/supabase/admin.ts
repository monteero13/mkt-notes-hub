import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing SUPABASE env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
    }
    console.warn("[Supabase] Admin client env vars missing — using empty mock for dev/build");
    return createNullClient();
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createNullClient(): ReturnType<typeof createClient> {
  return {
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), maybeSingle: async () => ({ data: null, error: null }), in: () => ({ data: [], error: null }) }), in: () => ({ data: [], error: null }), data: [], error: null }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }), data: null, error: null }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
      upsert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }), data: null, error: null }),
    }),
    storage: { from: () => ({ upload: async () => ({ data: null, error: null }), getPublicUrl: () => ({ data: { publicUrl: "" } }) }) },
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
  } as any;
}
