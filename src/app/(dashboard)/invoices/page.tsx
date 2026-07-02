import { getInvoices } from '@/lib/actions/invoice'
import { getActiveBusinessProfile } from '@/lib/actions/context'
import { InvoiceList } from '@/components/invoice/InvoiceList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import { ExportCsvButton } from '@/components/dashboard/ExportCsvButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invoices',
}

export default async function InvoicesPage() {
  const activeProfileId = await getActiveBusinessProfile()
  
  if (!activeProfileId) {
    redirect('/settings/business-profiles/new')
  }

  const invoices = await getInvoices()

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-semibold text-[#1d1d1f] tracking-tight">Invoice</h1>
          <p className="text-[17px] text-[#7a7a7a] mt-1">
            Kelola semua tagihan untuk bisnis Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportCsvButton invoices={invoices} />
          <Link href="/invoices/new">
            <Button className="rounded-full bg-primary-container hover:bg-primary px-6">
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Invoice Baru
            </Button>
          </Link>
        </div>
      </div>

      <InvoiceList invoices={invoices} />
    </div>
  )
}
