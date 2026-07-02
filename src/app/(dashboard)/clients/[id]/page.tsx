import { getClient } from '@/lib/actions/client'
import { ClientForm } from '@/components/client/ClientForm'
import { notFound } from 'next/navigation'

export default async function EditClientPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const client = await getClient(id)
  
  if (!client) {
    notFound()
  }

  return (
    <div className="w-full">
      <ClientForm initialData={client} />
    </div>
  )
}
