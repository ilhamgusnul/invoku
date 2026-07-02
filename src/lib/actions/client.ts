'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations/client.schema'
import { getActiveBusinessProfile } from './context'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getClients() {
  const supabase = await createSupabaseClient()
  const activeProfileId = await getActiveBusinessProfile()
  
  if (!activeProfileId) return []

  // Ensure user owns this profile implicitly via RLS or explicit check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('id', activeProfileId)
    .eq('user_id', user.id)
    .single()

  if (!profile) return []

  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('business_profile_id', profile.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getClient(id: string) {
  const supabase = await createSupabaseClient()
  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) return null
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('clients')
    .select('*, business_profiles!inner(user_id)')
    .eq('id', id)
    .eq('business_profile_id', activeProfileId)
    .eq('business_profiles.user_id', user.id)
    .single()

  return data
}

export async function createClient(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = clientSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) return { success: false, error: 'Pilih profil bisnis terlebih dahulu' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Verify ownership
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('id', activeProfileId)
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profil bisnis tidak valid' }

  const { error } = await supabase
    .from('clients')
    .insert({
      business_profile_id: profile.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      preferred_currency: parsed.data.preferred_currency || null,
    })

  if (error) return { success: false, error: error.message }

  revalidatePath('/clients')
  redirect('/clients')
}

export async function updateClient(id: string, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = clientSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) return { success: false, error: 'Pilih profil bisnis terlebih dahulu' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('clients')
    .update({
      name: parsed.data.name,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      preferred_currency: parsed.data.preferred_currency || null,
    })
    .eq('id', id)
    .eq('business_profile_id', activeProfileId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/clients')
  redirect('/clients')
}

export async function deleteClient(id: string) {
  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) return { success: false, error: 'Pilih profil bisnis terlebih dahulu' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('business_profile_id', activeProfileId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/clients')
  return { success: true }
}
