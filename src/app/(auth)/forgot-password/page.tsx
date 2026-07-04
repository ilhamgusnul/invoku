'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth.schema'
import { forgotPasswordAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isPending, setIsPending] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsPending(true)
    setError(null)
    const formData = new FormData()
    formData.append('email', data.email)
    
    const result = await forgotPasswordAction(formData)
    if (result?.error) {
      setError(result.error)
      setSuccess(false)
    } else {
      setSuccess(true)
    }
    setIsPending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <Card className="w-full max-w-md mx-auto shadow-none border-[#e0e0e0]">
        <CardHeader>
          <CardTitle className="text-[34px] font-semibold text-[#1d1d1f] tracking-tight">Lupa Password</CardTitle>
          <CardDescription className="text-[17px] text-[#7a7a7a]">
            Masukkan email Anda untuk menerima link pemulihan password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
                Email pemulihan telah dikirim. Silakan periksa inbox Anda.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[14px]">Email</Label>
              <Input id="email" type="email" placeholder="nama@email.com" className="rounded-full px-4" {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full rounded-full bg-primary-container text-white hover:opacity-90" disabled={isPending || success}>
              {isPending ? 'Mengirim...' : 'Kirim Link Pemulihan'}
            </Button>
            <div className="text-[14px] text-center text-[#7a7a7a]">
              Kembali ke <Link href="/login" className="text-[#0066cc] hover:underline">Masuk</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
