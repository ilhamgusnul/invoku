'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

// Create a Supabase client with the Service Role key for Admin operations
function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function checkIsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) return false
  
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return adminEmails.includes(user.email)
}

export async function getPlatformStats() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const adminClient = getAdminClient()
  
  // Get total users from auth.users
  const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers()
  const totalUsers = usersData?.users?.length || 0

  // Get total business profiles
  const { count: profilesCount } = await adminClient
    .from('business_profiles')
    .select('*', { count: 'exact', head: true })

  // Get total invoices
  const { count: invoicesCount } = await adminClient
    .from('invoices')
    .select('*', { count: 'exact', head: true })

  return {
    totalUsers,
    totalProfiles: profilesCount || 0,
    totalInvoices: invoicesCount || 0,
  }
}

export async function listAllUsers() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const adminClient = getAdminClient()
  const { data, error } = await adminClient.auth.admin.listUsers()

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  // We can also fetch the profile counts for each user if needed, but for simplicity, just return user info.
  return data.users.map(user => ({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    // Add banned status if available in Supabase (we'll just use a mock field or check user metadata if we suspend them)
    banned_until: user.banned_until
  })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Suspend a user by updating their user_metadata or banning them via admin API
export async function toggleSuspendUser(userId: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const adminClient = getAdminClient()
  
  const { data: { user }, error: getError } = await adminClient.auth.admin.getUserById(userId)
  if (getError || !user) throw new Error('User not found')

  const isBanned = !!user.banned_until

  // Supabase ban user syntax: adminClient.auth.admin.updateUserById(userId, { ban_duration: '1000h' })
  // If banned, unban them. If not banned, ban them for 87600 hours (10 years)
  
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: isBanned ? 'none' : '876000h'
  })

  if (error) {
    throw new Error('Failed to update user status')
  }

  return true
}
