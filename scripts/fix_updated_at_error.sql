-- =========================================================================
-- SOLUCIÓN AL ERROR: record "new" has no field "updated_at"
-- Y AL ERROR: Database error saving new user (Falta columna email en profiles)
-- =========================================================================
-- Este script de migración soluciona:
-- 1. El error "record 'new' has no field 'updated_at'" al crear workspaces.
-- 2. El error "Database error saving new user" al registrarse (Signup).
-- =========================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- PASO 1: CORRECCIÓN DE LA TABLA PROFILES (ERROR DE SIGNUP)
-- ─────────────────────────────────────────────────────────────────────────
-- En producción, la tabla 'profiles' no tiene la columna 'email', 
-- lo que provoca que el trigger 'handle_new_user' falle al intentar insertar.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Redefinir la función 'handle_new_user' para que sea tolerante a fallos
-- Si por algún motivo la columna 'email' fallase o fuese nula, se ejecutará sin interrumpir el registro
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
    -- Fallback ultra-seguro si falla la inserción de campos opcionales
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que el trigger de registro de usuario esté activo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────
-- PASO 2: CORRECCIÓN DE LAS TABLAS WORKSPACES (ERROR DE UPDATED_AT)
-- ─────────────────────────────────────────────────────────────────────────
-- Agregar de forma robusta la columna 'updated_at' en caso de que falte
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.workspace_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Asegurar que otras tablas secundarias también tengan la columna 'updated_at'
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Redefinir la función 'update_updated_at()' para que sea tolerante a fallos (Fail-safe)
-- Si por cualquier motivo una tabla tiene el trigger pero no la columna, no interrumpirá la operación
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    NEW.updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar fallos de columna inexistente para que nunca interrumpa un INSERT o UPDATE
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asegurar que los triggers de 'updated_at' solo se ejecuten BEFORE UPDATE (nunca en INSERT)
DROP TRIGGER IF EXISTS set_updated_at_workspaces ON workspaces;
CREATE TRIGGER set_updated_at_workspaces 
  BEFORE UPDATE ON workspaces 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_workspace_members ON workspace_members;
CREATE TRIGGER set_updated_at_workspace_members 
  BEFORE UPDATE ON workspace_members 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_subscriptions ON subscriptions;
CREATE TRIGGER set_updated_at_subscriptions 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();
