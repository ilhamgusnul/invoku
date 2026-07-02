'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { convertToWebP } from '@/lib/utils/image'
import { User } from 'lucide-react'
import Image from 'next/image'

interface Props {
  user: {
    email: string
    full_name: string
    avatar_url: string
  }
}

export function AccountProfileForm({ user }: Props) {
  const [fullName, setFullName] = useState(user.full_name)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url)
  const [password, setPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran foto maksimal 5MB sebelum kompresi')
        return
      }
      try {
        setIsPending(true)
        const webpBlob = await convertToWebP(file, 500)
        const webpFile = new File([webpBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' })
        
        const supabase = createClient()
        const fileExt = 'webp'
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, webpFile)

        if (uploadError) {
          throw new Error(uploadError.message)
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
          
        setAvatarUrl(publicUrlData.publicUrl)
        setError(null)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memproses gambar')
      } finally {
        setIsPending(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()
    const updates: { data: { full_name: string; avatar_url: string | null }; password?: string } = {
      data: {
        full_name: fullName,
        avatar_url: avatarUrl,
      }
    }

    if (password) {
      if (password.length < 6) {
        setError('Password minimal 6 karakter')
        setIsPending(false)
        return
      }
      updates.password = password
    }

    const { error: updateError } = await supabase.auth.updateUser(updates)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Profil berhasil diperbarui')
      setPassword('')
    }
    
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="relative w-24 h-24 rounded-full bg-blue-50 border-2 border-[#e0e0e0] flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <User className="w-10 h-10 text-blue-200" />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar_upload" className="cursor-pointer">
            <div className="bg-white border border-[#e0e0e0] hover:bg-[#f5f5f7] text-[#1d1d1f] px-4 py-2 rounded-xl text-sm font-medium transition-colors inline-block">
              Ubah Foto Profil
            </div>
          </Label>
          <Input 
            id="avatar_upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleAvatarChange}
            disabled={isPending}
          />
          <p className="text-xs text-[#7a7a7a]">
            Format JPG, PNG, atau WebP. Maks 5MB. Akan di-compress otomatis.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            value={user.email} 
            disabled 
            className="rounded-xl border-[#e0e0e0] bg-[#f5f5f7] text-[#7a7a7a] cursor-not-allowed" 
          />
          <p className="text-xs text-[#7a7a7a]">Email tidak dapat diubah.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Nama Lengkap</Label>
          <Input 
            id="full_name" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl border-[#e0e0e0] focus-visible:ring-primary-container" 
            placeholder="John Doe"
            disabled={isPending}
          />
        </div>

        <div className="pt-4 border-t border-[#e0e0e0]">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Ganti Password</h3>
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru (Opsional)</Label>
            <Input 
              id="password" 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-[#e0e0e0] focus-visible:ring-primary-container" 
              placeholder="Kosongkan jika tidak ingin mengubah"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-primary-container hover:bg-primary text-white rounded-xl px-8"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  )
}
