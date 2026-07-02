import { z } from 'zod'

export const businessProfileSchema = z.object({
  name: z.string().min(1, 'Nama usaha wajib diisi'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  default_currency: z.string().min(1, 'Mata uang wajib dipilih'),
  invoice_prefix: z.string().min(1, 'Prefix invoice wajib diisi').max(10, 'Prefix maksimal 10 karakter'),
  bank_info: z.string().optional().or(z.literal('')),
  logo_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
  theme_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Format warna HEX tidak valid').default('#0066cc'),
})

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>
export type BusinessProfileFormInput = z.input<typeof businessProfileSchema>
