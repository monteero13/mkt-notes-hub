"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Target, Calendar, User, Zap } from "lucide-react";
import { createTask } from "@/actions/tasks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Profile, TaskStatus } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(["urgent","high","medium","low"]),
  status: z.enum(["backlog","todo","in_progress","in_review","done","canceled"]),
  assignee_id: z.string().optional(),
  campaign_id: z.string().optional(),
  client_id: z.string().optional(),
  due_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  workspaceId: string;
  members: Profile[];
  clients: { id: string; company_name: string }[];
  campaigns: { id: string; name: string }[];
  defaultStatus?: TaskStatus;
  defaultOpen?: boolean;
  onClose?: () => void;
}

export function NewTaskDialog({ workspaceId, members, clients, campaigns, defaultStatus = "todo", defaultOpen = false, onClose }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium", status: defaultStatus },
  });

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  async function onSubmit(data: FormData) {
    const result = await createTask({
      ...data,
      workspace_id: workspaceId,
      assignee_id: data.assignee_id || null,
      campaign_id: data.campaign_id || null,
      client_id: data.client_id || null,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
    });

    if (result.error) toast.error(result.error);
    else {
      toast.success("Tactical deployment successful");
      reset();
      handleClose();
      router.refresh();
    }
  }

  const trigger = !onClose ? (
    <DialogTrigger asChild>
      <Button size="sm" className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90 gap-2">
        <Plus size={14} /> Initialize Task
      </Button>
    </DialogTrigger>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true); }}>
      {trigger}
      <DialogContent className="max-w-md rounded-sm border-border bg-card p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-accent/5 px-6 py-4 border-b border-border">
          <DialogTitle className="technical-label text-[11px] text-foreground uppercase tracking-widest">Configure Tactical Objective</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="technical-label text-[9px] opacity-60 uppercase">Operational Title *</Label>
            <Input 
              {...register("title")} 
              className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold uppercase tracking-tight" 
              placeholder="DEFINE CORE TASK" 
              autoFocus 
            />
            {errors.title && <p className="text-[9px] text-error technical-label">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="technical-label text-[9px] opacity-60 uppercase">Strategic Parameters</Label>
            <Textarea 
              {...register("description")} 
              className="rounded-sm border-border bg-accent/5 text-[11px] font-bold min-h-[80px]" 
              placeholder="OBJECTIVE DETAILS..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">Priority Access</Label>
              <Select value={watch("priority")} onValueChange={(v) => setValue("priority", v as any)}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  {["urgent","high","medium","low"].map((p) => (
                    <SelectItem key={p} value={p} className="technical-label text-[9px] uppercase tracking-widest">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">Deployment Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  {["backlog","todo","in_progress","in_review"].map((s) => (
                    <SelectItem key={s} value={s} className="technical-label text-[9px] uppercase tracking-widest">{s.replace("_"," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">Assigned Operator</Label>
              <Select value={watch("assignee_id") ?? ""} onValueChange={(v) => setValue("assignee_id", v)}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest">
                  <SelectValue placeholder="AUTO" />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="technical-label text-[9px] uppercase">{m.full_name ?? m.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">Operational Deadline</Label>
              <Input type="datetime-local" {...register("due_date")} className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase" />
            </div>
          </div>

          {clients.length > 0 && (
            <div className="space-y-2">
              <Label className="technical-label text-[9px] opacity-60 uppercase">Strategic Partner</Label>
              <Select value={watch("client_id") ?? ""} onValueChange={(v) => setValue("client_id", v)}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest">
                  <SelectValue placeholder="SYSTEM LEVEL" />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  {clients.map((c) => <SelectItem key={c.id} value={c.id} className="technical-label text-[9px] uppercase">{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleClose} className="h-10 rounded-sm technical-label text-[10px] hover:bg-accent/5">Abort</Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 rounded-sm bg-brand px-8 technical-label text-[10px] text-white">
              {isSubmitting && <Loader2 size={14} className="mr-2 animate-spin" />}
              Deploy Objective
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
