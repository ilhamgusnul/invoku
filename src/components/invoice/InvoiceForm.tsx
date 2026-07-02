'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoiceSchema, type InvoiceInput } from '@/lib/validations/invoice.schema'
import { createInvoice, updateInvoice } from '@/lib/actions/invoice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  email: string | null
  address: string | null
  preferred_currency: string | null
}

interface Profile {
  invoice_prefix: string
  default_currency: string
  next_invoice_number: number
  bank_info?: string | null
}

interface Props {
  initialData?: any
  clients: Client[]
  profile: Profile
}

export function InvoiceForm({ initialData, clients, profile }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  
  const today = new Date().toISOString().split('T')[0]
  
  const defaultInvoiceNumber = initialData?.invoice_number || `${profile.invoice_prefix}-${String(profile.next_invoice_number).padStart(4, '0')}`

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      client_id: initialData?.client_id || '',
      invoice_number: defaultInvoiceNumber,
      issue_date: initialData?.issue_date || today,
      due_date: initialData?.due_date || today,
      currency: initialData?.currency || profile.default_currency,
      tax_percent: initialData?.tax_percent || 0,
      discount_type: initialData?.discount_type || 'none',
      discount_value: initialData?.discount_value || 0,
      notes: initialData?.notes || '',
      bank_info: initialData?.bank_info || profile.bank_info || '',
      status: initialData?.status || 'draft',
      items: initialData?.invoice_items?.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        sort_order: item.sort_order,
      })) || [
        { description: '', quantity: 1, unit_price: 0, sort_order: 0 }
      ],
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  // Watch values for calculation
  const items = watch('items')
  const taxPercent = watch('tax_percent') || 0
  const discountType = watch('discount_type')
  const discountValue = watch('discount_value') || 0
  const clientId = watch('client_id')

  // Auto-update currency if client has preferred currency
  useEffect(() => {
    if (clientId && !initialData) {
      const selectedClient = clients.find(c => c.id === clientId)
      if (selectedClient && selectedClient.preferred_currency) {
        setValue('currency', selectedClient.preferred_currency)
      } else {
        setValue('currency', profile.default_currency)
      }
    }
  }, [clientId, clients, profile, setValue, initialData])

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)), 0)
  
  let discountAmount = 0
  if (discountType === 'flat') {
    discountAmount = Number(discountValue)
  } else if (discountType === 'percent') {
    discountAmount = subtotal * (Number(discountValue) / 100)
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const taxAmount = afterDiscount * (Number(taxPercent) / 100)
  const grandTotal = afterDiscount + taxAmount

  const onSubmit = async (data: InvoiceInput) => {
    setIsPending(true)
    setError(null)
    
    let result
    if (initialData?.id) {
      result = await updateInvoice(initialData.id, data)
    } else {
      result = await createInvoice(data)
    }
    
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      router.push('/invoices')
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
          {initialData ? 'Edit Invoice' : 'Buat Invoice Baru'}
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full" onClick={() => router.push('/invoices')}>Batal</Button>
          <Button 
            onClick={handleSubmit((data) => onSubmit({...data, status: 'draft'}))}
            variant="secondary" 
            className="rounded-full" 
            disabled={isPending}
          >
            Simpan Draft
          </Button>
          <Button 
            onClick={handleSubmit((data) => onSubmit({...data, status: 'sent'}))}
            className="rounded-full bg-[#0066cc] hover:bg-[#0071e3]" 
            disabled={isPending}
          >
            Simpan & Kirim
          </Button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Utama */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-none border-[#e0e0e0]">
            <CardHeader>
              <CardTitle className="text-lg">Detail Umum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Klien <span className="text-red-500">*</span></Label>
                  <Select
                    defaultValue={initialData?.client_id || undefined}
                    onValueChange={(v: string) => setValue('client_id', v)}
                    items={clients.map(c => ({ value: c.id, label: c.name }))}
                  >
                    <SelectTrigger className="rounded-md">
                      <SelectValue placeholder="Pilih klien" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && <p className="text-red-500 text-xs">{errors.client_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Nomor Invoice <span className="text-red-500">*</span></Label>
                  <Input {...register('invoice_number')} className="rounded-md font-mono" />
                  {errors.invoice_number && <p className="text-red-500 text-xs">{errors.invoice_number.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Keluar <span className="text-red-500">*</span></Label>
                  <Input type="date" {...register('issue_date')} className="rounded-md" />
                  {errors.issue_date && <p className="text-red-500 text-xs">{errors.issue_date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Jatuh Tempo <span className="text-red-500">*</span></Label>
                  <Input type="date" {...register('due_date')} className="rounded-md" />
                  {errors.due_date && <p className="text-red-500 text-xs">{errors.due_date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Mata Uang <span className="text-red-500">*</span></Label>
                  <Select
                    defaultValue={initialData?.currency || profile.default_currency}
                    onValueChange={(v: string) => setValue('currency', v)}
                  >
                    <SelectTrigger className="rounded-md">
                      <SelectValue placeholder="Mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="SGD">SGD</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.currency && <p className="text-red-500 text-xs">{errors.currency.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-[#e0e0e0]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Item Tagihan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-semibold text-[#7a7a7a] mb-2 px-1">
                <div className="col-span-6">Deskripsi</div>
                <div className="col-span-2 text-right">Kuantitas</div>
                <div className="col-span-3 text-right">Harga Satuan</div>
                <div className="col-span-1"></div>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start border-b border-[#e0e0e0] md:border-none pb-4 md:pb-0 mb-4 md:mb-0">
                  <div className="md:col-span-6">
                    <Label className="md:hidden text-xs mb-1 block">Deskripsi</Label>
                    <Textarea 
                      {...register(`items.${index}.description` as const)} 
                      placeholder="Jasa desain website..."
                      className="resize-none h-10 min-h-[40px]"
                    />
                    {errors?.items?.[index]?.description && <p className="text-red-500 text-xs mt-1">{errors.items[index]?.description?.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="md:hidden text-xs mb-1 block">Kuantitas</Label>
                    <Input 
                      type="number" step="1" 
                      {...register(`items.${index}.quantity` as const)} 
                      className="text-right"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label className="md:hidden text-xs mb-1 block">Harga</Label>
                    <Input 
                      type="number" step="0.01" 
                      {...register(`items.${index}.unit_price` as const)} 
                      className="text-right"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end md:justify-center items-center mt-6 md:mt-0">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-2 text-[#0066cc] border-[#0066cc]/20 hover:bg-[#0066cc]/5"
                onClick={() => append({ description: '', quantity: 1, unit_price: 0, sort_order: fields.length })}
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Tambah Baris
              </Button>
              {errors.items && !Array.isArray(errors.items) && <p className="text-red-500 text-xs">{errors.items.message}</p>}
            </CardContent>
          </Card>
          
          <Card className="shadow-none border-[#e0e0e0]">
            <CardHeader>
              <CardTitle className="text-lg">Catatan & Informasi Bank</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Informasi Rekening Bank</Label>
                <Textarea 
                  {...register('bank_info')} 
                  placeholder="Misal: BCA 123456789 a/n PT Kaizen Digilabs"
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan Tambahan</Label>
              <Textarea 
                {...register('notes')} 
                placeholder="Terima kasih atas kerja samanya. Pembayaran dapat ditransfer ke BCA 123456789 a.n PT Invoku..."
                className="min-h-[100px]"
              />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Ringkasan Kalkulasi */}
        <div className="space-y-6">
          <Card className="shadow-none border-[#e0e0e0] bg-[#fafafa]">
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#7a7a7a]">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-[#e0e0e0]">
                <Label className="text-xs text-[#7a7a7a]">Diskon</Label>
                <div className="flex gap-2">
                  <Select
                    defaultValue={initialData?.discount_type || 'none'}
                    onValueChange={(v: string) => setValue('discount_type', v as any)}
                  >
                    <SelectTrigger className="w-[100px] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada</SelectItem>
                      <SelectItem value="percent">% Persen</SelectItem>
                      <SelectItem value="flat">Nominal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" step="0.01" 
                    {...register('discount_value')} 
                    className="bg-white"
                    disabled={watch('discount_type') === 'none'}
                  />
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-end text-[13px] text-green-600 font-medium">
                    - {formatCurrency(discountAmount)}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-[#e0e0e0]">
                <Label className="text-xs text-[#7a7a7a]">Pajak (%)</Label>
                <Input type="number" step="0.01" {...register('tax_percent')} className="bg-white" />
                {taxAmount > 0 && (
                  <div className="flex justify-end text-[13px] text-[#7a7a7a]">
                    + {formatCurrency(taxAmount)}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#e0e0e0] flex justify-between items-end">
                <span className="font-semibold text-[#1d1d1f]">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#0066cc] tracking-tight">{formatCurrency(grandTotal)}</div>
                  <div className="text-xs font-medium text-[#7a7a7a] mt-1">{watch('currency')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
