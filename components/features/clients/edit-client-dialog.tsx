'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Building2, Globe, Mail, DollarSign } from 'lucide-react';
import type { Client } from "@/types";
import { useTranslations } from 'next-intl';

interface Props {
  client: Client;
  workspaceId: string;
  onClose: () => void;
}

export function EditClientDialog({ client, workspaceId, onClose }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState(client.company_name);
  const [industry, setIndustry] = useState(client.niche || '');
  const [email, setEmail] = useState(client.contact_email || '');
  const [retainer, setRetainer] = useState(client.monthly_retainer?.toString() || '');
  const t = useTranslations("clientes");

  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          company_name: companyName,
          niche: industry,
          contact_email: email,
          monthly_retainer: parseFloat(retainer) || 0,
        })
        .eq('id', client.id)
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      toast.success(t("dialog.update_success"));
      await queryClient.refetchQueries({ queryKey: ['clients'] });
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-sm">
        <div className="p-8">
          <DialogHeader className="mb-8 text-left">
            <DialogTitle className="text-xl font-heading font-black tracking-tight text-foreground uppercase">{t("dialog.edit_title")}</DialogTitle>
            <DialogDescription className="text-[10px] technical-label opacity-60 mt-1 uppercase">{t("dialog.edit_desc")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5 group">
                <label className="technical-label text-[9px] opacity-60 ml-1 uppercase">{t("dialog.name_label")}</label>
                <div className="relative">
                  <Input
                    placeholder={t("dialog.name_placeholder")}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-11 rounded-sm border-border bg-black focus:border-brand transition-all text-sm font-medium pl-10 pr-4"
                    required
                  />
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="technical-label text-[9px] opacity-60 ml-1 uppercase">{t("dialog.sector_label")}</label>
                <div className="relative">
                  <Input
                    placeholder={t("dialog.sector_placeholder")}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="h-11 rounded-sm border-border bg-black focus:border-brand transition-all text-sm font-medium pl-10 pr-4"
                  />
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="technical-label text-[9px] opacity-60 ml-1 uppercase">{t("dialog.email_label")}</label>
                <div className="relative">
                  <Input
                    placeholder={t("dialog.email_placeholder")}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-sm border-border bg-black focus:border-brand transition-all text-sm font-medium pl-10 pr-4"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="technical-label text-[9px] opacity-60 ml-1 uppercase">{t("dialog.retainer_label")}</label>
                <div className="relative">
                  <Input
                    placeholder="0.00"
                    type="number"
                    value={retainer}
                    onChange={(e) => setRetainer(e.target.value)}
                    className="h-11 rounded-sm border-border bg-black focus:border-brand transition-all text-sm font-medium pl-10 pr-4"
                  />
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-sm font-black uppercase tracking-[0.2em] text-[10px] border-border hover:bg-accent/5">
                {t("dialog.abort")}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-[2] h-11 rounded-sm font-black uppercase tracking-[0.2em] text-[10px] bg-brand text-white shadow-lg shadow-brand/10 hover:opacity-90">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("dialog.commit_changes")}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
