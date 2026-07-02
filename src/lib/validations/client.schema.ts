import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'Nama klien wajib diisi'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  preferred_currency: z.string().optional().or(z.literal('')),
})

export type ClientInput = z.infer<typeof clientSchema>
