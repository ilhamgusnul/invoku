import { getClients } from '@/lib/actions/client'
import { getActiveBusinessProfile } from '@/lib/actions/context'
import { createClient } from '@/lib/supabase/server'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { redirect } from 'next/navigation'

export default async function NewInvoicePage() {
  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) redirect('/settings/business-profiles/new')

  const clients = await getClients()
  if (clients.length === 0) {
    // Force user to create client first
    redirect('/clients/new')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('invoice_prefix, default_currency, next_invoice_number')
    .eq('id', activeProfileId)
    .single()

  if (!profile) redirect('/settings/business-profiles/new')

  return (
    <div>
      <InvoiceForm clients={clients} profile={profile} />
    </div>
  )
}
