import { createClient } from '@/lib/supabase/server'
import { AccountProfileForm } from '@/components/settings/AccountProfileForm'

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">Akun Pengguna</h2>
        <p className="text-sm text-[#7a7a7a] mt-1">
          Ubah informasi profil dan keamanan akun Anda.
        </p>
      </div>

      {user && (
        <AccountProfileForm 
          user={{
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || ''
          }} 
        />
      )}
    </div>
  )
}
