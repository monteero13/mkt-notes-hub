'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function JoinTeamPage() {
  const params = useParams()
  const router = useRouter()
  const [team, setTeam] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTeam() {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', params.code)
        .single()

      if (error || !data) {
        toast.error('Enlace de invitación no válido')
        router.push('/dashboard')
      } else {
        setTeam(data)
      }
      setIsLoading(false)
    }

    if (params.code) fetchTeam()
  }, [params.code, router, supabase])

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?next=/join/${params.code}`)
        return
      }

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'member'
        })

      if (error) {
        if (error.code === '23505') {
          toast.info('Ya eres miembro de este equipo')
        } else {
          throw error
        }
      } else {
        toast.success(`Te has unido a ${team.name}`)
      }
      
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Invitación a equipo</CardTitle>
          <CardDescription>
            Has sido invitado a unirte al equipo <span className="font-bold text-foreground">{team?.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" size="lg" onClick={handleJoin} disabled={isJoining}>
            {isJoining ? 'Uniéndote...' : 'Aceptar invitación'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => router.push('/dashboard')}>
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
