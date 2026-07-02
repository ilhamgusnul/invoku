import { getClients } from '@/lib/actions/client'
import { getActiveBusinessProfile } from '@/lib/actions/context'
import { ClientList } from '@/components/client/ClientList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Klien',
}

export default async function ClientsPage() {
  const activeProfileId = await getActiveBusinessProfile()
  
  // Jika tidak ada profil aktif, paksa buat profil bisnis dulu
  if (!activeProfileId) {
    redirect('/settings/business-profiles/new')
  }

  const clients = await getClients()

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-semibold text-[#1d1d1f] tracking-tight">Klien</h1>
          <p className="text-[17px] text-[#7a7a7a] mt-1">
            Kelola daftar klien Anda untuk mempercepat pembuatan invoice.
          </p>
        </div>
        <Link href="/clients/new">
          <Button className="rounded-full bg-primary-container hover:bg-primary px-6">
            Tambah Klien Baru
          </Button>
        </Link>
      </div>

      <ClientList clients={clients} />
    </div>
  )
}
