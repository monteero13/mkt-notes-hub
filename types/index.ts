// ─────────────────────────────────────────────
// MKT.NOTES — Core Types
// ─────────────────────────────────────────────

export type WorkspaceRole =
  | "owner"
  | "admin"
  | "manager"
  | "editor"
  | "viewer"
  | "client_guest";

export type SubscriptionPlan = "free" | "pro" | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

export type ClientStatus = "active" | "inactive" | "prospect" | "churned";

export type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";
export type CampaignPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "facebook"
  | "twitter"
  | "email"
  | "blog"
  | "google_ads"
  | "meta_ads"
  | "other";

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "done"
  | "canceled";
export type TaskPriority = "urgent" | "high" | "medium" | "low";

export type ContentStatus =
  | "idea"
  | "drafting"
  | "in_review"
  | "approved"
  | "scheduled"
  | "published"
  | "archived";
export type ContentChannel =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "facebook"
  | "twitter"
  | "email"
  | "blog"
  | "other";

export type CalendarEventType =
  | "content_post"
  | "campaign_launch"
  | "meeting"
  | "deadline"
  | "milestone"
  | "other";

export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";
export type ResourceType = "image" | "video" | "pdf" | "document" | "zip" | "other";
export type NotificationType =
  | "task_assigned"
  | "task_comment"
  | "campaign_update"
  | "content_approved"
  | "content_rejected"
  | "invite_accepted"
  | "mention"
  | "system";

// ─────────────────────────────────────────────
// DATABASE ENTITIES
// ─────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  onboarding_done: boolean;
  is_pro?: boolean; // Virtual property for UI logic
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  owner_id: string;
  timezone: string;
  brand_color: string;
  white_label: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  is_active: boolean;
  joined_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  invited_by: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  status: InviteStatus;
  expires_at: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  workspace_id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  niche: string | null;
  brand_notes: string | null;
  monthly_retainer: number | null;
  status: ClientStatus;
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  workspace_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  objective: string | null;
  platform: CampaignPlatform | null;
  status: CampaignStatus;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  owner_id: string | null;
  kpi_targets: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  progress?: number; // Virtual property for UI logic
  client?: Client;
  owner?: Profile;
}

export interface Task {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  client_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  created_by: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string; // Virtual property for UI logic
  category_color?: string; // Virtual property for UI logic
  assignee?: Profile;
  campaign?: Campaign;
  subtasks?: Task[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface CalendarEvent {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  client_id: string | null;
  content_id: string | null;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  start_at: string;
  end_at: string | null;
  all_day: boolean;
  color: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrainstormBoard {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrainstormNote {
  id: string;
  board_id: string;
  created_by: string | null;
  content: string;
  category: string;
  color: string;
  position_x: number;
  position_y: number;
  votes: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  user_voted?: boolean;
}

export interface ContentItem {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  client_id: string | null;
  title: string;
  copy: string | null;
  cta: string | null;
  hashtags: string[];
  asset_urls: string[];
  channel: ContentChannel;
  status: ContentStatus;
  scheduled_at: string | null;
  published_at: string | null;
  approved_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
  client?: Client;
}

export interface Resource {
  id: string;
  workspace_id: string;
  client_id: string | null;
  campaign_id: string | null;
  name: string;
  description: string | null;
  file_url: string;
  file_path: string;
  file_type: ResourceType;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  uploader?: Profile;
}

export interface ActivityLog {
  id: string;
  workspace_id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: Profile;
}

export interface AnalyticsSnapshot {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  client_id: string | null;
  platform: CampaignPlatform | null;
  metric_date: string;
  metrics: AnalyticsMetrics;
  created_at: string;
}

export interface AnalyticsMetrics {
  followers?: number;
  reach?: number;
  impressions?: number;
  saves?: number;
  shares?: number;
  engagement_rate?: number;
  cpc?: number;
  cpm?: number;
  cpa?: number;
  ctr?: number;
  roas?: number;
  conversions?: number;
  spend?: number;
  revenue?: number;
  [key: string]: number | undefined;
}

export interface Notification {
  id: string;
  workspace_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────
// UI / APP TYPES
// ─────────────────────────────────────────────

export interface WorkspaceWithMembership extends Workspace {
  role: WorkspaceRole;
  plan?: SubscriptionPlan; // Denormalized from subscription for easier access
  subscription?: Subscription;
}

export interface DashboardStats {
  activeCampaigns: number;
  pendingTasks: number;
  scheduledThisWeek: number;
  totalClients: number;
  tasksCompletedThisMonth: number;
  activeMembers: number;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface PlanLimits {
  maxMembers: number | null;
  maxClients: number | null;
  storageGb: number;
  advancedAnalytics: boolean;
  exports: boolean;
  aiAssistant: boolean;
  approvalsWorkflow: boolean;
  whiteLabel: boolean;
  multipleWorkspaces: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxMembers: 3,
    maxClients: 3,
    storageGb: 1,
    advancedAnalytics: false,
    exports: false,
    aiAssistant: false,
    approvalsWorkflow: false,
    whiteLabel: false,
    multipleWorkspaces: false,
  },
  pro: {
    maxMembers: null,
    maxClients: null,
    storageGb: 100,
    advancedAnalytics: true,
    exports: true,
    aiAssistant: true,
    approvalsWorkflow: true,
    whiteLabel: true,
    multipleWorkspaces: false,
  },
  enterprise: {
    maxMembers: null,
    maxClients: null,
    storageGb: 1000,
    advancedAnalytics: true,
    exports: true,
    aiAssistant: true,
    approvalsWorkflow: true,
    whiteLabel: true,
    multipleWorkspaces: true,
  },
};

export type NavItem = {
  title: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
};
