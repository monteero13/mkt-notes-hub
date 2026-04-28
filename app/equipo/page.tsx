'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTeam } from '@/hooks/use-team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  UserPlus, 
  Copy, 
  Check, 
  Users, 
  Shield, 
  Crown, 
  Loader2, 
  X, 
  UserMinus,
  Settings2,
  Trash2,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/DashboardLayout'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function EquipoPage() {
  const { t } = useTranslation();
  const { data: team, isLoading, refetch, error: teamQueryError } = useTeam()
  const { profile } = useAuth()
  const router = useRouter()
  const [newTeamName, setNewTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [copied, setCopied] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    })
  }, [])

  const currentMember = team?.members?.find((m: any) => m.user_id === currentUser?.id)
  const isLeader = currentMember?.role === 'owner'

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    setIsCreating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error(t('equipo.session_error', 'Sesión no encontrada. Por favor, reinicia sesión.'));
      }

      const response = await fetch('/api/create-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName, userId: userId })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || t('equipo.create_error', 'Error al crear equipo'));

      toast.success(t('equipo.create_success'));
      setNewTeamName('');
      await queryClient.invalidateQueries({ queryKey: ['team'] });
      await refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault()
    let code = joinCode.trim()
    if (!code) return
    
    // Si meten la URL entera, extraer el código
    if (code.includes('/join/')) {
       code = code.split('/join/').pop() || code;
    }

    router.push(`/join/${code}`)
  }

  const handleUpdateName = async () => {
    if (!editName.trim() || editName === team.name) {
      setIsEditingName(false)
      return
    }

    try {
      const { error } = await supabase.from('teams').update({ name: editName }).eq('id', team.id)
      if (error) throw error
      toast.success(t('equipo.update_success'))
      queryClient.invalidateQueries({ queryKey: ['team'] })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsEditingName(false)
    }
  }

  const handleKickMember = async (userId: string) => {
    if (userId === currentUser?.id) {
        toast.error(t('equipo.kick_self_error'));
        return;
    }
    if (!confirm(t('equipo.kick_confirm'))) return;

    try {
        const response = await fetch('/api/leave-team', {
            method: 'POST',
            body: JSON.stringify({ teamId: team.id, userId })
        });
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error);
        
        toast.success(t('equipo.kick_success'));
        queryClient.invalidateQueries({ queryKey: ['team'] });
    } catch (error: any) {
        toast.error(t('common.error') + ': ' + error.message);
    }
  }

  const handleLeaveTeam = async () => {
    if (!confirm(t('equipo.leave_confirm', '¿Estás seguro de que quieres abandonar el equipo?'))) return;

    try {
        const response = await fetch('/api/leave-team', {
            method: 'POST',
            body: JSON.stringify({ teamId: team.id, userId: currentUser?.id })
        });
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error);
        
        toast.success(t('equipo.leave_success', 'Has abandonado el equipo con éxito.'));
        queryClient.invalidateQueries({ queryKey: ['team'] });
        router.refresh();
    } catch (error: any) {
        toast.error(error.message);
    }
  }

  const handleDeleteTeam = async () => {
    if (!confirm(t('equipo.delete_confirm', '¿Estás seguro? Esta acción eliminará el equipo y a todos sus miembros permanentemente.'))) return;

    try {
        const { error } = await supabase.from('teams').delete().eq('id', team.id);
        if (error) throw error;
        toast.success(t('equipo.delete_success', 'Equipo eliminado correctamente.'));
        queryClient.invalidateQueries({ queryKey: ['team'] });
        router.refresh();
    } catch (error: any) {
        toast.error(error.message);
    }
  }

  const copyInviteLink = () => {
    const baseUrl = window.location.hostname === 'localhost' 
      ? window.location.origin 
      : 'https://mkt-notes-hub.vercel.app';
    const link = `${baseUrl}/join/${team.invite_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success(t('equipo.copy_success'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 relative min-h-[calc(100vh-12rem)]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-sm z-50 flex items-center justify-center min-h-[70vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          </div>
        )}
        
        <div className="flex items-center justify-between">
            <PageHeader 
                title={t('equipo.title')} 
                description={t('equipo.desc')} 
            />
            {team && isLeader && (
                <div className="flex gap-2">
                     {isEditingName ? (
                        <div className="flex gap-2 bg-card p-1.5 rounded-lg border border-border">
                            <Input 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)} 
                                className="h-8 w-48 bg-transparent border-none focus-visible:ring-0 text-sm font-medium" 
                                autoFocus
                            />
                            <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700" onClick={handleUpdateName}>Ok</Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setIsEditingName(false)}><X className="h-4 w-4" /></Button>
                        </div>
                     ) : (
                        <Button 
                            variant="outline" 
                            className="gap-2 font-bold" 
                            onClick={() => { setEditName(team.name); setIsEditingName(true); }}
                        >
                            <Settings2 className="h-4 w-4" />
                            {t('equipo.settings')}
                        </Button>
                     )}
                </div>
            )}
        </div>

        {!profile?.is_pro ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-xl bg-card/50 flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Crown className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Función PRO Exclusiva</h2>
            <p className="text-muted-foreground mb-8 text-sm max-w-sm">
              El trabajo en equipo y la colaboración están reservados para usuarios PRO. Actualiza tu plan para invitar colaboradores o unirte a otros equipos.
            </p>
            <Button className="bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform" onClick={() => window.location.href = 'mailto:albamuli05@gmail.com'}>
              Actualizar a PRO
            </Button>
          </div>
        ) : !team && !isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-card/50 flex flex-col items-center">
              <div className="h-12 w-12 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">{t('equipo.create_title')}</h2>
              <p className="text-muted-foreground mb-6 text-sm max-w-sm">{t('equipo.create_desc')}</p>
              <form onSubmit={handleCreateTeam} className="flex flex-col gap-3 w-full max-w-xs px-4">
                  <Input 
                      placeholder={t('equipo.name_placeholder')} 
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full text-center"
                  />
                  <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 font-bold w-full">
                      {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : t('equipo.create_btn')}
                  </Button>
              </form>
            </div>

            <div className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-card/50 flex flex-col items-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Unirse a un Equipo</h2>
              <p className="text-muted-foreground mb-6 text-sm max-w-sm">Introduce el código de invitación proporcionado por el administrador del equipo.</p>
              <form onSubmit={handleJoinTeam} className="flex flex-col gap-3 w-full max-w-xs px-4">
                  <Input 
                      placeholder="Código (ej. 524e93)" 
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="w-full text-center font-mono"
                  />
                  <Button type="submit" variant="outline" className="font-bold w-full">
                      Unirse
                  </Button>
              </form>
            </div>
          </div>
        ) : team && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Members List */}
            <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">{t('equipo.members')}</CardTitle>
                        <p className="text-sm text-muted-foreground">{team.members?.length || 0} {t('equipo.active_members')}</p>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {team.members?.map((member: any) => {
                        const name = member.profiles?.full_name || (member.user_id === currentUser?.id ? (currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0]) : t('equipo.member_fallback', 'Miembro'));
                        const isMe = member.user_id === currentUser?.id;
                        
                        return (
                            <div key={member.user_id} className="p-4 rounded-xl border border-border bg-background/50 hover:bg-muted/50 transition-colors relative group">
                               {member.role === 'owner' && (
                                 <div className="absolute top-4 right-4">
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                 </div>
                               )}
                               
                               <div className="flex items-center gap-4 mb-4">
                                 <Avatar className="h-12 w-12 border-2 border-background">
                                    <AvatarImage src={member.profiles?.avatar_url} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{name.charAt(0)}</AvatarFallback>
                                 </Avatar>
                                 <div className="min-w-0">
                                    <p className="font-bold text-sm truncate">{name} {isMe && t('equipo.you')}</p>
                                    <Badge variant="secondary" className={cn("mt-1 text-[10px]", member.role === 'owner' && "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20")}>
                                        {member.role === 'owner' ? t('equipo.role_owner') : t('equipo.role_member')}
                                    </Badge>
                                 </div>
                               </div>
                               
                               <div className="flex items-center justify-between pt-4 border-t border-border">
                                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                     <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                     {t('equipo.online')}
                                  </span>
                                  
                                  {isLeader && !isMe && (
                                     <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                                        onClick={() => handleKickMember(member.user_id)}
                                     >
                                        <UserMinus className="h-3 w-3 mr-1.5" />
                                        {t('equipo.kick')}
                                     </Button>
                                  )}
                               </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Invite Section (Leader only) */}
            <div className="space-y-6">
                {isLeader ? (
                    <div className="space-y-6">
                        <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-10">
                                <UserPlus className="h-32 w-32 text-blue-600" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-blue-600 dark:text-blue-400">{t('equipo.invite_title')}</CardTitle>
                                <p className="text-sm text-muted-foreground">{t('equipo.invite_desc')}</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <Input 
                                        readOnly 
                                        value={`${window.location.hostname === 'localhost' ? window.location.origin : 'https://mkt-notes-hub.vercel.app'}/join/${team.invite_code}`} 
                                        className="bg-background text-xs font-mono"
                                    />
                                    <Button onClick={copyInviteLink} className={cn("w-full gap-2", copied ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700")}>
                                        {copied ? <><Check className="h-4 w-4" /> {t('equipo.copied')}</> : <><Copy className="h-4 w-4" /> {t('equipo.copy_link')}</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-destructive/30 bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-destructive flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    {t('equipo.danger_zone', 'Zona de Peligro')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="destructive" className="w-full text-xs" onClick={handleDeleteTeam}>
                                    {t('equipo.delete_team', 'Eliminar Equipo')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Card className="border-border/50 bg-card/50">
                            <CardHeader>
                                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('equipo.role_collab')}</CardTitle>
                                <p className="text-sm text-muted-foreground">{t('equipo.role_collab_desc')}</p>
                            </CardHeader>
                        </Card>

                        <Card className="border-destructive/30 bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-destructive flex items-center gap-2">
                                    <LogOut className="h-4 w-4" />
                                    {t('equipo.leave_team_title', 'Abandonar Equipo')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="destructive" className="w-full text-xs" onClick={handleLeaveTeam}>
                                    {t('equipo.leave_team_btn', 'Salir del Equipo')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
