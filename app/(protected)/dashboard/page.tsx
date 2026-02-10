import { createClient } from '@/utils/supabase/server'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="bg-muted rounded-lg p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">User Details</h2>
        <pre className="text-sm overflow-auto whitespace-pre-wrap">
          {/* {JSON.stringify(user, null, 2)} */}
          {user?.user_metadata.full_name}, wo pre o, me ne wo b3y3 adwuma pa ama AfroTix. Y3b3tumi aboa w3n ma AfroTix ay3 k3se. Y3da wo ase!
        </pre>
        <img src={user?.user_metadata.avatar_url} alt=""  className='rounded-full size-20'/>
      </div>
    </div>
  )
}