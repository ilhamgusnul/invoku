import { getBusinessProfiles } from '@/lib/actions/business-profile'
import { BusinessProfileList } from '@/components/business-profile/BusinessProfileList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function BusinessProfilesPage() {
  const profiles = await getBusinessProfiles()
  
  // Ambil batasan maksimal dari env, default 3
  const maxProfiles = Number(process.env.MAX_BUSINESS_PROFILES_PER_USER) || 3
  const canCreate = profiles.length < maxProfiles

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">Profil Bisnis</h2>
          <p className="text-sm text-[#7a7a7a] mt-1">
            Kelola profil bisnis yang akan muncul di invoice Anda. ({profiles.length}/{maxProfiles})
          </p>
        </div>
        {canCreate && (
          <Link href="/settings/business-profiles/new">
            <Button className="rounded-full bg-primary-container hover:bg-primary px-6">
              Buat Profil Baru
            </Button>
          </Link>
        )}
      </div>

      <BusinessProfileList profiles={profiles} />
    </div>
  )
}
