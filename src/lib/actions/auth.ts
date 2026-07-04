'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth.schema'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = loginSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/dashboard')
}

export async function signupAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = signupSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { success: false, error: 'Email wajib diisi' }

  const supabase = await createClient()
  
  // We need to pass the base URL for the callback
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter' }
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'Password tidak cocok' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/login?message=Password berhasil diubah')
}
