import { getBusinessProfile } from '@/lib/actions/business-profile'
import { BusinessProfileForm } from '@/components/business-profile/BusinessProfileForm'
import { notFound } from 'next/navigation'

export default async function EditBusinessProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const profile = await getBusinessProfile(id)
  
  if (!profile) {
    notFound()
  }

  return (
    <div className="w-full">
      <BusinessProfileForm initialData={profile} />
    </div>
  )
}
