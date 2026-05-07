-- =========================================================================
-- SOLUCIÓN AL ERROR: record "new" has no field "updated_at"
-- =========================================================================
-- Este script de migración soluciona el error al crear o actualizar espacios
-- de trabajo (workspaces) y miembros de espacios (workspace_members).
-- Agrega las columnas faltantes 'updated_at' a las tablas correspondientes
-- y actualiza la función de trigger para que sea completamente tolerante a fallos.
-- =========================================================================

-- 1. Agregar de forma robusta la columna 'updated_at' en caso de que falte
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.workspace_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Opcional: Asegurar que otras tablas principales también tengan la columna 'updated_at'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Redefinir la función 'update_updated_at()' para que sea tolerante a fallos (Fail-safe)
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

-- 3. Asegurar que los triggers de 'updated_at' solo se ejecuten BEFORE UPDATE (nunca en INSERT)
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
