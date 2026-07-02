'use client'

import { useTransition } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { deleteClient } from '@/lib/actions/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'
import { Users, Mail, MapPin } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string | null
  address: string | null
  preferred_currency: string | null
}

interface Props {
  clients: Client[]
}

export function ClientList({ clients }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteClient(id)
    })
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#d2d2d7]">
        <div className="w-12 h-12 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-6 h-6 text-[#7a7a7a]" />
        </div>
        <h3 className="text-lg font-medium text-[#1d1d1f]">Belum ada Klien</h3>
        <p className="text-sm text-[#86868b] mt-1 mb-6">Tambahkan klien pertama Anda untuk profil bisnis ini.</p>
        <Link href="/clients/new">
          <Button className="rounded-full bg-[#0066cc] hover:bg-[#0071e3]">
            Tambah Klien
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client) => (
        <Card key={client.id} className="shadow-sm border-[#e0e0e0] hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-[17px] font-semibold text-[#1d1d1f] truncate">
              {client.name}
            </CardTitle>
            <CardDescription className="text-[13px] text-[#7a7a7a]">
              {client.preferred_currency ? `Mata Uang Khusus: ${client.preferred_currency}` : 'Mata Uang Default'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-[13px] text-[#1d1d1f]">
              <Mail className="w-4 h-4 mr-3 text-[#7a7a7a] flex-shrink-0" />
              <span className="truncate">{client.email || '-'}</span>
            </div>
            <div className="flex items-start text-[13px] text-[#1d1d1f]">
              <MapPin className="w-4 h-4 mr-3 text-[#7a7a7a] flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{client.address || '-'}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-[#e0e0e0] pt-4 bg-[#fafafa] rounded-b-xl">
            <Link href={`/clients/${client.id}`}>
              <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger className={buttonVariants({ variant: "destructive", size: "sm", className: "rounded-full" })} disabled={isPending}>
                Hapus
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Klien?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Klien ini akan dihapus secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(client.id)} className="rounded-full bg-red-600 hover:bg-red-700">
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
