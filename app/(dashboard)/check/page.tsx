import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkAccess } from '@/lib/stripe'
import type { UserSubscription } from '@/types'
import { CheckPageClient } from '@/components/CheckPageClient'

export default async function CheckPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: subData } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const sub = subData as UserSubscription | null
  const access = checkAccess(sub)

  return <CheckPageClient access={access} sub={sub} />
}
