import { getInvoice } from '@/lib/actions/invoice'
import { getClients } from '@/lib/actions/client'
import { getActiveBusinessProfile } from '@/lib/actions/context'
import { createClient } from '@/lib/supabase/server'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { notFound, redirect } from 'next/navigation'

export default async function EditInvoicePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  
  const activeProfileId = await getActiveBusinessProfile()
  if (!activeProfileId) redirect('/settings/business-profiles/new')

  const invoice = await getInvoice(id)
  if (!invoice) notFound()

  const clients = await getClients()
  
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('invoice_prefix, default_currency, next_invoice_number')
    .eq('id', activeProfileId)
    .single()

  if (!profile) redirect('/settings/business-profiles/new')

  return (
    <div>
      <InvoiceForm initialData={invoice} clients={clients} profile={profile} />
    </div>
  )
}
