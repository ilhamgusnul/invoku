import { z } from 'zod'

export const invoiceItemSchema = z.object({
  id: z.string().optional(), // For existing items
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  quantity: z.coerce.number().int('Kuantitas harus berupa bilangan bulat').min(0, 'Kuantitas tidak boleh negatif'),
  unit_price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  sort_order: z.coerce.number().default(0),
})

export const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Pilih klien terlebih dahulu'),
  invoice_number: z.string().min(1, 'Nomor invoice wajib diisi'),
  issue_date: z.string().min(1, 'Tanggal invoice wajib diisi'),
  due_date: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
  currency: z.string().min(1, 'Mata uang wajib diisi'),
  tax_percent: z.coerce.number().min(0).max(100).optional().or(z.literal(0)),
  discount_type: z.enum(['flat', 'percent', 'none']).optional().default('none'),
  discount_value: z.coerce.number().min(0).optional().or(z.literal(0)),
  notes: z.string().optional().or(z.literal('')),
  bank_info: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'sent', 'paid']).default('draft'),
  items: z.array(invoiceItemSchema).min(1, 'Minimal satu item tagihan ditambahkan'),
})

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>
export type InvoiceInput = z.infer<typeof invoiceSchema>
