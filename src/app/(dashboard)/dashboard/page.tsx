import { getDashboardStats } from '@/lib/actions/dashboard'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { FileText, DollarSign, Clock, AlertCircle } from 'lucide-react'
import { ReviewBanner } from '@/components/dashboard/ReviewBanner'

export const metadata = {
  title: 'Dashboard - Invoku',
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      <ReviewBanner />
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">Ringkasan Bisnis</h1>
        <p className="text-[#7a7a7a] mt-1">Pantau arus kas dan tagihan terbaru Anda.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="p-6 border-[#e0e0e0]/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#7a7a7a]">Total Pendapatan</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
              {formatCurrency(stats.totalRevenue, 'IDR')}
            </span>
            <span className="text-xs text-[#7a7a7a]">Dari tagihan berstatus Lunas</span>
          </div>
        </Card>

        {/* Total Outstanding */}
        <Card className="p-6 border-[#e0e0e0]/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#7a7a7a]">Menunggu Pembayaran</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
              {formatCurrency(stats.totalOutstanding, 'IDR')}
            </span>
            <span className="text-xs text-[#7a7a7a]">Total tagihan yang sudah dikirim</span>
          </div>
        </Card>

        {/* Total Overdue */}
        <Card className="p-6 border-[#e0e0e0]/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#7a7a7a]">Jatuh Tempo</h3>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-red-600 tracking-tight">
              {formatCurrency(stats.totalOverdue, 'IDR')}
            </span>
            <span className="text-xs text-[#7a7a7a]">Melewati batas waktu pembayaran</span>
          </div>
        </Card>

        {/* Total Invoices */}
        <Card className="p-6 border-[#e0e0e0]/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#7a7a7a]">Total Tagihan</h3>
            <div className="p-2 bg-[#f5f5f7] rounded-lg">
              <FileText className="w-5 h-5 text-[#1d1d1f]" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
              {stats.totalInvoices}
            </span>
            <span className="text-xs text-[#7a7a7a]">Keseluruhan dokumen yang dibuat</span>
          </div>
        </Card>
      </div>

      {/* Recent Invoices Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1d1d1f]">Aktivitas Terbaru</h2>
          <Link href="/invoices" className="text-sm font-medium text-primary-container hover:underline">
            Lihat Semua Tagihan
          </Link>
        </div>

        <Card className="border-[#e0e0e0]/50 overflow-hidden shadow-sm">
          {stats.recentInvoices.length > 0 ? (
            <div className="divide-y divide-[#e0e0e0]/50">
              {stats.recentInvoices.map((invoice) => {
                // Determine Status Details
                let statusColor = "bg-[#f5f5f7] text-[#1d1d1f]"
                let statusText = "Draft"
                
                if (invoice.status === 'paid') {
                  statusColor = "bg-green-100 text-green-700"
                  statusText = "Lunas"
                } else if (invoice.status === 'sent') {
                  const isOverdue = new Date(invoice.due_date) < new Date(new Date().setHours(0,0,0,0))
                  if (isOverdue) {
                    statusColor = "bg-red-100 text-red-700"
                    statusText = "Jatuh Tempo"
                  } else {
                    statusColor = "bg-blue-100 text-blue-700"
                    statusText = "Dikirim"
                  }
                }

                // Calculate Total
                const subtotal = invoice.invoice_items.reduce((acc: number, item: { quantity: number; unit_price: number }) => acc + (item.quantity * item.unit_price), 0)
                const taxAmount = invoice.tax_percent ? subtotal * (invoice.tax_percent / 100) : 0
                let discountAmount = 0
                if (invoice.discount_type === 'percent') {
                  discountAmount = subtotal * (invoice.discount_value / 100)
                } else if (invoice.discount_type === 'flat') {
                  discountAmount = invoice.discount_value
                }
                const total = subtotal + taxAmount - discountAmount

                return (
                  <div key={invoice.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#fafafa] transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-[#7a7a7a]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1d1d1f]">{invoice.clients.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#7a7a7a] font-medium">{invoice.invoice_number}</span>
                          <span className="text-[10px] text-[#e0e0e0]">•</span>
                          <span className="text-xs text-[#7a7a7a]">Dibuat {new Date(invoice.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-6 ml-14 md:ml-0">
                      <div className="text-right flex flex-col">
                        <span className="font-bold text-[#1d1d1f]">{formatCurrency(total, invoice.currency)}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-[#c1c1c1]" />
              </div>
              <h3 className="text-[#1d1d1f] font-semibold mb-2">Belum ada aktivitas</h3>
              <p className="text-sm text-[#7a7a7a] max-w-sm mx-auto">
                Anda belum membuat tagihan apapun untuk profil bisnis ini. Buat tagihan pertama Anda sekarang!
              </p>
              <Link href="/invoices/new" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d1d1f] text-white text-sm font-medium hover:bg-black transition-colors">
                Buat Tagihan
              </Link>
            </div>
          )}
        </Card>
      </div>

    </div>
  )
}
