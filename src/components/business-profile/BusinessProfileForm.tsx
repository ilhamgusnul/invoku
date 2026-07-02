'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessProfileSchema, type BusinessProfileInput, type BusinessProfileFormInput } from '@/lib/validations/business-profile.schema'
import { createBusinessProfile, updateBusinessProfile } from '@/lib/actions/business-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { convertToWebP } from '@/lib/utils/image'
import Image from 'next/image'

interface Props {
  initialData?: BusinessProfileInput & { id?: string; logo_url?: string }
}

export function BusinessProfileForm({ initialData }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo_url || null)
  
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<BusinessProfileFormInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      default_currency: initialData?.default_currency || 'IDR',
      invoice_prefix: initialData?.invoice_prefix || 'INV',
      bank_info: initialData?.bank_info || '',
      theme_color: initialData?.theme_color || '#0066cc',
    }
  })

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran logo maksimal 5MB sebelum kompresi')
        return
      }
      try {
        setIsPending(true)
        const webpBlob = await convertToWebP(file, 500)
        // Create a new File from the blob to upload
        const webpFile = new File([webpBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' })
        setLogoFile(webpFile)
        setLogoPreview(URL.createObjectURL(webpFile))
        setError(null)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memproses gambar')
      } finally {
        setIsPending(false)
      }
    }
  }

  const onSubmit = async (data: BusinessProfileFormInput) => {
    setIsPending(true)
    setError(null)
    
    let uploadedLogoUrl = initialData?.logo_url || null

    if (logoFile) {
      const supabase = createClient()
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile)

      if (uploadError) {
        setError(`Gagal upload logo: ${uploadError.message}`)
        setIsPending(false)
        return
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)
        
      uploadedLogoUrl = publicUrlData.publicUrl
    }

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email || '')
    formData.append('address', data.address || '')
    formData.append('default_currency', data.default_currency)
    formData.append('invoice_prefix', data.invoice_prefix)
    formData.append('bank_info', data.bank_info || '')
    formData.append('theme_color', data.theme_color || '#0066cc')
    
    let result
    if (initialData?.id) {
      result = await updateBusinessProfile(initialData.id, formData, uploadedLogoUrl)
    } else {
      result = await createBusinessProfile(formData, uploadedLogoUrl)
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
          {initialData ? 'Edit Profil Bisnis' : 'Buat Profil Bisnis'}
        </CardTitle>
        <CardDescription className="text-[15px] text-[#7a7a7a]">
          Isi informasi dasar bisnis Anda yang akan tampil di invoice.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md">{error}</div>}
          
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-[14px]">Logo Bisnis (Opsional)</Label>
            <div className="flex items-center space-x-4">
              {logoPreview ? (
                <div className="relative w-16 h-16 rounded-md overflow-hidden border border-[#e0e0e0]">
                  <Image src={logoPreview} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-md bg-[#f5f5f7] flex items-center justify-center border border-[#e0e0e0] text-[#7a7a7a] text-xs">
                  No Logo
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleLogoChange} className="max-w-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[14px]">Nama Usaha <span className="text-red-500">*</span></Label>
              <Input id="name" placeholder="Misal: Kaizen Digilabs" className="rounded-md px-3" {...register('name')} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[14px]">Email Kontak</Label>
              <Input id="email" type="email" placeholder="kontak@usaha.com" className="rounded-md px-3" {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-[14px]">Alamat Lengkap</Label>
            <Textarea id="address" placeholder="Jalan, Kota, Kode Pos" className="rounded-md px-3 resize-none h-24" {...register('address')} />
            {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_info" className="text-[14px]">Informasi Rekening Bank</Label>
            <Textarea id="bank_info" placeholder="BCA 123456789 a/n PT Kaizen Digilabs" className="rounded-md px-3 resize-none h-24" {...register('bank_info')} />
            {errors.bank_info && <p className="text-red-500 text-xs">{errors.bank_info.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_currency" className="text-[14px]">Mata Uang Default <span className="text-red-500">*</span></Label>
              <Select defaultValue={getValues('default_currency')} onValueChange={(v) => { if (v) setValue('default_currency', v) }}>
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="Pilih mata uang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                </SelectContent>
              </Select>
              {errors.default_currency && <p className="text-red-500 text-xs">{errors.default_currency.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_prefix">Prefix Invoice <span className="text-red-500">*</span></Label>
                <Input id="invoice_prefix" placeholder="INV" {...register('invoice_prefix')} className="rounded-xl border-[#e0e0e0] focus-visible:ring-primary-container" />
                {errors.invoice_prefix && <p className="text-red-500 text-xs">{errors.invoice_prefix.message}</p>}
                <p className="text-xs text-[#7a7a7a]">Misal: INV-2023-001</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme_color">Warna Tema (Untuk Halaman Publik)</Label>
                <div className="flex gap-3 items-center">
                  <Input 
                    type="color" 
                    id="theme_color" 
                    {...register('theme_color')} 
                    className="w-12 h-12 p-1 rounded-xl cursor-pointer border-[#e0e0e0]" 
                  />
                  <Input 
                    type="text" 
                    placeholder="#0066cc" 
                    {...register('theme_color')} 
                    className="rounded-xl border-[#e0e0e0] focus-visible:ring-primary-container flex-1 font-mono uppercase" 
                  />
                </div>
                {errors.theme_color && <p className="text-red-500 text-xs">{errors.theme_color.message}</p>}
              </div>
            </div>
          </div>
          
        </CardContent>
        <CardFooter className="flex justify-end border-t border-[#e0e0e0] pt-6">
          <Button type="submit" className="rounded-full px-8 bg-primary-container text-white hover:bg-primary" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
