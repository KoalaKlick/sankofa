'use client'

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { signOut } = useAuth()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  const onSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="bg-muted rounded-lg p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">User Details</h2>
        <pre className="text-sm overflow-auto whitespace-pre-wrap">
          {JSON.stringify(user, null, 2)}
          {user?.user_metadata.full_name}, wo pre o, me ne wo b3y3 adwuma pa ama AfroTix. Y3b3tumi aboa w3n ma AfroTix ay3 k3se. Y3da wo ase!
        </pre>
        <Button className="" onClick={onSignOut}>
          <img src={user?.user_metadata.avatar_url} alt="" className='rounded-full size-6' />
          sign out
        </Button>
      </div>
    </div>
  )
}