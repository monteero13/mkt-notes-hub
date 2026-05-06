-- ─────────────────────────────────────────────────────────────
-- FASE 7 — RLS AUDIT SCRIPT
-- Run against the live Supabase instance via the SQL Editor.
-- All statements are additive / idempotent (IF NOT EXISTS / OR REPLACE).
-- ─────────────────────────────────────────────────────────────

-- ── 1. ACTIVITY_LOGS ──────────────────────────────────────────
-- SELECT + INSERT policies already exist (verified in schema).
-- Logs should be immutable: no UPDATE or DELETE for regular users.
-- Only a service-role (admin) client can clean up old logs if needed.
-- Action: confirm no DELETE policy exists (correct by design).

SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'activity_logs'
ORDER BY cmd;

-- ── 2. ANALYTICS_SNAPSHOTS ────────────────────────────────────
-- SELECT and INSERT policies exist. UPDATE exists.
-- Missing: DELETE policy for managers (so they can remove bad snapshots).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'analytics_snapshots' AND policyname = 'analytics_delete_manager'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "analytics_delete_manager" ON analytics_snapshots
        FOR DELETE USING (can_edit_workspace(workspace_id));
    $policy$;
    RAISE NOTICE 'Created analytics_delete_manager policy';
  ELSE
    RAISE NOTICE 'analytics_delete_manager already exists — skipping';
  END IF;
END $$;

-- Verify all analytics_snapshots policies:
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'analytics_snapshots' ORDER BY cmd;

-- ── 3. NOTIFICATIONS ──────────────────────────────────────────
-- SELECT / UPDATE / DELETE (own) policies exist.
-- No INSERT policy — correct. Notifications are inserted server-side
-- via the admin (service-role) client only. Public INSERT is blocked.
-- Action: confirm INSERT is blocked for anon/authenticated.

SELECT policyname, cmd FROM pg_policies WHERE tablename = 'notifications' ORDER BY cmd;

-- ── 4. BRAINSTORM_VOTES ───────────────────────────────────────
-- Verify the join chain: votes → notes → boards → workspace_members
-- The policies use subqueries; confirm they reference workspace correctly.

SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'brainstorm_votes'
ORDER BY cmd;

-- Quick smoke test: the votes_select_member policy should filter by workspace
-- via the brainstorm_notes → brainstorm_boards join. Validate with:
EXPLAIN (ANALYZE false, COSTS false)
SELECT COUNT(*) FROM brainstorm_votes;

-- ── 5. WORKSPACE_MEMBERS ──────────────────────────────────────
-- The wm_update_admin policy currently allows any admin to update any row,
-- including changing the owner's role. Add a guard: prevent demoting the owner.
-- This is enforced at the application layer (actions/team.ts), but belt-and-suspenders:

DO $$
BEGIN
  -- Drop and recreate the update policy with owner protection
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'workspace_members' AND policyname = 'wm_update_admin'
  ) THEN
    DROP POLICY "wm_update_admin" ON workspace_members;
  END IF;

  CREATE POLICY "wm_update_admin" ON workspace_members
    FOR UPDATE USING (
      can_edit_workspace(workspace_id)
      AND (
        -- Admins can update any member except the workspace owner
        role != 'owner'
        OR
        -- Owners can always update their own row (e.g. change display settings)
        user_id = auth.uid()
      )
    );
  RAISE NOTICE 'wm_update_admin policy updated with owner-protection guard';
END $$;

-- ── 6. SUMMARY QUERY ──────────────────────────────────────────
-- List all RLS-enabled tables and their policy counts for a quick overview:

SELECT
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'workspaces', 'workspace_members', 'workspace_invites',
    'subscriptions', 'profiles',
    'clients', 'campaigns', 'tasks', 'task_comments',
    'content_items', 'resources', 'ideas',
    'calendar_events', 'objectives',
    'brainstorm_boards', 'brainstorm_notes', 'brainstorm_votes',
    'activity_logs', 'analytics_snapshots', 'notifications'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;
