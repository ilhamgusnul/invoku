'use server'

import { cookies } from 'next/headers'

const COOKIE_NAME = 'active_business_profile_id'

export async function setActiveBusinessProfile(id: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  })
}

export async function getActiveBusinessProfile(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  return cookie?.value || null
}
