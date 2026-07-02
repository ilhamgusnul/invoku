'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  created_at: string
  due_date: string
  status: string
  currency: string
  clients: { name: string }
  invoice_items: any[]
  tax_percent?: number
  discount_type?: string
  discount_value?: number
}

interface Props {
  invoices: Invoice[]
}

export function ExportCsvButton({ invoices }: Props) {
  const handleExport = () => {
    // 1. Define CSV Headers
    const headers = ['Nomor Invoice', 'Klien', 'Tanggal Dibuat', 'Jatuh Tempo', 'Status', 'Total Tagihan', 'Mata Uang']

    // 2. Map data to rows
    const rows = invoices.map(invoice => {
      // Calculate Total
      const subtotal = invoice.invoice_items?.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price), 0) || 0
      const taxAmount = invoice.tax_percent ? subtotal * (invoice.tax_percent / 100) : 0
      let discountAmount = 0
      if (invoice.discount_type === 'percent') {
        discountAmount = subtotal * ((invoice.discount_value || 0) / 100)
      } else if (invoice.discount_type === 'flat') {
        discountAmount = invoice.discount_value || 0
      }
      const total = subtotal + taxAmount - discountAmount

      // Determine precise status
      let statusText = 'Draft'
      if (invoice.status === 'paid') {
        statusText = 'Lunas'
      } else if (invoice.status === 'sent') {
        const isOverdue = new Date(invoice.due_date) < new Date(new Date().setHours(0,0,0,0))
        statusText = isOverdue ? 'Jatuh Tempo' : 'Dikirim'
      }

      return [
        invoice.invoice_number,
        `"${invoice.clients?.name || '-'}"`, // Escaped for CSV if contains comma
        new Date(invoice.created_at).toLocaleDateString('id-ID'),
        new Date(invoice.due_date).toLocaleDateString('id-ID'),
        statusText,
        total,
        invoice.currency
      ]
    })

    // 3. Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // 4. Create Blob and Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_Invoku_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      className="bg-white border-[#e0e0e0] text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl shadow-sm"
      disabled={invoices.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}
