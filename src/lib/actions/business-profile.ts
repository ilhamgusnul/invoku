'use server'

import { createClient } from '@/lib/supabase/server'
import { businessProfileSchema } from '@/lib/validations/business-profile.schema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getBusinessProfiles() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getBusinessProfile(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  return data
}

export async function createBusinessProfile(formData: FormData, logoUrl?: string | null) {
  const data = Object.fromEntries(formData.entries())
  const parsed = businessProfileSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Check limit
  const maxProfiles = Number(process.env.MAX_BUSINESS_PROFILES_PER_USER) || 3
  const { count, error: countError } = await supabase
    .from('business_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (countError) return { success: false, error: countError.message }
  if (count && count >= maxProfiles) {
    return { success: false, error: `Anda telah mencapai batas maksimal profil bisnis (${maxProfiles})` }
  }

  const { error } = await supabase
    .from('business_profiles')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      default_currency: parsed.data.default_currency,
      invoice_prefix: parsed.data.invoice_prefix,
      bank_info: parsed.data.bank_info || null,
      logo_url: logoUrl || null,
      theme_color: parsed.data.theme_color
    })

  if (error) return { success: false, error: error.message }

  revalidatePath('/settings/business-profiles')
  redirect('/settings/business-profiles')
}

export async function updateBusinessProfile(id: string, formData: FormData, logoUrl?: string | null) {
  const data = Object.fromEntries(formData.entries())
  const parsed = businessProfileSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const updateData: any = {
    name: parsed.data.name,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
    default_currency: parsed.data.default_currency,
    invoice_prefix: parsed.data.invoice_prefix,
    bank_info: parsed.data.bank_info || null,
    theme_color: parsed.data.theme_color,
  }

  if (logoUrl !== undefined) {
    updateData.logo_url = logoUrl
  }

  const { error } = await supabase
    .from('business_profiles')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/settings/business-profiles')
  redirect('/settings/business-profiles')
}

export async function deleteBusinessProfile(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('business_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/settings/business-profiles')
  return { success: true }
}
