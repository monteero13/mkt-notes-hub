'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTeam } from '@/hooks/use-team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Copy, Check, Users, Shield, Plus, Edit2, Crown, User, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function EquipoPage() {
  const { data: team, isLoading, refetch, error: teamQueryError } = useTeam()
  const [newTeamName, setNewTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [copied, setCopied] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('Usuario cargado en EquipoPage:', user?.id);
      setCurrentUser(user);
    })
  }, [])

  const currentMember = team?.members?.find((m: any) => m.user_id === currentUser?.id)
  const isLeader = currentMember?.role === 'owner'

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    setIsCreating(true)
    console.log('Intentando fundar equipo:', newTeamName);
    
    try {
      // Intentamos sacar el ID de la sesión actual directamente
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error('Sesión no encontrada. Por favor, reinicia sesión.');
      }

      console.log('Llamando a API con userId:', userId);
      const response = await fetch('/api/create-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newTeamName, 
          userId: userId 
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error del servidor al crear equipo');
      }

      console.log('Éxito total:', result);
      toast.success('¡Equipo fundado correctamente!');
      setNewTeamName('');
      
      // Forzamos actualización pesada por si el cache de React Query es lento
      await queryClient.invalidateQueries({ queryKey: ['team'] });
      await refetch();
      
    } catch (error: any) {
      console.error('FALLO EN FUNDACIÓN:', error);
      toast.error(error.message);
    } finally {
      setIsCreating(false)
    }
  }

  // Resto de funciones (handleUpdateName, handlePromote, copyInviteLink) iguales...
  const handleUpdateName = async () => {
    if (!editName.trim() || editName === team.name) {
      setIsEditingName(false)
      return
    }

    try {
      const { error } = await supabase.from('teams').update({ name: editName }).eq('id', team.id)
      if (error) throw error
      toast.success('Nombre actualizado')
      queryClient.invalidateQueries({ queryKey: ['team'] })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsEditingName(false)
    }
  }

  const handlePromote = async (userId: string) => {
    try {
      const { error } = await supabase.from('team_members').update({ role: 'owner' }).eq('team_id', team.id).eq('user_id', userId)
      if (error) throw error
      toast.success('Miembro ascendido a Líder')
      queryClient.invalidateQueries({ queryKey: ['team'] })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const copyInviteLink = () => {
    const baseUrl = window.location.hostname === 'localhost' 
      ? window.location.origin 
      : 'https://mkt-notes-hub.vercel.app';
    const link = `${baseUrl}/join/${team.invite_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Enlace copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto py-8 px-4">
        {teamQueryError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-destructive/20">
            <AlertCircle className="h-5 w-5" />
            Error al conectar con el equipo. Revisa tu conexión.
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               {isEditingName ? (
                 <div className="flex gap-2">
                   <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10 w-full md:w-64" autoFocus />
                   <Button size="sm" onClick={handleUpdateName}>Guardar</Button>
                   <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>Cancelar</Button>
                 </div>
               ) : (
                 <>
                   <h1 className="text-3xl md:text-5xl font-heading font-black text-foreground tracking-tight uppercase">
                    {team?.name || 'Gestión de Equipo'}
                   </h1>
                   {team && isLeader && (
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" onClick={() => { setEditName(team.name); setIsEditingName(true); }}>
                       <Edit2 className="h-4 w-4" />
                     </Button>
                   )}
                 </>
               )}
            </div>
            <p className="text-muted-foreground text-base md:text-lg">Toda tu organización y colaboradores en un solo lugar.</p>
          </div>
        </div>

        {!team ? (
          <Card className="border-border/50 border-2 bg-muted/30 p-8 md:p-16 text-center shadow-xl shadow-black/5 rounded-[2rem]">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-heading font-bold mb-4 uppercase">Funda tu Organización</h2>
              <p className="max-w-md mx-auto text-muted-foreground mb-10 text-sm md:text-base leading-relaxed">
                Crea un espacio compartido para colaborar con otros expertos de marketing y potenciar tus resultados.
              </p>
              <form onSubmit={handleCreateTeam} className="flex flex-col md:flex-row gap-3 w-full max-w-md">
                <Input 
                  placeholder="Escribe el nombre de tu equipo" 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-background shadow-md rounded-2xl h-14 px-6 border-border/60 focus:ring-primary/20 transition-all"
                />
                <Button type="submit" disabled={isCreating} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : 'Fundar Equipo'}
                </Button>
              </form>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] overflow-hidden border shadow-lg">
                <CardHeader className="border-b border-border/40 pb-6 pt-8 px-8 flex flex-row items-center justify-between bg-muted/20">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-heading font-bold uppercase flex items-center gap-3">
                      <Users className="h-6 w-6 text-primary" />
                      Colaboradores
                    </CardTitle>
                    <CardDescription>Usuarios con acceso compartido al equipo.</CardDescription>
                  </div>
                  <div className="bg-primary text-white border-none px-3 py-1 text-xs rounded-full font-bold">
                    {team.members?.length || 0} MIEMBROS
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/30">
                    {team.members?.map((member: any) => (
                      <div key={member.user_id} className="group flex items-center justify-between py-6 px-8 hover:bg-primary/[0.02] transition-colors">
                        <div className="flex items-center gap-5">
                          <Avatar className="h-14 w-14 border-2 border-border/50 ring-4 ring-transparent group-hover:ring-primary/10 transition-all duration-500">
                            <AvatarImage src={member.profiles?.avatar_url || (member.user_id === currentUser?.id ? currentUser?.user_metadata?.avatar_url : null)} />
                            <AvatarFallback className="bg-primary/5 text-primary text-lg font-black italic">
                              {(member.profiles?.full_name || (member.user_id === currentUser?.id ? currentUser?.user_metadata?.full_name : null) || 'U').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-base tracking-tight">
                                  {member.profiles?.full_name || (member.user_id === currentUser?.id ? (currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0]) : 'Nuevo Miembro')}
                                </p>
                                {member.user_id === currentUser?.id && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Tú</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                              {member.role === 'owner' ? (
                                <span className="text-secondary/80 flex items-center gap-1"><Crown className="h-3 w-3" /> LÍDER</span>
                              ) : (
                                <span className="text-muted-foreground/80 flex items-center gap-1"><User className="h-3 w-3" /> COLABORADOR</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isLeader && member.role !== 'owner' && (
                          <Button variant="outline" size="sm" className="bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest transition-all" onClick={() => handlePromote(member.user_id)} >
                            Hacer Líder
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5 rounded-[1.5rem] overflow-hidden shadow-xl shadow-primary/5">
                <CardHeader className="bg-primary/10 border-b border-primary/10 py-6">
                  <CardTitle className="text-base font-heading font-bold uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Expandir Equipo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-8 pb-8">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Comparte este enlace con tus colaboradores para que se unan a <strong>{team.name}</strong>.
                  </p>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Enlace de acceso compartido</label>
                    <div className="flex gap-2 p-2 bg-background/50 rounded-2xl border border-primary/10 backdrop-blur-sm group focus-within:border-primary/30 transition-colors">
                      <Input 
                        readOnly 
                        value={`${window.location.hostname === 'localhost' ? window.location.origin : 'https://mkt-notes-hub.vercel.app'}/join/${team.invite_code}`} 
                        className="bg-transparent border-none font-mono text-[11px] focus-visible:ring-0 h-10 px-3 w-full"
                      />
                      <Button variant={copied ? "default" : "secondary"} size="icon" onClick={copyInviteLink} className="h-10 w-10 shrink-0 rounded-xl transition-transform active:scale-90">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
