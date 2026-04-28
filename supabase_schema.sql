-- =======================================================
-- MKT NOTES HUB - ESQUEMA MAESTRO SUPREMO
-- =======================================================

-- 1. FUNCIÓN MAESTRA (Romper Recursión)
CREATE OR REPLACE FUNCTION public.check_team_membership(t_id UUID, u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = t_id AND user_id = u_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TABLAS ESTRUCTURALES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT,
  status TEXT DEFAULT 'planning',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT, -- NUEVO
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT,
  type TEXT,
  url TEXT, -- NUEVO
  status TEXT DEFAULT 'idea',
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  format TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kpi TEXT,
  target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PARCHE DE COLUMNAS (Para asegurar que se añaden a tablas existentes)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS url TEXT;

-- FORZAR REFRESCO DE API
NOTIFY pgrst, 'reload schema';

-- 3. ACTIVAR SEGURIDAD (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACCESO
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
    DROP POLICY IF EXISTS "Users can create teams" ON teams;
    DROP POLICY IF EXISTS "Leaders can update team details" ON teams;
    CREATE POLICY "Users can view teams they belong to" ON teams FOR SELECT USING (created_by = auth.uid() OR public.check_team_membership(id, auth.uid()));
    CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);
    CREATE POLICY "Leaders can update team details" ON teams FOR UPDATE USING (created_by = auth.uid());
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view team memberships" ON team_members;
    DROP POLICY IF EXISTS "Users can add themselves to teams they created" ON team_members;
    DROP POLICY IF EXISTS "Leaders can update member roles" ON team_members;
    CREATE POLICY "Users can view team memberships" ON team_members FOR SELECT USING (user_id = auth.uid() OR (SELECT created_by FROM teams WHERE id = team_id) = auth.uid());
    CREATE POLICY "Users can add themselves to teams they created" ON team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Leaders can update member roles" ON team_members FOR UPDATE USING ((SELECT created_by FROM teams WHERE id = team_id) = auth.uid());
END $$;

-- Poliza Universal CRUD para Entidades
DO $$ 
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY['tasks', 'campaigns', 'content', 'ideas', 'objectives']) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can view their own %I" ON %I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can create their own %I" ON %I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update their own %I" ON %I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete their own %I" ON %I', t, t);
        
        EXECUTE format('CREATE POLICY "Users can view their own %I" ON %I FOR SELECT USING (auth.uid() = user_id OR public.check_team_membership(team_id, auth.uid()))', t, t);
        EXECUTE format('CREATE POLICY "Users can create their own %I" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', t, t);
        EXECUTE format('CREATE POLICY "Users can update their own %I" ON %I FOR UPDATE USING (auth.uid() = user_id OR public.check_team_membership(team_id, auth.uid()))', t, t);
        EXECUTE format('CREATE POLICY "Users can delete their own %I" ON %I FOR DELETE USING (auth.uid() = user_id OR public.check_team_membership(team_id, auth.uid()))', t, t);
    END LOOP;
END $$;

-- 5. MOTOR DE PROGRESO AUTOMÁTICO (Tasks -> Campaigns)
CREATE OR REPLACE FUNCTION public.update_campaign_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.campaign_id IS NOT NULL OR OLD.campaign_id IS NOT NULL THEN
    UPDATE public.campaigns
    SET progress = (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0 
          ELSE (COUNT(*) FILTER (WHERE status = 'completed')::FLOAT / COUNT(*)::FLOAT * 100)::INTEGER 
        END
      FROM public.tasks
      WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
    )
    WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_campaign_progress ON public.tasks;
CREATE TRIGGER tr_update_campaign_progress
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.update_campaign_progress();

-- 6. SEGURIDAD DE ALMACENAMIENTO (STORAGE)
-- Bucket: Resources
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true) ON CONFLICT (id) DO NOTHING;
-- Bucket: Avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Permitir a usuarios autenticados subir archivos
DROP POLICY IF EXISTS "Authenticated users can upload resources" ON storage.objects;
CREATE POLICY "Authenticated users can upload resources" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resources');

-- Permitir ver archivos
DROP POLICY IF EXISTS "Public access to resources" ON storage.objects;
CREATE POLICY "Public access to resources" ON storage.objects FOR SELECT TO public USING (bucket_id = 'resources');

-- Permitir borrar propios
DROP POLICY IF EXISTS "Users can delete their own resources" ON storage.objects;
CREATE POLICY "Users can delete their own resources" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resources');
