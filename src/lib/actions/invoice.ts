'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClientJs } from '@supabase/supabase-js'
import { invoiceSchema, type InvoiceInput } from '@/lib/validations/invoice.schema'
import { getActiveBusinessProfile } from './context'
import { revalidatePath } from 'next/cache'

export async function getPublicInvoice(id: string) {
  const supabase = createSupabaseClientJs(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (name, address, email),
      business_profiles (name, email, address, logo_url, bank_info),
      invoice_items (*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  
  data.invoice_items.sort((a: any, b: any) => a.sort_order - b.sort_order)
  return data
}

export async function getInvoices() {
  const supabase = await createSupabaseClient()
  const activeProfileId = await getActiveBusinessProfile()
  
  if (!activeProfileId) return []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (name, email)
    `)
    .eq('business_profile_id', activeProfileId)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getInvoice(id: string) {
  const supabase = await createSupabaseClient()
  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) return null
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Ensure owner
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('id', activeProfileId)
    .eq('user_id', user.id)
    .single()

  if (!profile) return null

  const { data } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (id, name, address, email),
      invoice_items (*)
    `)
    .eq('id', id)
    .eq('business_profile_id', profile.id)
    .single()

  if (data) {
    // Sort invoice items
    data.invoice_items.sort((a: any, b: any) => a.sort_order - b.sort_order)
  }

  return data
}

export async function createInvoice(data: InvoiceInput) {
  const parsed = invoiceSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) return { success: false, error: 'Pilih profil bisnis terlebih dahulu' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Verify ownership of business profile
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('id, next_invoice_number')
    .eq('id', activeProfileId)
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profil bisnis tidak valid' }

  // Verify client belongs to this profile
  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('id', parsed.data.client_id)
    .eq('business_profile_id', profile.id)
    .single()

  if (!clientData) return { success: false, error: 'Klien tidak valid' }

  const dbDiscountType = parsed.data.discount_type === 'none' ? null : parsed.data.discount_type
  const dbDiscountValue = parsed.data.discount_type === 'none' ? null : parsed.data.discount_value

  // Insert Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      business_profile_id: profile.id,
      client_id: parsed.data.client_id,
      invoice_number: parsed.data.invoice_number,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      currency: parsed.data.currency,
      tax_percent: parsed.data.tax_percent || null,
      discount_type: dbDiscountType,
      discount_value: dbDiscountValue,
      notes: parsed.data.notes || null,
      bank_info: parsed.data.bank_info || null,
      status: parsed.data.status,
    })
    .select('id')
    .single()

  if (invoiceError) return { success: false, error: invoiceError.message }

  // Insert Items
  const itemsToInsert = parsed.data.items.map((item, index) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    sort_order: index,
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsToInsert)

  if (itemsError) {
    // Manual rollback best-effort
    await supabase.from('invoices').delete().eq('id', invoice.id)
    return { success: false, error: `Gagal menyimpan item: ${itemsError.message}` }
  }

  // Update next_invoice_number in business_profile (best-effort)
  // If the invoice number matches the expected pattern, we could increment it.
  // For simplicity, let's just increment it regardless.
  await supabase
    .from('business_profiles')
    .update({ next_invoice_number: profile.next_invoice_number + 1 })
    .eq('id', profile.id)

  revalidatePath('/invoices')
  return { success: true, id: invoice.id }
}

export async function updateInvoice(id: string, data: InvoiceInput) {
  const parsed = invoiceSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) return { success: false, error: 'Pilih profil bisnis' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Update Invoice
  const dbDiscountType = parsed.data.discount_type === 'none' ? null : parsed.data.discount_type
  const dbDiscountValue = parsed.data.discount_type === 'none' ? null : parsed.data.discount_value

  const { error: invoiceError } = await supabase
    .from('invoices')
    .update({
      client_id: parsed.data.client_id,
      invoice_number: parsed.data.invoice_number,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      currency: parsed.data.currency,
      tax_percent: parsed.data.tax_percent || null,
      discount_type: dbDiscountType,
      discount_value: dbDiscountValue,
      notes: parsed.data.notes || null,
      bank_info: parsed.data.bank_info || null,
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('business_profile_id', activeProfileId)

  if (invoiceError) return { success: false, error: invoiceError.message }

  // Replace all items
  await supabase.from('invoice_items').delete().eq('invoice_id', id)

  const itemsToInsert = parsed.data.items.map((item, index) => ({
    invoice_id: id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    sort_order: index,
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsToInsert)

  if (itemsError) {
    return { success: false, error: `Invoice terupdate tapi gagal menyimpan item: ${itemsError.message}` }
  }

  revalidatePath('/invoices')
  return { success: true, id }
}

export async function deleteInvoice(id: string) {
  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) return { success: false, error: 'Pilih profil bisnis terlebih dahulu' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('business_profile_id', activeProfileId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/invoices')
  return { success: true }
}
