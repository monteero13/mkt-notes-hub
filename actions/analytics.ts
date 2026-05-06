"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const snapshotSchema = z.object({
  workspace_id: z.string().uuid(),
  campaign_id: z.string().uuid().nullish(),
  client_id: z.string().uuid().nullish(),
  platform: z.enum(["instagram","tiktok","youtube","linkedin","facebook","twitter","email","blog","google_ads","meta_ads","other"]).nullish(),
  metric_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  metrics: z.object({
    impressions: z.number().min(0).optional(),
    reach: z.number().min(0).optional(),
    engagement_rate: z.number().min(0).max(100).optional(),
    spend: z.number().min(0).optional(),
    revenue: z.number().min(0).optional(),
    conversions: z.number().min(0).optional(),
    followers: z.number().min(0).optional(),
    roas: z.number().min(0).optional(),
    ctr: z.number().min(0).max(100).optional(),
  }),
});

export async function createAnalyticsSnapshot(input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = snapshotSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" };

  // Strip undefined values from metrics
  const metrics = Object.fromEntries(
    Object.entries(parsed.data.metrics).filter(([, v]) => v !== undefined)
  );

  const { data, error } = await supabase
    .from("analytics_snapshots")
    .insert({
      workspace_id: parsed.data.workspace_id,
      campaign_id: parsed.data.campaign_id ?? null,
      client_id: parsed.data.client_id ?? null,
      platform: parsed.data.platform ?? null,
      metric_date: parsed.data.metric_date,
      metrics,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    workspace_id: parsed.data.workspace_id,
    user_id: user.id,
    entity_type: "analytics_snapshot",
    entity_id: data.id,
    action: "created",
    metadata: { date: parsed.data.metric_date, platform: parsed.data.platform },
  });

  revalidatePath("/analytics");
  return { data };
}
