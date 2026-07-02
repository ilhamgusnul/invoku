'use client'

import { useTransition } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { deleteInvoice } from '@/lib/actions/invoice'
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
import { FileText, Calendar, ExternalLink } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  status: string
  issue_date: string
  due_date: string
  currency: string
  clients?: {
    name: string
    email: string | null
  }
}

interface Props {
  invoices: Invoice[]
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
}

export function InvoiceList({ invoices }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteInvoice(id)
    })
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#d2d2d7]">
        <div className="w-12 h-12 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-[#7a7a7a]" />
        </div>
        <h3 className="text-lg font-medium text-[#1d1d1f]">Belum ada Invoice</h3>
        <p className="text-sm text-[#86868b] mt-1 mb-6">Buat tagihan pertama Anda untuk klien ini.</p>
        <Link href="/invoices/new">
          <Button className="rounded-full bg-[#0066cc] hover:bg-[#0071e3]">
            Buat Invoice Baru
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {invoices.map((invoice) => (
        <Card key={invoice.id} className="shadow-sm border-[#e0e0e0] hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-[17px] font-semibold text-[#1d1d1f]">
                  {invoice.invoice_number}
                </CardTitle>
                <CardDescription className="text-[13px] text-[#7a7a7a] mt-1">
                  Klien: <span className="font-medium text-[#1d1d1f]">{invoice.clients?.name || 'Unknown'}</span>
                </CardDescription>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${statusColors[invoice.status] || 'bg-gray-100'}`}>
                {invoice.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            <div className="flex items-center text-[13px] text-[#7a7a7a]">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Dikeluarkan: {new Date(invoice.issue_date).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex items-center text-[13px] text-[#7a7a7a]">
              <Calendar className="w-4 h-4 mr-2 text-red-400" />
              <span>Jatuh Tempo: {new Date(invoice.due_date).toLocaleDateString('id-ID')}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-[#e0e0e0] pt-4 bg-[#fafafa] rounded-b-xl gap-2 flex-wrap">
            <div className="flex gap-2">
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Button variant="outline" size="sm" className="rounded-full h-8">Edit</Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                onClick={() => {
                  const url = `${window.location.origin}/public/invoice/${invoice.id}`
                  navigator.clipboard.writeText(url)
                  alert('Link publik berhasil disalin!')
                }}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Salin Link
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger className={buttonVariants({ variant: "ghost", size: "sm", className: "rounded-full h-8 text-red-600 hover:text-red-700 hover:bg-red-50" })} disabled={isPending}>
                Hapus
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Menghapus invoice juga akan menghapus semua rincian item di dalamnya.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(invoice.id)} className="rounded-full bg-red-600 hover:bg-red-700">
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
