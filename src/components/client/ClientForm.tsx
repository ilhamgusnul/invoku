'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientInput } from '@/lib/validations/client.schema'
import { createClient, updateClient } from '@/lib/actions/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  initialData?: any
}

export function ClientForm({ initialData }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      preferred_currency: initialData?.preferred_currency || '',
    }
  })

  const onSubmit = async (data: ClientInput) => {
    setIsPending(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email || '')
    formData.append('address', data.address || '')
    formData.append('preferred_currency', data.preferred_currency || '')
    
    let result
    if (initialData?.id) {
      result = await updateClient(initialData.id, formData)
    } else {
      result = await createClient(formData)
    }
    
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-none border-[#e0e0e0]">
      <CardHeader>
        <CardTitle className="text-[24px] font-semibold text-[#1d1d1f] tracking-tight">
          {initialData ? 'Edit Klien' : 'Tambah Klien Baru'}
        </CardTitle>
        <CardDescription className="text-[15px] text-[#7a7a7a]">
          Informasi klien akan digunakan untuk mengisi tujuan tagihan secara otomatis.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[14px]">Nama Klien/Perusahaan <span className="text-red-500">*</span></Label>
              <Input id="name" placeholder="Misal: PT Karya Bangsa" className="rounded-md px-3" {...register('name')} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[14px]">Email Kontak (Opsional)</Label>
              <Input id="email" type="email" placeholder="kontak@perusahaan.com" className="rounded-md px-3" {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-[14px]">Alamat Penagihan (Opsional)</Label>
            <Textarea id="address" placeholder="Alamat lengkap, Kota, Kodepos" className="rounded-md px-3 resize-none h-24" {...register('address')} />
            {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_currency" className="text-[14px]">Mata Uang Khusus Klien (Opsional)</Label>
            <Select defaultValue={watch('preferred_currency') || undefined} onValueChange={(v) => { if (v && v !== 'none') setValue('preferred_currency', v) }}>
              <SelectTrigger className="rounded-md md:w-1/2">
                <SelectValue placeholder="Gunakan default profil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Gunakan default profil</SelectItem>
                <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[#7a7a7a]">Jika tidak dipilih, akan menggunakan mata uang default dari profil bisnis aktif Anda.</p>
            {errors.preferred_currency && <p className="text-red-500 text-xs">{errors.preferred_currency.message}</p>}
          </div>
          
        </CardContent>
        <CardFooter className="flex justify-end border-t border-[#e0e0e0] pt-6">
          <Button type="submit" className="rounded-full px-8 bg-[#0066cc] text-white hover:bg-[#0071e3]" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan Klien'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
