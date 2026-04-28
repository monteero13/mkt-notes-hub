'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useAuth() {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { user: null, profile: null };

      // 1. Obtener el perfil de la DB
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // 2. Si no hay perfil, crearlo usando nuestra API Segura (Bypass RLS)
      if (!profile && user.user_metadata?.full_name) {
        try {
          const res = await fetch('/api/sync-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              fullName: user.user_metadata.full_name,
              avatarUrl: user.user_metadata.avatar_url
            })
          });
          
          if (res.ok) {
            const result = await res.json();
            profile = result.profile;
          }
        } catch (e) {
          console.error('Error auto-sync profile:', e);
        }
      }

      // 3. Fallback Virtual si falla la API (Para que el UI no se rompa)
      const finalProfile = profile || {
        id: user.id,
        full_name: user?.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user?.user_metadata?.avatar_url || null,
        is_pro: false
      };

      return { user, profile: finalProfile };
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
  };
}
