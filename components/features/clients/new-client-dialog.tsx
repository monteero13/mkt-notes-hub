"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createClient as createClientAction } from "@/actions/clients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const schema = z.object({
  company_name: z.string().min(1, "Company name is required").max(100),
  contact_name: z.string().max(100).optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  contact_phone: z.string().max(30).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  niche: z.string().max(60).optional(),
  brand_notes: z.string().max(2000).optional(),
  monthly_retainer: z.string().optional(),
  status: z.enum(["active", "inactive", "prospect", "churned"]),
});

type FormData = z.infer<typeof schema>;

interface Props {
  workspaceId: string;
  defaultOpen?: boolean;
}

export function NewClientDialog({ workspaceId, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();
  const t = useTranslations("clientes");

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active" },
  });

  async function onSubmit(data: FormData) {
    const result = await createClientAction({
      ...data,
      workspace_id: workspaceId,
      monthly_retainer: data.monthly_retainer ? parseFloat(data.monthly_retainer) : null,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("dialog.success"));
      reset();
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90 gap-2">
          <Plus size={14} /> {t("dialog.trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-sm border-border bg-card p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-accent/5 px-6 py-4 border-b border-border">
          <DialogTitle className="technical-label text-[11px] text-foreground">{t("dialog.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="company_name" className="technical-label text-[9px] opacity-60">{t("dialog.name_label")}</Label>
              <Input id="company_name" {...register("company_name")} className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold uppercase tracking-tight" placeholder={t("dialog.name_placeholder")} />
              {errors.company_name && <p className="text-[9px] text-error technical-label">{t("dialog.error_name")}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name" className="technical-label text-[9px] opacity-60">{t("dialog.contact_label")}</Label>
              <Input id="contact_name" {...register("contact_name")} className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold" placeholder={t("dialog.contact_placeholder")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="technical-label text-[9px] opacity-60">{t("dialog.status_label")}</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold uppercase"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card shadow-2xl">
                  <SelectItem value="prospect" className="technical-label text-[9px]">{t("status.prospect")}</SelectItem>
                  <SelectItem value="active" className="technical-label text-[9px]">{t("status.active")}</SelectItem>
                  <SelectItem value="inactive" className="technical-label text-[9px]">{t("status.inactive")}</SelectItem>
                  <SelectItem value="churned" className="technical-label text-[9px]">{t("status.churned")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email" className="technical-label text-[9px] opacity-60">{t("dialog.email_label")}</Label>
              <Input id="contact_email" type="email" {...register("contact_email")} className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold" placeholder={t("dialog.email_placeholder")} />
              {errors.contact_email && <p className="text-[9px] text-error technical-label">{t("dialog.error_email")}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="technical-label text-[9px] opacity-60">{t("dialog.phone_label")}</Label>
              <Input id="contact_phone" {...register("contact_phone")} className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold" placeholder={t("dialog.phone_placeholder")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="technical-label text-[9px] opacity-60">{t("dialog.website_label")}</Label>
              <Input id="website" {...register("website")} className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold" placeholder={t("dialog.website_placeholder")} />
              {errors.website && <p className="text-[9px] text-error technical-label">{t("dialog.error_url")}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche" className="technical-label text-[9px] opacity-60">{t("dialog.sector_label")}</Label>
              <Input id="niche" {...register("niche")} className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold uppercase" placeholder={t("dialog.sector_placeholder")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_retainer" className="technical-label text-[9px] opacity-60">{t("dialog.retainer_label")}</Label>
              <Input id="monthly_retainer" type="number" step="0.01" {...register("monthly_retainer")} className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold" placeholder="0.00" />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="brand_notes" className="technical-label text-[9px] opacity-60">{t("dialog.notes_label")}</Label>
              <Textarea id="brand_notes" {...register("brand_notes")} className="rounded-sm border-border bg-accent/5 text-[11px] font-bold min-h-[100px]" placeholder={t("dialog.notes_placeholder")} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 rounded-sm technical-label text-[10px] hover:bg-accent/5">{t("dialog.abort")}</Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 rounded-sm bg-brand px-8 technical-label text-[10px] text-white">
              {isSubmitting && <Loader2 size={14} className="mr-2 animate-spin" />}
              {t("dialog.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
