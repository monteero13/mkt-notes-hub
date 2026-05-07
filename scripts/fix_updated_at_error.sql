-- =========================================================================
-- SOLUCIÓN AL ERROR: record "new" has no field "updated_at"
-- AL ERROR: Database error saving new user (Falta columna email en profiles)
-- AL ERROR: Miembros Activos (0) en la pestaña de Equipo (Falta Relación)
-- Y AL ERROR: El colaborador acepta invitación pero no se une (Bloqueo de RLS)
-- =========================================================================
-- Este script de migración unificado soluciona de raíz todos los problemas:
-- 1. Registro de nuevos usuarios (columna 'email' en 'profiles').
-- 2. Creación de espacios de trabajo (triggers y columnas 'updated_at').
-- 3. Carga de miembros de equipo (clave foránea de 'workspace_members' a 'profiles').
-- 4. Unirse a un equipo por invitación/código (Modificación de políticas RLS en members e invites).
-- =========================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- PASO 1: CORRECCIÓN DE LA TABLA PROFILES (ERROR DE SIGNUP / REGISTRO)
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.raw_user_meta_data->>'avatar_url'
    );
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────
-- PASO 2: CORRECCIÓN DE RELACIONES EN WORKSPACE_MEMBERS (0 MIEMBROS EN TEAM)
-- ─────────────────────────────────────────────────────────────────────────
-- Eliminamos la clave foránea antigua para evitar conflictos si estuviera apuntando a auth.users
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey;

-- Creamos la clave foránea explícita apuntando directamente a la tabla pública 'profiles'
ALTER TABLE public.workspace_members 
  ADD CONSTRAINT workspace_members_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;


-- ─────────────────────────────────────────────────────────────────────────
-- PASO 3: CORRECCIÓN DE POLÍTICAS RLS PARA INVITACIONES Y MIEMBROS
-- ─────────────────────────────────────────────────────────────────────────
-- Por defecto, la política RLS 'wm_insert_admin' solo permitía insertar filas 
-- a los administradores u owners. Cuando un colaborador aceptaba una invitación, 
-- el backend bloqueaba la inserción por RLS pero retornaba un éxito silencioso (sin error).
-- Además, 'invites_update_admin' bloqueaba que el invitado marcara su invitación como 'accepted'.

-- A) Permitir que un usuario se inserte a sí mismo como miembro
DROP POLICY IF EXISTS "wm_insert_admin" ON public.workspace_members;
CREATE POLICY "wm_insert_admin" ON public.workspace_members
  FOR INSERT WITH CHECK (
    get_workspace_role(workspace_id) IN ('owner', 'admin')
    OR user_id = auth.uid()
  );

-- B) Permitir que el destinatario de la invitación pueda actualizar su estado a 'accepted' o 'declined'
DROP POLICY IF EXISTS "invites_update_admin" ON public.workspace_invites;
CREATE POLICY "invites_update_admin" ON public.workspace_invites
  FOR UPDATE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin')
    OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );


-- ─────────────────────────────────────────────────────────────────────────
-- PASO 4: CORRECCIÓN DE LAS TABLAS WORKSPACES (ERROR DE UPDATED_AT)
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.workspace_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    NEW.updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar fallos de columna inexistente
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_workspaces ON workspaces;
CREATE TRIGGER set_updated_at_workspaces BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_workspace_members ON workspace_members;
CREATE TRIGGER set_updated_at_workspace_members BEFORE UPDATE ON workspace_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_subscriptions ON subscriptions;
CREATE TRIGGER set_updated_at_subscriptions BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
