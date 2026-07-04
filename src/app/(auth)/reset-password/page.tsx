'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth.schema'
import { resetPasswordAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema)
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsPending(true)
    setError(null)
    const formData = new FormData()
    formData.append('password', data.password)
    formData.append('confirmPassword', data.confirmPassword)
    
    const result = await resetPasswordAction(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <Card className="w-full max-w-md mx-auto shadow-none border-[#e0e0e0]">
        <CardHeader>
          <CardTitle className="text-[34px] font-semibold text-[#1d1d1f] tracking-tight">Buat Password Baru</CardTitle>
          <CardDescription className="text-[17px] text-[#7a7a7a]">
            Silakan masukkan kata sandi baru untuk akun Anda.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[14px]">Password Baru</Label>
              <Input id="password" type="password" className="rounded-full px-4" {...register('password')} />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[14px]">Konfirmasi Password Baru</Label>
              <Input id="confirmPassword" type="password" className="rounded-full px-4" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full rounded-full bg-primary-container text-white hover:opacity-90" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
