'use client';

import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { WorkspaceRole } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/use-workspace';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useRole } from '@/hooks/use-role';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  User,
  ChevronRight,
  ChevronDown,
  Check,
  Users,
  Shield,
  Crown,
  UserPlus,
  Copy,
  UserMinus,
  Building2,
  LogOut
} from 'lucide-react';
import { updateMemberRole, removeMember } from '@/actions/team';
import { deleteWorkspace, createWorkspace } from '@/actions/workspace';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ROLE_CONFIG: Record<WorkspaceRole, { labelKey: string; color: string }> = {
  owner: { labelKey: 'role_owner', color: 'text-warning' },
  admin: { labelKey: 'role_admin', color: 'text-brand' },
  manager: { labelKey: 'role_manager', color: 'text-brand' },
  editor: { labelKey: 'role_editor', color: 'text-muted-foreground' },
  viewer: { labelKey: 'role_viewer', color: 'text-muted-foreground/60' },
  client_guest: { labelKey: 'role_client_guest', color: 'text-muted-foreground/40' },
};

const ASSIGNABLE_ROLES: WorkspaceRole[] = ['admin', 'manager', 'editor', 'viewer', 'client_guest'];

function ChangeRoleDropdown({
  currentRole,
  userId,
  workspaceId,
}: {
  currentRole: WorkspaceRole;
  userId: string;
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const t = useTranslations('equipo');

  const handleChange = async (role: WorkspaceRole) => {
    if (role === currentRole) return;
    setLoading(true);
    const result = await updateMemberRole(workspaceId, userId, role);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('role_updated'));
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-7 rounded-sm bg-accent/5 border border-border px-2 text-xs font-medium text-foreground hover:bg-brand/10 hover:text-brand transition-all gap-1"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : (
            <>
              {t(ROLE_CONFIG[currentRole]?.labelKey ?? currentRole)}
              <ChevronDown size={9} className="opacity-60" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs">
        {ASSIGNABLE_ROLES.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleChange(role)}
            className={cn('text-xs', role === currentRole && 'text-brand')}
          >
            {t(ROLE_CONFIG[role].labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function EquipoPage() {
  const { activeWorkspace, members, invites, isLoading, workspaces, setActiveWorkspace, isPro } = useWorkspace();
  const { isOwner: roleIsOwner, isAdmin } = useRole();
  const isOwner = roleIsOwner || activeWorkspace?.role === 'owner';
  const { user: currentUser } = useAuth();
  const t = useTranslations('equipo');
  const router = useRouter();
  const supabase = createClient();

  const params = useParams();
  const locale = params?.locale || "es";

  const [newWsName, setNewWsName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const handleJoinWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoining(true);
    router.push(`/${locale}/join/${joinCode.trim()}`);
  };

  const queryClient = useQueryClient();

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    setIsDeleting(true);
    const result = await deleteWorkspace(activeWorkspace.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('delete_success') || "Workspace deleted");
      const otherWs = workspaces.find(w => w.id !== activeWorkspace.id);
      if (otherWs) {
        setActiveWorkspace(otherWs.id);
      }
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      router.refresh();
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setIsCreating(true);
    try {
      const result = await createWorkspace(newWsName);
      if (result.error) throw new Error(result.error);

      toast.success(t('create_success'));
      setNewWsName('');
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKickMember = async (userId: string) => {
    if (!activeWorkspace) return;
    const result = await removeMember(activeWorkspace.id, userId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('kick_success'));
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${activeWorkspace?.id.split('-')[0]}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success(t('copy_success'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        {/* Top Control Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-foreground">{t('management')}</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>{t('structure')}</span>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-brand">{t('governance')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-muted-foreground/60">{workspaces.length} {t('active_spaces')}</div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 rounded-sm bg-accent/5 border border-border px-4 text-xs font-medium text-foreground hover:bg-brand/10 hover:text-brand transition-all gap-2">
                  {t('change_space')}
                  <ChevronDown size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws.id);
                      router.refresh();
                    }}
                    className={cn(
                      "text-xs flex items-center justify-between",
                      activeWorkspace?.id === ws.id && "text-brand"
                    )}
                  >
                    {ws.name}
                    {activeWorkspace?.id === ws.id && <Check size={12} />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/onboarding" className="text-xs text-brand">
                    + {t('create_new')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand/40" />
              <span className="text-xs text-muted-foreground/60">{t('syncing')}</span>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="flex flex-col gap-1">
                <div className="technical-label text-brand">{t('members_title')}</div>
                <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t('title')}</h1>
              </div>

              {activeWorkspace ? (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {/* Members Hub */}
                  <div className="xl:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8">
                    <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-accent/5">
                        <div className="flex items-center gap-3">
                          <Users size={16} className="text-brand" />
                          <span className="text-sm font-semibold text-foreground">{t('active_members')} ({members.length})</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground/60">{t('verified')}</span>
                      </div>

                      <div className="divide-y divide-border">
                        {members.map((member: any) => {
                          const profile = member.profile;
                          const name = profile?.full_name || 'Usuario sin nombre';
                          const isMe = member.user_id === currentUser?.id;
                          const role = member.role as WorkspaceRole;
                          const roleConfig = ROLE_CONFIG[role] ?? { labelKey: role, color: 'text-muted-foreground' };

                          return (
                            <div key={member.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-accent/5 transition-all group">
                              <div className="flex items-center gap-4 sm:gap-6">
                                <Avatar className="h-12 w-12 rounded-full border border-border shadow-sm">
                                  <AvatarImage src={profile?.avatar_url} />
                                  <AvatarFallback className="bg-brand text-white text-base font-bold rounded-full">
                                    {name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <p className="font-medium text-base tracking-tight group-hover:text-brand transition-colors leading-none normal-case">{name}</p>
                                    {isMe && (
                                      <span className="text-xs font-semibold px-2 py-0.5 bg-brand text-white rounded-sm">{t('you')}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "flex items-center gap-1.5 text-xs font-semibold",
                                      roleConfig.color
                                    )}>
                                      {role === 'owner' ? <Crown size={10} /> : <Shield size={10} />}
                                      {t(roleConfig.labelKey)}
                                    </div>
                                    <span className="h-1 w-1 rounded-sm bg-border" />
                                    <span className="text-xs font-medium text-muted-foreground/60">
                                      {t('joined_at')} {new Date(member.joined_at ?? member.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isAdmin && !isMe && role !== 'owner' && (
                                  <ChangeRoleDropdown
                                    currentRole={role}
                                    userId={member.user_id}
                                    workspaceId={activeWorkspace.id}
                                  />
                                )}
                                {isAdmin && !isMe && role !== 'owner' && (
                                  <button
                                    className="p-2 text-muted-foreground/40 hover:text-error transition-colors"
                                    onClick={() => handleKickMember(member.user_id)}
                                  >
                                    <UserMinus size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pending Invites Hub */}
                    {invites.length > 0 && (
                      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-accent/5">
                          <div className="flex items-center gap-3">
                            <Users size={16} className="text-brand/60" />
                            <span className="text-sm font-semibold text-foreground">{t('pending_invites')} ({invites.length})</span>
                          </div>
                        </div>

                        <div className="divide-y divide-border">
                          {invites.map((invite: any) => (
                            <div key={invite.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-accent/5 transition-all group">
                              <div className="flex items-center gap-6">
                                <div className="h-10 w-10 rounded-sm border border-dashed border-border flex items-center justify-center bg-accent/5">
                                  <Users size={18} className="text-muted-foreground/30" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold tracking-tight leading-none">{invite.email}</p>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-brand/60">{invite.role}</span>
                                    <span className="h-1 w-1 rounded-sm bg-border" />
                                    <span className="text-xs font-medium text-muted-foreground/60">{t('pending')}</span>
                                  </div>
                                </div>
                              </div>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 rounded-sm text-xs text-error hover:bg-error/10 hover:text-error"
                                  onClick={async () => {
                                    const supabase = createClient();
                                    const { error } = await supabase.from('workspace_invites').update({ status: 'revoked' }).eq('id', invite.id);
                                    if (error) toast.error(error.message);
                                    else {
                                      toast.success("Invitación revocada");
                                      router.refresh();
                                    }
                                  }}
                                >
                                  {t('revoke')}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Danger Zone */}
                    {isOwner && (
                      <div className="border border-error/20 bg-error/5 p-4 sm:p-6 lg:p-8 rounded-xl flex items-center justify-between group">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-error">{t('delete_ws')}</div>
                          <p className="text-sm text-muted-foreground/60">{t('delete_desc') || "Permanently remove this workspace and all associated data."}</p>
                        </div>
                        <Button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="h-9 rounded-sm bg-error text-white text-xs font-medium px-6 hover:opacity-90"
                        >
                          {t('delete_ws')}
                        </Button>

                        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                          <AlertDialogContent className="rounded-xl border-border bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-sm font-semibold">{t('delete_confirm_title') || "Confirm Total Deletion"}</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-muted-foreground">
                                {t('delete_confirm_desc') || "This action is irreversible. All campaigns, clients and tasks associated with this workspace will be purged."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="h-10 rounded-sm text-xs">{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteWorkspace}
                                disabled={isDeleting}
                                className="h-10 rounded-sm bg-error text-white text-xs hover:bg-error/90"
                              >
                                {isDeleting && <Loader2 size={14} className="mr-2 animate-spin" />}
                                {t('confirm_delete') || "PURGE WORKSPACE"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>

                  {/* Strategic Actions */}
                  <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                    {isAdmin && (
                      <div className="border border-brand/20 bg-brand/5 p-4 sm:p-6 lg:p-8 rounded-xl relative overflow-hidden group">
                        <UserPlus className="absolute -right-8 -top-8 h-32 w-32 opacity-5 text-brand rotate-12 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative space-y-6">
                          <div className="space-y-1.5">
                            <h3 className="text-xs font-semibold text-brand">{t('invite_title')}</h3>
                            <p className="text-sm text-brand/60">{t('invite_desc')}</p>
                          </div>                           {!isPro && (members.length + invites.length >= 3) ? (
                            <div className="space-y-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                {locale === 'es' 
                                  ? 'Has alcanzado el límite de 3 miembros en el plan gratuito.' 
                                  : 'You have reached the limit of 3 members on the free plan.'}
                                <br />
                                <span className="opacity-80 text-[11px]">{t('pro_required')}</span>
                              </p>
                              <Button asChild className="w-full h-10 rounded-sm bg-brand text-white text-xs font-medium">
                                <Link href="/billing">{t('upgrade_pro')}</Link>
                              </Button>
                            </div>
                          ) : (
                          <div className="space-y-4">
                            {!isPro && (
                              <p className="text-[11px] font-semibold text-brand bg-brand/5 border border-brand/10 p-2 rounded-sm leading-snug">
                                {locale === 'es'
                                  ? `Plan Gratuito: ${members.length + invites.length}/3 miembros utilizados.`
                                  : `Free Plan: ${members.length + invites.length}/3 members used.`}
                              </p>
                            )}
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-muted-foreground/60 ml-1">{t('connection_code') || "CÓDIGO DE CONEXIÓN"}</label>
                              <div className="h-10 bg-muted/30 border border-brand/10 rounded-md flex items-center justify-between px-4 font-mono text-sm text-brand overflow-hidden group/code">
                                <span className="tracking-widest uppercase">{activeWorkspace?.id.split('-')[0]}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(activeWorkspace?.id.split('-')[0] || '');
                                    toast.success(t('code_copied') || "Código copiado");
                                  }}
                                  className="p-1 hover:text-white transition-colors"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-muted-foreground/60 ml-1">{t('invite_link') || "ENLACE DE INVITACIÓN"}</label>
                              <div className="h-10 bg-muted/30 border border-brand/10 rounded-md flex items-center px-4 font-mono text-xs text-brand/60 overflow-hidden truncate">
                                {`join/${activeWorkspace?.id.split('-')[0]}`}
                              </div>
                            </div>
                            <Button type="button" onClick={copyInviteLink} className={cn("w-full h-10 rounded-sm text-xs font-medium transition-all", copied ? "bg-success text-white" : "bg-brand text-white")}>
                              {copied ? <><Check size={14} className="mr-2" /> {t('copied')}</> : <><Copy size={14} className="mr-2" /> {t('copy_link')}</>}
                            </Button>
                          </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border border-border bg-card p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm space-y-4 sm:space-y-6">
                      <h3 className="text-xs font-semibold text-foreground">{t('create_new')}</h3>
                      <form onSubmit={handleCreateWorkspace} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground/60 ml-1">{t('space_name')}</label>
                          <Input
                            placeholder="Ej. Nueva Agencia..."
                            value={newWsName}
                            onChange={(e) => setNewWsName(e.target.value)}
                            className="h-10 border-border bg-card rounded-sm text-sm"
                          />
                        </div>
                        <Button type="submit" disabled={isCreating} className="w-full h-10 rounded-sm bg-accent/5 border border-border text-xs font-medium text-foreground hover:bg-brand/10 hover:text-brand transition-all">
                          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : t('create_btn')}
                        </Button>
                      </form>
                    </div>

                    <div className="border border-border bg-card p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm space-y-4 sm:space-y-6">
                      <h3 className="text-xs font-semibold text-foreground">{t('join_space')}</h3>
                      <p className="text-xs text-muted-foreground leading-snug">{t('join_desc')}</p>
                      <form onSubmit={handleJoinWorkspace} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground/60 ml-1">{t('connection_code')}</label>
                          <Input
                            placeholder={t('connection_code_placeholder')}
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="h-10 border-border bg-card rounded-sm text-sm uppercase"
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isJoining} className="w-full h-10 rounded-sm bg-accent/5 border border-border text-xs font-medium text-foreground hover:bg-brand/10 hover:text-brand transition-all">
                          {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : t('join_btn')}
                        </Button>
                      </form>
                    </div>

                    <Button
                      onClick={handleSignOut}
                      className="w-full h-10 rounded-sm bg-transparent border border-border text-xs font-medium text-muted-foreground/60 hover:text-error hover:border-error transition-all"
                    >
                      <LogOut size={14} className="mr-2" />
                      {t('sign_out')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-[40vh] border border-dashed border-border flex flex-col items-center justify-center rounded-xl bg-accent/5 gap-4">
                  <Building2 className="h-10 w-10 text-muted-foreground/30" />
                  <span className="text-xs font-medium text-muted-foreground/60">{t('no_connection')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
