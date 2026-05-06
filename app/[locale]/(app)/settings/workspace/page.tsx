'use client';

import { useState } from 'react';
import { useWorkspace } from '@/hooks/use-workspace';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  Loader2,
  Save,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function WorkspaceSettingsPage() {
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const { profile, isLoading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isLoading = workspaceLoading || authLoading;

  // Sync name when workspace loads
  useState(() => {
    if (activeWorkspace) setName(activeWorkspace.name);
  });

  const isOwner = activeWorkspace?.role === 'owner';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ name })
        .eq('id', activeWorkspace.id);

      if (error) throw error;
      toast.success("Workspace updated successfully");
      await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeWorkspace || !isOwner) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', activeWorkspace.id);

      if (error) throw error;
      
      toast.success("Workspace deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand opacity-20" />
      </div>
    );
  }

  if (!activeWorkspace) return null;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Operational Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="technical-label text-[11px] text-foreground">Operational Node</div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Settings</span>
            <ChevronRight size={12} className="opacity-30" />
            <span className="text-brand">Workspace Config</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
          <div className="flex flex-col gap-1">
            <div className="technical-label text-brand">Workspace Identity</div>
            <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>Terminal Settings</h1>
          </div>

          {/* General Settings */}
          <div className="border border-border bg-card rounded-sm shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-accent/5">
              <span className="technical-label text-foreground flex items-center gap-2">
                <Building2 size={14} className="text-brand" />
                Core Information
              </span>
            </div>
            <form onSubmit={handleUpdate} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
              <div className="space-y-1.5">
                <label className="technical-label text-[8px] opacity-40 ml-1 uppercase">Workspace Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={activeWorkspace.name}
                  className="h-10 border-border bg-card rounded-sm text-[11px] font-bold uppercase tracking-wider"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || !isOwner} className="h-9 rounded-sm bg-brand text-white technical-label text-[10px] px-6">
                  {isSaving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                  Update Core
                </Button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          {isOwner && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-destructive" />
                <span className="technical-label text-destructive text-[10px] uppercase tracking-widest font-black">Danger Zone</span>
              </div>
              
              <div className="border border-destructive/20 bg-destructive/5 rounded-sm p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-[13px] font-black uppercase tracking-tight text-destructive">Terminate Workspace</h3>
                  <p className="text-[11px] font-bold text-muted-foreground/60 leading-normal max-w-md">
                    This action is irreversible. All clients, campaigns, content, and data associated with this workspace will be purged from the neural network.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="h-10 rounded-sm technical-label text-[9px] px-8 bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/10">
                      <Trash2 size={14} className="mr-2" />
                      Execute Termination
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border rounded-sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">Confirm Termination</AlertDialogTitle>
                      <AlertDialogDescription className="text-[12px] font-medium text-muted-foreground leading-relaxed">
                        Are you absolutely sure? This will permanently delete the workspace <strong>{activeWorkspace.name}</strong> and all its associated intelligence. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="h-10 rounded-sm border-border technical-label text-[10px]">Abort</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="h-10 rounded-sm bg-destructive text-white technical-label text-[10px] hover:bg-destructive/90"
                      >
                        {isDeleting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Trash2 size={14} className="mr-2" />}
                        Confirm Purge
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
