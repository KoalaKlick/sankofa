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
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  )
}