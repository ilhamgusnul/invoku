import { getPublicInvoice } from '@/lib/actions/invoice'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const PrintButton = dynamic(() => import('@/components/invoice/PrintButton').then(mod => mod.PrintButton), { ssr: false })

import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const invoice = await getPublicInvoice(id)
  
  if (!invoice) {
    return {
      title: 'Invoice Tidak Ditemukan',
    }
  }

  return {
    title: `Invoice ${invoice.invoice_number} - ${invoice.clients?.name || 'Klien'}`,
  }
}

const statusBadgeStyles: Record<string, string> = {
  draft: 'bg-gray-50 text-gray-700 border-gray-100',
  sent: 'bg-blue-50 text-blue-700 border-blue-100',
  paid: 'bg-green-50 text-green-700 border-green-100',
}

const statusText: Record<string, string> = {
  draft: 'DRAFT',
  sent: 'MENUNGGU PEMBAYARAN',
  paid: 'LUNAS',
}

type InvoiceItem = {
  id: string
  description: string
  quantity: number
  unit_price: number
}

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getPublicInvoice(id)

  if (!invoice) {
    notFound()
  }

  const { business_profiles: profile, clients: client, invoice_items: items } = invoice

  const displayBankInfo = invoice.bank_info || profile.bank_info

  const subtotal = items.reduce((acc: number, item: InvoiceItem) => acc + (item.quantity * item.unit_price), 0)
  const taxAmount = invoice.tax_percent ? subtotal * (invoice.tax_percent / 100) : 0
  
  let discountAmount = 0
  if (invoice.discount_type === 'percent') {
    discountAmount = subtotal * (invoice.discount_value / 100)
  } else if (invoice.discount_type === 'flat') {
    discountAmount = invoice.discount_value
  }

  const total = subtotal + taxAmount - discountAmount

  const themeColor = profile.theme_color || '#0066cc'

  return (
    <div 
      className="antialiased text-[#1d1d1f] font-sans bg-[#f5f5f7] print:bg-white min-h-screen"
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      {/* Floating Action Button (External to Paper) */}
      <div className="fixed top-8 right-8 z-50 no-print print:hidden">
        <PrintButton />
      </div>

      {/* Main Content Canvas */}
      <main className="py-12 px-4 md:px-8 print:p-0">
        {/* Paper Container */}
        <div className="max-w-[850px] mx-auto bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#e0e0e0] print:shadow-none print:border-none print:bg-white overflow-hidden transition-all duration-300 print:max-w-none print:w-full print:m-0 print:rounded-none">
          
          {/* Invoice Header Section */}
          <div className="relative p-10 md:p-16 print:p-8 border-b border-[#f5f5f7]">
            <div className="flex justify-between items-start">
              
              {/* Left: Company Branding */}
              <div className="flex flex-col gap-4">
                {profile.logo_url ? (
                  <div className="relative w-32 h-16">
                    <Image src={profile.logo_url} alt={profile.name} fill className="object-contain object-left" />
                  </div>
                ) : (
                  <div className="text-[28px] font-extrabold tracking-tighter text-[#1d1d1f]">
                    {profile.name}<span className="text-(--theme-color)">.</span>
                  </div>
                )}
                
                <div className="text-[#7a7a7a] text-[13px] leading-relaxed max-w-[240px] whitespace-pre-wrap">
                  {profile.address && <p>{profile.address}</p>}
                  {profile.email && <p className="mt-1">{profile.email}</p>}
                </div>
              </div>

              {/* Right: Watermark & Meta Info */}
              <div className="text-right">
                <h1 className="text-[64px] font-black text-[#e0e0e0] opacity-40 leading-none select-none -mr-4 mb-8 print:mb-4">INVOICE</h1>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-right">
                  <div>
                    <span className="block text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider">No. Invoice</span>
                    <span className="font-medium text-[14px]">{invoice.invoice_number}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider">Tanggal Terbit</span>
                    <span className="font-medium text-[14px]">{new Date(invoice.issue_date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="col-start-2">
                    <span className="block text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider">Jatuh Tempo</span>
                    <span className="font-medium text-[14px]">{new Date(invoice.due_date).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info Section */}
          <div className="p-10 md:px-16 md:py-10 print:px-8 print:py-6 flex flex-col md:flex-row justify-between gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#7a7a7a] uppercase tracking-widest">Tagihan Kepada</span>
              <h2 className="text-[18px] font-bold text-[#1d1d1f]">{client.name}</h2>
              <div className="text-[#7a7a7a] text-[14px] leading-relaxed whitespace-pre-wrap">
                {client.address && <p>{client.address}</p>}
                {client.email && <p className="mt-1">{client.email}</p>}
              </div>
            </div>
            <div className="md:text-right hidden md:block">
              {/* Status Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-tighter border ${statusBadgeStyles[invoice.status] || statusBadgeStyles.draft}`}>
                  {statusText[invoice.status] || 'DRAFT'}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-10 md:px-16 py-6 print:px-8 print:py-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e0e0e0]">
                  <th className="py-3 text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider">Deskripsi</th>
                  <th className="py-3 text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider text-right">Kuantitas</th>
                  <th className="py-3 text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider text-right">Harga Satuan</th>
                  <th className="py-3 text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {items.map((item: InvoiceItem) => (
                  <tr key={item.id} className="group hover:bg-[#fafafa] transition-colors">
                    <td className="py-6 pr-4 align-top">
                      <span className="block font-semibold text-[15px] whitespace-pre-wrap">{item.description}</span>
                    </td>
                    <td className="py-6 text-right font-medium align-top">{item.quantity}</td>
                    <td className="py-6 text-right font-medium align-top">{formatCurrency(item.unit_price, invoice.currency)}</td>
                    <td className="py-6 text-right font-bold align-top">{formatCurrency(item.quantity * item.unit_price, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary & Payment Details Section */}
          <div className="p-10 md:p-16 print:p-8 flex flex-col md:flex-row gap-12 border-t border-[#f5f5f7]">
            {/* Left: Bank & Notes */}
            <div className="flex-1 flex flex-col gap-6">
              {displayBankInfo && (
                <div className="bg-[#f5f5f7] p-5 rounded-xl border border-[#e0e0e0]/30">
                  <span className="block text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider mb-3">Informasi Pembayaran</span>
                  <div className="text-[14px] flex flex-col gap-1 whitespace-pre-wrap leading-relaxed font-medium">
                    {displayBankInfo}
                  </div>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <span className="block text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider mb-2">Catatan Tambahan</span>
                  <p className="text-[13px] text-[#7a7a7a] leading-relaxed whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Totals */}
            <div className="w-full md:w-72 flex flex-col gap-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#7a7a7a]">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal, invoice.currency)}</span>
              </div>
              {invoice.tax_percent > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#7a7a7a]">Pajak ({invoice.tax_percent}%)</span>
                  <span className="font-medium">{formatCurrency(taxAmount, invoice.currency)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-[14px] text-red-600">
                  <span>Diskon</span>
                  <span className="font-medium">-{formatCurrency(discountAmount, invoice.currency)}</span>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t-[3px] border-[#1d1d1f]">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] font-bold text-[#7a7a7a] uppercase tracking-widest">Total Tagihan</span>
                  <span className="text-[32px] font-black text-[#1d1d1f] tracking-tighter">
                    {formatCurrency(total, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="py-8 border-t border-[#f5f5f7] text-center">
            <p className="text-[12px] text-[#7a7a7a] font-medium">
              Dibuat secara otomatis menggunakan <span className="text-[#1d1d1f] font-bold">Invoku</span>
            </p>
          </div>
        </div>

        {/* System Footer (Web View Only) */}
        <footer className="mt-12 text-center no-print print:hidden">
          <p className="text-[#1d1d1f] font-semibold text-sm mb-4 tracking-tight">Butuh bantuan?</p>
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center">
            <a href={`mailto:${profile.email}`} className="text-[#7a7a7a] hover:text-primary-container text-sm transition-colors flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-(--theme-color)"></span>
              Kirim Email
            </a>
            <a href="#" className="text-[#7a7a7a] hover:text-primary-container text-sm transition-colors flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-(--theme-color)"></span>
              Pusat Bantuan
            </a>
          </div>
          <p className="mt-8 text-[11px] text-[#7a7a7a] uppercase tracking-widest font-semibold">
            © 2026 Invoku SaaS. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  )
}
