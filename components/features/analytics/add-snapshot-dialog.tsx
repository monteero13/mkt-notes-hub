"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, BarChart3 } from "lucide-react";
import { createAnalyticsSnapshot } from "@/actions/analytics";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";

const PLATFORMS = ["instagram","tiktok","youtube","linkedin","facebook","twitter","email","blog","google_ads","meta_ads","other"] as const;

const schema = z.object({
  campaign_id: z.string().optional(),
  platform: z.enum(PLATFORMS).optional(),
  metric_date: z.string().min(1, "Date required"),
  impressions: z.string().optional(),
  reach: z.string().optional(),
  engagement_rate: z.string().optional(),
  spend: z.string().optional(),
  revenue: z.string().optional(),
  conversions: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  workspaceId: string;
  campaigns: { id: string; name: string }[];
}

export function AddSnapshotDialog({ workspaceId, campaigns }: Props) {
  const t = useTranslations("analisis.dialog");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0]!;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { metric_date: today },
  });

  function parseMetricNum(val: string | undefined) {
    if (!val || val.trim() === "") return undefined;
    const n = parseFloat(val);
    return isNaN(n) ? undefined : n;
  }

  async function onSubmit(data: FormData) {
    const result = await createAnalyticsSnapshot({
      workspace_id: workspaceId,
      campaign_id: data.campaign_id || null,
      platform: data.platform || null,
      metric_date: data.metric_date,
      metrics: {
        impressions: parseMetricNum(data.impressions),
        reach: parseMetricNum(data.reach),
        engagement_rate: parseMetricNum(data.engagement_rate),
        spend: parseMetricNum(data.spend),
        revenue: parseMetricNum(data.revenue),
        conversions: parseMetricNum(data.conversions),
      },
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("success"));
      reset({ metric_date: today });
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90 gap-2">
          <Plus size={14} /> {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-sm border-border bg-card p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-accent/5 px-6 py-4 border-b border-border flex flex-row items-center gap-3 space-y-0">
          <BarChart3 size={16} className="text-brand" />
          <DialogTitle className="technical-label text-[11px] text-foreground uppercase tracking-widest">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">{t("campaign")}</Label>
              <Select value={watch("campaign_id") ?? ""} onValueChange={(v) => setValue("campaign_id", v)}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest">
                  <SelectValue placeholder={t("all_placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="technical-label text-[9px] uppercase">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">{t("platform")}</Label>
              <Select value={watch("platform") ?? ""} onValueChange={(v) => setValue("platform", v as any)}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest">
                  <SelectValue placeholder={t("select_placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p} className="technical-label text-[9px] uppercase">{p.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="technical-label text-[9px] opacity-60 uppercase">{t("date")}</Label>
            <Input type="date" {...register("metric_date")} className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black" />
            {errors.metric_date && <p className="text-[9px] text-error technical-label">{errors.metric_date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="technical-label text-[9px] opacity-60 uppercase">{t("metrics")}</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "impressions", label: t("impressions") },
                { name: "reach", label: t("reach") },
                { name: "engagement_rate", label: t("engagement") },
                { name: "spend", label: t("spend") },
                { name: "revenue", label: t("revenue") },
                { name: "conversions", label: t("conversions") },
              ].map(({ name, label }) => (
                <div key={name} className="space-y-1">
                  <label className="technical-label text-[8px] opacity-50 uppercase">{label}</label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    {...register(name as any)}
                    placeholder="0"
                    className="h-9 rounded-sm border-border bg-accent/5 text-[10px] font-bold"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 rounded-sm technical-label text-[10px] hover:bg-accent/5">
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 rounded-sm bg-brand px-8 technical-label text-[10px] text-white">
              {isSubmitting && <Loader2 size={14} className="mr-2 animate-spin" />}
              {t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
