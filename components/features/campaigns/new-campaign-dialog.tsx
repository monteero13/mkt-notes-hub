"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Target, Zap, Globe } from "lucide-react";
import { createCampaign } from "@/actions/campaigns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";


interface Props {
  workspaceId: string;
  clients: { id: string; company_name: string }[];
  defaultOpen?: boolean;
}

const PLATFORMS = ["instagram", "tiktok", "youtube", "linkedin", "facebook", "twitter", "email", "blog", "google_ads", "meta_ads", "other"];

export function NewCampaignDialog({ workspaceId, clients, defaultOpen = false }: Props) {
  const t = useTranslations("campanas");
  const td = useTranslations("campanas.dialog");
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const schema = z.object({
    name: z.string().min(1, td("error_name_required")).max(150),
    description: z.string().max(2000).optional(),
    objective: z.string().max(500).optional(),
    platform: z.enum(["instagram", "tiktok", "youtube", "linkedin", "facebook", "twitter", "email", "blog", "google_ads", "meta_ads", "other"]).optional(),
    status: z.enum(["draft", "active", "paused", "completed", "archived"]),
    budget: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    client_id: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "draft" },
  });

  async function onSubmit(data: FormData) {
    const result = await createCampaign({
      ...data,
      workspace_id: workspaceId,
      budget: data.budget ? parseFloat(data.budget) : null,
      client_id: data.client_id || null,
      platform: data.platform || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    });
    if (result.error) toast.error(result.error);
    else {
      toast.success(td("success_msg"));
      reset();
      setOpen(false);
      startTransition(() => { router.refresh(); });
    }
  }

  const tp = useTranslations("campanas.platforms");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90 gap-2 shadow-sm">
          <Plus size={14} className="text-white" /> <span className="text-white">{td("initialize_btn")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-sm border-border bg-card p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-accent/5 px-6 py-4 border-b border-border">
          <DialogTitle className="technical-label text-[11px] text-foreground uppercase tracking-widest">{td("title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="technical-label text-[9px] opacity-60 uppercase">{td("label_name")} *</Label>
            <Input
              {...register("name")}
              className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold uppercase tracking-tight"
              placeholder={td("placeholder_name")}
              autoFocus
            />
            {errors.name && <p className="text-[9px] text-error technical-label">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">{td("label_status")}</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  {["draft", "active", "paused", "completed"].map((s) => (
                    <SelectItem key={s} value={s} className="technical-label text-[9px] uppercase tracking-widest">{t(`status_${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">{td("label_platform")}</Label>
              <Select value={watch("platform") ?? ""} onValueChange={(v) => setValue("platform", v as any)}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest"><SelectValue placeholder={td("placeholder_platform")} /></SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p} className="technical-label text-[9px] uppercase tracking-widest">{tp(p)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {clients.length > 0 && (
              <div className="col-span-2 space-y-2">
                <Label className="technical-label text-[9px] opacity-60 uppercase">{td("label_client")}</Label>
                <Select value={watch("client_id") ?? ""} onValueChange={(v) => setValue("client_id", v)}>
                  <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest">
                    <SelectValue placeholder={td("placeholder_client")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm border-border bg-card">
                    {clients.map((c) => <SelectItem key={c.id} value={c.id} className="technical-label text-[9px] uppercase">{c.company_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">{td("label_budget")}</Label>
              <Input type="number" step="0.01" {...register("budget")} className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase" placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">{td("label_start_date")}</Label>
              <Input type="date" {...register("start_date")} className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="technical-label text-[9px] opacity-60 uppercase">{td("label_objective")}</Label>
            <Input {...register("objective")} className="h-10 rounded-sm border-border bg-accent/5 text-[11px] font-bold" placeholder={td("placeholder_objective")} />
          </div>

          <div className="space-y-2">
            <Label className="technical-label text-[9px] opacity-60 uppercase">{td("label_description")}</Label>
            <Textarea {...register("description")} className="rounded-sm border-border bg-accent/5 text-[11px] font-bold min-h-[80px]" placeholder={td("placeholder_description")} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 rounded-sm technical-label text-[10px] hover:bg-accent/5">{td("abort_btn")}</Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 rounded-sm bg-brand px-8 technical-label text-[10px] text-white">
              {isSubmitting && <Loader2 size={14} className="mr-2 animate-spin" />}
              {td("submit_btn")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
