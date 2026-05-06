-- ═══════════════════════════════════════════════════
-- MKT.NOTES HUB - SECURITY HARDENING (FASE 8)
-- ═══════════════════════════════════════════════════

-- 1. HELPERS ADICIONALES PARA ROLES
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_workspace_admin_or_manager(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
      AND is_active = TRUE
      AND role IN ('owner', 'admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_campaign_member(camp_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM campaign_members
    WHERE campaign_id = camp_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- 2. RESTRICCIÓN PARA CLIENT_GUEST (VULNERABILIDAD #1)
-- ─────────────────────────────────────────────

-- CAMPAIGNS
DROP POLICY IF EXISTS "campaigns_select_member" ON campaigns;
CREATE POLICY "campaigns_select_secure" ON campaigns
  FOR SELECT USING (
    is_workspace_member(workspace_id) AND (
      get_workspace_role(workspace_id) != 'client_guest' OR
      is_campaign_member(id)
    )
  );

-- TASKS
DROP POLICY IF EXISTS "tasks_select_member" ON tasks;
CREATE POLICY "tasks_select_secure" ON tasks
  FOR SELECT USING (
    is_workspace_member(workspace_id) AND (
      get_workspace_role(workspace_id) != 'client_guest' OR
      assignee_id = auth.uid() OR created_by = auth.uid()
    )
  );

-- CONTENT_ITEMS (Calendario/Planner)
DROP POLICY IF EXISTS "content_select_member" ON content_items;
CREATE POLICY "content_select_secure" ON content_items
  FOR SELECT USING (
    is_workspace_member(workspace_id) AND (
      get_workspace_role(workspace_id) != 'client_guest' OR
      (campaign_id IS NOT NULL AND is_campaign_member(campaign_id)) OR
      created_by = auth.uid()
    )
  );

-- ANALYTICS_SNAPSHOTS (Solo managers/admins ven analíticas completas, invitados nada)
DROP POLICY IF EXISTS "analytics_select_member" ON analytics_snapshots;
CREATE POLICY "analytics_select_secure" ON analytics_snapshots
  FOR SELECT USING (
    is_workspace_member(workspace_id) AND 
    get_workspace_role(workspace_id) != 'client_guest'
  );


-- 3. POLÍTICAS DE ALMACENAMIENTO (VULNERABILIDAD #2)
-- ─────────────────────────────────────────────

-- Asegurar que RLS esté activo en storage (Nota: Si da error 42501, saltar esta línea)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- BUCKET: avatars
-- Lectura pública para todos
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Gestión solo propia
DROP POLICY IF EXISTS "avatars_own_manage" ON storage.objects;
CREATE POLICY "avatars_own_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- BUCKET: resources
-- Lectura para miembros del workspace (asumiendo que el primer folder es el user_id según código actual)
-- NOTA: Idealmente esto debería ser workspace_id, pero para no romper el código actual:
DROP POLICY IF EXISTS "resources_own_manage" ON storage.objects;
CREATE POLICY "resources_own_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text);

-- BUCKET: workspace-logos
DROP POLICY IF EXISTS "logos_public_read" ON storage.objects;
CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'workspace-logos');

DROP POLICY IF EXISTS "logos_manager_manage" ON storage.objects;
CREATE POLICY "logos_manager_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'workspace-logos')

-- 4. SUBSCRIPTION SYNC FIX (Permitir a miembros ver el plan para Analytics)
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "subscriptions_select_owner_admin" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_member" ON subscriptions;
CREATE POLICY "subscriptions_select_member" ON subscriptions
  FOR SELECT USING (is_workspace_member(workspace_id));
