-- ============================================================
-- MKT.NOTES — Complete Supabase Schema
-- Migration: 001_initial_schema
-- ============================================================

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────
-- ENUMS (Idempotent check)
-- ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role') THEN
    CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'manager', 'editor', 'viewer', 'client_guest');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status') THEN
    CREATE TYPE client_status AS ENUM ('active', 'inactive', 'prospect', 'churned');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
    CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_platform') THEN
    CREATE TYPE campaign_platform AS ENUM (
      'instagram', 'tiktok', 'youtube', 'linkedin', 'facebook',
      'twitter', 'email', 'blog', 'google_ads', 'meta_ads', 'other'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'canceled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'medium', 'low');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
    CREATE TYPE content_status AS ENUM ('idea', 'drafting', 'in_review', 'approved', 'scheduled', 'published', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_channel') THEN
    CREATE TYPE content_channel AS ENUM ('instagram', 'tiktok', 'youtube', 'linkedin', 'facebook', 'twitter', 'email', 'blog', 'other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_event_type') THEN
    CREATE TYPE calendar_event_type AS ENUM ('content_post', 'campaign_launch', 'meeting', 'deadline', 'milestone', 'other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
    CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
    CREATE TYPE resource_type AS ENUM ('image', 'video', 'pdf', 'document', 'zip', 'other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'task_assigned', 'task_comment', 'campaign_update', 'content_approved',
      'content_rejected', 'invite_accepted', 'mention', 'system'
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  timezone        TEXT DEFAULT 'UTC',
  onboarding_done BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- WORKSPACES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  logo_url     TEXT,
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  timezone     TEXT DEFAULT 'UTC',
  brand_color  TEXT DEFAULT '#6366f1',
  white_label  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);

-- ─────────────────────────────────────────────
-- WORKSPACE MEMBERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspace_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         workspace_role NOT NULL DEFAULT 'editor',
  is_active    BOOLEAN DEFAULT TRUE,
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);

-- ─────────────────────────────────────────────
-- WORKSPACE INVITES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspace_invites (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invited_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         workspace_role NOT NULL DEFAULT 'editor',
  token        TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status       invite_status DEFAULT 'pending',
  expires_at   TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invites_workspace ON workspace_invites(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON workspace_invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_token ON workspace_invites(token);

-- ─────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id          UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id       TEXT,
  plan                  subscription_plan DEFAULT 'free',
  status                subscription_status DEFAULT 'active',
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN DEFAULT FALSE,
  trial_end             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ─────────────────────────────────────────────
-- CLIENTS CRM
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_name      TEXT NOT NULL,
  contact_name      TEXT,
  contact_email     TEXT,
  contact_phone     TEXT,
  website           TEXT,
  niche             TEXT,
  brand_notes       TEXT,
  monthly_retainer  NUMERIC(12, 2),
  status            client_status DEFAULT 'active',
  logo_url          TEXT,
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_workspace ON clients(workspace_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- ─────────────────────────────────────────────
-- CAMPAIGNS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  objective    TEXT,
  platform     campaign_platform,
  status       campaign_status DEFAULT 'draft',
  budget       NUMERIC(12, 2),
  start_date   DATE,
  end_date     DATE,
  owner_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  kpi_targets  JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_workspace ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(owner_id);

-- ─────────────────────────────────────────────
-- CAMPAIGN MEMBERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id  UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         TEXT DEFAULT 'contributor',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign ON campaign_members(campaign_id);

-- ─────────────────────────────────────────────
-- TASKS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id   UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  client_id     UUID REFERENCES clients(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        task_status DEFAULT 'todo',
  priority      task_priority DEFAULT 'medium',
  assignee_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date      TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  sort_order    INTEGER DEFAULT 0,
  parent_id     UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_campaign ON tasks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- ─────────────────────────────────────────────
-- TASK COMMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);

-- ─────────────────────────────────────────────
-- CALENDAR EVENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id  UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  content_id   UUID, -- refs content_items, fk added after
  title        TEXT NOT NULL,
  description  TEXT,
  event_type   calendar_event_type DEFAULT 'other',
  start_at     TIMESTAMPTZ NOT NULL,
  end_at       TIMESTAMPTZ,
  all_day      BOOLEAN DEFAULT FALSE,
  color        TEXT,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_workspace ON calendar_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(start_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_campaign ON calendar_events(campaign_id);

-- ─────────────────────────────────────────────
-- BRAINSTORM BOARDS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brainstorm_boards (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id  UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brainstorm_boards_workspace ON brainstorm_boards(workspace_id);

-- ─────────────────────────────────────────────
-- BRAINSTORM NOTES (sticky notes)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brainstorm_notes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id     UUID NOT NULL REFERENCES brainstorm_boards(id) ON DELETE CASCADE,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content      TEXT NOT NULL,
  category     TEXT DEFAULT 'idea',
  color        TEXT DEFAULT '#fef08a',
  position_x   NUMERIC DEFAULT 0,
  position_y   NUMERIC DEFAULT 0,
  votes        INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brainstorm_notes_board ON brainstorm_notes(board_id);

-- ─────────────────────────────────────────────
-- BRAINSTORM VOTES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brainstorm_votes (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id  UUID NOT NULL REFERENCES brainstorm_notes(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

-- ─────────────────────────────────────────────
-- CONTENT ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id    UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  copy           TEXT,
  cta            TEXT,
  hashtags       TEXT[],
  asset_urls     TEXT[],
  channel        content_channel NOT NULL,
  status         content_status DEFAULT 'idea',
  scheduled_at   TIMESTAMPTZ,
  published_at   TIMESTAMPTZ,
  approved_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK for calendar_events (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_calendar_content') THEN
    ALTER TABLE calendar_events
      ADD CONSTRAINT fk_calendar_content
      FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_content_workspace ON content_items(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_campaign ON content_items(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_channel ON content_items(channel);
CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_scheduled ON content_items(scheduled_at);

-- ─────────────────────────────────────────────
-- RESOURCES (file library)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES clients(id) ON DELETE SET NULL,
  campaign_id   UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  file_url      TEXT NOT NULL,
  file_path     TEXT NOT NULL,
  file_type     resource_type DEFAULT 'other',
  mime_type     TEXT,
  size_bytes    BIGINT,
  uploaded_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_workspace ON resources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_resources_client ON resources(client_id);
CREATE INDEX IF NOT EXISTS idx_resources_campaign ON resources(campaign_id);

-- ─────────────────────────────────────────────
-- ACTIVITY LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type  TEXT NOT NULL, -- 'task' | 'campaign' | 'client' | ...
  entity_id    UUID NOT NULL,
  action       TEXT NOT NULL, -- 'created' | 'updated' | 'deleted' | 'commented'
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_workspace ON activity_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ─────────────────────────────────────────────
-- ANALYTICS SNAPSHOTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id  UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  platform     campaign_platform,
  metric_date  DATE NOT NULL,
  metrics      JSONB NOT NULL DEFAULT '{}',
  -- Common keys in metrics JSON:
  -- followers, reach, impressions, saves, shares, engagement_rate,
  -- cpc, cpm, cpa, ctr, roas, conversions, spend, revenue
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_workspace ON analytics_snapshots(workspace_id);
CREATE INDEX IF NOT EXISTS idx_analytics_campaign ON analytics_snapshots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_snapshots(metric_date DESC);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         notification_type NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT,
  entity_type  TEXT,
  entity_id    UUID,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_workspace ON notifications(workspace_id);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER FUNCTION
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_workspaces ON workspaces;
CREATE TRIGGER set_updated_at_workspaces BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_workspace_members ON workspace_members;
CREATE TRIGGER set_updated_at_workspace_members BEFORE UPDATE ON workspace_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_subscriptions ON subscriptions;
CREATE TRIGGER set_updated_at_subscriptions BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_clients ON clients;
CREATE TRIGGER set_updated_at_clients BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_campaigns ON campaigns;
CREATE TRIGGER set_updated_at_campaigns BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_tasks ON tasks;
CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_task_comments ON task_comments;
CREATE TRIGGER set_updated_at_task_comments BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_calendar_events ON calendar_events;
CREATE TRIGGER set_updated_at_calendar_events BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_brainstorm_boards ON brainstorm_boards;
CREATE TRIGGER set_updated_at_brainstorm_boards BEFORE UPDATE ON brainstorm_boards FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_brainstorm_notes ON brainstorm_notes;
CREATE TRIGGER set_updated_at_brainstorm_notes BEFORE UPDATE ON brainstorm_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_content_items ON content_items;
CREATE TRIGGER set_updated_at_content_items BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_resources ON resources;
CREATE TRIGGER set_updated_at_resources BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- AUTO-CREATE SUBSCRIPTION ON WORKSPACE CREATE
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_workspace()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (workspace_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_workspace_created ON workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION handle_new_workspace();

-- ─────────────────────────────────────────────
-- HELPER: check workspace membership
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_workspace_role(ws_id UUID)
RETURNS workspace_role AS $$
DECLARE
  r workspace_role;
BEGIN
  SELECT role INTO r FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = auth.uid() AND is_active = TRUE;
  RETURN r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION can_edit_workspace(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
      AND is_active = TRUE
      AND role IN ('owner', 'admin', 'manager', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════

-- ── PROFILES ──────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Allow workspace members to see each other's profiles
DROP POLICY IF EXISTS "profiles_select_coworkers" ON profiles;
CREATE POLICY "profiles_select_coworkers" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm1
      JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid()
        AND wm2.user_id = profiles.id
        AND wm1.is_active = TRUE
    )
  );

-- ── WORKSPACES ────────────────────────────────────
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspaces_select_member" ON workspaces;
CREATE POLICY "workspaces_select_member" ON workspaces
  FOR SELECT USING (is_workspace_member(id));

DROP POLICY IF EXISTS "workspaces_insert_auth" ON workspaces;
CREATE POLICY "workspaces_insert_auth" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "workspaces_update_owner_admin" ON workspaces;
CREATE POLICY "workspaces_update_owner_admin" ON workspaces
  FOR UPDATE USING (
    get_workspace_role(id) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "workspaces_delete_owner" ON workspaces;
CREATE POLICY "workspaces_delete_owner" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- ── WORKSPACE MEMBERS ─────────────────────────────
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wm_select_member" ON workspace_members;
CREATE POLICY "wm_select_member" ON workspace_members
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "wm_insert_admin" ON workspace_members;
CREATE POLICY "wm_insert_admin" ON workspace_members
  FOR INSERT WITH CHECK (
    get_workspace_role(workspace_id) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "wm_update_admin" ON workspace_members;
CREATE POLICY "wm_update_admin" ON workspace_members
  FOR UPDATE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "wm_delete_owner_admin" ON workspace_members;
CREATE POLICY "wm_delete_owner_admin" ON workspace_members
  FOR DELETE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin')
    OR user_id = auth.uid()
  );

-- ── WORKSPACE INVITES ─────────────────────────────
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invites_select_admin" ON workspace_invites;
CREATE POLICY "invites_select_admin" ON workspace_invites
  FOR SELECT USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin')
    OR email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "invites_insert_admin" ON workspace_invites;
CREATE POLICY "invites_insert_admin" ON workspace_invites
  FOR INSERT WITH CHECK (
    get_workspace_role(workspace_id) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "invites_update_admin" ON workspace_invites;
CREATE POLICY "invites_update_admin" ON workspace_invites
  FOR UPDATE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin')
  );

-- ── SUBSCRIPTIONS ─────────────────────────────────
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_member" ON subscriptions;
CREATE POLICY "subscriptions_select_member" ON subscriptions
  FOR SELECT USING (
    is_workspace_member(workspace_id)
  );

-- ── CLIENTS ───────────────────────────────────────
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_select_member" ON clients;
CREATE POLICY "clients_select_member" ON clients
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "clients_insert_manager" ON clients;
CREATE POLICY "clients_insert_manager" ON clients
  FOR INSERT WITH CHECK (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "clients_update_manager" ON clients;
CREATE POLICY "clients_update_manager" ON clients
  FOR UPDATE USING (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "clients_delete_admin" ON clients;
CREATE POLICY "clients_delete_admin" ON clients
  FOR DELETE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin', 'manager')
  );

-- ── CAMPAIGNS ─────────────────────────────────────
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns_select_member" ON campaigns;
CREATE POLICY "campaigns_select_member" ON campaigns
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "campaigns_insert_manager" ON campaigns;
CREATE POLICY "campaigns_insert_manager" ON campaigns
  FOR INSERT WITH CHECK (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "campaigns_update_editor" ON campaigns;
CREATE POLICY "campaigns_update_editor" ON campaigns
  FOR UPDATE USING (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "campaigns_delete_manager" ON campaigns;
CREATE POLICY "campaigns_delete_manager" ON campaigns
  FOR DELETE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin', 'manager')
  );

-- ── TASKS ─────────────────────────────────────────
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_member" ON tasks;
CREATE POLICY "tasks_select_member" ON tasks
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "tasks_insert_editor" ON tasks;
CREATE POLICY "tasks_insert_editor" ON tasks
  FOR INSERT WITH CHECK (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "tasks_update_editor" ON tasks;
CREATE POLICY "tasks_update_editor" ON tasks
  FOR UPDATE USING (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "tasks_delete_manager" ON tasks;
CREATE POLICY "tasks_delete_manager" ON tasks
  FOR DELETE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin', 'manager')
    OR created_by = auth.uid()
  );

-- ── TASK COMMENTS ─────────────────────────────────
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_comments_select_member" ON task_comments;
CREATE POLICY "task_comments_select_member" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks t WHERE t.id = task_id AND is_workspace_member(t.workspace_id)
    )
  );

DROP POLICY IF EXISTS "task_comments_insert_editor" ON task_comments;
CREATE POLICY "task_comments_insert_editor" ON task_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks t WHERE t.id = task_id AND can_edit_workspace(t.workspace_id)
    )
  );

DROP POLICY IF EXISTS "task_comments_update_own" ON task_comments;
CREATE POLICY "task_comments_update_own" ON task_comments
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "task_comments_delete_own" ON task_comments;
CREATE POLICY "task_comments_delete_own" ON task_comments
  FOR DELETE USING (user_id = auth.uid());

-- ── CALENDAR EVENTS ───────────────────────────────
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calendar_select_member" ON calendar_events;
CREATE POLICY "calendar_select_member" ON calendar_events
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "calendar_insert_editor" ON calendar_events;
CREATE POLICY "calendar_insert_editor" ON calendar_events
  FOR INSERT WITH CHECK (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "calendar_update_editor" ON calendar_events;
CREATE POLICY "calendar_update_editor" ON calendar_events
  FOR UPDATE USING (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "calendar_delete_manager" ON calendar_events;
CREATE POLICY "calendar_delete_manager" ON calendar_events
  FOR DELETE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin', 'manager')
    OR created_by = auth.uid()
  );

-- ── BRAINSTORM BOARDS ─────────────────────────────
ALTER TABLE brainstorm_boards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boards_select_member" ON brainstorm_boards;
CREATE POLICY "boards_select_member" ON brainstorm_boards
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "boards_insert_editor" ON brainstorm_boards;
CREATE POLICY "boards_insert_editor" ON brainstorm_boards
  FOR INSERT WITH CHECK (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "boards_update_editor" ON brainstorm_boards;
CREATE POLICY "boards_update_editor" ON brainstorm_boards
  FOR UPDATE USING (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "boards_delete_manager" ON brainstorm_boards;
CREATE POLICY "boards_delete_manager" ON brainstorm_boards
  FOR DELETE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin', 'manager')
  );

-- ── BRAINSTORM NOTES ──────────────────────────────
ALTER TABLE brainstorm_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes_select_member" ON brainstorm_notes;
CREATE POLICY "notes_select_member" ON brainstorm_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brainstorm_boards b WHERE b.id = board_id AND is_workspace_member(b.workspace_id)
    )
  );

DROP POLICY IF EXISTS "notes_insert_editor" ON brainstorm_notes;
CREATE POLICY "notes_insert_editor" ON brainstorm_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM brainstorm_boards b WHERE b.id = board_id AND can_edit_workspace(b.workspace_id)
    )
  );

DROP POLICY IF EXISTS "notes_update_editor" ON brainstorm_notes;
CREATE POLICY "notes_update_editor" ON brainstorm_notes
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM brainstorm_boards b
      JOIN workspace_members wm ON wm.workspace_id = b.workspace_id
      WHERE b.id = board_id AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "notes_delete_own_or_manager" ON brainstorm_notes;
CREATE POLICY "notes_delete_own_or_manager" ON brainstorm_notes
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM brainstorm_boards b
      JOIN workspace_members wm ON wm.workspace_id = b.workspace_id
      WHERE b.id = board_id AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin', 'manager')
    )
  );

-- ── BRAINSTORM VOTES ──────────────────────────────
ALTER TABLE brainstorm_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "votes_select_member" ON brainstorm_votes;
CREATE POLICY "votes_select_member" ON brainstorm_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brainstorm_notes n
      JOIN brainstorm_boards b ON b.id = n.board_id
      WHERE n.id = note_id AND is_workspace_member(b.workspace_id)
    )
  );

DROP POLICY IF EXISTS "votes_insert_member" ON brainstorm_votes;
CREATE POLICY "votes_insert_member" ON brainstorm_votes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM brainstorm_notes n
      JOIN brainstorm_boards b ON b.id = n.board_id
      WHERE n.id = note_id AND is_workspace_member(b.workspace_id)
    )
  );

DROP POLICY IF EXISTS "votes_delete_own" ON brainstorm_votes;
CREATE POLICY "votes_delete_own" ON brainstorm_votes
  FOR DELETE USING (user_id = auth.uid());

-- ── CONTENT ITEMS ─────────────────────────────────
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_select_member" ON content_items;
CREATE POLICY "content_select_member" ON content_items
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "content_insert_editor" ON content_items;
CREATE POLICY "content_insert_editor" ON content_items
  FOR INSERT WITH CHECK (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "content_update_editor" ON content_items;
CREATE POLICY "content_update_editor" ON content_items
  FOR UPDATE USING (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "content_delete_manager" ON content_items;
CREATE POLICY "content_delete_manager" ON content_items
  FOR DELETE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin', 'manager')
    OR created_by = auth.uid()
  );

-- ── RESOURCES ─────────────────────────────────────
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resources_select_member" ON resources;
CREATE POLICY "resources_select_member" ON resources
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "resources_insert_editor" ON resources;
CREATE POLICY "resources_insert_editor" ON resources
  FOR INSERT WITH CHECK (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "resources_update_editor" ON resources;
CREATE POLICY "resources_update_editor" ON resources
  FOR UPDATE USING (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "resources_delete_manager" ON resources;
CREATE POLICY "resources_delete_manager" ON resources
  FOR DELETE USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin', 'manager')
    OR uploaded_by = auth.uid()
  );

-- ── ACTIVITY LOGS ─────────────────────────────────
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_select_member" ON activity_logs;
CREATE POLICY "activity_select_member" ON activity_logs
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "activity_insert_member" ON activity_logs;
CREATE POLICY "activity_insert_member" ON activity_logs
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id) AND user_id = auth.uid());

-- ── ANALYTICS SNAPSHOTS ───────────────────────────
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_select_member" ON analytics_snapshots;
CREATE POLICY "analytics_select_member" ON analytics_snapshots
  FOR SELECT USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "analytics_insert_manager" ON analytics_snapshots;
CREATE POLICY "analytics_insert_manager" ON analytics_snapshots
  FOR INSERT WITH CHECK (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "analytics_update_manager" ON analytics_snapshots;
CREATE POLICY "analytics_update_manager" ON analytics_snapshots
  FOR UPDATE USING (can_edit_workspace(workspace_id));

DROP POLICY IF EXISTS "analytics_delete_manager" ON analytics_snapshots;
CREATE POLICY "analytics_delete_manager" ON analytics_snapshots
  FOR DELETE USING (can_edit_workspace(workspace_id));

-- ── NOTIFICATIONS ─────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────
-- Run in Supabase Dashboard or via CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('workspace-logos', 'workspace-logos', true);

-- Storage RLS (apply in Supabase Dashboard):
-- objects in 'resources' bucket: only workspace members can upload/view
-- objects in 'avatars': users can manage their own

-- ─────────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────────
-- Enable realtime for these tables in Supabase Dashboard:
-- tasks, task_comments, brainstorm_notes, brainstorm_votes, notifications

-- Enable realtime (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tasks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'task_comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'brainstorm_notes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE brainstorm_notes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'brainstorm_votes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE brainstorm_votes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;
