'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupInput } from '@/lib/validations/auth.schema'
import { signupAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (data: SignupInput) => {
    setIsPending(true)
    setError(null)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    
    const result = await signupAction(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-20 shadow-none border-[#e0e0e0]">
      <CardHeader>
        <CardTitle className="text-[34px] font-semibold text-[#1d1d1f] tracking-tight">Daftar Invoku</CardTitle>
        <CardDescription className="text-[17px] text-[#7a7a7a]">Buat akun baru secara gratis.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[14px]">Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com" className="rounded-full px-4" {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[14px]">Password</Label>
            <Input id="password" type="password" className="rounded-full px-4" {...register('password')} />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3]" disabled={isPending}>
            {isPending ? 'Memproses...' : 'Daftar'}
          </Button>
          <div className="text-[14px] text-center text-[#7a7a7a]">
            Sudah punya akun? <Link href="/login" className="text-[#0066cc] hover:underline">Masuk</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
